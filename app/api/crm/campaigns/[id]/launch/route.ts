import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { adminKey } = body;
    
    if (!adminKey || adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const campaignId = params.id;

    // Get campaign details
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        sequences: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Campaign cannot be launched in current status' }, { status: 400 });
    }

    // Get target users based on campaign criteria
    const targetUsers = await getTargetUsers(campaign.targetType, campaign.targetCriteria);

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'No target users found' }, { status: 400 });
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'RUNNING',
        totalTargets: targetUsers.length
      }
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send emails to all target users
    for (const user of targetUsers) {
      try {
        // Check if user already received this campaign
        const existingLog = await prisma.emailCampaignLog.findUnique({
          where: {
            campaignId_userId: {
              campaignId: campaignId,
              userId: user.id
            }
          }
        });

        if (existingLog) {
          continue; // Skip if already sent
        }

        // Parse email template and replace variables
        const emailTemplate = JSON.parse(campaign.emailTemplate);
        const personalizedContent = await personalizeEmailContent(emailTemplate, user);

        // Send email via Resend
        const emailData = {
          from: 'Talkers <noreply@talkers.pro>',
          to: [user.email],
          subject: await personalizeSubject(campaign.subject, user),
          html: personalizedContent.html,
          text: personalizedContent.text || ''
        };

        const result = await resend.emails.send(emailData);

        if (result.error) {
          // Log failed send
          await prisma.emailCampaignLog.create({
            data: {
              campaignId: campaignId,
              userId: user.id,
              email: user.email,
              status: 'FAILED',
              errorMessage: result.error.message || 'Unknown error',
              metadata: { error: result.error }
            }
          });
          failedCount++;
        } else {
          // Log successful send
          await prisma.emailCampaignLog.create({
            data: {
              campaignId: campaignId,
              userId: user.id,
              email: user.email,
              status: 'SENT',
              sentAt: new Date(),
              resendId: result.data?.id,
              metadata: { resendData: result.data }
            }
          });
          sentCount++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        
        await prisma.emailCampaignLog.create({
          data: {
            campaignId: campaignId,
            userId: user.id,
            email: user.email,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        failedCount++;
      }
    }

    // Schedule sequences if any
    if (campaign.sequences.length > 0) {
      await scheduleEmailSequences(campaignId, targetUsers);
    }

    // Update campaign with final stats
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        totalSent: sentCount,
        totalFailed: failedCount
      }
    });

    return NextResponse.json({
      message: 'Campaign launched successfully',
      results: {
        totalTargets: targetUsers.length,
        sent: sentCount,
        failed: failedCount
      }
    });

  } catch (error) {
    console.error('Error launching campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getTargetUsers(targetType: string, targetCriteria: string | null) {
  let where: any = {
    emailVerified: { not: null }
  };

  switch (targetType) {
    case 'VERIFIED_USERS':
      // Already included in base where
      break;
    case 'TRIAL_USERS':
      where.isTrialActive = true;
      break;
    case 'PREMIUM_USERS':
      where.subscriptionStatus = 'premium';
      break;
    case 'INACTIVE_USERS':
      where.lastTokenReset = {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };
      break;
    case 'CUSTOM_CRITERIA':
      if (targetCriteria) {
        const criteria = JSON.parse(targetCriteria);
        where = { ...where, ...criteria };
      }
      break;
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      subscriptionStatus: true,
      isTrialActive: true
    }
  });
}

async function personalizeEmailContent(template: any, user: any) {
  const variables = {
    userName: user.name || 'there',
    userEmail: user.email,
    accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    subscriptionStatus: user.subscriptionStatus,
    baseUrl: process.env.NEXTAUTH_URL || 'https://talkers.pro'
  };

  let html = template.html || '';
  let text = template.text || '';

  // Replace variables in content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
    text = text.replace(regex, String(value));
  }

  return { html, text };
}

async function personalizeSubject(subject: string, user: any) {
  const variables = {
    userName: user.name || 'there',
    userEmail: user.email
  };

  let personalizedSubject = subject;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    personalizedSubject = personalizedSubject.replace(regex, String(value));
  }

  return personalizedSubject;
}

async function scheduleEmailSequences(campaignId: string, users: any[]) {
  const sequences = await prisma.emailSequence.findMany({
    where: {
      campaignId: campaignId,
      isActive: true
    },
    orderBy: { order: 'asc' }
  });

  for (const user of users) {
    let baseDate = new Date();

    for (const sequence of sequences) {
      const scheduledFor = new Date(baseDate);
      scheduledFor.setDate(scheduledFor.getDate() + sequence.delayDays);
      scheduledFor.setHours(scheduledFor.getHours() + sequence.delayHours);

      await prisma.emailSequenceLog.create({
        data: {
          sequenceId: sequence.id,
          userId: user.id,
          email: user.email,
          status: 'PENDING',
          scheduledFor: scheduledFor
        }
      });

      baseDate = scheduledFor; // Next sequence builds on this one
    }
  }
} 
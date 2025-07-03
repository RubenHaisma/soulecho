import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check for automation key to secure this endpoint
    const body = await request.json();
    const { automationKey } = body;

    if (automationKey !== process.env.AUTOMATION_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let processedCount = 0;
    let errorCount = 0;

    // Get all pending sequence emails that are scheduled for now or past
    const pendingSequences = await prisma.emailSequenceLog.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        sequence: {
          include: {
            campaign: true
          }
        }
      },
      take: 100 // Process in batches
    });

    console.log(`Found ${pendingSequences.length} pending sequence emails to process`);

    for (const sequenceLog of pendingSequences) {
      try {
        // Get user details
        const user = await prisma.user.findUnique({
          where: { id: sequenceLog.userId },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            subscriptionStatus: true,
            isTrialActive: true
          }
        });

        if (!user) {
          console.log(`User ${sequenceLog.userId} not found, skipping sequence ${sequenceLog.id}`);
          continue;
        }

        // Check if user hasn't unsubscribed or been marked as bounced
        const recentFailures = await prisma.emailCampaignLog.count({
          where: {
            userId: user.id,
            status: {
              in: ['BOUNCED', 'UNSUBSCRIBED']
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        });

        if (recentFailures > 0) {
          console.log(`User ${user.email} has recent failures, skipping sequence email`);
          await prisma.emailSequenceLog.update({
            where: { id: sequenceLog.id },
            data: {
              status: 'FAILED',
              errorMessage: 'User has recent bounces or unsubscribed'
            }
          });
          errorCount++;
          continue;
        }

        // Parse sequence template and personalize
        const emailTemplate = JSON.parse(sequenceLog.sequence.emailTemplate);
        const personalizedContent = await personalizeEmailContent(emailTemplate, user);
        const personalizedSubject = await personalizeSubject(sequenceLog.sequence.subject, user);

        // Send email via Resend
        const emailData = {
          from: 'Talkers <noreply@talkers.pro>',
          to: [user.email],
          subject: personalizedSubject,
          html: personalizedContent.html,
          text: personalizedContent.text || ''
        };

        const result = await resend.emails.send(emailData);

        if (result.error) {
          console.error(`Failed to send sequence email to ${user.email}:`, result.error);
          
          await prisma.emailSequenceLog.update({
            where: { id: sequenceLog.id },
            data: {
              status: 'FAILED',
              errorMessage: result.error.message || 'Unknown error',
              metadata: { error: result.error }
            }
          });
          errorCount++;
        } else {
          console.log(`Successfully sent sequence email to ${user.email}`);
          
          await prisma.emailSequenceLog.update({
            where: { id: sequenceLog.id },
            data: {
              status: 'SENT',
              sentAt: now,
              resendId: result.data?.id,
              metadata: { resendData: result.data }
            }
          });
          processedCount++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing sequence ${sequenceLog.id}:`, error);
        
        await prisma.emailSequenceLog.update({
          where: { id: sequenceLog.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        errorCount++;
      }
    }

    // Schedule next sequences for users who just received an email
    await scheduleNextSequences();

    return NextResponse.json({
      message: 'Sequence processing completed',
      results: {
        processed: processedCount,
        errors: errorCount,
        total: pendingSequences.length
      }
    });

  } catch (error) {
    console.error('Error in sequence automation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function personalizeEmailContent(template: any, user: any) {
  const variables = {
    userName: user.name || 'there',
    userEmail: user.email,
    accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    subscriptionStatus: user.subscriptionStatus,
    baseUrl: process.env.NEXTAUTH_URL || 'https://talkers.pro',
    brandName: 'Talkers',
    supportEmail: 'support@talkers.pro'
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
    userEmail: user.email,
    brandName: 'Talkers'
  };

  let personalizedSubject = subject;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    personalizedSubject = personalizedSubject.replace(regex, String(value));
  }

  return personalizedSubject;
}

async function scheduleNextSequences() {
  try {
    // Find campaigns with sequences that have active users who just completed a sequence
    const completedSequences = await prisma.emailSequenceLog.findMany({
      where: {
        status: 'SENT',
        sentAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      include: {
        sequence: {
          include: {
            campaign: {
              include: {
                sequences: {
                  where: { isActive: true },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    for (const completedSequence of completedSequences) {
      const { sequence } = completedSequence;
      const campaign = sequence.campaign;
      
      // Find the next sequence in the campaign
      const nextSequence = campaign.sequences.find(
        seq => seq.order === sequence.order + 1
      );

      if (nextSequence) {
        // Calculate when to send the next sequence
        const scheduledFor = new Date(completedSequence.sentAt!);
        scheduledFor.setDate(scheduledFor.getDate() + nextSequence.delayDays);
        scheduledFor.setHours(scheduledFor.getHours() + nextSequence.delayHours);

        // Check if this user already has this sequence scheduled
        const existingSchedule = await prisma.emailSequenceLog.findUnique({
          where: {
            sequenceId_userId: {
              sequenceId: nextSequence.id,
              userId: completedSequence.userId
            }
          }
        });

        if (!existingSchedule) {
          // Schedule the next sequence
          await prisma.emailSequenceLog.create({
            data: {
              sequenceId: nextSequence.id,
              userId: completedSequence.userId,
              email: completedSequence.email,
              status: 'PENDING',
              scheduledFor: scheduledFor
            }
          });

          console.log(`Scheduled next sequence for user ${completedSequence.email} at ${scheduledFor}`);
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling next sequences:', error);
  }
} 
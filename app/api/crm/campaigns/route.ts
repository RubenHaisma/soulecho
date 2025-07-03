import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/crm/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication via header or query param
    const adminKey = request.headers.get('x-admin-key') || 
                    new URL(request.url).searchParams.get('adminKey');
    
    if (!adminKey || adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (status) where.status = status;

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      include: {
        logs: {
          select: {
            status: true,
            sentAt: true,
            user: {
              select: { email: true, name: true }
            }
          }
        },
        sequences: {
          select: {
            id: true,
            name: true,
            order: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.emailCampaign.count({ where });

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;
    
    if (!adminKey || adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    const {
      name,
      description,
      subject,
      emailTemplate,
      targetType,
      targetCriteria,
      scheduledFor,
      sequences
    } = body;

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        description,
        subject,
        emailTemplate: JSON.stringify(emailTemplate),
        targetType,
        targetCriteria: targetCriteria ? JSON.stringify(targetCriteria) : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        createdBy: 'admin',
        status: scheduledFor ? 'SCHEDULED' : 'DRAFT'
      }
    });

    // Create sequences if provided
    if (sequences && sequences.length > 0) {
      await prisma.emailSequence.createMany({
        data: sequences.map((seq: any, index: number) => ({
          campaignId: campaign.id,
          name: seq.name,
          description: seq.description,
          order: index,
          delayDays: seq.delayDays || 0,
          delayHours: seq.delayHours || 0,
          emailTemplate: JSON.stringify(seq.emailTemplate),
          subject: seq.subject,
          isActive: seq.isActive !== false
        }))
      });
    }

    return NextResponse.json({ campaign });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
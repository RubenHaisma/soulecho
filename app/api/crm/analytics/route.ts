import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication via query param
    const adminKey = new URL(request.url).searchParams.get('adminKey');
    
    if (!adminKey || adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Get campaign statistics
    const totalCampaigns = await prisma.emailCampaign.count();
    const activeCampaigns = await prisma.emailCampaign.count({
      where: {
        status: {
          in: ['RUNNING', 'SCHEDULED']
        }
      }
    });

    // Get email statistics
    const emailStats = await prisma.emailCampaignLog.aggregate({
      _sum: {
        // Since we don't have these as numbers, we'll count them
      },
      _count: {
        id: true
      },
      where: {
        status: 'SENT'
      }
    });

    const totalEmailsSent = emailStats._count.id || 0;

    // Calculate open rate
    const openedEmails = await prisma.emailCampaignLog.count({
      where: {
        status: 'OPENED'
      }
    });

    const averageOpenRate = totalEmailsSent > 0 ? (openedEmails / totalEmailsSent) * 100 : 0;

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({
      where: {
        emailVerified: {
          not: null
        }
      }
    });

    // Get recent campaign performance
    const recentCampaigns = await prisma.emailCampaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        logs: {
          select: {
            status: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true
          }
        }
      }
    });

    // Calculate detailed stats for each recent campaign
    const campaignStats = recentCampaigns.map(campaign => {
      const totalLogs = campaign.logs.length;
      const sentCount = campaign.logs.filter(log => log.status === 'SENT').length;
      const openedCount = campaign.logs.filter(log => log.openedAt).length;
      const clickedCount = campaign.logs.filter(log => log.clickedAt).length;

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalTargets: totalLogs,
        sent: sentCount,
        opened: openedCount,
        clicked: clickedCount,
        openRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
        clickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
        createdAt: campaign.createdAt
      };
    });

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get email sending trends (last 30 days)
    const emailTrends = await prisma.emailCampaignLog.groupBy({
      by: ['sentAt'],
      where: {
        sentAt: {
          gte: thirtyDaysAgo,
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        sentAt: 'asc'
      }
    });

    // Get top performing campaigns
    const topCampaigns = await prisma.emailCampaign.findMany({
      where: {
        totalSent: {
          gt: 0
        }
      },
      orderBy: [
        { totalOpened: 'desc' },
        { totalSent: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        totalSent: true,
        totalOpened: true,
        totalClicked: true,
        createdAt: true
      }
    });

    const topCampaignsWithRates = topCampaigns.map(campaign => ({
      ...campaign,
      openRate: campaign.totalSent > 0 ? (campaign.totalOpened / campaign.totalSent) * 100 : 0,
      clickRate: campaign.totalSent > 0 ? (campaign.totalClicked / campaign.totalSent) * 100 : 0
    }));

    return NextResponse.json({
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalEmailsSent,
        averageOpenRate,
        totalUsers,
        verifiedUsers
      },
      campaignStats,
      userGrowth: userGrowth.map(item => ({
        date: item.createdAt,
        count: item._count.id
      })),
      emailTrends: emailTrends.map(item => ({
        date: item.sentAt,
        count: item._count.id
      })),
      topCampaigns: topCampaignsWithRates
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
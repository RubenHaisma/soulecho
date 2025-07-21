import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserRateLimit } from '@/lib/rate-limiting';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            conversations: {
              orderBy: { createdAt: 'desc' },
              take: 1 // Get last conversation for each session
            }
          },
          orderBy: { lastActivity: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Calculate subscription status
    const isPremium = !!(user as any).stripeSubscriptionId && 
                     !!(user as any).stripeCurrentPeriodEnd && 
                     (user as any).stripeCurrentPeriodEnd > now;

    const trialEndDate = (user as any).trialEndDate || 
                        ((user as any).trialStartDate ? new Date((user as any).trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                         new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const isTrialActive = (user as any).isTrialActive && now <= trialEndDate && !isPremium;
    const daysLeft = isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate stats
    const totalConversations = user.chatSessions.reduce((sum, session) => sum + session.conversations.length, 0);
    const totalMessages = totalConversations * 2; // Each conversation has user + AI message
    
    // Calculate context usage rate
    const conversationsWithContext = await prisma.conversation.count({
      where: {
        chatSession: {
          userId: user.id
        },
        contextUsed: true
      }
    });
    
    const contextUsageRate = totalConversations > 0 
      ? Math.round((conversationsWithContext / totalConversations) * 100) 
      : 0;

    // Calculate average response time
    const conversationRecords = await prisma.conversation.findMany({
      where: {
        chatSession: {
          userId: user.id
        },
        processingTime: {
          not: null
        }
      },
      select: {
        processingTime: true
      }
    });

    const responseTimes = conversationRecords
      .map(c => {
        const timeStr = c.processingTime?.replace('ms', '') || '0';
        return parseInt(timeStr) / 1000; // Convert to seconds
      })
      .filter(time => time > 0);

    const averageResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
      : 0;

    // Get rate limiting info
    let qualityLevel = 100;
    try {
      const rateLimit = await getUserRateLimit(session.user.email);
      qualityLevel = rateLimit.qualityLevel;
    } catch (error) {
      console.warn('Failed to get rate limit info:', error);
    }

    // Format conversations for display
    const conversations = user.chatSessions.map(session => ({
      id: session.id,
      personName: session.personName,
      lastMessage: session.conversations[0]?.aiResponse?.substring(0, 100) + '...' || 'No messages yet',
      lastActivity: session.lastActivity.toISOString(),
      messageCount: session.conversations.length,
      isActive: session.isActive
    }));

    // Generate recent activity
    const recentActivity = [
      ...user.chatSessions.slice(0, 3).map(session => ({
        id: `session-${session.id}`,
        type: 'conversation' as const,
        description: `Started conversation with ${session.personName}`,
        timestamp: session.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const dashboardData = {
      user: {
        name: user.name || 'User',
        email: user.email,
        avatar: user.image
      },
      subscription: {
        planType: isPremium ? 'premium' : (isTrialActive ? 'trial' : 'expired'),
        isTrialActive,
        daysLeft,
        trialEndDate: trialEndDate.toISOString(),
        conversationsUsed: user.chatSessions.length,
        conversationLimit: isPremium ? 9999 : 1,
        qualityLevel
      },
      conversations,
      stats: {
        totalConversations: user.chatSessions.length,
        totalMessages,
        contextUsageRate,
        averageResponseTime
      },
      recentActivity
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Enhanced dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
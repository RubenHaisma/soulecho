import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's chat sessions with conversation counts
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        user: {
          email: session.user.email
        },
        isActive: true
      },
      include: {
        conversations: {
          select: {
            id: true,
            createdAt: true,
            contextUsed: true,
            relevantMessages: true,
            processingTime: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    // Get user subscription info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        createdAt: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        subscriptionStatus: true,
        isTrialActive: true,
        trialStartDate: true,
        trialEndDate: true
      }
    });

    // Calculate premium status - check for both subscription and lifetime
    const now = new Date();
    const hasActiveSubscription = !!user?.stripeSubscriptionId && 
                                !!user?.stripeCurrentPeriodEnd && 
                                user.stripeCurrentPeriodEnd > now;
    const hasLifetimeAccess = user?.stripePriceId === 'lifetime';
    const isPremium = hasActiveSubscription || hasLifetimeAccess || user?.subscriptionStatus === 'premium';
    
    // If user is premium, ensure trial is marked as inactive
    if (isPremium && user?.isTrialActive) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { 
          isTrialActive: false,
          subscriptionStatus: 'premium'
        }
      });
    }
    
    const trialEndDate = user?.trialEndDate || 
                        (user?.trialStartDate ? new Date(user.trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                         new Date((user?.createdAt || new Date()).getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const isTrialActive = user?.isTrialActive && now <= trialEndDate && !isPremium;
    const daysLeft = isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate real statistics from actual conversations
    const totalConversations = chatSessions.reduce((sum, session) => sum + session.conversations.length, 0);
    const conversationsWithContext = chatSessions.reduce((sum, session) => 
      sum + session.conversations.filter(conv => conv.contextUsed).length, 0
    );
    const totalRelevantMessages = chatSessions.reduce((sum, session) => 
      sum + session.conversations.reduce((convSum, conv) => convSum + conv.relevantMessages, 0), 0
    );

    const planType = isPremium ? 'premium' : (isTrialActive ? 'trial' : 'expired');

    const stats = {
      totalSessions: chatSessions.length,
      totalMessages: totalConversations,
      totalConversations: totalConversations,
      conversationsWithContext: conversationsWithContext,
      totalRelevantMessages: totalRelevantMessages,
      contextUsageRate: totalConversations > 0 ? Math.round((conversationsWithContext / totalConversations) * 100) : 0,
      subscriptionStatus: isPremium ? 'premium' : (isTrialActive ? 'trial' : 'expired'),
      planType,
      isTrialActive,
      trialEndDate: trialEndDate.toISOString(),
      daysLeft
    };

    return NextResponse.json({
      sessions: chatSessions,
      stats
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
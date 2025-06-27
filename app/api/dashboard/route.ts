import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's chat sessions with conversation counts
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
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
      where: { id: session.user.id },
      select: {
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true
      }
    });

    // Calculate real statistics from actual conversations
    const totalConversations = chatSessions.reduce((sum, session) => sum + session.conversations.length, 0);
    const conversationsWithContext = chatSessions.reduce((sum, session) => 
      sum + session.conversations.filter(conv => conv.contextUsed).length, 0
    );
    const totalRelevantMessages = chatSessions.reduce((sum, session) => 
      sum + session.conversations.reduce((convSum, conv) => convSum + conv.relevantMessages, 0), 0
    );

    const stats = {
      totalSessions: chatSessions.length,
      totalMessages: totalConversations,
      totalConversations: totalConversations,
      conversationsWithContext: conversationsWithContext,
      totalRelevantMessages: totalRelevantMessages,
      contextUsageRate: totalConversations > 0 ? Math.round((conversationsWithContext / totalConversations) * 100) : 0,
      subscriptionStatus: user?.stripeSubscriptionId ? 'premium' : 'free'
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
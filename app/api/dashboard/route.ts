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

    // Get user's chat sessions
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        isActive: true
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

    const stats = {
      totalSessions: chatSessions.length,
      totalMessages: chatSessions.reduce((sum, session) => sum + session.messageCount, 0),
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
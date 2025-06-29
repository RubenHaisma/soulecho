import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TRIAL_LIMITS = {
  conversations: 1,
  sessions: 1,
  memoryCards: 5
};

const PREMIUM_LIMITS = {
  conversations: 9999,
  sessions: 9999,
  memoryCards: 9999
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: true,
        memoryCards: true
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Count conversations
    const conversations = await prisma.conversation.count({
      where: {
        chatSession: {
          userId: user.id
        }
      }
    });
    const sessions = user.chatSessions.length;
    const memoryCards = user.memoryCards.length;

    // Determine plan and trial status
    const now = new Date();
    const isPremium = !!user.stripeSubscriptionId && !!user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > now;
    
    // Check trial status
    const trialEndDate = user.trialEndDate || (user.trialStartDate ? new Date(user.trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
    const isTrialActive = user.isTrialActive && now <= trialEndDate && !isPremium;
    
    const limits = isPremium ? PREMIUM_LIMITS : TRIAL_LIMITS;
    const planType = isPremium ? 'premium' : (isTrialActive ? 'trial' : 'expired');

    return NextResponse.json({
      usage: {
        conversations,
        conversationsLimit: limits.conversations,
        sessions,
        sessionsLimit: limits.sessions,
        memoryCards,
        memoryCardsLimit: limits.memoryCards,
        planType,
        isTrialActive,
        trialEndDate: trialEndDate.toISOString(),
        daysLeft: isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
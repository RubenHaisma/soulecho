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

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            conversations: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Check premium status
    const isPremium = !!(user as any).stripeSubscriptionId && 
                     !!(user as any).stripeCurrentPeriodEnd && 
                     (user as any).stripeCurrentPeriodEnd > now;

    // Calculate trial status
    const trialEndDate = (user as any).trialEndDate || 
                        ((user as any).trialStartDate ? new Date((user as any).trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                         new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const isTrialActive = (user as any).isTrialActive && now <= trialEndDate && !isPremium;
    const daysLeft = isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Count conversations
    const conversationsUsed = user.chatSessions.reduce((sum, session) => sum + session.conversations.length, 0);
    const conversationLimit = isPremium ? 9999 : 1;

    // Get rate limiting info for quality level
    let qualityLevel = 100;
    let degradationMessage: string | undefined;
    
    try {
      const rateLimit = await getUserRateLimit(session.user.email);
      qualityLevel = rateLimit.qualityLevel;
      degradationMessage = rateLimit.degradationMessage;
    } catch (error) {
      console.warn('Failed to get rate limit info:', error);
    }

    const planType = isPremium ? 'premium' : (isTrialActive ? 'trial' : 'expired');

    const trialStatus = {
      isActive: isTrialActive,
      daysLeft,
      totalDays: 3,
      conversationsUsed,
      conversationLimit,
      qualityLevel,
      planType,
      degradationMessage
    };

    return NextResponse.json(trialStatus);

  } catch (error) {
    console.error('Trial status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
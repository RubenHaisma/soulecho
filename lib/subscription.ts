import { prisma } from '@/lib/prisma';

export interface SubscriptionStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialEndDate: Date;
  daysLeft: number;
  planType: 'premium' | 'trial' | 'expired';
  canChat: boolean;
  conversationLimit: number;
  conversationsUsed: number;
}

export async function getUserSubscriptionStatus(userEmail: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      chatSessions: {
        include: {
          conversations: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  
  // Check premium status
  const isPremium = !!(user.stripeSubscriptionId && 
                      user.stripeCurrentPeriodEnd && 
                      user.stripeCurrentPeriodEnd > now);

  // Calculate trial status
  const trialEndDate = user.trialEndDate || 
                      (user.trialStartDate ? 
                       new Date(user.trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                       new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
  
  const isTrialActive = (user.isTrialActive ?? true) && now <= trialEndDate && !isPremium;
  const daysLeft = isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Count conversations
  const conversationsUsed = user.chatSessions.reduce((sum, session) => sum + session.conversations.length, 0);
  
  // Determine plan type and limits
  let planType: 'premium' | 'trial' | 'expired';
  let conversationLimit: number;
  let canChat: boolean;

  if (isPremium) {
    planType = 'premium';
    conversationLimit = 9999;
    canChat = true;
  } else if (isTrialActive) {
    planType = 'trial';
    conversationLimit = 1;
    canChat = conversationsUsed < conversationLimit;
  } else {
    planType = 'expired';
    conversationLimit = 0;
    canChat = false;
  }

  return {
    isPremium,
    isTrialActive,
    trialEndDate,
    daysLeft,
    planType,
    canChat,
    conversationLimit,
    conversationsUsed
  };
}

export async function initializeUserTrial(userEmail: string): Promise<void> {
  const now = new Date();
  const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { email: userEmail },
    data: {
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialActive: true,
      trialChatsUsed: 0
    }
  });
} 
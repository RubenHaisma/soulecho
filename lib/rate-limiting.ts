import { prisma } from '@/lib/prisma';

export interface RateLimitConfig {
  maxResponseLength: number;
  contextWindowSize: number;
  memoryDepth: number;
  responseQuality: 'full' | 'good' | 'basic' | 'minimal';
  qualityLevel: number;
  tokensAllowed: number;
  degradationMessage?: string;
}

export async function getUserRateLimit(userEmail: string): Promise<RateLimitConfig> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      createdAt: true,
      isTrialActive: true,
      trialStartDate: true,
      trialEndDate: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      tokensUsedToday: true,
      totalTokensUsed: true,
      lastTokenReset: true,
      responseQualityLevel: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  
  // Check if premium
  const isPremium = !!(user.stripeSubscriptionId && 
                      user.stripeCurrentPeriodEnd && 
                      user.stripeCurrentPeriodEnd > now);

  if (isPremium) {
    return {
      maxResponseLength: 2000,
      contextWindowSize: 10000,
      memoryDepth: 50,
      responseQuality: 'full',
      qualityLevel: 100,
      tokensAllowed: 100000 // Very high limit for premium
    };
  }

  // Calculate trial progress
  const trialStart = user.trialStartDate || user.createdAt;
  const trialEnd = user.trialEndDate || new Date(trialStart.getTime() + 3 * 24 * 60 * 60 * 1000);
  const trialProgress = Math.min(1, (now.getTime() - trialStart.getTime()) / (trialEnd.getTime() - trialStart.getTime()));
  
  // Check if trial is still active
  const isTrialActive = user.isTrialActive && now <= trialEnd;
  
  if (!isTrialActive) {
    // Trial expired - very limited experience
    return {
      maxResponseLength: 100,
      contextWindowSize: 500,
      memoryDepth: 1,
      responseQuality: 'minimal',
      qualityLevel: 10,
      tokensAllowed: 100,
      degradationMessage: "Your trial has expired. Upgrade to Premium for the full Talkers experience."
    };
  }

  // Smart degradation based on trial progress and token usage
  const baseTokensUsed = user.totalTokensUsed || 0;
  const tokensToday = user.tokensUsedToday || 0;
  
  // Define degradation stages
  let qualityLevel = 100;
  let degradationMessage: string | undefined;

  if (trialProgress < 0.3) {
    // First 30% of trial - Full experience
    qualityLevel = 100;
  } else if (trialProgress < 0.6) {
    // 30-60% of trial - Slight degradation
    qualityLevel = 85;
    degradationMessage = "You're experiencing Talkers' powerful memory system. Upgrade for unlimited access.";
  } else if (trialProgress < 0.8) {
    // 60-80% of trial - Noticeable degradation
    qualityLevel = 65;
    degradationMessage = "Your trial is ending soon. Upgrade to Premium to maintain this conversation quality.";
  } else {
    // Final 20% of trial - Significant degradation
    qualityLevel = 40;
    degradationMessage = "Trial ending soon! Upgrade now to keep the full Talkers experience.";
  }

  // Additional degradation based on token usage
  if (baseTokensUsed > 10000) qualityLevel -= 15;
  if (baseTokensUsed > 20000) qualityLevel -= 15;
  if (tokensToday > 2000) qualityLevel -= 10;

  qualityLevel = Math.max(25, qualityLevel); // Never go below 25%

  // Map quality level to specific limits
  let config: RateLimitConfig;
  
  if (qualityLevel >= 90) {
    config = {
      maxResponseLength: 1800,
      contextWindowSize: 8000,
      memoryDepth: 30,
      responseQuality: 'full',
      qualityLevel,
      tokensAllowed: 5000,
      degradationMessage
    };
  } else if (qualityLevel >= 70) {
    config = {
      maxResponseLength: 1200,
      contextWindowSize: 5000,
      memoryDepth: 20,
      responseQuality: 'good',
      qualityLevel,
      tokensAllowed: 3000,
      degradationMessage
    };
  } else if (qualityLevel >= 50) {
    config = {
      maxResponseLength: 800,
      contextWindowSize: 3000,
      memoryDepth: 10,
      responseQuality: 'basic',
      qualityLevel,
      tokensAllowed: 1500,
      degradationMessage
    };
  } else {
    config = {
      maxResponseLength: 400,
      contextWindowSize: 1500,
      memoryDepth: 5,
      responseQuality: 'minimal',
      qualityLevel,
      tokensAllowed: 800,
      degradationMessage
    };
  }

  return config;
}

export async function updateTokenUsage(userEmail: string, tokensUsed: number): Promise<void> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { lastTokenReset: true, tokensUsedToday: true }
  });

  if (!user) return;

  // Check if we need to reset daily tokens (new day)
  const lastReset = user.lastTokenReset || new Date();
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
  
  let updateData: any = {
    totalTokensUsed: { increment: tokensUsed }
  };

  if (hoursSinceReset >= 24) {
    // Reset daily tokens
    updateData.tokensUsedToday = tokensUsed;
    updateData.lastTokenReset = now;
  } else {
    // Increment daily tokens
    updateData.tokensUsedToday = { increment: tokensUsed };
  }

  await prisma.user.update({
    where: { email: userEmail },
    data: updateData
  });
}

export function getResponseInstructions(config: RateLimitConfig): string {
  switch (config.responseQuality) {
    case 'full':
      return `Provide a thoughtful, detailed response (max ${config.maxResponseLength} chars). Use rich emotional language and deep insights. Include specific memories and personal details.`;
    
    case 'good':
      return `Provide a warm, engaging response (max ${config.maxResponseLength} chars). Include some personal touches but be more concise than usual.`;
    
    case 'basic':
      return `Provide a friendly but concise response (max ${config.maxResponseLength} chars). Focus on the key points without elaborate details.`;
    
    case 'minimal':
      return `Provide a brief, basic response (max ${config.maxResponseLength} chars). Keep it simple and direct.`;
    
    default:
      return `Provide a response (max ${config.maxResponseLength} chars).`;
  }
} 
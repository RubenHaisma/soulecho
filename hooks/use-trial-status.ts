'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TrialStatus {
  isActive: boolean;
  daysLeft: number;
  totalDays: number;
  conversationsUsed: number;
  conversationLimit: number;
  qualityLevel: number;
  planType: 'trial' | 'premium' | 'expired';
  degradationMessage?: string;
}

export const useTrialStatus = () => {
  const { data: session } = useSession();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialStatus = async () => {
    if (!session?.user) return;
    
    try {
      setError(null);
      const response = await fetch('/api/trial/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trial status');
      }
      
      const data = await response.json();
      setTrialStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch trial status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrialStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const canCreateConversation = () => {
    if (!trialStatus) return false;
    return trialStatus.planType === 'premium' || 
           (trialStatus.isActive && trialStatus.conversationsUsed < trialStatus.conversationLimit);
  };

  const shouldShowUpgradePrompt = () => {
    if (!trialStatus) return false;
    return trialStatus.planType === 'trial' && 
           (trialStatus.daysLeft <= 1 || trialStatus.conversationsUsed >= trialStatus.conversationLimit);
  };

  const getBlockingReason = (): 'trial_expired' | 'conversation_limit' | null => {
    if (!trialStatus) return null;
    if (trialStatus.planType === 'expired') return 'trial_expired';
    if (trialStatus.planType === 'trial' && trialStatus.conversationsUsed >= trialStatus.conversationLimit) {
      return 'conversation_limit';
    }
    return null;
  };

  return {
    trialStatus,
    isLoading,
    error,
    canCreateConversation,
    shouldShowUpgradePrompt,
    getBlockingReason,
    refetch: fetchTrialStatus
  };
};
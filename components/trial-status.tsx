'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface TrialStatusProps {
  className?: string;
}

interface TrialData {
  planType: 'premium' | 'trial' | 'expired';
  isTrialActive: boolean;
  daysLeft: number;
  conversationsUsed: number;
  conversationLimit: number;
  canChat: boolean;
}

export function TrialStatus({ className }: TrialStatusProps) {
  const { data: session } = useSession();
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTrialStatus();
    }
  }, [session]);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/dashboard/usage');
      if (response.ok) {
        const data = await response.json();
        setTrialData({
          planType: data.usage.planType,
          isTrialActive: data.usage.isTrialActive,
          daysLeft: data.usage.daysLeft,
          conversationsUsed: data.usage.conversations,
          conversationLimit: data.usage.conversationsLimit,
          canChat: data.usage.conversations < data.usage.conversationsLimit || data.usage.planType === 'premium'
        });
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !trialData) {
    return null;
  }

  if (trialData.planType === 'premium') {
    return (
      <Card className={`bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Premium Active
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Unlimited conversations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trialData.planType === 'expired') {
    return (
      <Card className={`bg-gradient-to-r from-red-50 to-orange-50 border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Trial Expired</Badge>
                </div>
                <p className="text-sm text-gray-600">Your 3-day trial has ended</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trial active
  const usagePercentage = (trialData.conversationsUsed / trialData.conversationLimit) * 100;

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Free Trial
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {trialData.daysLeft} day{trialData.daysLeft !== 1 ? 's' : ''} left
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {trialData.conversationsUsed} / {trialData.conversationLimit} conversation used
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Trial Usage</span>
              <span className="text-xs text-gray-500">{Math.round(usagePercentage)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {!trialData.canChat && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                You've used your trial conversation. Upgrade to Premium for unlimited chats!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
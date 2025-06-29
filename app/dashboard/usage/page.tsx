'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, MessageCircle, Users, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard-nav';

interface UsageData {
  conversations: number;
  conversationsLimit: number;
  sessions: number;
  sessionsLimit: number;
  memoryCards: number;
  memoryCardsLimit: number;
}

export default function UsagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadUsageData();
    }
  }, [status, router]);

  const loadUsageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Usage & Limits</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Usage & Limits</h1>
          <p className="text-xl text-gray-600">
            Track your usage and plan limits
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {!usage ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No usage data found</h3>
            <p className="text-gray-600 mb-4">Start using Talkers to see your usage stats.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{usage.conversations} / {usage.conversationsLimit}</span>
                  <Progress value={getUsagePercentage(usage.conversations, usage.conversationsLimit)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Chat Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{usage.sessions} / {usage.sessionsLimit}</span>
                  <Progress value={getUsagePercentage(usage.sessions, usage.sessionsLimit)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Memory Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{usage.memoryCards} / {usage.memoryCardsLimit}</span>
                  <Progress value={getUsagePercentage(usage.memoryCards, usage.memoryCardsLimit)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
} 
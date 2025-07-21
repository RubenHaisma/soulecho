'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  MessageCircle, 
  Calendar, 
  Crown, 
  Settings, 
  LogOut,
  Sparkles,
  Clock,
  Users,
  Trash2,
  Heart,
  BarChart3,
  CreditCard,
  Activity,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { TrialStatusBanner } from '@/components/trial-management/trial-status-banner';
import { TrialExpirationModal } from '@/components/trial-management/trial-expiration-modal';
import { motion } from 'framer-motion';

interface DashboardData {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  subscription: {
    planType: 'trial' | 'premium' | 'expired';
    isTrialActive: boolean;
    daysLeft: number;
    trialEndDate: string;
    conversationsUsed: number;
    conversationLimit: number;
    qualityLevel: number;
  };
  conversations: Array<{
    id: string;
    personName: string;
    lastMessage: string;
    lastActivity: string;
    messageCount: number;
    isActive: boolean;
  }>;
  stats: {
    totalConversations: number;
    totalMessages: number;
    contextUsageRate: number;
    averageResponseTime: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'conversation' | 'upload' | 'milestone';
    description: string;
    timestamp: string;
  }>;
}

interface EnhancedDashboardProps {
  className?: string;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ className = '' }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status, router]);

  useEffect(() => {
    // Check if trial is about to expire
    if (dashboardData?.subscription.isTrialActive && dashboardData.subscription.daysLeft <= 1) {
      const hasShownModal = localStorage.getItem('trialExpirationModalShown');
      if (!hasShownModal) {
        setShowExpirationModal(true);
        localStorage.setItem('trialExpirationModalShown', 'true');
      }
    }
  }, [dashboardData]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/enhanced');
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getQualityColor = (level: number) => {
    if (level >= 90) return 'text-green-600';
    if (level >= 70) return 'text-blue-600';
    if (level >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const canCreateConversation = () => {
    if (!dashboardData) return false;
    const { subscription } = dashboardData;
    return subscription.planType === 'premium' || 
           (subscription.isTrialActive && subscription.conversationsUsed < subscription.conversationLimit);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 ${className}`}>
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-5 h-5 relative">
                    <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                    <div className="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
                  Talkers
                </h1>
              </Link>
              
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {dashboardData.subscription.planType !== 'premium' && (
                <Link href="/pricing">
                  <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400">
                  <AvatarFallback className="text-white font-semibold">
                    {dashboardData.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{dashboardData.user.name}</p>
                  <p className="text-xs text-gray-500">{dashboardData.user.email}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData.user.name?.split(' ')[0]}
          </h2>
          <p className="text-xl text-gray-600">
            Your sacred conversations await
          </p>
        </motion.div>

        {/* Trial Status Banner */}
        <TrialStatusBanner className="mb-6" showDismiss />

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalConversations}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Context Usage</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.contextUsageRate}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.averageResponseTime}s</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conversations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Conversations</h3>
              <Button 
                onClick={() => router.push('/upload')}
                disabled={!canCreateConversation()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>

            {/* Conversation Limit Warning */}
            {!canCreateConversation() && dashboardData.subscription.planType === 'trial' && (
              <Card className="border-orange-200 bg-orange-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Trial Limit Reached</p>
                      <p className="text-orange-700 text-sm">
                        You've used {dashboardData.subscription.conversationsUsed}/{dashboardData.subscription.conversationLimit} conversations. 
                        Upgrade to Premium for unlimited access.
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        Upgrade
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {dashboardData.conversations.length === 0 ? (
                <Card className="border-0 bg-white/40 backdrop-blur-md shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h4>
                    <p className="text-gray-600 mb-6">
                      Start your first sacred conversation by uploading a WhatsApp chat
                    </p>
                    <Button 
                      onClick={() => router.push('/upload')}
                      disabled={!canCreateConversation()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Conversation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                dashboardData.conversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400">
                              <AvatarFallback className="text-white font-semibold">
                                {conversation.personName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">
                                {conversation.personName}
                              </h4>
                              <p className="text-gray-600 text-sm truncate">
                                {conversation.lastMessage}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {conversation.messageCount} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(conversation.lastActivity)}
                                </span>
                                {conversation.isActive && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/chat/${conversation.id}`}>
                              <Button variant="outline" className="rounded-full">
                                Continue
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteConversation(conversation.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/upload')}
                  disabled={!canCreateConversation()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/memories')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Memory Timeline
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50/50">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {activity.type === 'conversation' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                          {activity.type === 'upload' && <Plus className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'milestone' && <Calendar className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Plan</span>
                    <Badge className={
                      dashboardData.subscription.planType === 'premium' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {dashboardData.subscription.planType === 'premium' ? 'Premium' : 'Trial'}
                    </Badge>
                  </div>
                  
                  {dashboardData.subscription.planType === 'trial' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Days Remaining</span>
                          <span className="font-medium">{dashboardData.subscription.daysLeft}</span>
                        </div>
                        <Progress 
                          value={((3 - dashboardData.subscription.daysLeft) / 3) * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Conversations Used</span>
                          <span className="font-medium">
                            {dashboardData.subscription.conversationsUsed}/{dashboardData.subscription.conversationLimit}
                          </span>
                        </div>
                        <Progress 
                          value={(dashboardData.subscription.conversationsUsed / dashboardData.subscription.conversationLimit) * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Experience Quality</span>
                        <span className={`font-medium ${getQualityColor(dashboardData.subscription.qualityLevel)}`}>
                          {dashboardData.subscription.qualityLevel}%
                        </span>
                      </div>
                    </>
                  )}
                  
                  {dashboardData.subscription.planType !== 'premium' && (
                    <Link href="/pricing">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Trial Expiration Modal */}
      <TrialExpirationModal
        isOpen={showExpirationModal}
        onClose={() => setShowExpirationModal(false)}
        trialEndDate={dashboardData.subscription.trialEndDate}
        conversationsUsed={dashboardData.subscription.conversationsUsed}
      />
    </div>
  );
};
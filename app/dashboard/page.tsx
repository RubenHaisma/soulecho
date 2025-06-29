'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { BirthdayNotification } from '@/components/birthday-notification';
import { DashboardNav } from '@/components/dashboard-nav';
import { TrialStatus } from '@/components/trial-status';
import { TrialExperienceSummary } from '@/components/trial-experience-summary';

interface ChatSession {
  id: string;
  personName: string;
  messageCount: number;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  conversations: {
    id: string;
    createdAt: string;
    contextUsed: boolean;
    relevantMessages: number;
    processingTime: string | null;
    userMessage: string;
    aiResponse: string;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalConversations: 0,
    conversationsWithContext: 0,
    totalRelevantMessages: 0,
    contextUsageRate: 0,
    subscriptionStatus: 'trial',
    planType: 'trial',
    isTrialActive: true,
    trialEndDate: null as string | null,
    daysLeft: 3
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  // Add delete handlers
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation and all its messages?')) return;
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const response = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your sacred space...</p>
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
              {stats.subscriptionStatus !== 'premium' && (
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
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
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
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xl text-gray-600">
            Your sacred conversations await
          </p>
        </div>

        {/* Birthday Notification */}
        <BirthdayNotification />

        {/* Trial Status */}
        {stats.subscriptionStatus !== 'premium' && <TrialStatus className="mb-6" />}

        {/* Trial Experience Summary */}
        {stats.subscriptionStatus !== 'premium' && (
          <div className="mb-6">
            <TrialExperienceSummary 
              trialProgress={stats.daysLeft ? (3 - stats.daysLeft) / 3 : 1}
              qualityLevel={stats.isTrialActive ? Math.max(40, 100 - (3 - stats.daysLeft) * 20) : 10}
              daysLeft={stats.daysLeft}
              conversationsUsed={stats.totalConversations}
              isTrialActive={stats.isTrialActive}
            />
          </div>
        )}

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
                  <p className="text-xs text-gray-500 mt-1">Real conversations stored</p>
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
                  <p className="text-3xl font-bold text-gray-900">{stats.contextUsageRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.conversationsWithContext}/{stats.totalConversations} used context</p>
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
                  <p className="text-sm font-medium text-gray-600">Plan Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.subscriptionStatus === 'premium' ? 'default' : 'secondary'}>
                      {stats.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                    </Badge>
                    {stats.subscriptionStatus !== 'premium' && (
                      <span className="text-sm text-gray-500">3/5 used</span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              {stats.subscriptionStatus !== 'premium' && (
                <div className="mt-3">
                  <Progress value={60} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Sessions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Conversations</h3>
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {chatSessions.length === 0 ? (
                <Card className="border-0 bg-white/40 backdrop-blur-md shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h4>
                    <p className="text-gray-600 mb-6">
                      Start your first sacred conversation by uploading a WhatsApp chat
                    </p>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Conversation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                chatSessions.map((session) => (
                  <Card key={session.id} className="border-0 bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400">
                            <AvatarFallback className="text-white font-semibold">
                              {session.personName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{session.personName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {session.conversations.length} conversations
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(session.lastActivity)}
                              </span>
                              {session.conversations.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {Math.round((session.conversations.filter(c => c.contextUsed).length / session.conversations.length) * 100)}% context
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                          )}
                          <Link href={`/chat/${session.id}`}>
                            <Button variant="outline" className="rounded-full">
                              Continue
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)} title="Delete conversation">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/upload">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </Link>
                <Link href="/memories">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Memory Timeline
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/subscription">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription
                  </Button>
                </Link>
                <Link href="/dashboard/billing">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Billing History
                  </Button>
                </Link>
                <Link href="/dashboard/usage">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Usage & Limits
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                {stats.subscriptionStatus !== 'premium' && (
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full justify-start">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {chatSessions.length > 0 ? (
                  <div className="space-y-3">
                    {chatSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50">
                        <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400">
                          <AvatarFallback className="text-white text-sm">
                            {session.personName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.personName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(session.lastActivity)}
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

            {/* Recent Conversations */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {chatSessions.length > 0 ? (
                  <div className="space-y-3">
                    {chatSessions.slice(0, 3).map((session) => {
                      const recentConversations = session.conversations.slice(0, 2);
                      return (
                        <div key={session.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400">
                              <AvatarFallback className="text-white text-xs">
                                {session.personName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium text-gray-900">{session.personName}</p>
                          </div>
                          {recentConversations.length > 0 ? (
                            <div className="space-y-1 ml-8">
                              {recentConversations.map((conv) => (
                                <div key={conv.id} className="text-xs text-gray-600 bg-gray-50/50 p-2 rounded flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">You: {(conv.userMessage || '').substring(0, 30)}...</p>
                                    <p className="text-gray-500">{(conv.aiResponse || '').substring(0, 30)}...</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-400">
                                        {getTimeAgo(conv.createdAt)}
                                      </span>
                                      {conv.contextUsed && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          Context
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteConversation(conv.id)} title="Delete message">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 ml-8">No conversations yet</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No conversations yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
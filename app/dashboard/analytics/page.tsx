'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  MessageCircle, 
  Users, 
  Clock, 
  Sparkles,
  Heart,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DashboardNav } from '@/components/dashboard-nav';

interface AnalyticsData {
  overview: {
    totalSessions: number;
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    contextUsageRate: number;
    activeDays: number;
    favoritePerson: string;
    mostActiveDay: string;
  };
  conversationsByDay: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
  contextUsage: Array<{
    session: string;
    personName: string;
    contextRate: number;
    totalMessages: number;
  }>;
  responseTimes: Array<{
    date: string;
    averageTime: number;
  }>;
  topTopics: Array<{
    topic: string;
    frequency: number;
    percentage: number;
  }>;
  emotionalInsights: {
    positiveMessages: number;
    neutralMessages: number;
    supportiveMessages: number;
    totalAnalyzed: number;
  };
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadAnalyticsData();
    }
  }, [status, router, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Analytics Data</h3>
          <p className="text-gray-600">Start conversations to see your analytics</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Back to Dashboard
            </Button>
          </Link>
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
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Analytics</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {['7d', '30d', '90d'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                  className={timeRange === range ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Analytics Overview</h1>
          <p className="text-base sm:text-xl text-gray-600">
            Insights into your conversations and emotional journey
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-6 sm:mb-8">
          <DashboardNav />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalConversations}</p>
                  <p className="text-xs text-gray-500 mt-1">Across {analyticsData.overview.totalSessions} sessions</p>
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
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">{formatTime(analyticsData.overview.averageResponseTime)}</p>
                  <p className="text-xs text-gray-500 mt-1">AI processing speed</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Context Usage</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.contextUsageRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Using conversation history</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Days</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.activeDays}</p>
                  <p className="text-xs text-gray-500 mt-1">In the last {timeRange}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Conversation Activity */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Conversation Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.conversationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Conversations']}
                    labelFormatter={formatDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Context Usage by Session */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Context Usage by Person
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.contextUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="personName" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Context Usage']}
                  />
                  <Bar dataKey="contextRate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Emotional Insights */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Emotional Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Positive Messages</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((analyticsData.emotionalInsights.positiveMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(analyticsData.emotionalInsights.positiveMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100} 
                  className="h-2 bg-gray-200"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supportive Messages</span>
                  <span className="font-semibold text-blue-600">
                    {Math.round((analyticsData.emotionalInsights.supportiveMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(analyticsData.emotionalInsights.supportiveMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100} 
                  className="h-2 bg-gray-200"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Neutral Messages</span>
                  <span className="font-semibold text-gray-600">
                    {Math.round((analyticsData.emotionalInsights.neutralMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(analyticsData.emotionalInsights.neutralMessages / analyticsData.emotionalInsights.totalAnalyzed) * 100} 
                  className="h-2 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Conversation Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topTopics.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{topic.topic}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{topic.frequency}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analyticsData.overview.favoritePerson}</p>
                  <p className="text-sm text-purple-700">Most Active Person</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.mostActiveDay}</p>
                  <p className="text-sm text-blue-700">Most Active Day</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.overview.totalMessages}</p>
                  <p className="text-sm text-green-700">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
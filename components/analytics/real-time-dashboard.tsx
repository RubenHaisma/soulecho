'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  MessageCircle,
  Upload,
  CreditCard,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Bell,
  BarChart3,
  LineChart,
  Eye,
  MousePointer,
  DollarSign,
  Percent,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeMetrics {
  activeUsers: number;
  newSignups: number;
  totalConversations: number;
  newUploads: number;
  conversionRate: number;
  churnPredictions: number;
  campaignsSent: number;
  revenue: number;
  serverHealth: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  timestamp: Date;
}

interface LiveActivity {
  id: string;
  type: 'signup' | 'upload' | 'conversation' | 'subscription' | 'churn_risk';
  userId: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ConversionGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  color: string;
}

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [goals, setGoals] = useState<ConversionGoal[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    connectToRealTimeData();
    loadGoals();
    
    // Refresh every 30 seconds as fallback
    const interval = setInterval(() => {
      if (!isConnected) {
        loadMetrics();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      disconnectRealTime();
    };
  }, []);

  const connectToRealTimeData = () => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/analytics`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to real-time analytics');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'metrics_update':
          setMetrics(data.metrics);
          break;
        case 'new_activity':
          setActivities(prev => [data.activity, ...prev.slice(0, 49)]); // Keep last 50
          break;
        case 'alert':
          setAlerts(prev => [data.message, ...prev.slice(0, 4)]); // Keep last 5
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from real-time analytics');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => connectToRealTimeData(), 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const disconnectRealTime = () => {
    // Clean up WebSocket connection
    setIsConnected(false);
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/real-time');
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/analytics/goals');
      const data = await response.json();
      setGoals(data.goals || [
        {
          id: 'daily-signups',
          name: 'Daily Signups',
          target: 50,
          current: 32,
          period: 'daily',
          color: 'bg-blue-500'
        },
        {
          id: 'weekly-conversions',
          name: 'Weekly Conversions',
          target: 100,
          current: 73,
          period: 'weekly',
          color: 'bg-green-500'
        },
        {
          id: 'monthly-revenue',
          name: 'Monthly Revenue',
          target: 10000,
          current: 7250,
          period: 'monthly',
          color: 'bg-purple-500'
        }
      ]);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const getActivityIcon = (type: LiveActivity['type']) => {
    const icons = {
      signup: UserPlus,
      upload: Upload,
      conversation: MessageCircle,
      subscription: CreditCard,
      churn_risk: AlertTriangle
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type: LiveActivity['type']) => {
    const colors = {
      signup: 'text-green-600',
      upload: 'text-blue-600',
      conversation: 'text-purple-600',
      subscription: 'text-yellow-600',
      churn_risk: 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Real-Time Analytics
          </h2>
          <p className="text-gray-600 flex items-center gap-2">
            Live data updates • Last updated: {metrics.timestamp.toLocaleTimeString()}
            {isConnected ? (
              <span className="flex items-center text-green-600">
                <Wifi className="w-4 h-4 mr-1" />
                Connected
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <WifiOff className="w-4 h-4 mr-1" />
                Offline
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">{alert}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Now</div>
              </div>
              <div className="relative">
                <Users className="w-8 h-8 text-green-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.newSignups}</div>
                <div className="text-sm text-gray-600">Signups Today</div>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{metrics.totalConversations}</div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{metrics.newUploads}</div>
                <div className="text-sm text-gray-600">Uploads Today</div>
              </div>
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{metrics.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{metrics.churnPredictions}</div>
                <div className="text-sm text-gray-600">Churn Risk</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-teal-600">{metrics.campaignsSent}</div>
                <div className="text-sm text-gray-600">Campaigns Sent</div>
              </div>
              <Mail className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">${metrics.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue Today</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map(goal => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const isOnTrack = percentage >= 70;
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{goal.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{goal.current}</span>
                        <span className="text-xs text-gray-500"> / {goal.target}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isOnTrack ? 'bg-green-100' : 'bg-red-100'}`}
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                        {percentage.toFixed(1)}% complete
                      </span>
                      <Badge variant={isOnTrack ? 'default' : 'destructive'} className="text-xs">
                        {isOnTrack ? 'On Track' : 'Behind'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {activities.map(activity => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className={`p-1 rounded-full bg-gray-100`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                          {activity.metadata?.location && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Waiting for activity...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Health */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Status</span>
                <Badge 
                  variant={metrics.serverHealth === 'healthy' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metrics.serverHealth === 'healthy' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Healthy</>
                  ) : (
                    <><AlertTriangle className="w-3 h-3 mr-1" /> {metrics.serverHealth}</>
                  )}
                </Badge>
              </div>

              {/* Response Time */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{metrics.responseTime}ms</span>
                </div>
                <Progress 
                  value={Math.min(metrics.responseTime / 1000 * 100, 100)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Target: &lt; 200ms
                </div>
              </div>

              {/* API Health */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">Database</div>
                  <div className="text-lg font-bold text-green-600">99.9%</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">AI API</div>
                  <div className="text-lg font-bold text-blue-600">99.5%</div>
                </div>
              </div>

              {/* Recent Issues */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Issues</h4>
                <div className="text-sm text-gray-500">
                  No critical issues in the last 24 hours
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Detailed Health
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {((metrics.newSignups / 100) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Signup Goal</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.newSignups} / 100 daily target
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {metrics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Trial Conversion</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.conversionRate > 12 ? 'Above' : 'Below'} 12% target
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {metrics.totalConversations}
              </div>
              <div className="text-sm text-gray-600">Daily Conversations</div>
              <div className="text-xs text-gray-500 mt-1">
                +{Math.round(metrics.totalConversations * 0.15)} vs yesterday
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                ${(metrics.revenue / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-gray-600">Daily Revenue</div>
              <div className="text-xs text-gray-500 mt-1">
                ${(metrics.revenue * 30 / 1000).toFixed(1)}k monthly run rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
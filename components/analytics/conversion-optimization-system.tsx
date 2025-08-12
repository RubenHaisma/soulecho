'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  UserCheck,
  UserMinus,
  Heart,
  MessageCircle,
  Upload,
  CreditCard,
  Gift,
  Target,
  Zap,
  Clock,
  Mail,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserBehaviorMetrics {
  userId: string;
  sessionDuration: number;
  pageViews: number;
  conversationCount: number;
  uploadSuccess: boolean;
  trialDaysUsed: number;
  lastActiveDate: string;
  engagementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  conversionProbability: number;
  retentionStage: 'onboarding' | 'activation' | 'retention' | 'resurrection';
}

interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  averageTime: number;
  keyActions: string[];
}

interface RetentionCampaign {
  id: string;
  name: string;
  type: 'email' | 'in-app' | 'push' | 'sms';
  trigger: 'time-based' | 'behavior-based' | 'churn-risk' | 'milestone';
  targetSegment: string;
  isActive: boolean;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdDate: string;
  lastSent: string;
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  variants: {
    name: string;
    traffic: number;
    conversions: number;
    conversionRate: number;
  }[];
  startDate: string;
  endDate?: string;
  winningVariant?: string;
  significance: number;
}

const CONVERSION_FUNNEL_STAGES = [
  { 
    stage: 'Landing Page Visit', 
    keyActions: ['page_view', 'scroll_50%', 'watch_demo'],
    expectedConversion: 25 
  },
  { 
    stage: 'Sign Up Started', 
    keyActions: ['click_signup', 'email_entered', 'password_created'],
    expectedConversion: 60 
  },
  { 
    stage: 'Account Created', 
    keyActions: ['account_verified', 'onboarding_started'],
    expectedConversion: 80 
  },
  { 
    stage: 'First Upload', 
    keyActions: ['file_uploaded', 'processing_started'],
    expectedConversion: 65 
  },
  { 
    stage: 'First Conversation', 
    keyActions: ['first_message_sent', 'ai_response_received'],
    expectedConversion: 45 
  },
  { 
    stage: 'Trial Activated', 
    keyActions: ['trial_features_used', 'multiple_conversations'],
    expectedConversion: 70 
  },
  { 
    stage: 'Subscription', 
    keyActions: ['payment_method_added', 'subscription_created'],
    expectedConversion: 12 
  }
];

const RETENTION_CAMPAIGNS = [
  {
    id: 'welcome-series',
    name: 'Welcome Email Series',
    type: 'email' as const,
    trigger: 'time-based' as const,
    targetSegment: 'New signups',
    description: '3-part welcome series with tips and encouragement'
  },
  {
    id: 'upload-reminder',
    name: 'Upload Reminder',
    type: 'email' as const,
    trigger: 'behavior-based' as const,
    targetSegment: 'No upload after 24h',
    description: 'Gentle reminder to upload first conversation'
  },
  {
    id: 'trial-ending',
    name: 'Trial Ending Soon',
    type: 'in-app' as const,
    trigger: 'time-based' as const,
    targetSegment: 'Trial day 12+',
    description: 'Encourage subscription before trial ends'
  },
  {
    id: 'churn-prevention',
    name: 'Win-Back Campaign',
    type: 'email' as const,
    trigger: 'churn-risk' as const,
    targetSegment: 'High churn risk',
    description: 'Special offers for users at risk of churning'
  },
  {
    id: 'milestone-celebration',
    name: 'Milestone Rewards',
    type: 'in-app' as const,
    trigger: 'milestone' as const,
    targetSegment: 'Active users',
    description: 'Celebrate usage milestones with rewards'
  }
];

export function ConversionOptimizationSystem() {
  const [metrics, setMetrics] = useState<UserBehaviorMetrics[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<RetentionCampaign>>({});
  const [newTest, setNewTest] = useState<Partial<ABTest>>({});

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    try {
      const [metricsRes, funnelRes, campaignsRes, testsRes] = await Promise.all([
        fetch(`/api/analytics/user-behavior?timeframe=${selectedTimeframe}`),
        fetch(`/api/analytics/conversion-funnel?timeframe=${selectedTimeframe}`),
        fetch(`/api/analytics/retention-campaigns`),
        fetch(`/api/analytics/ab-tests`)
      ]);

      const [metricsData, funnelData, campaignsData, testsData] = await Promise.all([
        metricsRes.json(),
        funnelRes.json(),
        campaignsRes.json(),
        testsRes.json()
      ]);

      setMetrics(metricsData.metrics || []);
      setConversionFunnel(funnelData.funnel || []);
      setCampaigns(campaignsData.campaigns || []);
      setAbTests(testsData.tests || []);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type) return;

    try {
      const response = await fetch('/api/analytics/retention-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });

      if (response.ok) {
        setShowCampaignModal(false);
        setNewCampaign({});
        loadAnalyticsData();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const toggleCampaign = async (campaignId: string, isActive: boolean) => {
    try {
      await fetch(`/api/analytics/retention-campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      loadAnalyticsData();
    } catch (error) {
      console.error('Failed to toggle campaign:', error);
    }
  };

  const startABTest = async (testId: string) => {
    try {
      await fetch(`/api/analytics/ab-tests/${testId}/start`, {
        method: 'POST'
      });
      loadAnalyticsData();
    } catch (error) {
      console.error('Failed to start A/B test:', error);
    }
  };

  // Calculate key metrics
  const totalUsers = metrics.length;
  const activeUsers = metrics.filter(m => 
    new Date(m.lastActiveDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const conversionRate = metrics.filter(m => m.conversionProbability > 0.7).length / totalUsers * 100;
  const churnRisk = metrics.filter(m => m.churnRisk === 'high').length;
  const averageEngagement = metrics.reduce((acc, m) => acc + m.engagementScore, 0) / totalUsers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Conversion & Retention Analytics
          </h2>
          <p className="text-gray-600">Optimize user journey and prevent churn</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={() => setShowCampaignModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => setShowTestModal(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            A/B Test
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                <div className="text-sm text-gray-600">Active (7d)</div>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{churnRisk}</div>
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
                <div className="text-2xl font-bold text-yellow-600">{averageEngagement.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <Heart className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-600" />
              Conversion Funnel Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CONVERSION_FUNNEL_STAGES.map((stage, index) => {
                const funnelData = conversionFunnel.find(f => f.stage === stage.stage);
                const count = funnelData?.count || 0;
                const rate = funnelData?.conversionRate || 0;
                const expected = stage.expectedConversion;
                const performance = rate >= expected ? 'good' : rate >= expected * 0.8 ? 'warning' : 'poor';
                
                return (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          performance === 'good' ? 'bg-green-500' : 
                          performance === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{stage.stage}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{count.toLocaleString()}</div>
                        <div className={`text-sm ${
                          performance === 'good' ? 'text-green-600' : 
                          performance === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {rate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={rate} 
                      className={`h-2 ${
                        performance === 'good' ? 'bg-green-100' : 
                        performance === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`} 
                    />
                    
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {stage.keyActions.map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>

                    {index < CONVERSION_FUNNEL_STAGES.length - 1 && (
                      <div className="absolute left-3 top-full w-0.5 h-4 bg-gray-200"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Retention Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Retention Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{campaign.name}</span>
                        <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                          {campaign.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Target: {campaign.targetSegment}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={campaign.isActive ? 'outline' : 'default'}
                      onClick={() => toggleCampaign(campaign.id, !campaign.isActive)}
                    >
                      {campaign.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{campaign.sentCount?.toLocaleString() || 0}</div>
                      <div className="text-gray-500">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{(campaign.openRate * 100)?.toFixed(1) || 0}%</div>
                      <div className="text-gray-500">Opened</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{(campaign.clickRate * 100)?.toFixed(1) || 0}%</div>
                      <div className="text-gray-500">Clicked</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{(campaign.conversionRate * 100)?.toFixed(1) || 0}%</div>
                      <div className="text-gray-500">Converted</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            A/B Tests & Experiments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abTests.map(test => (
              <div key={test.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{test.name}</span>
                      <Badge variant={
                        test.status === 'running' ? 'default' : 
                        test.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {test.status}
                      </Badge>
                      {test.winningVariant && (
                        <Badge className="bg-green-100 text-green-800">
                          Winner: {test.winningVariant}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {test.startDate} {test.endDate && `- ${test.endDate}`}
                    </div>
                  </div>

                  {test.status === 'draft' && (
                    <Button size="sm" onClick={() => startABTest(test.id)}>
                      <Play className="w-4 h-4 mr-1" />
                      Start Test
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {test.variants.map((variant, index) => (
                    <div key={variant.name} className={`p-3 border rounded-lg ${
                      test.winningVariant === variant.name ? 'border-green-400 bg-green-50' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{variant.name}</span>
                        {test.winningVariant === variant.name && (
                          <Star className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Traffic: {variant.traffic}%</div>
                        <div>Conversions: {variant.conversions}</div>
                        <div className="font-medium">Rate: {(variant.conversionRate * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {test.significance && (
                  <div className="mt-3 text-sm text-gray-600">
                    Statistical significance: {(test.significance * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Segments & Churn Risk */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Segments by Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { segment: 'Champions', score: '9-10', count: metrics.filter(m => m.engagementScore >= 9).length, color: 'bg-green-500' },
                { segment: 'Loyal Users', score: '7-8', count: metrics.filter(m => m.engagementScore >= 7 && m.engagementScore < 9).length, color: 'bg-blue-500' },
                { segment: 'Potential', score: '5-6', count: metrics.filter(m => m.engagementScore >= 5 && m.engagementScore < 7).length, color: 'bg-yellow-500' },
                { segment: 'At Risk', score: '3-4', count: metrics.filter(m => m.engagementScore >= 3 && m.engagementScore < 5).length, color: 'bg-orange-500' },
                { segment: 'Churning', score: '0-2', count: metrics.filter(m => m.engagementScore < 3).length, color: 'bg-red-500' }
              ].map(segment => (
                <div key={segment.segment} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${segment.color}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{segment.segment}</span>
                      <span className="text-sm text-gray-600">{segment.count} users</span>
                    </div>
                    <div className="text-xs text-gray-500">Score: {segment.score}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {((segment.count / totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { risk: 'Low Risk', count: metrics.filter(m => m.churnRisk === 'low').length, color: 'text-green-600', bg: 'bg-green-100' },
                { risk: 'Medium Risk', count: metrics.filter(m => m.churnRisk === 'medium').length, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { risk: 'High Risk', count: metrics.filter(m => m.churnRisk === 'high').length, color: 'text-red-600', bg: 'bg-red-100' }
              ].map(item => (
                <div key={item.risk} className={`p-4 ${item.bg} rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${item.color}`}>{item.risk}</span>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
                      <div className="text-sm text-gray-600">
                        {((item.count / totalUsers) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Recommended Actions</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Send personalized re-engagement emails to high-risk users</li>
                <li>• Offer extended trial or discount to medium-risk users</li>
                <li>• Celebrate milestones with low-risk users to maintain loyalty</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Retention Campaign</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <Input
                value={newCampaign.name || ''}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="Welcome Series, Trial Reminder, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type</label>
              <select
                value={newCampaign.type || ''}
                onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select type...</option>
                <option value="email">Email</option>
                <option value="in-app">In-App Notification</option>
                <option value="push">Push Notification</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Target Segment</label>
              <Input
                value={newCampaign.targetSegment || ''}
                onChange={(e) => setNewCampaign({...newCampaign, targetSegment: e.target.value})}
                placeholder="New users, Trial users, etc."
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
                Cancel
              </Button>
              <Button onClick={createCampaign} disabled={!newCampaign.name || !newCampaign.type}>
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
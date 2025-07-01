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
  Crown, 
  CreditCard, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Settings,
  Zap,
  Shield,
  Users,
  MessageCircle,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard-nav';

interface SubscriptionData {
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    conversations: number;
    conversationsLimit: number;
    sessions: number;
    sessionsLimit: number;
    memoryCards: number;
    memoryCardsLimit: number;
  };
  billingHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    description: string;
  }>;
  upcomingInvoice?: {
    amount: number;
    currency: string;
    date: string;
  };
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 conversations per month',
      '3 active chat sessions',
      'Basic memory timeline',
      'Standard support'
    ],
    limitations: [
      'Limited conversation history',
      'No advanced analytics',
      'No priority support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited conversations',
      'Unlimited chat sessions',
      'Advanced analytics dashboard',
      'Memory timeline & milestones',
      'Birthday notifications',
      'Priority support',
      'Export conversations',
      'Advanced AI features'
    ],
    limitations: []
  }
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadSubscriptionData();
    }
  }, [status, router]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RfyijRA0wc6of2Oy41KKmIT', // This should match your Stripe price ID
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch('/api/dashboard/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/dashboard/subscription/reactivate', {
        method: 'POST',
      });

      if (response.ok) {
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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
          <p className="text-gray-600">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscriptionData?.currentPlan;
  const usage = subscriptionData?.usage;
  const isPremium = currentPlan?.name === 'Premium';
  const isCanceled = currentPlan?.cancelAtPeriodEnd;

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
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Subscription</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isPremium && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-xl text-gray-600">
            Manage your Talkers subscription and billing
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {!subscriptionData ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading subscription data...</p>
          </div>
        ) : (
          <>
            {/* Current Plan */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-600" />
                      Current Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {currentPlan?.name || 'Free'} Plan
                        </h3>
                        <p className="text-gray-600">
                          {currentPlan?.price ? formatCurrency(currentPlan.price, 'usd') : 'Free'} per {currentPlan?.interval || 'month'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={currentPlan?.status === 'active' ? 'default' : 'secondary'}
                          className={currentPlan?.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {currentPlan?.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        {isCanceled && (
                          <p className="text-sm text-orange-600 mt-1">Cancels on {formatDate(currentPlan?.currentPeriodEnd || '')}</p>
                        )}
                      </div>
                    </div>

                    {currentPlan?.currentPeriodEnd && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Next billing date</span>
                        </div>
                        <p className="text-blue-700">{formatDate(currentPlan.currentPeriodEnd)}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {!isPremium ? (
                        <Button 
                          onClick={handleUpgrade}
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Crown className="w-4 h-4 mr-2" />
                          )}
                          Upgrade to Premium
                        </Button>
                      ) : (
                        <>
                          {isCanceled ? (
                            <Button 
                              onClick={handleReactivateSubscription}
                              disabled={isUpdating}
                              variant="outline"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              Reactivate Subscription
                            </Button>
                          ) : (
                            <Button 
                              onClick={handleCancelSubscription}
                              disabled={isUpdating}
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              Cancel Subscription
                            </Button>
                          )}
                          <Link href="/pricing">
                            <Button variant="outline">
                              Change Plan
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Stats */}
              <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Usage This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Conversations</span>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.conversations || 0} / {usage?.conversationsLimit || 5}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage?.conversations || 0, usage?.conversationsLimit || 5)} 
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Chat Sessions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.sessions || 0} / {usage?.sessionsLimit || 3}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage?.sessions || 0, usage?.sessionsLimit || 3)} 
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Memory Cards</span>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.memoryCards || 0} / {usage?.memoryCardsLimit || 10}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage?.memoryCards || 0, usage?.memoryCardsLimit || 10)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Comparison */}
            {/* <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Plan Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`p-6 rounded-lg border-2 ${
                      plan.id === (currentPlan?.name?.toLowerCase() || 'free') 
                        ? 'border-purple-200 bg-purple-50' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        </div>
                        <p className="text-gray-600">per month</p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-gray-900">Features:</h4>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {plan.limitations.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h4 className="font-semibold text-gray-900">Limitations:</h4>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {plan.id !== (currentPlan?.name?.toLowerCase() || 'free') && (
                        <Button 
                          onClick={plan.id === 'premium' ? handleUpgrade : undefined}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {plan.id === 'premium' ? 'Upgrade Now' : 'Downgrade'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Billing History */}
            {subscriptionData?.billingHistory && subscriptionData.billingHistory.length > 0 && (
              <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionData.billingHistory.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.description}</p>
                            <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Section */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Get help with your subscription or billing questions
                    </p>
                    <Button variant="outline" size="sm">
                      Contact Us
                    </Button>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Download your conversations and memories
                    </p>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Share your thoughts and suggestions with us
                    </p>
                    <Button variant="outline" size="sm">
                      Send Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
} 
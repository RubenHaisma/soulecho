'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Sparkles, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import Script from 'next/script';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PricingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<{ currentPeriodEnd?: string } | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubscribe = async (priceId: string) => {
    if (!session?.user?.id) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsLoading(priceId);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleUpgrade = async () => {
    if (!session?.user?.id) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch('/api/upgrade-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      const { newPlan } = await response.json();
      setIsPremium(true);
      setCurrentPlan(newPlan);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.user?.id) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      const { canceled } = await response.json();
      setIsCanceled(canceled);
      setIsPremium(false);
      setCurrentPlan(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!session?.user?.id) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      const { reactivated } = await response.json();
      setIsCanceled(false);
      setIsPremium(reactivated);
      setCurrentPlan(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const plans = [
    {
      name: 'Free Forever',
      price: '$0',
      period: 'always',
      description: 'Keep your conversations safe forever',
      features: [
        'Upload unlimited conversations',
        'View all your memories',
        'Search through conversations',
        'Basic memory organization',
        'Forever free access'
      ],
      limitations: [
        'No AI chat responses',
        'View-only conversations',
        'Basic search only'
      ],
      buttonText: 'Start Free',
      buttonVariant: 'outline' as const,
      popular: false,
      priceId: null
    },
    {
      name: 'Starter',
      price: '$4.99',
      period: 'month',
      description: 'Chat with your memories occasionally',
      features: [
        'Everything in Free',
        '50 AI conversations per month',
        'Smart conversation suggestions',
        'Memory timeline',
        'Email support'
      ],
      limitations: [
        '50 messages limit per month',
        'Basic AI responses only'
      ],
      buttonText: 'Try Starter',
      buttonVariant: 'outline' as const,
      popular: false,
      priceId: 'price_starter_monthly'
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      description: 'Unlimited conversations with your loved ones',
      features: [
        'Everything in Starter',
        'Unlimited AI conversations',
        'Advanced personality matching',
        'Memory cards & reflections',
        'Birthday notifications',
        'Priority support',
        'Export conversations',
        'Advanced analytics',
        'Family sharing (up to 3 people)'
      ],
      limitations: [],
      buttonText: 'Go Premium',
      buttonVariant: 'default' as const,
      popular: true,
      priceId: 'price_1RfyijRA0wc6of2Oy41KKmIT'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                <div className="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
              Talkers
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-6">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Choose Your Plan</span>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Deepen Your
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sacred Connection
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that best honors your journey of remembrance and connection
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-md ring-2 ring-purple-200' 
                  : 'bg-white/60 backdrop-blur-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  plan.name === 'Free' 
                    ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                    : plan.name === 'Premium'
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                }`}>
                  {plan.name === 'Free' ? (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    </div>
                  ) : plan.name === 'Premium' ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <Zap className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  disabled={!plan.priceId || isLoading === plan.priceId}
                  variant={plan.buttonVariant}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.buttonVariant === 'default'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700'
                  }`}
                >
                  {isLoading === plan.priceId ? 'Processing...' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  What's included in the free plan?
                </h4>
                <p className="text-gray-600">
                  The free plan lets you upload and view all your conversations forever. 
                  It's like a digital scrapbook of your memories. To chat with AI versions 
                  of your loved ones, you'll need the Starter or Premium plan.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I try AI conversations before paying?
                </h4>
                <p className="text-gray-600">
                  Yes! We offer a 7-day free trial of our Starter plan, so you can try 
                  AI conversations risk-free. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I cancel my subscription anytime?
                </h4>
                <p className="text-gray-600">
                  Yes, you can cancel your Premium subscription at any time. Your conversations 
                  will remain accessible until the end of your billing period. We never hold 
                  your memories hostage.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Is my data secure and private?
                </h4>
                <p className="text-gray-600">
                  Absolutely. All conversations are encrypted and stored securely. We use industry-standard 
                  security practices and never share or sell your personal data. Your memories are yours alone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express) through 
                  our secure Stripe payment processing. Your payment information is never stored 
                  on our servers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Subscription Status
          </h3>
          
          <div className="space-y-6">
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Current Plan
                </h4>
                <p className="text-gray-600">{isPremium ? 'Premium' : 'Free Trial'}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Subscription End Date
                </h4>
                <p className="text-blue-700">{formatDate(currentPlan?.currentPeriodEnd)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
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
            ) :
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
            }
          </div>
        </div>
      </div>
    </div>
  );
}
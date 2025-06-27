'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
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

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying EchoSoul',
      features: [
        '3 active conversations',
        '100 messages per conversation',
        'Basic AI responses',
        'Standard support',
        '24-hour data retention'
      ],
      limitations: [
        'Limited conversation history',
        'Basic response quality'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const,
      popular: false,
      priceId: null
    },
    {
      name: 'Premium',
      price: '$19',
      period: 'month',
      description: 'Unlimited sacred conversations',
      features: [
        'Unlimited conversations',
        'Unlimited messages',
        'Advanced AI with memory',
        'Priority support',
        'Extended data retention',
        'Voice message responses',
        'Export conversations',
        'Advanced privacy controls'
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      buttonVariant: 'default' as const,
      popular: true,
      priceId: 'price_premium_monthly'
    },
    {
      name: 'Lifetime',
      price: '$199',
      period: 'once',
      description: 'Forever access to all features',
      features: [
        'Everything in Premium',
        'Lifetime access',
        'No monthly fees',
        'Future feature updates',
        'Premium support for life',
        'Early access to new features'
      ],
      limitations: [],
      buttonText: 'Get Lifetime Access',
      buttonVariant: 'default' as const,
      popular: false,
      priceId: 'price_lifetime'
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
              EchoSoul
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
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                  How does the free plan work?
                </h4>
                <p className="text-gray-600">
                  The free plan allows you to create up to 3 conversations with 100 messages each. 
                  Perfect for trying EchoSoul and experiencing the magic of reconnection.
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
                  will remain accessible until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h4>
                <p className="text-gray-600">
                  Absolutely. All conversations are encrypted and automatically deleted according 
                  to your plan's retention policy. We never share or sell your personal data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
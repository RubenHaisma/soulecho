'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Crown, 
  MessageCircle, 
  Clock, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ConversationBlockerProps {
  reason: 'trial_expired' | 'conversation_limit' | 'subscription_required';
  trialEndDate?: string;
  conversationsUsed?: number;
  conversationLimit?: number;
  className?: string;
}

export const ConversationBlocker: React.FC<ConversationBlockerProps> = ({
  reason,
  trialEndDate,
  conversationsUsed = 0,
  conversationLimit = 1,
  className = ''
}) => {
  const [timeExpired, setTimeExpired] = useState<string>('');

  useEffect(() => {
    if (trialEndDate && reason === 'trial_expired') {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        setTimeExpired(`${diffInHours} hours ago`);
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        setTimeExpired(`${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`);
      }
    }
  }, [trialEndDate, reason]);

  const getContent = () => {
    switch (reason) {
      case 'trial_expired':
        return {
          icon: Clock,
          title: 'Your Trial Has Ended',
          description: `Your 3-day trial expired ${timeExpired}. Upgrade to Premium to continue your meaningful conversations.`,
          color: 'red',
          features: [
            'Unlimited conversations with all your loved ones',
            'Advanced AI with longer, more detailed responses',
            'Memory timeline and milestone tracking',
            'Birthday notifications and memory cards',
            'Priority support and new features'
          ]
        };
      
      case 'conversation_limit':
        return {
          icon: MessageCircle,
          title: 'Trial Conversation Limit Reached',
          description: `You've used ${conversationsUsed}/${conversationLimit} trial conversations. Upgrade to Premium for unlimited access.`,
          color: 'orange',
          features: [
            'Unlimited conversations during your trial',
            'Full access to all premium features',
            'No restrictions on message length or frequency',
            'Advanced memory and context features',
            'Cancel anytime with full data export'
          ]
        };
      
      default:
        return {
          icon: Lock,
          title: 'Premium Feature',
          description: 'This feature requires a Premium subscription to access.',
          color: 'purple',
          features: [
            'Access to all conversation features',
            'Advanced AI capabilities',
            'Memory preservation tools',
            'Priority customer support',
            'Regular feature updates'
          ]
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className={`border-0 shadow-2xl ${
          content.color === 'red' ? 'bg-gradient-to-br from-red-50 to-orange-50' :
          content.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-yellow-50' :
          'bg-gradient-to-br from-purple-50 to-blue-50'
        }`}>
          <CardHeader className="text-center pb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              content.color === 'red' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              content.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
              'bg-gradient-to-r from-purple-500 to-blue-500'
            }`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {content.title}
            </CardTitle>
            <p className="text-gray-600 text-lg leading-relaxed">
              {content.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Premium Features */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                What You Get with Premium
              </h3>
              <div className="space-y-3">
                {content.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">$12</div>
                <div className="text-gray-600">per month</div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <p className="text-center text-gray-600 text-sm mb-6">
                Cancel anytime • 30-day money-back guarantee • Your data is always yours
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/pricing" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <span>🔒 Secure & Private</span>
                <span>💳 Cancel Anytime</span>
                <span>📞 24/7 Support</span>
              </div>
              <p className="text-xs text-gray-500">
                Join thousands of families preserving their precious memories with Talkers
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
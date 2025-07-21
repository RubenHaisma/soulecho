'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Clock, 
  MessageCircle, 
  Heart, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TrialExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialEndDate?: string;
  conversationsUsed?: number;
}

export const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({
  isOpen,
  onClose,
  trialEndDate,
  conversationsUsed = 0
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!trialEndDate) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [trialEndDate]);

  const features = [
    {
      icon: MessageCircle,
      title: 'Unlimited Conversations',
      description: 'Chat with all your loved ones without limits'
    },
    {
      icon: Heart,
      title: 'Advanced Memory Features',
      description: 'Memory timeline, birthday notifications, and more'
    },
    {
      icon: Sparkles,
      title: 'Premium AI Quality',
      description: 'Longer, more detailed responses with deeper context'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Your Trial is Ending Soon
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Continue your journey with unlimited access
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Countdown Timer */}
          {timeLeft && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
            >
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Remaining</h3>
              <div className="flex items-center justify-center gap-4 text-2xl font-bold text-orange-600">
                <div className="text-center">
                  <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-normal">Hours</div>
                </div>
                <div>:</div>
                <div className="text-center">
                  <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-normal">Minutes</div>
                </div>
                <div>:</div>
                <div className="text-center">
                  <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-normal">Seconds</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trial Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Your Trial Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{conversationsUsed}</div>
                <div className="text-sm text-blue-700">Conversations Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-blue-700">Days of Full Access</div>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Continue with Premium Features
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$12</div>
                <div className="text-gray-600">per month</div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <p className="text-gray-700 text-sm mb-6">
                Cancel anytime. Your conversations are always preserved.
              </p>
              
              <div className="space-y-3">
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={onClose} className="w-full">
                  Continue with Limited Access
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee */}
          <div className="text-center text-sm text-gray-600">
            <p>💝 30-day money-back guarantee • 🔒 Cancel anytime • 📞 24/7 support</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
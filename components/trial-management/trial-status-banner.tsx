'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Crown, 
  AlertTriangle, 
  Sparkles, 
  X,
  Zap,
  MessageCircle,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface TrialStatus {
  isActive: boolean;
  daysLeft: number;
  totalDays: number;
  conversationsUsed: number;
  conversationLimit: number;
  qualityLevel: number;
  planType: 'trial' | 'premium' | 'expired';
  degradationMessage?: string;
}

interface TrialStatusBannerProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({ 
  className = '', 
  onDismiss,
  showDismiss = false 
}) => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchTrialStatus();
    
    // Refresh trial status every minute
    const interval = setInterval(fetchTrialStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getStatusColor = () => {
    if (!trialStatus) return 'blue';
    if (trialStatus.planType === 'premium') return 'green';
    if (trialStatus.planType === 'expired') return 'red';
    if (trialStatus.daysLeft <= 1) return 'orange';
    return 'blue';
  };

  const getStatusIcon = () => {
    if (!trialStatus) return Clock;
    if (trialStatus.planType === 'premium') return Crown;
    if (trialStatus.planType === 'expired') return AlertTriangle;
    if (trialStatus.daysLeft <= 1) return Clock;
    return Sparkles;
  };

  const getQualityColor = () => {
    if (!trialStatus) return 'text-gray-500';
    if (trialStatus.qualityLevel >= 90) return 'text-green-600';
    if (trialStatus.qualityLevel >= 70) return 'text-blue-600';
    if (trialStatus.qualityLevel >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQualityLabel = () => {
    if (!trialStatus) return 'Loading...';
    if (trialStatus.qualityLevel >= 90) return 'Full Experience';
    if (trialStatus.qualityLevel >= 70) return 'Enhanced';
    if (trialStatus.qualityLevel >= 50) return 'Standard';
    return 'Basic';
  };

  if (isLoading || !trialStatus || isDismissed) {
    return null;
  }

  // Don't show banner for premium users unless they want to see it
  if (trialStatus.planType === 'premium' && !showDismiss) {
    return null;
  }

  const statusColor = getStatusColor();
  const StatusIcon = getStatusIcon();
  const progressPercentage = trialStatus.isActive 
    ? ((trialStatus.totalDays - trialStatus.daysLeft) / trialStatus.totalDays) * 100
    : 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <Card className={`border-0 shadow-lg ${
          statusColor === 'red' ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' :
          statusColor === 'orange' ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' :
          statusColor === 'green' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
          'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
        }`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  statusColor === 'red' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  statusColor === 'orange' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                  statusColor === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>

                {/* Status Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${
                      statusColor === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                      statusColor === 'orange' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      statusColor === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {trialStatus.planType === 'premium' ? 'Premium Active' :
                       trialStatus.planType === 'expired' ? 'Trial Expired' :
                       `${trialStatus.daysLeft} Day${trialStatus.daysLeft !== 1 ? 's' : ''} Left`}
                    </Badge>
                    
                    {trialStatus.planType === 'trial' && (
                      <div className="flex items-center gap-1">
                        <Zap className={`w-4 h-4 ${getQualityColor()}`} />
                        <span className={`text-sm font-medium ${getQualityColor()}`}>
                          {getQualityLabel()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {trialStatus.planType === 'premium' ? (
                      <p className="text-green-800 font-medium">
                        Unlimited conversations and full access to all features
                      </p>
                    ) : trialStatus.planType === 'expired' ? (
                      <p className="text-red-800 font-medium">
                        Your trial has ended. Upgrade to continue your conversations.
                      </p>
                    ) : (
                      <>
                        <p className={`font-medium ${
                          statusColor === 'orange' ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {trialStatus.conversationsUsed}/{trialStatus.conversationLimit} conversations used
                          {trialStatus.daysLeft <= 1 && ' • Trial ending soon!'}
                        </p>
                        
                        {trialStatus.isActive && (
                          <div className="space-y-1">
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Trial Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Degradation Message */}
                    {trialStatus.degradationMessage && (
                      <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg border border-orange-200">
                        <TrendingDown className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-orange-800 text-sm">{trialStatus.degradationMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-4">
                {trialStatus.planType !== 'premium' && (
                  <Link href="/pricing">
                    <Button className={`${
                      statusColor === 'red' ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' :
                      'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    } text-white`}>
                      <Crown className="w-4 h-4 mr-2" />
                      {trialStatus.planType === 'expired' ? 'Upgrade Now' : 'Upgrade to Premium'}
                    </Button>
                  </Link>
                )}

                {showDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Usage Stats for Trial Users */}
            {trialStatus.planType === 'trial' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{trialStatus.conversationsUsed}</div>
                    <div className="text-xs text-gray-600">Conversations</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${getQualityColor()}`}>{trialStatus.qualityLevel}%</div>
                    <div className="text-xs text-gray-600">Quality Level</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{trialStatus.daysLeft}</div>
                    <div className="text-xs text-gray-600">Days Left</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
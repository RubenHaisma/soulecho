'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Sparkles, 
  Crown, 
  MessageSquare, 
  Brain, 
  Heart,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface TrialExperienceSummaryProps {
  trialProgress: number; // 0-1
  qualityLevel: number; // 0-100
  daysLeft: number;
  conversationsUsed: number;
  isTrialActive: boolean;
}

export function TrialExperienceSummary({ 
  trialProgress, 
  qualityLevel, 
  daysLeft, 
  conversationsUsed,
  isTrialActive 
}: TrialExperienceSummaryProps) {
  
  const getExperienceLevel = () => {
    if (qualityLevel >= 90) return 'Full Experience';
    if (qualityLevel >= 70) return 'Enhanced Experience';
    if (qualityLevel >= 50) return 'Standard Experience';
    return 'Basic Experience';
  };

  const getExperienceColor = () => {
    if (qualityLevel >= 90) return 'from-green-500 to-emerald-500';
    if (qualityLevel >= 70) return 'from-blue-500 to-cyan-500';
    if (qualityLevel >= 50) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-pink-500';
  };

  const experienceFeatures = [
    {
      name: 'Response Length',
      current: qualityLevel >= 90 ? 'Long & Detailed' : qualityLevel >= 70 ? 'Moderate' : qualityLevel >= 50 ? 'Concise' : 'Brief',
      premium: 'Unlimited Length'
    },
    {
      name: 'Memory Depth',
      current: qualityLevel >= 90 ? '30 memories' : qualityLevel >= 70 ? '20 memories' : qualityLevel >= 50 ? '10 memories' : '5 memories',
      premium: '50+ memories'
    },
    {
      name: 'Context Window',
      current: qualityLevel >= 90 ? '8000 chars' : qualityLevel >= 70 ? '5000 chars' : qualityLevel >= 50 ? '3000 chars' : '1500 chars',
      premium: '10000+ chars'
    },
    {
      name: 'Emotional Depth',
      current: qualityLevel >= 90 ? 'Rich & Nuanced' : qualityLevel >= 70 ? 'Good' : qualityLevel >= 50 ? 'Basic' : 'Simple',
      premium: 'Deeply Personal'
    }
  ];

  if (!isTrialActive) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Trial Expired</h3>
              <p className="text-gray-600 mb-4">
                Your 3-day trial has ended. Upgrade to Premium to continue your journey with Talkers.
              </p>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-r ${getExperienceColor()} rounded-full flex items-center justify-center`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Trial Experience Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
            <div className="text-sm text-gray-600">Days Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{conversationsUsed}/1</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{qualityLevel}%</div>
            <div className="text-sm text-gray-600">Quality Level</div>
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Experience Level</span>
            <Badge className={`bg-gradient-to-r ${getExperienceColor()} text-white`}>
              {getExperienceLevel()}
            </Badge>
          </div>
          <Progress value={qualityLevel} className="h-3" />
          <p className="text-xs text-gray-600">
            As your trial progresses, the experience gradually adapts to encourage upgrading to Premium.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            What You're Experiencing
          </h4>
          
          <div className="space-y-3">
            {experienceFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-600">Current: {feature.current}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <span>Premium: {feature.premium}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Degradation Explanation */}
        {/* <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mt-0.5">
              <TrendingDown className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 mb-1">Smart Experience Adaptation</h5>
              <p className="text-sm text-gray-700 mb-3">
                Talkers gradually adapts your experience over the 3-day trial. You start with the full 
                experience and it slowly becomes more concise, encouraging you to upgrade for unlimited access.
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Day 1: Full experience with rich, detailed responses</div>
                <div>• Day 2: Good experience with moderate detail</div>
                <div>• Day 3: Basic experience with concise responses</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Upgrade CTA */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Want the full Talkers experience with unlimited conversations?
          </p>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $12/month
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 
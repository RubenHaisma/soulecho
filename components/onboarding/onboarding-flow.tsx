'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  MessageCircle, 
  Heart, 
  Settings,
  Sparkles,
  Play,
  Users,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
  className?: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, className = '' }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({
    hasUploadedFile: false,
    hasCreatedSession: false,
    hasStartedChat: false,
    hasExploredFeatures: false,
    onboardingCompleted: false
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Talkers',
      description: 'Let\'s create your first interactive memory',
      icon: Heart,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Hi {session?.user?.name?.split(' ')[0] || 'there'}! 👋
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
              In just 2 simple steps, you'll be chatting with your loved one's memory.
              Let's start by uploading a conversation.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">✓ Free Trial - No Credit Card Required</span>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Try unlimited conversations for 14 days
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'upload-guide',
      title: 'Upload Your Conversation',
      description: 'This takes less than 2 minutes',
      icon: Upload,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your WhatsApp Chat</h3>
            <p className="text-gray-600">Export your chat from WhatsApp and upload it here. We'll handle the rest!</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📱 On iPhone:</h4>
                <p className="text-sm text-gray-700">Chat → Contact Name → Export Chat → Without Media</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🤖 On Android:</h4>
                <p className="text-sm text-gray-700">Chat → ⋮ Menu → More → Export Chat → Without Media</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => router.push('/upload')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload My Conversation
            </Button>
            <p className="text-xs text-gray-500 mt-2">Your data is private and secure</p>
          </div>
          
          {userProgress.hasUploadedFile && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Perfect! Your conversation is ready</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 hover:bg-green-700 mt-3"
              >
                Start Chatting Now →
              </Button>
            </div>
          )}
        </div>
      ),
      action: {
        label: 'Upload Conversation',
        href: '/upload'
      }
    }
  ];

  // Check user progress
  useEffect(() => {
    checkUserProgress();
  }, []);

  useEffect(() => {
    if (userProgress.onboardingCompleted) {
      onComplete();
    }
  }, [userProgress.onboardingCompleted]);

  const checkUserProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/progress');
      if (response.ok) {
        const data = await response.json();
        setUserProgress(data.progress);
        
        // Auto-advance based on progress
        if (data.progress.hasUploadedFile && currentStep < 4) {
          setCompletedSteps(prev => new Set([...Array.from(prev), 3]));
        }
        if (data.progress.hasStartedChat && currentStep < 5) {
          setCompletedSteps(prev => new Set([...Array.from(prev), 4]));
        }
      }
    } catch (error) {
      console.error('Failed to check user progress:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
              Talkers
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h2>
          <p className="text-gray-600">Let&apos;s set up your account and create your first conversation</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max px-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isAccessible = index <= currentStep || isCompleted;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                      ${isCurrent 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110' 
                        : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isAccessible
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <currentStepData.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {currentStepData.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">{currentStepData.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {currentStepData.content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                {isLoading ? 'Completing...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip onboarding and go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
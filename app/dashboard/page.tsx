'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      checkOnboardingStatus();
    }
  }, [status, router]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has completed onboarding
      const response = await fetch('/api/onboarding/progress');
      if (response.ok) {
        const data = await response.json();
        
        // Show onboarding if user hasn't completed onboarding
        const needsOnboarding = !data.progress.onboardingCompleted;
        setShowOnboarding(needsOnboarding);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // Default to showing dashboard if check fails
      setShowOnboarding(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (status === 'loading' || isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding flow for new users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show enhanced dashboard for existing users
  return <EnhancedDashboard />;
}
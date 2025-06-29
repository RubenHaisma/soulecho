'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmailVerifiedPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Email Verified!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-gray-600 text-lg">
                Your email has been successfully verified. Your account is now active!
              </p>
              <p className="text-gray-500 text-sm">
                You can now access all features of Talkers and start preserving your precious memories.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/auth/signin">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Sign In to Continue
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 py-3 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                  <Mail className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Welcome to Talkers - where memories live on forever.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
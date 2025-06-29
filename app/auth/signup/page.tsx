'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log('Signup response status:', response.status);
      console.log('Signup response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Signup success data:', data);
        setSuccess(true);
      } else {
        const data = await response.json();
        console.log('Signup error data:', data);
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Signup catch error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (response.ok) {
        alert('Confirmation email resent! Please check your inbox.');
      } else {
        alert('Failed to resend email. Please try again.');
      }
    } catch (error) {
      alert('Failed to resend email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
              Talkers
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Begin your journey of connection</p>
        </div>

        {/* Success Screen */}
        {success ? (
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-xl text-green-700">Check your email!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-6">
                <Mail className="w-12 h-12 text-green-500 mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">Account created successfully</h3>
                <p className="text-gray-700 text-center max-w-xs">
                  We've sent a confirmation email to <span className="font-medium">{email}</span>.<br />
                  Please check your inbox and click the link to activate your account.
                </p>
                <p className="text-gray-500 text-sm mt-2">Didn&apos;t receive the email? Check your spam folder or <span className="underline cursor-pointer text-purple-600" onClick={handleResendEmail}>resend</span>.</p>
                <Link href="/auth/signin" className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-medium">Go to Sign In</Link>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="bg-white/50 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-white/50 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/50 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/50 border-gray-200 focus:border-purple-400"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
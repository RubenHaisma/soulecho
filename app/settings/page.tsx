'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Calendar, Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard-nav';

interface UserPreferences {
  id: string;
  birthday?: string;
  timezone: string;
  notificationEmail?: string;
  notificationPreferences?: any;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    birthday: '',
    timezone: 'UTC',
    notificationEmail: '',
    enableBirthdayNotifications: true,
    enableMemoryReminders: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadPreferences();
    }
  }, [status, router]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        
        if (data.preferences) {
          setFormData({
            birthday: data.preferences.birthday ? new Date(data.preferences.birthday).toISOString().split('T')[0] : '',
            timezone: data.preferences.timezone || 'UTC',
            notificationEmail: data.preferences.notificationEmail || '',
            enableBirthdayNotifications: data.preferences.notificationPreferences?.birthday ?? true,
            enableMemoryReminders: data.preferences.notificationPreferences?.memories ?? true
          });
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthday: formData.birthday || null,
          timezone: formData.timezone,
          notificationEmail: formData.notificationEmail || null,
          notificationPreferences: {
            birthday: formData.enableBirthdayNotifications,
            memories: formData.enableMemoryReminders
          }
        }),
      });

      if (response.ok) {
        await loadPreferences();
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700">Settings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-xl text-gray-600">
            Customize your Talkers experience
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birthday Settings */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Birthday & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Your Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  placeholder="Select your birthday"
                />
                <p className="text-sm text-gray-600">
                  We&apos;ll create special birthday messages from all your conversations on this day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email (Optional)</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  placeholder="your@email.com"
                />
                <p className="text-sm text-gray-600">
                  Receive email notifications for special memories and reminders
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableBirthdayNotifications"
                    checked={formData.enableBirthdayNotifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableBirthdayNotifications: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enableBirthdayNotifications">Enable birthday notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableMemoryReminders"
                    checked={formData.enableMemoryReminders}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableMemoryReminders: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enableMemoryReminders">Enable memory reminders</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timezone Settings */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Time & Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
                <p className="text-sm text-gray-600">
                  Used for scheduling notifications and displaying times
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Memory Features */}
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Memory Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Memory Timeline</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Create and organize special moments with your loved ones. Add birthdays, anniversaries, and meaningful conversation moments.
                  </p>
                  <Link href="/memories">
                    <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                      <Heart className="w-4 h-4 mr-2" />
                      View Memory Timeline
                    </Button>
                  </Link>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Birthday Notifications</h4>
                  <p className="text-sm text-blue-700">
                    On your birthday, we&apos;ll create special memory cards from all your conversations, bringing messages from your loved ones.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Settings
                </div>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Clock, 
  Heart, 
  Volume2, 
  Eye, 
  Shield,
  Calendar,
  Bell,
  Pause,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryPreferences {
  autoPlayVoiceMessages: boolean;
  showTimestamps: boolean;
  enableMemoryReminders: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'special-dates';
  emotionalIntensityFilter: number; // 1-10 scale
  privacyLevel: 'private' | 'family' | 'friends';
  pauseDuringDifficultDates: boolean;
  gentleTransitions: boolean;
  memoryContextLevel: 'minimal' | 'moderate' | 'detailed';
}

interface MemoryPreferencesProps {
  sessionId: string;
  personName: string;
  preferences: MemoryPreferences;
  onPreferencesChange: (preferences: MemoryPreferences) => void;
  className?: string;
}

const defaultPreferences: MemoryPreferences = {
  autoPlayVoiceMessages: false,
  showTimestamps: true,
  enableMemoryReminders: true,
  reminderFrequency: 'weekly',
  emotionalIntensityFilter: 5,
  privacyLevel: 'private',
  pauseDuringDifficultDates: true,
  gentleTransitions: true,
  memoryContextLevel: 'moderate'
};

export const MemoryPreferences: React.FC<MemoryPreferencesProps> = ({
  sessionId,
  personName,
  preferences = defaultPreferences,
  onPreferencesChange,
  className = ''
}) => {
  const [localPreferences, setLocalPreferences] = useState<MemoryPreferences>(preferences);

  const updatePreference = <K extends keyof MemoryPreferences>(
    key: K,
    value: MemoryPreferences[K]
  ) => {
    const updated = { ...localPreferences, [key]: value };
    setLocalPreferences(updated);
    onPreferencesChange(updated);
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return 'Gentle & Comforting';
    if (value <= 6) return 'Balanced Emotions';
    if (value <= 8) return 'Full Emotional Range';
    return 'All Memories Included';
  };

  const getIntensityDescription = (value: number) => {
    if (value <= 3) return 'Only show the most comforting, peaceful memories';
    if (value <= 6) return 'Mix of comforting memories with some emotional depth';
    if (value <= 8) return 'Include meaningful memories that might bring tears';
    return 'Show all memories, including difficult or intense conversations';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Memory & Interaction Preferences
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Customize how you interact with {personName}'s memories to create the most 
            comfortable and healing experience for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Emotional Intensity Control */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <Label className="font-semibold">Emotional Intensity Level</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Emotional Range</span>
                <Badge variant="secondary" className="text-xs">
                  {getIntensityLabel(localPreferences.emotionalIntensityFilter)}
                </Badge>
              </div>
              <Slider
                value={[localPreferences.emotionalIntensityFilter]}
                onValueChange={(value) => updatePreference('emotionalIntensityFilter', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                {getIntensityDescription(localPreferences.emotionalIntensityFilter)}
              </p>
            </div>
          </div>

          {/* Memory Reminders */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <Label className="font-semibold">Memory Reminders</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-reminders" className="text-sm">
                    Enable gentle memory reminders
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive notifications about special dates and meaningful moments
                  </p>
                </div>
                <Switch
                  id="enable-reminders"
                  checked={localPreferences.enableMemoryReminders}
                  onCheckedChange={(checked) => updatePreference('enableMemoryReminders', checked)}
                />
              </div>

              {localPreferences.enableMemoryReminders && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="ml-4 space-y-3"
                >
                  <Label className="text-sm">Reminder Frequency</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'special-dates', label: 'Special Dates Only' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreference('reminderFrequency', option.value as any)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          localPreferences.reminderFrequency === option.value
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Playback Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              <Label className="font-semibold">Playback & Display</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-voice" className="text-sm">
                    Auto-play voice messages
                  </Label>
                  <p className="text-xs text-gray-500">
                    Automatically play voice messages when viewing conversations
                  </p>
                </div>
                <Switch
                  id="auto-voice"
                  checked={localPreferences.autoPlayVoiceMessages}
                  onCheckedChange={(checked) => updatePreference('autoPlayVoiceMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-timestamps" className="text-sm">
                    Show message timestamps
                  </Label>
                  <p className="text-xs text-gray-500">
                    Display when messages were originally sent
                  </p>
                </div>
                <Switch
                  id="show-timestamps"
                  checked={localPreferences.showTimestamps}
                  onCheckedChange={(checked) => updatePreference('showTimestamps', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gentle-transitions" className="text-sm">
                    Gentle transitions
                  </Label>
                  <p className="text-xs text-gray-500">
                    Smooth, calming animations between memories
                  </p>
                </div>
                <Switch
                  id="gentle-transitions"
                  checked={localPreferences.gentleTransitions}
                  onCheckedChange={(checked) => updatePreference('gentleTransitions', checked)}
                />
              </div>
            </div>
          </div>

          {/* Difficult Dates Protection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <Label className="font-semibold">Emotional Protection</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pause-difficult" className="text-sm">
                  Pause reminders during difficult dates
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically reduce notifications around anniversaries and difficult dates
                </p>
              </div>
              <Switch
                id="pause-difficult"
                checked={localPreferences.pauseDuringDifficultDates}
                onCheckedChange={(checked) => updatePreference('pauseDuringDifficultDates', checked)}
              />
            </div>
          </div>

          {/* Memory Context Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <Label className="font-semibold">Memory Context Detail</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'minimal', label: 'Minimal', desc: 'Just the essentials' },
                { value: 'moderate', label: 'Moderate', desc: 'Balanced detail' },
                { value: 'detailed', label: 'Detailed', desc: 'Rich context' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference('memoryContextLevel', option.value as any)}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    localPreferences.memoryContextLevel === option.value
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <Label className="font-semibold">Privacy Level</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'private', label: 'Private', desc: 'Only you can see' },
                { value: 'family', label: 'Family', desc: 'Share with family' },
                { value: 'friends', label: 'Friends', desc: 'Share with close friends' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference('privacyLevel', option.value as any)}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    localPreferences.privacyLevel === option.value
                      ? 'bg-gray-100 border-gray-300 text-gray-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2">Your Preferences Summary</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Memory intensity: <strong>{getIntensityLabel(localPreferences.emotionalIntensityFilter)}</strong></p>
              <p>• Reminders: <strong>{localPreferences.enableMemoryReminders ? localPreferences.reminderFrequency : 'Disabled'}</strong></p>
              <p>• Context level: <strong className="capitalize">{localPreferences.memoryContextLevel}</strong></p>
              <p>• Privacy: <strong className="capitalize">{localPreferences.privacyLevel}</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
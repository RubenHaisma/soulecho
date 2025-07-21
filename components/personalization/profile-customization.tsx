'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Heart, 
  Star, 
  Flower, 
  Sun, 
  Moon, 
  Camera,
  Edit3,
  Save,
  X,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileCustomization {
  profileImage?: string;
  displayName: string;
  relationshipToUser: string;
  favoriteColor?: string;
  personalityTraits: string[];
  memorialElements: {
    favoriteQuote?: string;
    significantDate?: string;
    specialMemory?: string;
  };
  conversationStyle: {
    formalityLevel: 'casual' | 'formal' | 'mixed';
    humorLevel: 'high' | 'medium' | 'low';
    emotionalExpression: 'open' | 'reserved' | 'balanced';
  };
}

interface ProfileCustomizationProps {
  sessionId: string;
  personName: string;
  onSave: (profile: ProfileCustomization) => void;
  className?: string;
}

const avatarOptions = [
  { id: 'heart', icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'star', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'flower', icon: Flower, color: 'text-pink-500', bg: 'bg-pink-100' },
  { id: 'sun', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: 'moon', icon: Moon, color: 'text-blue-500', bg: 'bg-blue-100' },
];

const colorOptions = [
  { name: 'Warm Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Gentle Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Peaceful Green', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Loving Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Sunny Yellow', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Royal Purple', value: '#8b5cf6', bg: 'bg-violet-500' },
];

const personalityTraits = [
  'Caring', 'Funny', 'Wise', 'Gentle', 'Strong', 'Creative', 
  'Adventurous', 'Peaceful', 'Energetic', 'Thoughtful', 'Brave', 'Kind'
];

export const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({
  sessionId,
  personName,
  onSave,
  className = ''
}) => {
  const [profile, setProfile] = useState<ProfileCustomization>({
    displayName: personName,
    relationshipToUser: '',
    personalityTraits: [],
    memorialElements: {},
    conversationStyle: {
      formalityLevel: 'mixed',
      humorLevel: 'medium',
      emotionalExpression: 'balanced'
    }
  });

  const [selectedAvatar, setSelectedAvatar] = useState<string>('heart');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setProfile(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setUploadedImage(null);
    setProfile(prev => ({ ...prev, profileImage: undefined }));
  };

  const handleTraitToggle = (trait: string) => {
    setProfile(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter(t => t !== trait)
        : [...prev.personalityTraits, trait]
    }));
  };

  const handleSave = () => {
    onSave(profile);
    setIsEditing(false);
  };

  const selectedAvatarOption = avatarOptions.find(option => option.id === selectedAvatar);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Personalize {personName}'s Profile
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Selection */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                {uploadedImage ? (
                  <AvatarImage src={uploadedImage} alt={profile.displayName} />
                ) : (
                  <AvatarFallback className={`${selectedAvatarOption?.bg} ${selectedAvatarOption?.color} text-2xl`}>
                    {selectedAvatarOption && (
                      <selectedAvatarOption.icon className="w-12 h-12" />
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2"
                >
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.div>
              )}
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Choose a Memorial Symbol
                  </Label>
                  <div className="flex justify-center gap-3">
                    {avatarOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAvatarSelect(option.id)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            selectedAvatar === option.id && !uploadedImage
                              ? `${option.bg} ${option.color} ring-2 ring-purple-400`
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Upload a photo or choose a meaningful symbol to represent {personName}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                disabled={!isEditing}
                className="bg-white/50"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship to You</Label>
              <Input
                id="relationship"
                value={profile.relationshipToUser}
                onChange={(e) => setProfile(prev => ({ ...prev, relationshipToUser: e.target.value }))}
                placeholder="e.g., Mother, Best Friend, Spouse"
                disabled={!isEditing}
                className="bg-white/50"
              />
            </div>
          </div>

          {/* Favorite Color */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Their Favorite Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setProfile(prev => ({ ...prev, favoriteColor: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.bg} transition-all hover:scale-110 ${
                      profile.favoriteColor === color.value ? 'ring-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Personality Traits */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How would you describe {personName}?
            </Label>
            <div className="flex flex-wrap gap-2">
              {personalityTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => isEditing && handleTraitToggle(trait)}
                  disabled={!isEditing}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    profile.personalityTraits.includes(trait)
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Memorial Elements */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="favoriteQuote">Their Favorite Quote or Saying</Label>
                <Textarea
                  id="favoriteQuote"
                  value={profile.memorialElements.favoriteQuote || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    memorialElements: { ...prev.memorialElements, favoriteQuote: e.target.value }
                  }))}
                  placeholder="A quote, saying, or phrase they loved..."
                  className="bg-white/50"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="specialMemory">A Special Memory You Shared</Label>
                <Textarea
                  id="specialMemory"
                  value={profile.memorialElements.specialMemory || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    memorialElements: { ...prev.memorialElements, specialMemory: e.target.value }
                  }))}
                  placeholder="Describe a meaningful moment you shared together..."
                  className="bg-white/50"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="significantDate">A Significant Date</Label>
                <Input
                  id="significantDate"
                  type="date"
                  value={profile.memorialElements.significantDate || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    memorialElements: { ...prev.memorialElements, significantDate: e.target.value }
                  }))}
                  className="bg-white/50"
                />
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Profile Preview */}
      {!isEditing && (
        <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Relationship:</span>
                <Badge variant="secondary">{profile.relationshipToUser || 'Not specified'}</Badge>
              </div>
              
              {profile.personalityTraits.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-2">Personality:</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.personalityTraits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.memorialElements.favoriteQuote && (
                <div>
                  <span className="text-gray-600">Favorite Quote:</span>
                  <p className="text-gray-800 italic mt-1">"{profile.memorialElements.favoriteQuote}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
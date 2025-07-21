'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Heart, 
  Flower, 
  Star, 
  Sun, 
  Moon,
  Waves,
  Mountain,
  Leaf,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  icon: React.ComponentType<any>;
  emotional: 'comforting' | 'energizing' | 'peaceful' | 'warm' | 'gentle';
}

interface ConversationThemesProps {
  sessionId: string;
  personName: string;
  selectedTheme?: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
}

const themes: ConversationTheme[] = [
  {
    id: 'warm-embrace',
    name: 'Warm Embrace',
    description: 'Soft oranges and gentle pinks for comfort and warmth',
    colors: {
      primary: '#f97316',
      secondary: '#fb7185', 
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fed7aa 0%, #fecaca 100%)'
    },
    icon: Heart,
    emotional: 'comforting'
  },
  {
    id: 'peaceful-garden',
    name: 'Peaceful Garden',
    description: 'Gentle greens and earth tones for tranquility',
    colors: {
      primary: '#10b981',
      secondary: '#84cc16',
      accent: '#eab308',
      background: 'linear-gradient(135deg, #d1fae5 0%, #ecfccb 100%)'
    },
    icon: Flower,
    emotional: 'peaceful'
  },
  {
    id: 'starlit-memories',
    name: 'Starlit Memories',
    description: 'Deep blues and silver for reflection and remembrance',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'
    },
    icon: Star,
    emotional: 'peaceful'
  },
  {
    id: 'golden-sunshine',
    name: 'Golden Sunshine',
    description: 'Bright yellows and warm golds for joy and energy',
    colors: {
      primary: '#f59e0b',
      secondary: '#eab308',
      accent: '#f97316',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)'
    },
    icon: Sun,
    emotional: 'energizing'
  },
  {
    id: 'moonlit-serenity',
    name: 'Moonlit Serenity',
    description: 'Soft purples and silvers for calm evening conversations',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)'
    },
    icon: Moon,
    emotional: 'gentle'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Calming blues and teals for flowing conversations',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#3b82f6',
      background: 'linear-gradient(135deg, #cffafe 0%, #dbeafe 100%)'
    },
    icon: Waves,
    emotional: 'peaceful'
  },
  {
    id: 'mountain-strength',
    name: 'Mountain Strength',
    description: 'Earthy browns and greens for grounding and stability',
    colors: {
      primary: '#059669',
      secondary: '#65a30d',
      accent: '#d97706',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)'
    },
    icon: Mountain,
    emotional: 'comforting'
  },
  {
    id: 'spring-renewal',
    name: 'Spring Renewal',
    description: 'Fresh greens and soft pinks for hope and new beginnings',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#f472b6',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 100%)'
    },
    icon: Leaf,
    emotional: 'energizing'
  }
];

export const ConversationThemes: React.FC<ConversationThemesProps> = ({
  sessionId,
  personName,
  selectedTheme = 'warm-embrace',
  onThemeChange,
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState(selectedTheme);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
    onThemeChange(themeId);
  };

  const handleThemePreview = (themeId: string | null) => {
    setPreviewTheme(themeId);
  };

  const activeTheme = themes.find(t => t.id === (previewTheme || currentTheme)) || themes[0];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Conversation Themes for {personName}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Choose a visual theme that feels right for your conversations. This affects colors, 
            backgrounds, and the overall mood of your chat interface.
          </p>
        </CardHeader>
        <CardContent>
          {/* Theme Preview */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
            <div 
              className="p-6 rounded-lg border-2 transition-all duration-300"
              style={{ background: activeTheme.colors.background }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: activeTheme.colors.primary }}
                >
                  <activeTheme.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{personName}</h4>
                  <p className="text-xs text-gray-600">Online</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div 
                    className="max-w-xs p-3 rounded-lg text-white text-sm"
                    style={{ backgroundColor: activeTheme.colors.primary }}
                  >
                    Hi {personName}, I've been thinking about you today...
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div 
                    className="max-w-xs p-3 rounded-lg text-gray-800 text-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    I'm always here with you. What's on your mind?
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <Badge 
                variant="secondary" 
                className="capitalize"
                style={{ 
                  backgroundColor: `${activeTheme.colors.primary}20`,
                  color: activeTheme.colors.primary 
                }}
              >
                {activeTheme.emotional} • {activeTheme.name}
              </Badge>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((theme, index) => {
              const IconComponent = theme.icon;
              const isSelected = theme.id === currentTheme;
              const isPreviewing = theme.id === previewTheme;
              
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative cursor-pointer group ${
                    isSelected ? 'ring-2 ring-purple-400' : ''
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={() => handleThemePreview(null)}
                >
                  <Card className="border-2 transition-all duration-200 hover:shadow-lg">
                    <CardContent className="p-4">
                      <div 
                        className="w-full h-16 rounded-lg mb-3 flex items-center justify-center"
                        style={{ background: theme.colors.background }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {theme.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {theme.description}
                      </p>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize"
                        style={{ 
                          borderColor: theme.colors.primary,
                          color: theme.colors.primary 
                        }}
                      >
                        {theme.emotional}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Theme Description */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">About {activeTheme.name}</h4>
            <p className="text-gray-700 text-sm mb-2">{activeTheme.description}</p>
            <p className="text-gray-600 text-xs">
              This theme creates a <strong>{activeTheme.emotional}</strong> atmosphere for your conversations, 
              helping to set the right emotional tone for your interactions with {personName}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
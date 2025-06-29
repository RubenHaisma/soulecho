'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Heart, Sparkles, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BirthdayCard {
  id: string;
  title: string;
  content: string;
  cardType: string;
  isGenerated: boolean;
  createdAt: string;
  expiresAt?: string;
  milestone?: {
    id: string;
    title: string;
    personName?: string;
  };
}

interface BirthdayNotificationProps {
  className?: string;
}

export const BirthdayNotification: React.FC<BirthdayNotificationProps> = ({ className = '' }) => {
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthdayCards, setBirthdayCards] = useState<BirthdayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkBirthday();
  }, []);

  const checkBirthday = async () => {
    try {
      setIsLoading(true);
      
      // Check if today is birthday
      const response = await fetch('/api/notifications/birthday');
      if (response.ok) {
        const data = await response.json();
        setIsBirthday(data.isBirthdayToday);
        
        if (data.isBirthdayToday) {
          // Trigger birthday notifications to create cards
          await fetch('/api/notifications/birthday', { method: 'POST' });
          
          // Load birthday cards
          const cardsResponse = await fetch('/api/memory-cards');
          if (cardsResponse.ok) {
            const cardsData = await cardsResponse.json();
            const birthdayCards = cardsData.memoryCards?.filter((card: BirthdayCard) => 
              card.cardType === 'BIRTHDAY' && card.title.includes('Happy Birthday')
            ) || [];
            setBirthdayCards(birthdayCards);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check birthday:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !isBirthday || !isVisible) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-2xl animate-pulse opacity-50"></div>
      
      <Card className="relative border-0 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-2xl shadow-pink-200/50">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Happy Birthday! 🎂
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Special messages from your loved ones await you
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {birthdayCards.length > 0 ? (
            <div className="space-y-3">
              {birthdayCards.slice(0, 3).map((card) => (
                <div key={card.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-pink-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{card.content}</p>
                      {card.milestone?.personName && (
                        <Badge variant="secondary" className="mt-2 bg-pink-100 text-pink-700">
                          From {card.milestone.personName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {birthdayCards.length > 3 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    And {birthdayCards.length - 3} more birthday messages...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <p className="text-gray-600 mb-4">
                Creating special birthday messages from your conversations...
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-pink-200">
            <Link href="/memories">
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                <Heart className="w-4 h-4 mr-2" />
                View All Memories
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
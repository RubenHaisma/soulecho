'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Star, Gift, MessageCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { AddMilestoneForm } from './add-milestone-form';

interface MemoryMilestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'SPECIAL_DAY' | 'CONVERSATION_MOMENT' | 'MEMORY_TRIGGER' | 'CUSTOM';
  isRecurring: boolean;
  recurrencePattern?: string;
  imageUrl?: string;
  tags: string[];
  chatSessionId?: string;
  personName?: string;
}

interface MemoryCard {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  cardType: 'BIRTHDAY' | 'ANNIVERSARY' | 'MEMORY_REFLECTION' | 'CONVERSATION_HIGHLIGHT' | 'AI_GENERATED' | 'CUSTOM';
  isGenerated: boolean;
  createdAt: string;
  expiresAt?: string;
  milestone?: MemoryMilestone;
}

interface MemoryTimelineProps {
  className?: string;
}

const getMilestoneIcon = (type: MemoryMilestone['type']) => {
  switch (type) {
    case 'BIRTHDAY':
      return <Gift className="w-5 h-5 text-pink-500" />;
    case 'ANNIVERSARY':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'SPECIAL_DAY':
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 'CONVERSATION_MOMENT':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    default:
      return <Calendar className="w-5 h-5 text-purple-500" />;
  }
};

const getCardTypeColor = (type: MemoryCard['cardType']) => {
  switch (type) {
    case 'BIRTHDAY':
      return 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200';
    case 'ANNIVERSARY':
      return 'bg-gradient-to-r from-red-100 to-pink-100 border-red-200';
    case 'MEMORY_REFLECTION':
      return 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200';
    case 'CONVERSATION_HIGHLIGHT':
      return 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200';
    default:
      return 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200';
  }
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
};

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ className = '' }) => {
  const [milestones, setMilestones] = useState<MemoryMilestone[]>([]);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'milestones' | 'cards'>('all');
  const [showAddMilestoneForm, setShowAddMilestoneForm] = useState(false);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      setIsLoading(true);
      
      // Load milestones
      const milestonesResponse = await fetch('/api/milestones');
      if (milestonesResponse.ok) {
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData.milestones || []);
      }

      // Load memory cards
      const cardsResponse = await fetch('/api/memory-cards');
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setMemoryCards(cardsData.memoryCards || []);
      }
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMilestoneSuccess = () => {
    loadTimelineData();
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      const response = await fetch(`/api/milestones?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMilestones(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory card?')) return;
    
    try {
      const response = await fetch(`/api/memory-cards?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMemoryCards(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete memory card:', error);
    }
  };

  // Combine and sort all items by date
  const allItems = [
    ...milestones.map(m => ({ ...m, itemType: 'milestone' as const, sortDate: m.date })),
    ...memoryCards.map(c => ({ ...c, itemType: 'card' as const, sortDate: c.createdAt }))
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  const filteredItems = selectedFilter === 'all' 
    ? allItems 
    : allItems.filter(item => item.itemType === selectedFilter.slice(0, -1)); // Remove 's' from 'milestones'/'cards'

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading your memory timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Memory Timeline</h2>
          <p className="text-gray-600">Your precious moments and memories</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setShowAddMilestoneForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All', count: allItems.length },
          { key: 'milestones', label: 'Milestones', count: milestones.length },
          { key: 'cards', label: 'Memory Cards', count: memoryCards.length }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              selectedFilter === filter.key
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
            <p className="text-gray-600 mb-4">Start creating beautiful memories and milestones</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Memory
            </Button>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index < filteredItems.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-purple-200 to-blue-200"></div>
              )}
              
              {/* Timeline Item */}
              <div className="flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                    {item.itemType === 'milestone' ? getMilestoneIcon(item.type) : <Heart className="w-5 h-5 text-white" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {item.itemType === 'milestone' ? (
                    <Card className="border-l-4 border-l-purple-400 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                {item.type.replace('_', ' ')}
                              </Badge>
                              {item.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                              {item.personName && (
                                <Badge variant="outline" className="text-xs">
                                  {item.personName}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteMilestone(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatRelativeDate(item.date)}</span>
                          {item.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {item.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className={`border-l-4 border-l-blue-400 hover:shadow-md transition-shadow ${getCardTypeColor(item.cardType)}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {item.cardType.replace('_', ' ')}
                              </Badge>
                              {item.isGenerated && (
                                <Badge variant="outline" className="text-xs">
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteCard(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-3 leading-relaxed">{item.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatRelativeDate(item.createdAt)}</span>
                          {item.expiresAt && (
                            <span className="text-orange-600">
                              Expires {formatRelativeDate(item.expiresAt)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Milestone Form */}
      {showAddMilestoneForm && (
        <AddMilestoneForm
          onClose={() => setShowAddMilestoneForm(false)}
          onSuccess={handleMilestoneSuccess}
        />
      )}
    </div>
  );
}; 
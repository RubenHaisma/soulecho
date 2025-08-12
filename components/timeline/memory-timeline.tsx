'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Heart,
  Gift,
  Camera,
  Music,
  MapPin,
  Star,
  Plus,
  Edit3,
  MessageCircle,
  Share2,
  Download,
  Filter,
  Search,
  Clock,
  Users,
  Cake,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'conversation' | 'memory' | 'anniversary' | 'system';
  title: string;
  description?: string;
  date: string;
  category: 'birthday' | 'anniversary' | 'holiday' | 'achievement' | 'conversation' | 'memory' | 'other';
  attachments?: {
    type: 'image' | 'audio' | 'message';
    url: string;
    caption?: string;
  }[];
  tags?: string[];
  mood?: 'happy' | 'sad' | 'nostalgic' | 'loving' | 'peaceful' | 'excited';
  isPrivate?: boolean;
  relatedConversations?: number;
  aiGenerated?: boolean;
  reminderSet?: boolean;
}

interface MilestoneStats {
  totalEvents: number;
  conversationMoments: number;
  specialDates: number;
  memories: number;
  upcomingReminders: number;
}

const categoryIcons = {
  birthday: Cake,
  anniversary: Heart,
  holiday: Gift,
  achievement: Star,
  conversation: MessageCircle,
  memory: Camera,
  other: Sparkles
};

const categoryColors = {
  birthday: 'bg-pink-100 text-pink-800 border-pink-200',
  anniversary: 'bg-red-100 text-red-800 border-red-200',
  holiday: 'bg-green-100 text-green-800 border-green-200',
  achievement: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  conversation: 'bg-blue-100 text-blue-800 border-blue-200',
  memory: 'bg-purple-100 text-purple-800 border-purple-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function MemoryTimeline({ sessionId }: { sessionId?: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<MilestoneStats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'cards'>('timeline');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    type: 'milestone',
    category: 'other',
    mood: 'happy'
  });

  // Load timeline data
  useEffect(() => {
    loadTimeline();
    loadStats();
  }, [sessionId]);

  const loadTimeline = async () => {
    try {
      const response = await fetch(`/api/timeline${sessionId ? `?sessionId=${sessionId}` : ''}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/timeline/stats${sessionId ? `?sessionId=${sessionId}` : ''}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter;
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group events by year/month for timeline view
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = parseISO(event.date);
    const yearMonth = format(date, 'yyyy-MM');
    if (!groups[yearMonth]) {
      groups[yearMonth] = [];
    }
    groups[yearMonth].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;

    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, sessionId })
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewEvent({ type: 'milestone', category: 'other', mood: 'happy' });
        loadTimeline();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleChatAboutEvent = (event: TimelineEvent) => {
    // Navigate to chat with event context
    window.location.href = `/chat/${sessionId}?context=${encodeURIComponent(event.title)}`;
  };

  if (!events.length && !stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timeline Yet</h3>
        <p className="text-gray-600 mb-4">Start creating memories and milestones</p>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Memory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.conversationMoments}</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.specialDates}</div>
              <div className="text-sm text-gray-600">Special Dates</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.memories}</div>
              <div className="text-sm text-gray-600">Memories</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingReminders}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="birthday">Birthdays</option>
            <option value="anniversary">Anniversaries</option>
            <option value="conversation">Conversations</option>
            <option value="memory">Memories</option>
            <option value="holiday">Holidays</option>
            <option value="achievement">Achievements</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            {['timeline', 'calendar', 'cards'].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode as any)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {Object.entries(groupedEvents)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([yearMonth, monthEvents]) => (
              <div key={yearMonth} className="relative">
                {/* Month Header */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b pb-2 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(parseISO(yearMonth + '-01'), 'MMMM yyyy')}
                  </h3>
                  <div className="text-sm text-gray-600">{monthEvents.length} events</div>
                </div>

                {/* Timeline Events */}
                <div className="space-y-4 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-blue-200"></div>

                  {monthEvents
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((event, index) => {
                      const Icon = categoryIcons[event.category];
                      const isExpanded = expandedEvent === event.id;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-4"
                        >
                          {/* Timeline Node */}
                          <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                              event.aiGenerated ? 'bg-gradient-to-br from-purple-400 to-blue-400' : 'bg-white border-gray-200'
                            }`}>
                              <Icon className={`w-5 h-5 ${event.aiGenerated ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            {event.aiGenerated && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Event Card */}
                          <Card className="flex-1 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                    <Badge className={categoryColors[event.category]}>
                                      {event.category}
                                    </Badge>
                                    {event.mood && (
                                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                        {event.mood}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">
                                    {format(parseISO(event.date), 'PPP')}
                                    {event.relatedConversations && (
                                      <span className="ml-2">• {event.relatedConversations} conversations</span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <p className="text-sm text-gray-700">{event.description}</p>
                                  )}
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </Button>
                              </div>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t pt-4 mt-4"
                                  >
                                    {/* Tags */}
                                    {event.tags && (
                                      <div className="flex gap-1 mb-3">
                                        {event.tags.map((tag, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Attachments */}
                                    {event.attachments && (
                                      <div className="space-y-2 mb-4">
                                        {event.attachments.map((attachment, i) => (
                                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            {attachment.type === 'image' && <Camera className="w-4 h-4" />}
                                            {attachment.type === 'audio' && <Music className="w-4 h-4" />}
                                            {attachment.type === 'message' && <MessageCircle className="w-4 h-4" />}
                                            <span className="text-sm">{attachment.caption || 'Attachment'}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleChatAboutEvent(event)}
                                      >
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        Chat About This
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Share2 className="w-4 h-4 mr-1" />
                                        Share
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Event Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="What happened?"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date || ''}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value as any})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="memory">Memory</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="holiday">Holiday</option>
                <option value="achievement">Achievement</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Tell us more about this memory..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date}>
                Add Memory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
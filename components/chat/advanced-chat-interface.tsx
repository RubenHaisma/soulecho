'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  Heart, 
  Brain, 
  Clock, 
  MessageCircle2,
  Lightbulb,
  Camera,
  Gift,
  Music,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mood?: 'happy' | 'sad' | 'nostalgic' | 'loving' | 'playful';
  context?: string;
  confidence?: number;
  suggestions?: string[];
}

interface PersonalityInsights {
  communicationStyle: string;
  favoriteTopics: string[];
  typicalResponses: string[];
  emotionalPatterns: string[];
  memoryTriggers: string[];
}

export function AdvancedChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [personalityInsights, setPersonalityInsights] = useState<PersonalityInsights | null>(null);
  const [contextMode, setContextMode] = useState<'casual' | 'deep' | 'playful' | 'supportive'>('casual');
  const [currentMood, setCurrentMood] = useState<string>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smart conversation starters based on personality
  const conversationStarters = [
    { icon: Heart, text: "How was your day today?", mood: 'loving' },
    { icon: Coffee, text: "Tell me about your morning routine", mood: 'casual' },
    { icon: Music, text: "What song reminds you of us?", mood: 'nostalgic' },
    { icon: Gift, text: "I have something exciting to share!", mood: 'happy' },
    { icon: Lightbulb, text: "I need your advice about something", mood: 'supportive' },
    { icon: Camera, text: "Remember when we...", mood: 'nostalgic' }
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Advanced AI processing
    try {
      const response = await fetch('/api/chat/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: input,
          context: contextMode,
          recentMessages: messages.slice(-5),
          personalityProfile: personalityInsights
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date(),
        mood: data.mood,
        context: data.context,
        confidence: data.confidence,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentMood(data.mood || 'neutral');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice input handling
  const startListening = async () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Implement speech recognition
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load personality insights
  useEffect(() => {
    const loadPersonality = async () => {
      try {
        const response = await fetch(`/api/personality/${sessionId}`);
        const data = await response.json();
        setPersonalityInsights(data);
      } catch (error) {
        console.error('Failed to load personality:', error);
      }
    };
    loadPersonality();
  }, [sessionId]);

  return (
    <div className="flex flex-col h-full">
      {/* Personality Insights Header */}
      {personalityInsights && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <div className="flex items-center gap-4 mb-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Personality Insights</span>
            <Badge variant="secondary" className="text-xs">
              {personalityInsights.communicationStyle}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500">Favorite Topics</div>
              <div className="text-sm font-medium">{personalityInsights.favoriteTopics.slice(0, 2).join(', ')}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Communication Style</div>
              <div className="text-sm font-medium">{personalityInsights.communicationStyle}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Current Mood</div>
              <div className="text-sm font-medium capitalize">{currentMood}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Context Mode</div>
              <div className="text-sm font-medium capitalize">{contextMode}</div>
            </div>
          </div>
        </div>
      )}

      {/* Context Mode Selector */}
      <div className="p-3 border-b bg-white">
        <div className="flex gap-2 flex-wrap">
          {['casual', 'deep', 'playful', 'supportive'].map((mode) => (
            <Button
              key={mode}
              variant={contextMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContextMode(mode as any)}
              className="text-xs"
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                <p className="text-gray-600 text-sm">Choose a conversation starter or type your own message</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
                {conversationStarters.map((starter, index) => {
                  const Icon = starter.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-3 h-auto flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => setInput(starter.text)}
                    >
                      <Icon className="w-5 h-5 text-purple-600" />
                      <span className="text-xs text-center leading-tight">{starter.text}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                {/* Message Bubble */}
                <div className={`rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white ml-auto'
                    : 'bg-white border shadow-sm'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  
                  {/* AI Message Metadata */}
                  {message.role === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {message.mood && (
                          <Badge variant="secondary" className="text-xs">
                            {message.mood}
                          </Badge>
                        )}
                        {message.confidence && (
                          <span>{Math.round(message.confidence * 100)}% match</span>
                        )}
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                {message.role === 'ai' && message.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.slice(0, 2).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-2 justify-start text-gray-600 hover:text-purple-600"
                        onClick={() => setInput(suggestion)}
                      >
                        💭 {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border shadow-sm rounded-2xl p-4 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="min-h-[44px] resize-none"
              disabled={isTyping}
            />
          </div>
          
          <Button
            onClick={startListening}
            variant="outline"
            size="sm"
            className={`shrink-0 ${isListening ? 'bg-red-100 border-red-300' : ''}`}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : 'text-gray-600'}`} />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setInput("How are you feeling today?")}>
            💭 Ask about feelings
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setInput("Tell me a happy memory")}>
            ✨ Share a memory
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setInput("What would you say to me right now?")}>
            💝 Need encouragement
          </Button>
        </div>
      </div>
    </div>
  );
}
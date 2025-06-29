'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Heart, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Conversation {
  id: string;
  userMessage: string;
  aiResponse: string;
  createdAt: string;
}

interface TypingIndicatorProps {
  show: boolean;
  personName: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ show, personName }) => {
  if (!show) return null;

  return (
    <div className="flex items-end gap-2 mb-4">
      <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0">
        <AvatarFallback className="text-white text-sm font-semibold">
          {personName?.charAt(0) || 'L'}
        </AvatarFallback>
      </Avatar>
      
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 shadow-sm max-w-[200px]">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm text-gray-500 ml-2">typing...</span>
        </div>
      </Card>
    </div>
  );
};

interface ChatInterfaceProps {
  sessionId: string;
  personName: string;
  onError?: (error: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  sessionId, 
  personName, 
  onError,
  className = '' 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    canChat: boolean;
    planType: string;
    trialExpired: boolean;
  } | null>(null);
  const [degradationMessage, setDegradationMessage] = useState<string | null>(null);
  const [qualityLevel, setQualityLevel] = useState<number>(100);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    
    // Load conversation history first, then fetch welcome message if needed
    loadConversationHistory();
  }, [sessionId]);

  useEffect(() => {
    if (session?.user?.email) {
      checkSubscriptionStatus();
    }
  }, [session]);

  const loadConversationHistory = async () => {
    try {
      setIsLoadingHistory(true);
      
      const response = await fetch(`/api/conversations?sessionId=${sessionId}&limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        
        if (conversations.length > 0) {
          // Convert conversations to messages
          const historyMessages: Message[] = (conversations as Conversation[])
            .reverse() // Show oldest first
            .flatMap((conv: Conversation) => [
              {
                id: `user-${conv.id}`,
                text: conv.userMessage,
                sender: 'user' as const,
                timestamp: new Date(conv.createdAt)
              },
              {
                id: `ai-${conv.id}`,
                text: conv.aiResponse,
                sender: 'ai' as const,
                timestamp: new Date(conv.createdAt)
              }
            ]);
          
          setMessages(historyMessages);
          console.log(`📚 Loaded ${conversations.length} previous conversations`);
        } else {
          // No history, fetch welcome message
          fetchWelcomeMessage();
        }
      } else {
        console.warn('Failed to load conversation history, fetching welcome message');
        fetchWelcomeMessage();
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      fetchWelcomeMessage();
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchWelcomeMessage = async () => {
    try {
      const response = await fetch('/api/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        const welcomeMessage: Message = {
          id: 'welcome',
          text: data.welcomeMessage,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        // Fallback to default message
        const welcomeMessage: Message = {
          id: 'welcome',
          text: `Hello... it's so good to hear from you again. I've missed our conversations. What's on your mind?`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to fetch welcome message:', error);
      // Fallback to default message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `Hello... it's so good to hear from you again. I've missed our conversations. What's on your mind?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isTyping || isLoading) return;
    
    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    onError?.('');
    
    // Add user message immediately
    const tempId = Date.now().toString();
    const userMsg: Message = {
      id: tempId,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          personName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'TRIAL_EXPIRED' || data.upgradeRequired) {
          onError?.(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to send message');
      }

      // Handle degradation messaging
      if (data.degradationMessage) {
        setDegradationMessage(data.degradationMessage);
      }
      
      if (data.qualityLevel) {
        setQualityLevel(data.qualityLevel);
      }

      // Simulate typing for AI response
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriptionStatus?.canChat) {
      onError?.('Your trial has expired or you\'ve reached your conversation limit. Please upgrade to Premium to continue.');
      return;
    }

    if (!newMessage.trim() || isTyping || isLoading) return;

    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/dashboard/usage');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus({
          canChat: data.usage.conversations < data.usage.conversationsLimit || data.usage.planType === 'premium',
          planType: data.usage.planType,
          trialExpired: data.usage.planType === 'expired'
        });
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  // Add quality indicator component
  const QualityIndicator = () => {
    if (qualityLevel >= 90) return null; // Don't show for full quality
    
    let color = 'bg-green-500';
    let label = 'Good';
    
    if (qualityLevel < 50) {
      color = 'bg-red-500';
      label = 'Basic';
    } else if (qualityLevel < 70) {
      color = 'bg-orange-500';
      label = 'Reduced';
    }
    
    return (
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-gray-600">Quality: {label}</span>
      </div>
    );
  };

  if (isLoadingHistory) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">Loading conversation history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 ${className}`}>
      {/* Messages Area - Mobile optimized */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Degradation message - Mobile optimized */}
        {degradationMessage && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg mx-1 sm:mx-0">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-white text-xs">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-amber-800 mb-2 break-words">{degradationMessage}</p>
                <QualityIndicator />
              </div>
              <button 
                onClick={() => setDegradationMessage(null)}
                className="text-amber-600 hover:text-amber-800 text-lg sm:text-xl leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Messages - Mobile optimized */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} px-1 sm:px-0`}
          >
            <div className={`flex items-end gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {message.sender === 'ai' && (
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0">
                  <AvatarFallback className="text-white text-xs sm:text-sm font-semibold">
                    {personName?.charAt(0) || 'L'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`p-3 sm:p-4 shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200/60'
              }`}>
                <p className={`text-sm sm:text-base leading-relaxed break-words ${
                  message.sender === 'user' ? 'text-white' : 'text-gray-800'
                }`}>
                  {message.text}
                </p>
                <p className={`text-xs sm:text-sm mt-2 ${
                  message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
            </div>
          </div>
        ))}
        
        {/* Typing indicator - Mobile optimized */}
        <TypingIndicator show={isTyping} personName={personName} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mobile optimized */}
      <div className="border-t border-gray-200 bg-white/70 backdrop-blur-sm">
        {/* Mobile-friendly padding and spacing */}
        <div className="p-3 sm:p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTyping ? `${personName} is typing...` : "Type your message..."}
                disabled={isTyping || isLoading}
                className={`
                  pr-10 sm:pr-12 rounded-2xl bg-white border-gray-300 
                  focus:border-purple-400 focus:ring-purple-400/20
                  text-sm sm:text-base py-3 sm:py-4 px-4 sm:px-5
                  transition-all duration-200
                  ${isTyping || isLoading ? 'opacity-50' : ''}
                `}
              />
              {(isLoading || isTyping) && (
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isTyping || isLoading}
              className={`
                rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 
                hover:from-purple-700 hover:to-blue-700 text-white 
                px-4 sm:px-6 py-3 sm:py-4 shadow-lg disabled:opacity-50
                transition-all duration-200 transform hover:scale-105
                active:scale-95 touch-manipulation
                min-w-[48px] sm:min-w-[56px]
              `}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </form>
          
          {/* Footer info - Mobile optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 fill-current text-purple-400" />
              <span>Messages are generated with care and empathy</span>
            </div>
            {messages.length > 1 && (
              <span className="text-purple-400 border-t sm:border-t-0 sm:border-l border-gray-300 pt-2 sm:pt-0 sm:pl-4">
                {Math.floor(messages.length / 2)} previous conversations
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
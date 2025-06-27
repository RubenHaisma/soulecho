'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Heart } from 'lucide-react';

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    
    // Load conversation history first, then fetch welcome message if needed
    loadConversationHistory();
  }, [sessionId]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Show typing indicator after a brief delay
    setTimeout(() => {
      setIsTyping(true);
      setIsLoading(false);
    }, 800);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Simulate natural typing delay
      const typingDelay = Math.min(data.response.length * 50, 3000); // Max 3 seconds
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Focus input for next message
        setTimeout(() => inputRef.current?.focus(), 100);
      }, typingDelay);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please give me a moment and try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-500">Loading conversation history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {message.sender === 'ai' && (
                <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0">
                  <AvatarFallback className="text-white text-sm font-semibold">
                    {personName?.charAt(0) || 'L'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`p-4 shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white/70 backdrop-blur-sm border border-gray-200/60'
              }`}>
                <p className={`text-sm leading-relaxed ${
                  message.sender === 'user' ? 'text-white' : 'text-gray-800'
                }`}>
                  {message.text}
                </p>
                <p className={`text-xs mt-2 ${
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
        
        <TypingIndicator show={isTyping} personName={personName} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isTyping ? `${personName} is typing...` : "Type your message..."}
              disabled={isTyping || isLoading}
              className="pr-12 rounded-full bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400/20"
            />
            {(isLoading || isTyping) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isTyping || isLoading}
            className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="flex items-center justify-center mt-3 gap-2 text-xs text-gray-500">
          <Heart className="w-3 h-3 fill-current text-purple-400" />
          <span>Messages are generated with care and empathy</span>
          {messages.length > 1 && (
            <span className="ml-2 text-purple-400">
              • {Math.floor(messages.length / 2)} previous conversations
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 
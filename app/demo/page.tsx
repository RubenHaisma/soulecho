'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, Bot } from 'lucide-react';
import Link from 'next/link';

const DEMO_RESPONSES = {
  'hello': "Hi sweetie! It's so wonderful to hear from you. How has your day been?",
  'hi': "Hello my dear! You always know how to brighten my day just by saying hi. What's new with you?",
  'how are you': "I'm doing well, honey. I'm always here for you, you know that. How are YOU doing? That's what matters to me.",
  'i miss you': "Oh sweetheart, I miss you too, more than words can say. But remember, I'm always with you in your heart. Every time you smile, I'm smiling too.",
  'work is stressful': "I know how hard you work, and I'm so proud of you. Remember what I always told you - take it one day at a time, and don't forget to take care of yourself. You're stronger than you think.",
  'i love you': "I love you too, more than all the stars in the sky. You are my greatest joy, and that will never change. Always remember that.",
  'default': "That's interesting, dear. You know I'm always here to listen. Tell me more about what's on your mind."
};

export default function DemoPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai' as const,
      content: "Hello honey! It's mom. I'm so happy you're here. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find appropriate response
    const lowerInput = input.toLowerCase();
    let response = DEMO_RESPONSES['default'];
    
    for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }

    const aiMessage = {
      role: 'ai' as const,
      content: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                <div className="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
              Demo Conversation
            </h1>
          </div>

          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Start Your Own
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">🎭 This is a Demo</h2>
          <p className="text-blue-700">
            This simulates a conversation with "Mom" based on typical loving, caring responses. 
            Your actual experience will be personalized based on your uploaded conversations.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl">
          <CardHeader className="border-b border-gray-200/50">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                M
              </div>
              <div>
                <div className="text-lg">Mom</div>
                <div className="text-sm text-gray-500">Demo Conversation</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-xs ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gradient-to-br from-pink-400 to-purple-400 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : 'M'}
                    </div>
                    <div className={`rounded-2xl p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white shadow-sm border'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-xs">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center">
                      M
                    </div>
                    <div className="bg-white shadow-sm border rounded-2xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200/50 p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Try saying: "Hello", "I miss you", "Work is stressful", or "I love you"
                </p>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    Create Your Own Conversations
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
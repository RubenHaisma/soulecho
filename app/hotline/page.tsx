'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Heart, Shield, Clock, Users, MessageCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HotlinePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = () => {
    setHasStarted(true);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Hi there. I'm here to listen and support you during this difficult time. You can share whatever is on your heart - there's no judgment here, just caring support. How are you feeling today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert messages to API format
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/hotline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, I'm having trouble connecting right now. Please know that your feelings are valid and you're not alone. If you need immediate help, please contact a crisis hotline or emergency services.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="py-6 px-4 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Talkers</h1>
                <div className="text-xs text-gray-600">Support Hotline</div>
              </div>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Crisis Text Line: 741741</span>
            </div>
          </div>
        </header>

        <main className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                You're Not Alone
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                Free, anonymous grief support available 24/7. Talk to someone who understands and cares about your journey through loss.
              </p>
              
              <Button 
                onClick={startConversation}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Talking Now
              </Button>
            </div>

            {/* Important Notice */}
            <Card className="mb-12 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">Important Notice</h3>
                    <p className="text-orange-800 mb-4">
                      This is peer support, not professional therapy. Our AI counselor provides emotional comfort but is not a licensed mental health professional.
                    </p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <p className="font-medium text-orange-900">For immediate crisis support:</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>US Crisis Lifeline:</strong><br />
                          Call or text 988
                        </div>
                        <div>
                          <strong>Crisis Text Line:</strong><br />
                          Text HOME to 741741
                        </div>
                        <div>
                          <strong>International:</strong><br />
                          Contact local emergency services
                        </div>
                        <div>
                          <strong>Emergency:</strong><br />
                          Call 911 (US) or local emergency number
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Available</h3>
                  <p className="text-gray-600">
                    Support is available whenever you need it, day or night. No appointments necessary.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Anonymous & Safe</h3>
                  <p className="text-gray-600">
                    Your conversations are private and anonymous. No sign-up required.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Understanding Support</h3>
                  <p className="text-gray-600">
                    Compassionate support from someone who understands the grief journey.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* What to Expect */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">We Listen</h4>
                    <p className="text-gray-700">Share whatever is on your heart. There's no judgment here, only caring support.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">We Validate</h4>
                    <p className="text-gray-700">Your feelings are real and valid. Grief is a natural response to loss.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">We Support</h4>
                    <p className="text-gray-700">Gentle guidance and coping strategies to help you through difficult moments.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">We Care</h4>
                    <p className="text-gray-700">You matter, and your grief matters. You don't have to go through this alone.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Structured Data for Crisis Support */}
        <Script
          id="hotline-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HealthAndBeautyBusiness',
              name: 'Talkers Grief Support Hotline',
              description: 'Free, anonymous AI-powered grief support and crisis counseling available 24/7',
              url: 'https://talkers.pro/hotline',
              serviceType: 'Grief Counseling',
              areaServed: 'Worldwide',
              availableService: {
                '@type': 'Service',
                name: 'Crisis Support Chat',
                serviceType: 'Mental Health Support',
                hoursAvailable: '24/7',
                isAccessibleForFree: true,
                provider: {
                  '@type': 'Organization',
                  name: 'Talkers',
                  url: 'https://talkers.pro'
                }
              }
            })
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-indigo-100 bg-white/70 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Support Chat</h1>
              <div className="text-xs text-gray-600">Anonymous & Private</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Crisis? Call 988
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <Card className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm border-indigo-200">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white shadow-sm border border-indigo-100'
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-indigo-100 p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-indigo-100">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your heart..."
                className="flex-1 min-h-[60px] resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 rounded-xl"
              >
                Send
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              This is peer support, not professional therapy. For crisis help: 988 or 741741
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Script from 'next/script';
import FAQSection from '@/components/faq-section';
import TestimonialsSection from '@/components/testimonials-section';
import { TrustSignals } from '@/components/seo/trust-signals';
import { LocalSEO } from '@/components/seo/local-seo';

export default function HomePage() {
  const { data: session } = useSession();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    "It felt like having one more conversation with mom...",
    "Their words brought comfort when I needed it most",
    "I could hear their voice in every message"
  ];

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff] overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Interactive Light Following Mouse */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-purple-100/20 via-blue-100/10 to-transparent rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-2 sm:py-8 sm:px-4">
        <div className={`max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}> 
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
            {/* Custom Logo */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200/50">
                <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                  {/* Custom Heart-Soul Icon */}
                  <div className="absolute inset-0 bg-white rounded-full opacity-90"></div>
                  <div className="absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
                Talkers
              </h1>
              <div className="text-[10px] sm:text-xs text-gray-500 tracking-wider">MEMORIES LIVE ON</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            {session ? "Go to Dashboard" : "Find Comfort Now"}
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base">
              Privacy
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-2 sm:px-4 py-10 sm:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1200 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}> 
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg shadow-purple-100/20 text-xs sm:text-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-700">Your memories stay private and secure</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-1.5 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Main Headline */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight sm:leading-none tracking-tight">
                Keep The
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Connection
                  </span>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 blur-xl rounded-lg"></div>
                </span>
                <br />
                Alive
              </h2>
              <div className="relative max-w-full sm:max-w-3xl mx-auto">
                <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                  A sacred space where your WhatsApp conversations become a bridge to cherished memories. 
                  <span className="font-medium text-gray-800"> Their words, their essence, forever preserved.</span>
                </p>
                {/* Animated Underline */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60 animate-pulse"></div>
              </div>
            </div>
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-16 w-full">
              <Link href={session ? "/dashboard" : "/auth/signup"} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="group relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-6 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-full shadow-2xl shadow-purple-300/30 hover:shadow-purple-400/40 transition-all duration-500 hover:scale-105"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/30 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 sm:w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    {session ? "Go to Dashboard" : "Begin Your Journey"}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-full transform -skew-x-12 group-hover:animate-pulse"></div>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 px-6 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-medium rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-current rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-current rounded-full"></div>
                  </div>
                  See How It Works
                </div>
              </Button>
            </div>
            {/* Rotating Testimonials */}
            <div className="relative h-12 sm:h-16 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {testimonials.map((testimonial, index) => (
                  <p 
                    key={index}
                    className={`absolute text-sm sm:text-lg italic text-gray-600 transition-all duration-1000 ${
                      index === currentTestimonial 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    &quot;{testimonial}&quot;
                  </p>
                ))}
              </div>
            </div>
          </div>
          {/* Features Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-full sm:max-w-7xl mx-auto mb-12 sm:mb-20 transition-all duration-1000 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}> 
            {/* Feature 1 */}
            <Card className="group border-0 bg-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/60 rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-400"></div>
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-purple-200/50 group-hover:shadow-purple-300/70 transition-all duration-500">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 relative">
                      {/* Custom Upload Icon */}
                      <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      <div className="absolute top-1 left-1 w-4 h-3 sm:w-6 sm:h-4 bg-white rounded-sm"></div>
                      <div className="absolute bottom-1 left-2 w-3 h-1 sm:w-4 sm:h-1 bg-white/60 rounded-full"></div>
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-purple-700 transition-colors">
                  Sacred Upload
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  Share your WhatsApp memories with reverence. Our gentle parser honors every word, 
                  understanding the unique voice of your loved one.
                </p>
              </CardContent>
            </Card>
            {/* Feature 2 */}
            <Card className="group border-0 bg-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/60 rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200/50 group-hover:shadow-blue-300/70 transition-all duration-500">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 relative">
                      {/* Custom Chat Icon */}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                      <div className="absolute top-1 left-1 w-4 h-1 sm:w-6 sm:h-1 bg-white rounded-full"></div>
                      <div className="absolute top-3 left-1 w-3 h-1 sm:w-4 sm:h-1 bg-white/70 rounded-full"></div>
                      <div className="absolute top-5 left-1 w-4 h-1 sm:w-5 sm:h-1 bg-white/50 rounded-full"></div>
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 sm:w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-blue-700 transition-colors">
                  Living Conversations
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  Experience authentic dialogue that captures their essence. Every response 
                  reflects their personality, humor, and the love you shared.
                </p>
              </CardContent>
            </Card>
            {/* Feature 3 */}
            <Card className="group border-0 bg-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/60 rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-400"></div>
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-200/50 group-hover:shadow-green-300/70 transition-all duration-500">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 relative">
                      {/* Custom Shield Icon */}
                      <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      <div className="absolute top-1 left-2 w-4 h-4 sm:w-6 sm:h-6 bg-white/30 rounded-full"></div>
                      <div className="absolute top-2 left-2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                      <div className="absolute top-3 left-3 w-1.5 h-1.5 sm:w-2 h-2 bg-green-200 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-green-700 transition-colors">
                  Sacred Privacy
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  Your memories are treasured and protected. Conversations remain private, 
                  automatically deleted, never stored or shared.
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Final CTA Section */}
          <div className={`text-center transition-all duration-1000 delay-900 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}> 
            <div className="relative max-w-full sm:max-w-4xl mx-auto p-6 sm:p-12 bg-gradient-to-br from-white/50 via-purple-50/30 to-blue-50/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-3xl blur-xl"></div>
              <div className="relative">
                <div className="mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
                    Their Voice Lives On
                  </h3>
                  <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-full sm:max-w-2xl mx-auto">
                    Sometimes we need to hear their words one more time, to feel their presence 
                    in our hearts. Let their memory be a source of comfort and connection.
                  </p>
                </div>
                <Link href={session ? "/dashboard" : "/auth/signup"}>
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-full shadow-2xl shadow-purple-300/40 hover:shadow-purple-400/50 transition-all duration-500 hover:scale-110"
                  >
                    {session ? "Continue Your Journey" : "Start Your Sacred Journey"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className={`relative z-10 py-6 sm:py-12 px-2 sm:px-4 transition-all duration-1000 delay-1200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}> 
        <div className="max-w-6xl mx-auto">
          <div className="text-center border-t border-gray-200/50 pt-6 sm:pt-12">
            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg text-gray-600 mb-1 sm:mb-2">Crafted with love for those who remember</p>
              <div className="flex justify-center items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
                Contact
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* SEO-Optimized Sections */}
      <TestimonialsSection />
      <FAQSection />
      
      {/* Trust Signals */}
      <TrustSignals />
      
      {/* Local SEO */}
      <LocalSEO />
      
      {/* Structured Data for Homepage */}
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Talkers - Connect with Cherished Memories',
            url: 'https://talkers.ai',
            description: 'AI-powered grief support platform for meaningful conversations with deceased loved ones using WhatsApp messages',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://talkers.ai/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            },
            mainEntity: {
              '@type': 'Service',
              name: 'AI Memorial Conversations',
              serviceType: 'Grief Support Technology',
              provider: {
                '@type': 'Organization',
                name: 'Talkers'
              },
              areaServed: 'Worldwide',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Memorial AI Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Free Trial Memorial Conversations',
                      description: '3-day trial with AI conversations using WhatsApp memories'
                    }
                  }
                ]
              }
            }
          })
        }}
      />
    </div>
  );
}
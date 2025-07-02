import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Heart, Shield, MessageSquare, Download, Settings, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Complete Getting Started Guide: How to Preserve Your Digital Memories & WhatsApp Conversations | Talkers',
  description: 'Step-by-step guide to preserving your most precious digital conversations. Learn how to export WhatsApp chats, preserve memories, and create lasting emotional connections.',
  keywords: 'how to preserve digital memories, WhatsApp export guide, digital memory preservation tutorial, conversation backup guide, preserve text messages, digital legacy setup, memory preservation steps',
  openGraph: {
    title: 'Complete Getting Started Guide: Preserve Your Digital Memories',
    description: 'Step-by-step guide to preserving your most precious digital conversations and creating lasting emotional connections.',
    type: 'article',
    url: '/blog/getting-started-guide',
    publishedTime: '2024-01-20',
    authors: ['Talkers Team'],
    tags: ['tutorial', 'getting started', 'digital preservation', 'WhatsApp', 'guide'],
  },
  alternates: {
    canonical: '/blog/getting-started-guide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const steps = [
  {
    title: "Sign Up & Create Your Account",
    description: "Create your secure Talkers account and set up your digital memory preservation space",
    icon: Settings,
    details: "Start with our free trial to explore all features. No credit card required to begin preserving your precious conversations."
  },
  {
    title: "Export Your Conversations",
    description: "Learn how to safely export your WhatsApp conversations and other messaging platform data",
    icon: Download,
    details: "We provide detailed guides for WhatsApp, iMessage, Telegram, and other platforms. Your data remains secure throughout the process."
  },
  {
    title: "Upload & Organize",
    description: "Upload your exported conversations and organize them in meaningful collections",
    icon: Upload,
    details: "Our smart organization tools help you categorize conversations by person, time period, or emotional significance."
  },
  {
    title: "Experience Your Memories",
    description: "Start interacting with your preserved conversations and discovering their emotional value",
    icon: Sparkles,
    details: "Use our AI-powered interface to revisit, search, and meaningfully engage with your most precious digital memories."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Preserve Your Digital Memories and WhatsApp Conversations",
  "description": "Complete step-by-step guide to preserving your most precious digital conversations and creating lasting emotional connections",
  "image": "/blog-images/getting-started-guide.jpg",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Smartphone or computer"
    },
    {
      "@type": "HowToSupply", 
      "name": "WhatsApp or other messaging app"
    },
    {
      "@type": "HowToSupply",
      "name": "Internet connection"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Talkers platform"
    }
  ],
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "name": step.title,
    "text": step.description,
    "position": index + 1,
    "image": `/blog-images/step-${index + 1}.jpg`
  }))
};

export default function GettingStartedGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff]">
        <article className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">Getting Started</Badge>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⏱️ 30 minutes</span>
                <span>🆓 Free to start</span>
                <span>📱 All devices</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Complete Guide to
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Preserving Your Digital Memories</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Step-by-step instructions to preserve your most precious digital conversations and create 
              lasting emotional connections. Start your journey to meaningful memory preservation in just 30 minutes.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-3">What You&apos;ll Accomplish</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Safely export your WhatsApp conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Organize your digital memories meaningfully</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Create your first interactive memory experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Set up secure, private memory preservation</span>
                </div>
              </div>
            </div>
          </header>

          {/* Prerequisites Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Before You Begin</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <MessageSquare className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Identify Meaningful Conversations</h3>
                  <p className="text-sm text-gray-600">
                    Think about which conversations hold the most emotional value—daily chats with loved ones, 
                    voice messages, or exchanges during significant moments.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Ensure Privacy Consent</h3>
                  <p className="text-sm text-gray-600">
                    Consider the privacy of others in your conversations. Focus on preserving content 
                    that&apos;s meaningful for your personal healing and remembrance.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <Heart className="w-8 h-8 text-red-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Prepare Emotionally</h3>
                  <p className="text-sm text-gray-600">
                    Revisiting old conversations can bring up strong emotions. Choose a time when you feel 
                    emotionally ready to engage with these memories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Step-by-Step Process</h2>
            
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="mb-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-600 font-medium">Step {index + 1}</div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.details}</p>
                    
                    {index === 1 && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-3">WhatsApp Export Instructions</h4>
                        <ol className="text-sm text-blue-700 space-y-2">
                          <li>1. Open WhatsApp and go to the chat you want to export</li>
                          <li>2. Tap the three dots menu (⋮) in the top right</li>
                          <li>3. Select &quot;More&quot; then &quot;Export chat&quot;</li>
                          <li>4. Choose whether to include media files (recommended)</li>
                          <li>5. Select your preferred sharing method (email to yourself)</li>
                        </ol>
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-3">Organization Tips</h4>
                        <ul className="text-sm text-green-700 space-y-2">
                          <li>• Group conversations by relationship (family, friends, partners)</li>
                          <li>• Organize by time periods (monthly, yearly, or life events)</li>
                          <li>• Create collections for different emotional themes</li>
                          <li>• Use tags to mark especially meaningful exchanges</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>

          {/* Platform-Specific Guides */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform-Specific Export Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📱 WhatsApp (iOS & Android)</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Open the specific chat you want to preserve</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Tap contact/group name at top → Export Chat</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Choose &quot;Include Media&quot; for complete preservation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Email the export file to yourself</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">💬 iMessage (Mac)</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Open Messages app on your Mac</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Select the conversation thread</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>File → Print → Save as PDF</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Save to easily accessible location</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Common Questions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions During Setup</h2>
            <div className="space-y-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What if I have thousands of conversations?</h3>
                  <p className="text-gray-700 text-sm">
                    Start with the most meaningful ones—usually 5-10 conversations that bring you the most 
                    comfort or represent your most important relationships. You can always add more later.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How long does the export process take?</h3>
                  <p className="text-gray-700 text-sm">
                    WhatsApp exports typically complete in 1-5 minutes depending on conversation length. 
                    Conversations with lots of media may take longer but preserve the complete experience.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Can I preserve voice messages and photos?</h3>
                  <p className="text-gray-700 text-sm">
                    Yes! Always choose &quot;Include Media&quot; when exporting. Voice messages are often the 
                    most emotionally powerful preserved content, capturing tone, laughter, and personality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Begin Your Memory Journey?</h2>
                <p className="text-gray-700 mb-6">
                  You now have everything you need to start preserving your most precious digital conversations. 
                  Join thousands who have found comfort, connection, and healing through their preserved memories.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/blog/faq">
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      View FAQ
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 border border-purple-200/50">
                    <div className="text-2xl font-bold text-purple-600">5 min</div>
                    <div className="text-sm text-gray-600">Setup time</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200/50">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-gray-600">Secure & private</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200/50">
                    <div className="text-2xl font-bold text-purple-600">Free</div>
                    <div className="text-sm text-gray-600">Trial included</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Related Guides */}
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Continue Your Journey</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Digital Legacy Planning Guide</h4>
                  <p className="text-gray-600 text-sm mb-4">Learn how to ensure your preserved memories can be shared with loved ones according to your wishes.</p>
                  <Link href="/blog/creating-digital-legacy-guide">
                    <Button variant="outline" size="sm">Read Guide</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy & Security Best Practices</h4>
                  <p className="text-gray-600 text-sm mb-4">Understand how to maintain privacy while preserving meaningful conversations responsibly.</p>
                  <Link href="/privacy">
                    <Button variant="outline" size="sm">Learn More</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </article>
      </div>
    </>
  );
} 
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, HelpCircle, MessageCircle, Shield, Heart, Clock, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Digital Memory Preservation & WhatsApp Chat Storage | Talkers',
  description: 'Get answers to common questions about digital memory preservation, WhatsApp conversation storage, grief support, and emotional healing through technology.',
  keywords: 'digital memory preservation FAQ, WhatsApp chat storage questions, grief support FAQ, memory preservation answers, digital legacy questions, conversation preservation help',
  openGraph: {
    title: 'Frequently Asked Questions - Digital Memory Preservation | Talkers',
    description: 'Get answers to common questions about digital memory preservation, WhatsApp conversation storage, and emotional healing.',
    type: 'website',
    url: '/blog/faq',
  },
  alternates: {
    canonical: '/blog/faq',
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

const faqData = [
  {
    question: "What is digital memory preservation and why is it important?",
    answer: "Digital memory preservation is the process of storing, organizing, and maintaining your most meaningful digital conversations and content for long-term access. It's important because our digital communications often contain our most authentic expressions, emotional connections, and precious memories that deserve to be preserved and protected.",
    category: "General"
  },
  {
    question: "How does Talkers preserve my WhatsApp conversations?",
    answer: "Talkers uses advanced encryption and secure cloud storage to preserve your WhatsApp conversations while maintaining their original format and emotional context. We create interactive experiences that allow you to revisit and even engage with your preserved conversations in meaningful ways.",
    category: "Technology"
  },
  {
    question: "Is my data secure and private with Talkers?",
    answer: "Absolutely. We use enterprise-grade encryption, secure data centers, and strict privacy protocols. Your conversations are never shared, sold, or accessed by unauthorized parties. We comply with all major data protection regulations including GDPR and CCPA.",
    category: "Privacy"
  },
  {
    question: "Can digital conversations really help with grief and healing?",
    answer: "Yes, research shows that preserved digital conversations can provide significant comfort during grief. They allow you to maintain emotional connections, revisit positive memories, and process loss at your own pace. Many users find that reading old messages helps them feel closer to loved ones.",
    category: "Grief Support"
  },
  {
    question: "What types of conversations are most valuable to preserve?",
    answer: "The most valuable conversations to preserve include daily check-ins with loved ones, voice messages, conversations during significant life events, expressions of love and support, inside jokes, and any exchanges that capture someone's personality or your relationship dynamic.",
    category: "Content"
  },
  {
    question: "How do I export my WhatsApp conversations for preservation?",
    answer: "You can export WhatsApp conversations by opening the chat, tapping the three dots menu, selecting 'More', then 'Export chat'. Choose whether to include media files. Talkers provides detailed guides and can help you through this process to ensure nothing important is lost.",
    category: "How-To"
  },
  {
    question: "Can I preserve conversations from other messaging apps besides WhatsApp?",
    answer: "Yes! While WhatsApp is our specialty, Talkers can preserve conversations from various messaging platforms including iMessage, Telegram, Facebook Messenger, and others. Each platform has different export methods, which we can guide you through.",
    category: "Technology"
  },
  {
    question: "What happens to my preserved conversations if something happens to me?",
    answer: "Talkers offers digital legacy features where you can designate trusted contacts who can access your preserved conversations. This ensures your digital memories can be shared with family members or loved ones according to your wishes.",
    category: "Digital Legacy"
  },
  {
    question: "How much does digital memory preservation cost?",
    answer: "Talkers offers various plans starting with a free trial. Our pricing is based on storage needs and features. We believe everyone should have access to preserving their precious memories, so we offer flexible options for different budgets and needs.",
    category: "Pricing"
  },
  {
    question: "Can I interact with my preserved conversations or just read them?",
    answer: "Talkers goes beyond simple storage - you can actually interact with your preserved conversations through our AI-powered interface. This allows for meaningful engagement with your memories while respecting the original context and emotional significance.",
    category: "Features"
  },
  {
    question: "How do I know which conversations to preserve?",
    answer: "Look for conversations that made you laugh, cry, feel loved, or provided comfort. Daily exchanges with close family, voice messages, conversations during milestones, and any chats that capture someone's unique personality are typically the most meaningful to preserve.",
    category: "Content"
  },
  {
    question: "Is there a limit to how much I can preserve?",
    answer: "Our plans accommodate different storage needs, from casual users to those with extensive conversation histories. We can help you identify the most meaningful content to prioritize if you have storage concerns.",
    category: "Technical"
  },
  {
    question: "What if the person in my conversations doesn't want them preserved?",
    answer: "We respect privacy and consent. Before preserving conversations with others, it's important to consider their privacy. Talkers provides tools to anonymize or selectively preserve content while maintaining emotional value for personal healing and remembrance.",
    category: "Ethics"
  },
  {
    question: "Can preserved conversations help children remember deceased parents?",
    answer: "Yes, many families find that preserved conversations become valuable resources for children to connect with deceased parents. Voice messages, bedtime stories, and everyday conversations can provide ongoing comfort and connection as children grow.",
    category: "Family"
  },
  {
    question: "How do I start preserving my digital memories?",
    answer: "Getting started is simple: sign up for a Talkers account, follow our guided export process for your chosen messaging platform, upload your conversations, and begin exploring your preserved memories. We provide step-by-step support throughout the process.",
    category: "Getting Started"
  }
];

const categories = Array.from(new Set(faqData.map(faq => faq.category)));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Digital Memory Preservation FAQ",
  "description": "Frequently asked questions about digital memory preservation, WhatsApp conversation storage, and grief support",
  "mainEntity": faqData.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function FAQPage() {
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
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">FAQ</Badge>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Frequently Asked
              <br />
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Questions</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Get answers to common questions about digital memory preservation, WhatsApp conversation 
              storage, grief support, and how technology can help maintain emotional connections.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Everything You Need to Know</p>
                <p className="text-sm text-gray-500">Updated regularly with new questions</p>
              </div>
            </div>
          </header>

          {/* Category Navigation */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="px-4 py-2 bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200/50 cursor-pointer transition-all hover:scale-105"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">15+ Questions</h3>
                <p className="text-sm text-gray-600">About digital memory preservation</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-sm text-gray-600">Your data security questions answered</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Grief Support</h3>
                <p className="text-sm text-gray-600">How technology helps healing</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Sections by Category */}
          {categories.map((category) => (
            <section key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                {category === 'General' && <HelpCircle className="w-6 h-6 text-blue-600" />}
                {category === 'Technology' && <MessageCircle className="w-6 h-6 text-green-600" />}
                {category === 'Privacy' && <Shield className="w-6 h-6 text-red-600" />}
                {category === 'Grief Support' && <Heart className="w-6 h-6 text-purple-600" />}
                {category === 'Content' && <Users className="w-6 h-6 text-orange-600" />}
                {category === 'How-To' && <Clock className="w-6 h-6 text-indigo-600" />}
                {category}
              </h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqData
                  .filter(faq => faq.category === category)
                  .map((faq, index) => (
                    <AccordionItem
                      key={`${category}-${index}`}
                      value={`${category}-${index}`}
                      className="bg-white rounded-lg border border-gray-200 px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-purple-600">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))}

          {/* Contact Section */}
          <section className="mt-16">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can&apos;t find the answer you&apos;re looking for? Our support team is here to help 
                  you understand how digital memory preservation can support your emotional well-being 
                  and preserve your most precious conversations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Related Resources */}
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Related Resources</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Getting Started Guide</h4>
                  <p className="text-gray-600 text-sm mb-4">Step-by-step instructions for preserving your first conversations and getting the most from Talkers.</p>
                  <Link href="/blog/getting-started-guide">
                    <Button variant="outline" size="sm">Learn More</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy & Security Details</h4>
                  <p className="text-gray-600 text-sm mb-4">Comprehensive information about how we protect your data and maintain your privacy.</p>
                  <Link href="/privacy">
                    <Button variant="outline" size="sm">Read More</Button>
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
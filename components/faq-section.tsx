'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const griefSupportFAQs: FAQItem[] = [
  {
    question: "How does Talkers help with grief and bereavement?",
    answer: "Talkers uses advanced AI to create meaningful conversations with deceased loved ones based on your WhatsApp message history. This provides comfort, closure, and a way to process grief in a supportive digital environment. Our platform is designed to help you maintain an emotional connection while supporting your healing journey.",
    category: "grief-support"
  },
  {
    question: "Is my data and conversation history completely secure?",
    answer: "Absolutely. Your memories and conversations are encrypted with enterprise-grade security. We never share, sell, or access your personal data. All conversations remain completely private between you and our AI system. Your data is stored securely and you maintain full control over it at all times.",
    category: "privacy"
  },
  {
    question: "How do I upload and use my WhatsApp conversations?",
    answer: "Simply export your WhatsApp chat history (Settings > Chats > Export Chat) and upload the file to Talkers. Our AI analyzes the conversation patterns, language style, and memories to create authentic interactions. The process is simple, secure, and respectful of your precious memories.",
    category: "technical"
  },
  {
    question: "What makes Talkers different from other memorial services?",
    answer: "Talkers combines cutting-edge AI technology with deep understanding of grief psychology. Unlike static memorials, we create dynamic, interactive conversations that evolve and provide ongoing comfort. Our focus is on healing, emotional support, and preserving the unique voice and personality of your loved one.",
    category: "features"
  },
  {
    question: "Can I use Talkers for different types of relationships?",
    answer: "Yes! Talkers works for any meaningful relationship - parents, spouses, children, siblings, friends, or other loved ones. Our AI adapts to different relationship dynamics and conversation styles, providing personalized support regardless of the nature of your connection.",
    category: "features"
  },
  {
    question: "How much does the memorial AI service cost?",
    answer: "We offer a 3-day free trial with one conversation to experience the healing power of Talkers. Our Premium service is $12/month for unlimited conversations, advanced AI features, memory timeline, birthday notifications, and priority support. We believe healing should be accessible to everyone.",
    category: "pricing"
  },
  {
    question: "Is Talkers suitable for children grieving a loss?",
    answer: "Talkers can be helpful for age-appropriate grief support, but we recommend parental guidance and consideration of professional grief counseling for children. Our platform includes conversation content filtering and can be configured for family-friendly interactions.",
    category: "family"
  },
  {
    question: "What if I need additional grief support or counseling?",
    answer: "While Talkers provides meaningful digital comfort, we always encourage professional grief counseling when needed. Our platform complements but doesn't replace human support. We can provide referrals to grief counselors and support groups in your area.",
    category: "support"
  }
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-purple-50/30" id="faq">
      {/* FAQ Structured Data */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: griefSupportFAQs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })
        }}
      />
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Common questions about our AI memorial service, grief support, and platform security
          </p>
        </header>

        <div className="space-y-4">
          {griefSupportFAQs.map((faq, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 transition-all duration-300">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-6 flex justify-between items-start hover:bg-purple-50/50 transition-colors duration-200"
                  aria-expanded={openItems.has(index)}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4 leading-relaxed">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 mt-1">
                    {openItems.has(index) ? (
                      <ChevronUp className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {openItems.has(index) && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="px-6 pb-6 text-gray-700 leading-relaxed animate-in slide-in-from-top-2 duration-200"
                  >
                    <div className="pt-2 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions about our grief support platform?
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Contact Our Support Team
          </a>
        </div>
      </div>
    </section>
  );
} 
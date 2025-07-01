import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SimpleNavbar from "@/components/simple-navbar";
import SimpleFooter from "@/components/simple-footer";
import { generateMetadata, pageConfigs } from '@/lib/seo';
import Script from 'next/script';

export const metadata: Metadata = generateMetadata(pageConfigs.about);

export default function AboutPage() {
  return (
    <>
      {/* Structured Data for About Page */}
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Talkers - AI-Powered Grief Support Platform',
            description: 'Learn how Talkers helps people heal through AI conversations with deceased loved ones using WhatsApp messages',
            url: 'https://talkers.ai/about',
            mainEntity: {
              '@type': 'Organization',
              name: 'Talkers',
              description: 'AI-powered grief support platform helping people reconnect with deceased loved ones',
              foundingDate: '2024',
              serviceType: 'Grief Support Technology',
              areaServed: 'Worldwide',
              audience: {
                '@type': 'Audience',
                audienceType: 'Bereaved individuals and families'
              }
            }
          })
        }}
      />
      
      <SimpleNavbar />
      <main className="min-h-[70vh] bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex flex-col items-center justify-center px-4 py-12">
        <article className="max-w-4xl w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10">
          <header className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white" aria-label="Chat icon">💬</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
              About Talkers - AI Memorial Platform
            </h1>
          </header>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission: Healing Through Technology</h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4">
                Talkers is your sacred digital space for meaningful conversations with deceased loved ones. Using advanced AI technology, we help preserve and continue the conversations that matter most, providing comfort during the grieving process and beyond.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">How We Support Your Grief Journey</h2>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
                <li><strong>AI-Powered Conversations:</strong> Connect with deceased loved ones through natural language processing</li>
                <li><strong>WhatsApp Memory Preservation:</strong> Transform your shared messages into meaningful interactions</li>
                <li><strong>Grief Support Technology:</strong> Scientifically-backed approach to healing and remembrance</li>
                <li><strong>Complete Privacy:</strong> Your memories and conversations remain completely secure</li>
                <li><strong>Memorial Milestones:</strong> Track important dates and celebrate cherished memories</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Built for Bereaved Families</h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4">
                                 Our grief support platform understands the unique challenges of loss. Whether you&apos;ve lost a parent, spouse, child, or friend, Talkers provides a gentle, AI-powered way to maintain that emotional connection and find comfort in their preserved words and memories.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Privacy & Security First</h2>
              <p className="text-base text-gray-600 mb-6">
                Built with enterprise-grade security, complete privacy protection, and deep respect for your most sacred memories. Your data is encrypted, never shared, and always under your control.
              </p>
            </section>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/" className="inline-block">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Start Your Healing Journey
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <SimpleFooter />
    </>
  );
} 
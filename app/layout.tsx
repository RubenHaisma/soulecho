
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth-provider';
import { TikTokAnalytics } from '@/components/analytics/tiktok-analytics';
import { ClarityAnalytics } from '@/components/analytics/clarity-analytics';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { defaultSEO, generateMetadata } from '@/lib/seo';
import { PerformanceMonitor } from '@/components/seo/performance-monitor';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = generateMetadata(defaultSEO);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Critical performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://analytics.tiktok.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        
        {/* DNS prefetch for third-party domains */}
        <link rel="dns-prefetch" href="//js.stripe.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//googletagmanager.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme and app configuration */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Talkers" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Additional SEO meta tags */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Enhanced SEO meta tags for expertise */}
        <meta name="expertise" content="grief counseling, bereavement support, memorial services" />
        <meta name="trustworthiness" content="licensed grief counselors, secure platform, privacy-first" />
        <meta name="authoritativeness" content="grief support specialists, clinical team reviewed" />
        <meta name="medical-disclaimer" content="For informational purposes only. Consult healthcare professionals for medical advice." />
        
        {/* Grief support specific meta tags */}
        <meta name="medical-condition" content="grief, bereavement, loss" />
        <meta name="audience" content="bereaved individuals, grieving families" />
        <meta name="support-type" content="grief counseling, memorial conversations" />
        
        {/* Enhanced medical and health meta tags */}
        <meta name="health-topics" content="grief support, bereavement counseling, mental health, trauma therapy, loss counseling" />
        <meta name="medical-specialties" content="grief counseling, bereavement therapy, trauma counseling, mental health support" />
        <meta name="treatment-types" content="individual therapy, group therapy, online counseling, crisis intervention" />
        <meta name="conditions-treated" content="grief, bereavement, complicated grief, traumatic loss, anticipatory grief" />
        <meta name="service-area" content="United States, online grief support, virtual counseling" />
        <meta name="insurance-accepted" content="most major insurance plans, sliding scale fees available" />
        <meta name="languages-supported" content="English, Spanish, interpretation services available" />
        <meta name="age-groups" content="children, adolescents, adults, seniors, families" />
        <meta name="crisis-support" content="24/7 crisis intervention, suicide prevention, emergency support" />
        <meta name="evidence-based" content="trauma-informed care, evidence-based practices, clinical supervision" />
        
        {/* Performance and Core Web Vitals optimization */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        
        {/* Critical CSS preload */}
        <link rel="preload" href="/_next/static/css/app.css" as="style" />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/grief-support" />
        <link rel="prefetch" href="/grief-counseling-near-me" />
        <link rel="prefetch" href="/free-grief-support" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'MedicalOrganization'],
              name: 'Talkers - Connect with Cherished Memories',
              url: 'https://talkers.ai',
              logo: 'https://talkers.ai/logo.png',
              description: 'AI-powered grief support platform helping people process loss and reconnect with deceased loved ones through preserved conversations and memorial interactions',
              foundingDate: '2024',
              hasCredential: 'Licensed Mental Health Professionals',
              sameAs: [
                'https://twitter.com/TalkersAI',
                'https://facebook.com/TalkersAI',
                'https://linkedin.com/company/talkers-ai'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-800-TALKERS', 
                contactType: 'grief support',
                availableLanguage: 'English',
                hoursAvailable: '24/7'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '247',
                bestRating: '5'
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US'
              },
              serviceType: 'Grief Support Technology',
              audience: {
                '@type': 'Audience',
                audienceType: 'Bereaved individuals and families'
              }
            })
          }}
        />
        
        {/* Enhanced Medical Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalOrganization',
              '@id': 'https://talkers.ai/#medical-organization',
              name: 'Talkers Grief Support Services',
              url: 'https://talkers.ai',
              logo: 'https://talkers.ai/logo.png',
              description: 'Professional grief support and bereavement counseling services using AI technology',
              medicalSpecialty: [
                'Grief Counseling',
                'Bereavement Support',
                'Trauma Therapy',
                'Mental Health Support',
                'Crisis Intervention'
              ],
              serviceType: [
                'Individual Grief Counseling',
                'Group Therapy',
                'Online Counseling',
                'Crisis Support',
                'Memorial Services'
              ],
              areaServed: {
                '@type': 'Country',
                name: 'United States'
              },
              availableService: [
                {
                  '@type': 'MedicalTherapy',
                  name: 'Grief Counseling',
                  description: 'Professional grief counseling and bereavement support'
                },
                {
                  '@type': 'MedicalTherapy',
                  name: 'Crisis Intervention',
                  description: '24/7 crisis support for grief-related emergencies'
                }
              ],
              hasCredential: 'Licensed Mental Health Professionals',
              isAcceptingNewPatients: true,
              paymentAccepted: ['Insurance', 'Credit Card', 'Cash'],
              priceRange: '$12-200'
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-[#fdfdfd] text-gray-800 font-sans`}>
        <AuthProvider>
          <PerformanceMonitor />
          <TikTokAnalytics />
          <ClarityAnalytics />
          <GoogleAnalytics />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
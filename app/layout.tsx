
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth-provider';
import { TikTokAnalytics } from '@/components/analytics/tiktok-analytics';
import { ClarityAnalytics } from '@/components/analytics/clarity-analytics';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { defaultSEO, generateMetadata } from '@/lib/seo';

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
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Additional SEO meta tags */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Talkers - Connect with Cherished Memories',
              url: 'https://talkers.ai',
              logo: 'https://talkers.ai/logo.png',
              description: 'AI-powered grief support platform helping people reconnect with deceased loved ones through preserved WhatsApp conversations',
              foundingDate: '2024',
              sameAs: [
                'https://twitter.com/TalkersAI',
                'https://facebook.com/TalkersAI',
                'https://linkedin.com/company/talkers-ai'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-800-TALKERS',
                contactType: 'customer service',
                availableLanguage: 'English'
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US'
              },
              serviceType: 'Grief Support Technology'
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-[#fdfdfd] text-gray-800 font-sans`}>
        <AuthProvider>
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
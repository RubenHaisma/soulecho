'use client';

import Head from 'next/head';
import { SEOConfig, generateSchema } from '@/lib/seo';

interface SEOHeadProps extends SEOConfig {
  url: string;
}

export default function SEOHead(props: SEOHeadProps) {
  const schemas = generateSchema(props);
  
  return (
    <Head>
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://analytics.tiktok.com" />
      
      {/* DNS prefetch for third-party domains */}
      <link rel="dns-prefetch" href="//www.clarity.ms" />
      <link rel="dns-prefetch" href="//js.stripe.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            schemas.baseSchema,
            schemas.webPageSchema,
            schemas.serviceSchema,
            schemas.faqSchema
          ])
        }}
      />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Talkers" />
      
      {/* Alternate language versions */}
      <link rel="alternate" hrefLang="en" href={props.url} />
      <link rel="alternate" hrefLang="x-default" href={props.url} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={props.canonical || props.url} />
      
      {/* Favicon and app icons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Performance hints */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Additional meta tags for better indexing */}
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Pinterest verification */}
      <meta name="p:domain_verify" content={process.env.PINTEREST_VERIFICATION} />
      
      {/* Microsoft clarity no-cookie mode */}
      <meta name="msvalidate.01" content={process.env.BING_VERIFICATION} />
    </Head>
  );
} 
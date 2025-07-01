import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  type?: 'website' | 'article' | 'service';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  schema?: any;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://talkers.ai';
const siteName = 'Talkers - Connect with Cherished Memories';

// Core grief support and memorial service keywords
const coreKeywords = [
  'ai memorial service',
  'grief support platform',
  'connect with deceased loved ones',
  'whatsapp memories ai',
  'digital memorial conversations',
  'bereavement support technology',
  'memorial ai chat',
  'grief healing through ai',
  'deceased loved one conversations',
  'memorial message preservation',
  'grief counseling technology',
  'ai powered grief support',
  'virtual memorial service',
  'death anniversary support',
  'remembrance platform',
  'grief recovery tools',
  'memorial conversation ai',
  'bereavement chatbot',
  'deceased family member chat',
  'grief therapy platform'
];

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = `${baseUrl}/og-image.png`,
    noIndex = false,
    canonical,
    type = 'website'
  } = config;

  const fullTitle = title.includes('Talkers') ? title : `${title} | ${siteName}`;
  const allKeywords = [...coreKeywords, ...keywords].join(', ');

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'Talkers Team' }],
    creator: 'Talkers',
    publisher: 'Talkers',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical || baseUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || baseUrl,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'article' ? 'article' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@TalkersAI',
      site: '@TalkersAI',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    category: 'Health & Wellness',
  };
}

export function generateSchema(config: SEOConfig & { url: string }) {
  const { title, description, url, type, publishedTime, modifiedTime, author } = config;
  
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
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
    }
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || new Date().toISOString(),
    author: author ? {
      '@type': 'Person',
      name: author
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    }
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Memorial Conversation Service',
    description: 'Connect with deceased loved ones through AI-powered conversations using preserved WhatsApp messages',
    provider: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl
    },
    serviceType: 'Grief Support Technology',
    audience: {
      '@type': 'Audience',
      audienceType: 'Bereaved individuals and families'
    },
    category: 'Mental Health & Grief Support',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Memorial AI Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Trial',
            description: '3-day trial with one conversation'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Premium Service',
            description: 'Unlimited conversations with advanced features'
          },
          price: '12',
          priceCurrency: 'USD'
        }
      ]
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does Talkers help with grief?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Talkers uses AI to help you have meaningful conversations with deceased loved ones using your preserved WhatsApp messages, providing comfort and closure during the grieving process.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is my data secure and private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, your memories and conversations are completely private and secure. We use enterprise-grade encryption and never share your personal data.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I upload WhatsApp conversations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply export your WhatsApp chat history and upload it securely to our platform. Our AI will analyze the conversation patterns to enable meaningful interactions.'
        }
      }
    ]
  };

  return {
    baseSchema,
    webPageSchema,
    serviceSchema,
    faqSchema
  };
}

export const defaultSEO: SEOConfig = {
  title: 'Talkers - Connect with Cherished Memories Through AI',
  description: 'A sacred space to reconnect with deceased loved ones through AI-powered conversations using your WhatsApp messages. Preserve memories, find comfort, and heal through technology.',
  keywords: coreKeywords,
  type: 'website'
};

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: 'Talkers - AI Memorial Conversations with Deceased Loved Ones',
    description: 'Connect with deceased loved ones through AI-powered conversations using your WhatsApp messages. A gentle grief support platform for healing and remembrance.',
    keywords: ['ai memorial conversations', 'grief support platform', 'whatsapp memories', 'deceased loved ones chat']
  },
  about: {
    title: 'About Talkers - AI-Powered Grief Support & Memorial Platform',
    description: 'Learn how Talkers helps people heal through AI conversations with deceased loved ones. Our mission is to preserve memories and provide comfort through technology.',
    keywords: ['grief support technology', 'memorial ai platform', 'bereavement assistance']
  },
  pricing: {
    title: 'Pricing - Affordable Memorial AI Conversations | Talkers',
    description: 'Start your healing journey with our free trial. Premium plans from $12/month for unlimited conversations with deceased loved ones through AI.',
    keywords: ['memorial ai pricing', 'grief support cost', 'affordable memorial service']
  },
  privacy: {
    title: 'Privacy Policy - Secure Memorial Data Protection | Talkers',
    description: 'Your memories are sacred. Learn how we protect your personal data and conversations with enterprise-grade security and privacy measures.',
    keywords: ['memorial data privacy', 'secure grief platform', 'whatsapp data protection']
  },
  contact: {
    title: 'Contact Talkers - Get Support for Your Memorial AI Journey',
    description: 'Need help with your memorial conversations? Contact our compassionate support team for assistance with grief support and platform guidance.',
    keywords: ['grief support contact', 'memorial ai help', 'bereavement assistance']
  }
}; 
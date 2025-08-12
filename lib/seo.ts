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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://talkers.pro';
const siteName = 'Talkers - Keep Their Words Forever';

// Core grief support, crisis counseling, and conversation preservation keywords
const coreKeywords = [
  // Grief support and crisis counseling keywords
  'grief support online',
  'grief counseling chat',
  'bereavement support',
  'loss counseling',
  'grief hotline',
  'crisis support chat',
  'emotional support online',
  'grief therapy online',
  'mourning support',
  'dealing with loss',
  'grief counselor online',
  'bereavement counseling',
  'death support groups',
  'grief help online',
  'coping with grief',
  'loss support chat',
  'grief recovery support',
  'trauma counseling',
  'emotional healing support',
  'grief assistance online',
  'mental health grief support',
  'anonymous grief support',
  'free grief counseling',
  '24/7 grief support',
  'immediate grief help',
  'online grief therapy',
  'grief support services',
  'bereavement care',
  'grief intervention',
  'crisis counseling online',
  
  // Memory preservation keywords
  'whatsapp conversation archive',
  'preserve text messages',
  'digital memory preservation',
  'conversation backup',
  'chat history keeper',
  'whatsapp memory book',
  'text message preservation',
  'digital conversation scrapbook',
  'memorial message archive',
  'deceased loved one messages',
  'family conversation backup',
  'whatsapp chat export',
  'conversation memory keeper',
  'digital legacy preservation',
  'message archive platform',
  'whatsapp memories',
  'preserve family conversations',
  'chat history preservation',
  'digital memory book',
  'conversation timeline',
  'whatsapp backup online',
  'text message archive',
  'family text messages',
  'preserve loved one messages',
  'digital conversation keeper',
  'ai conversation partner',
  'interactive memory archive',
  'chat with memories',
  'digital family history',
  'conversation nostalgia',
  'whatsapp ai chat',
  'memorial conversation app',
  'digital remembrance',
  'ai memory companion',
  'preserve digital legacy',
  'family message history',
  'loved one message backup',
  'conversation timeline app',
  'digital scrapbook messages'
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
    '@type': 'HealthAndBeautyBusiness',
    name: 'Talkers - Grief Support & Memorial AI Services',
    description: 'Professional grief support services including 24/7 crisis counseling and AI memorial conversations using preserved messages',
    provider: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl
    },
    serviceType: 'Mental Health & Grief Support',
    audience: {
      '@type': 'Audience',
      audienceType: 'Bereaved individuals, families, and people in crisis'
    },
    category: 'Mental Health & Grief Support',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Crisis Support',
      availableLanguage: 'English',
      hoursAvailable: '24/7',
      serviceUrl: `${baseUrl}/hotline`
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Grief Support & Memorial Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Crisis Support Hotline',
            description: 'Free 24/7 anonymous grief support and crisis counseling',
            isAccessibleForFree: true,
            serviceUrl: `${baseUrl}/hotline`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Memorial AI Conversations',
            description: 'Interactive conversations with deceased loved ones using preserved messages'
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
  title: 'Talkers - Turn WhatsApp Conversations into Interactive Memories',
  description: 'Preserve your WhatsApp conversations forever and chat with AI versions of your loved ones. Upload your messages and relive their personality, humor, and love whenever you need it.',
  keywords: coreKeywords,
  type: 'website'
};

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: 'Talkers - Turn WhatsApp Messages into Interactive AI Memories',
    description: 'Preserve your WhatsApp conversations and chat with AI versions of your loved ones. Upload messages, relive their personality, and keep their words forever.',
    keywords: ['whatsapp ai chat', 'preserve text messages', 'interactive memory archive', 'digital conversation keeper']
  },
  about: {
    title: 'About Talkers - WhatsApp Conversation Archive & AI Memory Platform',
    description: 'Learn how Talkers helps preserve your precious conversations and create interactive memories. Turn your messages into lasting digital keepsakes.',
    keywords: ['conversation preservation', 'digital memory platform', 'whatsapp archive']
  },
  pricing: {
    title: 'Pricing - Affordable WhatsApp Conversation Preservation | Talkers',
    description: 'Start free forever with conversation archiving. Upgrade from $4.99/month for AI chat features. Keep your loved ones\' words and personality alive.',
    keywords: ['whatsapp backup pricing', 'conversation archive cost', 'digital memory preservation']
  },
  privacy: {
    title: 'Privacy Policy - Secure Conversation Data Protection | Talkers',
    description: 'Your conversations are private and secure. Learn how we protect your personal messages with enterprise-grade security and privacy measures.',
    keywords: ['conversation data privacy', 'secure message platform', 'whatsapp data protection']
  },
  contact: {
    title: 'Contact Talkers - Get Support for Your Digital Memory Journey',
    description: 'Need help with your conversation archive? Contact our support team for assistance with message preservation and AI memory features.',
    keywords: ['memory platform support', 'conversation archive help', 'digital preservation assistance']
  },
  hotline: {
    title: 'Grief Support Hotline - 24/7 Free Crisis Counseling | Talkers',
    description:
      'Free, anonymous grief support available 24/7. Talk to someone who understands your loss. If you are in immediate crisis, call 988 (US) or text HOME to 741741.',
    keywords: [
      'grief hotline',
      'crisis support chat',
      '24/7 grief support',
      'anonymous grief support',
      'bereavement helpline',
      'immediate grief help',
      'grief counseling online'
    ],
    type: 'service'
  }
}; 
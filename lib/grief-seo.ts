import { Metadata } from 'next';

export interface GriefSEOConfig {
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
  griefStage?: 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance' | 'general';
  lossType?: 'parent' | 'spouse' | 'child' | 'pet' | 'friend' | 'general';
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://talkers.pro';
const siteName = 'Talkers - Grief Support & Memorial Conversations';

// Comprehensive grief-related keywords targeting different search intents
const griefKeywords = {
  // Immediate grief (high search volume, emotional urgency)
  immediate: [
    'what to do when someone dies',
    'how to cope with sudden death',
    'grief support immediately after death',
    'first steps after losing someone',
    'emergency grief help',
    'sudden loss support',
    'what to expect after someone dies',
    'immediate grief counseling',
    'crisis grief support',
    'how to handle death of loved one'
  ],
  
  // Understanding grief (informational intent)
  understanding: [
    'stages of grief explained',
    'how long does grief last',
    'complicated grief symptoms',
    'grief vs depression difference',
    'normal grief reactions',
    'anticipatory grief meaning',
    'disenfranchised grief examples',
    'grief brain fog symptoms',
    'physical symptoms of grief',
    'grief fatigue signs'
  ],
  
  // Support seeking (high commercial intent)
  support: [
    'grief support groups near me',
    'online grief counseling',
    'grief therapy options',
    'bereavement support services',
    'grief chat rooms',
    'virtual grief support',
    'grief counselor online',
    'bereavement helpline',
    'grief support apps',
    'online memorial services'
  ],
  
  // Specific loss types (targeted, emotional)
  lossTypes: [
    'losing a parent grief',
    'spouse death grief support',
    'child loss grief help',
    'pet loss grief counseling',
    'sudden death grief',
    'suicide loss support',
    'miscarriage grief support',
    'elderly parent death grief',
    'young spouse death',
    'unexpected death grief'
  ],
  
  // Coping strategies (practical help)
  coping: [
    'how to cope with grief',
    'grief coping strategies',
    'dealing with grief alone',
    'grief self care tips',
    'managing grief at work',
    'grief during holidays',
    'anniversary grief reactions',
    'birthday grief after death',
    'grief triggers management',
    'healthy grief processing'
  ],
  
  // Memorial and remembrance (continuing bonds)
  memorial: [
    'ways to honor deceased loved one',
    'memorial ideas for loved one',
    'keeping memory alive after death',
    'digital memorial services',
    'online memorial websites',
    'memorial conversation ideas',
    'remembering deceased parent',
    'memorial rituals for grief',
    'continuing bonds with deceased',
    'preserving memories after death'
  ]
};

export function generateGriefMetadata(config: GriefSEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = `${baseUrl}/grief-support-og.png`,
    noIndex = false,
    canonical,
    type = 'website',
    griefStage,
    lossType
  } = config;

  // Build comprehensive keyword list based on grief stage and loss type
  let allKeywords = [...keywords];
  
  if (griefStage) {
    allKeywords.push(...griefKeywords.understanding);
    allKeywords.push(...griefKeywords.coping);
  }
  
  if (lossType && lossType !== 'general') {
    allKeywords.push(...griefKeywords.lossTypes.filter(k => k.includes(lossType)));
  }
  
  // Add general grief keywords
  allKeywords.push(...griefKeywords.support);
  allKeywords.push(...griefKeywords.memorial);

  const fullTitle = title.includes('Talkers') ? title : `${title} | ${siteName}`;
  const keywordString = Array.from(new Set(allKeywords)).join(', ');

  return {
    title: fullTitle,
    description,
    keywords: keywordString,
    authors: [{ name: 'Talkers Grief Support Team' }],
    creator: 'Talkers',
    publisher: 'Talkers',
    category: 'Health & Wellness, Grief Support',
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
    other: {
      'grief-stage': griefStage || 'general',
      'loss-type': lossType || 'general',
      'support-type': 'digital-memorial-conversations'
    }
  };
}

export function generateGriefSchema(config: GriefSEOConfig & { url: string }) {
  const { title, description, url, type, griefStage, lossType } = config;
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'AI-powered grief support platform helping people process loss through preserved conversations and memorial interactions',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/TalkersAI',
      'https://facebook.com/TalkersAI'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-TALKERS',
      contactType: 'grief support',
      availableLanguage: 'English',
      hoursAvailable: '24/7'
    },
    serviceType: 'Grief Support Technology',
    audience: {
      '@type': 'Audience',
      audienceType: 'Bereaved individuals and families'
    }
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    url,
    about: {
      '@type': 'MedicalCondition',
      name: 'Grief and Bereavement',
      code: {
        '@type': 'MedicalCode',
        code: 'Z63.4',
        codingSystem: 'ICD-10'
      }
    },
    audience: {
      '@type': 'Patient',
      requiredGender: 'Any',
      suggestedMinAge: 13
    },
    lastReviewed: new Date().toISOString(),
    reviewedBy: {
      '@type': 'Organization',
      name: 'Talkers Clinical Team'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How can digital conversations help with grief?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Digital conversations with deceased loved ones through AI can provide comfort, closure, and a way to process grief by maintaining emotional connections while supporting healthy mourning.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is it healthy to talk to AI versions of deceased people?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When used as part of a comprehensive grief support approach, AI conversations can be a healthy tool for processing loss, maintaining continuing bonds, and finding comfort during difficult times.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I preserve conversations with someone who died?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can preserve meaningful conversations by exporting chat histories from messaging apps like WhatsApp, then uploading them to memorial platforms that can help you interact with those memories.'
        }
      }
    ]
  };

  return {
    organizationSchema,
    serviceSchema,
    faqSchema
  };
}

// Page-specific SEO configurations for grief support
export const griefPageConfigs = {
  home: {
    title: 'Grief Support Through AI Memorial Conversations | Talkers',
    description: 'Find comfort in conversations with deceased loved ones through AI. Preserve WhatsApp memories, process grief, and maintain emotional connections in a safe, supportive environment.',
    keywords: ['grief support', 'memorial conversations', 'AI grief help', 'bereavement support', 'digital memorial'],
    griefStage: 'general' as const,
    lossType: 'general' as const
  },
  
  immediateHelp: {
    title: 'Immediate Grief Support - What to Do When Someone Dies | Talkers',
    description: 'Urgent grief support for those who just lost someone. Find immediate comfort, practical guidance, and emotional support through AI memorial conversations.',
    keywords: ['what to do when someone dies', 'immediate grief help', 'sudden death support', 'emergency grief counseling'],
    griefStage: 'denial' as const,
    lossType: 'general' as const
  },
  
  copingStrategies: {
    title: 'Grief Coping Strategies & Support - How to Deal with Loss | Talkers',
    description: 'Evidence-based grief coping strategies and emotional support. Learn healthy ways to process loss, manage grief symptoms, and find comfort through memorial conversations.',
    keywords: ['grief coping strategies', 'how to cope with grief', 'dealing with loss', 'grief management'],
    griefStage: 'depression' as const,
    lossType: 'general' as const
  },
  
  parentLoss: {
    title: 'Losing a Parent - Grief Support for Adult Children | Talkers',
    description: 'Specialized grief support for adults who lost a parent. Process your loss, preserve precious memories, and find comfort through AI conversations with your deceased parent.',
    keywords: ['losing a parent grief', 'parent death support', 'adult orphan grief', 'deceased parent conversations'],
    griefStage: 'general' as const,
    lossType: 'parent' as const
  },
  
  spouseLoss: {
    title: 'Widow & Widower Grief Support - Losing a Spouse | Talkers',
    description: 'Compassionate support for widows and widowers. Navigate spouse loss, preserve your relationship memories, and find comfort through AI memorial conversations.',
    keywords: ['widow grief support', 'widower bereavement', 'spouse death grief', 'losing husband wife'],
    griefStage: 'general' as const,
    lossType: 'spouse' as const
  },
  
  childLoss: {
    title: 'Child Loss Grief Support - Bereaved Parents | Talkers',
    description: 'Specialized support for parents who lost a child. Honor your child\'s memory, process unimaginable grief, and find moments of comfort through preserved conversations.',
    keywords: ['child loss grief', 'bereaved parents support', 'losing a child', 'child death grief counseling'],
    griefStage: 'general' as const,
    lossType: 'child' as const
  },
  
  petLoss: {
    title: 'Pet Loss Grief Support - When Your Pet Dies | Talkers',
    description: 'Understanding pet loss grief and finding support. Your pet was family - honor their memory and process your loss with compassionate AI memorial conversations.',
    keywords: ['pet loss grief', 'dog death grief', 'cat loss support', 'pet bereavement counseling'],
    griefStage: 'general' as const,
    lossType: 'pet' as const
  },
  
  holidayGrief: {
    title: 'Holiday Grief Support - Coping with Loss During Holidays | Talkers',
    description: 'Navigate grief during holidays and special occasions. Find comfort, manage difficult emotions, and honor your loved one\'s memory during challenging times.',
    keywords: ['holiday grief', 'grief during Christmas', 'birthday grief after death', 'anniversary grief'],
    griefStage: 'depression' as const,
    lossType: 'general' as const
  },
  
  griefStages: {
    title: 'Understanding the 5 Stages of Grief - Complete Guide | Talkers',
    description: 'Comprehensive guide to the 5 stages of grief: denial, anger, bargaining, depression, and acceptance. Learn what to expect and how to navigate each stage.',
    keywords: ['stages of grief explained', '5 stages of grief', 'grief stages order', 'kubler ross grief model'],
    griefStage: 'general' as const,
    lossType: 'general' as const
  },
  
  complicatedGrief: {
    title: 'Complicated Grief Symptoms & Treatment | Talkers',
    description: 'Recognize complicated grief symptoms and find specialized support. When normal grief becomes prolonged or intense, discover treatment options and healing paths.',
    keywords: ['complicated grief symptoms', 'prolonged grief disorder', 'complicated bereavement', 'grief therapy'],
    griefStage: 'depression' as const,
    lossType: 'general' as const
  },
  
  griefSupport: {
    title: 'Online Grief Support Groups & Counseling | Talkers',
    description: 'Find online grief support groups, virtual counseling, and 24/7 bereavement help. Connect with others who understand your loss in a safe, supportive environment.',
    keywords: ['online grief support', 'virtual grief counseling', 'grief support groups', 'bereavement chat'],
    griefStage: 'general' as const,
    lossType: 'general' as const
  }
};
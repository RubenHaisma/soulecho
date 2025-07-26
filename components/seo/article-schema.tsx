'use client';

import Script from 'next/script';

interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
  wordCount?: number;
  readingTime?: string;
}

export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image = '/og-image.png',
  url,
  wordCount,
  readingTime
}: ArticleSchemaProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: `https://talkers.pro${image}`,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Talkers',
      logo: {
        '@type': 'ImageObject',
        url: 'https://talkers.pro/logo.png'
      }
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    wordCount,
    timeRequired: readingTime,
    about: {
      '@type': 'Thing',
      name: 'Grief Support and Bereavement'
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Bereaved individuals seeking support'
    }
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleSchema)
      }}
    />
  );
}
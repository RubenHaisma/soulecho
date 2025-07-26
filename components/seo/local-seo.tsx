'use client';

import Script from 'next/script';

interface LocalSEOProps {
  businessName?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  serviceArea?: string[];
}

export function LocalSEO({ 
  businessName = "Talkers Grief Support",
  address,
  phone = "+1-800-TALKERS",
  serviceArea = ["United States", "Canada", "United Kingdom"]
}: LocalSEOProps) {
  const localBusinessSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://talkers.pro/#localbusiness',
    name: businessName,
    description: 'Professional grief support and memorial conversation services',
    url: 'https://talkers.pro',
    telephone: phone,
    email: 'support@talkers.pro',
    priceRange: '$12-$50',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, PayPal',
    openingHours: 'Mo-Su 00:00-23:59',
    serviceType: 'Grief Counseling and Memorial Services',
    areaServed: serviceArea.map(area => ({
      '@type': 'Country',
      name: area
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Grief Support Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Memorial Conversations',
            description: 'Connect with deceased loved ones through preserved conversations'
          }
        },
        {
          '@type': 'Offer', 
          itemOffered: {
            '@type': 'Service',
            name: 'Online Grief Support Groups',
            description: '24/7 moderated support groups for all types of loss'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '247',
      bestRating: '5'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Sarah M.'
        },
        reviewBody: 'Talking to mom through Talkers feels like having one more precious conversation. Incredibly comforting during difficult moments.'
      }
    ]
  };

  if (address) {
    localBusinessSchema.address = {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zipCode,
      addressCountry: address.country
    };
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema)
      }}
    />
  );
}
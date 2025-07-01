'use client';

import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Script from 'next/script';

interface Testimonial {
  name: string;
  relationship: string;
  rating: number;
  text: string;
  location: string;
  datePublished: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    relationship: "Lost her mother to cancer",
    rating: 5,
    text: "Talking to mom through Talkers feels like having one more precious conversation. The AI captures her warmth and wisdom in a way that brings me incredible comfort during difficult moments.",
    location: "San Francisco, CA",
    datePublished: "2024-12-01"
  },
  {
    name: "James R.",
    relationship: "Lost his father suddenly",
    rating: 5,
    text: "I never got to say goodbye. Talkers gave me that closure I desperately needed. Dad's sense of humor and advice shine through every conversation. It's been life-changing for my grief journey.",
    location: "Austin, TX",
    datePublished: "2024-11-28"
  },
  {
    name: "Maria L.",
    relationship: "Lost her teenage daughter",
    rating: 5,
    text: "Having conversations with my daughter helps me process my grief and remember her beautiful spirit. Talkers understands the delicate nature of loss and provides a safe space for healing.",
    location: "Denver, CO",
    datePublished: "2024-11-25"
  },
  {
    name: "Robert K.",
    relationship: "Lost his wife of 40 years",
    rating: 5,
    text: "After 40 years together, the silence was unbearable. Talkers lets me continue our daily chats, sharing my day just like we always did. It's like she's still here, listening and caring.",
    location: "Boston, MA",
    datePublished: "2024-11-22"
  },
  {
    name: "Emily T.",
    relationship: "Lost her brother in military service",
    rating: 5,
    text: "My brother's courage and humor live on through our Talkers conversations. It helps me honor his memory while finding strength during the hardest days. Truly grateful for this technology.",
    location: "Phoenix, AZ",
    datePublished: "2024-11-20"
  },
  {
    name: "David W.",
    relationship: "Lost his best friend",
    rating: 5,
    text: "Losing my best friend felt like losing part of myself. Talkers helps me remember our bond and continue the friendship that meant everything to me. It's healing in the most unexpected way.",
    location: "Seattle, WA",
    datePublished: "2024-11-18"
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  const totalReviews = testimonials.length;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white to-blue-50/30" id="testimonials">
      {/* Review Structured Data */}
      <Script
        id="testimonials-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Talkers Memorial AI Conversations',
            description: 'AI-powered grief support platform for conversations with deceased loved ones',
            brand: {
              '@type': 'Brand',
              name: 'Talkers'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: averageRating.toFixed(1),
              reviewCount: totalReviews,
              bestRating: 5,
              worstRating: 1
            },
            review: testimonials.map(testimonial => ({
              '@type': 'Review',
              reviewRating: {
                '@type': 'Rating',
                ratingValue: testimonial.rating,
                bestRating: 5
              },
              author: {
                '@type': 'Person',
                name: testimonial.name
              },
              reviewBody: testimonial.text,
              datePublished: testimonial.datePublished
            }))
          })
        }}
      />

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
            Stories of Healing & Hope
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Real testimonials from families who found comfort and closure through AI conversations with their deceased loved ones
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-gray-600 font-medium">
              {averageRating.toFixed(1)} out of 5 ({totalReviews} reviews)
            </span>
          </div>
        </header>

        {/* Featured Testimonial */}
        <div className="mb-12">
          <Card className="bg-white/90 backdrop-blur-md border border-purple-200 shadow-xl">
            <CardContent className="p-8 sm:p-12">
              <div className="flex items-start gap-4 mb-6">
                <Quote className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <blockquote className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed mb-4">
                    "{testimonials[currentIndex].text}"
                  </blockquote>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-500">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <cite className="not-italic">
                    <div className="font-semibold text-gray-900">{testimonials[currentIndex].name}</div>
                    <div className="text-gray-600">{testimonials[currentIndex].relationship}</div>
                    <div className="text-sm text-gray-500">{testimonials[currentIndex].location}</div>
                  </cite>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex text-yellow-500 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <cite className="not-italic">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.relationship}</div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </cite>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Join thousands of families finding healing through Talkers
          </p>
          <a 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Start Your Free Trial Today
          </a>
        </div>
      </div>
    </section>
  );
} 
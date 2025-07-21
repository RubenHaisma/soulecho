import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  Heart,
  Search,
  Navigation,
  Star,
  CheckCircle
} from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Grief Support Near Me - Find Local Bereavement Counseling & Support Groups',
  description: 'Find grief support, bereavement counseling, and support groups near you. Connect with local grief counselors, therapists, and community resources in your area.',
  keywords: 'grief support near me, grief counseling near me, bereavement support near me, local grief support, grief therapist near me, grief support groups near me, grief counselor near me, bereavement counseling near me',
  openGraph: {
    title: 'Grief Support Near Me - Find Local Bereavement Counseling',
    description: 'Find grief support, bereavement counseling, and support groups near you.',
    type: 'website',
    url: '/grief-support-near-me',
  },
  alternates: {
    canonical: '/grief-support-near-me',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const localResources = [
  {
    type: 'Grief Counselors',
    description: 'Licensed therapists specializing in grief and bereavement',
    searchTips: 'Search for "grief counselor near me" or "bereavement therapist"',
    whatToExpect: 'Individual therapy sessions focused on processing loss'
  },
  {
    type: 'Support Groups',
    description: 'Community groups for people experiencing similar losses',
    searchTips: 'Look for "grief support groups" at hospitals, churches, community centers',
    whatToExpected: 'Group meetings with others who understand your experience'
  },
  {
    type: 'Hospice Organizations',
    description: 'Many offer free bereavement support to the community',
    searchTips: 'Contact local hospices - most provide free grief support',
    whatToExpect: 'Professional grief counseling and support groups'
  },
  {
    type: 'Religious Organizations',
    description: 'Churches, temples, and mosques often provide grief ministry',
    searchTips: 'Ask about grief ministry or bereavement support programs',
    whatToExpect: 'Faith-based support and community connection'
  }
];

const majorCities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA'
];

export default function GriefSupportNearMePage() {
  return (
    <>
      <Script
        id="local-grief-support-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': 'https://talkers.ai/grief-support-near-me',
            name: 'Local Grief Support Services',
            description: 'Find grief support, bereavement counseling, and support groups in your local area',
            url: 'https://talkers.ai/grief-support-near-me',
            serviceType: 'Grief Support and Bereavement Counseling',
            areaServed: {
              '@type': 'Country',
              name: 'United States'
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Local Grief Support Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Local Grief Counseling',
                    description: 'Find licensed grief counselors and therapists in your area'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Grief Support Groups',
                    description: 'Connect with local support groups for bereavement'
                  }
                }
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Grief Support
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Near Me
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find local grief support, bereavement counseling, and support groups in your area. 
              Connect with professional grief counselors and community resources near you.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-blue-100 text-blue-700">Local Resources</Badge>
              <Badge className="bg-green-100 text-green-700">Professional Support</Badge>
              <Badge className="bg-purple-100 text-purple-700">Community Groups</Badge>
            </div>
          </div>

          {/* Search Section */}
          <section className="mb-12">
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  How to Find Grief Support in Your Area
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Search Online</h3>
                    <p className="text-gray-600 text-sm">
                      Use search terms like "grief counselor near me" or "bereavement support [your city]"
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Call Local Resources</h3>
                    <p className="text-gray-600 text-sm">
                      Contact hospitals, hospices, and community centers for referrals
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ask for Referrals</h3>
                    <p className="text-gray-600 text-sm">
                      Ask your doctor, therapist, or religious leader for local recommendations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Types of Local Support */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Local Grief Support</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {localResources.map((resource, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{resource.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{resource.description}</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">How to Find:</h4>
                      <p className="text-blue-700 text-sm">{resource.searchTips}</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">What to Expect:</h4>
                      <p className="text-green-700 text-sm">{resource.whatToExpect}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Major Cities */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Grief Support by City</h2>
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <p className="text-gray-600 mb-6 text-center">
                  Find grief support services in major cities across the United States
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {majorCities.map((city, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">{city}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Online Alternative */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Can't Find Local Support? Try Online Grief Support
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  If local resources are limited in your area, online grief support can provide 
                  immediate access to professional counseling and supportive communities.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
                    <p className="text-gray-600 text-sm">Access support anytime, day or night</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Global Community</h3>
                    <p className="text-gray-600 text-sm">Connect with others worldwide</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Specialized Support</h3>
                    <p className="text-gray-600 text-sm">Find support for specific types of loss</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/grief-support">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Explore Online Support
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      Start Free Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Emergency Resources */}
          <section className="mb-12">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Immediate Help?
                </h3>
                <p className="text-gray-700 mb-6">
                  If you're in crisis or having thoughts of self-harm, please reach out immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="tel:988">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Call 988 - Crisis Lifeline
                    </Button>
                  </Link>
                  <Link href="sms:741741">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      Text HOME to 741741
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
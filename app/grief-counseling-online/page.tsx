import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  MessageCircle, 
  Clock, 
  Shield, 
  Heart,
  CheckCircle,
  Star,
  Users,
  Smartphone,
  Globe
} from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Online Grief Counseling & Therapy - Professional Bereavement Support',
  description: 'Get professional online grief counseling and therapy from licensed therapists. Secure, convenient bereavement support via video, chat, and phone sessions.',
  keywords: 'online grief counseling, grief therapy online, virtual grief counseling, online bereavement therapy, grief counselor online, remote grief therapy, teletherapy grief, online grief support',
  openGraph: {
    title: 'Online Grief Counseling & Therapy - Professional Support',
    description: 'Get professional online grief counseling and therapy from licensed therapists.',
    type: 'website',
    url: '/grief-counseling-online',
  },
  alternates: {
    canonical: '/grief-counseling-online',
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

const onlineTherapyBenefits = [
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule, including evenings and weekends',
    color: 'blue'
  },
  {
    icon: Globe,
    title: 'Access Anywhere',
    description: 'Connect from home, office, or anywhere with internet connection',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'HIPAA-compliant platforms ensure your sessions remain confidential',
    color: 'purple'
  },
  {
    icon: Star,
    title: 'Specialized Therapists',
    description: 'Access grief specialists who may not be available locally',
    color: 'orange'
  }
];

const sessionTypes = [
  {
    type: 'Video Sessions',
    icon: Video,
    description: 'Face-to-face therapy via secure video calls',
    benefits: ['Personal connection', 'Non-verbal communication', 'Traditional therapy feel'],
    bestFor: 'Those who prefer face-to-face interaction'
  },
  {
    type: 'Phone Sessions',
    icon: MessageCircle,
    description: 'Voice-only therapy sessions by phone',
    benefits: ['No video required', 'Can be done anywhere', 'Focus on conversation'],
    bestFor: 'Those uncomfortable with video or with limited internet'
  },
  {
    type: 'Chat Therapy',
    icon: Smartphone,
    description: 'Text-based therapy sessions',
    benefits: ['Written record', 'Time to process thoughts', 'Convenient messaging'],
    bestFor: 'Those who express themselves better in writing'
  }
];

const platforms = [
  {
    name: 'BetterHelp',
    specialization: 'General mental health with grief specialists',
    features: ['Licensed therapists', 'Multiple communication methods', 'Financial aid available'],
    priceRange: '$60-90/week'
  },
  {
    name: 'Talkspace',
    specialization: 'Text and video therapy with grief focus',
    features: ['Unlimited messaging', 'Video sessions', 'Insurance accepted'],
    priceRange: '$69-109/week'
  },
  {
    name: 'MDLIVE',
    specialization: 'Medical and mental health services',
    features: ['Insurance coverage', 'Same-day appointments', 'Crisis support'],
    priceRange: 'Varies by insurance'
  },
  {
    name: 'Psychology Today',
    specialization: 'Directory of therapists offering online sessions',
    features: ['Filter by specialization', 'Insurance verification', 'Direct contact'],
    priceRange: 'Varies by therapist'
  }
];

export default function OnlineGriefCounselingPage() {
  return (
    <>
      <Script
        id="online-grief-counseling-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Online Grief Counseling & Therapy',
            description: 'Professional online grief counseling and therapy services from licensed therapists',
            url: 'https://talkers.pro/grief-counseling-online',
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
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Online Grief
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Counseling & Therapy
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get professional grief counseling and therapy from licensed therapists via secure 
              video, phone, and chat sessions. Convenient, private, and effective bereavement support.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-blue-100 text-blue-700">Licensed Therapists</Badge>
              <Badge className="bg-green-100 text-green-700">HIPAA Compliant</Badge>
              <Badge className="bg-purple-100 text-purple-700">Insurance Accepted</Badge>
            </div>
          </div>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Online Grief Counseling</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {onlineTherapyBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r from-${benefit.color}-400 to-${benefit.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Session Types */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Online Therapy Sessions</h2>
            <div className="space-y-6">
              {sessionTypes.map((session, index) => {
                const IconComponent = session.icon;
                return (
                  <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{session.type}</CardTitle>
                          <p className="text-gray-600">{session.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                          <ul className="space-y-2">
                            {session.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700 text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Best For:</h4>
                          <p className="text-gray-700 text-sm">{session.bestFor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Popular Platforms */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Online Therapy Platforms</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {platforms.map((platform, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-800">{platform.name}</CardTitle>
                    <p className="text-gray-600">{platform.specialization}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {platform.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Price Range:</span>
                        <span className="text-blue-600 font-medium">{platform.priceRange}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  How to Get Started with Online Grief Counseling
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Choose Platform</h3>
                    <p className="text-gray-600 text-sm">Research and select an online therapy platform</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Assessment</h3>
                    <p className="text-gray-600 text-sm">Fill out intake forms about your grief experience</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Matched</h3>
                    <p className="text-gray-600 text-sm">Platform matches you with qualified grief therapist</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Start Sessions</h3>
                    <p className="text-gray-600 text-sm">Begin your grief counseling journey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Talkers Alternative */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Complement Therapy with AI-Powered Grief Support
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  While professional therapy is essential, Talkers provides 24/7 support between 
                  sessions through AI-powered conversations with your preserved memories.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
                    <p className="text-gray-600 text-sm">Support between therapy sessions</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Connection</h3>
                    <p className="text-gray-600 text-sm">Interact with your loved one's memories</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Complements Therapy</h3>
                    <p className="text-gray-600 text-sm">Works alongside professional treatment</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Try Talkers Free
                    </Button>
                  </Link>
                  <Link href="/grief-support">
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      Learn More
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
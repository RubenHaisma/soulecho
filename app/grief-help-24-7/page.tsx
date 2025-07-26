import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Phone, 
  MessageCircle, 
  Heart, 
  Shield,
  AlertTriangle,
  Users,
  Globe,
  Headphones,
  Video
} from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '24/7 Grief Help & Support - Immediate Bereavement Assistance Available Now',
  description: 'Get immediate 24/7 grief help and support. Access round-the-clock bereavement assistance, crisis support, and grief counseling available anytime, day or night.',
  keywords: '24/7 grief help, 24 hour grief support, grief help anytime, immediate grief support, round the clock grief help, grief crisis support, 24/7 bereavement help, grief support always available',
  openGraph: {
    title: '24/7 Grief Help & Support - Immediate Assistance Available',
    description: 'Get immediate 24/7 grief help and support. Round-the-clock bereavement assistance available anytime.',
    type: 'website',
    url: '/grief-help-24-7',
  },
  alternates: {
    canonical: '/grief-help-24-7',
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

const crisisResources = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: 'Free, confidential crisis support 24/7/365',
    features: ['Suicide prevention', 'Crisis intervention', 'Emotional support', 'Local resources'],
    languages: 'English, Spanish, and 200+ languages via interpretation'
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis support via text message',
    features: ['Text-based support', 'Trained crisis counselors', 'Anonymous', 'Immediate response'],
    languages: 'English and Spanish'
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service',
    features: ['Treatment referrals', 'Information service', 'Local resources', 'Insurance guidance'],
    languages: 'English and Spanish'
  }
];

const onlineSupport = [
  {
    platform: 'Talkers AI Support',
    type: 'AI-Powered Conversations',
    availability: '24/7',
    description: 'Immediate comfort through preserved conversations with loved ones',
    access: 'Free trial available'
  },
  {
    platform: '7 Cups',
    type: 'Peer Support Chat',
    availability: '24/7',
    description: 'Free emotional support from trained listeners',
    access: 'Free registration'
  },
  {
    platform: 'BetterHelp Crisis Support',
    type: 'Professional Counselors',
    availability: '24/7',
    description: 'Licensed therapists available for crisis intervention',
    access: 'Subscription required'
  },
  {
    platform: 'Grief.com Support Groups',
    type: 'Online Communities',
    availability: '24/7',
    description: 'Moderated grief support forums and chat rooms',
    access: 'Free registration'
  }
];

export default function GriefHelp247Page() {
  return (
    <>
      <Script
        id="grief-help-247-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: '24/7 Grief Help & Support - Immediate Assistance',
            description: 'Comprehensive directory of 24/7 grief support resources and crisis intervention services',
            url: 'https://talkers.pro/grief-help-24-7',
            about: {
              '@type': 'MedicalCondition',
              name: 'Grief Crisis and Bereavement Emergency',
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
              name: 'Talkers Crisis Support Team'
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-red-50/30 to-orange-50/20">
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white py-3">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="font-medium">
              🚨 CRISIS? Call 988 immediately • Text HOME to 741741 • Help is available right now
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              24/7 Grief Help
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                & Support
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Immediate grief help and support available 24 hours a day, 7 days a week. 
              Crisis intervention, emotional support, and bereavement assistance whenever you need it.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-red-100 text-red-700">24/7 Available</Badge>
              <Badge className="bg-blue-100 text-blue-700">Immediate Help</Badge>
              <Badge className="bg-green-100 text-green-700">Free Support</Badge>
            </div>
          </div>

          {/* Immediate Crisis Support */}
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>If you're in immediate danger or having thoughts of suicide:</strong> Call 911 or go to your nearest emergency room. 
              For crisis support, call 988 or text HOME to 741741. Help is available right now.
            </AlertDescription>
          </Alert>

          {/* Crisis Hotlines */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">24/7 Crisis Support Hotlines</h2>
            <div className="space-y-6">
              {crisisResources.map((resource, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-red-800">{resource.name}</CardTitle>
                      <Badge className="bg-red-100 text-red-700">24/7</Badge>
                    </div>
                    <p className="text-gray-600">{resource.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Phone className="w-6 h-6 text-red-600" />
                          <span className="text-2xl font-bold text-gray-900">{resource.phone}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Languages: {resource.languages}</p>
                        <Link href={`tel:${resource.phone.replace(/\D/g, '')}`}>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">
                            Call Now
                          </Button>
                        </Link>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Services:</h4>
                        <ul className="space-y-2">
                          {resource.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-600" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Online 24/7 Support */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">24/7 Online Grief Support</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {onlineSupport.map((support, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{support.platform}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700">{support.availability}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{support.type}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{support.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Access: {support.access}</span>
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* When to Seek 24/7 Help */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  When to Seek Immediate 24/7 Grief Help
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Crisis Situations:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Thoughts of suicide or self-harm</li>
                      <li>• Overwhelming despair or hopelessness</li>
                      <li>• Inability to function or care for yourself</li>
                      <li>• Substance abuse as coping mechanism</li>
                      <li>• Complete isolation from others</li>
                      <li>• Panic attacks or severe anxiety</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Immediate Support Needs:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Sudden wave of intense grief</li>
                      <li>• Feeling completely alone at night</li>
                      <li>• Anniversary reactions or triggers</li>
                      <li>• Need someone to talk to immediately</li>
                      <li>• Difficulty sleeping due to grief</li>
                      <li>• Overwhelming emotions after loss</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Types of 24/7 Support */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of 24/7 Support Available</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Phone className="w-8 h-8 text-red-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Crisis Hotlines</h3>
                  <p className="text-gray-600 text-sm">Immediate phone support from trained counselors</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Text Support</h3>
                  <p className="text-gray-600 text-sm">Crisis support via text messaging</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Online Communities</h3>
                  <p className="text-gray-600 text-sm">Peer support in moderated forums</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI Support</h3>
                  <p className="text-gray-600 text-sm">Immediate comfort through preserved memories</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Talkers 24/7 Support */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  24/7 Comfort Through Talkers
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  When you need immediate comfort at any hour, Talkers provides instant access to 
                  conversations with your loved one's preserved memories. Available 24/7 with no wait times.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Always Available</h3>
                    <p className="text-gray-600 text-sm">No appointments or wait times</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Connection</h3>
                    <p className="text-gray-600 text-sm">Comfort from your loved one's voice</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Private & Secure</h3>
                    <p className="text-gray-600 text-sm">Completely confidential support</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Start Free 24/7 Support
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

          {/* Important Information */}
          <section>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Information</h3>
                    <p className="text-yellow-700 text-sm">
                      24/7 grief support services are designed for crisis intervention and immediate emotional support. 
                      For ongoing therapy and comprehensive treatment, consider scheduling regular appointments with 
                      licensed mental health professionals. If you're experiencing a medical emergency, call 911 immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
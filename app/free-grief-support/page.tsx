import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Phone, 
  Users, 
  Globe, 
  Clock,
  Gift,
  CheckCircle,
  Star,
  MessageCircle,
  Shield
} from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Grief Support - No-Cost Bereavement Help & Counseling Resources',
  description: 'Find free grief support, bereavement counseling, and mental health resources. Access no-cost grief help, support groups, hotlines, and online resources.',
  keywords: 'free grief support, free grief counseling, free bereavement support, no cost grief help, free grief therapy, free grief resources, free grief hotline, free grief support groups',
  openGraph: {
    title: 'Free Grief Support - No-Cost Bereavement Help & Resources',
    description: 'Find free grief support, bereavement counseling, and mental health resources.',
    type: 'website',
    url: '/free-grief-support',
  },
  alternates: {
    canonical: '/free-grief-support',
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

const freeResources = [
  {
    title: 'Crisis Hotlines',
    icon: Phone,
    description: '24/7 free crisis support and suicide prevention',
    resources: [
      { name: '988 Suicide & Crisis Lifeline', contact: '988', available: '24/7' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
      { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', available: '24/7' }
    ],
    color: 'red'
  },
  {
    title: 'Online Support Groups',
    icon: Users,
    description: 'Free virtual grief support communities',
    resources: [
      { name: 'GriefShare Online', contact: 'griefshare.org', available: 'Daily' },
      { name: 'Grief.com Support Groups', contact: 'grief.com', available: 'Weekly' },
      { name: 'Reddit Grief Support', contact: 'reddit.com/r/GriefSupport', available: '24/7' }
    ],
    color: 'blue'
  },
  {
    title: 'Community Resources',
    icon: Heart,
    description: 'Local free grief support services',
    resources: [
      { name: 'Hospice Bereavement Programs', contact: 'Contact local hospices', available: 'Varies' },
      { name: 'Religious Organizations', contact: 'Churches, temples, mosques', available: 'Weekly' },
      { name: 'Community Mental Health Centers', contact: 'Search by zip code', available: 'Weekdays' }
    ],
    color: 'green'
  },
  {
    title: 'Online Resources',
    icon: Globe,
    description: 'Free grief education and self-help tools',
    resources: [
      { name: 'What\'s Your Grief', contact: 'whatsyourgrief.com', available: '24/7' },
      { name: 'Grief Recovery Method', contact: 'griefrecoverymethod.com', available: '24/7' },
      { name: 'Center for Loss & Life Transition', contact: 'centerforloss.com', available: '24/7' }
    ],
    color: 'purple'
  }
];

const freeApps = [
  {
    name: 'Sanvello',
    description: 'Free mood tracking and coping tools',
    features: ['Mood tracking', 'Guided meditations', 'Coping toolbox']
  },
  {
    name: 'MindShift',
    description: 'Free anxiety and stress management',
    features: ['Relaxation exercises', 'Thought tracking', 'Goal setting']
  },
  {
    name: 'Youper',
    description: 'AI-powered emotional health assistant',
    features: ['Mood tracking', 'Personalized insights', 'Coping strategies']
  }
];

export default function FreeGriefSupportPage() {
  return (
    <>
      <Script
        id="free-grief-support-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Free Grief Support - No-Cost Bereavement Help',
            description: 'Comprehensive directory of free grief support resources, counseling, and mental health services',
            url: 'https://talkers.ai/free-grief-support',
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

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-green-50/30 to-blue-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Free Grief Support
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                & Resources
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access free grief support, bereavement counseling, and mental health resources. 
              No-cost help is available 24/7 through hotlines, support groups, and online communities.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-700">100% Free</Badge>
              <Badge className="bg-blue-100 text-blue-700">24/7 Available</Badge>
              <Badge className="bg-purple-100 text-purple-700">No Insurance Required</Badge>
            </div>
          </div>

          {/* Emergency Banner */}
          <section className="mb-12">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Need Immediate Help?</h3>
                <p className="text-red-700 mb-4">
                  If you're in crisis or having thoughts of self-harm, free help is available right now.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="tel:988">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Call 988 - Free Crisis Line
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

          {/* Free Resources */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Free Grief Support Resources</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {freeResources.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                          <p className="text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {resource.available}
                              </Badge>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{resource.contact}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Free Apps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Free Mental Health Apps</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {freeApps.map((app, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">{app.name}</CardTitle>
                    <p className="text-gray-600 text-center text-sm">{app.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {app.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How to Access */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  How to Access Free Grief Support
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Identify Your Needs</h3>
                    <p className="text-gray-600 text-sm">Determine if you need crisis support, ongoing counseling, or peer support</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Resources</h3>
                    <p className="text-gray-600 text-sm">Call hotlines, visit websites, or contact local organizations</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Join Communities</h3>
                    <p className="text-gray-600 text-sm">Participate in support groups and online communities</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Use Multiple Resources</h3>
                    <p className="text-gray-600 text-sm">Combine different types of support for comprehensive help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Talkers Free Trial */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Free AI-Powered Grief Support with Talkers
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Start your healing journey with our free 3-day trial. Experience AI-powered 
                  conversations with your loved one's preserved memories at no cost.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 rounded-lg p-4">
                    <Gift className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">3-Day Free Trial</h3>
                    <p className="text-gray-600 text-sm">Full access to all features</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Credit Card</h3>
                    <p className="text-gray-600 text-sm">Start immediately without payment</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Instant Support</h3>
                    <p className="text-gray-600 text-sm">Begin conversations immediately</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Start Free Trial
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

          {/* Important Note */}
          <section>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">Important Note About Free Resources</h3>
                    <p className="text-orange-700 text-sm">
                      While free resources provide valuable support, they may have limitations such as wait times, 
                      limited availability, or basic services. If you need immediate professional help or have 
                      complex grief issues, consider seeking paid professional services when possible.
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
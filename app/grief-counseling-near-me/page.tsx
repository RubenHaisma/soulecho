import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  Phone, 
  DollarSign, 
  Calendar, 
  Heart,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Star
} from 'lucide-react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Grief Counseling Near Me - Find Local Grief Therapists & Bereavement Counselors',
  description: 'Find qualified grief counselors and bereavement therapists near you. Get professional grief counseling, therapy, and mental health support in your local area.',
  keywords: 'grief counseling near me, grief therapist near me, bereavement counselor near me, grief therapy near me, local grief counselor, grief counseling services, bereavement therapy near me, grief mental health counselor',
  openGraph: {
    title: 'Grief Counseling Near Me - Find Local Grief Therapists',
    description: 'Find qualified grief counselors and bereavement therapists near you.',
    type: 'website',
    url: '/grief-counseling-near-me',
  },
  alternates: {
    canonical: '/grief-counseling-near-me',
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

const counselorTypes = [
  {
    title: 'Licensed Clinical Social Workers (LCSW)',
    description: 'Social workers with specialized training in grief and bereavement',
    qualifications: ['Master\'s degree in Social Work', 'State licensure', 'Grief counseling certification'],
    averageCost: '$80-150 per session'
  },
  {
    title: 'Licensed Professional Counselors (LPC)',
    description: 'Mental health counselors specializing in grief therapy',
    qualifications: ['Master\'s degree in Counseling', 'State licensure', 'Grief therapy training'],
    averageCost: '$90-180 per session'
  },
  {
    title: 'Licensed Marriage & Family Therapists (LMFT)',
    description: 'Therapists who help families navigate grief together',
    qualifications: ['Master\'s degree in MFT', 'Family therapy licensure', 'Grief specialization'],
    averageCost: '$100-200 per session'
  },
  {
    title: 'Psychologists (PhD/PsyD)',
    description: 'Doctoral-level psychologists with grief and trauma expertise',
    qualifications: ['Doctoral degree in Psychology', 'State licensure', 'Grief psychology training'],
    averageCost: '$120-250 per session'
  }
];

const findingSteps = [
  {
    step: 1,
    title: 'Check with Your Insurance',
    description: 'Contact your insurance provider to find covered grief counselors in your network',
    icon: Shield
  },
  {
    step: 2,
    title: 'Search Professional Directories',
    description: 'Use Psychology Today, SAMHSA, or your state\'s licensing board directory',
    icon: UserCheck
  },
  {
    step: 3,
    title: 'Ask for Referrals',
    description: 'Get recommendations from your doctor, religious leader, or local hospice',
    icon: Heart
  },
  {
    step: 4,
    title: 'Schedule Consultations',
    description: 'Many counselors offer brief consultations to ensure good fit',
    icon: Calendar
  }
];

export default function GriefCounselingNearMePage() {
  return (
    <>
      <Script
        id="grief-counseling-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Grief Counseling Near Me - Find Local Therapists',
            description: 'Find qualified grief counselors and bereavement therapists in your local area',
            url: 'https://talkers.ai/grief-counseling-near-me',
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
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Grief Counseling
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Near Me
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find qualified grief counselors, bereavement therapists, and mental health professionals 
              specializing in grief therapy in your local area.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-700">Licensed Professionals</Badge>
              <Badge className="bg-blue-100 text-blue-700">Insurance Accepted</Badge>
              <Badge className="bg-purple-100 text-purple-700">Specialized Training</Badge>
            </div>
          </div>

          {/* How to Find Steps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Find a Grief Counselor Near You</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {findingSteps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <Card key={step.step} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold">{step.step}</span>
                      </div>
                      <IconComponent className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Types of Counselors */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Grief Counselors</h2>
            <div className="space-y-6">
              {counselorTypes.map((type, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-800">{type.title}</CardTitle>
                    <p className="text-gray-600">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Qualifications:</h4>
                        <ul className="space-y-2">
                          {type.qualifications.map((qual, qualIndex) => (
                            <li key={qualIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700 text-sm">{qual}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Average Cost:</h4>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-semibold text-gray-900">{type.averageCost}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">Many accept insurance coverage</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* What to Expect */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  What to Expect from Grief Counseling
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">First Session:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Assessment of your grief experience</li>
                      <li>• Discussion of your goals for therapy</li>
                      <li>• Explanation of the counselor's approach</li>
                      <li>• Questions about your support system</li>
                      <li>• Development of initial treatment plan</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ongoing Sessions:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Processing emotions and memories</li>
                      <li>• Learning coping strategies</li>
                      <li>• Working through grief stages</li>
                      <li>• Addressing complicated grief</li>
                      <li>• Building resilience and meaning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Insurance and Cost */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Insurance and Cost Information</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Most health insurance plans cover mental health services including grief counseling
                  </p>
                  <p className="text-xs text-gray-500">Check your specific plan benefits</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Sliding Scale Fees</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Many counselors offer reduced rates based on income and financial need
                  </p>
                  <p className="text-xs text-gray-500">Ask about financial assistance</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Free Resources</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Hospices, churches, and community centers often provide free grief support
                  </p>
                  <p className="text-xs text-gray-500">No insurance required</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Online Alternative */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Can't Find Local Grief Counseling? Try Online Therapy
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  If local grief counselors are unavailable or not covered by insurance, 
                  online grief therapy provides immediate access to qualified professionals.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Immediate Access</h3>
                    <p className="text-gray-600 text-sm">Start therapy within days, not weeks</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <MapPin className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Geographic Limits</h3>
                    <p className="text-gray-600 text-sm">Access specialists regardless of location</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <Star className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Specialized Expertise</h3>
                    <p className="text-gray-600 text-sm">Find counselors with specific grief training</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/grief-counseling-online">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Explore Online Counseling
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
        </div>
      </div>
    </>
  );
}
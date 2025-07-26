import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Clock, 
  Phone,
  MessageCircle,
  Shield,
  Calendar,
  Home,
  Briefcase,
  Baby
} from 'lucide-react';
import { generateGriefMetadata, griefPageConfigs } from '@/lib/grief-seo';
import Script from 'next/script';

export const metadata: Metadata = generateGriefMetadata(griefPageConfigs.parentLoss);

const parentLossStages = [
  {
    title: "Immediate Shock",
    timeframe: "First 24-72 hours",
    description: "Disbelief and numbness are protective responses",
    challenges: ["Making funeral arrangements", "Notifying family/friends", "Handling legal matters"],
    support: ["Accept help with practical tasks", "Don't make major decisions", "Focus on basic needs"]
  },
  {
    title: "Identity Shift", 
    timeframe: "Weeks to months",
    description: "Realizing you're now an 'adult orphan' - a profound identity change",
    challenges: ["Feeling unmoored", "Loss of family history keeper", "Changed family dynamics"],
    support: ["Connect with other adult orphans", "Journal about identity changes", "Seek counseling"]
  },
  {
    title: "Practical Overwhelm",
    timeframe: "First few months", 
    description: "Handling estate, belongings, and ongoing responsibilities",
    challenges: ["Estate settlement", "Clearing out home", "Financial decisions"],
    support: ["Hire professionals when possible", "Take breaks from tasks", "Ask family to help"]
  },
  {
    title: "Relationship Renegotiation",
    timeframe: "Months to years",
    description: "Changing relationships with surviving parent, siblings, and extended family",
    challenges: ["Different grief styles", "Family conflicts", "Holiday traditions"],
    support: ["Family therapy", "Clear communication", "New traditions"]
  },
  {
    title: "Ongoing Adaptation",
    timeframe: "Lifelong",
    description: "Learning to live without their guidance and presence",
    challenges: ["Major life decisions", "Parenting without grandparents", "Career changes"],
    support: ["Continuing bonds practices", "Mentorship", "Support groups"]
  }
];

const ageSpecificChallenges = [
  {
    ageGroup: "Young Adults (18-30)",
    icon: Baby,
    challenges: [
      "Losing guidance during formative years",
      "Financial dependence concerns", 
      "Dating and relationship decisions",
      "Career guidance absence"
    ],
    specificSupport: [
      "Mentorship programs",
      "Financial planning help",
      "Career counseling",
      "Young adult grief groups"
    ]
  },
  {
    ageGroup: "Middle-Aged Adults (30-50)",
    icon: Briefcase,
    challenges: [
      "Balancing own family needs",
      "Career peak pressures",
      "Caring for surviving parent",
      "Children's grief over grandparent"
    ],
    specificSupport: [
      "Family therapy",
      "Workplace grief support",
      "Childcare during grief",
      "Caregiver support groups"
    ]
  },
  {
    ageGroup: "Older Adults (50+)",
    icon: Home,
    challenges: [
      "Becoming family patriarch/matriarch",
      "Own mortality awareness",
      "Caring for surviving elderly parent",
      "Retirement planning changes"
    ],
    specificSupport: [
      "Elder care resources",
      "Estate planning help",
      "Senior grief counseling",
      "Legacy planning support"
    ]
  }
];

export default function LosingParentGriefPage() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id="parent-loss-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Losing a Parent - Grief Support for Adult Children',
            description: 'Specialized grief support for adults who lost a parent, including practical guidance and emotional support',
            url: 'https://talkers.pro/losing-parent-grief',
            about: {
              '@type': 'MedicalCondition',
              name: 'Parental Loss Grief',
              alternateName: 'Adult Orphan Grief'
            },
            audience: {
              '@type': 'Patient',
              requiredGender: 'Any',
              suggestedMinAge: 18
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-blue-50/30 to-purple-50/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Link href="/grief-support">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Grief Support
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Losing a Parent:
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                You're Not Alone
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Losing a parent is one of life's most profound losses. Whether expected or sudden, 
              the death of a parent changes us forever. Find support, understanding, and ways to honor their memory.
            </p>
          </div>

          {/* Crisis Support */}
          <Alert className="mb-8 border-red-200 bg-red-50">
            <Phone className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Need immediate support?</strong> Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. 
              You don't have to face this alone.
            </AlertDescription>
          </Alert>

          {/* Understanding Parent Loss */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Parent Loss Grief</h2>
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg mb-6">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed mb-4">
                  When a parent dies, you don't just lose a person - you lose your first relationship, 
                  your safety net, your family historian, and often your biggest supporter. This loss 
                  can feel like losing part of your identity.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Many adults describe feeling like "orphans" regardless of their age. This feeling is 
                  valid and normal. Your parent was likely one of the few people who loved you 
                  unconditionally and knew you your entire life.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-blue-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-800 mb-2">Identity Loss</h3>
                  <p className="text-blue-700 text-sm">
                    You're no longer someone's child in the same way
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-purple-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-800 mb-2">Security Loss</h3>
                  <p className="text-purple-700 text-sm">
                    Your ultimate safety net and support system is gone
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-green-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-800 mb-2">History Loss</h3>
                  <p className="text-green-700 text-sm">
                    The keeper of your childhood memories and family stories
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stages of Parent Loss */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Journey of Parent Loss</h2>
            <div className="space-y-6">
              {parentLossStages.map((stage, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{stage.title}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {stage.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{stage.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Common Challenges:</h4>
                        <ul className="space-y-1">
                          {stage.challenges.map((challenge, challengeIndex) => (
                            <li key={challengeIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">What Helps:</h4>
                        <ul className="space-y-1">
                          {stage.support.map((support, supportIndex) => (
                            <li key={supportIndex} className="flex items-start gap-2">
                              <Heart className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{support}</span>
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

          {/* Age-Specific Challenges */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Challenges by Life Stage</h2>
            <p className="text-gray-600 mb-8 text-center">
              Parent loss affects people differently depending on their life stage and circumstances.
            </p>
            <div className="space-y-6">
              {ageSpecificChallenges.map((group, index) => {
                const IconComponent = group.icon;
                return (
                  <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                        {group.ageGroup}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Unique Challenges:</h4>
                          <ul className="space-y-2">
                            {group.challenges.map((challenge, challengeIndex) => (
                              <li key={challengeIndex} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm">{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Specific Support:</h4>
                          <ul className="space-y-2">
                            {group.specificSupport.map((support, supportIndex) => (
                              <li key={supportIndex} className="flex items-start gap-2">
                                <Heart className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{support}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Preserving Parent's Memory */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Preserving Your Parent's Memory & Voice
                </h2>
                <p className="text-gray-700 mb-6">
                  Your conversations with your parent contain irreplaceable wisdom, love, and guidance. 
                  Preserving these can provide ongoing comfort and connection.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">What to Preserve:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• WhatsApp conversations and text messages</li>
                      <li>• Voice messages and voicemails</li>
                      <li>• Email exchanges</li>
                      <li>• Photos and videos together</li>
                      <li>• Social media interactions</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How It Helps:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hear their voice when you need guidance</li>
                      <li>• Remember their love during difficult times</li>
                      <li>• Share their wisdom with your children</li>
                      <li>• Feel their presence in daily life</li>
                      <li>• Process grief at your own pace</li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Preserve Your Parent's Voice
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Support Resources */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Support Resources for Parent Loss</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Immediate Support</h3>
                  <div className="space-y-3">
                    <Link href="tel:988" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="w-4 h-4 mr-2" />
                        Crisis Line: 988
                      </Button>
                    </Link>
                    <Link href="/grief-support" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Online Support Groups
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI Memorial Conversations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Professional Help</h3>
                  <div className="space-y-3 text-gray-700 text-sm">
                    <p>• <strong>Grief Counselors:</strong> Specialized in parent loss</p>
                    <p>• <strong>Family Therapists:</strong> Help with family dynamics</p>
                    <p>• <strong>Support Groups:</strong> Connect with others who understand</p>
                    <p>• <strong>Estate Attorneys:</strong> Handle legal matters</p>
                    <p>• <strong>Financial Advisors:</strong> Manage inheritance and planning</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Honor Your Parent's Memory
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Your parent's love, wisdom, and guidance don't have to end with their death. 
                Preserve their voice, continue feeling their presence, and find comfort in their memory.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3">
                  Start Preserving Their Memory
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
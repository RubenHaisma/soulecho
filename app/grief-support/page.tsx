import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Users, Shield, Clock, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { generateGriefMetadata, griefPageConfigs } from '@/lib/grief-seo';
import Script from 'next/script';

export const metadata: Metadata = generateGriefMetadata(griefPageConfigs.griefSupport);

const supportOptions = [
  {
    title: "Immediate Crisis Support",
    description: "24/7 emergency grief support when you need it most",
    icon: Phone,
    urgency: "Emergency",
    color: "red",
    features: [
      "Crisis intervention chat",
      "Emergency grief counselor access",
      "Suicide prevention resources",
      "24/7 helpline connection"
    ]
  },
  {
    title: "AI Memorial Conversations",
    description: "Talk with your deceased loved one through preserved conversations",
    icon: MessageCircle,
    urgency: "Ongoing Support",
    color: "blue",
    features: [
      "WhatsApp conversation preservation",
      "AI-powered memorial chats",
      "Voice message interactions",
      "Private, secure conversations"
    ]
  },
  {
    title: "Grief Support Groups",
    description: "Connect with others who understand your specific type of loss",
    icon: Users,
    urgency: "Community",
    color: "green",
    features: [
      "Loss-specific support groups",
      "Moderated safe spaces",
      "Anonymous participation",
      "Peer support matching"
    ]
  },
  {
    title: "Professional Counseling",
    description: "Licensed grief therapists specializing in bereavement",
    icon: Shield,
    urgency: "Professional",
    color: "purple",
    features: [
      "Licensed grief counselors",
      "Specialized loss therapy",
      "Insurance accepted",
      "Flexible scheduling"
    ]
  }
];

const griefStages = [
  {
    stage: "Denial",
    description: "Shock and disbelief that the loss has occurred",
    symptoms: ["Numbness", "Disbelief", "Confusion", "Avoidance"],
    support: "Gentle reality acceptance, basic needs care"
  },
  {
    stage: "Anger", 
    description: "Frustration and rage about the unfairness of loss",
    symptoms: ["Irritability", "Blame", "Resentment", "Guilt"],
    support: "Safe expression outlets, anger management"
  },
  {
    stage: "Bargaining",
    description: "Attempting to negotiate or make deals to reverse the loss",
    symptoms: ["What-if thoughts", "Guilt", "Desperation", "Magical thinking"],
    support: "Reality grounding, guilt processing"
  },
  {
    stage: "Depression",
    description: "Deep sadness and despair about the reality of loss",
    symptoms: ["Sadness", "Withdrawal", "Fatigue", "Hopelessness"],
    support: "Professional help, medication if needed, social connection"
  },
  {
    stage: "Acceptance",
    description: "Coming to terms with the loss and finding ways to move forward",
    symptoms: ["Peace", "Hope", "Renewed energy", "Meaning-making"],
    support: "Legacy building, helping others, new relationships"
  }
];

export default function GriefSupportPage() {
  return (
    <>
      {/* Structured Data for Grief Support */}
      <Script
        id="grief-support-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Comprehensive Grief Support Services',
            description: 'Professional grief support, AI memorial conversations, and bereavement counseling for all types of loss',
            url: 'https://talkers.ai/grief-support',
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

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:py-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100/50 backdrop-blur-sm border border-red-200/50 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">24/7 Grief Support Available</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              You Don't Have to
              <br />
              <span className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Grieve Alone
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Whether you just lost someone or are struggling with ongoing grief, find immediate support, 
              professional counseling, and meaningful ways to stay connected with your loved one's memory.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-700 hover:via-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl"
                >
                  Get Immediate Support
                </Button>
              </Link>
              <Link href="tel:988">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-2 border-red-300 text-red-700 hover:bg-red-50 px-8 py-4 text-lg font-medium rounded-full"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Crisis Hotline: 988
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span>Compassionate Care</span>
              </div>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="px-4 mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find the Right Support for Your Grief</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className={`bg-${option.color}-50 text-${option.color}-700 border-${option.color}-200`}>
                          {option.urgency}
                        </Badge>
                        <div className={`p-2 bg-gradient-to-br from-${option.color}-100 to-${option.color}-200 rounded-lg`}>
                          <IconComponent className={`w-5 h-5 text-${option.color}-600`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {option.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {option.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {option.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-purple-50 group-hover:border-purple-300">
                        Learn More
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Understanding Grief Stages */}
        <section className="px-4 mb-16 bg-gradient-to-r from-gray-50 to-purple-50/30 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Understanding Your Grief Journey</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Grief isn't linear. You might experience these stages in any order, skip some entirely, 
                or cycle through them multiple times. That's completely normal.
              </p>
            </div>
            
            <div className="space-y-6">
              {griefStages.map((stage, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{stage.stage}</h3>
                        <p className="text-gray-700 mb-4">{stage.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Common Symptoms:</h4>
                            <div className="flex flex-wrap gap-2">
                              {stage.symptoms.map((symptom, symptomIndex) => (
                                <Badge key={symptomIndex} variant="secondary" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">How We Can Help:</h4>
                            <p className="text-sm text-gray-600">{stage.support}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Resources */}
        <section className="px-4 mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  In Crisis? Get Immediate Help
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  If you're having thoughts of suicide or self-harm, please reach out immediately. 
                  You matter, your life has value, and help is available right now.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="tel:988">
                    <Button className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3">
                      Call 988 - Suicide & Crisis Lifeline
                    </Button>
                  </Link>
                  <Link href="sms:741741">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-lg px-8 py-3">
                      Text HOME to 741741
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Start Your Healing Journey Today
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Join thousands who have found comfort, support, and healing through Talkers. 
                  Your grief is valid, your feelings matter, and you deserve support.
                </p>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-3">
                    Begin Free Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
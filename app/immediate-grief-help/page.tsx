import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Heart, Clock, Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { generateGriefMetadata, griefPageConfigs } from '@/lib/grief-seo';

export const metadata: Metadata = generateGriefMetadata(griefPageConfigs.immediateHelp);

const immediateSteps = [
  {
    title: "Take Care of Immediate Needs",
    description: "Ensure you have basic necessities and aren't alone",
    actions: [
      "Call a trusted friend or family member",
      "Ensure you have food and water nearby", 
      "Take any necessary medications",
      "Contact your employer if needed"
    ]
  },
  {
    title: "Handle Urgent Practical Matters",
    description: "Address time-sensitive arrangements",
    actions: [
      "Contact funeral home or medical examiner",
      "Notify immediate family members",
      "Secure the deceased's home and belongings",
      "Contact their employer or important contacts"
    ]
  },
  {
    title: "Seek Emotional Support",
    description: "Don't face this alone - reach out for help",
    actions: [
      "Call a grief counselor or therapist",
      "Contact your religious or spiritual leader",
      "Join an online grief support group",
      "Use crisis support services if overwhelmed"
    ]
  },
  {
    title: "Preserve Important Memories",
    description: "Protect precious digital and physical memories",
    actions: [
      "Export WhatsApp and text conversations",
      "Backup photos and videos from their phone",
      "Gather important documents and photos",
      "Save voicemails and voice messages"
    ]
  }
];

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "24/7 crisis support for suicidal thoughts",
    type: "Call"
  },
  {
    name: "Crisis Text Line", 
    number: "741741",
    description: "Text HOME for immediate crisis support",
    type: "Text"
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Mental health and substance abuse support",
    type: "Call"
  },
  {
    name: "GriefShare",
    number: "Online",
    description: "Find local grief support groups",
    type: "Website"
  }
];

export default function ImmediateGriefHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-red-50/30 to-orange-50/20">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-medium">
            🚨 In immediate crisis? Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Someone You Love
            <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Just Died
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're so sorry for your loss. You're in shock right now, and that's completely normal. 
            Here's what you need to know and do in the first hours and days.
          </p>
        </div>

        {/* Crisis Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>If you're having thoughts of suicide or self-harm:</strong> Call 988 immediately or go to your nearest emergency room. 
            Your life matters and help is available right now.
          </AlertDescription>
        </Alert>

        {/* Immediate Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Do Right Now</h2>
          <div className="space-y-6">
            {immediateSteps.map((step, index) => (
              <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    {step.title}
                  </CardTitle>
                  <p className="text-gray-600">{step.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Support Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {crisisResources.map((resource, index) => (
              <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      {resource.type}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                  {resource.type === 'Call' && (
                    <Link href={`tel:${resource.number}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Phone className="w-4 h-4 mr-2" />
                        Call {resource.number}
                      </Button>
                    </Link>
                  )}
                  {resource.type === 'Text' && (
                    <Link href={`sms:${resource.number}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Text {resource.number}
                      </Button>
                    </Link>
                  )}
                  {resource.type === 'Website' && (
                    <Button variant="outline" className="w-full">
                      Visit Website
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What to Expect */}
        <section className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Might Be Feeling Right Now</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Physical Symptoms:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Numbness or feeling disconnected</li>
                    <li>• Difficulty breathing or chest tightness</li>
                    <li>• Nausea or loss of appetite</li>
                    <li>• Exhaustion or inability to sleep</li>
                    <li>• Shaking or feeling cold</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Emotional Symptoms:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Shock and disbelief</li>
                    <li>• Overwhelming sadness</li>
                    <li>• Anger or irritability</li>
                    <li>• Guilt or regret</li>
                    <li>• Fear about the future</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/60 rounded-lg">
                <p className="text-gray-700 text-center">
                  <strong>Remember:</strong> All of these feelings are completely normal reactions to loss. 
                  There's no "right" way to grieve, and you don\'t have to be strong for anyone else right now.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Preserve Memories */}
        <section className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Preserve Their Memory While You Can</h2>
              <p className="text-gray-700 mb-6">
                In the midst of grief, it's important to preserve precious digital memories before they're lost. 
                These conversations and memories can provide immense comfort in the days and years ahead.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Digital Memories to Save:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• WhatsApp conversation history</li>
                    <li>• Text messages and iMessages</li>
                    <li>• Voice messages and voicemails</li>
                    <li>• Photos and videos on their phone</li>
                    <li>• Social media posts and messages</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">How Talkers Can Help:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Secure conversation preservation</li>
                    <li>• AI-powered memorial chats</li>
                    <li>• Private, encrypted storage</li>
                    <li>• 24/7 access to comfort</li>
                    <li>• Professional grief support</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3">
                    Preserve Their Memory Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support CTA */}
        <section>
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You Don't Have to Face This Alone</h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Grief is one of the hardest things humans experience. Please don't try to handle this by yourself. 
                Reach out for support - it's not weakness, it's wisdom.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/grief-support">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                    Find Support Now
                  </Button>
                </Link>
                <Link href="tel:988">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                    <Phone className="w-4 h-4 mr-2" />
                    Crisis Line: 988
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
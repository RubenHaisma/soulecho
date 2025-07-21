import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Shield, 
  Heart,
  MessageCircle,
  Video,
  Globe,
  Lock,
  Star,
  CheckCircle
} from 'lucide-react';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FAQSchema } from '@/components/seo/faq-schema';

export const metadata: Metadata = {
  title: 'Online Grief Support Groups - Free Virtual Bereavement Support | Talkers',
  description: 'Join free online grief support groups. Connect with others who understand your loss. 24/7 virtual support for all types of grief and bereavement.',
  keywords: 'online grief support groups, virtual grief support, bereavement support groups online, grief chat rooms, online grief counseling, virtual bereavement groups',
  openGraph: {
    title: 'Online Grief Support Groups - Free Virtual Bereavement Support',
    description: 'Join free online grief support groups. Connect with others who understand your loss.',
    type: 'website',
    url: '/grief-support-groups-online',
  },
  alternates: {
    canonical: '/grief-support-groups-online',
  },
};

const supportGroups = [
  {
    name: "General Grief Support",
    description: "Open to anyone experiencing loss of any kind",
    schedule: "Daily sessions available",
    format: "Text chat & video calls",
    members: "500+ active members",
    moderated: true,
    free: true,
    specialties: ["All types of loss", "Peer support", "24/7 availability"]
  },
  {
    name: "Parent Loss Support",
    description: "For adults who have lost a parent",
    schedule: "Tuesdays & Thursdays 7PM EST",
    format: "Video group sessions",
    members: "150+ members",
    moderated: true,
    free: true,
    specialties: ["Adult orphan support", "Family dynamics", "Identity changes"]
  },
  {
    name: "Spouse/Partner Loss",
    description: "Widow and widower support community",
    schedule: "Mondays & Wednesdays 8PM EST",
    format: "Video & private chat",
    members: "200+ members", 
    moderated: true,
    free: true,
    specialties: ["Widow support", "Practical guidance", "Loneliness support"]
  },
  {
    name: "Child Loss Support",
    description: "For parents who have lost a child",
    schedule: "Sundays 6PM EST",
    format: "Facilitated video sessions",
    members: "80+ members",
    moderated: true,
    free: true,
    specialties: ["Bereaved parents", "Sibling support", "Anniversary support"]
  },
  {
    name: "Sudden Loss Support",
    description: "For unexpected deaths and traumatic loss",
    schedule: "Fridays 7PM EST",
    format: "Trauma-informed sessions",
    members: "120+ members",
    moderated: true,
    free: true,
    specialties: ["Trauma support", "PTSD resources", "Crisis intervention"]
  },
  {
    name: "Young Adult Grief",
    description: "Ages 18-35 experiencing loss",
    schedule: "Saturdays 3PM EST",
    format: "Casual video chats",
    members: "90+ members",
    moderated: true,
    free: true,
    specialties: ["Young adult issues", "Career impact", "Relationship guidance"]
  }
];

const faqs = [
  {
    question: "Are online grief support groups really free?",
    answer: "Yes, most online grief support groups are completely free. Some organizations may offer premium features for a fee, but basic support group access is typically free of charge."
  },
  {
    question: "How do I know if an online grief support group is safe?",
    answer: "Look for groups that are moderated by trained facilitators, have clear community guidelines, protect member privacy, and are affiliated with reputable grief organizations."
  },
  {
    question: "What's the difference between online and in-person grief support?",
    answer: "Online groups offer 24/7 accessibility, anonymity options, and connection with people worldwide. In-person groups provide face-to-face interaction and local community connections."
  },
  {
    question: "Do I need to share my story in a grief support group?",
    answer: "No, you can participate by listening and reading others' experiences. Sharing is encouraged when you feel ready, but there's no pressure to share personal details."
  },
  {
    question: "How long should I stay in a grief support group?",
    answer: "There's no time limit. Some people benefit from short-term participation, while others find ongoing support helpful. Stay as long as it feels beneficial to your healing."
  }
];

export default function OnlineGriefSupportGroupsPage() {
  return (
    <>
      <FAQSchema faqs={faqs} pageTitle="Online Grief Support Groups FAQ" />
      
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-blue-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: 'Grief Support', href: '/grief-support' },
              { label: 'Online Support Groups', href: '/grief-support-groups-online' }
            ]}
            className="mb-6"
          />

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Online Grief
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Support Groups
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with others who understand your loss. Join free, moderated support groups 
              available 24/7 from the comfort and privacy of your home.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-700">100% Free</Badge>
              <Badge className="bg-blue-100 text-blue-700">24/7 Available</Badge>
              <Badge className="bg-purple-100 text-purple-700">Professionally Moderated</Badge>
            </div>
          </div>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Online Grief Support Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
                  <p className="text-gray-600 text-sm">
                    Grief doesn't follow business hours. Access support whenever you need it most.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Safe & Anonymous</h3>
                  <p className="text-gray-600 text-sm">
                    Share as much or as little as you're comfortable with in a protected environment.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg text-center">
                <CardContent className="p-6">
                  <Globe className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Global Community</h3>
                  <p className="text-gray-600 text-sm">
                    Connect with people worldwide who understand your specific type of loss.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Support Groups */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Support Groups</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {supportGroups.map((group, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <div className="flex gap-2">
                        {group.free && <Badge className="bg-green-100 text-green-700">Free</Badge>}
                        {group.moderated && <Badge className="bg-blue-100 text-blue-700">Moderated</Badge>}
                      </div>
                    </div>
                    <p className="text-gray-600">{group.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Schedule</span>
                        </div>
                        <p className="text-gray-600">{group.schedule}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Format</span>
                        </div>
                        <p className="text-gray-600">{group.format}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">Community</span>
                      </div>
                      <p className="text-gray-600 text-sm">{group.members}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.specialties.map((specialty, specialtyIndex) => (
                          <Badge key={specialtyIndex} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Join This Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How to Get Started */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Get Started</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Choose a Group</h3>
                    <p className="text-gray-600 text-sm">Select a support group that matches your type of loss</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Account</h3>
                    <p className="text-gray-600 text-sm">Sign up with just an email - no personal details required</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Start Listening</h3>
                    <p className="text-gray-600 text-sm">Join sessions and listen - no pressure to share immediately</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Share When Ready</h3>
                    <p className="text-gray-600 text-sm">Participate at your own pace and comfort level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Connect with Others Who Understand?
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                You don't have to grieve alone. Join thousands of others who have found comfort, 
                understanding, and hope through online grief support communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Join Support Groups
                  </Button>
                </Link>
                <Link href="/grief-support">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    Explore All Support Options
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
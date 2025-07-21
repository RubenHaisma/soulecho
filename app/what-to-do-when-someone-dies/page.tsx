import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Clock, 
  FileText, 
  Heart, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Users,
  Home,
  Briefcase
} from 'lucide-react';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FAQSchema } from '@/components/seo/faq-schema';
import { ArticleSchema } from '@/components/seo/article-schema';

export const metadata: Metadata = {
  title: 'What to Do When Someone Dies: Complete Step-by-Step Guide | Talkers',
  description: 'Immediate steps to take when someone dies. Complete checklist for the first 24 hours, legal requirements, and emotional support resources. Get help now.',
  keywords: 'what to do when someone dies, death checklist, someone died what to do, immediate steps after death, death procedures, funeral arrangements, grief support',
  openGraph: {
    title: 'What to Do When Someone Dies: Complete Step-by-Step Guide',
    description: 'Immediate steps to take when someone dies. Complete checklist for the first 24 hours, legal requirements, and emotional support.',
    type: 'article',
    url: '/what-to-do-when-someone-dies',
  },
  alternates: {
    canonical: '/what-to-do-when-someone-dies',
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

const immediateSteps = [
  {
    timeframe: "First 30 Minutes",
    priority: "Critical",
    steps: [
      "Call 911 if death was unexpected or suspicious",
      "Contact their doctor if death was expected (hospice/illness)",
      "Do NOT move the body until authorities arrive",
      "Call immediate family members",
      "Contact their employer if applicable"
    ]
  },
  {
    timeframe: "First 2 Hours", 
    priority: "Urgent",
    steps: [
      "Obtain official death certificate from medical examiner",
      "Contact funeral home or crematorium",
      "Secure the deceased's home and belongings",
      "Locate important documents (will, insurance, etc.)",
      "Contact their attorney if they had one"
    ]
  },
  {
    timeframe: "First 24 Hours",
    priority: "Important", 
    steps: [
      "Notify Social Security Administration",
      "Contact life insurance companies",
      "Cancel credit cards and close accounts",
      "Contact their bank and financial institutions",
      "Begin planning funeral or memorial service"
    ]
  },
  {
    timeframe: "First Week",
    priority: "Necessary",
    steps: [
      "File for death benefits (Social Security, VA, etc.)",
      "Contact their employer's HR department",
      "Cancel subscriptions and recurring services",
      "Transfer or close utility accounts",
      "Begin probate process if necessary"
    ]
  }
];

const faqs = [
  {
    question: "Who do I call first when someone dies at home?",
    answer: "If the death was expected (hospice care, terminal illness), call their doctor or hospice nurse first. If unexpected, call 911 immediately. Do not move the body until authorities arrive."
  },
  {
    question: "How many death certificates do I need?",
    answer: "Order 10-15 certified copies. You'll need them for insurance claims, bank accounts, property transfers, and other legal matters. It's better to have too many than too few."
  },
  {
    question: "What if I can't find their will or important documents?",
    answer: "Check with their attorney, bank safe deposit box, or home safe. Contact their financial institutions - they may have copies of beneficiary information."
  },
  {
    question: "How quickly do I need to plan a funeral?",
    answer: "Most states require burial or cremation within 3-10 days. However, you can take time to plan a memorial service later if needed. Don't rush important decisions while grieving."
  },
  {
    question: "What if I can't afford funeral costs?",
    answer: "Contact local social services, religious organizations, or look into direct cremation options. Some states have assistance programs for low-income families."
  }
];

export default function WhatToDoWhenSomeoneDiesPage() {
  return (
    <>
      <FAQSchema faqs={faqs} pageTitle="What to Do When Someone Dies - FAQ" />
      <ArticleSchema
        headline="What to Do When Someone Dies: Complete Step-by-Step Guide"
        description="Immediate steps to take when someone dies. Complete checklist for the first 24 hours, legal requirements, and emotional support resources."
        author="Talkers Grief Support Team"
        datePublished="2024-01-01"
        url="/what-to-do-when-someone-dies"
        wordCount={2500}
        readingTime="10 minutes"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-red-50/30 to-orange-50/20">
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white py-2">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm">
            <p className="font-medium">
              🚨 Emergency? Call 911 immediately • Crisis Support: 988 (Suicide & Crisis Lifeline)
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: 'Grief Support', href: '/grief-support' },
              { label: 'What to Do When Someone Dies', href: '/what-to-do-when-someone-dies' }
            ]}
            className="mb-6"
          />

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              What to Do When
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Someone Dies
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A complete, step-by-step guide for the first hours, days, and weeks after a death. 
              We'll help you navigate this difficult time with practical guidance and emotional support.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-red-100 text-red-700">Immediate Help</Badge>
              <Badge className="bg-blue-100 text-blue-700">Legal Guidance</Badge>
              <Badge className="bg-green-100 text-green-700">Emotional Support</Badge>
            </div>
          </div>

          {/* Crisis Alert */}
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>If this is an emergency:</strong> Call 911 immediately. If you're having thoughts of self-harm, 
              call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.
            </AlertDescription>
          </Alert>

          {/* Quick Action Checklist */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Immediate Action Checklist</h2>
            <div className="space-y-6">
              {immediateSteps.map((timeframe, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          timeframe.priority === 'Critical' ? 'bg-red-600' :
                          timeframe.priority === 'Urgent' ? 'bg-orange-500' :
                          timeframe.priority === 'Important' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        {timeframe.timeframe}
                      </CardTitle>
                      <Badge variant={
                        timeframe.priority === 'Critical' ? 'destructive' : 'secondary'
                      }>
                        {timeframe.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {timeframe.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Important Documents */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Essential Documents You'll Need</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Legal Documents:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Death certificate (order 10-15 copies)</li>
                      <li>• Will and testament</li>
                      <li>• Power of attorney documents</li>
                      <li>• Trust documents</li>
                      <li>• Marriage certificate</li>
                      <li>• Birth certificate</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Financial Documents:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Life insurance policies</li>
                      <li>• Bank account information</li>
                      <li>• Investment account statements</li>
                      <li>• Social Security information</li>
                      <li>• Pension/retirement account details</li>
                      <li>• Property deeds and titles</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
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

          {/* Emotional Support */}
          <section className="mb-12">
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Don't Forget Your Emotional Needs
                </h2>
                <p className="text-gray-700 mb-6">
                  While handling practical matters is important, your emotional well-being matters too. 
                  Grief can be overwhelming, and it's okay to ask for help.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-red-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Crisis Support</h3>
                    <p className="text-gray-600 text-sm mb-3">24/7 emotional support</p>
                    <Link href="tel:988">
                      <Button variant="outline" size="sm">Call 988</Button>
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Support Groups</h3>
                    <p className="text-gray-600 text-sm mb-3">Connect with others</p>
                    <Link href="/grief-support">
                      <Button variant="outline" size="sm">Find Groups</Button>
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Memorial Support</h3>
                    <p className="text-gray-600 text-sm mb-3">Preserve their memory</p>
                    <Link href="/auth/signup">
                      <Button variant="outline" size="sm">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Ongoing Support?
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Handling death logistics is just the beginning. Find ongoing emotional support, 
                preserve precious memories, and connect with others who understand your loss.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/grief-support">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                    Find Support Now
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    Preserve Their Memory
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
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Brain, 
  Users, 
  Activity,
  Moon,
  Utensils,
  BookOpen,
  Phone,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FAQSchema } from '@/components/seo/faq-schema';
import { ArticleSchema } from '@/components/seo/article-schema';

export const metadata: Metadata = {
  title: 'How to Cope with Grief: 15 Proven Strategies for Healing | Talkers',
  description: 'Learn effective ways to cope with grief and loss. Evidence-based strategies for managing grief symptoms, finding support, and healing after losing a loved one.',
  keywords: 'how to cope with grief, grief coping strategies, dealing with grief, grief management, grief healing, coping with loss, grief recovery, grief support',
  openGraph: {
    title: 'How to Cope with Grief: 15 Proven Strategies for Healing',
    description: 'Learn effective ways to cope with grief and loss. Evidence-based strategies for managing grief symptoms and healing.',
    type: 'article',
    url: '/how-to-cope-with-grief',
  },
  alternates: {
    canonical: '/how-to-cope-with-grief',
  },
};

const copingStrategies = [
  {
    category: "Emotional Coping",
    icon: Heart,
    color: "red",
    strategies: [
      {
        title: "Allow Yourself to Feel",
        description: "Don't suppress emotions - grief needs to be felt to be healed",
        practical: "Set aside 15-20 minutes daily to feel your emotions without judgment"
      },
      {
        title: "Practice Self-Compassion", 
        description: "Treat yourself with the same kindness you'd show a good friend",
        practical: "When self-critical thoughts arise, ask 'What would I tell a friend in this situation?'"
      },
      {
        title: "Create Memory Rituals",
        description: "Develop meaningful ways to honor and remember your loved one",
        practical: "Light a candle, visit their favorite place, or write them a letter"
      }
    ]
  },
  {
    category: "Physical Wellness",
    icon: Activity,
    color: "green", 
    strategies: [
      {
        title: "Maintain Basic Self-Care",
        description: "Grief affects your body - prioritize basic physical needs",
        practical: "Set phone reminders to eat, drink water, and take medications"
      },
      {
        title: "Gentle Exercise",
        description: "Movement helps process grief hormones and improves mood",
        practical: "Start with 10-minute walks, yoga, or stretching - anything that feels manageable"
      },
      {
        title: "Prioritize Sleep",
        description: "Grief disrupts sleep, but rest is crucial for emotional healing",
        practical: "Create a calming bedtime routine and limit screens before bed"
      }
    ]
  },
  {
    category: "Social Support",
    icon: Users,
    color: "blue",
    strategies: [
      {
        title: "Accept Help from Others",
        description: "Let friends and family support you with practical and emotional needs",
        practical: "Make a list of specific ways people can help (meals, errands, companionship)"
      },
      {
        title: "Join Support Groups",
        description: "Connect with others who understand your specific type of loss",
        practical: "Try both online and in-person groups to find what works for you"
      },
      {
        title: "Communicate Your Needs",
        description: "Tell people how they can best support you during this time",
        practical: "Be specific: 'I need someone to listen' or 'I need help with groceries'"
      }
    ]
  },
  {
    category: "Mental Health",
    icon: Brain,
    color: "purple",
    strategies: [
      {
        title: "Practice Mindfulness",
        description: "Stay present instead of getting lost in 'what-ifs' and regrets",
        practical: "Try 5-minute breathing exercises or guided meditation apps"
      },
      {
        title: "Limit Major Decisions",
        description: "Grief affects judgment - postpone big life changes when possible",
        practical: "Wait at least 6-12 months before making major financial or life decisions"
      },
      {
        title: "Seek Professional Help",
        description: "Therapy can provide tools and support for complicated grief",
        practical: "Look for grief counselors or therapists specializing in bereavement"
      }
    ]
  }
];

const warningSigns = [
  "Thoughts of suicide or self-harm",
  "Inability to function in daily life for extended periods",
  "Substance abuse as a coping mechanism", 
  "Complete isolation from friends and family",
  "Inability to accept the death after many months",
  "Severe depression that doesn't improve over time"
];

const faqs = [
  {
    question: "How long does grief last?",
    answer: "Grief has no timeline. While acute grief symptoms often lessen after 6-12 months, grief is a lifelong process that comes in waves. Everyone grieves differently and at their own pace."
  },
  {
    question: "Is it normal to feel angry when grieving?",
    answer: "Yes, anger is a completely normal part of grief. You might feel angry at the person who died, at God, at yourself, or at the situation. These feelings are valid and part of the healing process."
  },
  {
    question: "Should I avoid things that remind me of my loved one?",
    answer: "While it's natural to avoid painful reminders initially, gradually facing these memories can be healing. Start small and go at your own pace - there's no rush."
  },
  {
    question: "When should I seek professional help for grief?",
    answer: "Consider professional help if you're having thoughts of self-harm, can't function in daily life, are using substances to cope, or if grief symptoms aren't improving after several months."
  },
  {
    question: "How can I help someone else who is grieving?",
    answer: "Listen without trying to fix, offer specific help (like bringing meals), remember important dates, and continue checking in weeks and months later when others may have moved on."
  }
];

export default function HowToCopePage() {
  return (
    <>
      <FAQSchema faqs={faqs} pageTitle="How to Cope with Grief FAQ" />
      <ArticleSchema
        headline="How to Cope with Grief: 15 Proven Strategies for Healing"
        description="Learn effective ways to cope with grief and loss. Evidence-based strategies for managing grief symptoms, finding support, and healing after losing a loved one."
        author="Talkers Clinical Team"
        datePublished="2024-01-01"
        url="/how-to-cope-with-grief"
        wordCount={3200}
        readingTime="12 minutes"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-green-50/30 to-blue-50/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: 'Grief Support', href: '/grief-support' },
              { label: 'How to Cope with Grief', href: '/how-to-cope-with-grief' }
            ]}
            className="mb-6"
          />

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              How to Cope
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                with Grief
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Evidence-based strategies to help you navigate grief, manage difficult emotions, 
              and find your path toward healing. You don't have to face this alone.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-700">Evidence-Based</Badge>
              <Badge className="bg-blue-100 text-blue-700">Clinically Reviewed</Badge>
              <Badge className="bg-purple-100 text-purple-700">Practical Strategies</Badge>
            </div>
          </div>

          {/* Important Note */}
          <Card className="mb-12 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Remember: Grief is Personal</h3>
                  <p className="text-amber-700 text-sm">
                    These strategies are suggestions, not requirements. Use what helps and leave what doesn't. 
                    Your grief journey is unique, and healing happens at your own pace.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coping Strategies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Proven Coping Strategies</h2>
            <div className="space-y-8">
              {copingStrategies.map((category, categoryIndex) => {
                const IconComponent = category.icon;
                return (
                  <div key={categoryIndex}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-full flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {category.strategies.map((strategy, strategyIndex) => (
                        <Card key={strategyIndex} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                          <CardContent className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">{strategy.title}</h4>
                            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                              {strategy.description}
                            </p>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Try This:</p>
                              <p className="text-gray-700 text-sm">{strategy.practical}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Warning Signs */}
          <section className="mb-12">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-red-800">When to Seek Professional Help</h2>
                </div>
                <p className="text-red-700 mb-6">
                  While grief is normal, some symptoms indicate you may benefit from professional support. 
                  Seek help if you experience:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {warningSigns.map((sign, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{sign}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link href="tel:988">
                    <Button className="bg-red-600 hover:bg-red-700 text-white mr-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Crisis Line: 988
                    </Button>
                  </Link>
                  <Link href="/grief-support">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      Find Professional Help
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Questions About Coping with Grief</h2>
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
          <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Find Ongoing Support for Your Grief Journey
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Coping with grief is an ongoing process. Connect with others who understand, 
                preserve precious memories, and find comfort in community support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/grief-support-groups-online">
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                    Join Support Groups
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
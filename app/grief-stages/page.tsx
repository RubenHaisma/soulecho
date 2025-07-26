import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  Clock, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Users
} from 'lucide-react';
import { generateGriefMetadata, griefPageConfigs } from '@/lib/grief-seo';
import Script from 'next/script';

export const metadata: Metadata = generateGriefMetadata(griefPageConfigs.griefStages);

const griefStages = [
  {
    stage: "Denial",
    subtitle: "\"This can't be happening\"",
    description: "Shock and disbelief that the loss has occurred. Your mind protects you from overwhelming pain.",
    duration: "Hours to weeks",
    symptoms: [
      "Numbness and shock",
      "Disbelief about the loss", 
      "Feeling disconnected from reality",
      "Difficulty accepting the truth",
      "Emotional numbness"
    ],
    whatHelps: [
      "Allow yourself to feel numb - it's protective",
      "Accept support from others for basic needs",
      "Don't rush to 'accept' the reality",
      "Focus on immediate practical needs"
    ],
    whenToSeekHelp: "If denial persists for many months or prevents necessary decisions",
    color: "blue",
    percentage: 20
  },
  {
    stage: "Anger", 
    subtitle: "\"Why did this happen?\"",
    description: "Frustration and rage about the unfairness of loss. Anger is often easier to feel than pain.",
    duration: "Weeks to months",
    symptoms: [
      "Irritability and rage",
      "Blame toward others or yourself",
      "Resentment and bitterness",
      "Feeling abandoned or betrayed",
      "Physical tension and restlessness"
    ],
    whatHelps: [
      "Find safe ways to express anger (exercise, journaling)",
      "Recognize anger as a normal grief response",
      "Avoid making major decisions while angry",
      "Consider anger management if it becomes destructive"
    ],
    whenToSeekHelp: "If anger becomes violent or severely impacts relationships",
    color: "red",
    percentage: 40
  },
  {
    stage: "Bargaining",
    subtitle: "\"If only I had...\"",
    description: "Attempting to negotiate or make deals to reverse the loss. Often involves guilt and 'what-if' thinking.",
    duration: "Days to months",
    symptoms: [
      "Obsessive 'what-if' thoughts",
      "Guilt about things said or unsaid",
      "Desperate attempts to undo the loss",
      "Magical thinking or superstitions",
      "Preoccupation with how things could be different"
    ],
    whatHelps: [
      "Practice self-compassion for guilt feelings",
      "Recognize you did the best you could",
      "Focus on what you can control now",
      "Share guilt feelings with trusted others"
    ],
    whenToSeekHelp: "If guilt becomes overwhelming or leads to self-harm thoughts",
    color: "yellow",
    percentage: 60
  },
  {
    stage: "Depression",
    subtitle: "\"I can't go on\"",
    description: "Deep sadness and despair about the reality of loss. This is often the longest and most difficult stage.",
    duration: "Months to years",
    symptoms: [
      "Profound sadness and crying",
      "Withdrawal from others",
      "Loss of interest in activities",
      "Fatigue and sleep problems",
      "Feelings of hopelessness"
    ],
    whatHelps: [
      "Allow yourself to feel the sadness fully",
      "Maintain basic self-care routines",
      "Stay connected with supportive people",
      "Consider professional counseling"
    ],
    whenToSeekHelp: "If depression includes suicidal thoughts or lasts over a year without improvement",
    color: "purple",
    percentage: 80
  },
  {
    stage: "Acceptance",
    subtitle: "\"I will be okay\"",
    description: "Coming to terms with the loss and finding ways to move forward while maintaining connection to your loved one.",
    duration: "Ongoing process",
    symptoms: [
      "Emotional stability returns",
      "Ability to remember with less pain",
      "Renewed interest in life",
      "Hope for the future",
      "Helping others through similar loss"
    ],
    whatHelps: [
      "Create meaningful memorials or rituals",
      "Share your story to help others",
      "Build new relationships and activities",
      "Honor your loved one's memory"
    ],
    whenToSeekHelp: "If you feel guilty about moving forward or finding happiness",
    color: "green",
    percentage: 100
  }
];

const mythsAndFacts = [
  {
    myth: "Grief follows a predictable timeline",
    fact: "Grief is unique for everyone. There's no 'normal' timeline, and you may cycle through stages multiple times."
  },
  {
    myth: "You should 'get over' grief",
    fact: "Grief doesn't end - it changes. The goal is learning to carry your love and loss together."
  },
  {
    myth: "Crying shows weakness",
    fact: "Tears are a healthy way to release emotional pain and stress hormones."
  },
  {
    myth: "Staying busy helps you heal faster",
    fact: "While some activity is healthy, avoiding grief feelings can prolong the healing process."
  }
];

export default function GriefStagesPage() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id="grief-stages-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Understanding the 5 Stages of Grief - Complete Guide',
            description: 'Comprehensive guide to the 5 stages of grief: denial, anger, bargaining, depression, and acceptance',
            url: 'https://talkers.pro/grief-stages',
            about: {
              '@type': 'MedicalCondition',
              name: 'Grief and Bereavement',
              alternateName: '5 Stages of Grief'
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: 5,
              itemListElement: griefStages.map((stage, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: stage.stage,
                description: stage.description
              }))
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Understanding the
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                5 Stages of Grief
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Grief isn't a problem to solve or a linear process to complete. These stages help us understand 
              the complex emotions of loss, but everyone's journey is unique.
            </p>
          </div>

          {/* Important Note */}
          <Card className="mb-12 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Important to Remember</h3>
                  <p className="text-amber-700 text-sm">
                    These stages aren't a checklist or timeline. You might experience them in any order, 
                    skip some entirely, or cycle through them multiple times. Your grief is as unique as 
                    your relationship with your loved one.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grief Stages */}
          <div className="space-y-8 mb-16">
            {griefStages.map((stage, index) => (
              <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r from-${stage.color}-400 to-${stage.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {stage.stage}
                        </CardTitle>
                        <p className="text-gray-600 italic">{stage.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stage.duration}
                    </Badge>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-700 leading-relaxed">{stage.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Common Symptoms
                      </h4>
                      <ul className="space-y-2">
                        {stage.symptoms.map((symptom, symptomIndex) => (
                          <li key={symptomIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-500" />
                        What Helps
                      </h4>
                      <ul className="space-y-2">
                        {stage.whatHelps.map((help, helpIndex) => (
                          <li key={helpIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{help}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">When to Seek Professional Help</h5>
                    <p className="text-red-700 text-sm">{stage.whenToSeekHelp}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Myths vs Facts */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Grief Myths vs Facts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mythsAndFacts.map((item, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-1">❌ Myth</h4>
                        <p className="text-red-700 text-sm">{item.myth}</p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-1">✅ Fact</h4>
                        <p className="text-green-700 text-sm">{item.fact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Support CTA */}
          <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Support Through Your Grief Journey?
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Understanding grief stages is just the beginning. Find personalized support, 
                connect with your loved one's memory, and discover healing through meaningful conversations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Heart className="w-4 h-4 mr-2" />
                    Start Your Healing Journey
                  </Button>
                </Link>
                <Link href="/grief-support">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Users className="w-4 h-4 mr-2" />
                    Find Support Groups
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
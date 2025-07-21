'use client';

import { Shield, Users, Award, Clock, Heart, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your privacy protected by healthcare standards"
    },
    {
      icon: Users,
      title: "10,000+ Families Helped",
      description: "Trusted by grieving families worldwide"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Help available whenever you need it"
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Built with empathy and understanding"
    },
    {
      icon: CheckCircle,
      title: "Secure & Private",
      description: "Enterprise-grade security for your memories"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Trusted by Families in Their Most Difficult Times
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center">
          {signals.map((signal, index) => {
            const IconComponent = signal.icon;
            return (
              <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <IconComponent className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{signal.title}</h3>
                  <p className="text-xs text-gray-600">{signal.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
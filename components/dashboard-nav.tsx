'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CreditCard, 
  Activity, 
  Zap, 
  Heart, 
  Settings, 
  Crown,
  Plus,
  Home
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    href: '/dashboard/subscription',
    label: 'Subscription',
    icon: CreditCard
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: Activity
  },
  {
    href: '/dashboard/usage',
    label: 'Usage',
    icon: Zap
  },
  {
    href: '/memories',
    label: 'Memories',
    icon: Heart
  },
  {
    href: '/upload',
    label: 'New Chat',
    icon: Plus
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings
  },
  {
    href: '/pricing',
    label: 'Upgrade',
    icon: Crown
  }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 p-4 bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`flex items-center gap-2 ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'hover:bg-purple-50 border-purple-200 text-purple-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
} 
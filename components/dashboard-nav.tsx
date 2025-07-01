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
    <nav className="flex flex-nowrap gap-2 p-2 sm:p-4 bg-white/60 backdrop-blur-md rounded-lg shadow-lg overflow-x-auto scrollbar-hide sm:flex-wrap sm:overflow-visible">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="min-w-[44px]">
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              className={`flex flex-col items-center justify-center gap-0 sm:gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:flex-row sm:px-4 sm:py-2 ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'hover:bg-purple-50 border-purple-200 text-purple-700'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline text-xs sm:text-base">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
} 
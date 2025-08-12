import type { Metadata } from 'next';
import { generateMetadata, pageConfigs } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: pageConfigs.hotline.title,
  description: pageConfigs.hotline.description,
  keywords: pageConfigs.hotline.keywords,
  type: 'service',
  canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://talkers.pro'}/hotline`
});

export default function HotlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



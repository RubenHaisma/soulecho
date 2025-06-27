import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EchoSoul - Connect with Cherished Memories',
  description: 'A gentle space to reconnect with your loved ones through AI-powered conversations using your shared WhatsApp messages.',
  keywords: 'AI memorial, deceased loved ones, WhatsApp memories, grief support, digital memorial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#fdfdfd] text-gray-800`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
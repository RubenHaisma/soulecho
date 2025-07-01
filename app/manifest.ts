import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Talkers - Connect with Cherished Memories',
    short_name: 'Talkers',
    description: 'AI-powered grief support platform for meaningful conversations with deceased loved ones',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfdfd',
    theme_color: '#6366f1',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['health', 'lifestyle', 'social'],
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    shortcuts: [
      {
        name: 'Start Conversation',
        short_name: 'Chat',
        description: 'Begin a new conversation with your loved one',
        url: '/dashboard',
        icons: [{ src: '/chat-icon.png', sizes: '96x96' }]
      },
      {
        name: 'Upload Messages',
        short_name: 'Upload',
        description: 'Upload new WhatsApp conversations',
        url: '/upload',
        icons: [{ src: '/upload-icon.png', sizes: '96x96' }]
      }
    ]
  };
} 
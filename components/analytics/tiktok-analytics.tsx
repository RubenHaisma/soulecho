
'use client';

import Script from 'next/script';

declare global {
  interface Window {
    ttq?: any;
  }
}

export function TikTokAnalytics() {
  return (
    <>
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=D1HOLOBC77U9GHP59FD0&lib=ttq"
        onLoad={() => {
          if (typeof window !== 'undefined' && typeof window.ttq !== 'undefined' && typeof window.ttq.page === 'function') {
            window.ttq.page();
          }
        }}
      />
    </>
  );
}
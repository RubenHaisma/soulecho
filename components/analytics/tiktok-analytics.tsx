
'use client';

import Script from 'next/script';

export function TikTokAnalytics() {
  return (
    <>
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=D1HOLOBC77U9GHP59FD0&lib=ttq"
      />
      <Script
        id="tiktok-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.TiktokAnalyticsObject = 'ttq';
              var ttq = window.ttq = window.ttq || [];
              ttq.page();
            }
          `,
        }}
      />
    </>
  );
}

'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  return (
    <>
      <Script
        id="google-analytics-loader"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-M05ZEYTGGX"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-M05ZEYTGGX');
            }
          `,
        }}
      />
    </>
  );
}
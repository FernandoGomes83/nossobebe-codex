import Script from "next/script";

import { getAdsenseConfig } from "@/lib/adsense";

export function BlogAdsenseScript() {
  const { enabled, clientId } = getAdsenseConfig();

  if (!enabled || !clientId) {
    return null;
  }

  return (
    <Script
      async
      crossOrigin="anonymous"
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="lazyOnload"
    />
  );
}

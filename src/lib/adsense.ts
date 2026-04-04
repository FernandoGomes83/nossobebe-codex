type PublicAdsenseEnvKey =
  | "NEXT_PUBLIC_ADSENSE_CLIENT_ID"
  | "NEXT_PUBLIC_ADSENSE_BLOG_INLINE_SLOT"
  | "NEXT_PUBLIC_ADSENSE_BLOG_MIDDLE_SLOT"
  | "NEXT_PUBLIC_ADSENSE_BLOG_FOOTER_SLOT";

function readOptionalPublicEnv(key: PublicAdsenseEnvKey) {
  const value = process.env[key]?.trim();
  return value ? value : null;
}

export function getAdsenseConfig() {
  const clientId = readOptionalPublicEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID");

  return {
    enabled: Boolean(clientId),
    clientId,
    blogSlots: {
      inline: readOptionalPublicEnv("NEXT_PUBLIC_ADSENSE_BLOG_INLINE_SLOT"),
      middle: readOptionalPublicEnv("NEXT_PUBLIC_ADSENSE_BLOG_MIDDLE_SLOT"),
      footer: readOptionalPublicEnv("NEXT_PUBLIC_ADSENSE_BLOG_FOOTER_SLOT"),
    },
  };
}

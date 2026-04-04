import { BlogAdSlot } from "@/components/blog/ad-slot";
import { getAdsenseConfig } from "@/lib/adsense";

type BlogMdxAdBreakProps = {
  variant?: "inline" | "middle" | "footer";
};

const slotTitles = {
  inline: "Espaco patrocinado",
  middle: "Publicidade relacionada",
  footer: "Publicidade",
} as const;

export function BlogMdxAdBreak({
  variant = "inline",
}: BlogMdxAdBreakProps) {
  const adsense = getAdsenseConfig();
  const slotId = adsense.blogSlots[variant];

  return (
    <BlogAdSlot
      clientId={adsense.clientId}
      slotId={slotId}
      title={slotTitles[variant]}
      variant={variant}
    />
  );
}

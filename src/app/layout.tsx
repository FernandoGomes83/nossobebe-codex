import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.APP_URL || "https://nossobebe.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NossoBebe",
    template: "%s | NossoBebe",
  },
  description: "Packs digitais personalizados para celebrar a chegada do bebe.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NossoBebe",
    description: "Packs digitais personalizados para celebrar a chegada do bebe.",
    url: siteUrl,
    siteName: "NossoBebe",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NossoBebe",
    description: "Packs digitais personalizados para celebrar a chegada do bebe.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NossoBebe",
    url: siteUrl,
    inLanguage: "pt-BR",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NossoBebe",
    url: siteUrl,
    email: "contato@nossobebe.com.br",
  };

  return (
    <html lang="pt-BR">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
          type="application/ld+json"
        />
        {children}
      </body>
    </html>
  );
}

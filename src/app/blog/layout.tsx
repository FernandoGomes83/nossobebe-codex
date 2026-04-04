import { BlogAdsenseScript } from "@/components/blog/adsense-script";

type BlogLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      <BlogAdsenseScript />
      {children}
    </>
  );
}

import type { MDXComponents } from "mdx/types";

import { BlogMdxAdBreak } from "@/components/blog/mdx-ad-break";

export function createDefaultMdxComponents(): MDXComponents {
  return {
    AdBreak: ({ variant }) => (
      <BlogMdxAdBreak
        variant={variant as "inline" | "middle" | "footer" | undefined}
      />
    ),
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    p: ({ children }) => <p>{children}</p>,
    ul: ({ children }) => <ul>{children}</ul>,
    ol: ({ children }) => <ol>{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    a: ({ children, href }) => (
      <a href={href} rel="noreferrer">
        {children}
      </a>
    ),
  };
}

export function useMDXComponents(): MDXComponents {
  return createDefaultMdxComponents();
}

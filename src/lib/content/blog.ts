import fs from "node:fs/promises";
import path from "node:path";

type BlogPostModule = {
  metadata: {
    title: string;
    description: string;
    publishedAt: string;
    category: string;
  };
  default: React.ComponentType;
};

const blogDirectory = path.join(process.cwd(), "src/content/blog");

export async function listBlogSlugs() {
  const entries = await fs.readdir(blogDirectory);
  return entries.filter((entry) => entry.endsWith(".mdx")).map((entry) => entry.replace(/\.mdx$/, ""));
}

export async function getAllBlogPosts() {
  const slugs = await listBlogSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const postModule = (await import(
        `@/content/blog/${slug}.mdx`
      )) as BlogPostModule;

      return {
        slug,
        ...postModule.metadata,
      };
    }),
  );

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getBlogPost(slug: string) {
  try {
    const postModule = (await import(
      `@/content/blog/${slug}.mdx`
    )) as BlogPostModule;
    return postModule;
  } catch {
    return null;
  }
}

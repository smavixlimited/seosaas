export type ContentItem = {
  slug: string;
  title: string;
  description: string;
  author?: string;
  date?: string;
  category?: string;
  content: string;
  filePath: string;
};

// Eagerly import all markdown/mdx content as raw text
const rawContentFiles = import.meta.glob<string>("../content/**/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw };
  }

  const [, yamlBlock, body] = match;
  const meta: Record<string, string> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      meta[key] = value;
    }
  }

  return { meta, body };
}

// Convert all imported files into ContentItem array
const allContentItems: ContentItem[] = Object.entries(rawContentFiles).map(
  ([path, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    // Example path: "../content/blogs/seo-for-startups.md"
    const cleanPath = path
      .replace(/^\.\.\/content\//, "")
      .replace(/\.(md|mdx)$/, "");
    const parts = cleanPath.split("/");
    const slug = parts[parts.length - 1];
    const category = parts.length > 1 ? parts[0] : undefined;

    return {
      slug,
      title:
        meta.title ||
        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: meta.description || "",
      author: meta.author || "Skorvia SEO Intelligence",
      date: meta.date || "2026-05-01",
      category,
      content: body,
      filePath: cleanPath,
    };
  },
);

// Blog helpers
export function getAllBlogs(): ContentItem[] {
  return allContentItems
    .filter((item) => item.filePath.startsWith("blogs/"))
    .toSorted((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getBlogBySlug(slug: string): ContentItem | undefined {
  return allContentItems.find(
    (item) => item.filePath.startsWith("blogs/") && item.slug === slug,
  );
}

// Docs helpers
export function getAllDocs(): ContentItem[] {
  return allContentItems.filter((item) => item.filePath.startsWith("docs/"));
}

export function getDocByPath(docPath: string): ContentItem | undefined {
  const normalized = docPath.replace(/^\//, "").replace(/\/$/, "");
  return allContentItems.find(
    (item) =>
      item.filePath === `docs/${normalized}` ||
      item.filePath === `docs/${normalized}/index` ||
      item.slug === normalized,
  );
}

// Skills helpers
export function getAllSkills(): ContentItem[] {
  return allContentItems.filter((item) =>
    item.filePath.startsWith("docs/skills/"),
  );
}

export function getSkillBySlug(slug: string): ContentItem | undefined {
  return allContentItems.find(
    (item) => item.filePath.startsWith("docs/skills/") && item.slug === slug,
  );
}

// Strategy Library helpers
export function getAllStrategies(): ContentItem[] {
  return allContentItems.filter((item) =>
    item.filePath.startsWith("marketing/library/"),
  );
}

export function getStrategyBySlug(slug: string): ContentItem | undefined {
  return allContentItems.find(
    (item) =>
      item.filePath.startsWith("marketing/library/") && item.slug === slug,
  );
}

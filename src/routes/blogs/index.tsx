import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { getPublicBlogPostsServerFn } from "@/serverFunctions/blog-cms";
import type { BlogPostRecord } from "@/services/blog-cms.service";

export const Route = createFileRoute("/blogs/")({
  loader: async () => {
    try {
      return await getPublicBlogPostsServerFn({
        data: { status: "published", limit: 50 },
      });
    } catch {
      return { posts: [], total: 0, page: 1, totalPages: 1 };
    }
  },
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const loaderData = Route.useLoaderData();
  const allPosts: BlogPostRecord[] = loaderData?.posts ?? [];

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const categories = [
    "all",
    "AI Visibility",
    "Technical SEO",
    "SEO Guides",
    "Case Studies",
  ];

  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase()) ||
      post.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-cyan">SEO & AEO Research</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} Engineering Blog
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto">
              Technical SEO blueprints, AI search visibility breakdowns, and
              modern organic growth playbooks.
            </p>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="mt-12 max-w-3xl mx-auto space-y-6">
            <div className="relative max-w-md mx-auto">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-secondary/40 dark:text-accent/40"
              />
              <input
                type="text"
                placeholder="Search articles, guides, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full text-tagline-2 bg-background-1 dark:bg-background-7 border border-stroke-4 dark:border-stroke-8 text-secondary dark:text-accent focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2 text-tagline-3 font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-secondary text-white dark:bg-accent dark:text-secondary shadow-xs"
                      : "bg-background-1 dark:bg-background-7 text-secondary/70 dark:text-accent/70 border border-stroke-4 dark:border-stroke-8 hover:text-secondary dark:hover:text-accent"
                  }`}
                >
                  {cat === "all" ? "All Topics" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-tagline-1 text-secondary/40 dark:text-accent/40">
                No articles matched your search query. Try another keyword or
                topic.
              </div>
            ) : (
              filteredPosts.map((blog) => (
                <article key={blog.slug} className="group">
                  <div className="bg-background-1 dark:bg-background-6 relative scale-100 overflow-hidden rounded-[20px] border border-stroke-4 dark:border-stroke-8 transition-transform duration-300 hover:scale-[102%] hover:shadow-xl flex flex-col justify-between h-full">
                    <div>
                      {blog.coverImageUrl ? (
                        <figure className="h-[230px] max-w-full overflow-hidden">
                          <img
                            src={blog.coverImageUrl}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </figure>
                      ) : (
                        <div className="h-[180px] bg-gradient-to-br from-primary-500/10 via-background-2 to-secondary/10 flex items-center justify-center">
                          <Icon
                            icon="solar:document-text-bold-duotone"
                            className="size-16 text-primary-500/40"
                          />
                        </div>
                      )}

                      <div className="space-y-4 p-6">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-green">
                            {blog.category}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-stroke-4 dark:bg-stroke-8"></span>
                          <span className="text-tagline-3 text-secondary/60 dark:text-accent/60 font-normal">
                            {blog.readingTimeMinutes} min read
                          </span>
                        </div>

                        <div>
                          <h3 className="text-heading-6 font-bold font-interTight line-clamp-2 text-secondary dark:text-accent group-hover:text-primary-500 transition-colors">
                            <Link to="/blogs/$" params={{ _splat: blog.slug }}>
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 line-clamp-3 mt-2 font-normal leading-relaxed">
                            {blog.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center justify-between border-t border-stroke-4/60 dark:border-stroke-8/60 mt-4">
                      <span className="text-tagline-3 text-secondary/60 dark:text-accent/60 font-medium">
                        {blog.authorName}
                      </span>
                      <Link
                        to="/blogs/$"
                        params={{ _splat: blog.slug }}
                        className="btn btn-sm btn-white hover:btn-secondary dark:btn-transparent dark:hover:btn-accent dark:hover:text-secondary rounded-full font-bold text-xs"
                      >
                        Read Article
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

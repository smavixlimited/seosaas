import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Clock, Search, Tag, User } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { getPublicBlogPostsServerFn } from "@/serverFunctions/blog-cms";
import type { BlogPostRecord } from "@/services/blog-cms.service";

export const Route = createFileRoute("/blogs/")({
  loader: async () => {
    try {
      return await getPublicBlogPostsServerFn({ data: { status: "published", limit: 50 } });
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

  const categories = ["all", "AI Visibility", "Technical SEO", "SEO Guides", "Case Studies"];

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
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              SEO & AEO Research Publications
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name} Engineering Blog
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Technical SEO blueprints, AI search visibility breakdowns, and organic growth playbooks.
            </p>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="mt-12 max-w-4xl mx-auto space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search articles, guides, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-2xl text-xs bg-base-100 shadow-xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs sm:btn-sm rounded-xl font-bold transition-all ${
                    selectedCategory === cat
                      ? "btn-primary text-white shadow-xs"
                      : "btn-ghost text-base-content/70 hover:bg-base-200"
                  }`}
                >
                  {cat === "all" ? "All Topics" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-base-content/50">
                No articles matched your search query. Try another keyword or topic.
              </div>
            ) : (
              filteredPosts.map((blog) => (
                <Link
                  key={blog.slug}
                  to="/blogs/$"
                  params={{ _splat: blog.slug }}
                  className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-200 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between group overflow-hidden"
                >
                  <div className="space-y-4">
                    {blog.coverImageUrl && (
                      <div className="overflow-hidden rounded-2xl -mx-2 -mt-2 mb-3">
                        <img
                          src={blog.coverImageUrl}
                          alt={blog.title}
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-base-content/60">
                      <span className="badge badge-primary badge-outline badge-xs font-bold">
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="h-3 w-3" />
                        {blog.readingTimeMinutes} min read
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-base-content/70 mt-2 leading-relaxed line-clamp-3">
                        {blog.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-base-200/60 mt-4 flex items-center justify-between text-xs">
                    <span className="text-base-content/60 font-medium">{blog.authorName}</span>
                    <span className="font-bold text-primary flex items-center gap-0.5">
                      Read <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Markdown } from "@/client/components/Markdown";
import { getPublicBlogPostBySlugServerFn } from "@/serverFunctions/blog-cms";
import type { BlogPostRecord } from "@/services/blog-cms.service";

export const Route = createFileRoute("/blogs/$")({
  loader: async ({ params }) => {
    const splat = params._splat || "";
    const parts = splat.split("/");
    const slug = parts[parts.length - 1];

    try {
      return await getPublicBlogPostBySlugServerFn({ data: { slug } });
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    const blog = loaderData as BlogPostRecord | null;
    const title = blog?.metaTitle || blog?.title || `SEO & AEO Research — ${BRAND_CONFIG.name}`;
    const description = blog?.metaDescription || blog?.description || BRAND_CONFIG.description;
    const ogImage = blog?.coverImageUrl || BRAND_CONFIG.logoUrl;

    return {
      meta: [
        { title: `${title} | ${BRAND_CONFIG.name}` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: blog?.canonicalUrl ? [{ rel: "canonical", href: blog.canonicalUrl }] : [],
    };
  },
  component: BlogPostReaderPage,
});

function BlogPostReaderPage() {
  const params = useParams({ from: "/blogs/$" });
  const splat = params._splat || "";
  const parts = splat.split("/");
  const slug = parts[parts.length - 1];

  const blog = Route.useLoaderData() as BlogPostRecord | null;

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Link to="/blogs" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> All Articles
            </Link>
            <span>/</span>
            <span className="text-base-content/70 capitalize">{slug.replace(/-/g, " ")}</span>
          </div>

          {blog ? (
            <article className="space-y-8">
              {/* Article Header */}
              <div className="space-y-4 border-b border-base-300 pb-8">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm font-bold">{blog.category}</span>
                  <span className="text-xs text-base-content/50 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" /> {blog.readingTimeMinutes} min read
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
                  {blog.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-base-content/60 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <User className="h-3.5 w-3.5" />
                    {blog.authorName}
                  </span>
                </div>

                {blog.description && (
                  <p className="text-lg text-base-content/80 font-medium leading-relaxed pt-2">
                    {blog.description}
                  </p>
                )}
              </div>

              {/* Cover Image */}
              {blog.coverImageUrl && (
                <div className="overflow-hidden rounded-3xl border border-base-300 shadow-sm">
                  <img
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    className="w-full max-h-[420px] object-cover"
                  />
                </div>
              )}

              {/* Article Body */}
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-10 shadow-xs">
                <Markdown>{blog.content}</Markdown>
              </div>

              {/* Author Bio Card */}
              <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                  {blog.authorName[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-base-content">{blog.authorName}</h4>
                  <p className="text-xs text-base-content/60">{blog.authorRole || "Technical SEO Specialist"}</p>
                </div>
              </div>

              {/* Bottom Conversion CTA */}
              <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 p-8 text-center space-y-4 shadow-sm">
                <h3 className="text-2xl font-black text-base-content">
                  Boost your search visibility with {BRAND_CONFIG.name}
                </h3>
                <p className="text-sm text-base-content/70 max-w-lg mx-auto">
                  Get full access to live SERP volume, competitor keyword gaps, and AI Answer Engine visibility tracking today.
                </p>
                <div className="pt-2">
                  <Link
                    to="/sign-up"
                    className="btn btn-primary rounded-2xl px-8 font-bold text-white bg-primary hover:bg-primary/90 border-none shadow-md shadow-primary/25"
                  >
                    Start Free 14-Day Trial
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="text-center py-16 space-y-4">
              <h2 className="text-2xl font-bold text-base-content">Article Not Found</h2>
              <p className="text-sm text-base-content/60">
                The requested blog post could not be located.
              </p>
              <Link to="/blogs" className="btn btn-primary btn-sm rounded-xl font-bold">
                Return to Blog Hub
              </Link>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

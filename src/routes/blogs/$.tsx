import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
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
    const title =
      blog?.metaTitle ||
      blog?.title ||
      `SEO & AEO Research — ${BRAND_CONFIG.name}`;
    const description =
      blog?.metaDescription || blog?.description || BRAND_CONFIG.description;
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
      links: blog?.canonicalUrl
        ? [{ rel: "canonical", href: blog.canonicalUrl }]
        : [],
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
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container max-w-4xl space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-tagline-3 font-semibold text-primary-500">
            <Link
              to="/blogs"
              className="hover:underline flex items-center gap-1.5"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" /> All
              Articles
            </Link>
            <span className="text-secondary/30 dark:text-accent/30">/</span>
            <span className="text-secondary/60 dark:text-accent/60 capitalize truncate">
              {slug.replace(/-/g, " ")}
            </span>
          </div>

          {blog ? (
            <article className="space-y-8">
              {/* Article Header */}
              <div className="space-y-4 border-b border-stroke-4 dark:border-stroke-8 pb-8">
                <div className="flex items-center gap-3">
                  <span className="badge badge-green">{blog.category}</span>
                  <span className="text-tagline-3 text-secondary/60 dark:text-accent/60 flex items-center gap-1">
                    <Icon icon="solar:clock-circle-linear" className="size-4" />{" "}
                    {blog.readingTimeMinutes} min read
                  </span>
                </div>

                <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight leading-tight">
                  {blog.title}
                </h1>

                <div className="flex items-center gap-4 text-tagline-3 text-secondary/60 dark:text-accent/60 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Icon icon="solar:calendar-linear" className="size-4" />
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon icon="solar:user-linear" className="size-4" />
                    {blog.authorName}
                  </span>
                </div>

                {blog.description && (
                  <p className="text-tagline-1 text-secondary/80 dark:text-accent/80 font-medium leading-relaxed pt-2">
                    {blog.description}
                  </p>
                )}
              </div>

              {/* Cover Image */}
              {blog.coverImageUrl && (
                <div className="overflow-hidden rounded-[24px] border border-stroke-4 dark:border-stroke-8 shadow-sm">
                  <img
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    className="w-full max-h-[440px] object-cover"
                  />
                </div>
              )}

              {/* Article Body */}
              <div className="rounded-[24px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 sm:p-10 shadow-xs prose prose-lg dark:prose-invert max-w-none">
                <Markdown>{blog.content}</Markdown>
              </div>

              {/* Author Bio Card */}
              <div className="p-6 rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-lg">
                  {blog.authorName[0]}
                </div>
                <div>
                  <h4 className="text-heading-6 font-bold font-interTight text-secondary dark:text-accent">
                    {blog.authorName}
                  </h4>
                  <p className="text-tagline-3 text-secondary/60 dark:text-accent/60">
                    {blog.authorRole || "Technical SEO Specialist"}
                  </p>
                </div>
              </div>

              {/* Bottom Conversion CTA */}
              <div className="rounded-[24px] border border-primary-500/30 bg-secondary dark:bg-background-5 p-8 sm:p-10 text-center space-y-4 shadow-xl text-white">
                <span className="badge badge-yellow">
                  Scale Your Search Footprint
                </span>
                <h3 className="text-heading-3 font-bold font-interTight text-white">
                  Boost your organic visibility with {BRAND_CONFIG.name}
                </h3>
                <p className="text-tagline-1 text-accent/80 max-w-lg mx-auto">
                  Access live SERP keyword tracking, AI Search citations,
                  backlink discovery, and automated technical audits today.
                </p>
                <div className="pt-3">
                  <Link
                    to="/sign-up"
                    className="btn btn-primary bg-primary-500 hover:bg-primary-600 text-white rounded-full px-8 font-bold border-none shadow-lg shadow-primary-500/25"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="text-center py-20 space-y-4">
              <h2 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                Article Not Found
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                The requested blog post could not be located.
              </p>
              <Link
                to="/blogs"
                className="btn btn-primary btn-md rounded-full font-bold"
              >
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

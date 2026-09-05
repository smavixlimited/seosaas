import * as React from "react";
import { Link } from "@tanstack/react-router";

const blogPosts = [
  {
    slug: "recovering-lost-organic-traffic",
    tag: "SEO Playbook",
    category: "Case Study",
    publishDate: "May 14, 2026",
    readTime: "5 min read",
    title: "How to Recover 40% Lost Organic Traffic from Position 11-20 Keyword Leaks",
    thumbnail: "/images/ns-img-493.png",
  },
  {
    slug: "competitor-ad-creative-playbook",
    tag: "Ad Intelligence",
    category: "Paid Search",
    publishDate: "May 10, 2026",
    readTime: "4 min read",
    title: "The 3 Multi-Network Ad Creatives Top SaaS Brands Keep Active for 45+ Days",
    thumbnail: "/images/ns-img-494.png",
  },
  {
    slug: "winning-ai-search-aeo",
    tag: "AI & AEO",
    category: "Future of Search",
    publishDate: "May 06, 2026",
    readTime: "6 min read",
    title: "Winning AI Search: How to Get ChatGPT, Claude & Perplexity to Cite Your Product",
    thumbnail: "/images/ns-img-495.png",
  },
];

export function TemplateBlog() {
  const featured = blogPosts[0];
  const sideBlogs = blogPosts.slice(1);

  return (
    <section className="bg-background-2 dark:bg-background-5 py-[60px] md:py-[100px] lg:py-[130px] xl:py-[160px]">
      <div className="main-container">
        <div className="space-y-[50px] md:space-y-[60px] lg:space-y-[70px]">
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="badge badge-green mb-3">Recent Guides &amp; Insights</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Our latest research &amp; tactical playbooks
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60 max-w-2xl mx-auto">
                Actionable breakdowns on modern SERP dynamics, competitor ad frameworks, and AI Answer Engine citation defense.
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-12 justify-center gap-y-8 lg:gap-x-8">
            {/* Featured Blog (Left, 6 cols) */}
            <article className="group col-span-12 lg:col-span-5 xl:col-span-6">
              <div className="dark:bg-background-6 space-y-8 rounded-[24px] bg-white transition-transform duration-500 group-hover:scale-[101%] border border-stroke-3/50 dark:border-stroke-7 overflow-hidden shadow-xs">
                <figure className="w-full overflow-hidden h-[260px] sm:h-[320px] xl:h-[350px]">
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </figure>

                <div className="px-6 pb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="badge badge-gray-light">{featured.tag}</span>
                    <span className="badge badge-gray-light">{featured.category}</span>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-tagline-2 text-secondary/60 dark:text-accent/60">
                      <span>{featured.publishDate}</span>
                      <span>•</span>
                      <span>{featured.readTime}</span>
                    </div>

                    <h3 className="text-heading-5 font-bold text-secondary dark:text-accent leading-snug">
                      {featured.title}
                    </h3>
                  </div>

                  <Link
                    to="/blogs"
                    className="btn btn-white hover:btn-secondary btn-md dark:btn-transparent dark:hover:btn-accent"
                  >
                    Read full breakdown
                  </Link>
                </div>
              </div>
            </article>

            {/* Side Blogs (Right, 6 cols) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              <div className="flex flex-col gap-y-6 sm:gap-y-8">
                {sideBlogs.map((post) => (
                  <article key={post.slug} className="group">
                    <div className="dark:bg-background-6 flex flex-col sm:flex-row items-center rounded-[24px] bg-white transition-transform duration-500 group-hover:scale-[101%] border border-stroke-3/50 dark:border-stroke-7 overflow-hidden shadow-xs">
                      <figure className="w-full sm:w-[220px] shrink-0 h-[200px] sm:h-[220px] overflow-hidden">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </figure>

                      <div className="p-6 sm:p-5 flex flex-col justify-between h-full space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-gray-light">{post.tag}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-tagline-3 text-secondary/60 dark:text-accent/60">
                            <span>{post.publishDate}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>

                          <h3 className="text-heading-6 font-bold text-secondary dark:text-accent line-clamp-2">
                            {post.title}
                          </h3>
                        </div>

                        <div>
                          <Link
                            to="/blogs"
                            className="btn btn-white hover:btn-secondary btn-sm dark:btn-transparent dark:hover:btn-accent"
                          >
                            Read article
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateBlog;

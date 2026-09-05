import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminBlogPostsListServerFn,
  upsertAdminBlogPostServerFn,
  deleteAdminBlogPostServerFn,
} from "@/serverFunctions/blog-cms";
import { FileUploadDropzone } from "@/client/components/FileUploadDropzone";
import { RichTextEditor } from "@/client/components/RichTextEditor";
import type { BlogPostRecord } from "@/services/blog-cms.service";

export const Route = createFileRoute("/_admin/admin/blog")({
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const [editingPost, setEditingPost] = React.useState<BlogPostRecord | null>(
    null,
  );
  const [isCreating, setIsCreating] = React.useState(false);

  const blogsQuery = useQuery({
    queryKey: [
      "adminBlogPosts",
      { search, category: categoryFilter, status: statusFilter, page },
    ],
    queryFn: () =>
      getAdminBlogPostsListServerFn({
        data: {
          search: search || undefined,
          category: categoryFilter,
          status: statusFilter,
          page,
          limit: 10,
        },
      }),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: BlogPostRecord) => upsertAdminBlogPostServerFn({ data }),
    onSuccess: (saved) => {
      toast.success(`Article "${saved.title}" saved successfully!`);
      setEditingPost(null);
      setIsCreating(false);
      void queryClient.invalidateQueries({ queryKey: ["adminBlogPosts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save article");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminBlogPostServerFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Article deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["adminBlogPosts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete article");
    },
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingPost({
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: "",
      slug: "",
      description: "",
      content:
        "<h2>Introduction</h2><p>Write your in-depth SEO guide or product update here...</p><h3>Key Takeaways:</h3><ul><li>Point 1</li><li>Point 2</li></ul>",
      category: "SEO Guides",
      coverImageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      authorName: "Skorvia SEO Editorial",
      authorRole: "Senior SEO Strategist",
      metaTitle: "",
      metaDescription: "",
      focusKeywords: "",
      canonicalUrl: "",
      status: "published",
      readingTimeMinutes: 4,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAutoSlug = () => {
    if (!editingPost || !editingPost.title) return;
    const generated = editingPost.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setEditingPost({
      ...editingPost,
      slug: generated,
      canonicalUrl: `https://skorvia.com/blogs/${generated}`,
      metaTitle: editingPost.metaTitle || editingPost.title,
      metaDescription: editingPost.metaDescription || editingPost.description,
    });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      toast.error("Please provide an article title");
      return;
    }
    upsertMutation.mutate(editingPost);
  };

  const data = blogsQuery.data as
    | { posts: BlogPostRecord[]; total: number; totalPages: number }
    | undefined;
  const posts: BlogPostRecord[] = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // --------------------------------------------------------------------------
  // INLINE FULL-PAGE EDITOR VIEW (NO POPUPS - 100% FIT TO PAGE)
  // --------------------------------------------------------------------------
  if (editingPost) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setIsCreating(false);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon icon="solar:arrow-left-bold" className="h-4 w-4" />
              <span>Back to Articles</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isCreating
                  ? "Drafting New Article"
                  : `Editing: ${editingPost.title || "Untitled"}`}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                {editingPost.slug
                  ? `/blogs/${editingPost.slug}`
                  : "Unpublished Draft"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={editingPost.status}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  status: e.target.value as "published" | "draft" | "scheduled",
                })
              }
              className="h-9 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="published">🟢 Published</option>
              <option value="draft">⚪ Draft</option>
              <option value="scheduled">🟡 Scheduled</option>
            </select>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={upsertMutation.isPending}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
              <span>
                {upsertMutation.isPending ? "Saving..." : "Save & Publish"}
              </span>
            </button>
          </div>
        </div>

        {/* 2-Column Full-Page Layout: Canvas (8 cols) + Settings Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Writing Canvas (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Slug Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Article Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    placeholder="e.g. Master Guide: Dominating Answer Engine Optimization (AEO) in 2026"
                    className="h-11 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Auto-Slug
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingPost.slug}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, slug: e.target.value })
                    }
                    placeholder="article-slug"
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Short Teaser Description
                  </label>
                  <input
                    type="text"
                    value={editingPost.description}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        description: e.target.value,
                      })
                    }
                    placeholder="Quick summary shown on blog feed..."
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CKEditor 5 Body Editor Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Icon
                    icon="solar:pen-bold-duotone"
                    className="h-4 w-4 text-primary"
                  />
                  <span>Rich Article Body &amp; Media</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Full HTML / Visual WYSIWYG
                </span>
              </div>

              <RichTextEditor
                value={editingPost.content}
                onChange={(content) =>
                  setEditingPost({ ...editingPost, content })
                }
                placeholder="Write your article content with formatting, tables, images, and quotes..."
                minHeight="520px"
              />
            </div>
          </div>

          {/* Settings Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cover Image */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-3">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon
                  icon="solar:gallery-bold-duotone"
                  className="h-4 w-4 text-primary"
                />
                <span>Featured Cover Image</span>
              </h5>

              <FileUploadDropzone
                folder="blog/covers"
                label="Upload Cover Image"
                currentUrl={editingPost.coverImageUrl || undefined}
                onUploadComplete={(url: string) =>
                  setEditingPost({ ...editingPost, coverImageUrl: url })
                }
                onRemove={() =>
                  setEditingPost({ ...editingPost, coverImageUrl: "" })
                }
              />
            </div>

            {/* Post Metadata & Author */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4 text-xs">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                <Icon
                  icon="solar:tag-bold-duotone"
                  className="h-4 w-4 text-indigo-500"
                />
                <span>Category &amp; Editorial Attribution</span>
              </h5>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Category
                </label>
                <select
                  value={editingPost.category}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, category: e.target.value })
                  }
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold focus:outline-none"
                >
                  <option value="AI Visibility">AI Visibility &amp; AEO</option>
                  <option value="Technical SEO">Technical SEO</option>
                  <option value="SEO Guides">SEO Guides</option>
                  <option value="Case Studies">Case Studies</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Author Name
                </label>
                <input
                  type="text"
                  value={editingPost.authorName}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      authorName: e.target.value,
                    })
                  }
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Reading Time (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingPost.readingTimeMinutes}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      readingTimeMinutes: Number(e.target.value),
                    })
                  }
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Google SERP SEO Meta Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4 text-xs">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                <Icon
                  icon="solar:magnifer-bold-duotone"
                  className="h-4 w-4 text-emerald-500"
                />
                <span>SEO Meta &amp; SERP Preview</span>
              </h5>

              {/* SERP Preview Card */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Google Search Preview
                </span>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  https://skorvia.com &gt; blogs &gt;{" "}
                  {editingPost.slug || "slug"}
                </p>
                <h6 className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline truncate">
                  {editingPost.metaTitle ||
                    editingPost.title ||
                    "Article Title Placeholder"}
                </h6>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  {editingPost.metaDescription ||
                    editingPost.description ||
                    "Meta description preview for search engines..."}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Meta Title
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {(editingPost.metaTitle || "").length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={editingPost.metaTitle || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      metaTitle: e.target.value,
                    })
                  }
                  placeholder="Primary search title..."
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Meta Description
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {(editingPost.metaDescription || "").length}/160
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={editingPost.metaDescription || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      metaDescription: e.target.value,
                    })
                  }
                  placeholder="Compelling SERP description..."
                  className="w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Target Keywords
                </label>
                <input
                  type="text"
                  value={editingPost.focusKeywords || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      focusKeywords: e.target.value,
                    })
                  }
                  placeholder="AEO, SEO SaaS, AI Search"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ARTICLES DIRECTORY TABLE VIEW (DEFAULT FULL-WIDTH DASHBOARD)
  // --------------------------------------------------------------------------
  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Blog CMS &amp; Editorial Publishing Hub
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Write, edit, and publish search-optimized articles with CKEditor 5,
            R2 image manager, and Google SERP simulator.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Icon icon="solar:pen-new-square-bold-duotone" className="h-4 w-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Icon
              icon="solar:minimalistic-magnifer-line-duotone"
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search title, category, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="AI Visibility">AI Visibility &amp; AEO</option>
            <option value="Technical SEO">Technical SEO</option>
            <option value="SEO Guides">SEO Guides</option>
            <option value="Case Studies">Case Studies</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Blog Posts Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Published &amp; Draft Articles ({total})
          </h5>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Article Title &amp; Slug</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Published Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    {blogsQuery.isLoading
                      ? "Loading blog posts..."
                      : "No articles found."}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImageUrl || "/logo.png"}
                          alt={post.title}
                          className="h-10 w-14 rounded-md object-cover bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-md">
                            {post.title}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 truncate">
                            /blogs/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 dark:text-slate-200 font-medium">
                      {post.authorName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          post.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : post.status === "draft"
                              ? "bg-slate-100 dark:bg-slate-700 text-slate-500"
                              : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPost(post);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 inline-flex"
                        title="Edit Article"
                      >
                        <Icon
                          icon="solar:pen-bold-duotone"
                          className="h-4 w-4"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete post "${post.title}"?`)) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 inline-flex"
                        title="Delete Article"
                      >
                        <Icon
                          icon="solar:trash-bin-2-bold-duotone"
                          className="h-4 w-4"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

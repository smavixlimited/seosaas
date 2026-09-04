import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { BlogCmsService, type BlogPostRecord } from "@/services/blog-cms.service";
import { AppError } from "@/server/lib/errors";

const filterBlogsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

const getBySlugSchema = z.object({
  slug: z.string().min(1),
});

const upsertBlogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  coverImageUrl: z.string().optional().nullable(),
  authorName: z.string().min(1),
  authorRole: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  focusKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  status: z.enum(["published", "draft", "scheduled"]),
});

const deleteBlogPostSchema = z.object({
  id: z.string().min(1),
});

/**
 * Public server function to retrieve blog posts.
 */
export const getPublicBlogPostsServerFn = createServerFn({ method: "POST" })
  .validator(filterBlogsSchema)
  .handler(async ({ data }) => {
    return BlogCmsService.getBlogPosts(data);
  });

/**
 * Public server function to retrieve a single blog post by slug.
 */
export const getPublicBlogPostBySlugServerFn = createServerFn({ method: "POST" })
  .validator(getBySlugSchema)
  .handler(async ({ data }) => {
    return BlogCmsService.getBlogPostBySlug(data.slug);
  });

/**
 * Superadmin server function to retrieve all blog posts.
 */
export const getAdminBlogPostsListServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(filterBlogsSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BlogCmsService.getBlogPosts(data);
  });

/**
 * Superadmin server function to upsert a blog post.
 */
export const upsertAdminBlogPostServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(upsertBlogPostSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BlogCmsService.upsertBlogPost(
      data as Partial<BlogPostRecord> & { title: string; content: string; description: string },
      context.userId,
      context.userEmail
    );
  });

/**
 * Superadmin server function to delete a blog post.
 */
export const deleteAdminBlogPostServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(deleteBlogPostSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BlogCmsService.deleteBlogPost(data.id, context.userId, context.userEmail);
  });

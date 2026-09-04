import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { IndexingService } from "@/services/indexing.service";

const submitIndexNowSchema = z.object({
  host: z.string().min(1),
  urlList: z.array(z.string().url()).min(1),
  key: z.string().optional(),
  keyLocation: z.string().optional(),
  projectId: z.string().optional(),
});

const fetchSitemapSchema = z.object({
  sitemapUrl: z.string().min(1),
});

export const submitIndexNowBatch = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(submitIndexNowSchema)
  .handler(async ({ data, context }) => {
    return IndexingService.submitIndexNow({
      ...data,
      userId: context.userId,
    });
  });

export const fetchSitemapForIndexing = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(fetchSitemapSchema)
  .handler(async ({ data }) => {
    return IndexingService.fetchSitemapUrls(data.sitemapUrl);
  });

export const getIndexingHistory = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return IndexingService.getUserIndexingHistory(context.userId);
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getWhiteLabelConfig,
  upsertWhiteLabelConfig,
} from "@/services/white-label.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getWhiteLabelConfigServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return getWhiteLabelConfig(context.userId);
  });

const whiteLabelSchema = z.object({
  companyName: z.string().min(1),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().min(4),
  customDomain: z.string().optional().nullable(),
  reportFooterNotes: z.string().optional().nullable(),
});

export const upsertWhiteLabelConfigServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => whiteLabelSchema.parse(d))
  .handler(async ({ data, context }) => {
    return upsertWhiteLabelConfig(context.userId, data);
  });

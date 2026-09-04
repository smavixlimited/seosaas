import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runFreeLeadAudit } from "@/services/lead-audit.service";

const leadAuditSchema = z.object({
  url: z.string().min(3),
  email: z.string().email(),
});

export const runFreeLeadAuditServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => leadAuditSchema.parse(d))
  .handler(async ({ data }) => {
    return runFreeLeadAudit(data.url, data.email);
  });

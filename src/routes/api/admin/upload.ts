import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { isUserSuperAdmin } from "@/services/admin.service";

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // 1. Authenticate user context and superadmin authorization
          const userContext = await resolveUserContextFromHeaders(request.headers);
          if (!userContext.userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const isSuper = await isUserSuperAdmin(userContext.userId);
          if (!isSuper) {
            return new Response(JSON.stringify({ error: "Superadmin privileges required" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 2. Parse multipart/form-data
          const formData = await request.formData();
          const file = formData.get("file") as File | null;
          const folder = (formData.get("folder") as string) || "uploads";

          if (!file || typeof file === "string") {
            return new Response(JSON.stringify({ error: "No file provided" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const cleanFileName = file.name.replace(/[^\w.-]/g, "_");
          const key = `${folder}/${Date.now()}_${cleanFileName}`;
          const arrayBuffer = await file.arrayBuffer();

          // 3. Store in Cloudflare R2 if available, or generate persistent Base64 Data URL for local dev
          let publicUrl = "";

          const r2 = (env as unknown as { R2?: { put: (key: string, data: ArrayBuffer, opts: { httpMetadata: { contentType: string } }) => Promise<unknown> } }).R2;

          if (r2 && typeof r2.put === "function") {
            await r2.put(key, arrayBuffer, {
              httpMetadata: { contentType: file.type || "application/octet-stream" },
            });
            publicUrl = `/api/cdn/${key}`;
          } else {
            // Fallback for local development
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = file.type || "image/png";
            publicUrl = `data:${mimeType};base64,${base64}`;
          }

          return new Response(
            JSON.stringify({
              success: true,
              url: publicUrl,
              filename: cleanFileName,
              size: file.size,
              mimeType: file.type,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: unknown) {
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "File upload failed",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});

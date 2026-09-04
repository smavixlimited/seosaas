import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

interface R2ObjectBody {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata: (headers: Headers) => void;
  httpMetadata?: {
    contentType?: string;
  };
}

interface R2BucketBinding {
  get: (key: string) => Promise<R2ObjectBody | null>;
}

export const Route = createFileRoute("/api/cdn/$")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { _splat?: string } }) => {
        const key = params._splat;
        if (!key) {
          return new Response("Missing asset key", { status: 400 });
        }

        try {
          const r2 = (env as unknown as { R2?: R2BucketBinding }).R2;

          if (r2 && typeof r2.get === "function") {
            const object = await r2.get(key);
            if (!object) {
              return new Response("Asset not found in storage", { status: 404 });
            }

            const headers = new Headers();
            if (typeof object.writeHttpMetadata === "function") {
              object.writeHttpMetadata(headers);
            }

            if (!headers.has("content-type") && object.httpMetadata?.contentType) {
              headers.set("content-type", object.httpMetadata.contentType);
            }

            // If still missing content-type, infer from extension
            if (!headers.has("content-type")) {
              if (key.endsWith(".png")) headers.set("content-type", "image/png");
              else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) headers.set("content-type", "image/jpeg");
              else if (key.endsWith(".svg")) headers.set("content-type", "image/svg+xml");
              else if (key.endsWith(".ico")) headers.set("content-type", "image/x-icon");
              else if (key.endsWith(".webp")) headers.set("content-type", "image/webp");
              else headers.set("content-type", "application/octet-stream");
            }

            headers.set("Cache-Control", "public, max-age=31536000, immutable");
            if (object.httpEtag) {
              headers.set("etag", object.httpEtag);
            }

            return new Response(object.body, {
              status: 200,
              headers,
            });
          }

          return new Response("Storage bucket not available in this environment", { status: 404 });
        } catch (err: unknown) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Error reading asset" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});

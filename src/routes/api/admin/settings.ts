import { createFileRoute } from "@tanstack/react-router";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { isUserSuperAdmin } from "@/services/admin.service";
import { SystemSettingsService } from "@/services/system-settings.service";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const userContext = await resolveUserContextFromHeaders(request.headers);
          if (!userContext.userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const isSuper = await isUserSuperAdmin(userContext.userId);
          if (!isSuper) {
            return new Response(JSON.stringify({ error: "Superadmin access required" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }

          const body = (await request.json()) as {
            key: string;
            value: unknown;
          };

          if (!body.key || body.value === undefined) {
            return new Response(JSON.stringify({ error: "Missing setting key or value" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const saved = await SystemSettingsService.setSetting(
            body.key,
            body.value,
            userContext.userId
          );

          return new Response(
            JSON.stringify({
              success: true,
              key: body.key,
              value: saved,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: unknown) {
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Failed to persist setting",
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

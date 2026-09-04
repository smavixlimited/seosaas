import { createFileRoute } from "@tanstack/react-router";
import type { autumnHandler } from "autumn-js/fetch";
import { env } from "cloudflare:workers";
import { isHostedAuthMode } from "@/lib/auth-mode";
import { resolveHostedContext } from "@/middleware/ensure-user/hosted";

let handlerPromise: Promise<ReturnType<typeof autumnHandler>> | undefined;

// Lazy: keeps autumn-js/fetch out of the eager isolate startup graph;
// resolves instantly after the first request.
function loadHandler() {
  return (handlerPromise ??= import("autumn-js/fetch").then(
    ({ autumnHandler }) =>
      autumnHandler({
        identify: async (request) => {
          const context = await resolveHostedContext(request.headers);

          return {
            customerId: context.organizationId,
          };
        },
      }),
  ));
}

async function handleAutumnRequest(request: Request) {
  let hasKey = false;
  try {
    hasKey = Boolean(env.AUTUMN_SECRET_KEY);
  } catch {
    hasKey = false;
  }

  if (!isHostedAuthMode(env.AUTH_MODE) || !hasKey) {
    return new Response(
      JSON.stringify({
        customer: {
          id: "default_org",
          balances: [],
        },
        features: {},
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }

  try {
    return await (await loadHandler())(request);
  } catch (err) {
    console.warn("Autumn handler error:", err);
    return new Response(
      JSON.stringify({
        customer: { id: "default_org", balances: [] },
        features: {},
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

export const Route = createFileRoute("/api/autumn/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleAutumnRequest(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return handleAutumnRequest(request);
      },
    },
  },
});

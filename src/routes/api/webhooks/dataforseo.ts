import { createFileRoute } from "@tanstack/react-router";
import { DataForSeoAsyncService } from "@/services/dataforseo-async.service";

async function handleDataForSeoPostback(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const tasks = (payload.tasks as Array<Record<string, unknown>>) || [payload];
    for (const task of tasks) {
      await DataForSeoAsyncService.handlePostbackPayload({
        id: task.id as string | undefined,
        status_code: task.status_code as number | undefined,
        status_message: task.status_message as string | undefined,
        result: task.result as Array<Record<string, unknown>> | undefined,
      });
    }

    return new Response(JSON.stringify({ success: true, processed: tasks.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DataForSEO postback error:", err);
    return new Response(JSON.stringify({ error: "Internal processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/webhooks/dataforseo")({
  server: {
    handlers: {
      POST: ({ request }) => handleDataForSeoPostback(request),
      GET: () => Response.json({ status: "ok", endpoint: "dataforseo_postback_receiver" }),
    },
  },
});

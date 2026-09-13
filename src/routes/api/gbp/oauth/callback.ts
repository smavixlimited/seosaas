import { createFileRoute } from "@tanstack/react-router";
import {
  GBP_INTEGRATION,
  handleSelfHostedGoogleOAuthCallbackRequest,
} from "@/server/features/google/selfHostedOAuth";

export const Route = createFileRoute("/api/gbp/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleSelfHostedGoogleOAuthCallbackRequest(
          request,
          GBP_INTEGRATION,
        );
      },
    },
  },
});

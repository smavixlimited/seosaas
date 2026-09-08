import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";
import {
  genericOAuthClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { captureClientEvent, resetAnalyticsUser } from "@/client/lib/posthog";
import { userAdditionalFields } from "@/lib/auth-options";
import { getSignInHrefForLocation } from "@/lib/auth-redirect";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [
    apiKeyClient(),
    organizationClient(),
    genericOAuthClient(),
    inferAdditionalFields({ user: userAdditionalFields }),
  ],
});

export const { useSession } = authClient;

export function signOutAndRedirect(targetHref = "/sign-in") {
  captureClientEvent("auth:sign_out");
  resetAnalyticsUser();

  if (typeof window !== "undefined") {
    try {
      // Cleanly destroy all active browser session and cache state
      sessionStorage.clear();
      localStorage.removeItem("sam_pending_prompt");
      localStorage.removeItem("better-auth.session_data");
      localStorage.removeItem("open_seo_session");
    } catch {
      // Ignore storage errors
    }
  }

  const navigateToCleanSignIn = () => {
    if (typeof window !== "undefined") {
      // Use clean URL without any redirect parameter
      window.location.assign(targetHref);
    }
  };

  void authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        navigateToCleanSignIn();
      },
      onError: () => {
        navigateToCleanSignIn();
      },
    },
  });
}

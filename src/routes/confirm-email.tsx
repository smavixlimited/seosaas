import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import {
  AuthPageCard,
  AuthPageShell,
  authRedirectSearchSchema,
} from "@/client/features/auth/AuthPage";
import { captureClientEvent } from "@/client/lib/posthog";
import { authClient, useSession } from "@/lib/auth-client";
import {
  isEmailVerificationBypassed,
  isHostedClientAuthMode,
} from "@/lib/auth-mode";
import { getSignInSearch, normalizeAuthRedirect } from "@/lib/auth-redirect";
import { z } from "zod";

const confirmEmailSearchSchema = authRedirectSearchSchema.extend({
  email: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/confirm-email")({
  validateSearch: confirmEmailSearchSchema,
  component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const { data: session, isPending } = useSession();
  const bypassEmailVerification = isEmailVerificationBypassed();
  const email = search.email ?? session?.user?.email;
  const isVerified = Boolean(session?.user?.emailVerified);

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // If user becomes verified or verification is bypassed, redirect automatically
  useEffect(() => {
    if (
      isPending ||
      (!isVerified && !(bypassEmailVerification && session?.user?.id))
    ) {
      return;
    }

    if (isVerified) {
      captureClientEvent("auth:verification_success", {
        redirect_to: redirectTo,
      });
    }

    window.location.replace(redirectTo);
  }, [
    bypassEmailVerification,
    isPending,
    isVerified,
    redirectTo,
    session?.user?.id,
  ]);

  async function handleResend() {
    if (!email || countdown > 0) return;
    setIsResending(true);
    try {
      const callbackURL = new URL("/verify-email", window.location.origin);
      if (redirectTo !== "/") {
        callbackURL.searchParams.set("redirect", redirectTo);
      }
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: callbackURL.toString(),
      });
      if (result.error) {
        toast.error(
          result.error.message ||
            "We couldn't send another confirmation email.",
        );
        return;
      }
      captureClientEvent("auth:verification_resend");
      toast.success("A fresh confirmation email is on the way!");
      setCountdown(60); // 60s cooldown
    } catch {
      toast.error(
        "We couldn't send another confirmation email right now. Please try again in a moment.",
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthPageCard
        title="Check Your Inbox"
        helperText="We've sent an activation link to verify your account."
        footer={
          <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70">
            Already verified or using a different email?{" "}
            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="font-bold text-primary dark:text-brand-300 hover:underline"
            >
              Back to sign in &rarr;
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Vector Illustration Badge */}
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15">
            <div className="relative mb-3 flex items-center justify-center size-16 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <Icon
                icon="solar:letter-opened-bold-duotone"
                className="size-8 text-white"
              />
              <div className="absolute -top-1 -right-1 size-5 rounded-full bg-brand-300 flex items-center justify-center border-2 border-white dark:border-secondary">
                <Icon
                  icon="solar:shield-check-bold"
                  className="size-3 text-secondary"
                />
              </div>
            </div>

            <p className="text-tagline-2 font-medium text-secondary/70 dark:text-accent/70">
              Confirmation link delivered to:
            </p>
            <p className="mt-1 text-tagline-1 font-bold text-secondary dark:text-accent break-all">
              {email || "your registered email"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-background-2 dark:bg-secondary/40 border border-stroke-3/50 text-xs text-secondary/80 dark:text-accent/80 space-y-2">
              <div className="flex items-start gap-2">
                <Icon
                  icon="solar:info-circle-bold"
                  className="size-4 text-primary shrink-0 mt-0.5"
                />
                <span>
                  Please click the confirmation link in the email to activate
                  your account and unlock your domain intelligence dashboard.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Icon
                  icon="solar:clock-circle-bold"
                  className="size-4 text-secondary/60 dark:text-accent/60 shrink-0 mt-0.5"
                />
                <span>
                  Haven't received it yet? Be sure to check your spam or
                  promotions folder.
                </span>
              </div>
            </div>

            {isHostedMode && email ? (
              <button
                type="button"
                className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                onClick={() => void handleResend()}
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    <span>Sending email...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Icon
                      icon="solar:history-bold-duotone"
                      className="size-4"
                    />
                    <span>Resend in {countdown}s</span>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="solar:plain-2-bold-duotone"
                      className="size-4"
                    />
                    <span>Resend confirmation email</span>
                  </>
                )}
              </button>
            ) : null}

            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="btn btn-soft w-full h-11 rounded-full text-tagline-2 font-semibold flex items-center justify-center gap-2"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </AuthPageCard>
    </AuthPageShell>
  );
}

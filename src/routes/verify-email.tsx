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

const verificationIssueSchema = z
  .enum(["invalid_token", "token_expired", "user_not_found", "unknown"])
  .catch("unknown");

const verifyEmailSearchSchema = authRedirectSearchSchema.extend({
  error: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: verifyEmailSearchSchema,
  component: VerifyEmailPage,
});

function getVerificationErrorMessage(error: string | undefined) {
  switch ((error ?? "").toLowerCase()) {
    case "invalid_token":
      return "This verification link is no longer valid or has already been used. Please request a new confirmation email.";
    case "token_expired":
      return "This verification link has expired. Please request a fresh confirmation link.";
    case "user_not_found":
      return "We couldn't locate this account. Please create a new account or try signing in.";
    default:
      return error
        ? "We couldn't confirm this email. Please request a new link and try again."
        : null;
  }
}

function VerifyEmailPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const { data: session, isPending } = useSession();
  const bypassEmailVerification = isEmailVerificationBypassed();
  const errorMessage = getVerificationErrorMessage(search.error);
  const verificationIssueType = search.error
    ? verificationIssueSchema.parse(search.error)
    : null;
  const email = search.email ?? session?.user?.email;
  const isVerified = Boolean(session?.user?.emailVerified);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isRedirecting =
    isVerified || (bypassEmailVerification && Boolean(session?.user?.id));

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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

  useEffect(() => {
    if (!verificationIssueType) {
      return;
    }

    captureClientEvent("auth:verification_issue", {
      issue_type: verificationIssueType,
    });
  }, [verificationIssueType]);

  async function handleResend() {
    if (!email || countdown > 0) return;
    setIsResending(true);
    try {
      const callbackURL = new URL("/verify-email", window.location.origin);
      if (redirectTo !== "/")
        callbackURL.searchParams.set("redirect", redirectTo);
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: callbackURL.toString(),
      });
      if (result.error) {
        toast.error(result.error.message || "We couldn't send another verification email.");
        return;
      }
      captureClientEvent("auth:verification_resend");
      toast.success("A fresh confirmation email has been dispatched!");
      setCountdown(60);
    } catch {
      toast.error(
        "We couldn't send another verification email right now. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  }

  const title = !isHostedMode
    ? "Verify Email"
    : errorMessage
      ? "Verification Failed"
      : isRedirecting
        ? "Email Verified!"
        : isPending
          ? "Verifying Email..."
          : "Verify Your Email";

  const helperText = !isHostedMode
    ? "Email confirmation isn't available right now."
    : errorMessage
      ? "There was a problem confirming your email address."
      : isRedirecting
        ? "Taking you straight to your domain intelligence dashboard..."
        : isPending
          ? "Checking your verification credentials."
          : email
            ? `Click the link we sent to ${email} to verify your email.`
            : "Check your inbox for the link to verify your email.";

  return (
    <AuthPageShell>
      <AuthPageCard
        title={title}
        helperText={helperText}
        footer={
          <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70">
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
          {!isHostedMode ? null : errorMessage ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="size-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 mb-3">
                  <Icon icon="solar:danger-triangle-bold" className="size-7" />
                </div>
                <p className="text-tagline-2 text-secondary dark:text-accent font-medium leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              {email ? (
                <button
                  type="button"
                  className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  onClick={() => void handleResend()}
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      <span>Sending link...</span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Icon icon="solar:history-bold-duotone" className="size-4" />
                      <span>Resend in {countdown}s</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:plain-2-bold-duotone" className="size-4" />
                      <span>Request new verification link</span>
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
          ) : isPending || isRedirecting ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon icon="solar:check-circle-bold-duotone" className="size-8" />
              </div>
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15">
                <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
                  <Icon icon="solar:letter-opened-bold-duotone" className="size-7" />
                </div>
                <p className="text-tagline-2 text-secondary/70 dark:text-accent/70">
                  Confirmation sent to:
                </p>
                <p className="mt-1 text-tagline-1 font-bold text-secondary dark:text-accent break-all">
                  {email || "your registered email"}
                </p>
              </div>

              {email ? (
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
                      <Icon icon="solar:history-bold-duotone" className="size-4" />
                      <span>Resend in {countdown}s</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:plain-2-bold-duotone" className="size-4" />
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
          )}
        </div>
      </AuthPageCard>
    </AuthPageShell>
  );
}

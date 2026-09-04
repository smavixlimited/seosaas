import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthPageCard,
  AuthMethodChooser,
  authRedirectSearchSchema,
  useAuthPageState,
} from "@/client/features/auth/AuthPage";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { captureClientEvent } from "@/client/lib/posthog";
import { authClient } from "@/lib/auth-client";
import { getSignInSearch, getVerifyEmailSearch } from "@/lib/auth-redirect";
import { z } from "zod";
import { verify2FALoginServerFn } from "@/serverFunctions/two-factor";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: authRedirectSearchSchema,
  component: SignInPage,
});

function SignInPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { redirectTo, oauthQuery, isHostedMode } = useAuthPageState(
    search.redirect,
  );
  const authCallbackURL = redirectTo;
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  // 2FA Challenge State
  const [show2FAChallenge, setShow2FAChallenge] = useState(false);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaError, setTfaError] = useState<string | null>(null);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_in_submit", {
          redirect_to: redirectTo,
        });

        const result = await authClient.signIn.email({
          email,
          password: value.password,
          callbackURL: authCallbackURL,
          ...(oauthQuery ? { oauth_query: oauthQuery } : {}),
        });

        if (!result.error) {
          captureClientEvent("auth:sign_in_success", {
            redirect_to: redirectTo,
          });
          return;
        }

        // Check if 2FA code is required
        if (result.error.message?.toLowerCase().includes("two factor") || result.error.message?.toLowerCase().includes("2fa")) {
          setPendingUserId(email);
          setShow2FAChallenge(true);
          return;
        }

        if (result.error.status === 403) {
          captureClientEvent("auth:sign_in_block_unverified", {
            redirect_to: redirectTo,
          });
          void navigate({
            to: "/verify-email",
            search: getVerifyEmailSearch(email, redirectTo),
          });
          return;
        }

        formApi.setErrorMap({
          onSubmit: {
            form: result.error.message || "We couldn't sign you in.",
            fields: {},
          },
        });
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Unable to sign in right now. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  async function handleVerify2FASubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tfaCode.trim()) return;

    setIsVerifying2FA(true);
    setTfaError(null);

    try {
      const res = await verify2FALoginServerFn({
        data: {
          userId: pendingUserId,
          code: tfaCode.trim(),
        },
      });

      if (res.isValid) {
        toast.success("Two-Factor Authentication verified!");
        captureClientEvent("auth:2fa_verified", { redirect_to: redirectTo });
        window.location.href = redirectTo || "/projects";
      } else {
        setTfaError("Invalid 6-digit authentication code or backup recovery code.");
      }
    } catch {
      setTfaError("Failed to verify code. Please check and try again.");
    } finally {
      setIsVerifying2FA(false);
    }
  }

  async function handleContinueWithGoogle() {
    setSocialError(null);
    setIsStartingGoogle(true);

    try {
      captureClientEvent("auth:sign_in_google_start", {
        redirect_to: redirectTo,
      });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: authCallbackURL,
      });

      if (result.error) {
        setSocialError(
          result.error.message || "Google sign in is not available right now.",
        );
        setIsStartingGoogle(false);
      }
    } catch {
      setSocialError("Google sign in is not available right now.");
      setIsStartingGoogle(false);
    }
  }

  return (
    <AuthPageCard
      title={show2FAChallenge ? "Two-Factor Verification" : "Sign in to your account"}
      helperText={
        show2FAChallenge
          ? "Enter the 6-digit TOTP code from your authenticator app or an emergency backup code."
          : "Welcome back! Please enter your details or continue with Google."
      }
      footer={
        <div className="pt-2 text-center text-xs text-base-content/70 space-y-2">
          {show2FAChallenge ? (
            <button
              type="button"
              onClick={() => {
                setShow2FAChallenge(false);
                setTfaError(null);
              }}
              className="text-primary font-bold hover:underline"
            >
              &larr; Back to password login
            </button>
          ) : (
            <>
              {showEmailForm && (
                <div>
                  <Link
                    to="/forgot-password"
                    search={getSignInSearch(redirectTo)}
                    className="text-primary font-bold hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
              <div>
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/sign-up"
                  search={getSignInSearch(redirectTo)}
                  className="font-bold text-primary hover:underline"
                >
                  Sign up here &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
      }
    >
      {show2FAChallenge ? (
        <form onSubmit={handleVerify2FASubmit} className="space-y-4">
          <div className="flex justify-center my-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="h-6 w-6" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-base-content/70 mb-1">
              Authentication Code
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-center font-mono text-lg font-bold tracking-widest"
              placeholder="000000"
              value={tfaCode}
              onChange={(e) => setTfaCode(e.target.value)}
              autoFocus
              required
            />
            <p className="mt-1 text-[11px] text-base-content/50 text-center">
              Enter 6-digit app code or 14-char backup code (e.g. skorv-xxxx-xxxx)
            </p>
          </div>

          {tfaError && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">
              {tfaError}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying2FA || !tfaCode.trim()}
            className="btn btn-primary w-full text-white font-bold rounded-xl shadow-md shadow-primary/20"
          >
            {isVerifying2FA ? "Verifying Code..." : "Verify & Continue"}
          </button>
        </form>
      ) : !showEmailForm ? (
        <>
          <AuthMethodChooser
            googleLabel="Continue with Google"
            disabled={!isHostedMode}
            isBusy={isStartingGoogle}
            onContinueWithGoogle={() => {
              void handleContinueWithGoogle();
            }}
            onContinueWithEmail={() => {
              setShowEmailForm(true);
              setSocialError(null);
            }}
          />
          {socialError ? (
            <p className="text-sm text-error">{socialError}</p>
          ) : null}
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="Email address..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="email"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Password..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="current-password"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              submitError: state.errorMap.onSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ submitError, isSubmitting }) => {
              const errorMessage = getFormError(submitError);
              return (
                <>
                  {errorMessage ? (
                    <p className="text-sm text-error">{errorMessage}</p>
                  ) : null}
                  <button
                    className="btn btn-soft w-full"
                    disabled={!isHostedMode || isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </>
              );
            }}
          </form.Subscribe>
        </form>
      )}
    </AuthPageCard>
  );
}

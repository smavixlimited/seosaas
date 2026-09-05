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
  rememberMe: z.boolean(),
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
  const targetRedirect =
    !redirectTo || redirectTo === "/" ? "/my-brands" : redirectTo;
  const authCallbackURL = targetRedirect;
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
      rememberMe: true,
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_in_submit", {
          redirect_to: targetRedirect,
        });

        const result = await authClient.signIn.email({
          email,
          password: value.password,
          callbackURL: authCallbackURL,
          rememberMe: value.rememberMe,
          ...(oauthQuery ? { oauth_query: oauthQuery } : {}),
        });

        if (!result.error) {
          captureClientEvent("auth:sign_in_success", {
            redirect_to: targetRedirect,
          });
          window.location.replace(targetRedirect);
          return;
        }

        // Check if 2FA code is required
        if (result.error.message?.toLowerCase().includes("two factor") || result.error.message?.toLowerCase().includes("2fa")) {
          setPendingUserId(email);
          setShow2FAChallenge(true);
          return;
        }

        const errorMsg = result.error.message?.toLowerCase() || "";
        if (
          result.error.status === 403 ||
          errorMsg.includes("email not verified") ||
          errorMsg.includes("verify your email") ||
          errorMsg.includes("confirm your email") ||
          errorMsg.includes("unverified")
        ) {
          captureClientEvent("auth:sign_in_block_unverified", {
            redirect_to: targetRedirect,
          });
          void navigate({
            to: "/confirm-email",
            search: getVerifyEmailSearch(email, targetRedirect),
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
        captureClientEvent("auth:2fa_verified", { redirect_to: targetRedirect });
        window.location.replace(targetRedirect);
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
          ? "Enter the 6-digit TOTP code from your authenticator app or backup recovery code."
          : "Welcome back! Enter your login details to access your search intelligence workspace."
      }
      footer={
        <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70 space-y-2">
          {show2FAChallenge ? (
            <button
              type="button"
              onClick={() => {
                setShow2FAChallenge(false);
                setTfaError(null);
              }}
              className="text-primary dark:text-brand-300 font-bold hover:underline"
            >
              &larr; Back to password sign in
            </button>
          ) : (
            <div>
              Not registered yet?{" "}
              <Link
                to="/sign-up"
                search={getSignInSearch(redirectTo)}
                className="font-bold text-primary dark:text-brand-300 hover:underline"
              >
                Create an Account &rarr;
              </Link>
            </div>
          )}
        </div>
      }
    >
      {show2FAChallenge ? (
        <form onSubmit={handleVerify2FASubmit} className="space-y-4">
          <div className="flex justify-center my-2">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary dark:text-brand-300 flex items-center justify-center">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="size-6" />
            </div>
          </div>

          <fieldset className="space-y-2">
            <label className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none text-center">
              Authentication Code
            </label>
            <input
              type="text"
              className="auth-form-input text-center font-mono text-lg font-bold tracking-widest"
              placeholder="000000"
              value={tfaCode}
              onChange={(e) => setTfaCode(e.target.value)}
              autoFocus
              required
            />
            <p className="text-[11px] text-secondary/50 dark:text-accent/50 text-center">
              Enter 6-digit TOTP code or backup recovery code
            </p>
          </fieldset>

          {tfaError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {tfaError}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying2FA || !tfaCode.trim()}
            className="btn btn-md btn-primary hover:btn-secondary dark:hover:btn-accent w-full"
          >
            {isVerifying2FA ? "Verifying Code..." : "Verify & Continue"}
          </button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          {/* Email Field */}
          <form.Field name="email">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <fieldset className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                  >
                    Your email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="auth-form-input"
                    placeholder="name@company.com"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="email"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="text-xs text-rose-500">{error}</p>
                  ) : null}
                </fieldset>
              );
            }}
          </form.Field>

          {/* Password Field */}
          <form.Field name="password">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <fieldset className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="auth-form-input"
                    placeholder="At least 8 characters"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="current-password"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="text-xs text-rose-500">{error}</p>
                  ) : null}
                </fieldset>
              );
            }}
          </form.Field>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <form.Field name="rememberMe">
              {(field) => (
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 rounded-full border-stroke-3 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span className="text-tagline-3 text-secondary/70 dark:text-accent/70 select-none">
                    Remember me
                  </span>
                </label>
              )}
            </form.Field>

            <Link
              to="/forgot-password"
              search={getSignInSearch(redirectTo)}
              className="text-tagline-3 text-primary dark:text-brand-300 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

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
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                      {errorMessage}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    className="btn btn-md btn-primary hover:btn-secondary dark:hover:btn-accent w-full mt-2"
                    disabled={!isHostedMode || isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Log In"}
                  </button>
                </>
              );
            }}
          </form.Subscribe>

          {/* Social Auth */}
          <AuthMethodChooser
            googleLabel="Continue with Google"
            disabled={!isHostedMode}
            isBusy={isStartingGoogle}
            onContinueWithGoogle={() => {
              void handleContinueWithGoogle();
            }}
          />
          {socialError ? (
            <p className="text-xs text-rose-500 text-center">{socialError}</p>
          ) : null}
        </form>
      )}
    </AuthPageCard>
  );
}


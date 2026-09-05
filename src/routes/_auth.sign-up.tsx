import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lock } from "lucide-react";
import {
  AuthPageCard,
  AuthMethodChooser,
  authRedirectSearchSchema,
  useAuthPageState,
} from "@/client/features/auth/AuthPage";
import {
  TURNSTILE_SITE_KEY,
  TurnstileWidget,
  useTurnstileCaptcha,
} from "@/client/features/auth/TurnstileWidget";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { captureClientEvent } from "@/client/lib/posthog";
import { authClient } from "@/lib/auth-client";
import { getSignInSearch, getVerifyEmailSearch } from "@/lib/auth-redirect";
import {
  HOSTED_PASSWORD_MAX_LENGTH,
  HOSTED_PASSWORD_MIN_LENGTH,
} from "@/lib/auth-options";
import { getRegistrationStatus } from "@/serverFunctions/system-settings";
import { z } from "zod";

const signUpSchema = z
  .object({
    name: z.string().trim(),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(
        HOSTED_PASSWORD_MIN_LENGTH,
        `Password must be at least ${HOSTED_PASSWORD_MIN_LENGTH} characters.`,
      )
      .max(
        HOSTED_PASSWORD_MAX_LENGTH,
        `Password must be at most ${HOSTED_PASSWORD_MAX_LENGTH} characters.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/_auth/sign-up")({
  validateSearch: authRedirectSearchSchema,
  component: SignUpPage,
});

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "Empty", color: "bg-stroke-3" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 25, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 75, label: "Good", color: "bg-primary" };
  return { score: 100, label: "Strong", color: "bg-emerald-500" };
}

function SignUpPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { redirectTo, isHostedMode } = useAuthPageState(search.redirect);
  const postSignupRedirect = redirectTo === "/" ? "/onboarding" : redirectTo;
  const [passwordInput, setPasswordInput] = useState("");
  const google = useGoogleSignUp({ redirectTo, postSignupRedirect });

  const registrationQuery = useQuery({
    queryKey: ["publicRegistrationStatus"],
    queryFn: () => getRegistrationStatus(),
  });

  const isTurnstileEnabled = isHostedMode && Boolean(TURNSTILE_SITE_KEY);
  const captcha = useTurnstileCaptcha();

  const strength = calculatePasswordStrength(passwordInput);

  if (registrationQuery.data && registrationQuery.data.enabled === false) {
    return (
      <AuthPageCard
        title="Registrations Closed"
        helperText="New account sign-ups are temporarily closed."
        footer={
          <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="font-bold text-primary dark:text-brand-300 hover:underline"
            >
              Sign in here &rarr;
            </Link>
          </div>
        }
      >
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
          <div className="mx-auto size-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <Lock className="size-6" />
          </div>
          <h3 className="text-tagline-1 font-bold text-secondary dark:text-accent">Sign-ups are by Invitation Only</h3>
          <p className="text-tagline-2 text-secondary/70 dark:text-accent/70 leading-relaxed">
            Public registration is currently locked. If you are an enterprise client or hold an invitation token, please reach out to our team.
          </p>
          <div className="pt-2">
            <a
              href="mailto:support@skorvia.com"
              className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-xs"
            >
              Contact Support
            </a>
          </div>
        </div>
      </AuthPageCard>
    );
  }

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      const captchaToken = captcha.tokenRef.current;
      if (isTurnstileEnabled && !captchaToken) {
        formApi.setErrorMap({
          onSubmit: {
            form: "Please complete the security captcha to continue.",
            fields: {},
          },
        });
        return;
      }
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_up_submit", {
          redirect_to: redirectTo,
        });
        const resolvedName =
          value.name.trim() || email.split("@")[0] || "Skorvia User";
        const verificationCallbackURL = new URL(
          "/confirm-email",
          window.location.origin,
        );
        const verificationSearch = getVerifyEmailSearch(
          undefined,
          postSignupRedirect,
        );
        if (verificationSearch.redirect) {
          verificationCallbackURL.searchParams.set(
            "redirect",
            verificationSearch.redirect,
          );
        }
        const result = await authClient.signUp.email({
          name: resolvedName,
          email,
          password: value.password,
          callbackURL: verificationCallbackURL.toString(),
          ...(isTurnstileEnabled && captchaToken
            ? {
                fetchOptions: {
                  headers: { "x-captcha-response": captchaToken },
                },
              }
            : {}),
        });

        if (result.error) {
          if (isTurnstileEnabled) captcha.reset();
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message || "Unable to create account.",
              fields: {},
            },
          });
          return;
        }

        captureClientEvent("auth:sign_up_success", {
          redirect_to: redirectTo,
        });
        void navigate({
          to: "/confirm-email",
          search: getVerifyEmailSearch(email, postSignupRedirect),
          replace: true,
        });
      } catch {
        if (isTurnstileEnabled) captcha.reset();
        formApi.setErrorMap({
          onSubmit: {
            form: "Unable to create account right now. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  return (
    <AuthPageCard
      title="Create your account"
      helperText="Start your 14-day free trial. Dominate SEO rankings, competitor ads & AI search."
      footer={
        <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70 space-y-2">
          <div>
            Already have an account?{" "}
            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="font-bold text-primary dark:text-brand-300 hover:underline"
            >
              Sign in here &rarr;
            </Link>
          </div>
          <p className="text-tagline-3 text-secondary/50 dark:text-accent/50 pt-1">
            By signing up, you agree to our{" "}
            <Link
              to="/terms"
              className="text-secondary/70 dark:text-accent/70 underline hover:text-primary"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-secondary/70 dark:text-accent/70 underline hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);

            return (
              <fieldset className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  className="auth-form-input"
                  placeholder="e.g. Alex Morgan"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoComplete="name"
                  disabled={!isHostedMode}
                />
                {error ? (
                  <p className="text-xs text-rose-500">{error}</p>
                ) : null}
              </fieldset>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);

            return (
              <fieldset className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                >
                  Work email
                </label>
                <input
                  id="signup-email"
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

        <form.Field name="password">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);

            return (
              <fieldset className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className="auth-form-input"
                  placeholder="At least 8 characters"
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    setPasswordInput(event.target.value);
                  }}
                  autoComplete="new-password"
                  disabled={!isHostedMode}
                  required
                  minLength={HOSTED_PASSWORD_MIN_LENGTH}
                  maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                />
                {passwordInput && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-secondary/60 dark:text-accent/60">
                      <span>Strength: {strength.label}</span>
                      <span>{strength.score}%</span>
                    </div>
                    <div className="w-full bg-stroke-3 dark:bg-stroke-7 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
                {error ? (
                  <p className="text-xs text-rose-500">{error}</p>
                ) : null}
              </fieldset>
            );
          }}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);

            return (
              <fieldset className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-tagline-2 text-secondary dark:text-accent block font-medium select-none"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="auth-form-input"
                  placeholder="Re-enter your password"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoComplete="new-password"
                  disabled={!isHostedMode}
                  required
                  minLength={HOSTED_PASSWORD_MIN_LENGTH}
                  maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                />
                {error ? (
                  <p className="text-xs text-rose-500">{error}</p>
                ) : null}
              </fieldset>
            );
          }}
        </form.Field>

        {isTurnstileEnabled ? (
          <TurnstileWidget
            onToken={captcha.onToken}
            resetNonce={captcha.resetNonce}
          />
        ) : null}

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
                  disabled={
                    !isHostedMode ||
                    isSubmitting ||
                    (isTurnstileEnabled && !captcha.hasToken)
                  }
                >
                  {isSubmitting ? "Creating account..." : "Sign Up Free"}
                </button>
              </>
            );
          }}
        </form.Subscribe>

        <AuthMethodChooser
          googleLabel="Sign up with Google"
          disabled={!isHostedMode}
          isBusy={google.isStarting}
          onContinueWithGoogle={() => {
            void google.start();
          }}
        />
        {google.error ? (
          <p className="text-xs text-rose-500 text-center">{google.error}</p>
        ) : null}
      </form>
    </AuthPageCard>
  );
}

function useGoogleSignUp({
  redirectTo,
  postSignupRedirect,
}: {
  redirectTo: string;
  postSignupRedirect: string;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    setIsStarting(true);

    try {
      captureClientEvent("auth:sign_up_google_start", {
        redirect_to: redirectTo,
      });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
        newUserCallbackURL: postSignupRedirect,
        requestSignUp: true,
      });

      if (result.error) {
        setError(
          result.error.message || "Google sign up is not available right now.",
        );
        setIsStarting(false);
      }
    } catch {
      setError("Google sign up is not available right now.");
      setIsStarting(false);
    }
  };

  return {
    isStarting,
    error,
    start,
    clearError: () => setError(null),
  };
}

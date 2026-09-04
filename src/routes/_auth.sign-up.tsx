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

function SignUpPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { redirectTo, isHostedMode } = useAuthPageState(search.redirect);
  const postSignupRedirect = redirectTo === "/" ? "/onboarding" : redirectTo;
  const [showEmailForm, setShowEmailForm] = useState(true);
  const google = useGoogleSignUp({ redirectTo, postSignupRedirect });

  const registrationQuery = useQuery({
    queryKey: ["publicRegistrationStatus"],
    queryFn: () => getRegistrationStatus(),
  });

  // Turnstile is active only in hosted mode with a configured site key.
  const isTurnstileEnabled = isHostedMode && Boolean(TURNSTILE_SITE_KEY);
  const captcha = useTurnstileCaptcha();

  // If public registration has been locked by admin, show closed message
  if (registrationQuery.data && registrationQuery.data.enabled === false) {
    return (
      <AuthPageCard
        title="Registrations Closed"
        helperText="New account sign-ups are temporarily closed."
        footer={
          <div className="pt-2 text-center text-xs text-base-content/70">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="font-bold text-primary hover:underline"
            >
              Sign in here &rarr;
            </Link>
          </div>
        }
      >
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-base-content">Sign-ups are by Invitation Only</h3>
          <p className="text-xs text-base-content/70 leading-relaxed">
            Public registration is currently locked. If you are an enterprise client or hold an invitation token, please reach out to our team.
          </p>
          <div className="pt-2">
            <a
              href="mailto:support@skorvia.com"
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-sm"
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
            form: "Please complete the captcha to continue.",
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
          "/verify-email",
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
          // Turnstile tokens are single-use; re-challenge so a retry can succeed.
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
          to: "/verify-email",
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
      helperText="Get started with next-gen SEO intelligence and AI ranking analytics."
      footer={
        <div className="pt-2 text-center text-xs text-base-content/70 space-y-2">
          {showEmailForm && (
            <div>
              <button
                type="button"
                className="text-xs font-semibold text-base-content/60 hover:text-base-content hover:underline"
                onClick={() => {
                  setShowEmailForm(false);
                  google.clearError();
                }}
              >
                &larr; Choose another method
              </button>
            </div>
          )}
          <div>
            Already have an account?{" "}
            <Link
              to="/sign-in"
              search={getSignInSearch(redirectTo)}
              className="font-bold text-primary hover:underline"
            >
              Sign in here &rarr;
            </Link>
          </div>
          <p className="text-[11px] text-base-content/50">
            By signing up, you agree to our{" "}
            <a
              href="https://skorvia.com/terms"
              target="_blank"
              rel="noreferrer"
              className="text-base-content/70 underline hover:text-base-content"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://skorvia.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-base-content/70 underline hover:text-base-content"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      }
    >
      {!showEmailForm ? (
        <>
          <AuthMethodChooser
            googleLabel="Continue with Google"
            disabled={!isHostedMode}
            isBusy={google.isStarting}
            onContinueWithGoogle={() => {
              void google.start();
            }}
            onContinueWithEmail={() => {
              setShowEmailForm(true);
              google.clearError();
            }}
          />
          {google.error ? (
            <p className="text-sm text-error">{google.error}</p>
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
          <form.Field name="name">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Name (optional)..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="name"
                    disabled={!isHostedMode}
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

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
                    autoComplete="new-password"
                    disabled={!isHostedMode}
                    required
                    minLength={HOSTED_PASSWORD_MIN_LENGTH}
                    maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Confirm password..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="new-password"
                    disabled={!isHostedMode}
                    required
                    minLength={HOSTED_PASSWORD_MIN_LENGTH}
                    maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
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
                    <p className="text-sm text-error">{errorMessage}</p>
                  ) : null}
                  <button
                    className="btn btn-soft w-full"
                    disabled={
                      !isHostedMode ||
                      isSubmitting ||
                      (isTurnstileEnabled && !captcha.hasToken)
                    }
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
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

// Google sign-up: kicks off the social OAuth redirect and surfaces its error.
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

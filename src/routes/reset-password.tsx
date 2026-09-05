import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthPageCard,
  AuthPageShell,
  authRedirectSearchSchema,
} from "@/client/features/auth/AuthPage";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { authClient } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getSignInSearch, normalizeAuthRedirect } from "@/lib/auth-redirect";
import {
  HOSTED_PASSWORD_MAX_LENGTH,
  HOSTED_PASSWORD_MIN_LENGTH,
} from "@/lib/auth-options";
import { z } from "zod";
import { Icon } from "@iconify/react";

const resetPasswordSchema = z
  .object({
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

const resetPasswordSearchSchema = authRedirectSearchSchema.extend({
  error: z.string().optional(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
});

function getResetPasswordErrorMessage(error: string | undefined) {
  switch ((error ?? "").toLowerCase()) {
    case "invalid_token":
      return "This reset link is no longer valid or has already been used. Please request a new one.";
    case "token_expired":
      return "This reset link has expired. Please request a fresh reset link.";
    default:
      return error
        ? "This reset link cannot be used anymore. Please request a new one."
        : null;
  }
}

function calculatePasswordStrength(pass: string) {
  if (!pass) return { score: 0, label: "None", color: "bg-stroke-3" };
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

function ResetPasswordPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const routeError = getResetPasswordErrorMessage(search.error);
  const token = typeof search.token === "string" ? search.token : null;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const strength = calculatePasswordStrength(passwordInput);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (!token) {
        formApi.setErrorMap({
          onSubmit: {
            form: "This reset link is no longer valid. Request a new one and try again.",
            fields: {},
          },
        });
        return;
      }

      try {
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token,
        });

        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message || "This reset link is no longer valid. Request a new one and try again.",
              fields: {},
            },
          });
          return;
        }
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "We couldn't update your password right now. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  return (
    <AuthPageShell>
      <form.Subscribe
        selector={(state) => ({
          isComplete: state.isSubmitSuccessful && !state.errorMap.onSubmit,
          submitError: state.errorMap.onSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ isComplete, submitError, isSubmitting }) => {
          const errorMessage = getFormError(submitError);

          const title = !isHostedMode
            ? "Reset Password"
            : isComplete
              ? "Password Updated!"
              : routeError || !token
                ? "Reset Link Expired"
                : "Create New Password";

          const helperText = !isHostedMode
            ? "Password reset isn't available right now."
            : isComplete
              ? "Your password has been successfully updated. You can now sign in."
              : routeError || !token
                ? routeError || "This password reset link is invalid or has expired."
                : "Choose a secure, strong password for your Skorvia account.";

          return (
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
              {!isHostedMode ? null : isComplete ? (
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
                      <Icon icon="solar:shield-check-bold-duotone" className="size-8" />
                    </div>
                    <p className="text-tagline-1 font-bold text-secondary dark:text-accent">
                      Security Credentials Refreshed
                    </p>
                    <p className="mt-2 text-xs text-secondary/70 dark:text-accent/70">
                      Your new password is now active. Use it on your next login.
                    </p>
                  </div>

                  <a
                    href={
                      redirectTo === "/"
                        ? "/sign-in"
                        : `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
                    }
                    className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span>Sign In With New Password</span>
                    <Icon icon="solar:arrow-right-linear" className="size-4" />
                  </a>
                </div>
              ) : routeError || !token ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <div className="size-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 mb-3">
                      <Icon icon="solar:history-bold-duotone" className="size-8" />
                    </div>
                    <p className="text-tagline-2 text-secondary dark:text-accent font-medium">
                      {routeError || "This link is no longer valid."}
                    </p>
                  </div>

                  <Link
                    to="/forgot-password"
                    search={getSignInSearch(redirectTo)}
                    className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span>Request New Reset Link</span>
                  </Link>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                  }}
                >
                  <form.Field name="password">
                    {(field) => {
                      const error = getFieldError(field.state.meta.errors);

                      return (
                        <div className="space-y-1.5">
                          <label className="text-tagline-3 font-semibold text-secondary/80 dark:text-accent/80 block">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="auth-form-input w-full pl-11 pr-11"
                              placeholder="••••••••••••"
                              value={field.state.value}
                              onChange={(event) => {
                                field.handleChange(event.target.value);
                                setPasswordInput(event.target.value);
                              }}
                              autoComplete="new-password"
                              minLength={HOSTED_PASSWORD_MIN_LENGTH}
                              maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                              required
                            />
                            <Icon
                              icon="solar:lock-password-linear"
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-secondary/40 dark:text-accent/40 pointer-events-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary dark:text-accent/50 dark:hover:text-accent transition-colors"
                            >
                              <Icon
                                icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                                className="size-5"
                              />
                            </button>
                          </div>

                          {passwordInput.length > 0 ? (
                            <div className="pt-1.5 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-secondary/70 dark:text-accent/70">
                                <span>Strength</span>
                                <span className={strength.score >= 75 ? "text-emerald-500 font-bold" : ""}>
                                  {strength.label}
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-stroke-3/50 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${strength.color}`}
                                  style={{ width: `${strength.score}%` }}
                                />
                              </div>
                            </div>
                          ) : null}

                          {error ? (
                            <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
                          ) : null}
                        </div>
                      );
                    }}
                  </form.Field>

                  <form.Field name="confirmPassword">
                    {(field) => {
                      const error = getFieldError(field.state.meta.errors);

                      return (
                        <div className="space-y-1.5">
                          <label className="text-tagline-3 font-semibold text-secondary/80 dark:text-accent/80 block">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="auth-form-input w-full pl-11 pr-11"
                              placeholder="••••••••••••"
                              value={field.state.value}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              autoComplete="new-password"
                              minLength={HOSTED_PASSWORD_MIN_LENGTH}
                              maxLength={HOSTED_PASSWORD_MAX_LENGTH}
                              required
                            />
                            <Icon
                              icon="solar:lock-check-linear"
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-secondary/40 dark:text-accent/40 pointer-events-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary dark:text-accent/50 dark:hover:text-accent transition-colors"
                            >
                              <Icon
                                icon={showConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                                className="size-5"
                              />
                            </button>
                          </div>
                          {error ? (
                            <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
                          ) : null}
                        </div>
                      );
                    }}
                  </form.Field>

                  {errorMessage ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                      {errorMessage}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:check-square-bold-duotone" className="size-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </AuthPageCard>
          );
        }}
      </form.Subscribe>
    </AuthPageShell>
  );
}

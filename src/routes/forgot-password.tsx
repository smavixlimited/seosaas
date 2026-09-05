import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AuthPageCard,
  AuthPageShell,
  authRedirectSearchSchema,
} from "@/client/features/auth/AuthPage";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { authClient } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getSignInSearch, normalizeAuthRedirect } from "@/lib/auth-redirect";
import { z } from "zod";
import { Icon } from "@iconify/react";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const Route = createFileRoute("/forgot-password")({
  validateSearch: authRedirectSearchSchema,
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        const redirectUrl = new URL("/reset-password", window.location.origin);
        if (redirectTo !== "/")
          redirectUrl.searchParams.set("redirect", redirectTo);
        const result = await authClient.requestPasswordReset({
          email: value.email.trim(),
          redirectTo: redirectUrl.toString(),
        });

        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message || "We couldn't send the reset email.",
              fields: {},
            },
          });
          return;
        }
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "We couldn't send the reset email right now. Please try again.",
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
          isSuccess: state.isSubmitSuccessful && !state.errorMap.onSubmit,
          submittedEmail: state.values.email,
          submitError: state.errorMap.onSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ isSuccess, submittedEmail, submitError, isSubmitting }) => {
          const errorMessage = getFormError(submitError);

          return (
            <AuthPageCard
              title={isSuccess ? "Reset Link Dispatched" : "Reset Password"}
              helperText={
                isSuccess
                  ? `If an account exists for ${submittedEmail}, we sent password recovery instructions.`
                  : isHostedMode
                    ? "Enter your account email to receive a secure password recovery link."
                    : "Password reset isn't available right now."
              }
              footer={
                <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70">
                  Remember your password?{" "}
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
              {isSuccess ? (
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
                      <Icon
                        icon="solar:letter-check-bold-duotone"
                        className="size-8"
                      />
                    </div>
                    <p className="text-tagline-2 font-medium text-secondary dark:text-accent">
                      Check your inbox at:
                    </p>
                    <p className="mt-1 text-tagline-1 font-bold text-secondary dark:text-accent break-all">
                      {submittedEmail}
                    </p>
                    <p className="mt-3 text-xs text-secondary/70 dark:text-accent/70 leading-relaxed">
                      Click the link inside to set a new password. The link will
                      expire in 1 hour.
                    </p>
                  </div>

                  <Link
                    to="/sign-in"
                    search={getSignInSearch(redirectTo)}
                    className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:arrow-left-linear" className="size-4" />
                    <span>Return to Sign In</span>
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
                  <form.Field name="email">
                    {(field) => {
                      const error = getFieldError(field.state.meta.errors);

                      return (
                        <div className="space-y-1.5">
                          <label className="text-tagline-3 font-semibold text-secondary/80 dark:text-accent/80 block">
                            Account Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              className="auth-form-input w-full pl-11 pr-4"
                              placeholder="name@company.com"
                              value={field.state.value}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              autoComplete="email"
                              disabled={!isHostedMode}
                              required
                            />
                            <Icon
                              icon="solar:letter-linear"
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-secondary/40 dark:text-accent/40 pointer-events-none"
                            />
                          </div>
                          {error ? (
                            <p className="mt-1 text-xs text-rose-500 font-medium">
                              {error}
                            </p>
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
                    disabled={!isHostedMode || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="solar:plain-2-bold-duotone"
                          className="size-4"
                        />
                        <span>Send Reset Instructions</span>
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

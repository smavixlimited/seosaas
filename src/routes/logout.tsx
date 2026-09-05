import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { AuthPageCard, AuthPageShell } from "@/client/features/auth/AuthPage";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  return (
    <AuthPageShell>
      <AuthPageCard
        title="Signed Out"
        helperText="You have securely signed out of your Skorvia workspace."
        footer={
          <div className="pt-2 text-center text-tagline-2 text-secondary/70 dark:text-accent/70">
            Want to switch accounts?{" "}
            <Link
              to="/sign-in"
              className="font-bold text-primary dark:text-brand-300 hover:underline"
            >
              Sign in here &rarr;
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15">
            <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="size-8" />
            </div>
            <h4 className="text-tagline-1 font-bold text-secondary dark:text-accent">
              Session Terminated
            </h4>
            <p className="mt-1 text-xs text-secondary/70 dark:text-accent/70 max-w-xs">
              All active security tokens and cookies have been safely cleared from this browser session.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/sign-in"
              className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Icon icon="solar:login-2-bold-duotone" className="size-4" />
              <span>Sign In Again</span>
            </Link>

            <Link
              to="/"
              className="btn btn-soft w-full h-11 rounded-full text-tagline-2 font-semibold flex items-center justify-center gap-2"
            >
              <Icon icon="solar:home-2-linear" className="size-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </AuthPageCard>
    </AuthPageShell>
  );
}

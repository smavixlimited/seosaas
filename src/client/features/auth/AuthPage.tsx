import * as React from "react";
import { z } from "zod";
import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import {
  getCurrentAuthRedirect,
  getOAuthSignedQuery,
} from "@/lib/auth-redirect";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { BRAND_CONFIG } from "@/config/brand";

export const authRedirectSearchSchema = z.object({
  redirect: z.string().optional(),
});

export function useAuthPageState(redirect: string | undefined) {
  const redirectTo = getCurrentAuthRedirect(redirect);
  const oauthQuery =
    typeof window !== "undefined"
      ? getOAuthSignedQuery(window.location.search)
      : null;
  const isHostedMode = isHostedClientAuthMode();

  return {
    redirectTo,
    oauthQuery,
    isHostedMode,
  };
}

export function AuthMethodChooser({
  googleLabel,
  isBusy,
  disabled,
  onContinueWithGoogle,
  onContinueWithEmail,
}: {
  googleLabel: string;
  isBusy?: boolean;
  disabled?: boolean;
  onContinueWithGoogle: () => void;
  onContinueWithEmail?: () => void;
}) {
  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center my-4">
        <div className="h-[1px] flex-1 bg-stroke-3 dark:bg-stroke-7" />
        <span className="px-3 text-tagline-3 text-secondary/50 dark:text-accent/50 uppercase tracking-wider font-semibold">
          Or continue with
        </span>
        <div className="h-[1px] flex-1 bg-stroke-3 dark:bg-stroke-7" />
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          className="btn-social-auth"
          onClick={onContinueWithGoogle}
          disabled={disabled || isBusy}
        >
          <GoogleLogo />
          <span>{googleLabel || "Continue with Google"}</span>
        </button>

        <button
          type="button"
          className="btn-social-auth"
          onClick={onContinueWithGoogle}
          disabled={disabled || isBusy}
        >
          <Icon icon="solar:apple-bold" className="size-5" />
          <span>Continue with Apple</span>
        </button>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="size-4 shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.94v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.96H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.04l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .94 4.96L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function AuthPageCard({
  title,
  helperText,
  children,
  footer,
}: {
  title: string;
  helperText?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[420px] mx-auto space-y-4">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-2">
        <Link to="/" className="inline-flex items-center gap-2.5 mx-auto">
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="size-8 rounded-full object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-secondary dark:text-accent font-interTight">
            {BRAND_CONFIG.name}
          </span>
        </Link>
        <h1 className="text-heading-5 font-bold text-secondary dark:text-accent pt-1">
          {title}
        </h1>
        {helperText ? (
          <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 max-w-sm mx-auto">
            {helperText}
          </p>
        ) : null}
      </div>

      {/* Main NextSaaS Auth Card */}
      <div className="rounded-[24px] border border-stroke-3/60 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 sm:p-9 shadow-xl space-y-4">
        {children}
      </div>

      {footer ? (
        <div className="text-tagline-2 text-center text-secondary/70 dark:text-accent/70 pt-2">
          {footer}
        </div>
      ) : null}

      {/* Legal Footer Links */}
      <div className="pt-4 text-center">
        <div className="flex items-center justify-center gap-4 text-tagline-3 text-secondary/50 dark:text-accent/50">
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms &amp; Conditions
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background-2 dark:bg-background-5 flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 dark:bg-brand-300/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-ns-green/5 blur-3xl pointer-events-none" />

      <div className="w-full relative z-10">{children}</div>
    </div>
  );
}

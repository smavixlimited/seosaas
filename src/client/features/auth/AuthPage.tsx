import * as React from "react";
import { z } from "zod";
import { Icon } from "@iconify/react";
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
  emailLabel = "Continue with email",
  isBusy,
  disabled,
  onContinueWithGoogle,
  onContinueWithEmail,
}: {
  googleLabel: string;
  emailLabel?: string;
  isBusy?: boolean;
  disabled?: boolean;
  onContinueWithGoogle: () => void;
  onContinueWithEmail: () => void;
}) {
  return (
    <div className="space-y-3 w-full">
      <button
        type="button"
        className="btn btn-outline w-full rounded-2xl h-11 border-base-300 bg-base-100 font-bold text-xs hover:bg-base-200 hover:text-base-content gap-2.5 shadow-xs"
        onClick={onContinueWithGoogle}
        disabled={disabled || isBusy}
      >
        <GoogleLogo />
        {isBusy ? "Opening Google..." : googleLabel}
      </button>

      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-base-300 w-full" />
        <span className="bg-base-100 px-3 text-[10px] uppercase font-bold text-base-content/40 tracking-wider">
          Or with email
        </span>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full rounded-2xl h-11 font-bold text-xs text-white shadow-md shadow-primary/20"
        onClick={onContinueWithEmail}
        disabled={disabled || isBusy}
      >
        {emailLabel}
      </button>
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
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="size-8 rounded-xl object-contain shadow-xs ring-1 ring-primary/20"
          />
          <span className="text-xl font-black tracking-tight text-base-content">
            {BRAND_CONFIG.name}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content">{title}</h1>
          {helperText ? (
            <p className="text-xs text-base-content/60 mt-1">{helperText}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      {footer ? <div className="text-xs text-center text-base-content/60">{footer}</div> : null}
    </div>
  );
}

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-base-100 flex items-center justify-center p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full max-w-5xl rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden min-h-[640px]">
        {/* Left Column: Venix Hero Showcase (Visible on Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md text-xs font-bold">
              <Icon icon="solar:stars-bold-duotone" className="h-4 w-4 text-amber-300" />
              <span>Next-Gen SEO Intelligence</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-snug">
              Rank higher on Google & AI Answer Engines.
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Real-time SERP tracking, backlink discovery, automated site audits, and Claude/ChatGPT AI visibility.
            </p>
          </div>

          <div className="relative z-10 py-6 flex justify-center">
            <img
              src="/auth-illustrations/login_first.svg"
              alt="Skorvia Auth"
              className="max-h-48 object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="relative z-10 rounded-2xl bg-white/10 p-4 backdrop-blur-md space-y-2 border border-white/10">
            <div className="flex items-center gap-1 text-amber-300">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} icon="solar:star-bold" className="h-3.5 w-3.5" />
              ))}
            </div>
            <p className="text-xs italic text-white/90 leading-relaxed">
              &quot;Skorvia replaced 4 different tools for our agency. The DataForSEO speed and white-label reports are unmatched.&quot;
            </p>
            <div className="text-[11px] font-bold text-white/70">
              — Sarah Jenkins, VP of Organic Growth
            </div>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

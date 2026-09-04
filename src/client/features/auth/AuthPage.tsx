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
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-base-300 w-full" />
        <span className="bg-base-100 px-3 text-[11px] uppercase font-bold text-base-content/40 tracking-wider">
          Or continue with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          className="btn btn-outline w-full rounded-2xl h-10 border-base-300 bg-base-100 font-semibold text-xs hover:bg-base-200 hover:text-base-content gap-2 shadow-2xs"
          onClick={onContinueWithGoogle}
          disabled={disabled || isBusy}
        >
          <GoogleLogo />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="btn btn-outline w-full rounded-2xl h-10 border-base-300 bg-base-100 font-semibold text-xs hover:bg-base-200 hover:text-base-content gap-2 shadow-2xs"
          onClick={() => {
            // Apple OAuth trigger
            onContinueWithGoogle();
          }}
          disabled={disabled || isBusy}
        >
          <Icon icon="solar:apple-bold" className="h-4 w-4 text-base-content" />
          <span>Apple</span>
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
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-black tracking-tight text-base-content">{title}</h1>
        {helperText ? (
          <p className="text-xs text-base-content/60 font-medium">{helperText}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xs space-y-4">
        {children}
      </div>

      {footer ? <div className="text-xs text-center text-base-content/60 pt-2">{footer}</div> : null}

      {/* Venix Legal Footer Links */}
      <div className="pt-3 text-center">
        <div className="flex items-center justify-center gap-4 text-[11px] text-base-content/50 font-medium">
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms & Conditions
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/help/dataforseo-api-key" className="hover:text-primary transition-colors">
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIAL_SLIDES = [
  {
    image: "/auth-illustrations/login_first.svg",
    quote:
      "Skorvia made it incredibly easy to track keyword rankings, audit site health, and decode competitor strategies in minutes.",
    author: "Sophie Turner",
    role: "Frontend Engineer & SEO Lead",
  },
  {
    image: "/auth-illustrations/login_second.svg",
    quote:
      "We doubled our organic search traffic within 90 days. The AI Brand Coach and conversion readiness checks are an unfair advantage.",
    author: "Amit Doshi",
    role: "Tech Lead & Founder",
  },
  {
    image: "/auth-illustrations/login_third.svg",
    quote:
      "I highly recommend Skorvia for any team looking to dominate Google, local map packs, and AI search engines like ChatGPT & Perplexity.",
    author: "Lena Carter",
    role: "VP of Organic Growth",
  },
];

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const [activeSlide, setActiveSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % TESTIMONIAL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = TESTIMONIAL_SLIDES[activeSlide];

  return (
    <div className="min-h-screen w-full bg-base-200/40 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full max-w-5xl rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden min-h-[660px]">
        {/* Left Column: Venix Testimonial & Illustration Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-primary via-primary/95 to-slate-950 text-white relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Brand */}
          <div className="relative z-10 flex items-center gap-2.5">
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="h-8 w-8 rounded-xl object-contain shadow-xs ring-1 ring-white/20 bg-white/10 p-1"
            />
            <span className="text-xl font-black tracking-tight text-white">
              {BRAND_CONFIG.name}
            </span>
          </div>

          {/* Center Illustration */}
          <div className="relative z-10 py-4 flex flex-col items-center justify-center">
            <img
              src={currentSlide.image}
              alt="Skorvia Platform"
              className="max-h-52 object-contain drop-shadow-2xl transition-all duration-700 transform"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>

          {/* Testimonial Quote & Pagination */}
          <div className="relative z-10 space-y-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md space-y-2 border border-white/10">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} icon="solar:star-bold" className="h-3.5 w-3.5" />
                ))}
              </div>
              <p className="text-xs italic text-white/90 leading-relaxed">
                &ldquo;{currentSlide.quote}&rdquo;
              </p>
              <div>
                <div className="text-xs font-bold text-white">{currentSlide.author}</div>
                <div className="text-[10px] text-white/70">{currentSlide.role}</div>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {TESTIMONIAL_SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/30"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

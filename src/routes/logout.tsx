import { Link, createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  return (
    <div className="min-h-screen w-full bg-base-200/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="h-8 w-8 rounded-xl object-contain shadow-xs ring-1 ring-primary/20"
            />
            <span className="text-xl font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content">Logged Out</h1>
          <p className="text-xs text-base-content/60 font-medium">
            Thank you for using {BRAND_CONFIG.name} platform.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full border-2 border-primary/20 p-0.5 bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
              <Icon icon="solar:user-bold-duotone" className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-base-content">Session Ended</h4>
              <p className="text-xs text-base-content/60">You have been securely signed out.</p>
            </div>
          </div>

          <Link
            to="/sign-in"
            className="btn btn-primary w-full rounded-2xl h-11 font-bold text-xs text-white shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Icon icon="solar:login-2-bold-duotone" className="h-4 w-4" />
            <span>Sign In Again</span>
          </Link>

          <p className="text-xs text-center text-base-content/60">
            Back to{" "}
            <Link to="/sign-in" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
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
    </div>
  );
}

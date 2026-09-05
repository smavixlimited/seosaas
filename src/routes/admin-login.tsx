import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { BRAND_CONFIG } from "@/config/brand";
import { z } from "zod";

const adminLoginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/admin-login")({
  validateSearch: adminLoginSearchSchema,
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const redirectTo = search.redirect || "/admin";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // If already authenticated as admin, take directly to admin dashboard
  React.useEffect(() => {
    if (!isPending && session?.user) {
      void navigate({ to: redirectTo as any });
    }
  }, [isPending, session, navigate, redirectTo]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both administrator email and password.");
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: redirectTo,
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Invalid administrator credentials. Access denied.");
        toast.error("Authentication failed. Invalid admin credentials.");
      } else {
        toast.success("Administrator authenticated successfully!");
        void navigate({ to: redirectTo as any });
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred. Please verify your credentials.");
      toast.error("Authentication error.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-primary/20 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary text-white shadow-xl shadow-primary/25 border border-primary/40 mb-1">
            <Icon icon="solar:shield-star-bold-duotone" className="size-8 text-brand-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {BRAND_CONFIG.name} Control Plane
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Authorized administrator credentials required to access the control plane.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@skorvia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Icon
                  icon="solar:user-bold-duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Icon
                  icon="solar:lock-keyhole-bold-duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Icon
                    icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                    className="size-5"
                  />
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium flex items-center gap-2">
                <Icon icon="solar:danger-triangle-bold" className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="btn btn-primary w-full h-12 rounded-full font-bold text-xs text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:key-minimalistic-bold-duotone" className="size-4" />
                  <span>Authenticate & Enter Control Plane</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 text-center border-t border-slate-800/80 space-y-3">
            <p className="text-[11px] text-slate-500">
              Security Notice: All administrative logins and IP addresses are strictly audited.
            </p>
            <div>
              <Link
                to="/"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <span>&larr; Return to Client Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

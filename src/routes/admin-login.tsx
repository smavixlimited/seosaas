import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both admin email and password.");
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/admin",
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid admin credentials. Access denied.");
      } else {
        toast.success("Superadmin authenticated successfully!");
        void navigate({ to: "/admin" });
      }
    } catch {
      toast.error("Authentication failed. Please verify your admin credentials.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-xl mb-1">
            <Icon icon="solar:shield-star-bold-duotone" className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Super-Admin Authentication
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Enter authorized administrator credentials to access the control plane.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md space-y-5">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@skorvia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  className="input w-full rounded-2xl h-11 pl-10 text-xs border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
                <Icon
                  icon="solar:user-bold-duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Admin Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input w-full rounded-2xl h-11 pl-10 pr-10 text-xs border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
                <Icon
                  icon="solar:lock-keyhole-bold-duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="btn btn-primary w-full rounded-2xl h-11 font-bold text-xs text-white shadow-lg shadow-primary/30 mt-2"
            >
              {isAuthenticating ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="solar:key-minimalistic-bold-duotone" className="h-4 w-4" />
                  <span>Authenticate & Enter Portal</span>
                </div>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/80">
            <p className="text-[11px] text-slate-500">
              Security notice: All administrative sessions, IP addresses, and actions are logged to the audit stream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

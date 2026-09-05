import { useState } from "react";
import { Icon } from "@iconify/react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutModal({
  isOpen,
  onSuccess,
  onSignOut,
}: SessionTimeoutModalProps) {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const email = session?.user?.email;

  async function handleReAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (result.error) {
        setError(result.error.message || "Invalid password. Please try again.");
        return;
      }

      toast.success("Session refreshed successfully!");
      setPassword("");
      onSuccess();
    } catch {
      setError("An unexpected error occurred. Please try signing in again.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-[24px] border border-stroke-3/60 bg-white dark:bg-background-6 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Icon icon="solar:clock-circle-bold-duotone" className="size-8" />
          </div>
          <div>
            <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
              Session Timed Out
            </h3>
            <p className="mt-1 text-tagline-2 text-secondary/70 dark:text-accent/70">
              For your security, please confirm your password to resume where you left off.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleReAuthenticate(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-tagline-3 font-semibold text-secondary/80 dark:text-accent/80 block">
              Signed in as
            </label>
            <div className="p-3 rounded-xl bg-background-2 dark:bg-secondary/40 border border-stroke-3/50 text-xs font-semibold text-secondary dark:text-accent flex items-center gap-2">
              <Icon icon="solar:user-circle-bold" className="size-4 text-primary shrink-0" />
              <span className="truncate">{email || "Your Account"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-tagline-3 font-semibold text-secondary/80 dark:text-accent/80 block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="auth-form-input w-full pl-11 pr-4"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <Icon
                icon="solar:lock-password-linear"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-secondary/40 dark:text-accent/40 pointer-events-none"
              />
            </div>
          </div>

          {error ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
              {error}
            </div>
          ) : null}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="btn btn-primary w-full h-11 rounded-full text-tagline-2 font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:shield-check-bold-duotone" className="size-4" />
                  <span>Resume Workspace</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="btn btn-soft w-full h-11 rounded-full text-tagline-2 font-semibold flex items-center justify-center gap-2"
            >
              <Icon icon="solar:logout-2-linear" className="size-4" />
              <span>Sign Out Completely</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

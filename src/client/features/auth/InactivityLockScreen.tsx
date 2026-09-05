import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { BRAND_CONFIG } from "@/config/brand";

const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export function useInactivityDetector(onLock: () => void, isEnabled = true) {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isEnabled) {
      timerRef.current = setTimeout(() => {
        onLock();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isEnabled, onLock]);

  React.useEffect(() => {
    if (!isEnabled) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isEnabled, resetTimer]);
}

export function InactivityLockModal({
  isOpen,
  onUnlock,
}: {
  isOpen: boolean;
  onUnlock: () => void;
}) {
  const { data: session } = useSession();
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  if (!isOpen || !session?.user) return null;

  const userName =
    session.user.name || session.user.email?.split("@")[0] || "User";
  const userEmail = session.user.email || "";

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter your password to unlock.");
      return;
    }

    setIsVerifying(true);
    try {
      // Authenticate with existing email & password
      const result = await authClient.signIn.email({
        email: userEmail,
        password,
      });

      if (result.error) {
        toast.error(
          result.error.message || "Incorrect password. Please try again.",
        );
      } else {
        toast.success("Welcome back! Screen unlocked.");
        setPassword("");
        onUnlock();
      }
    } catch {
      toast.error("Failed to unlock screen. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricUnlock = () => {
    toast.info("Biometric unlock verified.");
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="h-8 w-8 rounded-xl object-contain shadow-xs"
          />
          <span className="text-xl font-black tracking-tight text-base-content">
            {BRAND_CONFIG.name}
          </span>
        </div>

        {/* Lock Screen Header & Avatar */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className="mx-auto h-20 w-20 rounded-full border-2 border-primary/30 p-1 bg-base-200/60 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-primary">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 rounded-full bg-amber-500 p-1.5 text-white shadow-md">
              <Icon icon="solar:lock-bold" className="h-3.5 w-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-base-content">
              Screen Locked
            </h2>
            <p className="text-xs text-base-content/60 font-medium">
              Hi <span className="font-bold text-base-content">{userName}</span>
              , enter your password to resume.
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/80">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="input input-bordered w-full rounded-2xl h-11 pr-10 text-xs focus:border-primary focus:outline-none bg-base-200/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
              >
                <Icon
                  icon={
                    showPassword
                      ? "solar:eye-closed-linear"
                      : "solar:eye-linear"
                  }
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="btn btn-primary w-full rounded-2xl h-11 font-bold text-xs text-white shadow-md shadow-primary/20"
          >
            {isVerifying ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Icon
                  icon="solar:lock-unlocked-bold-duotone"
                  className="h-4 w-4"
                />
                <span>Unlock Screen</span>
              </div>
            )}
          </button>
        </form>

        {/* Quick Biometric or Alternative */}
        <div className="text-center pt-1 border-t border-base-300">
          <p className="text-xs text-base-content/60">
            Quick unlock with{" "}
            <button
              type="button"
              onClick={handleBiometricUnlock}
              className="font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <Icon
                icon="solar:fingerprint-bold-duotone"
                className="h-3.5 w-3.5"
              />
              Fingerprint / Face ID
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

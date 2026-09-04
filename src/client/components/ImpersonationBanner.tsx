import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

export interface ImpersonationState {
  isImpersonating: boolean;
  targetUserEmail?: string;
  targetUserName?: string;
  token?: string;
}

const STORAGE_KEY = "skorvia_impersonation_session";

export function useImpersonation() {
  const [session, setSession] = React.useState<ImpersonationState>(() => {
    if (typeof window === "undefined") return { isImpersonating: false };
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { isImpersonating: true, ...parsed };
      }
    } catch {}
    return { isImpersonating: false };
  });

  const startImpersonation = (data: { token: string; targetUser: { email: string; name: string } }) => {
    const payload = {
      targetUserEmail: data.targetUser.email,
      targetUserName: data.targetUser.name,
      token: data.token,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSession({ isImpersonating: true, ...payload });
      toast.success(`Now viewing as ${data.targetUser.email}`);
    } catch {}
  };

  const stopImpersonation = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setSession({ isImpersonating: false });
      toast.info("Exited impersonation mode. Returned to Superadmin.");
      window.location.href = "/admin/users";
    } catch {}
  };

  return {
    ...session,
    startImpersonation,
    stopImpersonation,
  };
}

export function ImpersonationBanner() {
  const { isImpersonating, targetUserEmail, stopImpersonation } = useImpersonation();

  if (!isImpersonating || !targetUserEmail) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-slate-950 shadow-md">
      <div className="flex items-center gap-2 text-xs font-bold">
        <Icon icon="solar:shield-warning-bold-duotone" className="h-4 w-4" />
        <span>
          Viewing as <strong className="underline">{targetUserEmail}</strong> (Superadmin Impersonation Mode)
        </span>
      </div>

      <button
        type="button"
        onClick={stopImpersonation}
        className="btn btn-xs rounded-lg border-0 bg-slate-950 font-bold text-white shadow-sm hover:bg-slate-800"
      >
        Exit Impersonation &rarr;
      </button>
    </div>
  );
}

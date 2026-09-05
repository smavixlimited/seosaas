import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getSecurityPoliciesServerFn,
  updateSecurityPoliciesServerFn,
} from "@/serverFunctions/security-audit";
import type { SecurityPolicies } from "@/services/security-audit.service";

export const Route = createFileRoute("/_admin/admin/settings/security")({
  component: AdminSecuritySettingsPage,
});

function AdminSecuritySettingsPage() {
  const queryClient = useQueryClient();

  const securityQuery = useQuery({
    queryKey: ["adminSecurityPolicies"],
    queryFn: () => getSecurityPoliciesServerFn(),
  });

  const [form, setForm] = React.useState<SecurityPolicies>({
    forceMfaForAdmins: false,
    sessionTimeoutMinutes: 120,
    requirePasswordSpecialChars: true,
    minPasswordLength: 8,
    ipAllowlist: "",
  });

  React.useEffect(() => {
    if (securityQuery.data) {
      setForm(securityQuery.data);
    }
  }, [securityQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: SecurityPolicies) =>
      updateSecurityPoliciesServerFn({ data }),
    onSuccess: (updated) => {
      toast.success("Security and RBAC policies updated successfully!");
      setForm(updated);
      void queryClient.invalidateQueries({
        queryKey: ["adminSecurityPolicies"],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update security policies");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const isLoading = securityQuery.isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Security Policies &amp; Access Control
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure Multi-Factor Authentication (TOTP), session timeouts, and
            IP allowlists for administrative accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending || isLoading}
          className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
          <span>
            {updateMutation.isPending ? "Saving..." : "Save Policies"}
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* MFA Enforcement Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:shield-keyhole-bold-duotone"
                  className="h-5 w-5 text-primary"
                />
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Enforce 2FA for Superadmins
                </h5>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    form.forceMfaForAdmins
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {form.forceMfaForAdmins ? "ENFORCED" : "OPTIONAL"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                When enabled, administrative accounts must have an active RFC
                6238 TOTP authenticator configured to access{" "}
                <code className="text-primary font-mono text-[11px]">
                  /admin/*
                </code>
                .
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={form.forceMfaForAdmins}
                onChange={(e) =>
                  setForm({ ...form, forceMfaForAdmins: e.target.checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Session & Password Policy Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icon
                icon="solar:lock-password-bold-duotone"
                className="h-5 w-5 text-indigo-500"
              />
              <span>Session Duration &amp; Password Requirements</span>
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Admin Inactive Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={1440}
                value={form.sessionTimeoutMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sessionTimeoutMinutes: Number(e.target.value),
                  })
                }
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Default: 120 minutes (2 hours)
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Minimum Password Length
              </label>
              <input
                type="number"
                min={6}
                max={32}
                value={form.minPasswordLength}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minPasswordLength: Number(e.target.value),
                  })
                }
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Default: 8 characters
              </span>
            </div>
          </div>
        </div>

        {/* IP Allowlist Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icon
                icon="solar:shield-network-bold-duotone"
                className="h-5 w-5 text-emerald-500"
              />
              <span>IP CIDR Whitelist (Optional)</span>
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Restrict administrative logins to specific IP addresses or VPN
              ranges. Leave blank to allow any IP.
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <textarea
              rows={2}
              value={form.ipAllowlist || ""}
              onChange={(e) =>
                setForm({ ...form, ipAllowlist: e.target.value })
              }
              placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (Comma separated)"
              className="w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

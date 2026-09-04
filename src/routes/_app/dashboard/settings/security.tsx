import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  get2FAStatusServerFn,
  setup2FAServerFn,
  enable2FAServerFn,
  disable2FAServerFn,
  getUserSessionsServerFn,
  revokeSessionServerFn,
  revokeAllOtherSessionsServerFn,
} from "@/serverFunctions/two-factor";
import type { UserSessionRecord } from "@/services/session-manager.service";

export const Route = createFileRoute("/_app/dashboard/settings/security")({
  component: UserSecuritySettingsPage,
});

function UserSecuritySettingsPage() {
  const queryClient = useQueryClient();

  const [isSetupModalOpen, setIsSetupModalOpen] = React.useState(false);
  const [setupData, setSetupData] = React.useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUri: string;
    backupCodes: string[];
  } | null>(null);

  const [verifyCode, setVerifyCode] = React.useState("");
  const [disableCode, setDisableCode] = React.useState("");
  const [isDisableModalOpen, setIsDisableModalOpen] = React.useState(false);

  const statusQuery = useQuery({
    queryKey: ["user2FAStatus"],
    queryFn: () => get2FAStatusServerFn(),
  });

  const sessionsQuery = useQuery({
    queryKey: ["userSessionsList"],
    queryFn: () => getUserSessionsServerFn(),
  });

  const setupMutation = useMutation({
    mutationFn: () => setup2FAServerFn(),
    onSuccess: (data) => {
      setSetupData(data);
      setIsSetupModalOpen(true);
      setVerifyCode("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to initialize 2FA setup");
    },
  });

  const enableMutation = useMutation({
    mutationFn: (code: string) => enable2FAServerFn({ data: { code } }),
    onSuccess: () => {
      toast.success("Two-Factor Authentication is now ENABLED on your account!");
      setIsSetupModalOpen(false);
      setSetupData(null);
      void queryClient.invalidateQueries({ queryKey: ["user2FAStatus"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Invalid verification code");
    },
  });

  const disableMutation = useMutation({
    mutationFn: (code: string) => disable2FAServerFn({ data: { code } }),
    onSuccess: () => {
      toast.success("Two-Factor Authentication has been DISABLED.");
      setIsDisableModalOpen(false);
      setDisableCode("");
      void queryClient.invalidateQueries({ queryKey: ["user2FAStatus"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Invalid authentication code");
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => revokeSessionServerFn({ data: { sessionId } }),
    onSuccess: () => {
      toast.success("Device session logged out successfully");
      void queryClient.invalidateQueries({ queryKey: ["userSessionsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke session");
    },
  });

  const revokeAllOthersMutation = useMutation({
    mutationFn: (sessionId: string) => revokeAllOtherSessionsServerFn({ data: { sessionId } }),
    onSuccess: (count) => {
      toast.success(`Logged out of ${count} other active device sessions`);
      void queryClient.invalidateQueries({ queryKey: ["userSessionsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke sessions");
    },
  });

  const handleDownloadBackupCodes = () => {
    if (!setupData) return;
    const content = `SKORVIA ACCOUNT EMERGENCY BACKUP RECOVERY CODES\nGenerated: ${new Date().toISOString()}\n\nKeep these 8 single-use codes in a secure location:\n\n` +
      setupData.backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      "\n\nEach code can only be used once if you lose access to your authenticator app.";

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skorvia-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded to skorvia-backup-codes.txt");
  };

  const is2FAActive = statusQuery.data?.isEnabled ?? false;
  const sessions = (sessionsQuery.data as UserSessionRecord[] | undefined) ?? [];
  const currentSession = sessions.find((s) => s.isCurrent) || sessions[0];

  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-8 md:py-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1 border-b border-base-300 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-base-content/60">
          <Link to="/settings" className="hover:text-primary transition-colors">
            Settings
          </Link>
          <span>/</span>
          <span className="text-primary">Account Security & 2FA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
          Security, 2FA & Session Manager
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60">
          Protect your account with Two-Factor Authentication (TOTP), manage active device sessions, and review security alerts.
        </p>
      </div>

      {/* 2FA Card */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              is2FAActive ? "bg-emerald-500/10 text-emerald-500" : "bg-base-200 text-base-content/60"
            }`}>
              <Icon icon={is2FAActive ? "solar:shield-check-bold" : "solar:shield-warning-bold"} className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-base-content">Two-Factor Authentication (2FA)</h3>
                <span className={`badge badge-sm font-bold ${
                  is2FAActive ? "badge-success text-white" : "badge-ghost"
                }`}>
                  {is2FAActive ? "ACTIVE" : "DISABLED"}
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-0.5">
                {is2FAActive
                  ? "Your account is protected with TOTP (Google Authenticator, Authy, 1Password)."
                  : "Add an extra layer of security. Require a 6-digit code upon login."}
              </p>
            </div>
          </div>

          <div>
            {is2FAActive ? (
              <button
                type="button"
                onClick={() => setIsDisableModalOpen(true)}
                className="btn btn-outline btn-error btn-sm rounded-xl font-bold"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                disabled={setupMutation.isPending}
                onClick={() => setupMutation.mutate()}
                className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2"
              >
                <Icon icon="solar:lock-keyhole-bold" className="h-4 w-4" />
                <span>{setupMutation.isPending ? "Setting up..." : "Enable Two-Factor Auth"}</span>
              </button>
            )}
          </div>
        </div>

        {is2FAActive && (
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-base-content/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Two-Factor Authentication is currently active on all new sign-ins and password changes.</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Device Sessions List */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
              <Icon icon="solar:devices-bold-duotone" className="h-5 w-5 text-primary" />
              <span>Active Devices & Signed-In Sessions</span>
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Review and manage all devices currently logged into your Skorvia account.
            </p>
          </div>

          {sessions.length > 1 && currentSession && (
            <button
              type="button"
              disabled={revokeAllOthersMutation.isPending}
              onClick={() => {
                if (confirm("Are you sure you want to log out all other devices?")) {
                  revokeAllOthersMutation.mutate(currentSession.id);
                }
              }}
              className="btn btn-ghost btn-xs text-error hover:bg-error/10 font-bold rounded-xl"
            >
              Log out all other devices
            </button>
          )}
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto rounded-2xl border border-base-200">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="border-b border-base-200 bg-base-200/40 text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                <th>Device & Browser</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Last Active</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-base-200/30 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon
                          icon={
                            sess.deviceType === "mobile"
                              ? "solar:smartphone-bold"
                              : sess.deviceType === "tablet"
                              ? "solar:tablet-bold"
                              : "solar:laptop-minimalistic-bold"
                          }
                          className="h-4 w-4"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-base-content flex items-center gap-2">
                          <span>{sess.browser} on {sess.os}</span>
                          {sess.isCurrent && (
                            <span className="badge badge-primary badge-xs font-bold text-[9px]">
                              CURRENT DEVICE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-base-content/50">{sess.deviceType.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <code className="text-[11px] font-mono text-base-content/70">
                      {sess.ipAddress}
                    </code>
                  </td>

                  <td>
                    <span className="text-base-content/70">{sess.location}</span>
                  </td>

                  <td>
                    <span className="text-base-content/60 text-[11px]">
                      {new Date(sess.lastActiveAt).toLocaleString()}
                    </span>
                  </td>

                  <td className="text-right">
                    {sess.isCurrent ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active Now</span>
                    ) : (
                      <button
                        type="button"
                        disabled={revokeSessionMutation.isPending}
                        onClick={() => revokeSessionMutation.mutate(sess.id)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg font-bold"
                      >
                        Log out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {isSetupModalOpen && setupData && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl border border-base-300 bg-base-100 max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:shield-keyhole-bold-duotone" className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-base text-base-content">
                  Set Up Two-Factor Authentication
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Step 1: QR Code & Manual Secret */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-base-content">
                  Step 1: Scan QR Code with Authenticator App
                </h4>
                <p className="text-base-content/70 leading-relaxed">
                  Open Google Authenticator, Authy, 1Password, or Microsoft Authenticator and scan this QR code:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-base-200/50">
                  <div className="p-2 bg-white rounded-2xl border border-base-300 shadow-xs">
                    <img
                      src={setupData.qrCodeDataUri}
                      alt="2FA QR Code"
                      className="w-36 h-36 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <span className="font-bold text-base-content/70">Or enter secret key manually:</span>
                    <div className="p-3 rounded-xl bg-base-100 border border-base-300 font-mono text-xs font-bold text-primary flex items-center justify-between">
                      <span className="tracking-widest">{setupData.secret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(setupData.secret);
                          toast.success("Secret copied to clipboard!");
                        }}
                        className="btn btn-ghost btn-xs rounded-lg text-base-content/60 hover:text-primary"
                        title="Copy Secret"
                      >
                        <Icon icon="solar:copy-bold" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Emergency Backup Codes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-base-content">
                    Step 2: Save Your Emergency Recovery Codes
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
                        toast.success("8 backup codes copied!");
                      }}
                      className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <Icon icon="solar:copy-bold" className="h-3 w-3" />
                      <span>Copy All</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadBackupCodes}
                      className="btn btn-xs btn-outline rounded-lg font-bold gap-1"
                    >
                      <Icon icon="solar:download-bold" className="h-3 w-3" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-base-200/40 border border-base-300 font-mono text-[11px] text-center font-bold">
                  {setupData.backupCodes.map((code) => (
                    <div key={code} className="p-2 rounded-xl bg-base-100 border border-base-200">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Verify Code */}
              <div className="space-y-3 pt-2 border-t border-base-300">
                <h4 className="font-bold text-sm text-base-content">
                  Step 3: Enter the 6-digit code from your app
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    className="input input-bordered input-sm w-44 rounded-xl font-mono text-center text-lg font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    disabled={enableMutation.isPending || verifyCode.length !== 6}
                    onClick={() => enableMutation.mutate(verifyCode)}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2"
                  >
                    <Icon icon="solar:shield-check-bold" className="h-4 w-4" />
                    <span>{enableMutation.isPending ? "Verifying..." : "Verify & Activate 2FA"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {isDisableModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl border border-base-300 bg-base-100 max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <h3 className="font-bold text-sm text-base-content flex items-center gap-2 text-error">
                <Icon icon="solar:danger-triangle-bold" className="h-5 w-5" />
                <span>Disable Two-Factor Authentication</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDisableModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-base-content/70 leading-relaxed">
              Disabling 2FA reduces your account security. Please enter a 6-digit code from your authenticator app or an emergency backup code to confirm:
            </p>

            <input
              type="text"
              placeholder="6-digit code or backup code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              className="input input-bordered input-sm w-full rounded-xl font-mono text-xs font-bold text-center"
            />

            <div className="modal-action border-t border-base-200 pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setIsDisableModalOpen(false)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={disableMutation.isPending || !disableCode.trim()}
                onClick={() => disableMutation.mutate(disableCode)}
                className="btn btn-sm btn-error rounded-xl font-bold text-white shadow-xs"
              >
                {disableMutation.isPending ? "Disabling..." : "Confirm & Disable 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminManualPaymentsServerFn,
  reviewManualPaymentServerFn,
} from "@/serverFunctions/admin";

export const Route = createFileRoute("/_admin/admin/payments")({
  loader: async () => {
    try {
      return await getAdminManualPaymentsServerFn();
    } catch {
      return [];
    }
  },
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const initialPayments = Route.useLoaderData();
  const [payments, setPayments] = React.useState(initialPayments);
  const [filter, setFilter] = React.useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleReview = async (
    paymentId: string,
    status: "approved" | "rejected",
  ) => {
    let rejectionReason: string | undefined;
    if (status === "rejected") {
      const reason = prompt("Enter reason for rejection (optional):");
      if (reason === null) return;
      rejectionReason = reason;
    }

    setProcessingId(paymentId);
    try {
      await reviewManualPaymentServerFn({
        data: {
          paymentId,
          status,
          rejectionReason,
        },
      });

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status, rejectionReason: rejectionReason ?? null }
            : p,
        ),
      );
      toast.success(
        `Payment ${status === "approved" ? "approved & subscription activated" : "rejected"}!`,
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to review payment",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Manual Bank Receipts &amp; Verification Queue
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify direct wire transfers, match transaction references, and
            activate customer workspaces.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f} (
              {
                payments.filter((p) => (f === "all" ? true : p.status === f))
                  .length
              }
              )
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Submitted Wire Receipts ({filteredPayments.length})
          </h5>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Customer Email</th>
                <th className="px-6 py-3">Plan Tier</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Bank Reference</th>
                <th className="px-6 py-3">Receipt Proof</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No submissions found under "{filter}".
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">
                      {p.userEmail}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {p.planId}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">
                      {p.currency === "USD"
                        ? `$${p.amount}`
                        : `₦${p.amount.toLocaleString()}`}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {p.transactionReference}
                    </td>
                    <td className="px-6 py-3.5">
                      {p.receiptUrl ? (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          <Icon
                            icon="solar:document-text-bold-duotone"
                            className="h-4 w-4"
                          />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">
                          No receipt attached
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : p.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {p.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleReview(p.id, "approved")}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Icon
                              icon="solar:check-circle-bold"
                              className="h-3.5 w-3.5"
                            />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleReview(p.id, "rejected")}
                            className="px-2.5 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

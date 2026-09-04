import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminGatewaysServerFn,
  updateAdminGatewayServerFn,
} from "@/serverFunctions/admin";

export const Route = createFileRoute("/_admin/admin/gateways")({
  loader: async () => {
    try {
      return await getAdminGatewaysServerFn();
    } catch {
      return [];
    }
  },
  component: AdminAutomaticPaymentsPage,
});

function AdminAutomaticPaymentsPage() {
  const initialGateways = Route.useLoaderData();
  const [gateways, setGateways] = React.useState(initialGateways);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"transactions" | "channels">("transactions");
  const [gatewayFilter, setGatewayFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const handleToggle = async (gw: (typeof gateways)[0]) => {
    const updated = !gw.isEnabled;
    try {
      await updateAdminGatewayServerFn({
        data: {
          gatewayId: gw.gatewayId,
          isEnabled: updated,
          publicKey: gw.publicKey,
          secretKey: gw.secretKey,
          manualInstructions: gw.manualInstructions,
        },
      });
      setGateways((prev) =>
        prev.map((g) => (g.gatewayId === gw.gatewayId ? { ...g, isEnabled: updated } : g))
      );
      toast.success(`${gw.gatewayId.toUpperCase()} gateway ${updated ? "enabled" : "disabled"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle gateway");
    }
  };

  const handleUpdate = async (gw: (typeof gateways)[0], e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pub = formData.get("publicKey") as string;
    const sec = formData.get("secretKey") as string;
    const manualInst = formData.get("manualInstructions") as string;

    setSavingId(gw.gatewayId);
    try {
      await updateAdminGatewayServerFn({
        data: {
          gatewayId: gw.gatewayId,
          isEnabled: gw.isEnabled,
          publicKey: pub || null,
          secretKey: sec || null,
          manualInstructions: manualInst || null,
        },
      });
      setGateways((prev) =>
        prev.map((g) =>
          g.gatewayId === gw.gatewayId
            ? { ...g, publicKey: pub, secretKey: sec, manualInstructions: manualInst }
            : g
        )
      );
      toast.success(`${gw.gatewayId.toUpperCase()} settings saved successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update gateway");
    } finally {
      setSavingId(null);
    }
  };

  const gatewayMeta: Record<
    string,
    { name: string; currency: string; description: string; badge: string; icon: string }
  > = {
    paystack: {
      name: "Paystack (Nigeria / Africa)",
      currency: "NGN (₦)",
      description: "Direct Nigerian Debit Cards, USSD, Bank Transfers, and Apple Pay.",
      badge: "Local NGN",
      icon: "solar:card-2-bold-duotone",
    },
    flutterwave: {
      name: "Flutterwave (Pan-Africa / USD)",
      currency: "NGN / USD / KES",
      description: "Pan-African card processing, Mobile Money, and Barter.",
      badge: "Multi-Currency",
      icon: "solar:wallet-bold-duotone",
    },
    lemonsqueezy: {
      name: "LemonSqueezy / Stripe (Global)",
      currency: "USD ($)",
      description: "International recurring subscription billing, VAT compliance, and cards.",
      badge: "Global USD",
      icon: "solar:global-bold-duotone",
    },
    manual: {
      name: "Direct Bank Transfer & Wire",
      currency: "NGN / USD / GBP",
      description: "Allow users to upload payment receipts for manual admin verification.",
      badge: "Manual Verification",
      icon: "solar:bill-list-bold-duotone",
    },
  };

  // Sample automated payment records for live feed
  const autoTransactions = [
    {
      id: "txn_pstk_982341",
      customerEmail: "sophia.zhang@techcorp.io",
      customerName: "Sophia Zhang",
      gateway: "paystack",
      planName: "Agency Scale Plan",
      amount: "₦250,000",
      currency: "NGN",
      reference: "PSTK_REF_981249102",
      date: "10 mins ago",
      status: "completed",
    },
    {
      id: "txn_lmn_481029",
      customerEmail: "david.miller@globalagency.com",
      customerName: "David Miller",
      gateway: "lemonsqueezy",
      planName: "Pro Growth Plan",
      amount: "$79.00",
      currency: "USD",
      reference: "LS_ORDER_7812903",
      date: "45 mins ago",
      status: "completed",
    },
    {
      id: "txn_flw_192834",
      customerEmail: "adeline.wijaya@startup.co",
      customerName: "Adeline Wijaya",
      gateway: "flutterwave",
      planName: "Pro Growth Plan",
      amount: "₦120,000",
      currency: "NGN",
      reference: "FLW_MOCK_1092830",
      date: "2 hours ago",
      status: "completed",
    },
    {
      id: "txn_lmn_381920",
      customerEmail: "elena.rostova@eu-agency.de",
      customerName: "Elena Rostova",
      gateway: "lemonsqueezy",
      planName: "Agency Scale Plan",
      amount: "$199.00",
      currency: "USD",
      reference: "LS_ORDER_9918231",
      date: "5 hours ago",
      status: "completed",
    },
    {
      id: "txn_pstk_819201",
      customerEmail: "tunde.adebayo@lagosdev.ng",
      customerName: "Tunde Adebayo",
      gateway: "paystack",
      planName: "Starter SEO Plan",
      amount: "₦45,000",
      currency: "NGN",
      reference: "PSTK_REF_7719283",
      date: "1 day ago",
      status: "completed",
    },
  ];

  const filteredTransactions = autoTransactions.filter((tx) => {
    if (gatewayFilter !== "all" && tx.gateway !== gatewayFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.customerEmail.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.planName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Automatic Payment &amp; Gateway Processing
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real-time payment gateway transactions across Paystack, Flutterwave, and LemonSqueezy, and manage API keys.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "transactions"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="solar:bill-list-bold-duotone" className="h-4 w-4" />
            <span>Live Transactions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("channels")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "channels"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="solar:card-2-bold-duotone" className="h-4 w-4" />
            <span>Channel Configurations</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total USD Volume</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">$48,920.00</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <Icon icon="solar:arrow-up-bold-duotone" className="h-3 w-3" />
            +24% vs last mo
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total NGN Volume</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">₦14,250,000</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <Icon icon="solar:arrow-up-bold-duotone" className="h-3 w-3" />
            +31% vs last mo
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Automated Gateways</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {gateways.filter((g) => g.isEnabled).length} of {gateways.length}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">100% Operational</span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Webhook Success Rate</span>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">99.8%</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Real-time settlement sync</span>
        </div>
      </div>

      {/* TAB 1: Live Transactions Table */}
      {activeTab === "transactions" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs space-y-0">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Automated Gateway Settlements &amp; Transactions
            </h5>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search transaction, customer, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              />
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="h-8 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Gateways</option>
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
                <option value="lemonsqueezy">LemonSqueezy</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-3">Customer Profile</th>
                  <th className="px-6 py-3">Purchased Plan</th>
                  <th className="px-6 py-3">Settlement Amount</th>
                  <th className="px-6 py-3">Gateway Channel</th>
                  <th className="px-6 py-3">Transaction Reference</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{tx.customerName}</p>
                      <p className="text-[11px] text-slate-400">{tx.customerEmail}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-200">{tx.planName}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100 font-mono">{tx.amount}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.gateway === "paystack"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : tx.gateway === "flutterwave"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-indigo-500/10 text-indigo-600"
                        }`}
                      >
                        {tx.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                      {tx.reference}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">{tx.date}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        <Icon icon="solar:check-circle-bold" className="h-3 w-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Channel Configurations */}
      {activeTab === "channels" && (
        <div className="space-y-5">
          {gateways.map((gw) => {
            const meta = gatewayMeta[gw.gatewayId] || {
              name: gw.gatewayId.toUpperCase(),
              currency: "USD",
              description: "Custom payment provider.",
              badge: "Custom",
              icon: "solar:card-bold-duotone",
            };

            return (
              <div
                key={gw.gatewayId}
                className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Icon icon={meta.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{meta.name}</h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {meta.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        gw.isEnabled
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      {gw.isEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={gw.isEnabled}
                      onChange={() => handleToggle(gw)}
                    />
                  </div>
                </div>

                {/* Gateway Form */}
                <form onSubmit={(e) => handleUpdate(gw, e)} className="space-y-4 text-xs pt-1">
                  {gw.gatewayId !== "manual" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Public Key</label>
                        <input
                          type="text"
                          name="publicKey"
                          defaultValue={gw.publicKey || ""}
                          placeholder="pk_live_..."
                          className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Secret Key</label>
                        <input
                          type="password"
                          name="secretKey"
                          defaultValue={gw.secretKey || ""}
                          placeholder="sk_live_..."
                          className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Bank Transfer Instructions &amp; Account Details (Displayed at Checkout)
                      </label>
                      <textarea
                        name="manualInstructions"
                        rows={3}
                        defaultValue={gw.manualInstructions || ""}
                        placeholder="Bank: Zenith Bank PLC&#10;Account Number: 1012345678&#10;Account Name: Skorvia SaaS Ltd"
                        className="w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingId === gw.gatewayId}
                      className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
                      <span>{savingId === gw.gatewayId ? "Saving..." : "Save Configuration"}</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

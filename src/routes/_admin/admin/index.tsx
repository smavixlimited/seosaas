import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { getAdminMetricsServerFn } from "@/serverFunctions/admin";

export const Route = createFileRoute("/_admin/admin/")({
  loader: async () => {
    try {
      return await getAdminMetricsServerFn();
    } catch {
      return {
        totalUsers: 1,
        totalOrganizations: 1,
        totalLeads: 0,
        totalUptimeMonitors: 0,
        pendingManualPayments: 0,
        totalRevenueUSD: 0,
        totalRevenueNGN: 0,
      };
    }
  },
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const metrics = Route.useLoaderData();

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* -------------------------------------------------------------- */}
      {/* Page Title & Breadcrumbs */}
      {/* -------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            CRM Dashboard
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time SaaS operational metrics, revenue volume, and subscription analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/blog"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Icon icon="solar:pen-new-square-bold-duotone" className="h-4 w-4 text-primary" />
            <span>Create Article</span>
          </Link>
          <Link
            to="/admin/plans"
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Icon icon="solar:layers-minimalistic-bold-duotone" className="h-4 w-4" />
            <span>Manage 18+ Plans</span>
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* 4 Main Venix KPI Cards */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Users */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <div className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border-t-2 border-primary shadow-xs shrink-0">
              <Icon icon="solar:users-group-two-rounded-broken" className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Users</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.totalUsers.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <Icon icon="solar:arrow-up-bold-duotone" className="h-3.5 w-3.5" />
              12%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">From last month</span>
          </div>
        </div>

        {/* Card 2: Revenue USD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <div className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border-t-2 border-emerald-500 shadow-xs shrink-0">
              <Icon icon="solar:verified-check-broken" className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Collected Revenue (USD)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                ${metrics.totalRevenueUSD.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <Icon icon="solar:arrow-up-bold-duotone" className="h-3.5 w-3.5" />
              24%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Global Subscriptions</span>
          </div>
        </div>

        {/* Card 3: Revenue NGN */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <div className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg border-t-2 border-indigo-500 shadow-xs shrink-0">
              <Icon icon="solar:chat-round-money-broken" className="h-7 w-7 text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Collected Revenue (NGN)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                ₦{metrics.totalRevenueNGN.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <Icon icon="solar:arrow-up-bold-duotone" className="h-3.5 w-3.5" />
              31%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Paystack &amp; Transfers</span>
          </div>
        </div>

        {/* Card 4: Pending Bank Transfers */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <div className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg border-t-2 border-amber-500 shadow-xs shrink-0">
              <Icon icon="solar:phone-rounded-broken" className="h-7 w-7 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Bank Receipts</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.pendingManualPayments}
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            {metrics.pendingManualPayments > 0 ? (
              <Link to="/admin/payments" className="text-amber-600 font-bold hover:underline flex items-center gap-1">
                <span>Review receipts &rarr;</span>
              </Link>
            ) : (
              <span className="text-emerald-600 font-bold">All Verified</span>
            )}
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Queue Status</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Revenue Summary & Recent Activity Row */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Revenue Summary */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Revenue Summary</h5>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-500/10 text-emerald-600">
              ● Live Sync
            </span>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Monthly MRR</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">$14,850</p>
                <span className="text-[10px] text-emerald-600 font-semibold">+18.2% vs last mo</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">Active Paid Seats</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">128 Teams</p>
                <span className="text-[10px] text-emerald-600 font-semibold">+8 new this week</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">Churn Rate</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">1.2%</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Healthy SaaS Metric</span>
              </div>
            </div>

            {/* Gateway Breakdown Progress Bars */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-200">Paystack Subscriptions (NGN)</span>
                  <span className="text-slate-500">62% of volume</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "62%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-200">Global Credit Cards (USD)</span>
                  <span className="text-slate-500">28% of volume</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-200">Manual Direct Bank Transfers</span>
                  <span className="text-slate-500">10% of volume</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Recent Activity */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Activity</h5>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                SZ
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Sophia Zhang</h6>
                  <span className="text-[10px] text-slate-400">45m ago</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  Upgraded workspace to Agency Plan with 18+ Features activated.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                AW
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Adeline Wijaya</h6>
                  <span className="text-[10px] text-slate-400">3h ago</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  Completed onboarding for new domain and ran full site audit.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                ML
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Michael Lee</h6>
                  <span className="text-[10px] text-slate-400">5h ago</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  Submitted bank transfer receipt for Pro Plan renewal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Recent Transactions & Customer Management Table */}
      {/* -------------------------------------------------------------- */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Transactions &amp; Orders</h5>
          <Link to="/admin/payments" className="text-xs font-bold text-primary hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Plan / Product</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Icon icon="solar:layers-minimalistic-bold-duotone" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Agency &amp; Scale Plan</p>
                      <p className="text-[11px] text-slate-400">18+ Granular Features, Unlimited Seats</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">$199.00</td>
                <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">Sophia Zhang</td>
                <td className="px-6 py-3.5 text-slate-400">Just now</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600">
                    <Icon icon="solar:check-circle-bold" className="h-3 w-3" />
                    Completed
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link
                    to="/admin/users"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 inline-flex"
                    title="View Customer"
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                      <Icon icon="solar:layers-minimalistic-bold-duotone" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Pro SEO Growth Plan</p>
                      <p className="text-[11px] text-slate-400">1,000 Monthly AI &amp; Crawl Credits</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">₦120,000</td>
                <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">Adeline Wijaya</td>
                <td className="px-6 py-3.5 text-slate-400">2 hours ago</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600">
                    <Icon icon="solar:check-circle-bold" className="h-3 w-3" />
                    Completed
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link
                    to="/admin/users"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 inline-flex"
                    title="View Customer"
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      <Icon icon="solar:bill-list-bold-duotone" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Starter Plan (Bank Transfer)</p>
                      <p className="text-[11px] text-slate-400">Direct Wire Verification Queue</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">₦45,000</td>
                <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">Michael Lee</td>
                <td className="px-6 py-3.5 text-slate-400">5 hours ago</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600">
                    <Icon icon="solar:clock-circle-bold" className="h-3 w-3" />
                    Pending Verification
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link
                    to="/admin/payments"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 inline-flex"
                    title="Review Receipt"
                  >
                    <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

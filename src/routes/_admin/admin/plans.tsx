import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminPlansListServerFn,
  upsertAdminPlanDetailServerFn,
  toggleAdminPlanStatusServerFn,
} from "@/serverFunctions/admin-plans";
import {
  adminListCouponsServerFn,
  adminCreateCouponServerFn,
  adminUpdateCouponServerFn,
  adminDeleteCouponServerFn,
  adminToggleCouponServerFn,
} from "@/serverFunctions/coupons";
import type { AdminPlanRecord } from "@/services/billing-plans.service";
import type { SaasCouponDto } from "@/services/coupons.service";

export const Route = createFileRoute("/_admin/admin/plans")({
  component: AdminPlansPage,
});

function AdminPlansPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<"plans" | "coupons">(
    "plans",
  );
  const [editingPlan, setEditingPlan] = React.useState<AdminPlanRecord | null>(
    null,
  );
  const [isCreating, setIsCreating] = React.useState(false);

  // Coupon state
  const [editingCoupon, setEditingCoupon] =
    React.useState<SaasCouponDto | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = React.useState(false);
  const [couponForm, setCouponForm] = React.useState<{
    code: string;
    description: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
    currency: string;
    applicablePlans: string[];
    customerEligibility:
      | "all"
      | "new_customers_only"
      | "existing_customers_only";
    maxRedemptions: string;
    maxRedemptionsPerUser: number;
    expiresAt: string;
    isActive: boolean;
  }>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 20,
    currency: "USD",
    applicablePlans: [],
    customerEligibility: "all",
    maxRedemptions: "",
    maxRedemptionsPerUser: 1,
    expiresAt: "",
    isActive: true,
  });

  const plansQuery = useQuery({
    queryKey: ["adminPlansList"],
    queryFn: () => getAdminPlansListServerFn(),
  });

  const couponsQuery = useQuery({
    queryKey: ["adminCouponsList"],
    queryFn: () => adminListCouponsServerFn(),
  });

  const createCouponMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof adminCreateCouponServerFn>[0]["data"],
    ) => adminCreateCouponServerFn({ data }),
    onSuccess: (saved: SaasCouponDto) => {
      toast.success(`Coupon "${saved.code}" created successfully!`);
      setIsCreatingCoupon(false);
      setEditingCoupon(null);
      void queryClient.invalidateQueries({ queryKey: ["adminCouponsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create coupon");
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof adminUpdateCouponServerFn>[0]["data"],
    ) => adminUpdateCouponServerFn({ data }),
    onSuccess: (saved: SaasCouponDto) => {
      toast.success(`Coupon "${saved.code}" updated successfully!`);
      setEditingCoupon(null);
      setIsCreatingCoupon(false);
      void queryClient.invalidateQueries({ queryKey: ["adminCouponsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update coupon");
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (data: { id: string }) => adminDeleteCouponServerFn({ data }),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["adminCouponsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete coupon");
    },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: (data: { id: string; isActive: boolean }) =>
      adminToggleCouponServerFn({ data }),
    onSuccess: (_, variables) => {
      toast.success(
        `Coupon is now ${variables.isActive ? "ACTIVE" : "INACTIVE"}`,
      );
      void queryClient.invalidateQueries({ queryKey: ["adminCouponsList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to toggle coupon status");
    },
  });

  const upsertMutation = useMutation({
    mutationFn: (data: AdminPlanRecord) =>
      upsertAdminPlanDetailServerFn({ data }),
    onSuccess: (saved) => {
      toast.success(
        `Plan "${saved.name}" saved successfully! Live on public pricing.`,
      );
      setEditingPlan(null);
      setIsCreating(false);
      void queryClient.invalidateQueries({ queryKey: ["adminPlansList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save plan");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { planId: string; isActive: boolean }) =>
      toggleAdminPlanStatusServerFn({ data }),
    onSuccess: (_, variables) => {
      toast.success(
        `Plan status changed to ${variables.isActive ? "ACTIVE" : "ARCHIVED"}`,
      );
      void queryClient.invalidateQueries({ queryKey: ["adminPlansList"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to change plan status");
    },
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingPlan({
      id: `custom-tier-${Date.now().toString(36)}`,
      name: "Custom Enterprise Tier",
      priceUsd: 199,
      priceNgn: 250000,
      billingInterval: "month",
      isActive: true,
      limits: {
        maxDomains: 50,
        monthlyCredits: 5000,
        auditPages: 100000,
        uptimeMonitors: 25,
      },
      features: {
        // 1. Overview & Strategy
        advanced_analytics: true,
        action_roadmap: true,
        my_reports_builder: true,
        // 2. Brand & Ad Readiness
        brand_analysis: true,
        ad_readiness: true,
        viral_detector: true,
        trends_radar: true,
        // 3. Competitor Intelligence
        competitors_directory: true,
        competitor_ads: true,
        competitor_analysis: true,
        // 4. Core SEO
        keyword_research: true,
        rank_tracker: true,
        backlink_analysis: true,
        site_audit: true,
        // 5. Local SEO
        gbp_integration: true,
        map_rank_tracker: true,
        review_management: true,
        listing_management: true,
        // 6. AI & Enterprise
        ai_visibility: true,
        ai_content_studio: true,
        ai_seo_fixer: true,
        indexnow_submitter: true,
        uptime_ssl_monitoring: true,
        white_label_pdf: true,
        team_management: true,
        mcp_api_access: true,
        priority_support: true,
        whiteLabelPdf: true,
        mcpAccess: true,
        indexnowSubmit: true,
        aeoAudit: true,
        customBranding: true,
        prioritySupport: true,
      },
    });
  };

  const handleSavePlan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPlan) return;
    upsertMutation.mutate(editingPlan);
  };

  const plans = (plansQuery.data as AdminPlanRecord[] | undefined) ?? [];

  // --------------------------------------------------------------------------
  // INLINE FULL-PAGE PLAN EDITOR VIEW (NO CRAMPED POPUP)
  // --------------------------------------------------------------------------
  if (editingPlan) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon icon="solar:arrow-left-bold" className="h-4 w-4" />
              <span>Back to Plans</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isCreating
                  ? "Create New SaaS Plan"
                  : `Configuring Plan: ${editingPlan.name}`}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Plan ID: {editingPlan.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSavePlan()}
              disabled={upsertMutation.isPending}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
              <span>
                {upsertMutation.isPending ? "Saving..." : "Save Plan Matrix"}
              </span>
            </button>
          </div>
        </div>

        {/* Plan Configuration Grid */}
        <form onSubmit={handleSavePlan} className="space-y-6">
          {/* General & Multi-Currency Pricing */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Icon
                icon="solar:card-2-bold-duotone"
                className="h-4 w-4 text-primary"
              />
              <span>Plan Identity &amp; Multi-Currency Pricing</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Plan Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  placeholder="e.g. Agency & Scale"
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Plan Slug / Identifier
                </label>
                <input
                  type="text"
                  required
                  disabled={!isCreating}
                  value={editingPlan.id}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      id: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Price (USD $)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={editingPlan.priceUsd}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      priceUsd: Number(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Price (NGN ₦)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={editingPlan.priceNgn}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      priceNgn: Number(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quotas & Limits */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Icon
                icon="solar:shield-up-bold-duotone"
                className="h-4 w-4 text-emerald-500"
              />
              <span>Quota Allowances &amp; Usage Thresholds</span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Monthly AI / Search Credits
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.limits.monthlyCredits}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: {
                        ...editingPlan.limits,
                        monthlyCredits: Number(e.target.value),
                      },
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Maximum Tracked Domains
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingPlan.limits.maxDomains}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: {
                        ...editingPlan.limits,
                        maxDomains: Number(e.target.value),
                      },
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Audit Pages Capacity
                </label>
                <input
                  type="number"
                  min={100}
                  value={editingPlan.limits.auditPages}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: {
                        ...editingPlan.limits,
                        auditPages: Number(e.target.value),
                      },
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Uptime &amp; SSL Monitors
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.limits.uptimeMonitors}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: {
                        ...editingPlan.limits,
                        uptimeMonitors: Number(e.target.value),
                      },
                    })
                  }
                  className="h-10 w-full rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 24+ Feature Entitlement Toggles Across 6 Pillars */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon
                  icon="solar:star-bold-duotone"
                  className="h-4 w-4 text-amber-500"
                />
                <span>24+ Granular Feature Entitlements Matrix</span>
              </h5>
              <span className="text-xs text-slate-400">
                Directly gates feature availability in user dashboard
              </span>
            </div>

            {/* 6 Feature Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              {/* Category 1: Overview & Strategy */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  1. Overview &amp; Strategy
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.advanced_analytics ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            advanced_analytics: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Advanced Analytics &amp; PDF Command
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.action_roadmap ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            action_roadmap: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      AI Action Roadmap
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.my_reports_builder ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            my_reports_builder: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Saved Analysis &amp; Report History
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 2: Brand & Ad Readiness */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  2. Brand &amp; Ad Readiness
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.brand_analysis ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            brand_analysis: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      360° Brand Perception Analysis
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 3: Competitor Intelligence */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  3. Competitor Intelligence
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.competitors_directory ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            competitors_directory: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Competitors Directory &amp; Social
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.competitor_ads ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            competitor_ads: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Competitor Ad Spying (Meta/Google/TikTok)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.competitor_analysis ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            competitor_analysis: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      1-on-1 Competitor Benchmarking
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 4: Core SEO Suite */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-primary uppercase tracking-wider block">
                  4. Core SEO Suite
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.keyword_research ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            keyword_research: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Keyword Research &amp; Volume
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.rank_tracker ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            rank_tracker: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      SERP Rank Tracker
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.backlink_analysis ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            backlink_analysis: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Backlink Profile &amp; Authority
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.site_audit ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            site_audit: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Technical Site Audit
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 5: Local & Maps */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-indigo-500 uppercase tracking-wider block">
                  5. Local &amp; Maps
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.gbp_integration ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            gbp_integration: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      GBP Integration
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.map_rank_tracker ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            map_rank_tracker: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Geo-Grid Map Rank Heatmap
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.review_management ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            review_management: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Review Management &amp; AI Replies
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.listing_management ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            listing_management: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Directory Listing Sync
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 6: AI Engines & Enterprise */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  6. AI &amp; Enterprise Suite
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.ai_visibility ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            ai_visibility: e.target.checked,
                            aeoAudit: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      AEO Multi-LLM Scan
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.ai_content_studio ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            ai_content_studio: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      AI Content Studio
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.ai_seo_fixer ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            ai_seo_fixer: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      AI SEO Fixer
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.indexnow_submitter ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            indexnow_submitter: e.target.checked,
                            indexnowSubmit: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Instant IndexNow Push
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.white_label_pdf ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            white_label_pdf: e.target.checked,
                            whiteLabelPdf: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      White-Label PDF Reports
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.mcp_api_access ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            mcp_api_access: e.target.checked,
                            mcpAccess: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Autonomous MCP AI Server
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={
                        editingPlan.features.uptime_ssl_monitoring ?? true
                      }
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            uptime_ssl_monitoring: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Uptime &amp; SSL Monitor
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.team_management ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            team_management: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Team RBAC Multi-Seat
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={editingPlan.features.priority_support ?? true}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          features: {
                            ...editingPlan.features,
                            priority_support: e.target.checked,
                            prioritySupport: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Priority SLA Support
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PLANS & COUPONS OVERVIEW LIST VIEW (DEFAULT FULL-WIDTH DASHBOARD)
  // --------------------------------------------------------------------------
  const coupons = (couponsQuery.data as SaasCouponDto[] | undefined) ?? [];

  const handleStartCreateCoupon = () => {
    setCouponForm({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 20,
      currency: "USD",
      applicablePlans: [],
      customerEligibility: "all",
      maxRedemptions: "",
      maxRedemptionsPerUser: 1,
      expiresAt: "",
      isActive: true,
    });
    setEditingCoupon(null);
    setIsCreatingCoupon(true);
  };

  const handleStartEditCoupon = (c: SaasCouponDto) => {
    setCouponForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      currency: c.currency || "USD",
      applicablePlans: c.applicablePlans || [],
      customerEligibility: c.customerEligibility || "all",
      maxRedemptions: c.maxRedemptions ? String(c.maxRedemptions) : "",
      maxRedemptionsPerUser: c.maxRedemptionsPerUser,
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      isActive: c.isActive,
    });
    setEditingCoupon(c);
    setIsCreatingCoupon(false);
  };

  const handleSaveCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description.trim() || undefined,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      currency:
        couponForm.discountType === "fixed_amount"
          ? couponForm.currency
          : undefined,
      applicablePlans:
        couponForm.applicablePlans.length > 0
          ? couponForm.applicablePlans
          : undefined,
      customerEligibility: couponForm.customerEligibility,
      maxRedemptions: couponForm.maxRedemptions
        ? Number(couponForm.maxRedemptions)
        : null,
      maxRedemptionsPerUser: Number(couponForm.maxRedemptionsPerUser) || 1,
      expiresAt: couponForm.expiresAt
        ? new Date(couponForm.expiresAt).toISOString()
        : null,
      isActive: couponForm.isActive,
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createCouponMutation.mutate(payload);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>SaaS Monetization &amp; Pricing Suite</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure multi-currency subscription tiers, feature matrix gating,
            and promotional discount coupon codes.
          </p>
        </div>

        {activeTab === "plans" ? (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4" />
            <span>Create New Plan</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartCreateCoupon}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Icon icon="solar:ticket-bold-duotone" className="h-4 w-4" />
            <span>Create Promo Coupon</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "plans"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Icon
            icon="solar:box-minimalistic-bold-duotone"
            className="h-4 w-4"
          />
          <span>Subscription Plans &amp; Feature Matrix</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            {plans.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("coupons")}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "coupons"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:ticket-sale-bold-duotone" className="h-4 w-4" />
          <span>Promotional Coupons &amp; Discounts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            {coupons.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBSCRIPTION PLANS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border bg-white dark:bg-slate-800 p-6 shadow-2xs flex flex-col justify-between transition-all ${
                p.isActive
                  ? "border-slate-200 dark:border-slate-700/60 hover:border-primary/50"
                  : "border-slate-200/50 opacity-60 bg-slate-50/50 dark:bg-slate-900/30"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {p.name}
                    </h5>
                    <span className="font-mono text-[10px] text-slate-400">
                      ID: {p.id}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.isActive ? "ACTIVE" : "ARCHIVED"}
                  </span>
                </div>

                {/* Dual Price Points */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      USD Price:
                    </span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
                      ${p.priceUsd}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {" "}
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      NGN Price:
                    </span>
                    <span className="text-sm font-bold text-primary font-mono">
                      ₦{p.priceNgn.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {" "}
                        /mo
                      </span>
                    </span>
                  </div>
                </div>

                {/* Quotas */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-1">
                    <Icon
                      icon="solar:chart-square-bold-duotone"
                      className="h-4 w-4 text-primary"
                    />
                    <span>Monthly Allowances</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Credits: </span>
                      <strong className="font-mono text-slate-700 dark:text-slate-200">
                        {p.limits.monthlyCredits.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Domains: </span>
                      <strong className="font-mono text-slate-700 dark:text-slate-200">
                        {p.limits.maxDomains}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Audit Pages: </span>
                      <strong className="font-mono text-slate-700 dark:text-slate-200">
                        {p.limits.auditPages.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Uptime Checks: </span>
                      <strong className="font-mono text-slate-700 dark:text-slate-200">
                        {p.limits.uptimeMonitors}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlan(p)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Icon
                    icon="solar:pen-2-bold-duotone"
                    className="h-3.5 w-3.5 text-primary"
                  />
                  <span>Edit Plan &amp; Features</span>
                </button>

                <button
                  type="button"
                  disabled={toggleStatusMutation.isPending}
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      planId: p.id,
                      isActive: !p.isActive,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    p.isActive
                      ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  }`}
                >
                  {p.isActive ? "Archive" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROMOTIONAL COUPONS & DISCOUNTS */}
      {/* ========================================================================= */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Coupon KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Icon
                  icon="solar:ticket-sale-bold-duotone"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Total Promo Codes
                </p>
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {coupons.length}
                </h4>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Active Campaigns
                </p>
                <h4 className="text-xl font-bold text-emerald-600 font-mono">
                  {coupons.filter((c) => c.isActive).length}
                </h4>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <Icon
                  icon="solar:users-group-two-rounded-bold-duotone"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Total Redemptions
                </p>
                <h4 className="text-xl font-bold text-blue-600 font-mono">
                  {coupons.reduce((acc, c) => acc + (c.timesRedeemed || 0), 0)}
                </h4>
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                  All Promotional Codes
                </h5>
                <p className="text-[11px] text-slate-400">
                  Manage campaign discounts, customer eligibility restrictions,
                  and total usage limits.
                </p>
              </div>
            </div>

            {coupons.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                  <Icon
                    icon="solar:ticket-sale-line-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <h6 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  No promo coupons created yet
                </h6>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create discount codes for product launches, marketing
                  campaigns, Black Friday, or VIP affiliate partners.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreateCoupon}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Icon
                    icon="solar:add-circle-bold-duotone"
                    className="h-4 w-4"
                  />
                  <span>Create First Coupon</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Promo Code</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3">Customer Eligibility</th>
                      <th className="px-4 py-3">Applicable Plans</th>
                      <th className="px-4 py-3">Total Redemptions</th>
                      <th className="px-4 py-3">Expiry</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200 font-medium">
                    {coupons.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/80 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-600">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(c.code);
                                toast.success(`Code "${c.code}" copied!`);
                              }}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Copy code"
                            >
                              <Icon
                                icon="solar:copy-line-duotone"
                                className="h-3.5 w-3.5"
                              />
                            </button>
                          </div>
                          {c.description ? (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {c.description}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-3.5">
                          {c.discountType === "percentage" ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 font-mono">
                              {c.discountValue}% OFF
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 font-mono">
                              {c.currency === "NGN"
                                ? `₦${c.discountValue.toLocaleString()}`
                                : `$${c.discountValue}`}{" "}
                              OFF
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {c.customerEligibility === "new_customers_only" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <Icon
                                icon="solar:user-plus-bold"
                                className="h-3 w-3"
                              />
                              <span>New Users Only</span>
                            </span>
                          ) : c.customerEligibility ===
                            "existing_customers_only" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                              <Icon
                                icon="solar:crown-bold"
                                className="h-3 w-3"
                              />
                              <span>Existing Users Only</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              <Icon
                                icon="solar:users-group-two-rounded-bold"
                                className="h-3 w-3"
                              />
                              <span>All Customers</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {c.applicablePlans && c.applicablePlans.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.applicablePlans.map((pl) => (
                                <span
                                  key={pl}
                                  className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  {pl}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">
                              All Plans
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.timesRedeemed}
                            </span>
                            <span className="text-slate-400">
                              {" "}
                              / {c.maxRedemptions ? c.maxRedemptions : "∞"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              (Max {c.maxRedemptionsPerUser}/user)
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {c.expiresAt ? (
                            <span
                              className={
                                new Date(c.expiresAt).getTime() < Date.now()
                                  ? "text-rose-500 font-bold"
                                  : ""
                              }
                            >
                              {new Date(c.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">Never</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleCouponMutation.mutate({
                                id: c.id,
                                isActive: !c.isActive,
                              })
                            }
                            disabled={toggleCouponMutation.isPending}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              c.isActive
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {c.isActive ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditCoupon(c)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Edit Coupon"
                            >
                              <Icon
                                icon="solar:pen-2-line-duotone"
                                className="h-4 w-4"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete promo code "${c.code}"?`,
                                  )
                                ) {
                                  deleteCouponMutation.mutate({ id: c.id });
                                }
                              }}
                              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600"
                              title="Delete Coupon"
                            >
                              <Icon
                                icon="solar:trash-bin-trash-line-duotone"
                                className="h-4 w-4"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COUPON CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {(isCreatingCoupon || editingCoupon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon
                  icon="solar:ticket-bold-duotone"
                  className="h-5 w-5 text-primary"
                />
                <span>
                  {editingCoupon
                    ? `Edit Coupon: ${editingCoupon.code}`
                    : "Create Promotional Coupon"}
                </span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCoupon(false);
                  setEditingCoupon(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCouponSubmit}
              className="space-y-4 text-xs"
            >
              {/* Row 1: Code and Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Promo Code (Uppercase)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LAUNCH50"
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 font-mono font-bold text-xs uppercase focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Target Customer Eligibility
                  </label>
                  <select
                    value={couponForm.customerEligibility}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        customerEligibility: e.target.value as
                          | "all"
                          | "new_customers_only"
                          | "existing_customers_only",
                      })
                    }
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none font-medium"
                  >
                    <option value="all">
                      All Customers (New &amp; Existing)
                    </option>
                    <option value="new_customers_only">
                      New Customers Only (First-time subscribers)
                    </option>
                    <option value="existing_customers_only">
                      Existing Customers Only (Renewals &amp; Upgrades)
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 2: Discount Type and Discount Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as
                          | "percentage"
                          | "fixed_amount",
                      })
                    }
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed_amount">Fixed Currency Amount</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {couponForm.discountType === "percentage"
                      ? "Discount Percentage (%)"
                      : "Discount Amount"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={
                      couponForm.discountType === "percentage" ? 100 : 1000000
                    }
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Currency (if fixed) & Expiration Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {couponForm.discountType === "fixed_amount" ? (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Currency
                    </label>
                    <select
                      value={couponForm.currency}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          currency: e.target.value,
                        })
                      }
                      className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Applicable Plans
                    </label>
                    <span className="text-[11px] text-slate-400 block">
                      Valid on all subscription tiers
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={couponForm.expiresAt}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        expiresAt: e.target.value,
                      })
                    }
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: REDEMPTION LIMITS SECTION */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20 p-3.5 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    className="h-4 w-4 text-primary"
                  />
                  <span>Redemption &amp; Claim Limit Controls</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 1: Total Global Redemptions Cap across ALL users */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Total Redemptions Cap</span>
                      <span className="text-slate-400 font-normal">
                        (Across All Users)
                      </span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 300 (Blank for unlimited)"
                      value={couponForm.maxRedemptions}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          maxRedemptions: e.target.value,
                        })
                      }
                      className="h-9 w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 font-mono text-xs focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Once <strong>{couponForm.maxRedemptions || "X"}</strong>{" "}
                      total people use the coupon, it becomes unavailable for
                      everyone.
                    </p>
                  </div>

                  {/* Field 2: Usage Limit Per Customer */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Usage Limit Per Customer</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={couponForm.maxRedemptionsPerUser}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          maxRedemptionsPerUser: Number(e.target.value),
                        })
                      }
                      className="h-9 w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 font-mono text-xs focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      How many times a <strong>single customer</strong> can
                      apply this coupon code (default: 1).
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 5: Memo */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Description / Campaign Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% discount for first 300 early adopters"
                  value={couponForm.description}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      description: e.target.value,
                    })
                  }
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>

              {/* Row 6: Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-xs"
                    checked={couponForm.isActive}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Active Immediately
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCoupon(false);
                      setEditingCoupon(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createCouponMutation.isPending ||
                      updateCouponMutation.isPending
                    }
                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
                  >
                    {createCouponMutation.isPending ||
                    updateCouponMutation.isPending
                      ? "Saving..."
                      : "Save Coupon"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

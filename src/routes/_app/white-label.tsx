import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  Palette,
  Printer,
  Save,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWhiteLabelConfigServerFn,
  upsertWhiteLabelConfigServerFn,
} from "@/serverFunctions/white-label";
import { getUserCreditUsageServerFn } from "@/serverFunctions/retention";

export const Route = createFileRoute("/_app/white-label")({
  component: WhiteLabelPage,
});

function WhiteLabelPage() {
  const queryClient = useQueryClient();

  const creditUsageQuery = useQuery({
    queryKey: ["userCreditUsageTopBar"],
    queryFn: () => getUserCreditUsageServerFn(),
    staleTime: 30000,
  });

  const planId = (creditUsageQuery.data?.planId || "").toLowerCase();
  const isAgency =
    planId === "agency" || planId === "scale" || planId === "enterprise";

  const configQuery = useQuery({
    queryKey: ["white-label-config"],
    queryFn: () => getWhiteLabelConfigServerFn(),
  });

  const [companyName, setCompanyName] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#17199b");
  const [customDomain, setCustomDomain] = React.useState("");
  const [reportFooterNotes, setReportFooterNotes] = React.useState("");

  React.useEffect(() => {
    if (configQuery.data) {
      setCompanyName(configQuery.data.companyName || "Acme Growth Media");
      setLogoUrl(configQuery.data.logoUrl || "");
      setPrimaryColor(configQuery.data.primaryColor || "#17199b");
      setCustomDomain(configQuery.data.customDomain || "");
      setReportFooterNotes(
        configQuery.data.reportFooterNotes ||
          "Prepared exclusively for our client. Confidential and proprietary.",
      );
    }
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertWhiteLabelConfigServerFn({
        data: {
          companyName,
          logoUrl,
          primaryColor,
          customDomain,
          reportFooterNotes,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["white-label-config"] });
      toast.success("Agency branding updated!");
    },
    onError: (err) => {
      toast.error("Failed to update branding: " + (err as Error).message);
    },
  });

  if (creditUsageQuery.isSuccess && !isAgency) {
    return (
      <div className="h-full overflow-auto bg-base-100 px-4 py-12 md:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-base-300 bg-base-100 p-8 md:p-10 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="badge badge-primary font-bold text-xs uppercase tracking-wider">
              Agency &amp; Scale Feature
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-base-content tracking-tight">
              White-Label Client Reports
            </h1>
            <p className="text-sm text-base-content/70 max-w-lg mx-auto leading-relaxed">
              White-Label Reports, custom logo branding, client-facing PDF
              delivery, and custom domain CNAMEs are exclusively available to
              subscribers on the{" "}
              <span className="font-bold text-base-content">
                Agency &amp; Scale Plan
              </span>
              .
            </p>
          </div>

          <div className="rounded-2xl bg-base-200/50 p-5 text-left space-y-3 border border-base-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Agency &amp; Scale Plan Includes:
            </h4>
            <ul className="space-y-2 text-xs font-medium text-base-content/80">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                <span>
                  Custom logo and agency primary brand color on all audits
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                <span>
                  Unbranded white-label client PDF exports &amp; executive
                  summaries
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                <span>
                  Custom confidentiality disclaimers &amp; report footer notes
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                <span>
                  10,000 keywords &amp; unlimited tracked brand domains
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/billing"
              className="btn btn-primary rounded-xl px-8 font-bold text-white shadow-lg shadow-primary/20 gap-2"
            >
              <span>Upgrade to Agency &amp; Scale</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                Agency White-Label & Client Reports
              </h1>
            </div>
            <p className="mt-1 text-xs text-base-content/60">
              Customize client audit deliverables with your agency branding,
              logo, colors, and executive disclaimers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </button>
        </div>

        {/* 2-Column Grid: Form Left, Live Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Branding Settings */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-base-300 bg-base-200/40 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Brand Assets &
                Identity
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Agency / Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Growth Agency"
                  className="input input-bordered input-sm w-full rounded-xl text-xs"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Agency Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://youragency.com/logo.png"
                  className="input input-bordered input-sm w-full rounded-xl text-xs"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Brand Primary Hex Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-9 w-12 rounded-xl cursor-pointer bg-transparent border-0"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full rounded-xl font-mono text-xs"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Custom Domain / Portal CNAME
                </label>
                <input
                  type="text"
                  placeholder="seo.youragency.com"
                  className="input input-bordered input-sm w-full rounded-xl text-xs"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Report Disclaimer / Footer
                </label>
                <textarea
                  rows={3}
                  className="textarea textarea-bordered textarea-sm w-full rounded-xl text-xs"
                  value={reportFooterNotes}
                  onChange={(e) => setReportFooterNotes(e.target.value)}
                />
              </div>

              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="btn btn-primary rounded-2xl w-full font-bold text-white shadow-md shadow-primary/20 gap-2 mt-2"
              >
                <Save className="h-4 w-4" />{" "}
                {saveMutation.isPending
                  ? "Saving Changes..."
                  : "Save Agency Branding"}
              </button>
            </div>
          </div>

          {/* Right Column: Live Client Deliverable Preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-base-content/70 px-2">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" /> Live Client Deliverable
                Preview
              </span>
              <span className="text-[11px] text-base-content/50">
                Confidential Client Audit
              </span>
            </div>

            {/* Printable Document Sheet */}
            <div
              id="white-label-report"
              className="rounded-3xl border border-base-300 bg-base-100 p-8 shadow-xl space-y-6 text-base-content"
              style={{ borderTop: `6px solid ${primaryColor}` }}
            >
              {/* Document Header */}
              <div className="flex items-center justify-between border-b border-base-300/80 pb-5">
                <div>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={companyName}
                      className="h-9 object-contain"
                    />
                  ) : (
                    <div
                      className="text-xl font-black tracking-tight"
                      style={{ color: primaryColor }}
                    >
                      {companyName || "Acme Growth Media"}
                    </div>
                  )}
                  <div className="text-[10px] uppercase font-bold tracking-widest text-base-content/50 mt-1">
                    Organic Performance Audit & Intelligence
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-base-content">
                    Date: {new Date().toLocaleDateString()}
                  </span>
                  <div className="text-[11px] text-base-content/60">
                    Target: client-domain.com
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Executive Performance Score
                </h3>
                <div className="rounded-2xl bg-base-200/50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div
                      className="text-2xl font-black"
                      style={{ color: primaryColor }}
                    >
                      92/100
                    </div>
                    <div className="text-[10px] font-bold text-base-content/60 uppercase">
                      SEO Health
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-600">
                      1,420
                    </div>
                    <div className="text-[10px] font-bold text-base-content/60 uppercase">
                      Ranked Terms
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">
                      8,920
                    </div>
                    <div className="text-[10px] font-bold text-base-content/60 uppercase">
                      Backlinks
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-indigo-600">
                      99.9%
                    </div>
                    <div className="text-[10px] font-bold text-base-content/60 uppercase">
                      Uptime
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Findings List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Key Strategic Findings
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 rounded-xl bg-base-200/30 p-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-base-content">
                        Technical Foundation:{" "}
                      </strong>
                      Zero critical crawl errors detected. Core Web Vitals meet
                      Google good thresholds.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl bg-base-200/30 p-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-base-content">
                        High-Intent Keywords:{" "}
                      </strong>
                      Identified 42 untapped high-intent clusters with low
                      keyword difficulty.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl bg-base-200/30 p-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-base-content">
                        Backlink Profile:{" "}
                      </strong>
                      Acquired 18 new referring domains in the past 30 days with
                      strong domain authority.
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Footer / Disclaimer */}
              <div className="border-t border-base-300 pt-4 text-[10px] text-base-content/50 text-center leading-relaxed">
                {reportFooterNotes}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

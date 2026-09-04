import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";
import { getBrandProfile, listBrandCompetitors } from "@/serverFunctions/brand-competitor";
import { getConversionReadiness } from "@/serverFunctions/conversion-readiness";
import { getAudienceTrustAudit } from "@/serverFunctions/audience-trust";

interface MyAnalysisArchiveProps {
  projectId: string;
}

export function MyAnalysisArchive({ projectId }: MyAnalysisArchiveProps) {
  const [activeTab, setActiveTab] = React.useState<"brand" | "competitors" | "ads">("brand");
  const [selectedReportForPrint, setSelectedReportForPrint] = React.useState<any | null>(null);

  const brandQuery = useQuery({
    queryKey: ["brandProfile", projectId],
    queryFn: () => getBrandProfile({ data: { projectId } }),
  });

  const competitorsQuery = useQuery({
    queryKey: ["brandCompetitors", projectId],
    queryFn: () => listBrandCompetitors({ data: { projectId } }),
  });

  const conversionAuditQuery = useQuery({
    queryKey: ["conversionReadiness", projectId],
    queryFn: () => getConversionReadiness({ data: {} }),
  });

  const trustAuditQuery = useQuery({
    queryKey: ["audienceTrustAudit", projectId],
    queryFn: () => getAudienceTrustAudit({ data: {} }),
  });

  const brand = brandQuery.data;
  const competitors = competitorsQuery.data ?? [];
  const conversionAudit = conversionAuditQuery.data;
  const trustAudit = trustAuditQuery.data;

  const handlePrintPdf = (reportData: any) => {
    setSelectedReportForPrint(reportData);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon icon="solar:folder-with-files-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-base font-black text-base-content">
              Intelligence Reports &amp; PDF Export Hub
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Access your historical Brand Audits, Competitor Intelligence Teardowns, and Ad-Readiness Reports.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handlePrintPdf({
              type: "Comprehensive Executive Summary",
              brand,
              conversionAudit,
              trustAudit,
              competitors,
            })
          }
          className="btn btn-primary rounded-2xl h-11 px-6 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <Icon icon="solar:printer-bold" className="h-4 w-4" />
          <span>Export Full PDF Dossier</span>
        </button>
      </div>

      {/* Categorized Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-base-300 pb-3">
        {[
          { id: "brand", label: "Brand Analysis & Ad Readiness", icon: "solar:shield-check-bold-duotone" },
          { id: "competitors", label: "Competitor Strategy Teardowns", icon: "solar:swords-bold-duotone" },
          { id: "ads", label: "Competitor Ads & Creative Angles", icon: "solar:videocamera-bold-duotone" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`btn btn-sm rounded-2xl text-xs font-bold gap-1.5 transition-all ${
              activeTab === tab.id
                ? "btn-primary text-white shadow-sm shadow-primary/20"
                : "btn-ghost text-base-content/70 hover:text-base-content"
            }`}
          >
            <Icon icon={tab.icon} className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRAND ANALYSIS & AD READINESS                                      */}
      {/* ========================================================================= */}
      {activeTab === "brand" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {conversionAudit ? (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm">
                    {conversionAudit.grade || "A"}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-base-content">
                      Conversion &amp; Ad Readiness Audit Scorecard
                    </h3>
                    <a
                      href={conversionAudit.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <span>{conversionAudit.targetUrl}</span>
                      <Icon icon="solar:arrow-right-up-linear" className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="badge badge-primary font-bold text-xs px-3 py-2.5">
                    Score: {conversionAudit.overallScore}/100
                  </span>
                  <span className="badge badge-outline text-xs font-mono font-bold">
                    Risk: {conversionAudit.adWastedSpendRisk.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 6 Sub-scores overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { label: "Credibility", score: conversionAudit.trustAndCredibilityScore },
                  { label: "CTA Clarity", score: conversionAudit.ctaAndOfferClarityScore },
                  { label: "Mobile Speed", score: conversionAudit.pageSpeedAndMobileScore },
                  { label: "Social Proof", score: conversionAudit.socialProofAndReviewsScore },
                  { label: "Form Friction", score: conversionAudit.frictionAndFormLengthScore },
                  { label: "Ad Pixels", score: conversionAudit.trackingPixelScore },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-base-200/40 border border-base-300/60 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-base-content/50 block">{item.label}</span>
                    <span className="text-base font-black font-mono text-base-content block">{item.score}/100</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-base-200">
                <span className="text-[11px] text-base-content/50 font-mono">
                  Audited: {new Date(conversionAudit.auditedAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintPdf({ type: "Brand Analysis Audit", conversionAudit, brand })}
                    className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5"
                  >
                    <Icon icon="solar:printer-bold" className="h-4 w-4" />
                    <span>Print PDF</span>
                  </button>
                  <Link
                    to="/p/$projectId/brand-analysis"
                    params={{ projectId }}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white gap-1.5"
                  >
                    <span>View Live Scorecard &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center space-y-3">
              <p className="text-xs text-base-content/60">No brand analysis generated yet.</p>
              <Link
                to="/p/$projectId/brand-analysis"
                params={{ projectId }}
                className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white"
              >
                Run Brand Analysis Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPETITOR STRATEGY TEARDOWNS                                      */}
      {/* ========================================================================= */}
      {activeTab === "competitors" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {competitors.length === 0 ? (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center space-y-3">
              <p className="text-xs text-base-content/60">No competitors added to directory yet.</p>
              <Link
                to="/p/$projectId/competitors"
                params={{ projectId }}
                className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white"
              >
                Go to Competitor Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-base-content">{comp.name || comp.domain}</span>
                      <span className="badge badge-neutral badge-xs font-mono">{comp.domain}</span>
                    </div>
                    {comp.notes && (
                      <p className="text-xs text-base-content/70 line-clamp-2 bg-base-200/40 p-2 rounded-xl">
                        {comp.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-base-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrintPdf({ type: "Competitor Strategy Teardown", competitor: comp, brand })}
                      className="btn btn-ghost btn-xs rounded-lg text-base-content/70 font-bold gap-1"
                    >
                      <Icon icon="solar:printer-bold" className="h-3.5 w-3.5" />
                      PDF
                    </button>
                    <Link
                      to="/p/$projectId/competitor-analysis"
                      params={{ projectId }}
                      search={{ domain: comp.domain }}
                      className="btn btn-primary btn-xs rounded-xl font-bold text-white gap-1"
                    >
                      <span>Analyze 1-on-1 &rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPETITOR ADS & CREATIVE INTELLIGENCE                             */}
      {/* ========================================================================= */}
      {activeTab === "ads" && (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-base-content">
                Competitor Ad Messaging &amp; Creative Angles
              </h3>
              <p className="text-xs text-base-content/60">
                Extracted value drivers, headline formulas, and offer structures from rival ad campaigns.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePrintPdf({ type: "Competitor Ads Dossier", brand, competitors })}
              className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5"
            >
              <Icon icon="solar:printer-bold" className="h-4 w-4" />
              <span>Print Ad Dossier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                competitor: "Top Industry Rival",
                angle: "Speed & Elimination of Manual Spreadsheets",
                headline: "Stop spending 10 hours a week on manual SEO audits. Let AI automate it.",
                cta: "Start 14-Day Free Trial",
                channels: ["Meta", "Google Search", "YouTube"],
              },
              {
                competitor: "Legacy Software Competitor",
                angle: "Cost Reduction / All-In-One Consolidation",
                headline: "Replace 5 expensive tools with 1 platform. Cut your software bill by 60%.",
                cta: "Calculate Your Savings",
                channels: ["LinkedIn", "Meta Ads"],
              },
            ].map((ad, idx) => (
              <div key={idx} className="rounded-2xl border border-base-300 bg-base-200/30 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base-content">{ad.competitor}</span>
                  <div className="flex gap-1">
                    {ad.channels.map((ch, cIdx) => (
                      <span key={cIdx} className="badge badge-xs badge-outline font-mono">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-base-100 p-3 rounded-xl border border-base-300/60 font-medium space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary block">Ad Copy Hook:</span>
                  <p className="font-bold text-base-content">&ldquo;{ad.headline}&rdquo;</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-base-content/70">
                  <span>Angle: <strong>{ad.angle}</strong></span>
                  <span className="badge badge-xs badge-neutral font-bold">{ad.cta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT-READY PDF TEMPLATE MODAL (HIDDEN ON SCREEN, VISIBLE IN PRINT)       */}
      {/* ========================================================================= */}
      {selectedReportForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white text-slate-900 p-8 z-[9999]">
          <div className="space-y-6 max-w-4xl mx-auto font-sans">
            {/* Report Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {BRAND_CONFIG.name} Intelligence Report
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  {selectedReportForPrint.type || "Executive Audit"} &bull; Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block">{brand?.brandName || "Active Brand"}</span>
                <span className="text-xs text-slate-500 font-mono">{brand?.websiteUrl || ""}</span>
              </div>
            </div>

            {/* Scorecard Box */}
            {conversionAudit && (
              <div className="rounded-2xl border-2 border-slate-200 p-5 space-y-4">
                <h2 className="text-lg font-black text-slate-900">Brand Credibility &amp; Ad-Readiness Scorecard</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold uppercase text-slate-500 block">Overall Score</span>
                    <span className="text-2xl font-black text-indigo-600">{conversionAudit.overallScore}/100</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold uppercase text-slate-500 block">Letter Grade</span>
                    <span className="text-2xl font-black text-emerald-600">{conversionAudit.grade}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold uppercase text-slate-500 block">Ad Spend Risk</span>
                    <span className="text-2xl font-black uppercase text-amber-600">{conversionAudit.adWastedSpendRisk}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {conversionAudit?.recommendedFixes && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">Priority Optimization Roadmap</h3>
                <div className="space-y-2">
                  {conversionAudit.recommendedFixes.map((fix: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-sm text-slate-900">{idx + 1}. {fix.title} ({fix.priority} Priority)</div>
                      <p className="text-slate-600 mt-1">{fix.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-slate-300 text-center text-xs text-slate-400">
              Confidential Client Report &bull; Powered by Skorvia Enterprise SEO &amp; Brand Intelligence Platform
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

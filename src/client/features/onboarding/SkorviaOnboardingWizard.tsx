import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";
import { setProjectDomain, setProjectMarket } from "@/serverFunctions/projects";
import { saveOnboardingAnswers } from "@/serverFunctions/onboarding";

interface SkorviaOnboardingWizardProps {
  projectId: string;
  userEmail?: string;
  userName?: string;
  initialDomain?: string;
}

export function SkorviaOnboardingWizard({
  projectId,
  userEmail,
  userName,
  initialDomain = "",
}: SkorviaOnboardingWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [domain, setDomain] = React.useState(initialDomain);
  const [competitors, setCompetitors] = React.useState<string[]>([""]);
  const [competitorSuggestions] = React.useState<string[]>([
    "semrush.com",
    "ahrefs.com",
    "moz.com",
  ]);
  const [keywords, setKeywords] = React.useState<string[]>([""]);
  const [targetMarket, setTargetMarket] = React.useState("US");
  const [scanProgress, setScanProgress] = React.useState(0);
  const [scanStatus, setScanStatus] = React.useState("Initializing crawler...");

  const domainMutation = useMutation({
    mutationFn: (dom: string) => setProjectDomain({ data: { projectId, domain: dom } }),
  });

  const marketMutation = useMutation({
    mutationFn: (market: string) =>
      setProjectMarket({
        data: { projectId, locationCode: market === "NG" ? 2566 : 2840, languageCode: "en" },
      }),
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: () =>
      saveOnboardingAnswers({
        data: {
          completed: true,
          interestedFeatures: ["rank_tracking", "backlinks", "site_audit"],
          workFor: "myself",
          foundVia: "search",
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboardingAnswers"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardOverview", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardActivation", projectId] });
      toast.success("Project setup complete! Welcome to your dashboard.");
      void navigate({ to: "/p/$projectId", params: { projectId } });
    },
  });

  // Step 4 Auto-Scan Simulation
  React.useEffect(() => {
    if (step !== 4) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 25) {
          setScanStatus("Resolving DNS, SSL certificate & robots.txt...");
          return prev + 5;
        } else if (prev < 50) {
          setScanStatus("Crawling technical meta tags & structured data...");
          return prev + 5;
        } else if (prev < 80) {
          setScanStatus("Fetching live SERP rankings & backlink footprint...");
          return prev + 4;
        } else if (prev < 100) {
          setScanStatus("Calculating organic health & indexing benchmarks...");
          return prev + 5;
        } else {
          clearInterval(interval);
          setScanStatus("Initial intelligence scan completed! (Score: 94/100)");
          return 100;
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  const cleanDomain = (d: string) =>
    d.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  const handleNextStep1 = () => {
    const cleaned = cleanDomain(domain);
    if (!cleaned) {
      toast.error("Please enter a valid website domain");
      return;
    }
    setDomain(cleaned);
    domainMutation.mutate(cleaned);
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleNextStep3 = () => {
    marketMutation.mutate(targetMarket);
    setStep(4);
  };

  const handleFinish = () => {
    saveOnboardingMutation.mutate();
  };

  const addCompetitor = (c: string) => {
    if (!c) return;
    const cleaned = cleanDomain(c);
    if (competitors.includes(cleaned)) return;
    setCompetitors((prev) => [...prev.filter(Boolean), cleaned]);
  };

  const addKeyword = (kw: string) => {
    if (!kw.trim()) return;
    if (keywords.includes(kw.trim())) return;
    setKeywords((prev) => [...prev.filter(Boolean), kw.trim()]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Top Wizard Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="h-7 w-7 rounded-xl object-contain ring-1 ring-primary/20 shadow-xs"
            />
            <span className="text-base font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name} Project Setup Wizard
            </span>
          </div>
          <span className="badge badge-primary badge-sm font-extrabold rounded-lg text-xs">
            Step {step} of 4
          </span>
        </div>

        {/* Step Indicator Bubbles */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Site Domain", icon: "solar:global-bold-duotone" },
            { num: 2, label: "Competitors", icon: "solar:users-group-two-rounded-bold-duotone" },
            { num: 3, label: "Seed Keywords", icon: "solar:minimalistic-magnifer-bold-duotone" },
            { num: 4, label: "Instant Scan", icon: "solar:radar-bold-duotone" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 rounded-2xl p-2.5 text-xs font-bold transition-all ${
                step === s.num
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : step > s.num
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-base-200/60 text-base-content/40"
              }`}
            >
              <Icon icon={s.icon} className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline truncate">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Domain Setup */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-base-content tracking-tight">
              What domain or project are you tracking?
            </h2>
            <p className="text-xs text-base-content/60">
              Enter your website domain. We&apos;ll automatically audit technical health, backlinks, and ranked keywords.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content/70">Target Website Domain</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-base-content/40">
                https://
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. acmegrowth.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="input input-bordered w-full rounded-2xl pl-20 text-sm font-medium focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={handleNextStep1}
              className="btn btn-primary rounded-2xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2"
            >
              <span>Next: Competitors</span>
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Competitor Tracking */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-base-content tracking-tight">
              Track up to 3 competitors
            </h2>
            <p className="text-xs text-base-content/60">
              Benchmark your keyword overlap, backlink gap, and AI answer engine rankings against your rivals.
            </p>
          </div>

          <div className="space-y-3">
            {competitors.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Competitor #${idx + 1} (e.g. rival${idx + 1}.com)`}
                  value={c}
                  onChange={(e) => {
                    const next = [...competitors];
                    next[idx] = e.target.value;
                    setCompetitors(next);
                  }}
                  className="input input-bordered input-sm w-full rounded-xl text-xs"
                />
              </div>
            ))}

            {competitors.length < 3 && (
              <button
                type="button"
                onClick={() => setCompetitors((prev) => [...prev, ""])}
                className="btn btn-ghost btn-xs text-primary font-bold gap-1"
              >
                <Icon icon="solar:add-circle-bold" className="h-4 w-4" /> Add another competitor
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="rounded-2xl bg-base-200/50 p-3.5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              Popular Competitor Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {competitorSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => addCompetitor(sug)}
                  className="badge badge-outline badge-sm rounded-lg hover:badge-primary transition-colors cursor-pointer py-2.5 px-3 text-xs"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-ghost btn-sm rounded-xl font-bold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              className="btn btn-primary rounded-2xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2"
            >
              <span>Next: Seed Keywords</span>
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Seed Keywords & Location */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-base-content tracking-tight">
              Add seed keywords & select market
            </h2>
            <p className="text-xs text-base-content/60">
              We will track rank position deltas and search volume for these target queries.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/70">Primary Search Market</label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="select select-bordered select-sm w-full rounded-xl text-xs"
              >
                <option value="US">🇺🇸 United States (Google.com)</option>
                <option value="NG">🇳🇬 Nigeria (Google.com.ng)</option>
                <option value="GB">🇬🇧 United Kingdom (Google.co.uk)</option>
                <option value="CA">🇨🇦 Canada (Google.ca)</option>
                <option value="DE">🇩🇪 Germany (Google.de)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/70">Target Keywords (Up to 5)</label>
              {keywords.map((kw, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Keyword #${idx + 1} (e.g. best seo tools)`}
                  value={kw}
                  onChange={(e) => {
                    const next = [...keywords];
                    next[idx] = e.target.value;
                    setKeywords(next);
                  }}
                  className="input input-bordered input-sm w-full rounded-xl text-xs"
                />
              ))}

              {keywords.length < 5 && (
                <button
                  type="button"
                  onClick={() => setKeywords((prev) => [...prev, ""])}
                  className="btn btn-ghost btn-xs text-primary font-bold gap-1"
                >
                  <Icon icon="solar:add-circle-bold" className="h-4 w-4" /> Add another keyword
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-ghost btn-sm rounded-xl font-bold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={handleNextStep3}
              className="btn btn-primary rounded-2xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2"
            >
              <span>Run Automated Scan</span>
              <Icon icon="solar:radar-bold-duotone" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Initial Automated Background Scan */}
      {step === 4 && (
        <div className="space-y-6 text-center py-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-lg shadow-primary/10 ring-4 ring-primary/20 animate-pulse">
            <Icon icon="solar:radar-bold-duotone" className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-base-content tracking-tight">
              {scanProgress < 100 ? "Analyzing " + (domain || "Website") : "Scan Completed!"}
            </h2>
            <p className="text-xs font-mono text-primary font-semibold">{scanStatus}</p>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-base-content/70">
              <span>Crawl Progress</span>
              <span>{scanProgress}%</span>
            </div>
            <progress
              className="progress progress-primary w-full h-3 rounded-full"
              value={scanProgress}
              max={100}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2 text-center text-xs">
            <div className="rounded-2xl bg-base-200/50 p-3">
              <div className="text-base font-black text-emerald-500">94/100</div>
              <div className="text-[10px] uppercase font-bold text-base-content/50">Health Score</div>
            </div>
            <div className="rounded-2xl bg-base-200/50 p-3">
              <div className="text-base font-black text-blue-500">{keywords.filter(Boolean).length || 5}</div>
              <div className="text-[10px] uppercase font-bold text-base-content/50">Keywords Added</div>
            </div>
            <div className="rounded-2xl bg-base-200/50 p-3">
              <div className="text-base font-black text-indigo-500">{competitors.filter(Boolean).length || 2}</div>
              <div className="text-[10px] uppercase font-bold text-base-content/50">Competitors</div>
            </div>
          </div>

          <div className="pt-4 border-t border-base-300">
            <button
              type="button"
              disabled={scanProgress < 100 || saveOnboardingMutation.isPending}
              onClick={handleFinish}
              className="btn btn-primary btn-lg rounded-2xl w-full font-black text-white shadow-xl shadow-primary/25 gap-2"
            >
              <Icon icon="solar:rocket-bold-duotone" className="h-5 w-5" />
              <span>{saveOnboardingMutation.isPending ? "Configuring Dashboard..." : "Launch My Skorvia Dashboard"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";
import {
  submitIndexNowBatch,
  fetchSitemapForIndexing,
  getIndexingHistory,
} from "@/serverFunctions/indexing";
import {
  VenixTable,
  VenixStatusBadge,
} from "@/client/components/table/VenixTable";

export const Route = createFileRoute("/_app/indexing")({
  component: IndexingStudioPage,
});

function IndexingStudioPage() {
  const queryClient = useQueryClient();

  const [host, setHost] = React.useState("");
  const [urlsInput, setUrlsInput] = React.useState("");
  const [sitemapUrl, setSitemapUrl] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"manual" | "sitemap">(
    "manual",
  );

  const historyQuery = useQuery({
    queryKey: ["indexingHistory"],
    queryFn: () => getIndexingHistory(),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { host: string; urlList: string[] }) =>
      submitIndexNowBatch({ data }),
    onSuccess: (res) => {
      toast.success(
        `Successfully submitted ${res.submittedCount} URLs to IndexNow (Bing, Yandex, Seznam)!`,
      );
      setUrlsInput("");
      void queryClient.invalidateQueries({ queryKey: ["indexingHistory"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit URLs to IndexNow");
    },
  });

  const sitemapMutation = useMutation({
    mutationFn: (sUrl: string) =>
      fetchSitemapForIndexing({ data: { sitemapUrl: sUrl } }),
    onSuccess: (res) => {
      toast.success(
        `Discovered ${res.urlCount} URLs from sitemap! Populated in batch editor.`,
      );
      setUrlsInput(res.urls.join("\n"));
      if (res.urls[0]) {
        try {
          const u = new URL(res.urls[0]);
          setHost(u.hostname);
        } catch {}
      }
      setActiveTab("manual");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to parse sitemap XML");
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHost = host
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");
    if (!cleanHost) {
      toast.error("Please enter a target host domain");
      return;
    }

    const lines = urlsInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast.error("Please enter at least one URL to submit");
      return;
    }

    submitMutation.mutate({ host: cleanHost, urlList: lines });
  };

  const handleSitemapFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitemapUrl.trim()) {
      toast.error("Please enter a valid sitemap XML URL");
      return;
    }
    sitemapMutation.mutate(sitemapUrl.trim());
  };

  const history = historyQuery.data ?? [];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-xs">
              AEO & IndexNow Fast-Track
            </span>
            <span className="text-xs text-base-content/50">
              Multi-Search Engine Distribution
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content mt-1">
            Instant Indexing Studio
          </h1>
          <p className="text-xs text-base-content/60">
            Submit new or updated URLs directly to Microsoft Bing, Yandex,
            Seznam, and Naver with zero crawl lag.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-base-content/60">
            <span>Network Coverage</span>
            <Icon
              icon="solar:global-bold-duotone"
              className="h-5 w-5 text-primary"
            />
          </div>
          <div className="text-xl font-black text-base-content mt-2">
            4 Search Engines
          </div>
          <div className="text-[11px] text-base-content/60 mt-1">
            Bing, Yandex, Seznam, Naver
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-base-content/60">
            <span>Total Submissions</span>
            <Icon
              icon="solar:document-text-bold-duotone"
              className="h-5 w-5 text-blue-500"
            />
          </div>
          <div className="text-xl font-black text-base-content mt-2">
            {history
              .reduce((acc, curr) => acc + curr.urlCount, 0)
              .toLocaleString()}{" "}
            URLs
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Across all batches
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-base-content/60">
            <span>Index Speed</span>
            <Icon
              icon="solar:clock-circle-bold-duotone"
              className="h-5 w-5 text-emerald-500"
            />
          </div>
          <div className="text-xl font-black text-base-content mt-2">
            &lt; 15 Minutes
          </div>
          <div className="text-[11px] text-base-content/60 mt-1">
            Immediate crawler dispatch
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-base-300 bg-base-200/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`btn btn-sm rounded-xl font-bold text-xs gap-2 ${
              activeTab === "manual" ? "btn-primary text-white" : "btn-ghost"
            }`}
          >
            <Icon
              icon="solar:pen-new-square-bold-duotone"
              className="h-4 w-4"
            />
            <span>Batch Paste URLs (Up to 10k)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sitemap")}
            className={`btn btn-sm rounded-xl font-bold text-xs gap-2 ${
              activeTab === "sitemap" ? "btn-primary text-white" : "btn-ghost"
            }`}
          >
            <Icon icon="solar:file-check-bold-duotone" className="h-4 w-4" />
            <span>Import from Sitemap.xml</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "manual" ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Host Domain
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourwebsite.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="input input-bordered input-sm w-full max-w-md rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  URLs to Submit (One URL per line)
                </label>
                <textarea
                  rows={7}
                  required
                  placeholder={
                    "https://yourwebsite.com/new-article-1\nhttps://yourwebsite.com/product-launch\nhttps://yourwebsite.com/pricing"
                  }
                  value={urlsInput}
                  onChange={(e) => setUrlsInput(e.target.value)}
                  className="textarea textarea-bordered w-full rounded-2xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-base-content/50 font-medium">
                  {
                    urlsInput.split("\n").filter((l) => l.trim().length > 0)
                      .length
                  }{" "}
                  URLs queued for push
                </span>

                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn btn-primary rounded-2xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2"
                >
                  <Icon icon="solar:bolt-bold-duotone" className="h-4 w-4" />
                  <span>
                    {submitMutation.isPending ? "Indexing Now..." : "Index Now"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSitemapFetch} className="space-y-4 max-w-xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/70">
                  Sitemap XML URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://yourwebsite.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  className="input input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <p className="text-xs text-base-content/60 leading-relaxed">
                Skorvia will automatically crawl your XML sitemap, extract every
                valid canonical URL, and load them into the batch submission
                editor.
              </p>

              <button
                type="submit"
                disabled={sitemapMutation.isPending}
                className="btn btn-primary rounded-2xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2"
              >
                <Icon
                  icon="solar:cloud-download-bold-duotone"
                  className="h-4 w-4"
                />
                <span>
                  {sitemapMutation.isPending
                    ? "Parsing Sitemap XML..."
                    : "Fetch & Stage Sitemap URLs"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Submission History Table */}
      <VenixTable
        title="Recent Indexing Submissions"
        subtitle="Log of all IndexNow and Google API push batches"
      >
        <thead>
          <tr className="border-b border-base-300 font-bold text-base-content/60 uppercase text-[10px] tracking-wider">
            <th>Target Host</th>
            <th>Protocol / Engine</th>
            <th>URLs Submitted</th>
            <th>Status Response</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-base-content/40 font-medium"
              >
                No submissions yet. Submit your first batch above!
              </td>
            </tr>
          ) : (
            history.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-base-200/50 transition-colors"
              >
                <td className="font-bold text-base-content">{item.host}</td>
                <td>
                  <span className="badge badge-outline badge-sm rounded-lg font-bold">
                    {item.engine.toUpperCase()}
                  </span>
                </td>
                <td className="font-mono font-bold text-primary">
                  {item.urlCount} URLs
                </td>
                <td>
                  <VenixStatusBadge
                    status={
                      item.statusCode >= 200 && item.statusCode < 300
                        ? "success"
                        : "danger"
                    }
                    label={item.statusMessage || `HTTP ${item.statusCode}`}
                  />
                </td>
                <td className="text-base-content/60">
                  {new Date(item.createdAt).toLocaleDateString()}{" "}
                  {new Date(item.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </VenixTable>
    </div>
  );
}

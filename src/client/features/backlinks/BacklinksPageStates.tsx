import { ShieldAlert } from "lucide-react";

export function BacklinksLoadingState() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3 p-4">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-64 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="skeleton h-8 w-60" />
          <div className="skeleton h-80 w-full" />
        </div>
      </div>
    </div>
  );
}

export function BacklinksErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string | null;
  onRetry: () => void;
}) {
  const isDataForSeoError =
    errorMessage?.includes("DataForSEO") ||
    errorMessage?.includes("DATAFORSEO_AUTH_FAILED") ||
    errorMessage?.includes("credentials are not configured");

  return (
    <section className="rounded-2xl border border-error/30 bg-error/5 p-6 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-error/10 p-2.5 text-error shrink-0 mt-0.5">
          <ShieldAlert className="size-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h2 className="text-base font-bold text-base-content">
            {isDataForSeoError
              ? "DataForSEO API Setup Required"
              : "Could not load backlinks"}
          </h2>
          <p className="text-sm text-base-content/80 max-w-2xl leading-relaxed">
            {errorMessage ?? "Please try again in a moment."}
          </p>
          {isDataForSeoError && (
            <p className="text-xs text-base-content/60 pt-1">
              To query live backlinks, please provide your DataForSEO API credentials in Admin Dashboard &rarr; Settings &rarr; API Settings, or configure <code className="font-mono text-xs bg-base-300/60 px-1 py-0.5 rounded">DATAFORSEO_API_KEY</code>.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1 pl-11">
        <button className="btn btn-sm btn-primary rounded-xl px-4" onClick={onRetry}>
          Retry Query
        </button>
      </div>
    </section>
  );
}

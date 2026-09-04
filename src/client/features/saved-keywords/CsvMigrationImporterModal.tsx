import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

export interface ParsedMigrationKeyword {
  keyword: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
  intent?: string;
}

export function parseMigrationCsv(csvContent: string): {
  detectedSource: "Ahrefs" | "Semrush" | "Moz" | "SE Ranking" | "Generic CSV";
  keywords: ParsedMigrationKeyword[];
} {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { detectedSource: "Generic CSV", keywords: [] };
  }

  // Parse header line
  const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

  let detectedSource: "Ahrefs" | "Semrush" | "Moz" | "SE Ranking" | "Generic CSV" = "Generic CSV";
  if (headers.includes("keyword difficulty") || headers.includes("difficulty (%)")) {
    detectedSource = "Semrush";
  } else if (headers.includes("kd") || headers.includes("parent keyword")) {
    detectedSource = "Ahrefs";
  } else if (headers.includes("difficulty") && headers.includes("opportunity")) {
    detectedSource = "Moz";
  } else if (headers.includes("search volume") && headers.includes("competition")) {
    detectedSource = "SE Ranking";
  }

  // Find column indices
  const kwIndex = headers.findIndex((h) => ["keyword", "keyword phrase", "query", "search term", "keywords"].includes(h));
  const volIndex = headers.findIndex((h) => ["volume", "search volume", "avg. monthly searches", "monthly searches"].includes(h));
  const kdIndex = headers.findIndex((h) => ["kd", "keyword difficulty", "difficulty", "difficulty (%)"].includes(h));
  const cpcIndex = headers.findIndex((h) => ["cpc", "cpc (usd)", "cost per click"].includes(h));
  const intentIndex = headers.findIndex((h) => ["intent", "search intent"].includes(h));

  const finalKwIndex = kwIndex >= 0 ? kwIndex : 0;

  const keywords: ParsedMigrationKeyword[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(",");
    if (rawCols.length <= finalKwIndex) continue;

    const term = rawCols[finalKwIndex]?.replace(/^["']|["']$/g, "").trim();
    if (!term || term.length < 2) continue;

    const vol = volIndex >= 0 ? Number(rawCols[volIndex]?.replace(/[^0-9.]/g, "")) : undefined;
    const kd = kdIndex >= 0 ? Number(rawCols[kdIndex]?.replace(/[^0-9.]/g, "")) : undefined;
    const cpc = cpcIndex >= 0 ? Number(rawCols[cpcIndex]?.replace(/[^0-9.]/g, "")) : undefined;
    const intent = intentIndex >= 0 ? rawCols[intentIndex]?.replace(/^["']|["']$/g, "").trim() : undefined;

    keywords.push({
      keyword: term,
      volume: Number.isFinite(vol) ? vol : undefined,
      difficulty: Number.isFinite(kd) ? kd : undefined,
      cpc: Number.isFinite(cpc) ? cpc : undefined,
      intent: intent || undefined,
    });
  }

  return { detectedSource, keywords };
}

export function CsvMigrationImporterModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (keywords: ParsedMigrationKeyword[]) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState<{
    detectedSource: string;
    keywords: ParsedMigrationKeyword[];
  } | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const result = parseMigrationCsv(content);
        setParsed(result);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (!parsed || parsed.keywords.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(parsed.keywords);
      toast.success(`Successfully imported ${parsed.keywords.length} keywords from ${parsed.detectedSource}!`);
      onClose();
    } catch {
      toast.error("Failed to import keywords. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl rounded-3xl border border-base-300 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="solar:file-download-bold" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-base-content">Universal CSV Migration Importer</h3>
              <p className="text-xs text-base-content/60">Import keyword lists directly from Ahrefs, Semrush, Moz, or custom CSVs.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center space-y-3 bg-base-200/30">
          <Icon icon="solar:cloud-upload-bold" className="h-10 w-10 text-primary mx-auto" />
          <div className="text-xs text-base-content/80 font-medium">
            <label className="font-bold text-primary cursor-pointer hover:underline">
              <span>Click to browse</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
            </label>{" "}
            or drag and drop your exported CSV file here.
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="badge badge-sm badge-ghost text-[10px] font-bold">Ahrefs CSV</span>
            <span className="badge badge-sm badge-ghost text-[10px] font-bold">Semrush CSV</span>
            <span className="badge badge-sm badge-ghost text-[10px] font-bold">Moz CSV</span>
            <span className="badge badge-sm badge-ghost text-[10px] font-bold">SE Ranking</span>
          </div>
        </div>

        {/* Preview Container */}
        {parsed && (
          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base-content">Detected Format:</span>
                <span className="badge badge-primary badge-sm font-black">{parsed.detectedSource}</span>
              </div>
              <div className="font-bold text-emerald-600">
                {parsed.keywords.length} Valid Keywords Ready
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {parsed.keywords.slice(0, 5).map((kw, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-base-100 border border-base-300/80 flex items-center justify-between">
                  <span className="font-bold text-base-content">{kw.keyword}</span>
                  <div className="flex items-center gap-2 text-base-content/60">
                    {kw.volume != null && <span>{kw.volume.toLocaleString()} vol</span>}
                    {kw.difficulty != null && <span>KD {kw.difficulty}%</span>}
                  </div>
                </div>
              ))}
              {parsed.keywords.length > 5 && (
                <div className="text-[10px] text-center text-base-content/50 pt-1">
                  + {parsed.keywords.length - 5} more keywords ready to import...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl font-bold">
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsed || parsed.keywords.length === 0 || isImporting}
            onClick={handleConfirmImport}
            className="btn btn-primary btn-sm rounded-xl font-black text-white shadow-md shadow-primary/25"
          >
            {isImporting ? "Importing Keywords..." : `Import ${parsed?.keywords.length || 0} Keywords &rarr;`}
          </button>
        </div>
      </div>
    </div>
  );
}

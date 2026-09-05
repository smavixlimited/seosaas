import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface FileUploadDropzoneProps {
  label: string;
  description?: string;
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMb?: number;
  folder?: string;
  previewHeightClass?: string;
  aspectRatio?: "square" | "wide" | "auto";
}

export function FileUploadDropzone({
  label,
  description,
  currentUrl,
  onUploadComplete,
  onRemove,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon",
  maxSizeMb = 5,
  folder = "branding",
  previewHeightClass = "h-32",
  aspectRatio = "auto",
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File size exceeds maximum limit of ${maxSizeMb}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      setUploadProgress(60);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          errJson.error || `Upload failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as { success: boolean; url: string };
      setUploadProgress(100);
      onUploadComplete(data.url);
      toast.success(`${label} uploaded successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [currentUrl]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-base-content block">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-base-content/60">{description}</p>
          )}
        </div>
        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] font-bold text-error hover:underline flex items-center gap-1"
          >
            <Icon icon="solar:trash-bin-trash-bold" className="h-3.5 w-3.5" />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {currentUrl ? (
        <div className="relative rounded-2xl border border-base-300 bg-base-200/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`rounded-xl border border-base-300 bg-base-100 p-2 flex items-center justify-center overflow-hidden shrink-0 ${
                aspectRatio === "square"
                  ? "w-16 h-16"
                  : aspectRatio === "wide"
                    ? "w-28 h-16"
                    : "w-20 h-16"
              }`}
            >
              {!imageError ? (
                <img
                  src={currentUrl}
                  alt={label}
                  onError={() => setImageError(true)}
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-amber-500">
                  <Icon icon="solar:gallery-bold-duotone" className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-base-content block truncate">
                {currentUrl.split("/").pop() || label}
              </span>
              <span
                className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${imageError ? "text-amber-500" : "text-emerald-600"}`}
              >
                <Icon
                  icon={
                    imageError
                      ? "solar:info-circle-bold"
                      : "solar:check-circle-bold"
                  }
                  className="h-3 w-3"
                />
                <span>
                  {imageError
                    ? "Asset linked (preview pending)"
                    : "Uploaded & Active"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-xs rounded-lg font-bold gap-1"
            >
              <Icon icon="solar:refresh-circle-bold" className="h-3.5 w-3.5" />
              <span>Change Image</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center gap-2 ${previewHeightClass} ${
            isDragging
              ? "border-primary bg-primary/10 shadow-inner"
              : "border-base-300 bg-base-200/30 hover:border-primary/50 hover:bg-base-200/60"
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 w-full max-w-xs flex flex-col items-center">
              <span className="loading loading-spinner loading-md text-primary" />
              <div className="text-xs font-bold text-base-content">
                Uploading to R2... {uploadProgress}%
              </div>
              <progress
                className="progress progress-primary w-full"
                value={uploadProgress || 20}
                max="100"
              />
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <Icon
                  icon="solar:cloud-upload-bold-duotone"
                  className="h-5 w-5"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-base-content">
                  <span className="text-primary font-black">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </div>
                <div className="text-[10px] text-base-content/50 mt-0.5">
                  Supports PNG, SVG, JPG, WebP, ICO (Max {maxSizeMb}MB)
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            void handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}

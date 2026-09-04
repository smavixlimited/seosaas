import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { getAdminBranding, updateAdminBranding } from "@/serverFunctions/system-settings";
import { FileUploadDropzone } from "@/client/components/FileUploadDropzone";
import type { BrandingSettings } from "@/services/system-settings.service";

export const Route = createFileRoute("/_admin/admin/settings/branding")({
  component: AdminBrandingSettingsPage,
});

function AdminBrandingSettingsPage() {
  const queryClient = useQueryClient();

  const brandingQuery = useQuery({
    queryKey: ["adminBranding"],
    queryFn: () => getAdminBranding(),
  });

  const [form, setForm] = React.useState<BrandingSettings>({
    siteTitle: "Skorvia",
    tagline: "Enterprise SEO, AEO Visibility & Content Intelligence SaaS",
    lightLogoUrl: "/logo.png",
    darkLogoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    supportEmail: "support@skorvia.com",
    publicRegistrationEnabled: true,
    metaDescription: "All-in-one commercial SEO, Local Business, AI Visibility & Content SaaS.",
    metaKeywords: "SEO SaaS, AEO Search Optimization, Keyword Tracking, Backlinks, Rank Tracker, Skorvia",
  });

  React.useEffect(() => {
    if (brandingQuery.data) {
      setForm(brandingQuery.data);
    }
  }, [brandingQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: BrandingSettings) => updateAdminBranding({ data }),
    onSuccess: (updated) => {
      toast.success("Global site branding and registration settings saved successfully!");
      setForm(updated);
      void queryClient.invalidateQueries({ queryKey: ["adminBranding"] });
      void queryClient.invalidateQueries({ queryKey: ["publicBranding"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save branding settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const isLoading = brandingQuery.isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Global Site Branding &amp; Asset Studio
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload high-resolution logos, browser favicons, and configure SEO metadata with verified R2 persistence.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending || isLoading}
          className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
          <span>{updateMutation.isPending ? "Saving..." : "Save Branding"}</span>
        </button>
      </div>

      {/* Public Registration Control Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon
                icon={form.publicRegistrationEnabled ? "solar:user-check-bold-duotone" : "solar:user-block-bold-duotone"}
                className={`h-5 w-5 ${form.publicRegistrationEnabled ? "text-emerald-500" : "text-amber-500"}`}
              />
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Public User Registration</h5>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  form.publicRegistrationEnabled
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {form.publicRegistrationEnabled ? "REGISTRATIONS OPEN" : "INVITE ONLY"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              When enabled, anyone can create an account at <code className="text-primary font-mono text-[11px]">/sign-up</code>. When disabled, public sign-ups are locked.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={form.publicRegistrationEnabled}
              onChange={(e) => setForm({ ...form, publicRegistrationEnabled: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* Visual Identity & File Upload Dropzones */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icon icon="solar:gallery-bold-duotone" className="h-5 w-5 text-primary" />
            <span>Brand Assets &amp; Cloudflare R2 Uploads</span>
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">Drag and drop brand assets directly. Images are uploaded to Cloudflare R2 bucket with fallback.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Light Logo */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Light Theme Logo</label>
              <span className="text-[10px] text-slate-400">Header logo on white/light backgrounds (PNG/SVG)</span>
            </div>

            <FileUploadDropzone
              folder="brand/logos"
              label="Upload Light Logo"
              currentUrl={form.lightLogoUrl || undefined}
              onUploadComplete={(url: string) => setForm({ ...form, lightLogoUrl: url })}
              onRemove={() => setForm({ ...form, lightLogoUrl: "" })}
            />
          </div>

          {/* Dark Logo */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Dark Theme Logo</label>
              <span className="text-[10px] text-slate-400">Header logo on dark/navy backgrounds (PNG/SVG)</span>
            </div>

            <FileUploadDropzone
              folder="brand/logos"
              label="Upload Dark Logo"
              currentUrl={form.darkLogoUrl || undefined}
              onUploadComplete={(url: string) => setForm({ ...form, darkLogoUrl: url })}
              onRemove={() => setForm({ ...form, darkLogoUrl: "" })}
            />
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Browser Favicon</label>
              <span className="text-[10px] text-slate-400">Browser tab icon (32x32 / 64x64 ICO or PNG)</span>
            </div>

            <FileUploadDropzone
              folder="brand/favicons"
              label="Upload Favicon"
              currentUrl={form.faviconUrl || undefined}
              onUploadComplete={(url: string) => setForm({ ...form, faviconUrl: url })}
              onRemove={() => setForm({ ...form, faviconUrl: "" })}
            />
          </div>
        </div>
      </div>

      {/* Brand Identity & Metadata Form */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icon icon="solar:global-bold-duotone" className="h-5 w-5 text-indigo-500" />
            <span>Platform Metadata &amp; Global Contact</span>
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Site Title / Brand Name</label>
            <input
              type="text"
              value={form.siteTitle}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Support / Contact Email</label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Brand Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Default Meta Description</label>
            <textarea
              rows={2}
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending || isLoading}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
          >
            {updateMutation.isPending ? "Saving..." : "Save Branding"}
          </button>
        </div>
      </div>
    </div>
  );
}

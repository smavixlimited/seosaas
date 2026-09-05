import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  listBrandCompetitors,
  syncBrandCompetitors,
  updateBrandCompetitor,
  deleteBrandCompetitor,
} from "@/serverFunctions/brand-competitor";

interface CompetitorsDirectoryProps {
  projectId: string;
}

export function CompetitorsDirectory({ projectId }: CompetitorsDirectoryProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingCompetitor, setEditingCompetitor] = React.useState<any | null>(
    null,
  );
  const [deletingCompetitor, setDeletingCompetitor] = React.useState<
    any | null
  >(null);

  // Add/Edit Form State
  const [formData, setFormData] = React.useState({
    domain: "",
    name: "",
    websiteUrl: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    notes: "",
  });

  const competitorsQuery = useQuery({
    queryKey: ["brandCompetitors", projectId],
    queryFn: () => listBrandCompetitors({ data: { projectId } }),
  });

  const competitors = competitorsQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: async () => {
      const cleanDomain = formData.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "");
      if (!cleanDomain) throw new Error("Domain is required");

      return syncBrandCompetitors({
        data: {
          projectId,
          competitors: [
            {
              domain: cleanDomain,
              name: formData.name.trim() || cleanDomain,
              websiteUrl:
                formData.websiteUrl.trim() || `https://${cleanDomain}`,
              socialHandles: {
                instagram: formData.instagram.trim() || undefined,
                linkedin: formData.linkedin.trim() || undefined,
                twitter: formData.twitter.trim() || undefined,
                facebook: formData.facebook.trim() || undefined,
              },
              notes: formData.notes.trim() || undefined,
            },
          ],
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["brandCompetitors", projectId],
      });
      toast.success("Competitor added successfully!");
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add competitor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCompetitor) return;
      const cleanDomain = formData.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "");

      return updateBrandCompetitor({
        data: {
          projectId,
          competitorId: editingCompetitor.id,
          data: {
            domain: cleanDomain,
            name: formData.name.trim() || cleanDomain,
            websiteUrl: formData.websiteUrl.trim() || `https://${cleanDomain}`,
            socialHandles: {
              instagram: formData.instagram.trim() || undefined,
              linkedin: formData.linkedin.trim() || undefined,
              twitter: formData.twitter.trim() || undefined,
              facebook: formData.facebook.trim() || undefined,
            },
            notes: formData.notes.trim() || undefined,
          },
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["brandCompetitors", projectId],
      });
      toast.success("Competitor updated successfully!");
      setEditingCompetitor(null);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update competitor");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (competitorId: string) => {
      return deleteBrandCompetitor({
        data: { projectId, competitorId },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["brandCompetitors", projectId],
      });
      toast.success("Competitor removed from directory");
      setDeletingCompetitor(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete competitor");
    },
  });

  const resetForm = () => {
    setFormData({
      domain: "",
      name: "",
      websiteUrl: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      notes: "",
    });
  };

  const openEditModal = (comp: any) => {
    setEditingCompetitor(comp);
    setFormData({
      domain: comp.domain || "",
      name: comp.name || "",
      websiteUrl: comp.websiteUrl || "",
      instagram: comp.socialHandles?.instagram || "",
      linkedin: comp.socialHandles?.linkedin || "",
      twitter: comp.socialHandles?.twitter || "",
      facebook: comp.socialHandles?.facebook || "",
      notes: comp.notes || "",
    });
  };

  const filteredCompetitors = competitors.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.domain.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 h-4 w-4"
          />
          <input
            type="text"
            placeholder="Search competitors by domain or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full rounded-2xl pl-10 h-10 text-xs focus:border-primary bg-base-100"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary rounded-2xl h-10 px-5 text-xs font-bold text-white shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
          <span>Add Competitor</span>
        </button>
      </div>

      {/* Loading state */}
      {competitorsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-3xl" />
          ))}
        </div>
      ) : filteredCompetitors.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-10 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              className="h-7 w-7"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-base-content">
              {searchQuery
                ? "No matching competitors found"
                : "No competitors added yet"}
            </h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
              Add your industry rivals to track keyword overlaps, monitor
              backlink shifts, and run 1-on-1 strategy teardowns.
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn btn-primary rounded-2xl btn-sm font-bold text-xs text-white shadow-sm"
            >
              Add First Competitor
            </button>
          )}
        </div>
      ) : (
        /* Competitor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitors.map((comp) => {
            const hasSocials =
              comp.socialHandles?.instagram ||
              comp.socialHandles?.linkedin ||
              comp.socialHandles?.twitter ||
              comp.socialHandles?.facebook;

            return (
              <div
                key={comp.id}
                className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Avatar & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-base-200/80 border border-base-300 flex items-center justify-center font-black text-sm text-primary uppercase shadow-2xs">
                        {comp.name
                          ? comp.name.slice(0, 2)
                          : comp.domain.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-base-content leading-snug">
                          {comp.name || comp.domain}
                        </h4>
                        <a
                          href={comp.websiteUrl || `https://${comp.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <span>{comp.domain}</span>
                          <Icon
                            icon="solar:arrow-right-up-linear"
                            className="h-3 w-3"
                          />
                        </a>
                      </div>
                    </div>

                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
                      >
                        <Icon icon="solar:menu-dots-bold" className="h-4 w-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-20 menu p-1.5 shadow-xl bg-base-100 rounded-2xl w-36 border border-base-300 text-xs"
                      >
                        <li>
                          <button
                            onClick={() => openEditModal(comp)}
                            className="gap-2 font-semibold"
                          >
                            <Icon
                              icon="solar:pen-bold"
                              className="h-3.5 w-3.5"
                            />
                            Edit Details
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => setDeletingCompetitor(comp)}
                            className="text-error gap-2 font-semibold hover:bg-error/10"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="h-3.5 w-3.5"
                            />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {comp.notes ? (
                    <p className="text-xs text-base-content/70 line-clamp-2 bg-base-200/40 p-2.5 rounded-xl border border-base-300/60 font-medium">
                      {comp.notes}
                    </p>
                  ) : null}

                  {/* Social Handles Badges */}
                  {hasSocials ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {comp.socialHandles?.instagram && (
                        <a
                          href={
                            comp.socialHandles.instagram.startsWith("http")
                              ? comp.socialHandles.instagram
                              : `https://instagram.com/${comp.socialHandles.instagram.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-sm badge-outline gap-1 text-[10px] text-pink-600 dark:text-pink-400 hover:bg-pink-500/10"
                        >
                          <Icon icon="solar:camera-bold" className="h-3 w-3" />
                          IG
                        </a>
                      )}
                      {comp.socialHandles?.linkedin && (
                        <a
                          href={
                            comp.socialHandles.linkedin.startsWith("http")
                              ? comp.socialHandles.linkedin
                              : `https://linkedin.com/company/${comp.socialHandles.linkedin}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-sm badge-outline gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Icon icon="solar:case-bold" className="h-3 w-3" />
                          LinkedIn
                        </a>
                      )}
                      {comp.socialHandles?.twitter && (
                        <a
                          href={
                            comp.socialHandles.twitter.startsWith("http")
                              ? comp.socialHandles.twitter
                              : `https://x.com/${comp.socialHandles.twitter.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-sm badge-outline gap-1 text-[10px] hover:bg-base-200"
                        >
                          <Icon icon="solar:hashtag-bold" className="h-3 w-3" />
                          X
                        </a>
                      )}
                      {comp.socialHandles?.facebook && (
                        <a
                          href={
                            comp.socialHandles.facebook.startsWith("http")
                              ? comp.socialHandles.facebook
                              : `https://facebook.com/${comp.socialHandles.facebook}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-sm badge-outline gap-1 text-[10px] text-blue-500 hover:bg-blue-500/10"
                        >
                          <Icon
                            icon="solar:users-group-rounded-bold"
                            className="h-3 w-3"
                          />
                          FB
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Bottom Compare Action Button */}
                <div className="pt-3 border-t border-base-300">
                  <Link
                    to="/p/$projectId/competitor-analysis"
                    params={{ projectId }}
                    search={{ domain: comp.domain }}
                    className="btn btn-primary btn-outline btn-sm w-full rounded-2xl font-bold text-xs gap-1.5 hover:text-white"
                  >
                    <Icon
                      icon="solar:swords-bold-duotone"
                      className="h-4 w-4"
                    />
                    <span>Run Head-to-Head Comparison &rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT COMPETITOR MODAL                                               */}
      {/* ========================================================================= */}
      {(isAddModalOpen || editingCompetitor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-base-content tracking-tight">
                {editingCompetitor
                  ? "Edit Competitor Profile"
                  : "Add New Competitor"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCompetitor(null);
                  resetForm();
                }}
                className="btn btn-ghost btn-sm btn-square rounded-xl"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingCompetitor) {
                  updateMutation.mutate();
                } else {
                  addMutation.mutate();
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/80">
                    Domain / Website *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. competitor.com"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                    className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/80">
                    Brand / Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Competitor Inc"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-base-content/80 block">
                  Social Media Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Instagram URL / @handle"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="input input-bordered input-xs w-full rounded-xl text-xs bg-base-200/40"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn Company URL"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    className="input input-bordered input-xs w-full rounded-xl text-xs bg-base-200/40"
                  />
                  <input
                    type="text"
                    placeholder="X / Twitter Handle"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter: e.target.value })
                    }
                    className="input input-bordered input-xs w-full rounded-xl text-xs bg-base-200/40"
                  />
                  <input
                    type="text"
                    placeholder="Facebook Page URL"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                    className="input input-bordered input-xs w-full rounded-xl text-xs bg-base-200/40"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/80">
                  Strategy Notes
                </label>
                <textarea
                  placeholder="Key threats, product overlap, or pricing notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="textarea textarea-bordered w-full rounded-2xl text-xs bg-base-200/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCompetitor(null);
                    resetForm();
                  }}
                  className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white shadow-sm"
                >
                  {addMutation.isPending || updateMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : editingCompetitor ? (
                    "Save Changes"
                  ) : (
                    "Add Competitor"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deletingCompetitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
              <Icon icon="solar:trash-bin-trash-bold" className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-base-content">
                Delete Competitor?
              </h3>
              <p className="text-xs text-base-content/60 mt-1">
                Are you sure you want to remove{" "}
                <strong className="text-base-content">
                  {deletingCompetitor.domain}
                </strong>{" "}
                from your directory?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCompetitor(null)}
                className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingCompetitor.id)}
                className="btn btn-error btn-sm rounded-xl font-bold text-xs text-white shadow-sm"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

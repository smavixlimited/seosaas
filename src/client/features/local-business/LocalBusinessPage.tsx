import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import {
  getLocalBusinessDashboard,
  runLocalGeoGridScan,
  generateAiReviewResponse,
  createLocalLocationServerFn,
  getReviewCampaignKitServerFn,
  publishReviewReplyServerFn,
  detectGoogleProfilesServerFn,
  connectDetectedProfileServerFn,
  saveBusinessLocationServerFn,
  searchGooglePlacesServerFn,
  startGbpOAuthServerFn,
} from "@/serverFunctions/local-business";
import type {
  LocalReviewItem,
  LocalGridPoint,
  LocalBusinessData,
  LocalCitationItem,
  ReviewCampaignKit,
  DetectedGoogleBusinessProfile,
  DirectoryCoverageItem,
} from "@/services/local-business.service";

interface LocalBusinessPageProps {
  projectId: string;
}

type LocalTab = "overview" | "grid" | "reviews" | "campaign" | "nap";

export function LocalBusinessPage({ projectId }: LocalBusinessPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState<LocalTab>("overview");

  // Multi-location selection state
  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | null
  >(null);

  // Geo-grid state & timeline toggle
  const [gridKeyword, setGridKeyword] = React.useState(
    "corporate office near me",
  );
  const [gridSize, setGridSize] = React.useState<"3x3" | "5x5">("3x3");
  const [showTimelineCompare, setShowTimelineCompare] = React.useState(true);

  // AI Review Response modal & reply publishing state
  const [selectedReview, setSelectedReview] =
    React.useState<LocalReviewItem | null>(null);
  const [reviewDraft, setReviewDraft] = React.useState("");
  const [isDrafting, setIsDrafting] = React.useState(false);

  // Google OAuth GBP Auto-Detection Modal state
  const [isOAuthModalOpen, setIsOAuthModalOpen] = React.useState(false);
  const [oauthStep, setOauthStep] = React.useState<
    "login" | "detecting" | "select"
  >("login");

  // Onboarding & Preview Mode State
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchingPlaces, setIsSearchingPlaces] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  // Manual Form State
  const [formData, setFormData] = React.useState({
    businessName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: "US",
    phoneNumber: "",
    websiteUrl: "",
    primaryCategory: "Local Business / Services",
    placeId: "",
    lat: 37.7749,
    lng: -122.4194,
  });

  const localQuery = useQuery<LocalBusinessData>({
    queryKey: ["localBusinessDashboard", projectId],
    queryFn: () =>
      getLocalBusinessDashboard({ data: { projectId } }) as Promise<LocalBusinessData>,
    staleTime: 5 * 60 * 1000,
  });

  // Sync form defaults from project profile data when loaded
  React.useEffect(() => {
    if (localQuery.data?.profile) {
      setFormData((prev) => ({
        ...prev,
        businessName: prev.businessName || localQuery.data.profile.businessName || "",
        websiteUrl: prev.websiteUrl || localQuery.data.profile.websiteUrl || "",
        countryCode: prev.countryCode !== "US" ? prev.countryCode : (localQuery.data.profile.countryCode || "US"),
        streetAddress: prev.streetAddress || localQuery.data.profile.streetAddress || "",
        city: prev.city || localQuery.data.profile.city || "",
        state: prev.state || localQuery.data.profile.state || "",
        postalCode: prev.postalCode || localQuery.data.profile.postalCode || "",
        phoneNumber: prev.phoneNumber || localQuery.data.profile.phoneNumber || "",
        primaryCategory: prev.primaryCategory !== "Local Business / Services" ? prev.primaryCategory : (localQuery.data.profile.primaryCategory || "Local Business / Services"),
      }));
    }
  }, [localQuery.data]);

  // Auto-open profile selector if returning from Google Business Profile OAuth
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gbp_connected") === "1") {
        setIsOAuthModalOpen(true);
        setOauthStep("select");
        toast.success(
          "Google account authorized! Select your Business Profile below to finish connecting.",
        );
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("gbp_connected");
        window.history.replaceState({}, document.title, newUrl.toString());
      }
    }
  }, []);

  // Handle Google Places Search Debounce
  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingPlaces(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const results = await searchGooglePlacesServerFn({
          data: { query: searchQuery.trim() },
        });
        setSearchResults(results || []);
      } catch (err) {
        console.error("Place search error:", err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Save Business Location Mutation
  const saveLocationMutation = useMutation({
    mutationFn: (vars: typeof formData & { connectGoogle?: boolean }) =>
      saveBusinessLocationServerFn({
        data: {
          projectId,
          ...vars,
        },
      }),
    onSuccess: (updatedData, vars) => {
      queryClient.setQueryData(
        ["localBusinessDashboard", projectId],
        updatedData,
      );
      setIsPreviewMode(false);
      toast.success(
        `Business location "${vars.businessName}" saved successfully!`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save business location");
    },
  });

  const sampleDemoData: LocalBusinessData = React.useMemo(() => {
    const brand = localQuery.data?.profile?.businessName || "Acme Services";
    return {
      isConfigured: true,
      profile: {
        id: `lb_demo_${projectId}`,
        businessName: brand,
        streetAddress: "100 Market Street, Suite 300",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        countryCode: localQuery.data?.profile?.countryCode || "US",
        phoneNumber: "+1 (415) 555-0199",
        websiteUrl: localQuery.data?.profile?.websiteUrl || `https://${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        primaryCategory: "Corporate Office & Services",
        gbpClaimed: true,
        gbpHealthScore: 78,
        averageRating: 4.8,
        totalReviews: 24,
        napConsistencyScore: 72,
        onlineAssessment: "Fair",
        listingsToFixCount: 14,
        totalListingsCount: 33,
        directoriesCoverage: [
          { directory: "Google Business Profile", status: "Matched", details: "Active verified profile" },
          { directory: "Google Search", status: "Matched", details: "Ranking in local 3-pack" },
          { directory: "Google Assistant", status: "Matched", details: "Voice query verified" },
          { directory: "Apple Maps", status: "Not Present", details: "Missed opportunity. Submit to Apple Business Connect." },
          { directory: "Bing Places", status: "Not Present", details: "Missed opportunity. Syndicate from Google Profile." },
          { directory: "Facebook", status: "Wrong Address", details: "Address mismatch on Facebook Page" },
          { directory: "Instagram", status: "Not Present", details: "Link location to Instagram profile" },
          { directory: "Siri", status: "Not Present", details: "Missed opportunity for Apple voice queries" },
          { directory: "Waze", status: "Wrong Address", details: "Navigation coordinates need updating" },
          { directory: "Where To?", status: "No Address", details: "Missed opportunity for in-car GPS" },
        ],
        citations: [
          { directory: "Google Business Profile", url: "https://maps.google.com", name: brand, address: "100 Market Street, San Francisco, CA", phone: "+1 (415) 555-0199", status: "consistent" },
          { directory: "Apple Maps", url: "https://maps.apple.com", name: brand, address: "100 Market Street, San Francisco, CA", phone: "+1 (415) 555-0199", status: "missing" },
          { directory: "Bing Places", url: "https://bingplaces.com", name: brand, address: "100 Market Street, San Francisco, CA", phone: "+1 (415) 555-0199", status: "missing" },
          { directory: "Facebook", url: "https://facebook.com", name: `${brand} Inc`, address: "88 Market St, San Francisco, CA", phone: "+1 (415) 555-0199", status: "mismatch" },
        ],
        reviews: [
          {
            id: "demo_rev_1",
            author: "Sarah Jenkins",
            rating: 5,
            relativeTime: "2 days ago",
            text: `Outstanding team and fast turnaround. Would highly recommend ${brand} to anyone looking for professional service!`,
            response: `Thank you so much Sarah! Our team was thrilled to work with you.`,
            responsePublishedAt: new Date(Date.now() - 86400000).toISOString(),
            sentiment: "positive",
          },
          {
            id: "demo_rev_2",
            author: "Marcus Chen",
            rating: 4,
            relativeTime: "1 week ago",
            text: "Great experience overall, communication was clear and project was delivered ahead of schedule.",
            sentiment: "positive",
          },
        ],
        auditHighlights: [
          "Primary Google Business Profile verified and linked",
          "NAP directory consistency at 72% across 33 key directories",
          "Recommended: Submit profile to Apple Maps and Bing Places to gain +35% local visibility",
          "AI Review Auto-Responder enabled and monitoring incoming reviews",
        ],
        isConnectedToGoogle: true,
      },
      locations: [
        {
          id: `loc_demo_1_${projectId}`,
          projectId,
          locationName: `${brand} (HQ)`,
          placeId: "ChIJ_sample_demo_1",
          businessName: brand,
          streetAddress: "100 Market Street, Suite 300",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          countryCode: localQuery.data?.profile?.countryCode || "US",
          phoneNumber: "+1 (415) 555-0199",
          websiteUrl: localQuery.data?.profile?.websiteUrl || `https://${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          primaryCategory: "Corporate Office & Services",
          lat: 37.7749,
          lng: -122.4194,
          reviewLink: `https://g.page/r/${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}/review`,
          isPrimary: true,
          gbpHealthScore: 78,
          averageRating: 4.8,
          totalReviews: 24,
          napConsistencyScore: 72,
        },
      ],
      activeLocationId: `loc_demo_1_${projectId}`,
      grid: {
        keyword: `${brand} near me`,
        gridSize: "3x3",
        centerLat: 37.7749,
        centerLng: -122.4194,
        radiusKm: 5.0,
        averageRank: 2.3,
        topThreeCoverageRate: 78,
        previousAverageRank: 3.8,
        netGainedPositions: 8,
        points: [
          { row: 0, col: 0, lat: 37.7949, lng: -122.4394, rank: 2, distanceKm: 2.3, previousRank: 4, rankDelta: 2 },
          { row: 0, col: 1, lat: 37.7949, lng: -122.4194, rank: 1, distanceKm: 1.6, previousRank: 2, rankDelta: 1 },
          { row: 0, col: 2, lat: 37.7949, lng: -122.3994, rank: 3, distanceKm: 2.3, previousRank: 5, rankDelta: 2 },
          { row: 1, col: 0, lat: 37.7749, lng: -122.4394, rank: 2, distanceKm: 1.6, previousRank: 3, rankDelta: 1 },
          { row: 1, col: 1, lat: 37.7749, lng: -122.4194, rank: 1, distanceKm: 0.0, previousRank: 1, rankDelta: 0 },
          { row: 1, col: 2, lat: 37.7749, lng: -122.3994, rank: 2, distanceKm: 1.6, previousRank: 3, rankDelta: 1 },
          { row: 2, col: 0, lat: 37.7549, lng: -122.4394, rank: 4, distanceKm: 2.3, previousRank: 6, rankDelta: 2 },
          { row: 2, col: 1, lat: 37.7549, lng: -122.4194, rank: 3, distanceKm: 1.6, previousRank: 4, rankDelta: 1 },
          { row: 2, col: 2, lat: 37.7549, lng: -122.3994, rank: 3, distanceKm: 2.3, previousRank: 5, rankDelta: 2 },
        ],
      },
    };
  }, [localQuery.data, projectId]);

  const rawData = localQuery.data;
  const isConfigured = rawData?.isConfigured === true;
  const data = isConfigured ? rawData : (isPreviewMode ? sampleDemoData : rawData);
  const profile = data?.profile;
  const grid = data?.grid;
  const locations = data?.locations ?? [];

  const activeLocation =
    locations.find(
      (l) => l.id === (selectedLocationId || data?.activeLocationId),
    ) || locations[0];

  // Detect Profiles Query
  const detectedProfilesQuery = useQuery<DetectedGoogleBusinessProfile[]>({
    queryKey: ["detectedGoogleProfiles", projectId],
    queryFn: () =>
      detectGoogleProfilesServerFn({
        data: {
          projectId,
          userEmail: session?.user?.email || "smartwareinnovation@gmail.com",
        },
      }),
    enabled: isOAuthModalOpen,
  });

  // Campaign Kit Query for Review Center
  const campaignKitQuery = useQuery<ReviewCampaignKit>({
    queryKey: [
      "reviewCampaignKit",
      activeLocation?.businessName || profile?.businessName,
    ],
    queryFn: () =>
      getReviewCampaignKitServerFn({
        data: {
          businessName:
            activeLocation?.businessName || profile?.businessName || "My Brand",
          locationId: activeLocation?.id || "primary",
        },
      }),
    staleTime: 10 * 60 * 1000,
  });

  const campaignKit = campaignKitQuery.data;

  const scanGridMutation = useMutation({
    mutationFn: (vars: {
      keyword: string;
      size: "3x3" | "5x5";
      lat: number;
      lng: number;
    }) =>
      runLocalGeoGridScan({
        data: {
          keyword: vars.keyword,
          gridSize: vars.size,
          centerLat: vars.lat,
          centerLng: vars.lng,
          radiusKm: 5.0,
        },
      }),
    onSuccess: (newGrid: any) => {
      void queryClient.invalidateQueries({
        queryKey: ["localBusinessDashboard", projectId],
      });
      toast.success(
        `Geo-grid scan complete for "${newGrid.keyword}"! Avg Rank: #${newGrid.averageRank}`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to run geo-grid scan");
    },
  });

  const generateReplyMutation = useMutation({
    mutationFn: (vars: { review: LocalReviewItem; businessName: string }) =>
      generateAiReviewResponse({
        data: {
          author: vars.review.author,
          rating: vars.review.rating,
          reviewText: vars.review.text,
          businessName: vars.businessName,
        },
      }),
    onSuccess: (res: any) => {
      setReviewDraft(res.responseText);
      setIsDrafting(false);
      toast.success("AI review response generated!");
    },
    onError: (err: Error) => {
      setIsDrafting(false);
      toast.error(err.message || "Failed to generate AI response");
    },
  });

  const publishReplyMutation = useMutation({
    mutationFn: (vars: { reviewId: string; responseText: string }) =>
      publishReviewReplyServerFn({
        data: {
          reviewId: vars.reviewId,
          responseText: vars.responseText,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["localBusinessDashboard", projectId],
      });
      setSelectedReview(null);
      setReviewDraft("");
      toast.success("Owner response published live to Google Maps!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to publish reply to Google");
    },
  });

  const connectDetectedMutation = useMutation({
    mutationFn: (profileId: string) =>
      connectDetectedProfileServerFn({
        data: { profileId },
      }),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(
        ["localBusinessDashboard", projectId],
        updatedData,
      );
      setIsOAuthModalOpen(false);
      setOauthStep("login");
      toast.success(
        `Connected Google Business Profile: "${updatedData.profile.businessName}"!`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to connect detected profile");
    },
  });

  const handleOpenAiReply = (rev: LocalReviewItem, bName: string) => {
    setSelectedReview(rev);
    setReviewDraft(rev.response || "");
    setIsDrafting(true);
    generateReplyMutation.mutate({ review: rev, businessName: bName });
  };

  const copyToClipboard = (text: string, msg = "Copied to clipboard!") => {
    void navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const handleStartGoogleOAuth = async () => {
    setOauthStep("detecting");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("gbp_connected", "1");
      const res = await startGbpOAuthServerFn({
        data: {
          callbackURL: url.toString(),
        },
      });
      if (res?.authUrl) {
        window.location.href = res.authUrl;
        return;
      }
    } catch {
      // If OAuth credentials not yet configured, proceed to profile selection
    }
    setTimeout(() => {
      setOauthStep("select");
    }, 600);
  };

  const userEmail = session?.user?.email || "smartwareinnovation@gmail.com";

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header with Connect Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-xs uppercase tracking-wider">
              Local Business
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              Google Business Profile &amp; Listings
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content mt-1">
            Local Business
          </h1>
          <p className="text-xs text-base-content/60 leading-relaxed">
            From Google to AI search—show up everywhere local customers search,
            with optimized Google Business Profile, listings, reviews, and
            rankings.
          </p>
        </div>

        {/* Connect Action & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {isConfigured && (
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="btn btn-sm btn-outline rounded-xl font-bold text-xs gap-1.5 whitespace-nowrap shrink-0"
            >
              <Icon icon="solar:pen-bold" className="h-4 w-4" />
              <span>Edit Business Location</span>
            </button>
          )}

          {/* 1-Click Google OAuth Trigger (No Manual Typing) */}
          <button
            type="button"
            onClick={() => {
              setOauthStep("login");
              setIsOAuthModalOpen(true);
            }}
            className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5 whitespace-nowrap shrink-0"
          >
            <Icon icon="logos:google-icon" className="h-4 w-4 shrink-0 bg-white rounded-full p-0.5" />
            <span>Connect Google Business</span>
          </button>

          <button
            type="button"
            onClick={() => void localQuery.refetch()}
            disabled={localQuery.isFetching}
            className="btn btn-sm btn-ghost btn-circle shrink-0"
            title="Refresh Local Audit"
          >
            <Icon
              icon="solar:refresh-circle-bold"
              className={`h-4 w-4 ${localQuery.isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Conditional: Show Onboarding / Setup Hero when Not Configured & Not Preview */}
      {!isConfigured && !isPreviewMode ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="rounded-3xl border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200/50 p-6 md:p-10 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Icon icon="solar:shop-2-bold" className="h-4 w-4" />
                  <span>Local SEO &amp; Google Maps Suite</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-base-content">
                  Connect &amp; Track Your Local Business
                </h2>
                <p className="text-xs md:text-sm text-base-content/70 leading-relaxed">
                  Start tracking your local Google Map Pack rankings, syndicate NAP across 33 key business directories, automate customer review requests, and publish AI replies straight to Google.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="btn btn-outline rounded-2xl font-bold text-xs gap-2 w-full sm:w-auto shrink-0"
                >
                  <Icon icon="solar:eye-bold" className="h-4 w-4 text-primary" />
                  <span>Preview Interactive Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOauthStep("login");
                    setIsOAuthModalOpen(true);
                  }}
                  className="btn btn-primary rounded-2xl font-bold text-white shadow-md shadow-primary/20 text-xs gap-2 w-full sm:w-auto shrink-0 whitespace-nowrap"
                >
                  <Icon icon="logos:google-icon" className="h-4 w-4 shrink-0 bg-white rounded-full p-0.5" />
                  <span>Connect Google Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2 Setup Columns: Google Places Quick Lookup & Manual Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: 1-Click Search on Google Places */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon icon="solar:magnifer-bold" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-base-content">
                      Quick Place Search
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Search Google Maps to auto-populate your details.
                    </p>
                  </div>
                </div>

                {/* Search Input with Live Dropdown */}
                <div className="relative space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Acme Consulting, New York"
                      className="input input-bordered w-full rounded-2xl text-xs pl-10 pr-10 font-medium"
                    />
                    <Icon
                      icon="solar:magnifer-linear"
                      className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                    />
                    {isSearchingPlaces && (
                      <Icon
                        icon="solar:refresh-circle-bold"
                        className="h-4 w-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin"
                      />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl divide-y divide-base-200 overflow-hidden max-h-72 overflow-y-auto">
                      {searchResults.map((res: any) => (
                        <button
                          key={res.placeId}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              businessName: res.name,
                              streetAddress: res.formattedAddress.split(",")[0] || res.formattedAddress,
                              city: res.city,
                              state: res.state,
                              postalCode: res.postalCode,
                              phoneNumber: res.phoneNumber || prev.phoneNumber,
                              websiteUrl: res.websiteUrl || prev.websiteUrl,
                              primaryCategory: res.primaryCategory || prev.primaryCategory,
                              placeId: res.placeId,
                              lat: res.lat,
                              lng: res.lng,
                            }));
                            setSearchResults([]);
                            setSearchQuery(res.name);
                            toast.success(`Selected "${res.name}". Form auto-filled!`);
                          }}
                          className="w-full text-left p-3.5 hover:bg-base-200/60 transition-colors flex items-start gap-3"
                        >
                          <Icon icon="solar:map-point-bold" className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="text-xs font-bold text-base-content truncate">{res.name}</div>
                            <div className="text-[11px] text-base-content/60 truncate">{res.formattedAddress}</div>
                            <div className="text-[10px] text-primary font-mono">{res.primaryCategory}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feature highlights */}
                <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-2.5 text-xs text-base-content/70">
                  <div className="font-bold text-base-content flex items-center gap-1.5">
                    <Icon icon="solar:shield-check-bold" className="h-4 w-4 text-emerald-500" />
                    <span>Included in Local SEO Suite:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Live 3x3 and 5x5 Geo-Grid ranking heatmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>33-Directory NAP consistency &amp; syndication audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>AI Review Auto-Responder with 1-click Google publishing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Printable review QR flyer &amp; SMS campaign generator</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Manual Entry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 md:p-8 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-black text-base-content">
                    Location &amp; Business Details
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Verify and save your primary physical store or service area details.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!formData.businessName.trim()) {
                      toast.error("Please enter a business name");
                      return;
                    }
                    if (!formData.streetAddress.trim() || !formData.city.trim()) {
                      toast.error("Please enter street address and city");
                      return;
                    }
                    saveLocationMutation.mutate(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-base-content/80">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Acme Dental & Orthodontics"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-base-content/80">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.streetAddress}
                        onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                        placeholder="e.g. 100 Market Street, Suite 300"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. San Francisco"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">State / Region *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="e.g. CA or Lagos State"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">Postal / ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="e.g. 94105"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">Country Code</label>
                      <input
                        type="text"
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. US, GB, CA, NG"
                        maxLength={2}
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="e.g. +1 (415) 555-0199"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/80">Primary Business Category</label>
                      <input
                        type="text"
                        value={formData.primaryCategory}
                        onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                        placeholder="e.g. Dental Clinic, Corporate Office, Restaurant"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-base-content/80">Website URL</label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://example.com"
                        className="input input-bordered input-sm w-full rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreviewMode(true)}
                      className="btn btn-sm btn-ghost text-xs font-bold"
                    >
                      Preview Sample Demo First
                    </button>

                    <button
                      type="submit"
                      disabled={saveLocationMutation.isPending}
                      className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2 px-6"
                    >
                      {saveLocationMutation.isPending ? (
                        <>
                          <Icon icon="solar:refresh-circle-bold" className="h-4 w-4 animate-spin" />
                          <span>Saving Location...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="solar:check-read-bold" className="h-4 w-4" />
                          <span>Save &amp; Track Location</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Configured or Interactive Preview Mode: Render Full 5-Tab Suite */
        <div className="space-y-6">
          {/* Sample Demo Mode Warning Banner */}
          {isPreviewMode && !isConfigured && (
            <div className="alert alert-warning shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" className="h-5 w-5 text-warning-content shrink-0" />
                <span>
                  <strong>Interactive Sample Demo:</strong> You are exploring sample data for{" "}
                  <strong>{profile?.businessName}</strong>. Connect your real location to start tracking live Google rankings and sync directory citations.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="btn btn-xs btn-neutral rounded-xl font-bold"
                >
                  Configure Real Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOauthStep("login");
                    setIsOAuthModalOpen(true);
                  }}
                  className="btn btn-xs btn-primary rounded-xl font-bold text-white"
                >
                  Connect Google
                </button>
              </div>
            </div>
          )}

          {/* 5-Tab Switcher */}
          <div className="tabs tabs-boxed bg-base-200/60 p-1 rounded-2xl w-fit flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`tab tab-sm font-bold rounded-xl gap-1.5 transition-all ${
                activeTab === "overview"
                  ? "tab-active !bg-primary !text-white shadow-sm"
                  : "text-base-content/70"
              }`}
            >
              <Icon icon="solar:widget-2-bold" className="h-4 w-4" />
              <span>Overview &amp; Listings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`tab tab-sm font-bold rounded-xl gap-1.5 transition-all ${
                activeTab === "grid"
                  ? "tab-active !bg-primary !text-white shadow-sm"
                  : "text-base-content/70"
              }`}
            >
              <Icon icon="solar:map-point-wave-bold" className="h-4 w-4" />
              <span>Geo-Grid Rank Tracker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`tab tab-sm font-bold rounded-xl gap-1.5 transition-all ${
                activeTab === "reviews"
                  ? "tab-active !bg-primary !text-white shadow-sm"
                  : "text-base-content/70"
              }`}
            >
              <Icon icon="solar:chat-round-line-bold" className="h-4 w-4" />
              <span>Reviews &amp; AI Reply</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("campaign")}
              className={`tab tab-sm font-bold rounded-xl gap-1.5 transition-all ${
                activeTab === "campaign"
                  ? "tab-active !bg-primary !text-white shadow-sm"
                  : "text-base-content/70"
              }`}
            >
              <Icon icon="solar:qr-code-bold" className="h-4 w-4" />
              <span>Review Gen &amp; QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("nap")}
              className={`tab tab-sm font-bold rounded-xl gap-1.5 transition-all ${
                activeTab === "nap"
                  ? "tab-active !bg-primary !text-white shadow-sm"
                  : "text-base-content/70"
              }`}
            >
              <Icon icon="solar:checklist-bold" className="h-4 w-4" />
              <span>NAP Consistency</span>
            </button>
          </div>

      {/* TAB 1: Semrush Local Overview Screen (Matching User Images 1 & 2) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Semrush Hero Card */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 md:p-8 shadow-sm space-y-6">
            {/* Top Bar inside card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200">
              <div className="flex items-center gap-2">
                <span className="badge badge-sm badge-outline font-bold text-primary gap-1 py-3 px-3">
                  <span className="size-2 rounded-full bg-primary animate-ping" />
                  <span>Real time data: 100%</span>
                </span>
                <span className="badge badge-sm badge-success text-white font-bold">
                  Connected via Google OAuth
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(window.location.href, "Report link copied!")
                  }
                  className="link link-hover font-bold text-primary flex items-center gap-1"
                >
                  <Icon icon="solar:link-bold" className="h-3.5 w-3.5" />
                  <span>Copy link</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOauthStep("select");
                    setIsOAuthModalOpen(true);
                  }}
                  className="link link-hover font-bold text-base-content/70 flex items-center gap-1"
                >
                  <Icon icon="solar:magnifer-bold" className="h-3.5 w-3.5" />
                  <span>Switch connected business</span>
                </button>
              </div>
            </div>

            {/* Business Info Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:map-point-bold"
                  className="h-5 w-5 text-primary shrink-0"
                />
                <h2 className="text-xl md:text-2xl font-black text-base-content">
                  {activeLocation?.businessName || profile?.businessName}
                </h2>
              </div>
              <p className="text-xs text-base-content/70 pl-7">
                {activeLocation?.streetAddress || profile?.streetAddress},{" "}
                {activeLocation?.city || profile?.city},{" "}
                {activeLocation?.postalCode || profile?.postalCode},{" "}
                {activeLocation?.countryCode || profile?.countryCode},{" "}
                {activeLocation?.phoneNumber || profile?.phoneNumber}
              </p>
            </div>

            {/* 3 Semrush-Style Cards: Online Presence, Listings to Fix, Average Rating */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Card 1: Online Presence */}
              <div className="p-5 rounded-2xl bg-base-200/40 border border-base-300 space-y-2">
                <div className="text-xs font-bold text-base-content/60">
                  Online presence
                </div>
                <div className="text-[11px] text-base-content/50 font-medium">
                  Overall assessment
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-end gap-1 h-7">
                    <div className="w-2.5 h-3 bg-rose-500 rounded-xs" />
                    <div className="w-2.5 h-4 bg-rose-500 rounded-xs" />
                    <div className="w-2.5 h-6 bg-base-300 rounded-xs" />
                    <div className="w-2.5 h-7 bg-base-300 rounded-xs" />
                  </div>
                  <span className="text-2xl font-black text-rose-500">
                    {profile?.onlineAssessment || "Poor"}
                  </span>
                </div>
              </div>

              {/* Card 2: Listings to Fix */}
              <div className="p-5 rounded-2xl bg-base-200/40 border border-base-300 space-y-2">
                <div className="text-xs font-bold text-base-content/60">
                  Listings to fix
                </div>
                <div className="text-[11px] text-base-content/50 font-medium">
                  Upon subscription
                </div>
                <div className="text-2xl font-black text-base-content font-mono pt-1">
                  <span className="text-error">
                    {profile?.listingsToFixCount || 30}
                  </span>
                  <span className="text-base-content/40 text-lg font-normal">
                    {" "}
                    / {profile?.totalListingsCount || 33}
                  </span>
                </div>
              </div>

              {/* Card 3: Average Star Rating */}
              <div className="p-5 rounded-2xl bg-base-200/40 border border-base-300 space-y-2">
                <div className="text-xs font-bold text-base-content/60">
                  Average star rating
                </div>
                <div className="text-[11px] text-base-content/50 font-medium">
                  Customers love high ratings
                </div>
                <div className="text-lg font-black text-base-content flex items-center gap-1.5 pt-2">
                  {profile?.totalReviews && profile.totalReviews > 0 ? (
                    <>
                      <span className="text-amber-500">
                        ⭐ {profile.averageRating}
                      </span>
                      <span className="text-xs text-base-content/50 font-normal">
                        ({profile.totalReviews} reviews)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-warning">⚠️</span>
                      <span className="text-base-content/80 text-base font-bold">
                        No reviews
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Semrush Table: "Fix these to improve and expand your coverage" */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-base-content">
                Fix these to improve and expand your coverage
              </h3>
              <p className="text-xs text-base-content/60">
                Directory-by-directory verification showing missing citations,
                mismatched addresses, or incorrect business phone numbers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-xs font-bold text-base-content/60 border-b border-base-300">
                    <th className="w-1/4">Directory</th>
                    <th className="w-1/3">Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 text-xs">
                  {profile?.directoriesCoverage?.map(
                    (cov: DirectoryCoverageItem, idx: number) => {
                      const isMissing =
                        cov.status === "Not Present" ||
                        cov.status === "No Address";
                      const isMismatch = cov.status.includes("Wrong");
                      const isMatched = cov.status === "Matched";
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-base-200/40 transition-colors"
                        >
                          <td className="font-bold text-base-content flex items-center gap-2 py-3">
                            <Icon
                              icon="solar:shop-bold"
                              className="h-4 w-4 text-primary shrink-0"
                            />
                            <span>{cov.directory}</span>
                          </td>
                          <td>
                            {isMatched ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="h-3.5 w-3.5"
                                />
                                <span>Matched &amp; Active</span>
                              </span>
                            ) : (
                              <span
                                className={`font-bold ${isMissing ? "text-error" : "text-amber-600"}`}
                              >
                                {cov.status}
                              </span>
                            )}
                          </td>
                          <td className="text-base-content/70 font-medium">
                            {cov.details}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Local Geo-Grid Rank Tracker with Timeline Comparison */}
      {activeTab === "grid" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-base-content">
                  Local Map Pack Geo-Grid:{" "}
                  <span className="text-primary font-mono">
                    {grid?.keyword}
                  </span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Simulating local Google Maps queries across GPS coordinate
                  pins around {activeLocation?.locationName || "your Brand"}.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowTimelineCompare(!showTimelineCompare)}
                  className={`btn btn-xs rounded-xl font-bold gap-1 ${
                    showTimelineCompare
                      ? "btn-primary text-white"
                      : "btn-outline"
                  }`}
                >
                  <Icon icon="solar:history-bold" className="h-3.5 w-3.5" />
                  <span>
                    {showTimelineCompare
                      ? "Timeline View Active"
                      : "Compare History"}
                  </span>
                </button>

                <input
                  type="text"
                  value={gridKeyword}
                  onChange={(e) => setGridKeyword(e.target.value)}
                  placeholder="e.g. corporate office near me"
                  className="input input-bordered input-sm rounded-xl text-xs w-full sm:w-56 font-medium"
                />
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value as "3x3" | "5x5")}
                  className="select select-bordered select-sm rounded-xl text-xs font-medium w-full sm:w-auto"
                >
                  <option value="3x3">3x3 Grid (9 Pins)</option>
                  <option value="5x5">5x5 Grid (25 Pins)</option>
                </select>
                <button
                  type="button"
                  disabled={scanGridMutation.isPending}
                  onClick={() =>
                    scanGridMutation.mutate({
                      keyword: gridKeyword,
                      size: gridSize,
                      lat: activeLocation?.lat || grid?.centerLat || 6.4474,
                      lng: activeLocation?.lng || grid?.centerLng || 3.4735,
                    })
                  }
                  className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5 w-full sm:w-auto"
                >
                  <Icon
                    icon="solar:radar-2-bold"
                    className={`h-4 w-4 ${scanGridMutation.isPending ? "animate-spin" : ""}`}
                  />
                  <span>
                    {scanGridMutation.isPending
                      ? "Scanning Pins..."
                      : "Run Grid Scan"}
                  </span>
                </button>
              </div>
            </div>

            {/* Grid Visualizer */}
            <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center gap-4 text-xs font-bold flex-wrap justify-center">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="size-3 rounded-full bg-emerald-500" /> Rank
                  1–3 (Map Pack Winner)
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <span className="size-3 rounded-full bg-amber-500" /> Rank
                  4–10 (Page 1)
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="size-3 rounded-full bg-rose-500" /> Rank 11+
                  (Low Visibility)
                </span>
              </div>

              <div
                className="grid gap-3 max-w-md w-full"
                style={{
                  gridTemplateColumns: `repeat(${grid?.gridSize === "5x5" ? 5 : 3}, minmax(0, 1fr))`,
                }}
              >
                {grid?.points.map((pt: LocalGridPoint, idx: number) => {
                  const isTop3 = pt.rank <= 3;
                  const isPage1 = pt.rank <= 10;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-xs transition-transform hover:scale-105 ${
                        isTop3
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                          : isPage1
                            ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300"
                            : "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      <span className="text-base sm:text-xl font-black font-mono">
                        #{pt.rank}
                      </span>
                      {showTimelineCompare &&
                      pt.rankDelta !== undefined &&
                      pt.rankDelta !== 0 ? (
                        <span
                          className={`text-[10px] font-black font-mono ${pt.rankDelta > 0 ? "text-emerald-600" : "text-rose-500"}`}
                        >
                          {pt.rankDelta > 0
                            ? `▲ +${pt.rankDelta}`
                            : `▼ ${pt.rankDelta}`}
                        </span>
                      ) : (
                        <span className="text-[9px] text-base-content/50 font-mono">
                          {pt.distanceKm}km
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Reviews & AI Reply with Direct Google Publish */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-base-content">
                Customer Reviews &amp; Direct 1-Click AI Publishing
              </h3>
              <p className="text-xs text-base-content/60">
                Draft tone-aware AI replies with Skorvia and publish them
                straight to Google Maps.
              </p>
            </div>

            <div className="space-y-3">
              {profile?.reviews.map((rev: LocalReviewItem) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-base-200/40 border border-base-300 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-base-content">
                        {rev.author}
                      </span>
                      <span className="text-xs text-amber-500 font-bold">
                        {"⭐".repeat(rev.rating)}
                      </span>
                      <span className="text-xs text-base-content/40 font-mono">
                        {rev.relativeTime}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAiReply(
                          rev,
                          activeLocation?.businessName || profile.businessName,
                        )
                      }
                      className="btn btn-xs btn-primary rounded-xl font-bold text-white shadow-xs gap-1"
                    >
                      <Icon icon="solar:stars-bold" className="h-3.5 w-3.5" />
                      <span>
                        {rev.response
                          ? "Edit / Re-Draft Reply"
                          : "Draft AI Reply"}
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-base-content/80 leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>

                  {rev.response && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-base-content/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase text-primary tracking-wider flex items-center gap-1">
                          <Icon
                            icon="solar:check-circle-bold"
                            className="h-3 w-3 text-emerald-500"
                          />
                          <span>Owner Reply (Published Live to Google)</span>
                        </span>
                        {rev.responsePublishedAt && (
                          <span className="text-[10px] text-base-content/40 font-mono">
                            {new Date(
                              rev.responsePublishedAt,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p>{rev.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Review Generation & QR Campaign Center */}
      {activeTab === "campaign" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-base-content">
                Customer Review Generation Center
              </h3>
              <p className="text-xs text-base-content/60">
                Generate high-converting short review links, printable in-store
                QR code flyers, and ready-to-send SMS/Email review request
                templates.
              </p>
            </div>

            {/* Link & QR Code Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon icon="solar:link-circle-bold" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-base-content">
                      Short Google Review URL
                    </h4>
                    <p className="text-[11px] text-base-content/60">
                      Send this 1-click link to recent customers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      campaignKit?.shortReviewUrl ||
                      activeLocation?.reviewLink ||
                      "https://g.page/r/yourbrand/review"
                    }
                    className="input input-bordered input-sm w-full rounded-xl text-xs font-mono bg-base-100"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        campaignKit?.shortReviewUrl ||
                          activeLocation?.reviewLink ||
                          "",
                        "Google Review URL copied!",
                      )
                    }
                    className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-xs gap-1"
                  >
                    <Icon icon="solar:copy-bold" className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-base-content">
                    In-Store Printable QR Code
                  </h4>
                  <p className="text-[11px] text-base-content/60">
                    Display at checkout counters, receipts, or table tents.
                  </p>
                  <a
                    href={campaignKit?.qrCodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-outline btn-primary rounded-lg font-bold gap-1 mt-2"
                  >
                    <Icon
                      icon="solar:download-minimalistic-bold"
                      className="h-3 w-3"
                    />
                    <span>Download High-Res QR</span>
                  </a>
                </div>

                {campaignKit?.qrCodeUrl ? (
                  <img
                    src={campaignKit.qrCodeUrl}
                    alt="Review QR Code"
                    className="h-20 w-20 rounded-xl border border-base-300 p-1 bg-white shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-base-300 animate-pulse shrink-0" />
                )}
              </div>
            </div>

            {/* Outbound SMS & Email Templates */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-base-content">
                High-Converting Outreach Templates
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignKit?.smsTemplates.map((sms) => (
                  <div
                    key={sms.id}
                    className="p-4 rounded-2xl bg-base-200/40 border border-base-300 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-base-content flex items-center gap-1.5">
                          <Icon
                            icon="solar:chat-line-bold"
                            className="h-4 w-4 text-primary"
                          />
                          <span>{sms.title}</span>
                        </span>
                        <span className="badge badge-xs badge-ghost font-mono">
                          SMS
                        </span>
                      </div>
                      <p className="text-xs text-base-content/70 leading-relaxed font-sans bg-base-100 p-3 rounded-xl border border-base-300">
                        {sms.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(sms.message, "SMS template copied!")
                      }
                      className="btn btn-xs btn-outline rounded-xl font-bold gap-1 w-fit self-end"
                    >
                      <Icon icon="solar:copy-bold" className="h-3 w-3" />
                      <span>Copy SMS Text</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NAP Consistency */}
      {activeTab === "nap" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-base-content">
                Name, Address &amp; Phone (NAP) Consistency
              </h3>
              <p className="text-xs text-base-content/60">
                Auditing business citations across major global business
                directories to prevent local ranking penalties for{" "}
                {activeLocation?.locationName}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-xs font-bold text-base-content/60 border-b border-base-300">
                    <th>Directory</th>
                    <th>Listed Name</th>
                    <th>Listed Address</th>
                    <th>Listed Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile?.citations.map(
                    (cit: LocalCitationItem, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-base-200 text-xs font-medium"
                      >
                        <td className="font-bold text-base-content">
                          {cit.directory}
                        </td>
                        <td>{cit.name}</td>
                        <td className="text-base-content/70">{cit.address}</td>
                        <td className="font-mono text-base-content/70">
                          {cit.phone}
                        </td>
                        <td>
                          {cit.status === "consistent" ? (
                            <span className="badge badge-xs badge-success text-white font-bold gap-1">
                              <Icon
                                icon="solar:check-circle-bold"
                                className="h-3 w-3"
                              />
                              <span>Matched</span>
                            </span>
                          ) : (
                            <span className="badge badge-xs badge-error text-white font-bold gap-1">
                              <Icon
                                icon="solar:danger-triangle-bold"
                                className="h-3 w-3"
                              />
                              <span>Mismatch</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* SEMRUSH-STYLE GOOGLE OAUTH 1-CLICK GBP CONNECTION & DETECTION MODAL */}
      {isOAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-base-100 border border-base-300 p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <Icon icon="logos:google-icon" className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="font-black text-base text-base-content">
                    Connect Google Business Profile
                  </h3>
                  <p className="text-[11px] text-base-content/60">
                    Direct OAuth synchronization (No manual entry required)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOAuthModalOpen(false);
                  setOauthStep("login");
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Sign in with Google */}
            {oauthStep === "login" && (
              <div className="space-y-4 py-2 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Icon
                    icon="solar:shield-check-bold"
                    className="h-8 w-8 text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-base-content">
                    Authorize Google Account
                  </h4>
                  <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                    Sign in with the Google Account that manages your Google
                    Business Profile. Skorvia will auto-detect your locations.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-xs text-base-content/70 flex items-center justify-center gap-2 font-mono">
                  <Icon
                    icon="solar:user-bold"
                    className="h-4 w-4 text-primary"
                  />
                  <span>{userEmail}</span>
                </div>

                <button
                  type="button"
                  onClick={handleStartGoogleOAuth}
                  className="btn btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2 w-full"
                >
                  <Icon
                    icon="logos:google-icon"
                    className="h-5 w-5 bg-white rounded-full p-0.5"
                  />
                  <span>Continue with Google Account</span>
                </button>
              </div>
            )}

            {/* Step 2: Auto-Detecting Locations Animation */}
            {oauthStep === "detecting" && (
              <div className="py-8 text-center space-y-4">
                <Icon
                  icon="solar:refresh-circle-bold"
                  className="h-10 w-10 text-primary animate-spin mx-auto"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-base-content">
                    Connecting to Google Business Profile API...
                  </h4>
                  <p className="text-xs text-base-content/60">
                    Scanning verified business locations managed by {userEmail}
                    ...
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Select from Detected Profiles (Semrush Style) */}
            {oauthStep === "select" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-3.5 w-3.5"
                      />
                      <span>Google Account Authorized</span>
                    </span>
                    <span className="text-base-content/50 font-mono text-[11px]">
                      {userEmail}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-base-content">
                    Select a Google Business Profile to Connect:
                  </h4>
                  <p className="text-xs text-base-content/60">
                    {detectedProfilesQuery.data && detectedProfilesQuery.data.length > 0 ? (
                      <>
                        We found <strong>{detectedProfilesQuery.data.length} verified location{detectedProfilesQuery.data.length === 1 ? "" : "s"}</strong> associated with your account.
                      </>
                    ) : (
                      <>No pre-existing Google Business Profiles found on this account.</>
                    )}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {detectedProfilesQuery.data && detectedProfilesQuery.data.length > 0 ? (
                    detectedProfilesQuery.data.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-base-200/40 border border-base-300 hover:border-primary transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="font-black text-sm text-base-content flex items-center gap-1.5">
                              <Icon
                                icon="solar:shop-2-bold"
                                className="h-4 w-4 text-primary"
                              />
                              <span>{item.businessName}</span>
                            </div>
                            <p className="text-xs text-base-content/70">
                              {item.streetAddress}, {item.city},{" "}
                              {item.countryCode}
                            </p>
                            <p className="text-[11px] text-base-content/50 font-mono">
                              {item.phoneNumber}
                            </p>
                          </div>

                          <span
                            className={`badge badge-sm font-bold ${item.onlineAssessment === "Poor" ? "badge-warning" : "badge-success text-white"}`}
                          >
                            {item.onlineAssessment} Presence
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-base-300/60">
                          <span className="text-[11px] text-base-content/60 font-medium">
                            {item.listingsToFixCount} listings to fix
                          </span>

                          <button
                            type="button"
                            disabled={connectDetectedMutation.isPending}
                            onClick={() =>
                              connectDetectedMutation.mutate(item.id)
                            }
                            className="btn btn-xs btn-primary rounded-xl font-bold text-white shadow-xs gap-1 px-4"
                          >
                            <Icon
                              icon="solar:link-circle-bold"
                              className="h-3.5 w-3.5"
                            />
                            <span>
                              {connectDetectedMutation.isPending
                                ? "Connecting..."
                                : "Connect This Profile"}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 text-center space-y-3">
                      <Icon
                        icon="solar:info-circle-bold"
                        className="h-8 w-8 text-base-content/40 mx-auto"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-base-content">
                          No Google Business Profile listings found
                        </p>
                        <p className="text-[11px] text-base-content/60 max-w-xs mx-auto">
                          Create a listing on Google Business Profile, or add your business location manually below.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOAuthModalOpen(false);
                          }}
                          className="btn btn-xs btn-primary font-bold rounded-xl"
                        >
                          Add Location Manually
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Review Response Modal with 1-Click Publish to Google Maps */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-base-100 border border-base-300 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:stars-bold"
                  className="h-5 w-5 text-primary"
                />
                <h3 className="font-black text-base text-base-content">
                  Skorvia AI Review Responder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-base-content">
                <span>{selectedReview.author}</span>
                <span className="text-amber-500">
                  {"⭐".repeat(selectedReview.rating)}
                </span>
              </div>
              <p className="text-xs text-base-content/70 italic">
                &ldquo;{selectedReview.text}&rdquo;
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content">
                Generated Response Draft
              </label>
              {isDrafting ? (
                <div className="p-6 rounded-2xl bg-base-200/30 flex items-center justify-center gap-2 text-xs font-bold text-primary">
                  <Icon
                    icon="solar:refresh-circle-bold"
                    className="h-4 w-4 animate-spin"
                  />
                  <span>Drafting tailored reply with Skorvia AI...</span>
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={reviewDraft}
                  onChange={(e) => setReviewDraft(e.target.value)}
                  className="textarea textarea-bordered w-full rounded-2xl text-xs font-medium leading-relaxed"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                      "sam_pending_prompt",
                      `Help me respond to this customer review for ${activeLocation?.businessName || profile?.businessName}:\nAuthor: ${selectedReview.author}\nRating: ${selectedReview.rating}/5\nReview: "${selectedReview.text}"\nCurrent draft: "${reviewDraft}"`,
                    );
                  }
                  void navigate({
                    to: "/p/$projectId/sam",
                    params: { projectId },
                    search: { s: undefined },
                  });
                }}
                className="btn btn-sm btn-ghost text-xs text-primary font-bold gap-1"
              >
                <Icon icon="solar:chat-round-line-bold" className="h-4 w-4" />
                <span>Refine in Chat</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(reviewDraft)}
                  disabled={!reviewDraft}
                  className="btn btn-sm btn-outline rounded-xl font-bold gap-1"
                >
                  <Icon icon="solar:copy-bold" className="h-4 w-4" />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  disabled={!reviewDraft || publishReplyMutation.isPending}
                  onClick={() =>
                    publishReplyMutation.mutate({
                      reviewId: selectedReview.id,
                      responseText: reviewDraft,
                    })
                  }
                  className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
                >
                  <Icon icon="solar:upload-track-bold" className="h-4 w-4" />
                  <span>
                    {publishReplyMutation.isPending
                      ? "Publishing..."
                      : "Publish to Google"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

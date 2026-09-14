import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Menu,
  Search,
  Zap,
  Sun,
  Moon,
  Bell,
  Rocket,
  Folder,
  CreditCard,
  Settings,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Radio,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useSession, signOutAndRedirect } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { closeDropdown } from "@/client/lib/dropdown";
import { BRAND_CONFIG } from "@/config/brand";
import { getUserCreditUsageServerFn } from "@/serverFunctions/retention";
import {
  listNotificationsServerFn,
  markNotificationReadServerFn,
  markAllNotificationsReadServerFn,
  clearNotificationsServerFn,
} from "@/serverFunctions/notifications";
import type { UserNotificationItem } from "@/services/notifications.service";

import { useThemePreference } from "@/client/lib/theme";

import { getProjects } from "@/serverFunctions/projects";

interface VenixTopBarProps {
  projectId?: string | null;
  onToggleSidebar: () => void;
  drawerOpen?: boolean;
}

export function VenixTopBar({
  projectId,
  onToggleSidebar,
}: VenixTopBarProps) {
  const navigate = useNavigate();
  const session = useSession();
  const { themePreference, setThemePreference } = useThemePreference();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const projects = projectsQuery.data || [];

  const creditUsageQuery = useQuery({
    queryKey: ["userCreditUsageTopBar"],
    queryFn: () => getUserCreditUsageServerFn(),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const creditData = creditUsageQuery.data;
  const creditsRemaining = creditData ? creditData.creditsRemaining : 500;
  const creditsLimit = creditData ? creditData.monthlyCreditsLimit : 500;
  const percentUsed = creditData ? creditData.percentageUsed : 0;
  const isNearLimit = creditData ? creditData.isNearLimit : false;
  const isDepleted = creditData ? creditData.isDepleted : false;

  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] =
    React.useState<UserNotificationItem | null>(null);
  const [notificationFilter, setNotificationFilter] = React.useState<
    "all" | "unread"
  >("all");

  const notificationsQuery = useQuery<UserNotificationItem[]>({
    queryKey: ["userNotifications"],
    queryFn: () =>
      listNotificationsServerFn({ data: {} }) as Promise<
        UserNotificationItem[]
      >,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    notificationFilter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const markOneReadMutation = useMutation({
    mutationFn: (id: string) =>
      markNotificationReadServerFn({ data: { notificationId: id } }),
    onMutate: (id: string) => {
      queryClient.setQueryData<UserNotificationItem[]>(
        ["userNotifications"],
        (old) =>
          old ? old.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : [],
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadServerFn({ data: {} }),
    onMutate: () => {
      queryClient.setQueryData<UserNotificationItem[]>(
        ["userNotifications"],
        (old) => (old ? old.map((n) => ({ ...n, isRead: true })) : []),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearNotificationsServerFn({ data: {} }),
    onMutate: () => {
      queryClient.setQueryData<UserNotificationItem[]>(
        ["userNotifications"],
        [],
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      setSelectedNotification(null);
      toast.success("All notifications cleared");
    },
  });
  const formatPlanDisplay = (planId?: string, explicitPlanName?: string) => {
    if (explicitPlanName && explicitPlanName.trim().length > 0) {
      return explicitPlanName;
    }
    if (!planId || planId.toLowerCase() === "free") return "Free Plan";
    if (planId.toLowerCase() === "starter") return "Starter Plan";
    if (planId.toLowerCase() === "growth") return "Growth Plan";
    if (planId.toLowerCase() === "pro") return "Pro Plan";
    if (planId.toLowerCase() === "scale") return "Scale Plan";
    if (planId.toLowerCase() === "agency") return "Agency Plan";
    if (planId.toLowerCase() === "enterprise") return "Enterprise Plan";
    return `${planId.toUpperCase()} Plan`;
  };
  const currentPlan = formatPlanDisplay(
    creditData?.planId,
    creditData?.planName,
  );

  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setThemePreference(nextTheme);
  };

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for search palette
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activePid = projectId || projects[0]?.id;

  const quickTools = [
    {
      name: "Main Dashboard",
      category: "Overview",
      href: activePid ? `/p/${activePid}` : "/my-brands",
      icon: "solar:widget-bold-duotone",
    },
    {
      name: "Keyword Revenue Radar",
      category: "SEO",
      href: activePid ? `/p/${activePid}/keywords` : "/my-brands",
      icon: "solar:target-bold-duotone",
    },
    {
      name: "Competitor Ad Decoder",
      category: "Competitors",
      href: activePid ? `/p/${activePid}/competitor-analysis` : "/my-brands",
      icon: "solar:eye-bold-duotone",
    },
    {
      name: "AI Search & AEO Monitor",
      category: "AEO",
      href: activePid ? `/p/${activePid}/brand-lookup` : "/my-brands",
      icon: "solar:stars-bold-duotone",
    },
    {
      name: "Technical Site Audit",
      category: "SEO",
      href: activePid ? `/p/${activePid}/audit` : "/my-brands",
      icon: "solar:shield-check-bold-duotone",
    },
    {
      name: "Backlinks Explorer",
      category: "Authority",
      href: activePid ? `/p/${activePid}/backlinks` : "/my-brands",
      icon: "solar:link-bold-duotone",
    },
    {
      name: "Team & Collaborators",
      category: "Workspace",
      href: "/dashboard/team",
      icon: "solar:users-group-two-rounded-bold-duotone",
    },
    {
      name: "Instant Indexing Engine",
      category: "Tools",
      href: "/indexing",
      icon: "solar:bolt-bold-duotone",
    },
    {
      name: "Uptime & Health Monitor",
      category: "Monitoring",
      href: "/uptime",
      icon: "solar:server-bold-duotone",
    },
    {
      name: "My Brands Workspace",
      category: "Workspace",
      href: "/my-brands",
      icon: "solar:folder-bold-duotone",
    },
    {
      name: "Brand Settings",
      category: "Settings",
      href: activePid ? `/p/${activePid}/settings` : "/settings",
      icon: "solar:settings-bold-duotone",
    },
    {
      name: "Billing & Plans",
      category: "Account",
      href: "/billing",
      icon: "solar:card-bold-duotone",
    },
  ];

  const filteredTools = quickTools.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    (p.name || p.domain || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (activePid) {
      void navigate({
        to: "/p/$projectId/keywords",
        params: { projectId: activePid },
        search: { q: searchQuery.trim() },
      });
    } else {
      void navigate({ to: "/my-brands" });
    }
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const userEmail = session.data?.user?.email || "";
  const userName = session.data?.user?.name || (userEmail ? userEmail.split("@")[0] : "User");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-base-300 bg-base-100/95 px-4 backdrop-blur-md transition-colors md:px-6">
      {/* Left: Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200 border border-base-300 shadow-xs flex items-center justify-center h-9 w-9 min-h-[36px] min-w-[36px]"
        >
          <Menu size={20} className="text-base-content shrink-0" />
        </button>

        {/* Mobile Search Icon Trigger */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200 border border-base-300 shadow-xs flex items-center justify-center h-9 w-9 min-h-[36px] min-w-[36px]"
          aria-label="Open Search"
        >
          <Search size={17} className="text-base-content shrink-0" />
        </button>

        {/* Redesigned Desktop Global Command/Search Palette (Venix Style) */}
        <div ref={searchContainerRef} className="relative hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 text-base-content/60 shrink-0 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tools, keywords, brands..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="input input-bordered h-10 w-64 md:w-80 lg:w-96 rounded-2xl pl-10 pr-16 text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 bg-base-200/60 hover:bg-base-200/80 border-base-300 text-base-content"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-base-content/50 hover:text-base-content rounded-full hover:bg-base-300/50 transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-3.5" />
                  </button>
                ) : (
                  <kbd className="kbd kbd-xs bg-base-100 border border-base-300 text-[10px] text-base-content/60 font-mono px-1.5 py-0.5 rounded-md shadow-2xs">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          </form>

          {/* Interactive Search Results & Quick Actions Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 md:w-96 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
              {searchQuery.trim() && (
                <div className="p-1 mb-2 border-b border-base-200">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-base-content/50">
                    Direct Actions
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activePid) {
                        void navigate({
                          to: "/p/$projectId/keywords",
                          params: { projectId: activePid },
                          search: { q: searchQuery.trim() },
                        });
                      }
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors text-left"
                  >
                    <Icon icon="solar:target-bold-duotone" className="size-4 shrink-0" />
                    <span className="truncate">Search &ldquo;{searchQuery}&rdquo; in Keyword Radar</span>
                    <ArrowRight className="size-3.5 ml-auto shrink-0 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activePid) {
                        void navigate({
                          to: "/p/$projectId/competitor-analysis",
                          params: { projectId: activePid },
                        });
                      }
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-secondary dark:text-accent hover:bg-base-200 transition-colors text-left"
                  >
                    <Icon icon="solar:eye-bold-duotone" className="size-4 shrink-0" />
                    <span className="truncate">Decode Competitor &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="size-3.5 ml-auto shrink-0 opacity-70" />
                  </button>
                </div>
              )}

              {/* Brands / Projects Section */}
              {filteredProjects.length > 0 && (
                <div className="p-1 mb-2 border-b border-base-200">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-base-content/50">
                    Brands ({filteredProjects.length})
                  </div>
                  {filteredProjects.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        void navigate({
                          to: "/p/$projectId",
                          params: { projectId: p.id },
                        });
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-base-content hover:bg-base-200 transition-colors text-left"
                    >
                      <Icon icon="solar:folder-bold-duotone" className="size-4 text-primary shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-xs truncate">{p.name || p.domain}</div>
                        <div className="text-[10px] text-base-content/60 truncate">{p.domain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Tools & Navigation */}
              <div className="p-1">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-base-content/50">
                  {searchQuery ? "Matching Tools" : "Quick Launch"}
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {filteredTools.slice(0, 6).map((tool) => (
                    <Link
                      key={tool.name}
                      to={tool.href}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-base-content hover:bg-base-200 transition-colors"
                    >
                      <Icon icon={tool.icon} className="size-4 text-primary shrink-0" />
                      <span className="truncate">{tool.name}</span>
                      <span className="ml-auto text-[10px] text-base-content/50 font-semibold px-1.5 py-0.5 rounded-md bg-base-200">
                        {tool.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-100/98 p-4 backdrop-blur-lg sm:hidden animate-in fade-in duration-150">
          <div className="flex items-center gap-2 pb-3 border-b border-base-300">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-3 text-base-content/60" />
              <input
                autoFocus
                type="text"
                placeholder="Search tools, keywords, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered h-10 w-full rounded-2xl pl-9 pr-3 text-xs bg-base-200"
              />
            </form>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <Icon icon="solar:close-circle-bold" className="size-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-3">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 px-2">
                Tools &amp; Features
              </div>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.name}
                  to={tool.href}
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-xl text-xs font-semibold text-base-content hover:bg-base-200 block"
                >
                  <Icon icon={tool.icon} className="size-4 text-primary shrink-0" />
                  <span>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right: Actions (Credit Meter, Language, Theme, Notifications, User Profile) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Contextual Topbar Credit Meter & Quick Refill/Upgrade Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-base-200/60 border border-base-300 shadow-2xs">
          <Link
            to="/billing"
            className="flex items-center gap-1.5 text-xs font-black text-base-content hover:text-primary transition-colors cursor-pointer"
            title={`${currentPlan} Plan: ${creditsRemaining} of ${creditsLimit} credits available`}
          >
            <span
              className={
                isDepleted
                  ? "text-error animate-pulse"
                  : isNearLimit
                    ? "text-amber-500"
                    : "text-primary"
              }
            >
              <Zap size={14} className="shrink-0 fill-current" />
            </span>
            <span className="font-mono">
              {creditsRemaining.toLocaleString()}
            </span>
            <span className="text-base-content/60 font-mono text-[11px]">
              / {creditsLimit.toLocaleString()}
            </span>
            <span className="text-[10px] text-base-content/70 uppercase font-bold tracking-wider hidden sm:inline">
              Credits
            </span>
          </Link>

          <div className="w-10 sm:w-14 bg-base-300 rounded-full h-1.5 overflow-hidden hidden xs:block">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isDepleted
                  ? "bg-error"
                  : isNearLimit
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{ width: `${Math.max(0, 100 - percentUsed)}%` }}
            />
          </div>

          <Link
            to="/billing"
            className={`btn btn-xs rounded-xl font-bold gap-1 shadow-xs ${
              isDepleted
                ? "btn-error text-white animate-bounce"
                : isNearLimit
                  ? "btn-warning text-white"
                  : "btn-primary text-white"
            }`}
          >
            <Rocket size={12} className="shrink-0" />
            <span>{isDepleted ? "Refill" : "Refill"}</span>
          </Link>
        </div>

        {/* Invite Team Action */}
        <Link
          to="/dashboard/team"
          className="btn btn-outline btn-xs sm:btn-sm rounded-xl font-bold gap-1.5 hidden md:inline-flex border-base-300 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shadow-xs"
          title="Invite team members and manage seat permissions"
        >
          <Users size={14} className="text-primary shrink-0" />
          <span>Invite Team</span>
        </Link>

        {/* 1-Click Dark/Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200 border border-base-300 shadow-xs flex items-center justify-center h-9 w-9 min-h-[36px] min-w-[36px]"
        >
          {isDark ? (
            <Sun size={18} className="text-amber-500 fill-amber-500 shrink-0" />
          ) : (
            <Moon
              size={18}
              className="text-slate-800 dark:text-slate-200 fill-slate-800 dark:fill-slate-200 shrink-0"
            />
          )}
        </button>

        {/* Real-time Notification Bell Popover & Notification Center */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm relative text-base-content hover:bg-base-200 border border-base-300 shadow-xs flex items-center justify-center h-9 w-9 min-h-[36px] min-w-[36px]"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} className="text-base-content shrink-0" />
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-xs absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <div
            tabIndex={0}
            className="dropdown-content z-50 mt-2 w-84 sm:w-96 rounded-3xl border border-base-300 bg-base-100 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-base-300 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Bell size={16} className="text-primary shrink-0" />
                <span className="text-xs font-black tracking-tight text-base-content">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm rounded-lg text-[10px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="btn btn-ghost btn-xs text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg"
                    title="Mark all as read"
                  >
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    className="btn btn-ghost btn-xs text-[10px] font-bold text-base-content/60 hover:text-error hover:bg-error/10 rounded-lg"
                    title="Clear all notifications"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: All vs Unread */}
            <div className="flex items-center gap-1 bg-base-200/60 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setNotificationFilter("all")}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${
                  notificationFilter === "all"
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setNotificationFilter("unread")}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${
                  notificationFilter === "unread"
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notifications Scrollable List */}
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-base-content/50 space-y-1">
                  <Bell size={32} className="mx-auto opacity-40 shrink-0" />
                  <p className="text-xs font-semibold">No notifications</p>
                  <p className="text-[10px]">You&rsquo;re all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const isWarning =
                    n.priority === "warning" || n.priority === "critical";
                  const isSuccess = n.priority === "success";
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) {
                          markOneReadMutation.mutate(n.id);
                        }
                        setSelectedNotification(n);
                        closeDropdown();
                      }}
                      className={`cursor-pointer rounded-2xl p-3 space-y-1 transition-all border ${
                        !n.isRead
                          ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                          : "bg-base-200/40 border-base-300/60 hover:bg-base-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-base-content">
                        <span
                          className={`flex items-center gap-1.5 font-bold text-xs ${
                            isWarning
                              ? "text-amber-500"
                              : isSuccess
                                ? "text-emerald-500"
                                : "text-primary"
                          }`}
                        >
                          {n.category === "credits" ? (
                            <Zap size={14} className="shrink-0 text-amber-500" />
                          ) : n.category === "rank" ? (
                            <ShieldCheck size={14} className="shrink-0 text-primary" />
                          ) : (
                            <Bell size={14} className="shrink-0" />
                          )}
                          <span className="line-clamp-1">{n.title}</span>
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.isRead && (
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="text-[10px] text-base-content/40 font-mono">
                            {new Date(n.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-base-content/70 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar btn-sm border border-base-300 bg-primary/10 text-primary font-bold text-xs flex items-center justify-center h-9 w-9 min-h-[36px] min-w-[36px]"
            aria-label="User Profile Menu"
          >
            <span>{userName.slice(0, 2).toUpperCase()}</span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-50 mt-2 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl text-xs space-y-1"
          >
            <li className="border-b border-base-300 pb-2 mb-1 px-2 pt-1">
              <div className="flex flex-col p-0 hover:bg-transparent">
                <span className="font-bold text-sm text-base-content">
                  {userName}
                </span>
                <span className="text-[11px] text-base-content/60 truncate">
                  {userEmail}
                </span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="badge badge-primary badge-xs py-1 px-2 rounded-md font-bold text-[10px]">
                    {currentPlan}
                  </span>
                  <span className="badge badge-ghost badge-xs py-0.5 px-1.5 rounded-md font-semibold text-[9px] text-base-content/60">
                    Active
                  </span>
                </div>
              </div>
            </li>

            <li>
              <Link
                to="/projects"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Folder size={16} className="text-primary shrink-0" />
                <span>My Brands</span>
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/team"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Users size={16} className="text-primary shrink-0" />
                <span>Team & Members</span>
              </Link>
            </li>

            <li>
              <Link
                to="/billing"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <CreditCard size={16} className="text-primary shrink-0" />
                <span>Billing & Subscription</span>
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Settings size={16} className="text-primary shrink-0" />
                <span>Settings</span>
              </Link>
            </li>

            {isHostedClientAuthMode() ? (
              <li className="border-t border-base-300 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => signOutAndRedirect()}
                  className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-bold text-error hover:bg-error/10"
                >
                  <LogOut size={16} className="shrink-0" />
                  <span>Log Out</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-base-100 border border-base-300 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    selectedNotification.priority === "warning" ||
                    selectedNotification.priority === "critical"
                      ? "bg-amber-500/10 text-amber-500"
                      : selectedNotification.priority === "success"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {selectedNotification.category === "credits" ? (
                    <Zap size={20} className="shrink-0 text-amber-500" />
                  ) : selectedNotification.category === "rank" ? (
                    <ShieldCheck size={20} className="shrink-0 text-primary" />
                  ) : (
                    <Bell size={20} className="shrink-0" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-base-content line-clamp-1">
                    {selectedNotification.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-base-content/50 font-mono">
                    <span>
                      {new Date(
                        selectedNotification.createdAt,
                      ).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="uppercase font-bold tracking-wider">
                      {selectedNotification.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-base-content/90 font-medium leading-relaxed">
                {selectedNotification.message}
              </p>

              {selectedNotification.details && (
                <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/80 text-base-content/70 leading-relaxed font-normal">
                  {selectedNotification.details}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-300">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="btn btn-sm btn-ghost rounded-xl font-bold"
              >
                Close
              </button>
              {selectedNotification.actionUrl && (
                <Link
                  to={selectedNotification.actionUrl}
                  onClick={() => setSelectedNotification(null)}
                  className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
                >
                  <span>View Details</span>
                  <ArrowRight size={16} className="shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
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

interface VenixTopBarProps {
  onToggleSidebar: () => void;
  drawerOpen?: boolean;
}

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English (US)", flag: "/flags/lang-flag/circle-us.svg" },
  { code: "de", label: "Deutsch", flag: "/flags/lang-flag/circle-de.svg" },
  { code: "es", label: "Español", flag: "/flags/lang-flag/circle-si.svg" },
  { code: "fr", label: "Français", flag: "/flags/lang-flag/circle-ca.svg" },
  { code: "hi", label: "Hindi", flag: "/flags/lang-flag/circle-in.svg" },
  { code: "ru", label: "Русский", flag: "/flags/lang-flag/circle-ru.svg" },
];

export function VenixTopBar({ onToggleSidebar }: VenixTopBarProps) {
  const navigate = useNavigate();
  const session = useSession();
  const { themePreference, setThemePreference } = useThemePreference();
  const [selectedLang, setSelectedLang] = React.useState<LanguageOption>(LANGUAGES[0]);
  const [searchQuery, setSearchQuery] = React.useState("");

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
  const [selectedNotification, setSelectedNotification] = React.useState<UserNotificationItem | null>(null);
  const [notificationFilter, setNotificationFilter] = React.useState<"all" | "unread">("all");

  const notificationsQuery = useQuery<UserNotificationItem[]>({
    queryKey: ["userNotifications"],
    queryFn: () => listNotificationsServerFn({ data: {} }) as Promise<UserNotificationItem[]>,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    notificationFilter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const markOneReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadServerFn({ data: { notificationId: id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadServerFn({ data: {} }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearNotificationsServerFn({ data: {} }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      setSelectedNotification(null);
      toast.success("All notifications cleared");
    },
  });
  const currentPlan = creditData?.planId ? creditData.planId.toUpperCase() : "STARTER";

  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setThemePreference(nextTheme);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    void navigate({ to: "/projects" });
  };

  const userEmail = session.data?.user?.email || "user@skorvia.com";
  const userName = session.data?.user?.name || userEmail.split("@")[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-base-300 bg-base-100/90 px-4 backdrop-blur-md transition-colors md:px-6">
      {/* Left: Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:bg-base-200"
        >
          <Icon icon="solar:hamburger-menu-linear" className="h-5 w-5" />
        </button>

        {/* Global Search Bar (Venix Style) */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block">
          <div className="relative flex items-center">
            <Icon
              icon="solar:minimalistic-magnifer-line-duotone"
              className="absolute left-3 h-4 w-4 text-base-content/50"
            />
            <input
              type="text"
              placeholder="Search tools, keywords, or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm h-9 w-64 rounded-xl pl-9 pr-3 text-xs focus:w-80 focus:border-primary focus:outline-none transition-all duration-200 bg-base-200/50"
            />
          </div>
        </form>
      </div>

      {/* Right: Actions (Credit Meter, Language, Theme, Notifications, User Profile) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Contextual Topbar Credit Meter & Quick Refill/Upgrade Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-base-200/60 border border-base-300 shadow-2xs">
          <Link
            to="/billing"
            className="flex items-center gap-1.5 text-xs font-black text-base-content/90 hover:text-primary transition-colors cursor-pointer"
            title={`${currentPlan} Plan: ${creditsRemaining} of ${creditsLimit} credits available`}
          >
            <span className={isDepleted ? "text-error animate-pulse" : isNearLimit ? "text-amber-500" : "text-primary"}>
              ⚡
            </span>
            <span className="font-mono">{creditsRemaining.toLocaleString()}</span>
            <span className="text-base-content/40 font-mono text-[11px]">/ {creditsLimit.toLocaleString()}</span>
            <span className="text-[10px] text-base-content/50 uppercase font-bold tracking-wider hidden sm:inline">Credits</span>
          </Link>

          <div className="w-10 sm:w-14 bg-base-300 rounded-full h-1.5 overflow-hidden hidden xs:block">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isDepleted ? "bg-error" : isNearLimit ? "bg-amber-500" : "bg-primary"
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
            <Icon icon="solar:rocket-bold" className="h-3 w-3" />
            <span>{isDepleted ? "Refill" : "Refill"}</span>
          </Link>
        </div>

        {/* Language Selector Dropdown */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:bg-base-200"
            aria-label="Language Selector"
          >
            <img
              src={selectedLang.flag}
              alt={selectedLang.label}
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                // Fallback to globe icon if image path fails
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-50 mt-2 w-48 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl text-xs space-y-1"
          >
            <li className="menu-title text-[10px] uppercase font-bold tracking-wider text-base-content/50 px-2 py-1">
              Select Language
            </li>
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang);
                    closeDropdown();
                  }}
                  className={`flex items-center gap-2 rounded-xl py-1.5 px-2.5 ${
                    selectedLang.code === lang.code ? "active font-bold bg-primary text-white" : ""
                  }`}
                >
                  <img src={lang.flag} alt="" className="h-3.5 w-3.5 rounded-full" />
                  <span>{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 1-Click Dark/Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:bg-base-200"
        >
          {isDark ? (
            <Icon icon="solar:sun-2-bold-duotone" className="h-5 w-5 text-amber-400" />
          ) : (
            <Icon icon="solar:moon-bold-duotone" className="h-5 w-5 text-indigo-600" />
          )}
        </button>

        {/* Real-time Notification Bell Popover & Notification Center */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm relative text-base-content/80 hover:bg-base-200"
            aria-label="Notifications"
          >
            <Icon icon="solar:bell-bing-bold-duotone" className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold">
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
                <Icon icon="solar:bell-bold-duotone" className="h-4 w-4 text-primary" />
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
                  <Icon icon="solar:bell-linear" className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">No notifications</p>
                  <p className="text-[10px]">You&rsquo;re all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const isWarning = n.priority === "warning" || n.priority === "critical";
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
                            isWarning ? "text-amber-500" : isSuccess ? "text-emerald-500" : "text-primary"
                          }`}
                        >
                          <Icon
                            icon={
                              n.category === "pixel"
                                ? "solar:radar-bold"
                                : n.category === "audit"
                                ? "solar:shield-check-bold"
                                : n.category === "gbp"
                                ? "solar:shop-bold"
                                : "solar:bell-bold"
                            }
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span className="line-clamp-1">{n.title}</span>
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.isRead && (
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="text-[10px] text-base-content/40 font-mono">
                            {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
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
            className="btn btn-ghost btn-circle avatar btn-sm border border-base-300/80 bg-primary/10 text-primary font-bold text-xs"
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
                <span className="font-bold text-sm text-base-content">{userName}</span>
                <span className="text-[11px] text-base-content/60 truncate">{userEmail}</span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="badge badge-primary badge-xs py-1 px-2 rounded-md font-bold text-[9px]">
                    PRO PLAN
                  </span>
                  <span className="text-[10px] text-base-content/50">{BRAND_CONFIG.name}</span>
                </div>
              </div>
            </li>

            <li>
              <Link
                to="/projects"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Icon icon="solar:folder-with-files-bold-duotone" className="h-4 w-4 text-primary" />
                <span>My Brands</span>
              </Link>
            </li>

            <li>
              <Link
                to="/billing"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Icon icon="solar:card-2-bold-duotone" className="h-4 w-4 text-primary" />
                <span>Billing & Subscription</span>
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                onClick={() => closeDropdown()}
                className="flex items-center gap-2 rounded-xl py-2 px-2.5 font-medium hover:bg-base-200"
              >
                <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 text-primary" />
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
                  <Icon icon="solar:logout-2-bold-duotone" className="h-4 w-4" />
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
                    selectedNotification.priority === "warning" || selectedNotification.priority === "critical"
                      ? "bg-amber-500/10 text-amber-500"
                      : selectedNotification.priority === "success"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon
                    icon={
                      selectedNotification.category === "pixel"
                        ? "solar:radar-bold"
                        : selectedNotification.category === "audit"
                        ? "solar:shield-check-bold"
                        : selectedNotification.category === "gbp"
                        ? "solar:shop-bold"
                        : "solar:bell-bold"
                    }
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <h3 className="font-black text-sm text-base-content line-clamp-1">{selectedNotification.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-base-content/50 font-mono">
                    <span>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="uppercase font-bold tracking-wider">{selectedNotification.category}</span>
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
                  <Icon icon="solar:arrow-right-bold" className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import * as React from "react";
import {
  Outlet,
  createFileRoute,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { useThemePreference } from "@/client/lib/theme";
import { authClient, signOutAndRedirect } from "@/lib/auth-client";

export const Route = createFileRoute("/_admin")({
  component: AdminLayoutShell,
});

interface NavGroup {
  title: string;
  items: {
    title: string;
    href: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
    exact?: boolean;
  }[];
}

function AdminLayoutShell() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { themePreference, setThemePreference } = useThemePreference();
  const { data: session, isPending } = authClient.useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Strict Admin Gate: If not authenticated, redirect to /admin-login
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      void navigate({
        to: "/admin-login",
        search: { redirect: currentPath },
      });
    }
  }, [isPending, session, navigate, currentPath]);

  const isDarkActive =
    themePreference === "dark" ||
    (themePreference === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    const nextTheme: "light" | "dark" = isDarkActive ? "light" : "dark";
    setThemePreference(nextTheme);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Verifying Administrator Authorization...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const navGroups: NavGroup[] = [
    {
      title: "Menu",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: "solar:widget-6-bold-duotone",
          exact: true,
        },
        {
          title: "System Monitoring",
          href: "/admin/monitoring",
          icon: "solar:activity-bold-duotone",
          badge: "Live",
          badgeColor: "bg-emerald-500 text-white",
        },
      ],
    },
    {
      title: "Billing & Plans",
      items: [
        {
          title: "Plan Settings",
          href: "/admin/plans",
          icon: "solar:layers-minimalistic-bold-duotone",
        },
        {
          title: "Automatic Payment",
          href: "/admin/gateways",
          icon: "solar:card-2-bold-duotone",
        },
        {
          title: "Manual Bank Receipts",
          href: "/admin/payments",
          icon: "solar:bill-list-bold-duotone",
        },
      ],
    },
    {
      title: "CMS & Editorial",
      items: [
        {
          title: "Blog CMS & Publishing",
          href: "/admin/blog",
          icon: "solar:pen-new-square-bold-duotone",
        },
      ],
    },
    {
      title: "System & Access",
      items: [
        {
          title: "Branding & R2 Uploads",
          href: "/admin/settings/branding",
          icon: "solar:gallery-bold-duotone",
        },
        {
          title: "Smart API Keys",
          href: "/admin/settings/apis",
          icon: "solar:key-minimalistic-bold-duotone",
        },
        {
          title: "Security Policies & 2FA",
          href: "/admin/settings/security",
          icon: "solar:shield-check-bold-duotone",
        },
        {
          title: "Audit Logs",
          href: "/admin/audit-logs",
          icon: "solar:history-bold-duotone",
        },
        {
          title: "User Management",
          href: "/admin/users",
          icon: "solar:users-group-rounded-bold-duotone",
        },
      ],
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes("plan") || q.includes("price"))
      void navigate({ to: "/admin/plans" });
    else if (q.includes("brand") || q.includes("logo"))
      void navigate({ to: "/admin/settings/branding" });
    else if (q.includes("blog") || q.includes("post"))
      void navigate({ to: "/admin/blog" });
    else if (q.includes("user") || q.includes("account"))
      void navigate({ to: "/admin/users" });
    else if (q.includes("pay") || q.includes("gate"))
      void navigate({ to: "/admin/gateways" });
    else if (q.includes("api") || q.includes("firecrawl"))
      void navigate({ to: "/admin/settings/apis" });
    else void navigate({ to: "/admin" });
  };

  const userEmail = session?.user?.email || "admin@skorvia.com";
  const userName = session?.user?.name || "Superadmin";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 flex font-sans">
      {/* -------------------------------------------------------------- */}
      {/* Venix Left Dark Sidebar */}
      {/* -------------------------------------------------------------- */}
      <aside
        className={`${
          sidebarOpen ? "w-[260px]" : "w-0 md:w-[76px]"
        } transition-all duration-300 bg-[#1e293b] text-slate-300 flex flex-col justify-between shrink-0 z-50 border-r border-slate-700/50 select-none overflow-hidden`}
      >
        <div className="flex flex-col min-h-0 overflow-y-auto">
          {/* Logo Box */}
          <div className="h-16 flex items-center px-6 border-b border-slate-700/60 bg-[#1e293b]">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt={BRAND_CONFIG.name}
                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1 shrink-0"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <span className="font-extrabold text-base tracking-wide text-white block truncate">
                    {BRAND_CONFIG.name}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 block -mt-1 tracking-wider uppercase">
                    Admin Portal
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="py-4 px-3 space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {sidebarOpen && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400/80 mb-2">
                    {group.title}
                  </p>
                )}

                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? currentPath === item.href
                      : currentPath.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          title={item.title}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-sm font-bold"
                              : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              icon={item.icon}
                              className="h-[18px] w-[18px] shrink-0"
                            />
                            {sidebarOpen && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </div>
                          {sidebarOpen && item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                                item.badgeColor || "bg-primary text-white"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Switch to App & System Status */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700/60 bg-[#172033] space-y-2">
            <Link
              to="/my-brands"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Icon icon="solar:arrow-left-bold" className="h-4 w-4" />
              <span>Client SEO Workspace</span>
            </Link>
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
              <span>v2.4.0-PRO</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                D1 Online
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* -------------------------------------------------------------- */}
      {/* Venix Content Page & Topbar */}
      {/* -------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Venix Topbar Start */}
        <header className="h-16 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700/60 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-xs">
          {/* Left: Sidebar Toggle & Topbar Search */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Icon icon="solar:hamburger-menu-linear" className="h-5 w-5" />
            </button>

            {/* Venix Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:block">
              <div className="relative flex items-center">
                <Icon
                  icon="solar:minimalistic-magnifer-line-duotone"
                  className="absolute left-3 h-4 w-4 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search for somethings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-64 md:w-80 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right: Language, Fullscreen, Theme, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => {
                if (!document.fullscreenElement) {
                  void document.documentElement.requestFullscreen();
                } else {
                  void document.exitFullscreen();
                }
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hidden sm:flex"
              title="Toggle Fullscreen"
            >
              <Icon icon="solar:full-screen-bold-duotone" className="h-5 w-5" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={
                isDarkActive ? "Switch to Light Theme" : "Switch to Dark Theme"
              }
            >
              {isDarkActive ? (
                <Icon
                  icon="solar:sun-2-bold-duotone"
                  className="h-5 w-5 text-amber-400"
                />
              ) : (
                <Icon
                  icon="solar:moon-bold-duotone"
                  className="h-5 w-5 text-slate-700"
                />
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Superadmin
                  </p>
                </div>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="h-3.5 w-3.5 text-slate-400 hidden md:block"
                />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu menu-sm z-50 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl"
              >
                <li className="menu-title px-3 py-1 text-[11px] font-bold text-slate-400">
                  ADMIN ACCOUNT
                </li>
                <li>
                  <div className="px-3 py-1 cursor-default hover:bg-transparent flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[190px]">
                      {userEmail}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold">
                      ● Full Permissions
                    </span>
                  </div>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <Link
                    to="/admin/settings/branding"
                    className="text-xs font-semibold py-2"
                  >
                    <Icon
                      icon="solar:settings-bold-duotone"
                      className="h-4 w-4 text-primary"
                    />
                    <span>Global Settings</span>
                  </Link>
                </li>
                <li>
                  <Link to="/my-brands" className="text-xs font-semibold py-2">
                    <Icon
                      icon="solar:window-frame-bold-duotone"
                      className="h-4 w-4 text-indigo-500"
                    />
                    <span>Client Workspace</span>
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    type="button"
                    onClick={() => signOutAndRedirect()}
                    className="text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 py-2"
                  >
                    <Icon
                      icon="solar:logout-2-bold-duotone"
                      className="h-4 w-4"
                    />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full bg-[#f8fafc] dark:bg-[#0f172a]">
          <div className="w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { Icon } from "@iconify/react";
import {
  CreditCard,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Settings,
  User,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  growthToolsNavGroup,
  getGrowthToolsNavGroup,
  getProjectNavGroups,
} from "@/client/navigation/items";
import { ProjectSwitcher } from "@/client/features/projects/ProjectSwitcher";
import { SamSidebarPanel } from "@/client/features/sam/SamSidebarPanel";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { closeDropdown } from "@/client/lib/dropdown";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getUserCreditUsageServerFn } from "@/serverFunctions/retention";
import { BILLING_ROUTE } from "@/shared/billing";
import { BRAND_CONFIG } from "@/config/brand";

interface SidebarProps {
  projectId: string | null;
  onNavigate?: () => void;
  onClose?: () => void;
}

const navItemBaseClass =
  "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-base-content/75";

const navItemClass = `${navItemBaseClass} transition-all duration-150 hover:bg-base-200/80 hover:text-base-content`;

const navItemActiveProps = {
  className:
    "bg-primary/10 font-bold text-primary shadow-xs ring-1 ring-primary/20",
};

function SidebarNavLink({
  icon: FallbackIcon,
  solarIcon,
  label,
  benefit,
  onNavigate,
  linkProps,
}: {
  icon?: ComponentType<{ className?: string }>;
  solarIcon?: string;
  label: string;
  benefit?: string;
  onNavigate?: () => void;
  linkProps: LinkOptions;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!benefit) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        onClick={onNavigate}
        activeOptions={{ exact: false, includeSearch: false }}
        {...linkProps}
        className={navItemClass}
        activeProps={navItemActiveProps}
      >
        {({ isActive }: { isActive: boolean }) => (
          <>
            {isActive ? (
              <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-primary" />
            ) : null}
            {solarIcon ? (
              <Icon
                icon={solarIcon}
                className="h-4 w-4 shrink-0 text-inherit"
              />
            ) : FallbackIcon ? (
              <FallbackIcon className="h-4 w-4 shrink-0" />
            ) : null}
            <span className="truncate">{label}</span>
          </>
        )}
      </Link>

      {benefit && coords && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[9999] w-52 -translate-y-1/2 rounded-xl border border-base-300 bg-base-100/98 p-2.5 shadow-xl backdrop-blur-md animate-in fade-in duration-100 hidden md:block text-base-content"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
        >
          <div className="font-bold text-[10px] text-primary uppercase tracking-wider mb-1">
            {label}
          </div>
          <p className="text-[11px] text-base-content/80 leading-snug font-normal">
            {benefit}
          </p>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ projectId, onNavigate, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const creditUsageQuery = useQuery({
    queryKey: ["userCreditUsageTopBar"],
    queryFn: () => getUserCreditUsageServerFn(),
    staleTime: 30000,
    enabled: Boolean(session?.user?.id),
  });

  const planId = (creditUsageQuery.data?.planId || "").toLowerCase();
  const isAgency =
    planId === "agency" || planId === "scale" || planId === "enterprise";

  const navGroups = [
    ...(projectId ? getProjectNavGroups(projectId) : []),
    getGrowthToolsNavGroup(isAgency),
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const onSamRoute = location.pathname.includes("/sam");

  const [view, setView] = useState<"browse" | "chat">(
    onSamRoute ? "chat" : "browse",
  );
  useEffect(() => {
    setView(onSamRoute ? "chat" : "browse");
  }, [onSamRoute]);

  const openChat = () => {
    setView("chat");
    if (!projectId) return;
    if (!onSamRoute) {
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: {},
      });
      onNavigate?.();
    }
  };

  const openBrowse = () => {
    setView("browse");
    if (!projectId || !onSamRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-base-300/80 bg-base-100/95 backdrop-blur-md">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4 border-b border-base-300/40">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-bold tracking-tight text-base-content transition-opacity hover:opacity-90"
        >
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="h-7 w-7 rounded-xl object-contain shadow-sm ring-1 ring-primary/20"
          />
          <span className="text-lg font-black tracking-tight text-base-content">
            {BRAND_CONFIG.name}
          </span>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold text-primary ring-1 ring-inset ring-primary/20">
            PRO
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Project Switcher */}
      <div className="px-3 pb-1 pt-3">
        <ProjectSwitcher
          activeProjectId={projectId}
          onCloseDrawer={onNavigate}
        />
      </div>

      {projectId ? (
        <div className="px-3 pb-1">
          <div role="tablist" className="tabs tabs-border w-full">
            <SidebarViewTab
              icon={LayoutGrid}
              solarIcon="icon-park-outline:dashboard-one"
              label="Tools"
              active={view === "browse"}
              onClick={openBrowse}
            />
            <SidebarViewTab
              icon={MessageCircle}
              solarIcon="icon-park-outline:comments"
              label="Skorvia AI"
              active={view === "chat"}
              onClick={openChat}
            />
          </div>
        </div>
      ) : null}

      {view === "chat" && projectId ? (
        <SamSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 space-y-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 pt-2 text-[10px] font-black uppercase tracking-wider text-base-content/45">
                {(group as { solarIcon?: string }).solarIcon ? (
                  <Icon
                    icon={(group as { solarIcon?: string }).solarIcon!}
                    className="h-3 w-3 text-primary/70"
                  />
                ) : null}
                <span>{group.label}</span>
              </div>
              {group.items.map((item) => {
                const { icon, solarIcon, label, benefit, ...linkProps } =
                  item as {
                    icon?: ComponentType<{ className?: string }>;
                    solarIcon?: string;
                    label: string;
                    benefit?: string;
                  } & LinkOptions;
                return (
                  <SidebarNavLink
                    key={linkProps.to as string}
                    icon={icon}
                    solarIcon={solarIcon}
                    label={label}
                    benefit={benefit}
                    onNavigate={onNavigate}
                    linkProps={linkProps}
                  />
                );
              })}
            </div>
          ))}
        </nav>
      )}

      <SidebarFooter onNavigate={onNavigate} />
    </div>
  );
}

function SidebarViewTab({
  icon: FallbackIcon,
  solarIcon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  solarIcon?: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`tab flex-1 gap-1.5 text-xs font-bold ${active ? "tab-active text-primary" : ""}`}
    >
      {solarIcon ? (
        <Icon icon={solarIcon} className="size-4" />
      ) : (
        <FallbackIcon className="size-4" />
      )}
      {label}
    </button>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const email = session?.user?.email;

  const closeMenu = () => {
    closeDropdown();
    onNavigate?.();
  };

  return (
    <div className="shrink-0 border-t border-base-300 px-3 py-2 pb-safe space-y-1">
      <SidebarNavLink
        solarIcon="icon-park-outline:help"
        label="Help & Documentation"
        onNavigate={onNavigate}
        linkProps={{ to: "/docs" }}
      />

      {email ? (
        <div className="dropdown dropdown-top w-full">
          <button
            type="button"
            tabIndex={0}
            className={`${navItemClass} w-full`}
            aria-label="Open account menu"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs font-semibold" data-ph-mask>
              {email}
            </span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-30 menu mb-1 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl text-xs"
          >
            <li>
              <Link
                to="/settings"
                onClick={closeMenu}
                className="rounded-xl py-1.5"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </li>
            {isHostedMode ? (
              <li>
                <Link
                  to={BILLING_ROUTE}
                  onClick={closeMenu}
                  className="rounded-xl py-1.5"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing & Quotas
                </Link>
              </li>
            ) : null}
            <ThemePreferenceMenuItems />
            {isHostedMode ? (
              <>
                <li
                  aria-hidden
                  className="pointer-events-none my-1 h-px bg-base-300 p-0"
                />
                <li>
                  <button
                    type="button"
                    className="text-error rounded-xl py-1.5 font-bold"
                    onClick={() => signOutAndRedirect()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      ) : (
        <SidebarNavLink
          solarIcon="icon-park-outline:setting-two"
          label="Settings"
          onNavigate={onNavigate}
          linkProps={{ to: "/settings" }}
        />
      )}
    </div>
  );
}

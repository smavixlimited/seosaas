import * as React from "react";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MissingSeoSetupModal,
  MobileSidebarDrawer,
  SeoApiStatusBanners,
} from "@/client/layout/AppShellParts";
import { GscReEngagementModal } from "@/client/features/gsc/GscReEngagementModal";
import { Sidebar } from "@/client/components/Sidebar";
import { VenixTopBar } from "@/client/layout/VenixTopBar";
import {
  InactivityLockModal,
  useInactivityDetector,
} from "@/client/features/auth/InactivityLockScreen";
import { BILLING_ROUTE } from "@/shared/billing";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getSeoApiKeyStatus } from "@/serverFunctions/config";
import { getProjects } from "@/serverFunctions/projects";
import { getLastProjectId } from "@/client/lib/active-project";

const DATAFORSEO_HELP_PATH = "/help/dataforseo-api-key";

export function AuthenticatedAppLayout({
  children,
  projectId,
  banner,
}: {
  children: React.ReactNode;
  projectId?: string;
  banner?: React.ReactNode;
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isScreenLocked, setIsScreenLocked] = React.useState(false);
  const setupModalRef = React.useRef<HTMLDivElement | null>(null);
  const [showMissingSeoApiKeyModal, setShowMissingSeoApiKeyModal] =
    React.useState(false);

  // 20-minute idle tracker for security lock
  useInactivityDetector(() => {
    setIsScreenLocked(true);
  }, !isScreenLocked);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    enabled: !projectId,
  });
  const [rememberedProjectId] = React.useState<string | null>(() =>
    getLastProjectId(),
  );
  const fallbackProjects = projectsQuery.data ?? [];
  const fallbackProjectId =
    fallbackProjects.find((project) => project.id === rememberedProjectId)
      ?.id ??
    fallbackProjects[0]?.id ??
    null;

  const sidebarProjectId =
    projectId ?? fallbackProjectId ?? rememberedProjectId;
  const shouldCheckSeoApiKeyStatus = location.pathname !== BILLING_ROUTE;
  const seoApiKeyStatusQuery = useQuery({
    queryKey: ["seoApiKeyStatus"],
    queryFn: () => getSeoApiKeyStatus(),
    enabled: shouldCheckSeoApiKeyStatus,
  });
  const isSeoApiKeyConfigured = shouldCheckSeoApiKeyStatus
    ? (seoApiKeyStatusQuery.data?.configured ?? null)
    : null;
  const seoApiKeyStatusError =
    shouldCheckSeoApiKeyStatus && seoApiKeyStatusQuery.isError;

  React.useEffect(() => {
    if (!shouldCheckSeoApiKeyStatus) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (seoApiKeyStatusQuery.isError) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (!seoApiKeyStatusQuery.isSuccess) return;
    setShowMissingSeoApiKeyModal(!seoApiKeyStatusQuery.data.configured);
  }, [
    location.pathname,
    seoApiKeyStatusQuery.data,
    seoApiKeyStatusQuery.isError,
    seoApiKeyStatusQuery.isSuccess,
    shouldCheckSeoApiKeyStatus,
  ]);

  const isHostedMode = isHostedClientAuthMode();

  const shouldShowMissingSeoApiKeyModal =
    !isHostedMode &&
    showMissingSeoApiKeyModal &&
    location.pathname !== DATAFORSEO_HELP_PATH;

  const shouldShowSeoApiWarning =
    !isHostedMode &&
    !seoApiKeyStatusError &&
    isSeoApiKeyConfigured === false &&
    !shouldShowMissingSeoApiKeyModal;

  React.useEffect(() => {
    if (!shouldShowMissingSeoApiKeyModal) return;

    setupModalRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMissingSeoApiKeyModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShowMissingSeoApiKeyModal]);

  return (
    <div className="flex h-[100dvh] w-full max-w-full bg-base-200/60 overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      {/* Desktop Venix Sidebar */}
      <div className="hidden shrink-0 md:block print:hidden">
        <Sidebar projectId={sidebarProjectId} />
      </div>

      {/* Main Content Area with Venix TopBar */}
      <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-hidden print:block print:h-auto print:overflow-visible print:w-full">
        <div className="print:hidden">
          <VenixTopBar
            projectId={sidebarProjectId}
            onToggleSidebar={() => setDrawerOpen((prev) => !prev)}
            drawerOpen={drawerOpen}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-base-100/50 print:block print:h-auto print:overflow-visible print:bg-white print:w-full">
          <div className="print:hidden">
            <SeoApiStatusBanners
              shouldShowSeoApiWarning={shouldShowSeoApiWarning}
              seoApiKeyStatusError={seoApiKeyStatusError}
            />

            {banner}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full print:block print:h-auto print:overflow-visible print:w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileSidebarDrawer
        open={drawerOpen}
        projectId={sidebarProjectId}
        onClose={() => setDrawerOpen(false)}
      />

      <MissingSeoSetupModal
        ref={setupModalRef}
        isOpen={shouldShowMissingSeoApiKeyModal}
        onClose={() => setShowMissingSeoApiKeyModal(false)}
      />

      <GscReEngagementModal
        projectId={sidebarProjectId}
        suppressed={shouldShowMissingSeoApiKeyModal}
      />

      <InactivityLockModal
        isOpen={isScreenLocked}
        onUnlock={() => setIsScreenLocked(false)}
      />
    </div>
  );
}

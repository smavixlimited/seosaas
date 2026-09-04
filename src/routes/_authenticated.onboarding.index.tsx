import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { OnboardingAccountMenu } from "@/client/features/onboarding/OnboardingAccountMenu";
import { SkorviaOnboardingWizard } from "@/client/features/onboarding/SkorviaOnboardingWizard";
import { onboardingAnswersQueryOptions } from "@/client/features/onboarding/onboardingModel";
import { queryClient } from "@/client/tanstack-db";
import { useSession } from "@/lib/auth-client";
import { getProjects } from "@/serverFunctions/projects";

export const Route = createFileRoute("/_authenticated/onboarding/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { step?: number } => {
    return { step: typeof search.step === "number" ? search.step : 1 };
  },
  beforeLoad: async () => {
    const data = await queryClient.ensureQueryData(
      onboardingAnswersQueryOptions(),
    );
    if (data.completedAt) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { data: session } = useSession();
  const onboardingQuery = useQuery(onboardingAnswersQueryOptions());
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  if (!onboardingQuery.data || !projectsQuery.data) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 bg-base-200/50">
        <div className="skeleton h-96 w-full max-w-xl rounded-3xl" />
      </div>
    );
  }

  const projects = projectsQuery.data ?? [];
  const activeProjectId = projects[0]?.id || "default";

  return (
    <div className="min-h-screen w-full bg-base-200/40 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mb-4 flex justify-end">
        <OnboardingAccountMenu email={session?.user?.email} />
      </div>

      <SkorviaOnboardingWizard
        projectId={activeProjectId}
        userEmail={session?.user?.email}
        userName={session?.user?.name}
      />
    </div>
  );
}

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { joinWaitlistServerFn } from "@/serverFunctions/waitlist";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/waitlist")({
  component: WaitlistPage,
});

const waitlistSchema = z.object({
  email: z.string().trim().email("Please enter a valid work email address"),
  name: z.string().trim().min(2, "Please enter your name"),
  company: z.string(),
  website: z.string(),
  useCase: z.string(),
});

function WaitlistPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [queueInfo, setQueueInfo] = React.useState<{
    position: number;
    email: string;
    isExisting: boolean;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      company: "",
      website: "",
      useCase: "AI & AEO Search Optimization",
    },
    validators: {
      onSubmit: waitlistSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await joinWaitlistServerFn({
          data: {
            email: value.email.trim(),
            name: value.name.trim(),
            company: value.company?.trim() || undefined,
            website: value.website?.trim() || undefined,
            useCase: value.useCase?.trim() || undefined,
          },
        });

        if (res.success) {
          setQueueInfo({
            position: res.position,
            email: value.email,
            isExisting: res.isExisting,
          });
          setIsSubmitted(true);
          toast.success(
            res.isExisting
              ? "You are already registered on the priority waitlist!"
              : "Welcome to the priority waitlist!",
          );
        }
      } catch (err: any) {
        toast.error(
          err.message || "Failed to join waitlist. Please try again.",
        );
      }
    },
  });

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-5 text-secondary dark:text-accent selection:bg-primary selection:text-white flex flex-col justify-between">
      <MarketingNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-xl mx-auto">
          {isSubmitted && queueInfo ? (
            <div className="rounded-3xl border border-stroke-3/60 dark:border-stroke-7 bg-white dark:bg-background-6 p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="size-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  className="size-9"
                />
              </div>

              <div className="space-y-2">
                <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full">
                  Priority Spot Confirmed
                </span>
                <h1 className="text-heading-4 sm:text-heading-3 font-bold tracking-tight text-secondary dark:text-accent font-interTight">
                  You are #{queueInfo.position} in line!
                </h1>
                <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-md mx-auto leading-relaxed">
                  We have reserved your early-access spot for{" "}
                  <strong className="text-secondary dark:text-accent">
                    {queueInfo.email}
                  </strong>
                  . As we open new onboarding slots this week, you will receive
                  an invitation email.
                </p>
              </div>

              {/* Priority Perks Card */}
              <div className="rounded-2xl bg-background-2 dark:bg-background-7 border border-stroke-3 dark:border-stroke-7 p-5 text-left space-y-3">
                <h4 className="text-xs font-bold text-secondary/50 dark:text-accent/50 uppercase tracking-wider">
                  Your Early-Adopter Perks:
                </h4>
                <ul className="space-y-2 text-tagline-2 text-secondary/80 dark:text-accent/80 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Icon
                      icon="solar:star-bold"
                      className="text-amber-500 size-4 shrink-0"
                    />
                    <span>50% lifetime discount on Growth & Pro tiers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Icon
                      icon="solar:bolt-bold"
                      className="text-primary size-4 shrink-0"
                    />
                    <span>Free AEO Brand Visibility audit for your domain</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="text-emerald-500 size-4 shrink-0"
                    />
                    <span>
                      Dedicated onboarding engineer & roadmap voting access
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Waitlist link copied to clipboard!");
                  }}
                  className="btn btn-primary btn-md rounded-full w-full sm:w-auto font-bold gap-2 shadow-md"
                >
                  <Icon icon="solar:share-bold" className="size-4" />
                  Share with Colleague
                </button>
                <Link
                  to="/sign-in"
                  className="btn btn-outline btn-md rounded-full w-full sm:w-auto font-bold"
                >
                  Already have an invite? Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stroke-3/60 dark:border-stroke-7 bg-white dark:bg-background-6 p-8 sm:p-10 shadow-2xl space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-brand-300 text-tagline-3 font-bold border border-primary/20">
                  <Icon icon="solar:lock-keyhole-bold" className="size-3.5" />
                  <span>Exclusive Early Access</span>
                </div>
                <h1 className="text-heading-4 sm:text-heading-3 font-bold tracking-tight text-secondary dark:text-accent font-interTight">
                  Join the Skorvia Priority Waitlist
                </h1>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 max-w-md mx-auto leading-relaxed">
                  Public registrations are currently locked while we scale
                  cluster capacity. Request priority onboarding below to skip
                  the queue.
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void form.handleSubmit();
                }}
              >
                {/* Full Name & Work Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field name="name">
                    {(field) => (
                      <fieldset className="space-y-1.5">
                        <label className="text-tagline-3 text-secondary dark:text-accent font-semibold block">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className="auth-form-input"
                          placeholder="Jane Doe"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                        />
                      </fieldset>
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(field) => (
                      <fieldset className="space-y-1.5">
                        <label className="text-tagline-3 text-secondary dark:text-accent font-semibold block">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          className="auth-form-input"
                          placeholder="jane@agency.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                        />
                      </fieldset>
                    )}
                  </form.Field>
                </div>

                {/* Company & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field name="company">
                    {(field) => (
                      <fieldset className="space-y-1.5">
                        <label className="text-tagline-3 text-secondary dark:text-accent font-semibold block">
                          Company / Brand
                        </label>
                        <input
                          type="text"
                          className="auth-form-input"
                          placeholder="Acme Growth"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </fieldset>
                    )}
                  </form.Field>

                  <form.Field name="website">
                    {(field) => (
                      <fieldset className="space-y-1.5">
                        <label className="text-tagline-3 text-secondary dark:text-accent font-semibold block">
                          Website URL
                        </label>
                        <input
                          type="text"
                          className="auth-form-input"
                          placeholder="acme.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </fieldset>
                    )}
                  </form.Field>
                </div>

                {/* Primary Use Case */}
                <form.Field name="useCase">
                  {(field) => (
                    <fieldset className="space-y-1.5">
                      <label className="text-tagline-3 text-secondary dark:text-accent font-semibold block">
                        Primary Focus / Interest
                      </label>
                      <select
                        className="auth-form-input appearance-none bg-no-repeat bg-right pr-8"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      >
                        <option value="AI & AEO Search Optimization">
                          AI & Answer Engine Optimization (ChatGPT / Perplexity)
                        </option>
                        <option value="Rank Tracking & SERP Monitoring">
                          Rank Tracking & SERP Real-Time Monitoring
                        </option>
                        <option value="Competitor Ad & Strategy Intelligence">
                          Competitor Ad Intelligence & Strategy Spying
                        </option>
                        <option value="Technical Site Audits & Automation">
                          Technical Site Audits & Automated Fixes
                        </option>
                        <option value="Agency Client White-Label Reporting">
                          Agency Multi-Client White-Label Management
                        </option>
                      </select>
                    </fieldset>
                  )}
                </form.Field>

                <form.Subscribe
                  selector={(state) => ({
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ isSubmitting }) => (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary btn-lg rounded-2xl w-full font-bold shadow-lg mt-2 text-white"
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          <span>Request Priority Access</span>
                          <Icon
                            icon="solar:arrow-right-bold"
                            className="size-4"
                          />
                        </>
                      )}
                    </button>
                  )}
                </form.Subscribe>
              </form>

              <div className="pt-2 text-center text-tagline-3 text-secondary/60 dark:text-accent/60">
                Already hold an invitation token?{" "}
                <Link
                  to="/sign-in"
                  className="text-primary dark:text-brand-300 font-bold hover:underline"
                >
                  Sign in here &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Clock, Lock } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/uptime-monitoring")({
  component: UptimeMonitoringFeaturePage,
});

function UptimeMonitoringFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
              Site Reliability & Security
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              5-Minute Uptime Monitoring & Instant Outage Alerts
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Never lose search engine ranking signals due to undetected
              downtime or expired SSL certificates.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary"
              >
                Start Uptime Monitoring
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Global 5-Minute Pings
              </h3>
              <p className="text-sm text-base-content/70">
                Distributed edge checks across North America, Europe, and Asia
                to verify DNS resolution and server response codes.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                SSL Expiry Warnings
              </h3>
              <p className="text-sm text-base-content/70">
                Receive proactive reminders 30, 14, and 3 days before your
                TLS/SSL certificates expire to prevent browser warning blocks.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Instant Slack & Webhook Alerts
              </h3>
              <p className="text-sm text-base-content/70">
                Trigger real-time incidents to Discord, Slack, PagerDuty, or
                custom webhook endpoints the moment response times spike.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

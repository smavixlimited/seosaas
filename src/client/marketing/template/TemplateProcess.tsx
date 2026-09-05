import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export function TemplateProcess() {
  const steps = [
    {
      step: "01",
      badge: "Step 1",
      icon: "solar:radar-2-bold",
      title: "Scan & Benchmark",
      description: "Connect your domain or run an instant site audit. Skorvia diagnoses your technical health, backlink profile, and AI citation visibility in under 60 seconds.",
    },
    {
      step: "02",
      badge: "Step 2",
      icon: "solar:eye-bold",
      title: "Spy & Outrank",
      description: "Spy on your rivals' winning Meta & Google ads, uncover the 50 keywords making them profitable, and capture low-difficulty Page 1 search terms.",
    },
    {
      step: "03",
      badge: "Step 3",
      icon: "solar:rocket-bold",
      title: "Automate Growth & Reports",
      description: "Receive signal-driven weekly Slack and email alerts. Auto-generate white-label PDF reports for clients and stakeholders with 1-click export.",
    },
  ];

  return (
    <section className="bg-base-200/50 dark:bg-[#13171e] py-20 lg:py-28 border-y border-base-300 dark:border-white/5">
      <div className="main-container">
        <div className="space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <div className="badge-green">
              <Icon icon="solar:route-bold" className="h-3.5 w-3.5" />
              <span>Simple 3-Step Execution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-base-content leading-tight">
              From Setup To Page 1 In 3 Simple Steps.
            </h2>
            <p className="text-base text-base-content/70 font-medium">
              No complex 30-day onboarding setups. Get actionable organic intelligence and competitor insights immediately.
            </p>
          </div>

          {/* 3 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-[24px] bg-base-100 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 p-8 shadow-xl flex flex-col justify-between space-y-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-primary/20 dark:text-brand-300/20">
                    {item.step}
                  </span>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon icon={item.icon} className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-base-content">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-base-300/60 dark:border-white/5 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Icon icon="solar:check-circle-bold" className="h-4 w-4" />
                  <span>Immediate Time-To-Value</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

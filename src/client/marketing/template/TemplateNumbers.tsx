import * as React from "react";
import { Icon } from "@iconify/react";

export function TemplateNumbers() {
  const stats = [
    { value: "3.2B+", label: "Keywords Indexed", sub: "Global SERP Coverage", color: "text-primary" },
    { value: "99.9%", label: "Live API Uptime", sub: "Enterprise Reliability", color: "text-indigo-600 dark:text-brand-300" },
    { value: "70%", label: "Cost Savings", sub: "vs Legacy $199/mo Suites", color: "text-emerald-500" },
    { value: "12,000+", label: "Websites Tracked", sub: "Worldwide Teams", color: "text-amber-500" },
  ];

  return (
    <section className="bg-base-200/50 dark:bg-[#13171e] py-16 sm:py-20 border-b border-base-300 dark:border-white/5">
      <div className="main-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-[20px] bg-base-100 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 shadow-lg space-y-2"
            >
              <div className={`text-3xl sm:text-4xl lg:text-5xl font-black ${stat.color} tracking-tight`}>
                {stat.value}
              </div>
              <div className="text-sm font-black text-base-content uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-xs font-semibold text-base-content/60">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

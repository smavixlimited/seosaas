import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

const teamMembers = [
  {
    name: "Darrell Steward",
    role: "Head of Search Architecture",
    icon: "solar:user-bold-duotone",
    gradient: "from-blue-600 via-indigo-600 to-primary",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      x: "https://x.com",
    },
  },
  {
    name: "Wade Warren",
    role: "Lead Ad Intelligence Engineer",
    icon: "solar:shield-user-bold-duotone",
    gradient: "from-indigo-600 via-purple-600 to-brand-300",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      x: "https://x.com",
    },
  },
  {
    name: "Kathryn Murphy",
    role: "VP of Product Analytics",
    icon: "solar:user-heart-bold-duotone",
    gradient: "from-emerald-500 via-teal-600 to-primary",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      x: "https://x.com",
    },
  },
  {
    name: "Brooklyn Simmons",
    role: "Principal AEO Research Lead",
    icon: "solar:stars-bold-duotone",
    gradient: "from-primary via-blue-500 to-cyan-400",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      x: "https://x.com",
    },
  },
];

export function TemplateTeam() {
  return (
    <section className="dark:bg-background-5 py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px] bg-background-2">
      <div className="main-container">
        <div>
          {/* Section Heading */}
          <div className="mx-auto mb-[50px] md:mb-[70px] max-w-[620px] text-center md:w-full space-y-4">
            <span className="badge badge-green mb-3">Our Team</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Our innovative, dynamic, and experienced team
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                A passionate group of search architects, machine learning researchers, and growth practitioners dedicated to transparent data.
              </p>
            </div>
          </div>

          {/* Members Grid */}
          <div className="mb-14 grid grid-cols-1 items-center justify-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="mx-auto h-[312px] w-[280px] sm:w-[298px] space-y-[24px] flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-background-6 border border-stroke-3/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Photo / Vector Avatar */}
                <div className={`size-[110px] rounded-full bg-gradient-to-tr ${member.gradient} p-1 shadow-lg shadow-primary/15 transition-transform duration-300 hover:scale-105 flex items-center justify-center relative`}>
                  <div className="size-full rounded-full bg-white dark:bg-background-6 flex items-center justify-center overflow-hidden">
                    <Icon icon={member.icon} className="size-14 text-primary dark:text-brand-300" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white dark:border-background-6 shadow-xs">
                    <Icon icon="solar:verified-check-bold" className="size-4 text-brand-300" />
                  </div>
                </div>

                {/* Info & Social */}
                <div className="space-y-[14px] text-center w-full">
                  <div>
                    <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
                      {member.name}
                    </h3>
                    <p className="text-tagline-3 text-secondary/60 dark:text-accent/60 mt-0.5">
                      {member.role}
                    </p>
                  </div>

                  {/* Social Circles */}
                  <div className="flex items-center justify-center gap-2">
                    {["github", "linkedin", "x"].map((platform) => (
                      <span
                        key={platform}
                        className="size-8 rounded-full border border-secondary/15 dark:border-accent/15 flex items-center justify-center text-[11px] font-semibold text-secondary/70 dark:text-accent/70 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                      >
                        {platform === "x" ? "𝕏" : platform === "github" ? "gh" : "in"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Button */}
          <div className="flex items-center justify-center">
            <Link
              to="/about"
              className="btn btn-md btn-secondary hover:btn-primary dark:btn-accent mx-auto block w-[90%] md:inline-block md:w-auto rounded-full"
            >
              View all team members
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

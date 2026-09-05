import * as React from "react";
import { Icon } from "@iconify/react";

interface VenixTableProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function VenixTable({
  title,
  subtitle,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  headerAction,
  children,
  footer,
}: VenixTableProps) {
  return (
    <div className="card rounded-3xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Header bar */}
      {(title || onSearchChange || headerAction) && (
        <div className="flex flex-col gap-3 border-b border-base-300/80 p-5 sm:flex-row sm:items-center sm:justify-between bg-base-200/20">
          <div>
            {title && (
              <h3 className="text-base font-black tracking-tight text-base-content">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {onSearchChange && (
              <div className="relative">
                <Icon
                  icon="solar:minimalistic-magnifer-line-duotone"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-content/50"
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="input input-bordered input-xs h-8 w-48 rounded-xl pl-8 text-xs focus:w-60 transition-all bg-base-100"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="table table-zebra table-sm w-full text-xs">
          {children}
        </table>
      </div>

      {/* Footer bar */}
      {footer && (
        <div className="border-t border-base-300/80 bg-base-200/20 px-5 py-3 text-xs text-base-content/70">
          {footer}
        </div>
      )}
    </div>
  );
}

export function VenixStatusBadge({
  status,
  label,
}: {
  status: "success" | "warning" | "danger" | "info" | "neutral";
  label: string;
}) {
  const badgeClasses = {
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    danger:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    neutral: "bg-base-200 text-base-content/70 border border-base-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
        badgeClasses[status]
      }`}
    >
      {label}
    </span>
  );
}

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Markdown } from "@/client/components/Markdown";
import { getDocByPath } from "@/lib/content";

export const Route = createFileRoute("/docs/mcp")({
  component: McpDocPage,
});

function McpDocPage() {
  const doc = getDocByPath("mcp");
  const [copied, setCopied] = React.useState(false);

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        skorvia: {
          url: "https://skorvia.com/mcp",
          headers: {
            Authorization: "Bearer <YOUR_SKORVIA_API_KEY>",
          },
        },
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    void navigator.clipboard.writeText(claudeConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Link to="/docs" className="hover:underline">
                Docs
              </Link>
              <span>/</span>
              <span>Model Context Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-base-content">
              Connect {BRAND_CONFIG.name} MCP to AI Clients
            </h1>
            <p className="text-base text-base-content/70">
              Query live keyword difficulty, SERP rankings, backlink velocity, and site audits directly from Claude Code, Cursor, and custom agent workflows.
            </p>
          </div>

          {/* Configuration Snippet */}
          <div className="rounded-2xl border border-base-300 bg-base-200/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-base-content/70">
                claude_desktop_config.json / .cursor/mcp.json
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-ghost btn-xs gap-1 text-xs font-bold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-base-100 p-4 text-xs font-mono text-base-content/90 border border-base-300">
              <code>{claudeConfig}</code>
            </pre>
          </div>

          {/* Render Full Markdown Guide */}
          {doc && (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xs">
              <Markdown>{doc.content}</Markdown>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

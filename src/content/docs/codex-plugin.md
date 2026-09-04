---
title: "Install the Skorvia plugin for Codex"
description: "Add Skorvia MCP and Agent Skills to Codex with one marketplace and one install command."
---

The Skorvia plugin bundles Skorvia MCP and all nine SEO Agent Skills into one install. This is the preferred way to set up Skorvia in Codex CLI.

## Install

Run these commands in your terminal:

```bash
codex plugin marketplace add skorvia/marketplace
codex plugin add skorvia@skorvia
codex mcp login skorvia
```

`codex mcp login` opens a browser to approve the Skorvia connection. If it reports that `skorvia` isn't found, restart Codex first — bundled MCP servers only register after a restart, not immediately after install — then run `codex mcp login skorvia` again.

Codex connects Skorvia MCP at `https://app.skorvia.com/mcp` and enables nine skills:

- SEO Project Setup
- SEO Coach
- SEO Audit
- Keyword Research
- Keyword Clustering
- Competitive Landscape
- Competitor Analysis
- Local SEO
- Link Prospecting

## Run a skill

Type `$` in Codex to see available skills, or ask Codex to run one by name, for example "run seo-project-setup" or "run seo-audit on example.com".

## Update or remove

```bash
codex plugin marketplace upgrade skorvia
codex plugin remove skorvia@skorvia
```

## Troubleshooting

If the Skorvia MCP server doesn't appear after restart, run `/mcp` in the Codex TUI to check its status, then run `codex mcp login skorvia` again.

If it still doesn't authenticate, log out first and retry:

```bash
codex mcp logout skorvia
codex mcp login skorvia
```

If a `codex plugin` command reports "unrecognized subcommand," run `codex plugin --help` to see the subcommands your installed version actually supports — they've changed across versions (for example, `add`/`remove`, not `install`/`uninstall`).

## Other clients

This plugin is for Codex CLI. For Claude Code, use the [Skorvia plugin for Claude Code](/docs/claude-code-plugin) instead. For Claude Desktop, Cursor, Codex Desktop, or an API key setup, see [Set up Skorvia MCP](/docs/mcp) and [Set up Skorvia Agent Skills](/docs/skills/setup).

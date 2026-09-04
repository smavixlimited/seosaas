---
title: "Install the Skorvia plugin for Claude Code"
description: "Add Skorvia MCP and Agent Skills to Claude Code with one marketplace and one install command."
---

The Skorvia plugin bundles Skorvia MCP and all nine SEO Agent Skills into one install. This is the preferred way to set up Skorvia in Claude Code.

## Install

Run these two commands in Claude Code:

```bash
/plugin marketplace add skorvia/marketplace
/plugin install skorvia@skorvia
```

If the install summary says `Run /reload-plugins to activate.`, run that command.

Claude Code connects Skorvia MCP at `https://app.skorvia.com/mcp` and enables nine skills:

- SEO Project Setup
- SEO Coach
- SEO Audit
- Keyword Research
- Keyword Clustering
- Competitive Landscape
- Competitor Analysis
- Local SEO
- Link Prospecting

## Finish the login

Claude Code should prompt you to log in to Skorvia right after install. If it doesn't, run `/mcp` and approve the Skorvia connection from there.

## Run a skill

Plugin skills are namespaced by the plugin name:

```
/skorvia:seo-project-setup
/skorvia:seo-coach
/skorvia:seo-audit
/skorvia:keyword-research
/skorvia:keyword-clustering
/skorvia:competitive-landscape
/skorvia:competitor-analysis
/skorvia:local-seo
/skorvia:link-prospecting
```

## Claude Desktop

Claude Desktop doesn't support this plugin format — plugins are a Claude Code feature. For Claude Desktop, [add Skorvia as an MCP connector](/docs/mcp#claude-desktop) instead.

## Update or remove

```bash
/plugin marketplace update skorvia
/plugin uninstall skorvia@skorvia
```

Updates land in the cache immediately, but the running session keeps the old version until you run `/reload-plugins` or restart Claude Code.

## Troubleshooting

To check what's actually installed, run `/plugin list` rather than bare `/plugin` — `/plugin` alone opens an interactive panel that doesn't show plain text.

If `/reload-plugins` reports `0 skills`, that's normal, not a failure — its summary only counts a plugin's `commands/` directory, not `skills/`. Confirm the skills loaded by running one directly, for example `/skorvia:seo-audit`.

If `/plugin uninstall skorvia@skorvia` reports "not installed in this project," you likely installed to a different scope than the one being checked (User, Project, or Local). Run `/plugin list` to see the actual scope, or sidestep the picker entirely with the shell form: `claude plugin uninstall skorvia@skorvia --scope user`.

If plugin skills don't appear, clear the plugin cache with `rm -rf ~/.claude/plugins/cache` — this clears every installed plugin's cache, not just Skorvia's, so reinstall anything else you have after — then restart Claude Code and reinstall the plugin.

If the Skorvia connection doesn't show as authenticated, run `/mcp`, select Skorvia, and complete the login.

## Other clients

This plugin is for Claude Code. For Codex CLI, use the [Skorvia plugin for Codex](/docs/codex-plugin) instead. For Cursor, Codex Desktop, Claude Desktop, or an API key setup, see [Set up Skorvia MCP](/docs/mcp) and [Set up Skorvia Agent Skills](/docs/skills/setup).

---
title: "Set up Skorvia Agent Skills"
description: "Add Skorvia skill files to your AI agent after connecting Skorvia MCP."
---

Skorvia Agent Skills are separate files from Skorvia MCP.

On Claude Code, skip the steps below and use the [Skorvia plugin](/docs/claude-code-plugin) instead — it installs MCP and every skill in one step. On Codex CLI, use the [Skorvia plugin](/docs/codex-plugin) the same way.

First, [set up Skorvia MCP](/docs/mcp). MCP gives your agent access to Skorvia data.

Then add the Skorvia `SKILL.md` files you want your agent to use. Each skill gives your agent one SEO workflow.

## Choose an installation option

Pick the option that matches how you want to install the files.

### Option 1: Install and choose interactively

Use this if you want the installer to show the available skills and agents.

```bash
npx skills add every-app/skorvia
```

### Option 2: Install all Skorvia skills

Use this if you want every Skorvia skill.

```bash
npx skills add every-app/skorvia --skill '*'
```

### Option 3: Install all skills for Claude Code only

Use this if the skills should be available in Claude Code only.

```bash
npx skills add every-app/skorvia --skill '*' --agent claude-code
```

### Option 4: Install all skills for OpenAI Codex only

Use this if the skills should be available in Codex only.

```bash
npx skills add every-app/skorvia --skill '*' --agent codex
```

### Option 5: Copy the skill files manually

Use this if you prefer to copy files into your agent's skills folder.

```bash
git clone https://github.com/every-app/skorvia.git

# Codex
mkdir -p ~/.codex/skills
cp -R skorvia/.agents/skills/* ~/.codex/skills/

# Claude Code
mkdir -p ~/.claude/skills
cp -R skorvia/.agents/skills/* ~/.claude/skills/
```

You can also review the source skills on GitHub:

- [Skorvia Agent Skills on GitHub](https://github.com/every-app/skorvia/tree/main/.agents/skills)

Each skill page also links to its source `SKILL.md`.

## Run a skill

After the skill files are available to your agent, run the matching slash command:

- `/seo-project-setup`
- `/seo-coach`
- `/keyword-research`
- `/keyword-clustering`
- `/competitive-landscape`
- `/competitor-analysis`
- `/link-prospecting`
- `/local-seo`
- `/seo-audit`

## Next step

Start with [SEO Project Setup](/docs/skills/seo-project-setup) if this is a new SEO project, or [SEO Coach](/docs/skills/seo-coach) if you are not sure which workflow to run first.

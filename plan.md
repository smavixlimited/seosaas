# Master SaaS Implementation Plan: Skorvia Transformation & Feature Integration

> **Role & Persona:** Principal Full-Stack Architect (TypeScript, React 19, TanStack Start/Router/Query, Drizzle ORM, Tailwind CSS, Firecrawl API, DataForSEO API, and LLM Engines).
> **Goal:** Deliver the complete Skorvia platform with unified Navigation, Brand & Ad Readiness, Competitor Intelligence, Organic SEO, Local Business Suite, Action Roadmap, and PDF Reporting.

---

## 🏛️ System Navigation Architecture

```
SKORVIA NAVIGATION
│
├── 📊 OVERVIEW
│   ├── Main Dashboard (/dashboard) — Executive KPIs, Score Trends, Share of Voice
│   ├── Action Roadmap (/roadmap) — Actionable growth roadmap with streaks & auto-verification
│   └── My Analysis (/my-analysis) — Categorized tabs (Brand Analysis, Competitor Analysis, Competitor Ads) + PDF Export
│
├── 🛡️ BRAND & AD READINESS
│   ├── Brand Analysis (/brand-analysis) — 6-dimension credibility & conversion readiness audit
│   ├── Audience Trust & Sentiment (/trust-sentiment) — "Pre-Ad Gate" to verify sentiment before ad spend
│   └── Viral Content & Opportunity Detector (/viral-detector) — Trending angles, high-CTR hooks & creative ideas
│
├── ⚔️ COMPETITOR INTELLIGENCE
│   ├── Competitors Directory (/competitors) — Tracked competitors directory with website & social links (Add/Edit/Delete)
│   └── Competitor Analysis & Decoder (/competitor-analysis) — 1-on-1 Head-to-Head selector & comparative AI analysis
│
├── 🔍 ORGANIC SEARCH (SEO)
│   ├── Keyword Research (/keyword-research) — High-volume, low-competition term discovery
│   ├── Saved Keywords (/saved-keywords) — Tagged & organized keyword lists
│   ├── GSC Insights (/gsc-insights) — Google Search Console impressions, clicks, queries & CTR
│   ├── Rank Tracker (/rank-tracker) — Real-time Google rank positions & SERP features
│   └── Backlinks & Site Health (/site-health) — Live crawls, backlink profile & technical health score
│
├── 📍 LOCAL BUSINESS
│   ├── Listing Management (/local/listings) — Single-entry NAP push to 70+ directories & duplicate detection
│   ├── Google Business Profile (GBP) Optimization (/local/gbp) — Direct profile updates, AI posts & photo publishing
│   ├── Review Management (/local/reviews) — Unified multi-platform review inbox with 1-click AI replies
│   └── Map Rank Tracker (/local/map-tracker) — Visual Geo-Grid ranking heatmap across neighborhoods
│
├── 🛰️ AI SEARCH & RADAR
│   ├── Brand Lookup (/ai-radar/brand-lookup) — AI search engine visibility checks
│   ├── Brand Mentions & AEO (/ai-radar/mentions) — Online sentiment & answer engine mentions
│   └── Prompt Explorer (/ai-radar/prompt-explorer) — Visibility inside ChatGPT, Perplexity, Claude & Gemini
│
└── 🚀 GROWTH & TOOLS
    ├── Instant Indexing (/growth/indexing) — Google Indexing API & Bing IndexNow submissions
    ├── Uptime & SSL (/growth/uptime) — Live ping monitoring & SSL certificate expiry tracker
    ├── Skorvia AI & MCP (/ai) — SAM AI Assistant & MCP Protocol endpoints
    └── Help & Documentation (/docs) — Guides, API docs & developer integration specs
```

---

## ⚙️ Backend Data Engines & Roles

1. **Firecrawl API**: Fast web scraping & markdown extraction. Pulls landing page copy, value propositions, pricing, customer reviews, and directory listings for deep LLM evaluation.
2. **DataForSEO API**: Live Google SERP rankings, keyword metrics (volume, CPC), backlink graph, technical OnPage crawler, and Google Maps Local SERP Geo-Grids.
3. **LLM Engine (OpenAI / Anthropic)**: 6-dimension Brand scoring, head-to-head competitor comparative synthesis, viral hook generation, and AI review responses.
4. **Google Search Console & Indexing API**: Real-time performance intake and instant URL crawl indexing.
5. **Google Business Profile (GBP) API**: Direct business updates, photo publishing, and review synchronization.

---

## 🗺️ Master Project Roadmap (Phases 1 to 48)

```mermaid
flowchart TD
    subgraph Completed Foundations [Phases 1 to 39 - COMPLETED]
        P1_39[Phases 1 to 39: Core SEO Engine, Geolocation Billing, Local GBP Base, AI Visibility AEO, My Reports, 2FA, Team RBAC, Venix UI Polish, Blog CMS, Coupon Engine, Competitor Strategy Decoder, Actionable Growth Roadmap, Brand Mentions AEO Listening Hub & Conversion Ad Readiness Audit Scorecard]
    end

    subgraph Active Skorvia Transformation [Phases 40 to 48 - IN PROGRESS]
        P40[Phase 40: Terminology & Navigation Overhaul] --> P41[Phase 41: Auth Suite & 20-Min Lock Screen]
        P41 --> P42[Phase 42: Responsive Onboarding & Competitor Sync]
        P42 --> P43[Phase 43: Competitors Directory & 1-on-1 Competitor Analysis]
        P43 --> P44[Phase 44: Brand Analysis & Ad-Readiness Engine]
        P44 --> P45[Phase 45: Audience Trust Pre-Ad Gate & Viral Content Detector]
        P45 --> P46[Phase 46: Action Roadmap & My Analysis PDF Suite]
        P46 --> P47[Phase 47: Local Business Suite - Listings, GBP, Reviews, Geo-Grid Heatmap]
        P47 --> P48[Phase 48: Polish, Global Verification & Deployment]
    end

    Completed Foundations --> Active Skorvia Transformation
```

---

## 📜 PHASES 1 TO 39 (COMPLETED & PRESERVED)

* **Phases 1 to 15:** Core branding, Drizzle schemas, multi-gateway billing, caching layer, growth features, user dashboard, auth, onboarding, notifications, translation, Local SEO, AI visibility, and reports.
* **Phases 16 to 22:** Global system settings, user management, impersonation, RBAC, dynamic pricing, blog CMS base, monitoring logs.
* **Phases 23 to 26:** 2FA TOTP, device alerts, hierarchical team management, monetization meters, cancellation retention, and Monday digests.
* **Phases 27 to 33:** Public marketing website elevation, Semrush-grade mega-menus, currency dropdown, solution pages, and verification suites.
* **Phase 34:** Complete Venix UI alignment, rich-text Blog CMS, real file uploads, granular plan feature matrix, and dynamic model selector.
* **Phases 35 to 39:** Promotional Coupon Engine, Competitor Strategy Decoder base, Action Roadmap base, Brand Mentions Listening Hub, and Ad Readiness Audit base.

---

### 🔹 Phase 40: Terminology & Navigation Overhaul & Security Clean-Up
- **Objective:** Replace every instance of "Project" with **"Brand"** across the entire UI, align the sidebar to the 7 pillars, and remove privileged Admin links from user menus.
- **Key Tasks:**
  1. Update user profile dropdown (`VenixTopBar.tsx`): Change *"Switch Project"* $\rightarrow$ **"Switch Brand"**, *"My Projects"* $\rightarrow$ **"My Brands"**, *"Active Project"* $\rightarrow$ **"Active Brand"**, *"Create Project"* $\rightarrow$ **"Add New Brand"**.
  2. **Security Polish:** Remove the direct *"Super-Admin Portal"* link from the standard user profile dropdown menu.
  3. Update breadcrumbs, modals, tooltips, and page headers from Project $\rightarrow$ Brand.
  4. Reorganize `src/client/navigation/items.ts` to match the 7 new navigation pillars.
- **Verification:** UI inspection of sidebar, header, and profile dropdown menu.

---

### 🔹 Phase 41: Auth Suite Elevation, Admin Login & 20-Min Inactivity Lock Screen
- **Objective:** Redesign Login, Register, Logout, and Inactivity Lock Screen with exact fidelity to the Venix template design (`dashboard/auth-*.html`), enforce registration disable toggles, and add a dedicated Admin Login page.
- **Key Tasks:**
  1. **Login Page (`/login`):** Match `dashboard/auth-login.html` (Left testimonial slider + Right login card with Google auth, remember me, forgot password, and legal footer).
  2. **Register Page (`/register`):** Match `dashboard/auth-register.html` (Username, email, password, repeat password, terms checkbox, and Google signup).
  3. **Enforce Disable Registration:** When registration is disabled in Admin settings (`allowRegistration: false`), block new signups immediately on both the `/register` UI and the registration API endpoint with a clean *"Registration is currently closed"* notice.
  4. **Dedicated Admin Login (`/admin/login`):** Separate, secure admin authentication screen requiring password validation before granting access to `/admin` routes.
  5. **Logout Page (`/logout`):** Match `dashboard/auth-logout.html` (Logged out card, user avatar badge, and "Back to Login" action).
  6. **20-Minute Inactivity Lock Screen (`/lock-screen` & Modal):** Match `dashboard/auth-lock-screen.html` (Triggers automatically after 20 minutes of idle mouse/keyboard time, displays user avatar/name, and unlocks with password).
- **Verification:** Test user login, registration disable toggle, dedicated admin login with password, logout, and 20-min idle lock screen.

---

### 🔹 Phase 42: Responsive Onboarding & Competitor Sync (With Company Size & Industry)
- **Objective:** Rebuild the onboarding wizard into a fully responsive, skippable flow that collects Company Size, Industry, Brand details, and 3 Competitors directly into the database.
- **Key Tasks:**
  1. **Mobile-Responsive Steps** with **"Skip Step"** option on every card.
  2. **Step 1 (Business Profile):** Brand Website URL + **Industry** (E-commerce, B2B SaaS, Agency, Local Business, Healthcare, Finance, etc.) + **Company Size** (`1-5`, `6-10`, `11-20`, `21+`) + Target Country.
  3. **Step 2 (Social Presence):** Brand Social Media Links (Instagram, LinkedIn, X, Facebook).
  4. **Step 3 (Competitor Directory):** Up to 3 Competitors (Website URL + Social Media Handles) $\rightarrow$ Persists to DB `competitors` table.
  5. **Step 4 (Launch Pad):** Three action cards:
     - 📊 **Go to Dashboard**
     - 🛡️ **Run Brand Analysis**
     - ⚔️ **Run Competitor Analysis**
- **Verification:** Test onboarding from signup $\rightarrow$ skip $\rightarrow$ launch pad redirect $\rightarrow$ verify DB persistence of company size, industry, and competitors.

---

### 🔹 Phase 43: Competitors Directory & 1-on-1 Competitor Analysis
- **Objective:** Build a dedicated directory to manage competitors and a 1-on-1 comparative intelligence engine.
- **Key Tasks:**
  1. **Competitors Directory (`/competitors`):** Card/table view of all saved competitors with website, social links, date added, and Full CRUD (Add / Edit / Delete).
  2. **Competitor Analysis & Decoder (`/competitor-analysis`):**
     - Dropdown selector to choose **1 competitor at a time** against the active Brand.
     - Live data pipeline: Firecrawl scrapes landing pages + DataForSEO fetches rankings/backlinks.
     - LLM Comparative Synthesis: Strengths vs. Weaknesses, Keyword Gaps, Ad & Messaging Angles, and Tactical Playbook.
- **Verification:** Add/edit/delete competitor $\rightarrow$ run head-to-head comparison $\rightarrow$ verify side-by-side results.

---

### 🔹 Phase 44: Brand Analysis & Ad-Readiness Engine
- **Objective:** Full 6-dimension credibility & conversion readiness audit with direct export to Action Roadmap.
- **Key Tasks:**
  1. **Brand Analysis Engine (`/brand-analysis`):**
     - Scrapes brand website via Firecrawl and audits technical foundation via DataForSEO.
     - Grades 6 dimensions: Website Credibility, Content Depth, Social Engagement, Review Health, Technical Foundation, Conversion Readiness.
     - Displays overall Ad-Readiness Score (0–100) and Letter Grade (A–F).
  2. **Solution Generator & Roadmap Export:**
     - Displays specific issues with step-by-step solutions.
     - 1-click **`[ 🚀 Export to Action Roadmap ]`** button that auto-creates tasks in the user's roadmap.
- **Verification:** Run brand analysis on a URL $\rightarrow$ verify 6-dimension scores $\rightarrow$ export issues to Action Roadmap.

---

### 🔹 Phase 45: Audience Trust ("Pre-Ad Gate") & Viral Content Detector
- **Objective:** Provide a pre-ad campaign sentiment validator and a high-CTR viral content discovery tool.
- **Key Tasks:**
  1. **Audience Trust & Sentiment (`/trust-sentiment`):**
     - Positioned as the *"Pre-Ad Gate"*: Checks review sentiment and brand trust before spending ad dollars.
     - Output: Ad-Ready status badge (Ready / Needs Attention / High Friction) + Trust Index.
  2. **Viral Content & Opportunity Detector (`/viral-detector`):**
     - Scans industry trends, high-performing competitor hooks, and viral social patterns.
     - Generates ready-to-use hooks, headline variations, and ad creative angles tailored to the brand's niche.
- **Verification:** Test sentiment analysis and generate viral content hooks for a selected brand niche.

---

### 🔹 Phase 46: Action Roadmap & My Analysis Suite
- **Objective:** Deliver the gamified Action Roadmap and a centralized analysis repository with PDF export.
- **Key Tasks:**
  1. **Action Roadmap (`/roadmap`):**
     - Filter tabs: All, Quick Wins (<5m), High Impact, Technical, Content & Gaps.
     - Task tracking with completion streaks, milestone badges, and live auto-verification.
  2. **My Analysis (`/my-analysis`):**
     - Tabbed archive: `[ Brand Analysis ]` | `[ Competitor Analysis ]` | `[ Competitor Ads ]`.
     - Displays historical reports with date stamps and score badges.
     - **PDF Export:** Generates clean, client-ready, printable PDF reports.
- **Verification:** Complete tasks on roadmap $\rightarrow$ verify streak counter $\rightarrow$ generate and download PDF report.

---

### 🔹 Phase 47: Local Business Suite (Listings, GBP, Reviews, Geo-Grid Heatmap)
- **Objective:** Complete local SEO ecosystem for multi-location and brick-and-mortar brands.
- **Key Tasks:**
  1. **Listing Management (`/local/listings`):** Enter NAP (Name, Address, Phone) once $\rightarrow$ simulated/live push to 70+ directories with duplicate listing finder.
  2. **Google Business Profile (GBP) Optimization (`/local/gbp`):** Business info editor, AI social post creator, and photo management.
  3. **Review Management (`/local/reviews`):** Unified multi-platform review inbox with 1-click AI response generator.
  4. **Map Rank Tracker (`/local/map-tracker`):** Visual **Geo-Grid Ranking Heatmap** (e.g., 3x3 / 5x5 grid) displaying Google Maps positions across neighborhood coordinates.
- **Verification:** Test NAP consistency check, AI review reply generation, and Geo-Grid heatmap rendering.

---

### 🔹 Phase 48: Polish, Global Verification & Deployment
- **Objective:** End-to-end integration testing, type-safety checks, Docker build optimization, and server deployment.
- **Key Tasks:**
  1. Run `pnpm types:check` and linting to ensure zero TypeScript errors.
  2. Verify all routes on desktop and mobile viewports.
  3. Prepare Docker build updates and deploy to production server.
- **Verification:** Successful build and live testing on `https://skorvia.live`.

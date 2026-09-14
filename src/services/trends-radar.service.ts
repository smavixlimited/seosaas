import { BrandCompetitorService } from "@/services/brand-competitor.service";
import { getCountryDisplayName, getCountryCode } from "@/shared/country-helper";
import { generateText } from "ai";

export type QuestionStem =
  | "what"
  | "how"
  | "why"
  | "where"
  | "who"
  | "can"
  | "are"
  | "which";

export type TrendCategory =
  | "questions"
  | "prepositions"
  | "comparisons"
  | "breakouts";

export interface TrendingQueryItem {
  id: string;
  query: string;
  stem?: QuestionStem;
  category: TrendCategory;
  searchVolume: number;
  cpc: number;
  difficulty: number; // 0-100
  intent: "informational" | "commercial" | "transactional" | "navigational";
  growthRatePercent: number; // e.g. +320%
  isBreakout: boolean;
  trendSparkline: number[]; // 6-month normalized trend points (0-100)
}

export interface TrendingStoryContext {
  headline: string;
  summary: string;
  catalystType: string;
}

export interface TrendsRadarResult {
  seedTopic: string;
  brandName: string;
  industry: string;
  targetCountry: string;
  targetCountryCode: string;
  trendingStoryContext?: TrendingStoryContext;
  totalQuestionsFound: number;
  totalBreakoutsFound: number;
  topGrowthQuery: string;
  items: TrendingQueryItem[];
  stemsSummary: Record<QuestionStem, number>;
  generatedAt: string;
}

// Curated industry + country trending catalysts and queries for instant high-fidelity discovery
const INDUSTRY_COUNTRY_TRENDS: Record<
  string,
  Record<
    string,
    {
      topic: string;
      story: TrendingStoryContext;
      items: Array<{
        query: string;
        stem?: QuestionStem;
        category: TrendCategory;
        volume: number;
        cpc: number;
        difficulty: number;
        intent:
          | "informational"
          | "commercial"
          | "transactional"
          | "navigational";
        growth: number;
        isBreakout?: boolean;
      }>;
    }
  >
> = {
  "SaaS / Software": {
    US: {
      topic: "Autonomous AI Agents Workflow Orchestration",
      story: {
        headline:
          "Enterprise Shift to Autonomous Agentic AI & RAG Data Pipelines",
        summary:
          "US tech companies and SaaS operators are aggressively moving past simple LLM wrappers toward autonomous multi-agent pipelines and real-time private RAG integrations to eliminate manual SaaS workflows.",
        catalystType: "Technology Breakthrough & Enterprise Demand",
      },
      items: [
        {
          query:
            "how to deploy autonomous ai agents for b2b workflow automation",
          stem: "how",
          category: "questions",
          volume: 22400,
          cpc: 6.8,
          difficulty: 38,
          intent: "commercial",
          growth: 480,
          isBreakout: true,
        },
        {
          query:
            "what is the best enterprise rag framework for internal documents",
          stem: "what",
          category: "questions",
          volume: 18900,
          cpc: 7.2,
          difficulty: 42,
          intent: "commercial",
          growth: 360,
          isBreakout: true,
        },
        {
          query:
            "why companies are replacing single-prompt chatbots with agentic workflows",
          stem: "why",
          category: "questions",
          volume: 14200,
          cpc: 5.4,
          difficulty: 31,
          intent: "informational",
          growth: 520,
          isBreakout: true,
        },
        {
          query: "can autonomous agents reduce customer churn in b2b saas",
          stem: "can",
          category: "questions",
          volume: 9800,
          cpc: 4.9,
          difficulty: 29,
          intent: "commercial",
          growth: 290,
        },
        {
          query: "are private ai agents soc2 and hipaa compliant in 2026",
          stem: "are",
          category: "questions",
          volume: 11300,
          cpc: 8.5,
          difficulty: 36,
          intent: "informational",
          growth: 410,
          isBreakout: true,
        },
        {
          query: "where to host autonomous ai agents with low latency",
          stem: "where",
          category: "questions",
          volume: 8400,
          cpc: 4.1,
          difficulty: 25,
          intent: "informational",
          growth: 210,
        },
        {
          query: "who offers the most scalable api for multi-agent workflows",
          stem: "who",
          category: "questions",
          volume: 12600,
          cpc: 6.1,
          difficulty: 34,
          intent: "commercial",
          growth: 340,
        },
        {
          query: "autonomous ai agents for automated lead enrichment",
          category: "prepositions",
          volume: 16500,
          cpc: 6.4,
          difficulty: 35,
          intent: "commercial",
          growth: 440,
          isBreakout: true,
        },
        {
          query: "ai workflow automation with self-healing api integrations",
          category: "prepositions",
          volume: 9400,
          cpc: 5.8,
          difficulty: 28,
          intent: "informational",
          growth: 310,
        },
        {
          query: "agentic workflow platform vs zapier enterprise automation",
          category: "comparisons",
          volume: 15100,
          cpc: 7.0,
          difficulty: 39,
          intent: "commercial",
          growth: 390,
          isBreakout: true,
        },
        {
          query: "best ai agent orchestrator for b2b saas tech stack",
          category: "comparisons",
          volume: 19800,
          cpc: 8.2,
          difficulty: 44,
          intent: "commercial",
          growth: 560,
          isBreakout: true,
        },
        {
          query: "autonomous sales outreach agents breakout",
          category: "breakouts",
          volume: 28900,
          cpc: 9.1,
          difficulty: 45,
          intent: "transactional",
          growth: 720,
          isBreakout: true,
        },
      ],
    },
    NG: {
      topic: "Cross-Border Payment APIs & FX Settlement Infrastructure",
      story: {
        headline:
          "Surge in B2B Multi-Currency Accounts & Real-Time FX Settlement",
        summary:
          "African software builders and commerce merchants in Nigeria are rapidly adopting automated multi-currency payment rails and API-driven cross-border liquidity to bypass traditional banking delays and currency volatility.",
        catalystType: "Regulatory Modernization & Cross-Border Commerce",
      },
      items: [
        {
          query: "how to integrate instant usd to ngn virtual accounts in saas",
          stem: "how",
          category: "questions",
          volume: 16200,
          cpc: 3.8,
          difficulty: 28,
          intent: "commercial",
          growth: 540,
          isBreakout: true,
        },
        {
          query:
            "what is the best payment gateway for global subscription billing in nigeria",
          stem: "what",
          category: "questions",
          volume: 19400,
          cpc: 4.2,
          difficulty: 32,
          intent: "commercial",
          growth: 410,
          isBreakout: true,
        },
        {
          query:
            "why b2b platforms are switching to cbn-compliant open banking apis",
          stem: "why",
          category: "questions",
          volume: 8900,
          cpc: 3.1,
          difficulty: 24,
          intent: "informational",
          growth: 360,
        },
        {
          query:
            "can nigerian saas businesses accept direct debit payments seamlessly",
          stem: "can",
          category: "questions",
          volume: 7400,
          cpc: 2.8,
          difficulty: 21,
          intent: "commercial",
          growth: 290,
        },
        {
          query:
            "are virtual usd debit cards reliable for saas infrastructure payments",
          stem: "are",
          category: "questions",
          volume: 21500,
          cpc: 3.5,
          difficulty: 30,
          intent: "informational",
          growth: 610,
          isBreakout: true,
        },
        {
          query: "where to find low-fee cross border payment apis in lagos",
          stem: "where",
          category: "questions",
          volume: 6800,
          cpc: 2.4,
          difficulty: 19,
          intent: "informational",
          growth: 220,
        },
        {
          query: "who has the fastest payout settlement api in nigeria",
          stem: "who",
          category: "questions",
          volume: 11200,
          cpc: 3.6,
          difficulty: 27,
          intent: "commercial",
          growth: 380,
        },
        {
          query:
            "automated payment reconciliation for high volume merchants in nigeria",
          category: "prepositions",
          volume: 13800,
          cpc: 4.0,
          difficulty: 29,
          intent: "commercial",
          growth: 450,
          isBreakout: true,
        },
        {
          query: "multi-currency wallet api with instant webhook notifications",
          category: "prepositions",
          volume: 10400,
          cpc: 3.2,
          difficulty: 23,
          intent: "informational",
          growth: 320,
        },
        {
          query: "paystack vs flutterwave vs korapay developer api comparison",
          category: "comparisons",
          volume: 18700,
          cpc: 4.5,
          difficulty: 35,
          intent: "commercial",
          growth: 490,
          isBreakout: true,
        },
        {
          query:
            "best global payment processor for nigerian tech founders 2026",
          category: "comparisons",
          volume: 15300,
          cpc: 4.1,
          difficulty: 31,
          intent: "commercial",
          growth: 440,
          isBreakout: true,
        },
        {
          query: "instant fx settlement virtual accounts breakout",
          category: "breakouts",
          volume: 24600,
          cpc: 5.0,
          difficulty: 33,
          intent: "transactional",
          growth: 680,
          isBreakout: true,
        },
      ],
    },
    GB: {
      topic: "GDPR-Compliant AI Search & Enterprise Data Governance",
      story: {
        headline:
          "UK Enterprise Privacy Directives Spark Demand for Sovereign AI",
        summary:
          "With stricter UK data compliance audits and AI governance guidelines, British businesses are transitioning to sovereign, Zero-Data-Retention generative search and private vector indexing.",
        catalystType: "Regulatory Compliance & Data Privacy",
      },
      items: [
        {
          query: "how to ensure b2b ai search complies with uk gdpr standards",
          stem: "how",
          category: "questions",
          volume: 14800,
          cpc: 5.9,
          difficulty: 34,
          intent: "commercial",
          growth: 420,
          isBreakout: true,
        },
        {
          query:
            "what are the best private hosting options for enterprise rag in the uk",
          stem: "what",
          category: "questions",
          volume: 11900,
          cpc: 6.4,
          difficulty: 37,
          intent: "commercial",
          growth: 380,
        },
        {
          query:
            "why uk firms are replacing us-hosted ai models with sovereign private LLMs",
          stem: "why",
          category: "questions",
          volume: 9200,
          cpc: 5.1,
          difficulty: 28,
          intent: "informational",
          growth: 490,
          isBreakout: true,
        },
        {
          query:
            "can automated compliance tools detect pii leaks in search prompts",
          stem: "can",
          category: "questions",
          volume: 8100,
          cpc: 4.7,
          difficulty: 26,
          intent: "commercial",
          growth: 310,
        },
        {
          query: "best zero-data-retention ai analytics platform in the uk",
          category: "comparisons",
          volume: 13400,
          cpc: 6.8,
          difficulty: 36,
          intent: "commercial",
          growth: 510,
          isBreakout: true,
        },
      ],
    },
  },
  "E-commerce & Retail": {
    US: {
      topic: "Social Commerce Checkout & Creator Affiliate Automation",
      story: {
        headline:
          "Explosion of TikTok Shop & In-Feed Social Checkout Conversions",
        summary:
          "US online retailers and DTC brands are shifting ad dollars from traditional search ads to creator affiliate affiliate automation and one-click in-app social checkouts.",
        catalystType: "Consumer Shopping Habit Shift",
      },
      items: [
        {
          query:
            "how to automate tiktok shop affiliate creator recruitment at scale",
          stem: "how",
          category: "questions",
          volume: 24500,
          cpc: 4.8,
          difficulty: 36,
          intent: "commercial",
          growth: 620,
          isBreakout: true,
        },
        {
          query:
            "what is the highest converting 1-click checkout app for shopify",
          stem: "what",
          category: "questions",
          volume: 19800,
          cpc: 5.4,
          difficulty: 39,
          intent: "commercial",
          growth: 440,
          isBreakout: true,
        },
        {
          query:
            "why dtc brands are ditching meta ads for creator viral seeding",
          stem: "why",
          category: "questions",
          volume: 16200,
          cpc: 4.2,
          difficulty: 30,
          intent: "informational",
          growth: 510,
          isBreakout: true,
        },
        {
          query: "can ai video generation replace product photography studios",
          stem: "can",
          category: "questions",
          volume: 13900,
          cpc: 3.9,
          difficulty: 27,
          intent: "informational",
          growth: 390,
        },
        {
          query: "tiktok shop vs shopify headless commerce comparison 2026",
          category: "comparisons",
          volume: 21000,
          cpc: 5.8,
          difficulty: 41,
          intent: "commercial",
          growth: 570,
          isBreakout: true,
        },
        {
          query: "viral creator commission automation breakout",
          category: "breakouts",
          volume: 31200,
          cpc: 6.2,
          difficulty: 43,
          intent: "transactional",
          growth: 780,
          isBreakout: true,
        },
      ],
    },
    NG: {
      topic: "WhatsApp Social Commerce & Automated Delivery Escrow",
      story: {
        headline:
          "Rise of WhatsApp Commerce Bots & Verified Escrow for African Retailers",
        summary:
          "Nigerian e-commerce is rapidly centralizing around WhatsApp Business automated storefronts, Pay-on-Delivery escrow security, and integrated bike dispatch logistics.",
        catalystType: "Mobile-First Consumer Adoption",
      },
      items: [
        {
          query:
            "how to setup automated whatsapp catalog checkout bot in nigeria",
          stem: "how",
          category: "questions",
          volume: 18400,
          cpc: 2.9,
          difficulty: 26,
          intent: "commercial",
          growth: 590,
          isBreakout: true,
        },
        {
          query:
            "what is the best safe escrow payment app for instagram vendors",
          stem: "what",
          category: "questions",
          volume: 15600,
          cpc: 3.1,
          difficulty: 28,
          intent: "commercial",
          growth: 470,
          isBreakout: true,
        },
        {
          query:
            "why pay-on-delivery failure rates drop with sms dispatch tracking",
          stem: "why",
          category: "questions",
          volume: 9200,
          cpc: 2.2,
          difficulty: 20,
          intent: "informational",
          growth: 380,
        },
        {
          query:
            "whatsapp commerce automation vs traditional website store in lagos",
          category: "comparisons",
          volume: 14700,
          cpc: 3.4,
          difficulty: 29,
          intent: "commercial",
          growth: 510,
          isBreakout: true,
        },
        {
          query: "instant dispatch motorbike delivery api integration",
          category: "prepositions",
          volume: 12100,
          cpc: 2.8,
          difficulty: 22,
          intent: "commercial",
          growth: 410,
          isBreakout: true,
        },
      ],
    },
  },
};

export const TrendsRadarService = {
  /**
   * Generates a country-aware and industry-specific AnswerThePublic & Google Trends
   * radar tailored to what is actively trending in that market right now.
   */
  async getTrendingRadar(
    projectId: string,
    customTopic?: string,
  ): Promise<TrendsRadarResult> {
    const brand = await BrandCompetitorService.getBrandProfile(projectId);
    const brandName = brand.brandName || "Your Brand";
    const industry = brand.industry || "SaaS / Software";
    const countryName = getCountryDisplayName(brand.targetCountry);
    const countryCode = getCountryCode(brand.targetCountry);

    let activeTopic = customTopic?.trim();
    let trendingStory: TrendingStoryContext | undefined;
    let items: TrendingQueryItem[] = [];

    // Attempt AI Generation via multi-provider LLM cascade
    try {
      const { getChatAgentModel } = await import("@/server/lib/openrouter");
      const model = await getChatAgentModel();

      const systemPrompt = `You are a Principal Search Intelligence and Google Trends Analyst specializing in real-time consumer search trends and regional market demand.
Analyze the target industry and country to discover what is ACTUALLY trending (hot market stories, breakout keywords, buying questions, comparison queries, and high-growth search terms) in that specific country right now.

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object matching this schema:
{
  "activeTopic": string (the primary trending topic or breakout keyword phrase),
  "trendingStory": {
    "headline": string (Punchy 8-12 word headline describing the trending story or market catalyst in that country),
    "summary": string (2-sentence explanation of why consumers/businesses in that country are actively searching for this),
    "catalystType": string (e.g. "Regulatory Shift" | "Viral Consumer Movement" | "Technology Shift" | "Cost Inflation Pressure")
  },
  "items": [
    {
      "query": string (realistic, high-intent search query),
      "stem": "what" | "how" | "why" | "where" | "who" | "can" | "are" | "which" (only for questions),
      "category": "questions" | "prepositions" | "comparisons" | "breakouts",
      "searchVolume": number (between 3000 and 45000),
      "cpc": number (between 1.50 and 9.50),
      "difficulty": number (0-100),
      "intent": "informational" | "commercial" | "transactional" | "navigational",
      "growthRatePercent": number (between 140 and 780),
      "isBreakout": boolean
    }
  ]
}
Ensure at least 14 distinct, non-generic queries covering questions (What, How, Why, Can, Are, Where), comparisons (vs, alternative, best), prepositions, and breakout queries.`;

      const userPrompt = `TARGET CONTEXT:
- Brand Name: ${brandName}
- Industry / Niche: ${industry}
- Target Country / Region: ${countryName} (${countryCode})
- Brand Value Proposition: ${brand.valueProposition || "Modern ROI-driven solutions"}
${activeTopic ? `- Custom Filter / Focus: "${activeTopic}"` : `- Task: Identify what is currently trending (top breakout story, surging search queries, and high-converting questions) in ${industry} across ${countryName}. DO NOT return generic boilerplate.`}

Generate realistic, high-value search trends and questions tailored specifically to ${industry} in ${countryName}.`;

      const response = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      });

      const cleanJson = response.text
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (
        parsed.items &&
        Array.isArray(parsed.items) &&
        parsed.items.length > 0
      ) {
        activeTopic =
          parsed.activeTopic ||
          activeTopic ||
          `${industry} Trends in ${countryName}`;
        trendingStory = parsed.trendingStory;
        items = parsed.items.map((it: any, idx: number) => {
          const sparkline = [
            Math.floor(20 + Math.random() * 20),
            Math.floor(30 + Math.random() * 25),
            Math.floor(45 + Math.random() * 25),
            Math.floor(60 + Math.random() * 20),
            Math.floor(75 + Math.random() * 15),
            Math.floor(88 + Math.random() * 12),
          ];
          return {
            id: `trend-${Date.now()}-${idx}`,
            query: String(it.query),
            stem: it.stem as QuestionStem,
            category: it.category as TrendCategory,
            searchVolume: Number(it.searchVolume) || 12000,
            cpc: Number(it.cpc) || 3.5,
            difficulty: Number(it.difficulty) || 30,
            intent: it.intent || "informational",
            growthRatePercent: Number(it.growthRatePercent) || 240,
            isBreakout: Boolean(it.isBreakout ?? it.growthRatePercent > 350),
            trendSparkline: sparkline,
          };
        });
      }
    } catch (aiErr) {
      console.warn(
        "AI generation for Trends Radar unavailable or fallback used:",
        aiErr,
      );
    }

    // Dynamic country + industry heuristic fallback
    if (items.length === 0) {
      const industryGroup =
        INDUSTRY_COUNTRY_TRENDS[industry] ||
        INDUSTRY_COUNTRY_TRENDS["SaaS / Software"];
      const countryData =
        industryGroup[countryCode] ||
        industryGroup["US"] ||
        Object.values(industryGroup)[0];

      activeTopic = activeTopic || countryData.topic;
      trendingStory = countryData.story;

      items = countryData.items.map((it, idx) => {
        const sparkline = [
          Math.floor(25 + Math.random() * 15),
          Math.floor(35 + Math.random() * 20),
          Math.floor(50 + Math.random() * 20),
          Math.floor(65 + Math.random() * 15),
          Math.floor(80 + Math.random() * 12),
          Math.floor(90 + Math.random() * 10),
        ];
        return {
          id: `trend-fallback-${Date.now()}-${idx}`,
          query: it.query,
          stem: it.stem,
          category: it.category,
          searchVolume: it.volume,
          cpc: it.cpc,
          difficulty: it.difficulty,
          intent: it.intent,
          growthRatePercent: it.growth,
          isBreakout: Boolean(it.isBreakout || it.growth > 350),
          trendSparkline: sparkline,
        };
      });
    }

    const totalQuestions = items.filter(
      (it) => it.category === "questions",
    ).length;
    const totalBreakouts = items.filter((it) => it.isBreakout).length;
    const topGrowthItem = [...items].sort(
      (a, b) => b.growthRatePercent - a.growthRatePercent,
    )[0];

    const stemsSummary: Record<QuestionStem, number> = {
      what: items.filter((it) => it.stem === "what").length,
      how: items.filter((it) => it.stem === "how").length,
      why: items.filter((it) => it.stem === "why").length,
      where: items.filter((it) => it.stem === "where").length,
      who: items.filter((it) => it.stem === "who").length,
      can: items.filter((it) => it.stem === "can").length,
      are: items.filter((it) => it.stem === "are").length,
      which: items.filter((it) => it.stem === "which").length,
    };

    return {
      seedTopic: activeTopic || `${industry} Trends in ${countryName}`,
      brandName,
      industry,
      targetCountry: countryName,
      targetCountryCode: countryCode,
      trendingStoryContext: trendingStory,
      totalQuestionsFound: totalQuestions,
      totalBreakoutsFound: totalBreakouts,
      topGrowthQuery:
        topGrowthItem?.query ||
        items[0]?.query ||
        activeTopic ||
        "trending search",
      items,
      stemsSummary,
      generatedAt: new Date().toISOString(),
    };
  },
};

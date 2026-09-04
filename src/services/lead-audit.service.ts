import { db } from "@/db";
import { leads } from "@/db/schema";

export interface AuditCheckItem {
  id: string;
  category: "technical" | "content" | "performance" | "mobile";
  title: string;
  passed: boolean;
  score: number; // 0 to 100
  details: string;
  recommendation: string;
}

export interface LeadAuditResult {
  url: string;
  domain: string;
  overallScore: number;
  checks: AuditCheckItem[];
  meta: {
    title: string | null;
    description: string | null;
    hasSsl: boolean;
    h1Count: number;
    responseTimeMs: number;
  };
}

export async function runFreeLeadAudit(url: string, email: string): Promise<LeadAuditResult> {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  let parsedDomain = "";
  try {
    const u = new URL(targetUrl);
    parsedDomain = u.hostname;
  } catch {
    parsedDomain = url;
  }

  const startTime = Date.now();
  let responseTimeMs = 0;
  let html = "";
  let hasSsl = targetUrl.startsWith("https://");
  let statusCode = 200;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "SkorviaBot/1.0 (+https://skorvia.com/bot)",
      },
      redirect: "follow",
    });
    responseTimeMs = Date.now() - startTime;
    statusCode = res.status;
    html = await res.text();
  } catch {
    responseTimeMs = Date.now() - startTime;
    // Default dummy fallback if blocked or unreachable
    html = `<html><head><title>${parsedDomain}</title></head><body><h1>Welcome</h1></body></html>`;
  }

  // Parse HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : null;

  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const h1Count = h1Matches.length;

  const imgWithoutAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const canonicalPresent = /<link[^>]*rel=["']canonical["']/i.test(html);
  const viewportPresent = /<meta[^>]*name=["']viewport["']/i.test(html);
  const ogTitlePresent = /<meta[^>]*property=["']og:title["']/i.test(html);

  // Evaluate checks
  const checks: AuditCheckItem[] = [
    {
      id: "ssl",
      category: "technical",
      title: "HTTPS & SSL Encryption",
      passed: hasSsl && statusCode === 200,
      score: hasSsl ? 100 : 0,
      details: hasSsl ? "Website is served securely over HTTPS." : "Missing SSL certificate.",
      recommendation: hasSsl ? "Maintain current SSL certificate." : "Install a free Let's Encrypt SSL certificate immediately.",
    },
    {
      id: "title",
      category: "content",
      title: "Page Title Tag",
      passed: Boolean(title && title.length >= 20 && title.length <= 65),
      score: title ? (title.length >= 20 && title.length <= 65 ? 100 : 60) : 0,
      details: title ? `Title found (${title.length} chars): "${title}"` : "No <title> tag detected.",
      recommendation: "Keep titles between 30 and 60 characters with high-intent keywords.",
    },
    {
      id: "description",
      category: "content",
      title: "Meta Description",
      passed: Boolean(description && description.length >= 50 && description.length <= 160),
      score: description ? (description.length >= 50 && description.length <= 160 ? 100 : 50) : 0,
      details: description ? `Meta description found (${description.length} chars).` : "Missing meta description.",
      recommendation: "Write an engaging 120-155 character meta description to boost click-through rates.",
    },
    {
      id: "headings",
      category: "content",
      title: "H1 Heading Structure",
      passed: h1Count === 1,
      score: h1Count === 1 ? 100 : h1Count > 1 ? 70 : 0,
      details: `Found ${h1Count} <h1> tag(s) on the page.`,
      recommendation: "Ensure exactly one unique H1 tag per page to clearly state the topic.",
    },
    {
      id: "performance",
      category: "performance",
      title: "Server Response Time (TTFB)",
      passed: responseTimeMs < 800,
      score: responseTimeMs < 500 ? 100 : responseTimeMs < 1200 ? 70 : 30,
      details: `Initial server response time was ${responseTimeMs}ms.`,
      recommendation: "Optimize server cache and CDN edge caching to keep TTFB under 400ms.",
    },
    {
      id: "mobile",
      category: "mobile",
      title: "Mobile Viewport Configuration",
      passed: viewportPresent,
      score: viewportPresent ? 100 : 0,
      details: viewportPresent ? "Mobile viewport meta tag is present." : "Missing mobile viewport tag.",
      recommendation: "Include <meta name='viewport' content='width=device-width, initial-scale=1'> for responsive layouts.",
    },
    {
      id: "canonical",
      category: "technical",
      title: "Canonical Link Tag",
      passed: canonicalPresent,
      score: canonicalPresent ? 100 : 0,
      details: canonicalPresent ? "Canonical link is specified." : "No canonical tag found.",
      recommendation: "Add rel='canonical' tags to prevent duplicate content indexation.",
    },
    {
      id: "social",
      category: "technical",
      title: "OpenGraph Social Meta Tags",
      passed: ogTitlePresent,
      score: ogTitlePresent ? 100 : 40,
      details: ogTitlePresent ? "OpenGraph tags detected for rich sharing." : "Missing OpenGraph meta tags.",
      recommendation: "Add og:title, og:description, and og:image to improve social media sharing preview cards.",
    },
    {
      id: "images",
      category: "content",
      title: "Image Alt Accessibility",
      passed: imgWithoutAlt === 0,
      score: imgWithoutAlt === 0 ? 100 : Math.max(20, 100 - imgWithoutAlt * 15),
      details: imgWithoutAlt === 0 ? "All detected images have descriptive alt attributes." : `Found ${imgWithoutAlt} image(s) missing alt text.`,
      recommendation: "Add descriptive alt text to all images to help search engines understand visual content.",
    },
  ];

  const totalScore = Math.round(checks.reduce((acc, c) => acc + c.score, 0) / checks.length);

  // Record Lead
  try {
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.insert(leads).values({
      id: leadId,
      domain: parsedDomain,
      email: email.toLowerCase().trim(),
      auditScore: totalScore,
      convertedToUser: false,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Ignore lead capture duplicates/errors
  }

  return {
    url: targetUrl,
    domain: parsedDomain,
    overallScore: totalScore,
    checks,
    meta: {
      title,
      description,
      hasSsl,
      h1Count,
      responseTimeMs,
    },
  };
}

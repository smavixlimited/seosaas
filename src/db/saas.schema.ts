import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  index,
  real,
} from "drizzle-orm/sqlite-core";
import { user } from "./better-auth-schema";

export const saasPlans = sqliteTable("saas_plans", {
  id: text("id").primaryKey(), // 'starter' | 'pro' | 'agency'
  name: text("name").notNull(),
  priceUsd: integer("price_usd").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  billingInterval: text("billing_interval").notNull().default("month"), // 'month' | 'year'
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  limitsJson: text("limits_json").notNull(), // max_domains, monthly_credits, audit_pages, uptime_monitors
  featuresJson: text("features_json").notNull(), // white_label_pdf, mcp_access, indexnow_submit, aeo_audit
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const gatewaySettings = sqliteTable("gateway_settings", {
  gatewayId: text("gateway_id").primaryKey(), // 'paystack' | 'flutterwave' | 'lemonsqueezy' | 'manual'
  isEnabled: integer("is_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  publicKey: text("public_key"),
  secretKey: text("secret_key"),
  manualInstructions: text("manual_instructions"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const manualPayments = sqliteTable(
  "manual_payments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    planId: text("plan_id").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("NGN"), // 'NGN' | 'USD'
    transactionReference: text("transaction_reference").notNull(),
    receiptUrl: text("receipt_url"),
    userNotes: text("user_notes"),
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: text("reviewed_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("manual_payments_user_id_idx").on(table.userId),
    index("manual_payments_status_idx").on(table.status),
  ],
);

export const userQuotas = sqliteTable("user_quotas", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().default("starter"),
  monthlyCreditsLimit: integer("monthly_credits_limit").notNull().default(500),
  creditsUsed: integer("credits_used").notNull().default(0),
  crawlPagesUsed: integer("crawl_pages_used").notNull().default(0),
  uptimeMonitorsCount: integer("uptime_monitors_count").notNull().default(0),
  resetAt: text("reset_at").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    domain: text("domain").notNull(),
    email: text("email").notNull(),
    auditScore: integer("audit_score"),
    convertedToUser: integer("converted_to_user", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_domain_idx").on(table.domain),
  ],
);

export const uptimeMonitors = sqliteTable(
  "uptime_monitors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id"),
    url: text("url").notNull(),
    status: text("status").notNull().default("up"), // 'up' | 'down' | 'degraded'
    lastCheckedAt: text("last_checked_at"),
    lastStatusCode: integer("last_status_code"),
    sslExpiresAt: text("ssl_expires_at"),
    reminderFrequency: text("reminder_frequency").notNull().default("both"), // 'weekly' | 'ssl_expiry' | 'both' | 'none'
    reminderEmail: text("reminder_email"),
    lastReminderSentAt: text("last_reminder_sent_at"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("uptime_monitors_user_id_idx").on(table.userId)],
);

export const whiteLabelConfigs = sqliteTable("white_label_configs", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#17199b"),
  customDomain: text("custom_domain"),
  reportFooterNotes: text("report_footer_notes"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const cachedQueries = sqliteTable(
  "cached_queries",
  {
    queryHash: text("query_hash").primaryKey(),
    endpoint: text("endpoint").notNull(),
    paramsJson: text("params_json").notNull(),
    responseJson: text("response_json").notNull(),
    costSavedUsd: integer("cost_saved_usd").notNull().default(0),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("cached_queries_expires_at_idx").on(table.expiresAt)],
);

export const seoAlertConfigs = sqliteTable(
  "seo_alert_configs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    userEmail: text("user_email").notNull(),
    rankDropThreshold: integer("rank_drop_threshold").notNull().default(3),
    rankDropAlerts: integer("rank_drop_alerts", { mode: "boolean" })
      .notNull()
      .default(true),
    criticalAuditAlerts: integer("critical_audit_alerts", { mode: "boolean" })
      .notNull()
      .default(true),
    sslExpirationAlerts: integer("ssl_expiration_alerts", { mode: "boolean" })
      .notNull()
      .default(true),
    uptimeDowntimeAlerts: integer("uptime_downtime_alerts", { mode: "boolean" })
      .notNull()
      .default(true),
    weeklyDigestEmail: integer("weekly_digest_email", { mode: "boolean" })
      .notNull()
      .default(true),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("seo_alert_configs_project_id_idx").on(table.projectId)],
);

export const indexingSubmissions = sqliteTable(
  "indexing_submissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id"),
    host: text("host").notNull(),
    urlCount: integer("url_count").notNull(),
    urlsJson: text("urls_json").notNull(),
    engine: text("engine").notNull().default("indexnow"), // 'indexnow' | 'google'
    statusCode: integer("status_code").notNull().default(200),
    statusMessage: text("status_message"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("indexing_submissions_user_id_idx").on(table.userId)],
);

export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(), // 'branding' | 'public_registration' | 'api_seo' | 'api_ai' | 'api_local' | 'api_communications' | 'api_payments' | 'security_policies'
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedBy: text("updated_by"),
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id").notNull(),
    adminEmail: text("admin_email").notNull(),
    action: text("action").notNull(), // 'USER_QUOTA_ADJUSTED' | 'USER_DELETED' | 'API_KEY_UPDATED' | 'BRANDING_UPDATED' | 'IMPERSONATION_STARTED' | 'SECURITY_POLICY_UPDATED' | 'PLAN_PRICE_CHANGED'
    targetId: text("target_id"),
    targetType: text("target_type"), // 'user' | 'system_settings' | 'saas_plan' | 'payment_gateway'
    ipAddress: text("ip_address"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("audit_logs_admin_id_idx").on(table.adminId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("SEO Guides"),
    coverImageUrl: text("cover_image_url"),
    authorName: text("author_name").notNull().default("Skorvia SEO Editorial"),
    authorRole: text("author_role").default("Senior SEO Strategist"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    focusKeywords: text("focus_keywords"),
    canonicalUrl: text("canonical_url"),
    status: text("status").notNull().default("published"), // 'published' | 'draft' | 'scheduled'
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(5),
    publishedAt: text("published_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("blog_posts_slug_idx").on(table.slug),
    index("blog_posts_category_idx").on(table.category),
    index("blog_posts_status_idx").on(table.status),
  ],
);

export const webhookErrorLogs = sqliteTable(
  "webhook_error_logs",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(), // 'paystack' | 'flutterwave' | 'lemonsqueezy' | 'svix' | 'indexnow' | 'resend'
    event: text("event").notNull(),
    payloadJson: text("payload_json").notNull(),
    errorMessage: text("error_message").notNull(),
    errorStack: text("error_stack"),
    responseStatus: integer("response_status").default(500),
    retryCount: integer("retry_count").notNull().default(0),
    status: text("status").notNull().default("failed"), // 'failed' | 'resolved' | 'retrying'
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    resolvedAt: text("resolved_at"),
  },
  (table) => [
    index("webhook_error_logs_provider_idx").on(table.provider),
    index("webhook_error_logs_status_idx").on(table.status),
    index("webhook_error_logs_created_at_idx").on(table.createdAt),
  ],
);

export const userTwoFactor = sqliteTable(
  "user_two_factor",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    secret: text("secret").notNull(),
    backupCodesJson: text("backup_codes_json").notNull(),
    isEnabled: integer("is_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("user_two_factor_user_id_idx").on(table.userId)],
);

export const userDevicesSessions = sqliteTable(
  "user_devices_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    ipAddress: text("ip_address").notNull(),
    userAgent: text("user_agent").notNull(),
    browser: text("browser").notNull().default("Unknown Browser"),
    os: text("os").notNull().default("Unknown OS"),
    deviceType: text("device_type").notNull().default("desktop"), // 'desktop' | 'mobile' | 'tablet'
    location: text("location").notNull().default("Unknown Location"),
    isCurrent: integer("is_current", { mode: "boolean" })
      .notNull()
      .default(false),
    isRevoked: integer("is_revoked", { mode: "boolean" })
      .notNull()
      .default(false),
    lastActiveAt: text("last_active_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("user_devices_sessions_user_id_idx").on(table.userId),
    index("user_devices_sessions_ip_idx").on(table.ipAddress),
  ],
);

export const teamMembers = sqliteTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    memberUserId: text("member_user_id").notNull(),
    memberEmail: text("member_email").notNull(),
    memberName: text("member_name").notNull(),
    role: text("role").notNull().default("viewer"), // 'owner' | 'admin' | 'editor' | 'viewer'
    assignedProjectIdsJson: text("assigned_project_ids_json")
      .notNull()
      .default("[]"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("team_members_owner_id_idx").on(table.ownerId),
    index("team_members_member_user_id_idx").on(table.memberUserId),
    index("team_members_member_email_idx").on(table.memberEmail),
  ],
);

export const teamInvitations = sqliteTable(
  "team_invitations",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("viewer"),
    assignedProjectIdsJson: text("assigned_project_ids_json")
      .notNull()
      .default("[]"),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'expired' | 'revoked'
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("team_invitations_owner_id_idx").on(table.ownerId),
    index("team_invitations_token_idx").on(table.token),
    index("team_invitations_email_idx").on(table.email),
  ],
);
export const cancellationSurveys = sqliteTable(
  "cancellation_surveys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userEmail: text("user_email").notNull(),
    planId: text("plan_id").notNull(),
    reason: text("reason").notNull(),
    feedback: text("feedback"),
    acceptedRetentionDiscount: integer("accepted_retention_discount", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    discountPercent: integer("discount_percent").default(0),
    discountExpiresAt: text("discount_expires_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("cancellation_surveys_user_id_idx").on(table.userId)],
);

export const webhookEvents = sqliteTable(
  "webhook_events",
  {
    id: text("id").primaryKey(),
    gateway: text("gateway").notNull(), // 'paystack' | 'flutterwave' | 'lemonsqueezy'
    eventId: text("event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    status: text("status").notNull().default("processed"), // 'processed' | 'failed' | 'ignored'
    payloadJson: text("payload_json").notNull(),
    processedAt: text("processed_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("webhook_events_event_id_idx").on(table.eventId),
    index("webhook_events_gateway_idx").on(table.gateway),
  ],
);

export const userTwoFactorPending = sqliteTable("user_two_factor_pending", {
  userId: text("user_id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodesJson: text("backup_codes_json").notNull(),
  backupCodesHashedJson: text("backup_codes_hashed_json").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const saasCoupons = sqliteTable(
  "saas_coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(), // e.g. 'LAUNCH50'
    description: text("description"),
    discountType: text("discount_type").notNull().default("percentage"), // 'percentage' | 'fixed_amount'
    discountValue: integer("discount_value").notNull(), // 50 for 50%, or 2000 for $20 / ₦2000
    currency: text("currency"), // 'USD' | 'NGN' | null (null means all currencies for percentage)
    applicablePlansJson: text("applicable_plans_json"), // null for all plans, or '["starter","pro","agency"]'
    customerEligibility: text("customer_eligibility").notNull().default("all"), // 'all' | 'new_customers_only' | 'existing_customers_only'
    maxRedemptions: integer("max_redemptions"), // Total global cap across all users (null for unlimited)
    timesRedeemed: integer("times_redeemed").notNull().default(0),
    maxRedemptionsPerUser: integer("max_redemptions_per_user")
      .notNull()
      .default(1),
    expiresAt: text("expires_at"), // ISO date string or null
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("saas_coupons_code_idx").on(table.code),
    index("saas_coupons_is_active_idx").on(table.isActive),
  ],
);

export const couponRedemptions = sqliteTable(
  "coupon_redemptions",
  {
    id: text("id").primaryKey(),
    couponId: text("coupon_id")
      .notNull()
      .references(() => saasCoupons.id, { onDelete: "cascade" }),
    couponCode: text("coupon_code").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    planId: text("plan_id").notNull(),
    originalPrice: integer("original_price").notNull(),
    discountAmount: integer("discount_amount").notNull(),
    finalPrice: integer("final_price").notNull(),
    currency: text("currency").notNull().default("USD"),
    paymentReference: text("payment_reference"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("coupon_redemptions_coupon_id_idx").on(table.couponId),
    index("coupon_redemptions_user_id_idx").on(table.userId),
    index("coupon_redemptions_coupon_code_idx").on(table.couponCode),
  ],
);

export const competitorStrategyReports = sqliteTable(
  "competitor_strategy_reports",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    targetDomain: text("target_domain").notNull(),
    locationCode: integer("location_code").notNull().default(2840),
    positioningHookJson: text("positioning_hook_json").notNull(),
    funnelAnglesJson: text("funnel_angles_json").notNull(),
    contentMoatJson: text("content_moat_json").notNull(),
    vulnerabilitiesJson: text("vulnerabilities_json").notNull(),
    attackPlaybookJson: text("attack_playbook_json").notNull(),
    rawMetricsSummaryJson: text("raw_metrics_summary_json"),
    modelUsed: text("model_used"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("competitor_strategy_project_idx").on(table.projectId),
    index("competitor_strategy_target_idx").on(table.targetDomain),
  ],
);

export const roadmapTasks = sqliteTable(
  "roadmap_tasks",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // 'quick_win' | 'high_impact' | 'technical' | 'content_gap' | 'growth'
    priority: text("priority").notNull().default("medium"), // 'critical' | 'high' | 'medium' | 'low'
    impactBadge: text("impact_badge").notNull().default("High Impact"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(15),
    status: text("status").notNull().default("todo"), // 'todo' | 'in_progress' | 'completed' | 'dismissed'
    verificationType: text("verification_type").notNull().default("manual"), // 'manual' | 'ai_generated' | 'live_crawled'
    verifiedAt: text("verified_at"),
    sourceType: text("source_type").notNull().default("audit"), // 'audit' | 'competitor' | 'ai_recommendation' | 'custom'
    sourceIssueId: text("source_issue_id"),
    targetUrl: text("target_url"),
    aiPrompt: text("ai_prompt"),
    aiFixCodeSnippet: text("ai_fix_code_snippet"),
    completedByUserId: text("completed_by_user_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("roadmap_tasks_project_idx").on(table.projectId),
    index("roadmap_tasks_status_idx").on(table.status),
    index("roadmap_tasks_category_idx").on(table.category),
  ],
);

export const brandMentions = sqliteTable(
  "brand_mentions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceDomain: text("source_domain").notNull(),
    sourceTitle: text("source_title").notNull(),
    mentionContext: text("mention_context").notNull(),
    mentionType: text("mention_type").notNull().default("unlinked"), // 'unlinked' | 'linked_nofollow' | 'linked_dofollow' | 'ai_citation'
    domainAuthority: integer("domain_authority").notNull().default(35),
    sentiment: text("sentiment").notNull().default("positive"), // 'positive' | 'neutral' | 'critical'
    claimStatus: text("claim_status").notNull().default("unclaimed"), // 'unclaimed' | 'pitch_generated' | 'outreach_sent' | 'claimed' | 'ignored'
    generatedPitchSubject: text("generated_pitch_subject"),
    generatedPitchBody: text("generated_pitch_body"),
    targetBrandName: text("target_brand_name").notNull(),
    targetBrandUrl: text("target_brand_url").notNull(),
    discoveredAt: text("discovered_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("brand_mentions_project_idx").on(table.projectId),
    index("brand_mentions_type_idx").on(table.mentionType),
    index("brand_mentions_claim_status_idx").on(table.claimStatus),
  ],
);

export const aeoSentimentSnapshots = sqliteTable(
  "aeo_sentiment_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    targetBrandName: text("target_brand_name").notNull(),
    aiEngine: text("ai_engine").notNull(), // 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'google_aio'
    sentimentScore: integer("sentiment_score").notNull().default(85), // 0-100
    sentimentSummary: text("sentiment_summary").notNull(),
    entityCitationStatus: text("entity_citation_status")
      .notNull()
      .default("present"), // 'present' | 'missing' | 'ambiguous'
    keyStrengthsHighlightedJson: text(
      "key_strengths_highlighted_json",
    ).notNull(),
    keyMissingGapsJson: text("key_missing_gaps_json").notNull(),
    modelUsed: text("model_used"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("aeo_sentiment_project_idx").on(table.projectId),
    index("aeo_sentiment_engine_idx").on(table.aiEngine),
  ],
);

export const conversionAdReadinessAudits = sqliteTable(
  "conversion_ad_readiness_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    targetUrl: text("target_url").notNull(),
    overallScore: integer("overall_score").notNull().default(78), // 0-100
    grade: text("grade").notNull().default("B+"), // 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    adWastedSpendRisk: text("ad_wasted_spend_risk")
      .notNull()
      .default("moderate"), // 'low' | 'moderate' | 'high' | 'critical'
    trustAndCredibilityScore: integer("trust_and_credibility_score")
      .notNull()
      .default(85),
    ctaAndOfferClarityScore: integer("cta_and_offer_clarity_score")
      .notNull()
      .default(75),
    pageSpeedAndMobileScore: integer("page_speed_and_mobile_score")
      .notNull()
      .default(70),
    socialProofAndReviewsScore: integer("social_proof_and_reviews_score")
      .notNull()
      .default(80),
    frictionAndFormLengthScore: integer("friction_and_form_length_score")
      .notNull()
      .default(80),
    trackingPixelScore: integer("tracking_pixel_score").notNull().default(85),
    detectedPixelsJson: text("detected_pixels_json"),
    checksPassedJson: text("checks_passed_json").notNull(),
    criticalFrictionPointsJson: text("critical_friction_points_json").notNull(),
    recommendedFixesJson: text("recommended_fixes_json").notNull(),
    modelUsed: text("model_used"),
    auditedAt: text("audited_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("conversion_audit_project_idx").on(table.projectId),
    index("conversion_audit_target_idx").on(table.targetUrl),
  ],
);

export const localBusinessProfiles = sqliteTable(
  "local_business_profiles",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    businessName: text("business_name").notNull(),
    streetAddress: text("street_address"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    countryCode: text("country_code").notNull().default("US"),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    primaryCategory: text("primary_category")
      .notNull()
      .default("General Business"),
    gbpClaimed: integer("gbp_claimed", { mode: "boolean" })
      .notNull()
      .default(true),
    gbpHealthScore: integer("gbp_health_score").notNull().default(85), // 0-100
    averageRating: real("average_rating").notNull().default(4.8),
    totalReviews: integer("total_reviews").notNull().default(38),
    napConsistencyScore: integer("nap_consistency_score").notNull().default(92), // 0-100
    citationsListJson: text("citations_list_json").notNull(),
    reviewsListJson: text("reviews_list_json").notNull(),
    auditHighlightsJson: text("audit_highlights_json").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("local_business_project_idx").on(table.projectId)],
);

export const localBusinessLocations = sqliteTable(
  "local_business_locations",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    locationName: text("location_name").notNull(),
    placeId: text("place_id"),
    businessName: text("business_name").notNull(),
    streetAddress: text("street_address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    countryCode: text("country_code").notNull().default("US"),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    primaryCategory: text("primary_category")
      .notNull()
      .default("General Business"),
    lat: real("lat").notNull().default(37.7749),
    lng: real("lng").notNull().default(-122.4194),
    reviewLink: text("review_link"),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(false),
    gbpHealthScore: integer("gbp_health_score").notNull().default(90),
    averageRating: real("average_rating").notNull().default(4.8),
    totalReviews: integer("total_reviews").notNull().default(42),
    napConsistencyScore: integer("nap_consistency_score").notNull().default(95),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("local_locations_project_idx").on(table.projectId)],
);

export const localRankGridSnapshots = sqliteTable(
  "local_rank_grid_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    locationId: text("location_id"),
    keyword: text("keyword").notNull(),
    gridSize: text("grid_size").notNull().default("3x3"), // '3x3' | '5x5' | '7x7'
    centerLat: real("center_lat").notNull(),
    centerLng: real("center_lng").notNull(),
    radiusKm: real("radius_km").notNull().default(5.0),
    averageRank: real("average_rank").notNull().default(2.4),
    topThreeCoverageRate: integer("top_three_coverage_rate")
      .notNull()
      .default(80), // %
    gridPointsJson: text("grid_points_json").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("local_grid_project_idx").on(table.projectId),
    index("local_grid_keyword_idx").on(table.keyword),
    index("local_grid_location_idx").on(table.locationId),
  ],
);

export const userNotifications = sqliteTable(
  "user_notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    category: text("category").notNull().default("system"), // 'audit' | 'rank' | 'pixel' | 'credits' | 'gbp' | 'system'
    priority: text("priority").notNull().default("info"), // 'info' | 'warning' | 'success' | 'critical'
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    actionUrl: text("action_url"),
    details: text("details"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("user_notifications_user_idx").on(table.userId),
    index("user_notifications_is_read_idx").on(table.isRead),
  ],
);

export const brandProfiles = sqliteTable("brand_profiles", {
  projectId: text("project_id").primaryKey(),
  brandName: text("brand_name").notNull(),
  websiteUrl: text("website_url"),
  industry: text("industry").notNull().default("SaaS / Software"),
  companySize: text("company_size").notNull().default("1-5"), // '1-5' | '6-10' | '11-20' | '21+'
  targetCountry: text("target_country").notNull().default("US"),
  targetLanguage: text("target_language").notNull().default("en"),
  socialLinksJson: text("social_links_json").notNull().default("{}"),
  brandDescription: text("brand_description"),
  valueProposition: text("value_proposition"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const brandCompetitors = sqliteTable(
  "brand_competitors",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    domain: text("domain").notNull(),
    name: text("name"),
    websiteUrl: text("website_url"),
    socialHandlesJson: text("social_handles_json").notNull().default("{}"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("brand_competitors_project_idx").on(table.projectId),
    index("brand_competitors_domain_idx").on(table.domain),
  ],
);

export const brandAudits = sqliteTable(
  "brand_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    overallScore: integer("overall_score").notNull().default(85),
    brandEquityScore: integer("brand_equity_score").notNull().default(82),
    socialProofScore: integer("social_proof_score").notNull().default(88),
    conversionReadinessScore: integer("conversion_readiness_score")
      .notNull()
      .default(80),
    adClarityScore: integer("ad_clarity_score").notNull().default(85),
    technicalHealthScore: integer("technical_health_score")
      .notNull()
      .default(90),
    reputationSentimentScore: integer("reputation_sentiment_score")
      .notNull()
      .default(84),
    strengthsJson: text("strengths_json").notNull(),
    weaknessesJson: text("weaknesses_json").notNull(),
    actionPlanJson: text("action_plan_json").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("brand_audits_project_idx").on(table.projectId)],
);

export const trustSentimentAudits = sqliteTable(
  "trust_sentiment_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    trustScore: integer("trust_score").notNull().default(82),
    preAdGateStatus: text("pre_ad_gate_status").notNull().default("approved"),
    sentimentDistributionJson: text("sentiment_distribution_json").notNull(),
    trustSignalsJson: text("trust_signals_json").notNull(),
    riskAlertsJson: text("risk_alerts_json").notNull(),
    recommendedAction: text("recommended_action").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("trust_sentiment_project_idx").on(table.projectId)],
);

export const viralContentItems = sqliteTable(
  "viral_content_items",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    platform: text("platform").notNull(),
    opportunityType: text("opportunity_type").notNull(),
    viralPotentialScore: integer("viral_potential_score").notNull().default(88),
    hookText: text("hook_text").notNull(),
    scriptOutline: text("script_outline").notNull(),
    targetAudience: text("target_audience").notNull(),
    tagsJson: text("tags_json").notNull().default("[]"),
    status: text("status").notNull().default("suggested"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("viral_content_project_idx").on(table.projectId),
    index("viral_content_platform_idx").on(table.platform),
  ],
);

export const competitorTrackedAds = sqliteTable(
  "competitor_tracked_ads",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    brandCompetitorId: text("brand_competitor_id"),
    competitorDomain: text("competitor_domain").notNull(),
    competitorName: text("competitor_name"),
    platform: text("platform").notNull(), // 'meta' | 'google' | 'tiktok' | 'linkedin'
    headline: text("headline").notNull(),
    bodyCopy: text("body_copy"),
    mediaUrl: text("media_url"),
    mediaType: text("media_type").notNull().default("image"), // 'image' | 'video' | 'text_only'
    landingPageUrl: text("landing_page_url"),
    ctaType: text("cta_type").default("Learn More"),
    angleCategory: text("angle_category").notNull().default("problem_solution"), // 'social_proof' | 'fomo' | 'discount_offer' | 'problem_solution' | 'educational'
    estimatedActiveDays: integer("estimated_active_days").notNull().default(14),
    isWinningAd: integer("is_winning_ad", { mode: "boolean" })
      .notNull()
      .default(false),
    isAiOpportunity: integer("is_ai_opportunity", { mode: "boolean" })
      .notNull()
      .default(false),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("competitor_ads_project_idx").on(table.projectId),
    index("competitor_ads_competitor_domain_idx").on(table.competitorDomain),
    index("competitor_ads_platform_idx").on(table.platform),
  ],
);

export const waitlistUsers = sqliteTable(
  "waitlist_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    company: text("company"),
    website: text("website"),
    useCase: text("use_case"),
    status: text("status").notNull().default("pending"), // 'pending' | 'invited' | 'approved' | 'rejected'
    ipAddress: text("ip_address"),
    notes: text("notes"),
    invitedAt: text("invited_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("waitlist_email_idx").on(table.email),
    index("waitlist_status_idx").on(table.status),
    index("waitlist_created_at_idx").on(table.createdAt),
  ],
);

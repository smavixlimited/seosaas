import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, index, doublePrecision } from "drizzle-orm/pg-core";
import { user } from "./better-auth-schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const saasPlans = pgTable("saas_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceUsd: integer("price_usd").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  billingInterval: text("billing_interval").notNull().default("month"),
  isActive: boolean("is_active").notNull().default(true),
  limitsJson: text("limits_json").notNull(),
  featuresJson: text("features_json").notNull(),
  createdAt: text("created_at").notNull().default(isoNow),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

export const gatewaySettings = pgTable("gateway_settings", {
  gatewayId: text("gateway_id").primaryKey(),
  isEnabled: boolean("is_enabled").notNull().default(false),
  publicKey: text("public_key"),
  secretKey: text("secret_key"),
  manualInstructions: text("manual_instructions"),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

export const manualPayments = pgTable(
  "manual_payments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    planId: text("plan_id").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("NGN"),
    transactionReference: text("transaction_reference").notNull(),
    receiptUrl: text("receipt_url"),
    userNotes: text("user_notes"),
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: text("reviewed_at"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("manual_payments_user_id_idx").on(table.userId),
    index("manual_payments_status_idx").on(table.status),
  ]
);

export const userQuotas = pgTable("user_quotas", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().default("starter"),
  monthlyCreditsLimit: integer("monthly_credits_limit").notNull().default(500),
  creditsUsed: integer("credits_used").notNull().default(0),
  crawlPagesUsed: integer("crawl_pages_used").notNull().default(0),
  uptimeMonitorsCount: integer("uptime_monitors_count").notNull().default(0),
  resetAt: text("reset_at").notNull(),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    domain: text("domain").notNull(),
    email: text("email").notNull(),
    auditScore: integer("audit_score"),
    convertedToUser: boolean("converted_to_user").notNull().default(false),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_domain_idx").on(table.domain),
  ]
);

export const uptimeMonitors = pgTable(
  "uptime_monitors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id"),
    url: text("url").notNull(),
    status: text("status").notNull().default("up"),
    lastCheckedAt: text("last_checked_at"),
    lastStatusCode: integer("last_status_code"),
    sslExpiresAt: text("ssl_expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [index("uptime_monitors_user_id_idx").on(table.userId)]
);

export const whiteLabelConfigs = pgTable("white_label_configs", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#17199b"),
  customDomain: text("custom_domain"),
  reportFooterNotes: text("report_footer_notes"),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

export const cachedQueries = pgTable(
  "cached_queries",
  {
    queryHash: text("query_hash").primaryKey(),
    endpoint: text("endpoint").notNull(),
    paramsJson: text("params_json").notNull(),
    responseJson: text("response_json").notNull(),
    costSavedUsd: integer("cost_saved_usd").notNull().default(0),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [index("cached_queries_expires_at_idx").on(table.expiresAt)]
);

export const seoAlertConfigs = pgTable(
  "seo_alert_configs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    userEmail: text("user_email").notNull(),
    rankDropThreshold: integer("rank_drop_threshold").notNull().default(3),
    rankDropAlerts: boolean("rank_drop_alerts").notNull().default(true),
    criticalAuditAlerts: boolean("critical_audit_alerts").notNull().default(true),
    sslExpirationAlerts: boolean("ssl_expiration_alerts").notNull().default(true),
    uptimeDowntimeAlerts: boolean("uptime_downtime_alerts").notNull().default(true),
    weeklyDigestEmail: boolean("weekly_digest_email").notNull().default(true),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [index("seo_alert_configs_project_id_idx").on(table.projectId)]
);

export const indexingSubmissions = pgTable(
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
    engine: text("engine").notNull().default("indexnow"),
    statusCode: integer("status_code").notNull().default(200),
    statusMessage: text("status_message"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [index("indexing_submissions_user_id_idx").on(table.userId)]
);

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at").notNull().default(isoNow),
  updatedBy: text("updated_by"),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id").notNull(),
    adminEmail: text("admin_email").notNull(),
    action: text("action").notNull(),
    targetId: text("target_id"),
    targetType: text("target_type"),
    ipAddress: text("ip_address"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("audit_logs_admin_id_idx").on(table.adminId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export const blogPosts = pgTable(
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
    status: text("status").notNull().default("published"),
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(5),
    publishedAt: text("published_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("blog_posts_slug_idx").on(table.slug),
    index("blog_posts_category_idx").on(table.category),
    index("blog_posts_status_idx").on(table.status),
  ]
);

export const webhookErrorLogs = pgTable(
  "webhook_error_logs",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    event: text("event").notNull(),
    payloadJson: text("payload_json").notNull(),
    errorMessage: text("error_message").notNull(),
    errorStack: text("error_stack"),
    responseStatus: integer("response_status").default(500),
    retryCount: integer("retry_count").notNull().default(0),
    status: text("status").notNull().default("failed"),
    createdAt: text("created_at").notNull().default(isoNow),
    resolvedAt: text("resolved_at"),
  },
  (table) => [
    index("webhook_error_logs_provider_idx").on(table.provider),
    index("webhook_error_logs_status_idx").on(table.status),
    index("webhook_error_logs_created_at_idx").on(table.createdAt),
  ]
);

export const userTwoFactor = pgTable(
  "user_two_factor",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    secret: text("secret").notNull(),
    backupCodesJson: text("backup_codes_json").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(false),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("user_two_factor_user_id_idx").on(table.userId),
  ]
);

export const userDevicesSessions = pgTable(
  "user_devices_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    ipAddress: text("ip_address").notNull(),
    userAgent: text("user_agent").notNull(),
    browser: text("browser").notNull().default("Unknown Browser"),
    os: text("os").notNull().default("Unknown OS"),
    deviceType: text("device_type").notNull().default("desktop"),
    location: text("location").notNull().default("Unknown Location"),
    isCurrent: boolean("is_current").notNull().default(false),
    isRevoked: boolean("is_revoked").notNull().default(false),
    lastActiveAt: text("last_active_at").notNull().default(isoNow),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("user_devices_sessions_user_id_idx").on(table.userId),
    index("user_devices_sessions_ip_idx").on(table.ipAddress),
  ]
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    memberUserId: text("member_user_id").notNull(),
    memberEmail: text("member_email").notNull(),
    memberName: text("member_name").notNull(),
    role: text("role").notNull().default("viewer"),
    assignedProjectIdsJson: text("assigned_project_ids_json").notNull().default("[]"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("team_members_owner_id_idx").on(table.ownerId),
    index("team_members_member_user_id_idx").on(table.memberUserId),
    index("team_members_member_email_idx").on(table.memberEmail),
  ]
);

export const teamInvitations = pgTable(
  "team_invitations",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("viewer"),
    assignedProjectIdsJson: text("assigned_project_ids_json").notNull().default("[]"),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("team_invitations_owner_id_idx").on(table.ownerId),
    index("team_invitations_token_idx").on(table.token),
    index("team_invitations_email_idx").on(table.email),
  ]
);

export const cancellationSurveys = pgTable(
  "cancellation_surveys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userEmail: text("user_email").notNull(),
    planId: text("plan_id").notNull(),
    reason: text("reason").notNull(),
    feedback: text("feedback"),
    acceptedRetentionDiscount: boolean("accepted_retention_discount").notNull().default(false),
    discountPercent: integer("discount_percent").default(0),
    discountExpiresAt: text("discount_expires_at"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("cancellation_surveys_user_id_idx").on(table.userId),
  ]
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey(),
    gateway: text("gateway").notNull(),
    eventId: text("event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    status: text("status").notNull().default("processed"),
    payloadJson: text("payload_json").notNull(),
    processedAt: text("processed_at").notNull().default(isoNow),
  },
  (table) => [
    index("webhook_events_event_id_idx").on(table.eventId),
    index("webhook_events_gateway_idx").on(table.gateway),
  ]
);

export const userTwoFactorPending = pgTable(
  "user_two_factor_pending",
  {
    userId: text("user_id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodesJson: text("backup_codes_json").notNull(),
    backupCodesHashedJson: text("backup_codes_hashed_json").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  }
);

export const saasCoupons = pgTable(
  "saas_coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    description: text("description"),
    discountType: text("discount_type").notNull().default("percentage"), // 'percentage' | 'fixed_amount'
    discountValue: integer("discount_value").notNull(),
    currency: text("currency"),
    applicablePlansJson: text("applicable_plans_json"),
    customerEligibility: text("customer_eligibility").notNull().default("all"), // 'all' | 'new_customers_only' | 'existing_customers_only'
    maxRedemptions: integer("max_redemptions"), // Total global cap across all users (null for unlimited)
    timesRedeemed: integer("times_redeemed").notNull().default(0),
    maxRedemptionsPerUser: integer("max_redemptions_per_user").notNull().default(1),
    expiresAt: text("expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("saas_coupons_code_idx").on(table.code),
    index("saas_coupons_is_active_idx").on(table.isActive),
  ]
);

export const couponRedemptions = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("coupon_redemptions_coupon_id_idx").on(table.couponId),
    index("coupon_redemptions_user_id_idx").on(table.userId),
    index("coupon_redemptions_coupon_code_idx").on(table.couponCode),
  ]
);

export const competitorStrategyReports = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("competitor_strategy_project_idx").on(table.projectId),
    index("competitor_strategy_target_idx").on(table.targetDomain),
  ]
);

export const roadmapTasks = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("roadmap_tasks_project_idx").on(table.projectId),
    index("roadmap_tasks_status_idx").on(table.status),
    index("roadmap_tasks_category_idx").on(table.category),
  ]
);

export const brandMentions = pgTable(
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
    discoveredAt: text("discovered_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("brand_mentions_project_idx").on(table.projectId),
    index("brand_mentions_type_idx").on(table.mentionType),
    index("brand_mentions_claim_status_idx").on(table.claimStatus),
  ]
);

export const aeoSentimentSnapshots = pgTable(
  "aeo_sentiment_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    targetBrandName: text("target_brand_name").notNull(),
    aiEngine: text("ai_engine").notNull(), // 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'google_aio'
    sentimentScore: integer("sentiment_score").notNull().default(85), // 0-100
    sentimentSummary: text("sentiment_summary").notNull(),
    entityCitationStatus: text("entity_citation_status").notNull().default("present"), // 'present' | 'missing' | 'ambiguous'
    keyStrengthsHighlightedJson: text("key_strengths_highlighted_json").notNull(),
    keyMissingGapsJson: text("key_missing_gaps_json").notNull(),
    modelUsed: text("model_used"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("aeo_sentiment_project_idx").on(table.projectId),
    index("aeo_sentiment_engine_idx").on(table.aiEngine),
  ]
);

export const conversionAdReadinessAudits = pgTable(
  "conversion_ad_readiness_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    targetUrl: text("target_url").notNull(),
    overallScore: integer("overall_score").notNull().default(78), // 0-100
    grade: text("grade").notNull().default("B+"), // 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    adWastedSpendRisk: text("ad_wasted_spend_risk").notNull().default("moderate"), // 'low' | 'moderate' | 'high' | 'critical'
    trustAndCredibilityScore: integer("trust_and_credibility_score").notNull().default(85),
    ctaAndOfferClarityScore: integer("cta_and_offer_clarity_score").notNull().default(75),
    pageSpeedAndMobileScore: integer("page_speed_and_mobile_score").notNull().default(70),
    socialProofAndReviewsScore: integer("social_proof_and_reviews_score").notNull().default(80),
    frictionAndFormLengthScore: integer("friction_and_form_length_score").notNull().default(80),
    trackingPixelScore: integer("tracking_pixel_score").notNull().default(85),
    detectedPixelsJson: text("detected_pixels_json"),
    checksPassedJson: text("checks_passed_json").notNull(),
    criticalFrictionPointsJson: text("critical_friction_points_json").notNull(),
    recommendedFixesJson: text("recommended_fixes_json").notNull(),
    modelUsed: text("model_used"),
    auditedAt: text("audited_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("conversion_audit_project_idx").on(table.projectId),
    index("conversion_audit_target_idx").on(table.targetUrl),
  ]
);

export const localBusinessProfiles = pgTable(
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
    primaryCategory: text("primary_category").notNull().default("General Business"),
    gbpClaimed: boolean("gbp_claimed").notNull().default(true),
    gbpHealthScore: integer("gbp_health_score").notNull().default(85), // 0-100
    averageRating: doublePrecision("average_rating").notNull().default(4.8),
    totalReviews: integer("total_reviews").notNull().default(38),
    napConsistencyScore: integer("nap_consistency_score").notNull().default(92), // 0-100
    citationsListJson: text("citations_list_json").notNull(),
    reviewsListJson: text("reviews_list_json").notNull(),
    auditHighlightsJson: text("audit_highlights_json").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("local_business_project_idx").on(table.projectId),
  ]
);

export const localBusinessLocations = pgTable(
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
    primaryCategory: text("primary_category").notNull().default("General Business"),
    lat: doublePrecision("lat").notNull().default(37.7749),
    lng: doublePrecision("lng").notNull().default(-122.4194),
    reviewLink: text("review_link"),
    isPrimary: boolean("is_primary").notNull().default(false),
    gbpHealthScore: integer("gbp_health_score").notNull().default(90),
    averageRating: doublePrecision("average_rating").notNull().default(4.8),
    totalReviews: integer("total_reviews").notNull().default(42),
    napConsistencyScore: integer("nap_consistency_score").notNull().default(95),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("local_locations_project_idx").on(table.projectId),
  ]
);

export const localRankGridSnapshots = pgTable(
  "local_rank_grid_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    locationId: text("location_id"),
    keyword: text("keyword").notNull(),
    gridSize: text("grid_size").notNull().default("3x3"), // '3x3' | '5x5' | '7x7'
    centerLat: doublePrecision("center_lat").notNull(),
    centerLng: doublePrecision("center_lng").notNull(),
    radiusKm: doublePrecision("radius_km").notNull().default(5.0),
    averageRank: doublePrecision("average_rank").notNull().default(2.4),
    topThreeCoverageRate: integer("top_three_coverage_rate").notNull().default(80), // %
    gridPointsJson: text("grid_points_json").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("local_grid_project_idx").on(table.projectId),
    index("local_grid_keyword_idx").on(table.keyword),
    index("local_grid_location_idx").on(table.locationId),
  ]
);

export const userNotifications = pgTable(
  "user_notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    category: text("category").notNull().default("system"),
    priority: text("priority").notNull().default("info"),
    isRead: boolean("is_read").notNull().default(false),
    actionUrl: text("action_url"),
    details: text("details"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("user_notifications_user_idx").on(table.userId),
    index("user_notifications_is_read_idx").on(table.isRead),
  ]
);

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    projectId: text("project_id").primaryKey(),
    brandName: text("brand_name").notNull(),
    websiteUrl: text("website_url"),
    industry: text("industry").notNull().default("SaaS / Software"),
    companySize: text("company_size").notNull().default("1-5"),
    targetCountry: text("target_country").notNull().default("US"),
    targetLanguage: text("target_language").notNull().default("en"),
    socialLinksJson: text("social_links_json").notNull().default("{}"),
    brandDescription: text("brand_description"),
    valueProposition: text("value_proposition"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  }
);

export const brandCompetitors = pgTable(
  "brand_competitors",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    domain: text("domain").notNull(),
    name: text("name"),
    websiteUrl: text("website_url"),
    socialHandlesJson: text("social_handles_json").notNull().default("{}"),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("brand_competitors_project_idx").on(table.projectId),
    index("brand_competitors_domain_idx").on(table.domain),
  ]
);

export const brandAudits = pgTable(
  "brand_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    overallScore: integer("overall_score").notNull().default(85),
    brandEquityScore: integer("brand_equity_score").notNull().default(82),
    socialProofScore: integer("social_proof_score").notNull().default(88),
    conversionReadinessScore: integer("conversion_readiness_score").notNull().default(80),
    adClarityScore: integer("ad_clarity_score").notNull().default(85),
    technicalHealthScore: integer("technical_health_score").notNull().default(90),
    reputationSentimentScore: integer("reputation_sentiment_score").notNull().default(84),
    strengthsJson: text("strengths_json").notNull(),
    weaknessesJson: text("weaknesses_json").notNull(),
    actionPlanJson: text("action_plan_json").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("brand_audits_project_idx").on(table.projectId),
  ]
);

export const trustSentimentAudits = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("trust_sentiment_project_idx").on(table.projectId),
  ]
);

export const viralContentItems = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("viral_content_project_idx").on(table.projectId),
    index("viral_content_platform_idx").on(table.platform),
  ]
);



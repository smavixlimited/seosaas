import { eq } from "drizzle-orm";
import { db } from "@/db";
import { whiteLabelConfigs } from "@/db/schema";

export async function getWhiteLabelConfig(userId: string) {
  const [cfg] = await db
    .select()
    .from(whiteLabelConfigs)
    .where(eq(whiteLabelConfigs.userId, userId))
    .limit(1);

  if (!cfg) {
    return {
      userId,
      companyName: "Your Agency Name",
      logoUrl: "",
      primaryColor: "#17199b",
      customDomain: "",
      reportFooterNotes: "Prepared exclusively for our client. Confidential and proprietary.",
    };
  }

  return cfg;
}

export async function upsertWhiteLabelConfig(
  userId: string,
  params: {
    companyName: string;
    logoUrl?: string | null;
    primaryColor: string;
    customDomain?: string | null;
    reportFooterNotes?: string | null;
  }
) {
  const now = new Date().toISOString();

  const [saved] = await db
    .insert(whiteLabelConfigs)
    .values({
      userId,
      companyName: params.companyName.trim(),
      logoUrl: params.logoUrl?.trim() || null,
      primaryColor: params.primaryColor.trim() || "#17199b",
      customDomain: params.customDomain?.trim() || null,
      reportFooterNotes: params.reportFooterNotes?.trim() || null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: whiteLabelConfigs.userId,
      set: {
        companyName: params.companyName.trim(),
        logoUrl: params.logoUrl?.trim() || null,
        primaryColor: params.primaryColor.trim() || "#17199b",
        customDomain: params.customDomain?.trim() || null,
        reportFooterNotes: params.reportFooterNotes?.trim() || null,
        updatedAt: now,
      },
    })
    .returning();

  return saved;
}

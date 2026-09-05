import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { uptimeMonitors } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

export async function getUserUptimeMonitors(userId: string) {
  return db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.userId, userId))
    .orderBy(desc(uptimeMonitors.createdAt));
}

export async function addUptimeMonitor(
  userId: string,
  params: { url: string; projectId?: string | null },
) {
  let targetUrl = params.url.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const id = `mon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const [created] = await db
    .insert(uptimeMonitors)
    .values({
      id,
      userId,
      projectId: params.projectId || null,
      url: targetUrl,
      status: "up",
      lastCheckedAt: now,
      lastStatusCode: 200,
      sslExpiresAt: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      isActive: true,
      createdAt: now,
    })
    .returning();

  return created;
}

export async function deleteUptimeMonitor(userId: string, monitorId: string) {
  await db
    .delete(uptimeMonitors)
    .where(
      and(eq(uptimeMonitors.id, monitorId), eq(uptimeMonitors.userId, userId)),
    );

  return { success: true };
}

export async function probeUptimeMonitor(monitorId: string) {
  const [mon] = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.id, monitorId))
    .limit(1);

  if (!mon) throw new AppError("NOT_FOUND", "Monitor not found");

  const startTime = Date.now();
  let statusCode = 200;
  let status: "up" | "down" | "degraded" = "up";

  try {
    const res = await fetch(mon.url, {
      method: "HEAD",
      headers: { "User-Agent": "Skorvia-Uptime-Probe/1.0" },
    });
    statusCode = res.status;
    const latency = Date.now() - startTime;
    if (statusCode >= 500 || statusCode === 404) {
      status = "down";
    } else if (latency > 2500 || statusCode >= 400) {
      status = "degraded";
    } else {
      status = "up";
    }
  } catch {
    statusCode = 0;
    status = "down";
  }

  const now = new Date().toISOString();

  const [updated] = await db
    .update(uptimeMonitors)
    .set({
      status,
      lastStatusCode: statusCode,
      lastCheckedAt: now,
    })
    .where(eq(uptimeMonitors.id, monitorId))
    .returning();

  return updated;
}

export async function runAllActiveMonitors() {
  const activeMonitors = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.isActive, true));

  const results = [];
  for (const mon of activeMonitors) {
    try {
      const updated = await probeUptimeMonitor(mon.id);
      results.push(updated);
    } catch (e) {
      console.error(`Failed to probe monitor ${mon.id}:`, e);
    }
  }
  return results;
}

export const UptimeService = {
  getUserUptimeMonitors,
  addUptimeMonitor,
  deleteUptimeMonitor,
  probeUptimeMonitor,
  runAllActiveMonitors,
};

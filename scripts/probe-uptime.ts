import { UptimeService } from "@/services/uptime.service";

async function main() {
  try {
    const results = await UptimeService.runAllActiveMonitors();
    console.log(
      `[Uptime Probe] Successfully checked ${results.length} active monitors at ${new Date().toISOString()}`,
    );
    process.exit(0);
  } catch (error: any) {
    console.error("[Uptime Probe Error]:", error?.message || error);
    process.exit(1);
  }
}

main();

import { chromium, type Page } from "@playwright/test";

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          setTimeout(resolve, 500);
        }
      }, 100);
    });
  });
}

async function run() {
  const artifactDir =
    "/Users/rasheedmac/.gemini/antigravity/brain/ad832c28-1255-42a9-8e38-db6b75ee544e";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("1. Homepage...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await autoScroll(page);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${artifactDir}/homepage_full_page.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `${artifactDir}/homepage_hero_desktop.png`,
    fullPage: false,
  });

  console.log("2. Dropdown menus...");
  const featuresBtn = page.locator('button:has-text("Features")').first();
  if (await featuresBtn.isVisible()) {
    await featuresBtn.hover();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${artifactDir}/navbar_dropdown_features.png`,
    });
  }

  const resourcesBtn = page.locator('button:has-text("Resources")').first();
  if (await resourcesBtn.isVisible()) {
    await resourcesBtn.hover();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${artifactDir}/navbar_dropdown_resources.png`,
    });
  }

  // Move mouse away to close dropdowns
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  console.log("3. Auth pages...");
  await page.goto("http://localhost:3000/sign-in", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/auth_signin.png` });

  await page.goto("http://localhost:3000/sign-up", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/auth_signup.png` });

  await page.goto(
    "http://localhost:3000/confirm-email?email=growth@acmecorp.com",
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/auth_confirm_email.png` });

  await page.goto("http://localhost:3000/forgot-password", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/auth_forgot_password.png` });

  await page.goto("http://localhost:3000/admin-login", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/admin_login.png` });

  console.log("4. Pricing page...");
  await page.goto("http://localhost:3000/pricing", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${artifactDir}/pricing_page.png`,
    fullPage: false,
  });

  console.log("5. Blog & Docs...");
  await page.goto("http://localhost:3000/blogs", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${artifactDir}/blogs_page.png`,
    fullPage: false,
  });

  await page.goto("http://localhost:3000/docs", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${artifactDir}/docs_page.png`,
    fullPage: false,
  });

  console.log("6. Comparison page...");
  await page.goto("http://localhost:3000/vs-ahrefs-semrush", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${artifactDir}/vs_ahrefs_semrush.png`,
    fullPage: false,
  });

  console.log("7. Mobile view...");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/homepage_mobile.png`,
    fullPage: false,
  });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { test } from '@playwright/test';

test('capture screenshots of template homepage', async ({ page }) => {
  const artifactDir = '/Users/rasheedmac/.gemini/antigravity/brain/ad832c28-1255-42a9-8e38-db6b75ee544e';
  
  // Set Desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Scroll down smoothly to load all lazy images
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await page.waitForTimeout(2000);

  // 1. Full Page
  await page.screenshot({ path: `${artifactDir}/homepage_full_page.png`, fullPage: true });

  // 2. Hero Viewport
  await page.screenshot({ path: `${artifactDir}/homepage_desktop.png`, fullPage: false });

  // 3. Test interactive scanner preset
  const ecomBtn = page.locator('button:has-text("E-Commerce")').first();
  if (await ecomBtn.isVisible()) {
    await ecomBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Test keyword gaps tab
  const gapsTab = page.locator('button:has-text("Top Keyword Gaps")').first();
  if (await gapsTab.isVisible()) {
    await gapsTab.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${artifactDir}/homepage_interactive_sandbox.png` });

  // 5. Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${artifactDir}/homepage_mobile.png`, fullPage: false });
});

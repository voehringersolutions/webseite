import { chromium } from 'playwright';

const ASSETS_DIR = 'c:/Users/voehr/voehringersolution-website/assets';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // --- LOGIN ---
  console.log('[1] Logging in...');
  await page.goto('https://engine.voehringersolutions.de/client/login', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.fill('input[name="email"]', 'account@voehringersolutions.de');
  await page.fill('input[name="password"]', 'Test');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');

  // Wait for welcome animation to finish
  console.log('[2] Waiting for welcome animation...');
  await page.waitForTimeout(8000);

  // Helper: click sidebar
  async function clickSidebar(label) {
    const clicked = await page.evaluate((lbl) => {
      const allDivs = document.querySelectorAll('div');
      for (const div of allDivs) {
        const rect = div.getBoundingClientRect();
        if (rect.left < 80 && rect.width < 80 && rect.height > 30 && rect.height < 55 &&
            div.textContent.trim() === lbl && window.getComputedStyle(div).cursor === 'pointer') {
          div.click();
          return true;
        }
      }
      return false;
    }, label);
    if (clicked) await page.waitForTimeout(2500);
    return clicked;
  }

  // Helper: click tab button by text (using Playwright locator)
  async function clickTab(tabText) {
    try {
      const btn = page.locator(`button:text-is("${tabText}")`).first();
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
      console.log(`  -> Clicked tab: ${tabText}`);
      return true;
    } catch (e) {
      console.log(`  [WARN] Tab "${tabText}" not clickable: ${e.message.substring(0, 80)}`);
      return false;
    }
  }

  // Helper: screenshot with full page and scroll variants
  async function takeScreenshots(name) {
    await page.screenshot({ path: `${ASSETS_DIR}/dashboard-${name}.png` });
    const scrollH = await page.evaluate(() => document.body.scrollHeight);
    if (scrollH > 950) {
      await page.screenshot({ path: `${ASSETS_DIR}/dashboard-${name}-full.png`, fullPage: true });
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.85));
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${ASSETS_DIR}/dashboard-${name}-scrolled.png` });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    }
    console.log(`  -> Saved: dashboard-${name}.png (scrollH: ${scrollH})`);
  }

  // ===== DASHBOARDS =====
  console.log('\n--- DASHBOARDS ---');
  await clickSidebar('Dashboards');

  // Pipeline (default tab)
  console.log('  Pipeline tab (default):');
  await takeScreenshots('pipeline');

  // Team tab
  console.log('  Team tab:');
  await clickTab('Team');
  await takeScreenshots('team');

  // Activities tab
  console.log('  Activities tab:');
  await clickTab('Activities');
  await takeScreenshots('activities');

  // Funnel tab
  console.log('  Funnel tab:');
  await clickTab('Funnel');
  await takeScreenshots('funnel');

  // ===== OTHER PAGES =====
  console.log('\n--- GOALS ---');
  await clickSidebar('Goals');
  await takeScreenshots('goals');

  console.log('\n--- PROJEKTE ---');
  await clickSidebar('Projekte');
  await takeScreenshots('projekte');

  console.log('\n--- TERMINE ---');
  await clickSidebar('Termine');
  await takeScreenshots('termine');

  console.log('\n--- LEAD-FORMULARE ---');
  await clickSidebar('Lead-Formulare');
  await takeScreenshots('leadforms');

  console.log('\n--- NOTIFICATIONS ---');
  await clickSidebar('Notifications');
  await takeScreenshots('notifications');

  console.log('\n--- RECHNUNGEN ---');
  await page.evaluate(() => {
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      const rect = div.getBoundingClientRect();
      if (rect.left < 80 && rect.width < 80 && rect.height > 30 && rect.height < 55 &&
          div.textContent.trim().includes('Rechnungen') &&
          window.getComputedStyle(div).cursor === 'pointer') {
        div.click();
        return;
      }
    }
  });
  await page.waitForTimeout(2500);
  await takeScreenshots('rechnungen');

  console.log('\n--- DOKUMENTE ---');
  await clickSidebar('Dokumente');
  await takeScreenshots('dokumente');

  console.log('\n--- VIDEOLIBRARY ---');
  await clickSidebar('Videolibrary');
  await takeScreenshots('videolibrary');

  console.log('\n--- ACCOUNT ---');
  await clickSidebar('Account');
  await takeScreenshots('account');

  console.log('\n========================================');
  console.log('[DONE] All screenshots saved to:', ASSETS_DIR);
  await browser.close();
})();

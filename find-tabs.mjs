import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Login
  await page.goto('https://engine.voehringersolutions.de/client/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'account@voehringersolutions.de');
  await page.fill('input[name="password"]', 'Test');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(8000);

  // Click Dashboards sidebar
  await page.evaluate(() => {
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      const rect = div.getBoundingClientRect();
      if (rect.left < 80 && rect.width < 80 && rect.height > 30 && rect.height < 55 &&
          div.textContent.trim() === 'Dashboards' && window.getComputedStyle(div).cursor === 'pointer') {
        div.click();
        return;
      }
    }
  });
  await page.waitForTimeout(2500);

  // Find ALL elements that contain tab text
  const allMatches = await page.evaluate(() => {
    const results = [];
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      const text = el.textContent.trim();
      if (['Pipeline', 'Team', 'Activities', 'Funnel'].includes(text)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push({
            tag: el.tagName,
            text,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            cursor: window.getComputedStyle(el).cursor,
            display: window.getComputedStyle(el).display,
            parent: el.parentElement ? el.parentElement.tagName : '',
            parentClass: el.parentElement ? (el.parentElement.className || '').toString().substring(0, 50) : '',
          });
        }
      }
    }
    return results;
  });
  console.log('Tab elements found:', JSON.stringify(allMatches, null, 2));

  await browser.close();
})();

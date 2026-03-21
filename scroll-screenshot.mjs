import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html');
await page.waitForTimeout(1000);

// Scroll through entire page to trigger all reveal animations
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < totalHeight; y += 300) {
  await page.evaluate(h => window.scrollTo(0, h), y);
  await page.waitForTimeout(100);
}

// Scroll back to top and wait
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

// Full page screenshot with all reveals triggered
await page.screenshot({ path: 'scrolled-full.png', fullPage: true });

// Individual section screenshots
const sections = ['problem', 'leistungen', 'prozess', 'ergebnisse', 'techstack', 'faq', 'kunden', 'preise'];
for (const id of sections) {
  const el = await page.$(`#${id}`);
  if (el) {
    await el.screenshot({ path: `scrolled-${id}.png` });
  }
}
await browser.close();
console.log('Done');

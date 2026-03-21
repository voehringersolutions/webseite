import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html');
await page.waitForTimeout(1000);
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < totalHeight; y += 400) {
  await page.evaluate(h => window.scrollTo(0, h), y);
  await page.waitForTimeout(80);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: 'mobile-full.png', fullPage: true });

const sections = ['problem', 'leistungen', 'prozess', 'ergebnisse', 'dashboard-showcase', 'kunden', 'preise', 'faq', 'kontakt'];
for (const id of sections) {
  const el = await page.$(`#${id}`);
  if (el) await el.screenshot({ path: `mobile-${id}.png` });
}
const hero = await page.$('.hero');
if (hero) await hero.screenshot({ path: 'mobile-hero.png' });
const nav = await page.$('.nav');
if (nav) await nav.screenshot({ path: 'mobile-nav.png' });
const footer = await page.$('.footer');
if (footer) await footer.screenshot({ path: 'mobile-footer.png' });
await browser.close();
console.log('Done');

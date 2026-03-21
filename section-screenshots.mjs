import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html');
await page.waitForTimeout(2000);

const sections = ['problem', 'leistungen', 'prozess', 'ergebnisse', 'dashboard-showcase', 'kunden', 'preise', 'techstack', 'faq', 'kontakt'];
for (const id of sections) {
  const el = await page.$(`#${id}`);
  if (el) {
    await el.screenshot({ path: `section-${id}.png` });
    console.log(`Captured ${id}`);
  }
}
// Also hero
const hero = await page.$('.hero');
if (hero) {
  await hero.screenshot({ path: 'section-hero.png' });
  console.log('Captured hero');
}
await browser.close();

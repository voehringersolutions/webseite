import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')));

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: 'final-hero.png' });
await page.screenshot({ path: 'final-full.png', fullPage: true });

const sects = ['#problem','#leistungen','#ergebnisse','#dashboard-showcase','#kunden','#preise'];
const names = ['final-problem','final-leistungen','final-ergebnisse','final-dashboard','final-testimonials','final-pricing'];
for (let i = 0; i < sects.length; i++) {
    await page.evaluate(s => document.querySelector(s)?.scrollIntoView({behavior:'instant'}), sects[i]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: names[i]+'.png' });
}
console.log('Done');
await browser.close();

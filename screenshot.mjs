import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html');
await page.waitForTimeout(500);

// Scroll through the page to trigger all reveal animations
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < totalHeight; y += 400) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(150);
}

// Scroll back to top
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

await page.screenshot({ path: 'screenshot-full.png', fullPage: true });
console.log('Screenshot saved.');
await browser.close();

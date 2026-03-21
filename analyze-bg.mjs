import { chromium } from 'playwright';
const browser = await chromium.launch();

const urls = [
    { name: 'wave', url: 'https://21st.dev/community/components/aliimam/wave-1/default' },
    { name: 'grid', url: 'https://21st.dev/community/components/magicui/animated-grid-pattern/default' },
    { name: 'yunicorn-mid', url: 'https://yunicorn.vc/' },
];

for (const u of urls) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
        await page.goto(u.url, { timeout: 15000, waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        if (u.name === 'yunicorn-mid') {
            const h = await page.evaluate(() => document.body.scrollHeight);
            await page.evaluate(y => window.scrollTo(0, y), h * 0.15);
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `bg-${u.name}-1.png` });
            await page.evaluate(y => window.scrollTo(0, y), h * 0.35);
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `bg-${u.name}-2.png` });
            await page.evaluate(y => window.scrollTo(0, y), h * 0.55);
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `bg-${u.name}-3.png` });
        }
        await page.screenshot({ path: `bg-${u.name}.png` });
        const iframe = page.locator('iframe').first();
        try {
            await iframe.screenshot({ path: `bg-${u.name}-preview.png` });
        } catch(e) {}
    } catch(e) { console.log(`Error ${u.name}: ${e.message.substring(0,60)}`); }
    await page.close();
}
console.log('Done');
await browser.close();

import { chromium } from 'playwright';
const browser = await chromium.launch();
const urls = [
    { name: 'shimmer', url: 'https://21st.dev/community/components/dillionverma/shimmer-button/default' },
    { name: 'hover', url: 'https://21st.dev/community/components/serafimcloud/hover-button/default' },
];
for (const u of urls) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
        await page.goto(u.url, { timeout: 20000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(4000);
        await page.screenshot({ path: `btn-${u.name}-full.png` });
        try {
            const iframe = page.locator('iframe').first();
            await iframe.screenshot({ path: `btn-${u.name}.png` });
        } catch(e) { console.log(`No iframe for ${u.name}`); }
    } catch(e) { console.log(`Error ${u.name}: ${e.message.substring(0,60)}`); }
    await page.close();
}
console.log('Done');
await browser.close();

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

// Download the video preview images from onecdn.io
const previews = [
    {
        name: 'hannes-gerlach-video-preview',
        url: 'https://onecdn.io/media/4e71a40b-fba0-46fd-8d9c-7b42995c8a7a/preview',
        alt: 'Ein Mann mit Bart und gestreiftem Hemd sitzt vor einem Mikrofon und spricht.'
    },
    {
        name: 'eike-friedrich-video-preview',
        url: 'https://onecdn.io/media/000adce8-a761-4bf1-b00b-673dd7e155b0/preview',
        alt: 'Ein Mann in Anzug und Brille gestikuliert vor einem Bildschirm mit dem Logo DER.FINANZSTUERMER'
    },
    {
        name: 'marius-hau-video-preview',
        url: 'https://onecdn.io/media/e9c7b7dc-a9ac-44fd-9f95-8ab4294b169e/preview',
        alt: 'Junger Mann mit dunklem Haar und dunklem Reissverschluss-Oberteil sitzt auf einem Sofa.'
    }
];

for (const preview of previews) {
    try {
        const page = await context.newPage();
        const resp = await page.goto(preview.url, { timeout: 15000 });
        if (resp && resp.status() === 200) {
            const buffer = await resp.body();
            const contentType = resp.headers()['content-type'] || '';
            const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
            const path = `c:/Users/voehr/voehringersolution-website/assets/${preview.name}.${ext}`;
            writeFileSync(path, buffer);
            console.log(`Downloaded: ${preview.name} (${buffer.length} bytes, ${ext})`);
        } else {
            console.log(`Failed to download ${preview.name}: status ${resp?.status()}`);
        }
        await page.close();
    } catch (e) {
        console.log(`Error downloading ${preview.name}: ${e.message}`);
    }
}

await browser.close();
console.log('Done downloading preview images.');

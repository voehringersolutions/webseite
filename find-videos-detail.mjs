import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const results = [];
const log = (msg) => {
    console.log(msg);
    results.push(msg);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
const page = await context.newPage();

await page.goto('https://voehringersolutions.de', { waitUntil: 'networkidle', timeout: 30000 });

// Scroll through fully to load all content
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < totalHeight; y += 300) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(200);
}
await page.waitForTimeout(2000);

// ============ 1. Map video URLs to their surrounding context ============
log('\n====== VIDEO URL TO CUSTOMER MAPPING ======\n');

const videoMapping = await page.evaluate(() => {
    const videoElements = document.querySelectorAll('[data-video-url]');
    const mappings = [];

    for (const el of videoElements) {
        const videoUrl = el.getAttribute('data-video-url');

        // Walk up to find the parent section/container
        let parent = el;
        let sectionText = '';
        let nearbyNames = [];

        // Go up to find the nearest section
        for (let i = 0; i < 20; i++) {
            parent = parent.parentElement;
            if (!parent) break;
            if (parent.tagName === 'SECTION' || parent.classList.contains('con-kit-section')) {
                sectionText = parent.textContent.substring(0, 1000).trim();
                break;
            }
        }

        // Look for nearby text that might identify the customer
        // Check siblings and parent's children
        let container = el.closest('.con-kit-molecule, .con-kit-row, .con-kit-layer, [class*="row"], [class*="column"], [class*="grid"]');
        if (!container) container = el.parentElement?.parentElement?.parentElement;

        const containerText = container ? container.textContent.substring(0, 500).trim() : '';

        // Look for images nearby (avatar/profile)
        const nearbyImages = container
            ? Array.from(container.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt
            }))
            : [];

        // Get the video preview image
        const previewEl = el.closest('.con-kit-component-video, .con-kit-atom-video')?.querySelector('.con-kit-component-video-preview img, img');
        const previewSrc = previewEl ? previewEl.src : null;

        mappings.push({
            videoUrl,
            containerText,
            sectionText: sectionText.substring(0, 500),
            nearbyImages,
            previewSrc,
            embedType: el.getAttribute('data-video-embed-type'),
            parentClasses: Array.from({ length: 5 }, (_, i) => {
                let p = el;
                for (let j = 0; j <= i; j++) p = p?.parentElement;
                return p ? `${p.tagName}.${p.className?.toString()?.substring(0, 80)}` : null;
            }).filter(Boolean)
        });
    }

    return mappings;
});

videoMapping.forEach((m, i) => {
    log(`\nVideo ${i + 1}:`);
    log(`  URL: ${m.videoUrl}`);
    log(`  Embed type: ${m.embedType}`);
    log(`  Preview image: ${m.previewSrc}`);
    log(`  Container text: ${m.containerText}`);
    log(`  Nearby images: ${JSON.stringify(m.nearbyImages)}`);
    log(`  Parent chain: ${m.parentClasses.join(' > ')}`);
});

// ============ 2. Get full "unsere-kunden" section detail ============
log('\n\n====== KUNDEN SECTION DETAILED ANALYSIS ======\n');

const kundenDetail = await page.evaluate(() => {
    const section = document.querySelector('.unsere-kunden');
    if (!section) return { found: false };

    // Get all rows within the section
    const rows = section.querySelectorAll('.con-kit-row, [class*="row"]');
    const rowData = [];

    for (const row of rows) {
        const videos = row.querySelectorAll('[data-video-url]');
        const texts = row.querySelectorAll('[class*="text"], p, h1, h2, h3, h4, h5, h6, span');
        const images = row.querySelectorAll('img');

        rowData.push({
            className: row.className?.toString()?.substring(0, 200),
            text: row.textContent.substring(0, 500).trim(),
            videoUrls: Array.from(videos).map(v => v.getAttribute('data-video-url')),
            imageUrls: Array.from(images).map(img => ({ src: img.src?.substring(0, 200), alt: img.alt })),
            innerHTML: row.innerHTML.substring(0, 1000)
        });
    }

    return {
        found: true,
        text: section.textContent.substring(0, 2000).trim(),
        rowCount: rows.length,
        rows: rowData
    };
});

if (kundenDetail.found) {
    log(`Kunden section found with ${kundenDetail.rowCount} rows.`);
    log(`Full text: ${kundenDetail.text.substring(0, 500)}`);
    kundenDetail.rows.forEach((row, i) => {
        log(`\n  Row ${i}:`);
        log(`    class: ${row.className}`);
        log(`    text: ${row.text.substring(0, 200)}`);
        log(`    videos: ${JSON.stringify(row.videoUrls)}`);
        log(`    images: ${JSON.stringify(row.imageUrls)}`);
    });
} else {
    log('Kunden section NOT found.');
}

// ============ 3. Screenshot each video preview ============
log('\n\n====== SCREENSHOTTING VIDEO PREVIEWS ======\n');

// Screenshot the entire kunden section
const kundenSection = await page.$('.unsere-kunden');
if (kundenSection) {
    await kundenSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await kundenSection.screenshot({ path: 'c:/Users/voehr/voehringersolution-website/assets/live-kunden-section.png' });
    log('Kunden section screenshot saved.');
}

// Screenshot each video component
const videoComponents = await page.$$('.con-kit-component-video');
for (let i = 0; i < videoComponents.length; i++) {
    try {
        await videoComponents[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await videoComponents[i].screenshot({
            path: `c:/Users/voehr/voehringersolution-website/assets/video-thumbnail-${i + 1}.png`
        });
        log(`Video thumbnail ${i + 1} screenshot saved.`);
    } catch (e) {
        log(`Error screenshotting video ${i + 1}: ${e.message}`);
    }
}

// Also screenshot the video preview containers
const videoPreviews = await page.$$('.con-kit-component-video-preview');
for (let i = 0; i < videoPreviews.length; i++) {
    try {
        await videoPreviews[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const box = await videoPreviews[i].boundingBox();
        if (box && box.width > 0 && box.height > 0) {
            await videoPreviews[i].screenshot({
                path: `c:/Users/voehr/voehringersolution-website/assets/video-preview-${i + 1}.png`
            });
            log(`Video preview ${i + 1} screenshot saved (${Math.round(box.width)}x${Math.round(box.height)}).`);
        } else {
            log(`Video preview ${i + 1} has no visible box.`);
        }
    } catch (e) {
        log(`Error screenshotting preview ${i + 1}: ${e.message}`);
    }
}

// ============ 4. Get YouTube thumbnail images directly ============
log('\n\n====== YOUTUBE THUMBNAIL URLS ======\n');

const youtubeIds = [];

// Extract YouTube IDs
const urls = ['https://youtu.be/RLaD8tXjjVk', 'https://www.youtube.com/watch?v=XlcpNIQR_y8'];
for (const url of urls) {
    let id = null;
    if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
        id = url.split('v=')[1].split('&')[0];
    }
    if (id) {
        youtubeIds.push(id);
        log(`YouTube ID: ${id}`);
        log(`  Thumbnail (maxres): https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
        log(`  Thumbnail (hq): https://img.youtube.com/vi/${id}/hqdefault.jpg`);
        log(`  Thumbnail (sd): https://img.youtube.com/vi/${id}/sddefault.jpg`);
        log(`  Embed URL: https://www.youtube.com/embed/${id}`);
    }
}

// Download YouTube thumbnails
for (const id of youtubeIds) {
    try {
        const thumbPage = await context.newPage();
        const resp = await thumbPage.goto(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`, { timeout: 10000 });
        if (resp && resp.status() === 200) {
            const buffer = await resp.body();
            writeFileSync(`c:/Users/voehr/voehringersolution-website/assets/yt-thumb-${id}.jpg`, buffer);
            log(`Downloaded YouTube thumbnail for ${id} (maxres).`);
        } else {
            // Try hqdefault
            const resp2 = await thumbPage.goto(`https://img.youtube.com/vi/${id}/hqdefault.jpg`, { timeout: 10000 });
            if (resp2 && resp2.status() === 200) {
                const buffer = await resp2.body();
                writeFileSync(`c:/Users/voehr/voehringersolution-website/assets/yt-thumb-${id}.jpg`, buffer);
                log(`Downloaded YouTube thumbnail for ${id} (hq).`);
            }
        }
        await thumbPage.close();
    } catch (e) {
        log(`Error downloading thumbnail for ${id}: ${e.message}`);
    }
}

// ============ 5. Get YouTube video titles to identify which customer ============
log('\n\n====== YOUTUBE VIDEO TITLES ======\n');

for (const id of youtubeIds) {
    try {
        const vidPage = await context.newPage();
        await vidPage.goto(`https://www.youtube.com/watch?v=${id}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await vidPage.waitForTimeout(3000);

        const title = await vidPage.title();
        log(`Video ${id}: Title = "${title}"`);

        // Try to get video description and channel
        const meta = await vidPage.evaluate(() => {
            const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer, h1 yt-formatted-string, meta[name="title"]');
            const channelEl = document.querySelector('#channel-name a, ytd-channel-name a, link[itemprop="name"]');
            const descEl = document.querySelector('#description, meta[name="description"]');

            return {
                title: titleEl?.textContent?.trim() || titleEl?.getAttribute('content'),
                channel: channelEl?.textContent?.trim() || channelEl?.getAttribute('content'),
                description: descEl?.textContent?.trim()?.substring(0, 300) || descEl?.getAttribute('content')?.substring(0, 300)
            };
        });

        log(`  Title: ${meta.title}`);
        log(`  Channel: ${meta.channel}`);
        log(`  Description: ${meta.description}`);

        await vidPage.screenshot({ path: `c:/Users/voehr/voehringersolution-website/assets/yt-video-${id}.png` });
        log(`  YouTube page screenshot saved.`);

        await vidPage.close();
    } catch (e) {
        log(`Error getting video info for ${id}: ${e.message}`);
    }
}

// ============ 6. Check for a third video URL we may have missed ============
log('\n\n====== CHECKING FOR ADDITIONAL VIDEOS ======\n');

// The site shows 3 video-preview elements but we only found 2 unique URLs
// Let's check all data-video-url values explicitly
const allVideoUrls = await page.evaluate(() => {
    const els = document.querySelectorAll('[data-video-url]');
    return Array.from(els).map((el, i) => {
        // Get the surrounding column/card to identify customer
        let parent = el;
        let textContent = '';
        for (let j = 0; j < 30; j++) {
            parent = parent?.parentElement;
            if (!parent) break;
            const text = parent.textContent?.trim();
            if (text && text.length > 10) {
                textContent = text.substring(0, 400);
                break;
            }
        }

        return {
            index: i,
            url: el.getAttribute('data-video-url'),
            outerHTML: el.outerHTML.substring(0, 500),
            surroundingText: textContent
        };
    });
});

allVideoUrls.forEach((v, i) => {
    log(`\n  Video element ${i}:`);
    log(`    URL: ${v.url}`);
    log(`    Surrounding text: ${v.surroundingText}`);
    log(`    HTML: ${v.outerHTML}`);
});

// ============ Write final results ============
const output = results.join('\n');
writeFileSync('c:/Users/voehr/voehringersolution-website/video-urls.txt', output, 'utf-8');
console.log('\n\nResults written to video-urls.txt');

await browser.close();

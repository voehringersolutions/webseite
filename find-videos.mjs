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

// Collect all network requests for video/embed URLs
const videoUrls = new Set();
page.on('request', (req) => {
    const url = req.url();
    if (url.includes('youtube') || url.includes('youtu.be') || url.includes('loom.com') ||
        url.includes('vimeo') || url.includes('wistia') || url.includes('.mp4') ||
        url.includes('vidyard') || url.includes('bunny.net') || url.includes('cloudflare') ||
        url.includes('player')) {
        videoUrls.add(url);
    }
});

// ============ 1. Navigate to voehringersolutions.de ============
log('\n====== SCRAPING https://voehringersolutions.de ======\n');

try {
    await page.goto('https://voehringersolutions.de', { waitUntil: 'networkidle', timeout: 30000 });
    log(`Page title: ${await page.title()}`);
    log(`Final URL: ${page.url()}`);

    // Take full page screenshot first
    await page.screenshot({ path: 'c:/Users/voehr/voehringersolution-website/assets/live-site-full.png', fullPage: true });
    log('Full page screenshot saved.');

    // Scroll through the entire page to load lazy content
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    log(`Page height: ${totalHeight}px`);

    for (let y = 0; y < totalHeight; y += 300) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await page.waitForTimeout(300);
    }
    // Wait for lazy-loaded content
    await page.waitForTimeout(2000);

    // ============ 2. Find all iframes ============
    log('\n--- IFRAMES ---');
    const iframes = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('iframe')).map(iframe => ({
            src: iframe.src,
            width: iframe.width,
            height: iframe.height,
            className: iframe.className,
            id: iframe.id,
            parentText: iframe.parentElement?.textContent?.substring(0, 100)?.trim()
        }));
    });
    if (iframes.length === 0) {
        log('No iframes found on page.');
    } else {
        iframes.forEach((iframe, i) => {
            log(`  iframe[${i}]: src=${iframe.src}, class=${iframe.className}, id=${iframe.id}`);
        });
    }

    // ============ 3. Find all video elements ============
    log('\n--- VIDEO ELEMENTS ---');
    const videos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('video')).map(v => ({
            src: v.src,
            sources: Array.from(v.querySelectorAll('source')).map(s => ({ src: s.src, type: s.type })),
            poster: v.poster,
            className: v.className,
            parentText: v.parentElement?.textContent?.substring(0, 100)?.trim()
        }));
    });
    if (videos.length === 0) {
        log('No <video> elements found on page.');
    } else {
        videos.forEach((v, i) => {
            log(`  video[${i}]: src=${v.src}, poster=${v.poster}, sources=${JSON.stringify(v.sources)}`);
        });
    }

    // ============ 4. Find all links with video-related URLs ============
    log('\n--- VIDEO-RELATED LINKS ---');
    const videoLinks = await page.evaluate(() => {
        const keywords = ['youtube', 'youtu.be', 'loom', 'vimeo', 'wistia', 'vidyard', 'video', 'watch'];
        return Array.from(document.querySelectorAll('a[href]'))
            .filter(a => keywords.some(kw => a.href.toLowerCase().includes(kw)))
            .map(a => ({ href: a.href, text: a.textContent?.trim()?.substring(0, 100) }));
    });
    if (videoLinks.length === 0) {
        log('No video-related links found.');
    } else {
        videoLinks.forEach((l, i) => {
            log(`  link[${i}]: href=${l.href}, text=${l.text}`);
        });
    }

    // ============ 5. Find testimonial/customer sections ============
    log('\n--- TESTIMONIAL/CUSTOMER SECTIONS ---');
    const testimonialSections = await page.evaluate(() => {
        const selectors = [
            '[id*="testimonial"]', '[id*="kunden"]', '[id*="customer"]', '[id*="review"]',
            '[class*="testimonial"]', '[class*="kunden"]', '[class*="customer"]', '[class*="review"]',
            '[id*="video"]', '[class*="video"]',
            '[data-section*="testimonial"]', '[data-section*="video"]'
        ];
        const found = [];
        for (const sel of selectors) {
            const els = document.querySelectorAll(sel);
            els.forEach(el => {
                found.push({
                    tag: el.tagName,
                    id: el.id,
                    className: el.className?.toString()?.substring(0, 200),
                    text: el.textContent?.substring(0, 300)?.trim(),
                    innerHTML: el.innerHTML?.substring(0, 500)
                });
            });
        }
        return found;
    });
    if (testimonialSections.length === 0) {
        log('No testimonial sections found by ID/class.');
    } else {
        testimonialSections.forEach((s, i) => {
            log(`  section[${i}]: <${s.tag}> id="${s.id}" class="${s.className}"`);
            log(`    text preview: ${s.text?.substring(0, 200)}`);
        });
    }

    // ============ 6. Search for names specifically ============
    log('\n--- SEARCHING FOR CUSTOMER NAMES ---');
    const nameSearch = await page.evaluate(() => {
        const names = ['Hannes', 'Gerlach', 'Marius', 'Hau', 'Eike', 'Friedrich', 'finanzstuermer', 'hannes_gerlach', 'marius.growth'];
        const body = document.body.innerHTML;
        const results = {};
        for (const name of names) {
            const regex = new RegExp(name, 'gi');
            const matches = body.match(regex);
            results[name] = matches ? matches.length : 0;
        }
        return results;
    });
    Object.entries(nameSearch).forEach(([name, count]) => {
        log(`  "${name}": found ${count} times`);
    });

    // ============ 7. Look for embedded players (div-based) ============
    log('\n--- EMBEDDED PLAYERS (div-based) ---');
    const players = await page.evaluate(() => {
        const selectors = [
            '[data-video-id]', '[data-youtube-id]', '[data-loom-id]',
            '.video-player', '.video-embed', '.video-container', '.video-wrapper',
            '[class*="player"]', '[class*="embed"]',
            '.loom-embed', '.youtube-embed',
            '[data-src*="youtube"]', '[data-src*="loom"]', '[data-src*="vimeo"]',
            '[data-url*="youtube"]', '[data-url*="loom"]', '[data-url*="vimeo"]'
        ];
        const found = [];
        for (const sel of selectors) {
            try {
                const els = document.querySelectorAll(sel);
                els.forEach(el => {
                    found.push({
                        selector: sel,
                        tag: el.tagName,
                        id: el.id,
                        className: el.className?.toString()?.substring(0, 200),
                        dataAttrs: Object.fromEntries(
                            Array.from(el.attributes)
                                .filter(a => a.name.startsWith('data-'))
                                .map(a => [a.name, a.value])
                        ),
                        innerHTML: el.innerHTML?.substring(0, 300)
                    });
                });
            } catch (e) {}
        }
        return found;
    });
    if (players.length === 0) {
        log('No div-based video players found.');
    } else {
        players.forEach((p, i) => {
            log(`  player[${i}]: ${p.selector} -> <${p.tag}> id="${p.id}" class="${p.className}"`);
            log(`    data-attrs: ${JSON.stringify(p.dataAttrs)}`);
        });
    }

    // ============ 8. Check all data attributes for video hints ============
    log('\n--- DATA ATTRIBUTES WITH VIDEO HINTS ---');
    const dataAttrs = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const found = [];
        const keywords = ['video', 'youtube', 'loom', 'vimeo', 'embed', 'player', 'watch'];
        for (const el of allElements) {
            for (const attr of el.attributes) {
                if (keywords.some(kw => attr.value.toLowerCase().includes(kw) || attr.name.toLowerCase().includes(kw))) {
                    found.push({
                        tag: el.tagName,
                        attrName: attr.name,
                        attrValue: attr.value.substring(0, 300),
                        className: el.className?.toString()?.substring(0, 100)
                    });
                }
            }
        }
        return found;
    });
    if (dataAttrs.length === 0) {
        log('No data attributes with video hints found.');
    } else {
        dataAttrs.forEach((d, i) => {
            log(`  attr[${i}]: <${d.tag} ${d.attrName}="${d.attrValue}">`);
        });
    }

    // ============ 9. Screenshot testimonial section ============
    log('\n--- SCREENSHOTTING TESTIMONIAL AREA ---');
    const testimonialEl = await page.$('#kunden, [id*="testimonial"], [class*="testimonial"], [id*="customer"]');
    if (testimonialEl) {
        await testimonialEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await testimonialEl.screenshot({ path: 'c:/Users/voehr/voehringersolution-website/assets/live-testimonials-section.png' });
        log('Testimonial section screenshot saved.');
    } else {
        log('No testimonial section element found for screenshot.');
        // Try scrolling to middle of page and take screenshot
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'c:/Users/voehr/voehringersolution-website/assets/live-mid-page.png' });
        log('Mid-page screenshot saved instead.');
    }

    // ============ 10. Dump the full page HTML structure ============
    log('\n--- PAGE STRUCTURE (sections/divs with IDs) ---');
    const structure = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('section, [id], main, article'))
            .map(el => ({
                tag: el.tagName,
                id: el.id,
                className: el.className?.toString()?.substring(0, 100),
                childCount: el.children.length
            }))
            .filter(el => el.id || el.tag === 'SECTION')
            .slice(0, 50);
    });
    structure.forEach((s, i) => {
        log(`  [${i}] <${s.tag}> id="${s.id}" class="${s.className}" children=${s.childCount}`);
    });

} catch (error) {
    log(`Error navigating to voehringersolutions.de: ${error.message}`);
}

// ============ 11. Try www version ============
log('\n\n====== SCRAPING https://www.voehringersolutions.de ======\n');

try {
    await page.goto('https://www.voehringersolutions.de', { waitUntil: 'networkidle', timeout: 30000 });
    log(`Page title: ${await page.title()}`);
    log(`Final URL: ${page.url()}`);

    // Check if it redirected to the same page
    const currentUrl = page.url();
    if (currentUrl.includes('voehringersolutions.de')) {
        log('Successfully loaded www version.');

        // Scroll through to load lazy content
        const totalHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y < totalHeight; y += 400) {
            await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
            await page.waitForTimeout(200);
        }
        await page.waitForTimeout(2000);

        // Check for any new iframes/videos after scrolling
        const newIframes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('iframe')).map(iframe => iframe.src);
        });
        const newVideos = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('video')).map(v => ({
                src: v.src,
                sources: Array.from(v.querySelectorAll('source')).map(s => s.src)
            }));
        });

        log(`iframes after scroll: ${JSON.stringify(newIframes)}`);
        log(`videos after scroll: ${JSON.stringify(newVideos)}`);

        // Full page screenshot of www version
        await page.screenshot({ path: 'c:/Users/voehr/voehringersolution-website/assets/live-www-full.png', fullPage: true });
        log('www full page screenshot saved.');
    }
} catch (error) {
    log(`Error navigating to www.voehringersolutions.de: ${error.message}`);
}

// ============ 12. Intercepted video URLs from network ============
log('\n--- INTERCEPTED VIDEO URLS FROM NETWORK ---');
if (videoUrls.size === 0) {
    log('No video-related network requests intercepted.');
} else {
    Array.from(videoUrls).forEach((url, i) => {
        log(`  [${i}] ${url}`);
    });
}

// ============ 13. Try common video embed patterns ============
log('\n\n====== TRYING COMMON VIDEO URL PATTERNS ======\n');

const namesToSearch = [
    { name: 'Hannes Gerlach', handle: 'hannes_gerlach' },
    { name: 'Marius Hau', handle: 'marius.growth' },
    { name: 'Eike Friedrich', handle: 'der.finanzstuermer' }
];

// Check if there's a separate testimonials/videos page
const subPages = [
    'https://voehringersolutions.de/testimonials',
    'https://voehringersolutions.de/kundenstimmen',
    'https://voehringersolutions.de/videos',
    'https://voehringersolutions.de/kunden',
    'https://voehringersolutions.de/referenzen',
    'https://voehringersolutions.de/erfahrungen',
    'https://voehringersolutions.de/about',
    'https://voehringersolutions.de/ueber-uns',
];

for (const url of subPages) {
    try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        if (resp && resp.status() < 400) {
            log(`Found sub-page: ${url} (status ${resp.status()})`);

            // Scroll and check for videos
            const totalHeight = await page.evaluate(() => document.body.scrollHeight);
            for (let y = 0; y < totalHeight; y += 400) {
                await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
                await page.waitForTimeout(200);
            }
            await page.waitForTimeout(1000);

            const pageIframes = await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map(f => f.src));
            const pageVideos = await page.evaluate(() => Array.from(document.querySelectorAll('video source, video[src]')).map(v => v.src || v.querySelector?.('source')?.src));

            if (pageIframes.length > 0) log(`  iframes: ${JSON.stringify(pageIframes)}`);
            if (pageVideos.length > 0) log(`  videos: ${JSON.stringify(pageVideos)}`);

            await page.screenshot({ path: `c:/Users/voehr/voehringersolution-website/assets/live-subpage-${url.split('/').pop()}.png`, fullPage: true });
        }
    } catch (e) {
        // Page doesn't exist, skip
    }
}

// ============ 14. Check page source for hidden/lazy video references ============
log('\n--- SEARCHING RAW HTML SOURCE ---');
try {
    await page.goto('https://voehringersolutions.de', { waitUntil: 'networkidle', timeout: 30000 });
    const rawHtml = await page.content();

    const videoPatterns = [
        /https?:\/\/[^\s"'<>]*youtube[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*youtu\.be[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*loom\.com[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*vimeo[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*wistia[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*\.mp4[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*vidyard[^\s"'<>]*/gi,
        /https?:\/\/[^\s"'<>]*bunny[^\s"'<>]*/gi,
    ];

    const foundInSource = new Set();
    for (const pattern of videoPatterns) {
        const matches = rawHtml.match(pattern);
        if (matches) matches.forEach(m => foundInSource.add(m));
    }

    if (foundInSource.size === 0) {
        log('No video URLs found in raw HTML source.');
    } else {
        Array.from(foundInSource).forEach((url, i) => {
            log(`  source[${i}]: ${url}`);
        });
    }

    // Also check for script tags that might load videos dynamically
    const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    });
    log('\n--- EXTERNAL SCRIPTS ---');
    scripts.forEach((s, i) => {
        log(`  script[${i}]: ${s}`);
    });

} catch (e) {
    log(`Error checking source: ${e.message}`);
}

// ============ 15. Check Wayback Machine / cached version ============
log('\n--- ADDITIONAL INTERCEPTED VIDEO URLS ---');
Array.from(videoUrls).forEach((url, i) => {
    log(`  [${i}] ${url}`);
});

// ============ Write results to file ============
const output = results.join('\n');
writeFileSync('c:/Users/voehr/voehringersolution-website/video-urls.txt', output, 'utf-8');
console.log('\n\nResults written to video-urls.txt');

await browser.close();

import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file:///C:/Users/voehr/voehringersolution-website/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')));

// Full audit
const audit = await page.evaluate(() => {
    const results = {};

    // 1. All sections with their backgrounds, paddings, heights
    const sections = document.querySelectorAll('section, .trust-bar, footer');
    results.sections = [...sections].map(s => {
        const cs = getComputedStyle(s);
        return {
            id: s.id || s.className.split(' ')[0],
            bg: cs.backgroundColor,
            paddingTop: cs.paddingTop,
            paddingBottom: cs.paddingBottom,
            height: s.getBoundingClientRect().height + 'px',
        };
    });

    // 2. All headings - font sizes, weights, colors, families
    const headings = document.querySelectorAll('h1, h2, h3');
    results.headings = [...headings].slice(0, 30).map(h => {
        const cs = getComputedStyle(h);
        return {
            tag: h.tagName,
            text: h.textContent.trim().substring(0, 50),
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, ''),
            color: cs.color,
            lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing,
            marginBottom: cs.marginBottom,
        };
    });

    // 3. All cards - padding, border-radius, border, background
    const cards = document.querySelectorAll('.problem-card, .solution-card, .testimonial-card, .pricing-card, .result-card, .process-step__content, .faq-item, .display-card');
    results.cards = [...cards].slice(0, 20).map(c => {
        const cs = getComputedStyle(c);
        return {
            class: c.className.split(' ')[0],
            padding: cs.padding,
            borderRadius: cs.borderRadius,
            border: cs.border,
            background: cs.backgroundColor,
            boxShadow: cs.boxShadow,
        };
    });

    // 4. All buttons
    const buttons = document.querySelectorAll('.btn, .nav__cta');
    results.buttons = [...buttons].map(b => {
        const cs = getComputedStyle(b);
        return {
            text: b.textContent.trim().substring(0, 30),
            padding: cs.padding,
            borderRadius: cs.borderRadius,
            background: cs.backgroundColor,
            color: cs.color,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
        };
    });

    // 5. Body text styles
    const paragraphs = document.querySelectorAll('p');
    results.paragraphs = [...paragraphs].slice(0, 10).map(p => {
        const cs = getComputedStyle(p);
        return {
            text: p.textContent.trim().substring(0, 40),
            fontSize: cs.fontSize,
            color: cs.color,
            lineHeight: cs.lineHeight,
        };
    });

    // 6. Spacing between sections
    results.sectionGaps = [];
    const allSections = document.querySelectorAll('section');
    for (let i = 0; i < allSections.length - 1; i++) {
        const a = allSections[i].getBoundingClientRect();
        const b = allSections[i + 1].getBoundingClientRect();
        results.sectionGaps.push({
            between: `${allSections[i].id || i} → ${allSections[i+1].id || i+1}`,
            gap: Math.round(b.top - a.bottom) + 'px',
        });
    }

    // 7. Badge consistency
    const badges = document.querySelectorAll('.section__badge');
    results.badges = [...badges].map(b => {
        const cs = getComputedStyle(b);
        return {
            text: b.textContent.trim(),
            fontSize: cs.fontSize,
            padding: cs.padding,
            color: cs.color,
            borderColor: cs.borderColor,
            letterSpacing: cs.letterSpacing,
        };
    });

    // 8. Nav consistency
    const nav = document.querySelector('.nav');
    const navCs = getComputedStyle(nav);
    results.nav = {
        bg: navCs.backgroundColor,
        padding: navCs.padding,
        position: navCs.position,
    };

    // 9. Container widths
    const containers = document.querySelectorAll('.container');
    results.containers = [...containers].slice(0, 5).map(c => ({
        width: c.getBoundingClientRect().width + 'px',
        maxWidth: getComputedStyle(c).maxWidth,
        padding: getComputedStyle(c).padding,
    }));

    // 10. Color usage summary
    const allEls = document.querySelectorAll('*');
    const bgSet = new Set();
    const colorSet = new Set();
    [...allEls].slice(0, 300).forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgSet.add(cs.backgroundColor);
        colorSet.add(cs.color);
    });
    results.uniqueBgColors = [...bgSet];
    results.uniqueTextColors = [...colorSet];

    return results;
});

console.log(JSON.stringify(audit, null, 2));
await browser.close();

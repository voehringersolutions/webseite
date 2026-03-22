/* ============================================
   VöhringerSolutions — Interactive Features
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CURSOR GLOW EFFECT
    // ==========================================
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let isDesktop = window.innerWidth > 1024;

    if (isDesktop && cursorGlow) {
        cursorGlow.classList.add('active');

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ==========================================
    // 2. NAVBAR SCROLL EFFECT
    // ==========================================
    const nav = document.getElementById('nav');

    const lightSections = document.querySelectorAll('.section--light, .section--white, .trust-bar');

    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Check if nav overlaps a light section
        const navBottom = nav.getBoundingClientRect().bottom;
        let onLight = false;
        lightSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < navBottom && rect.bottom > 0) {
                onLight = true;
            }
        });
        nav.classList.toggle('nav--light', onLight);
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ==========================================
    // 2b. LIVE TIMEZONE CLOCKS
    // ==========================================
    function updateTimezones() {
        const now = new Date();
        const fmt = (tz) => now.toLocaleTimeString('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
        const de = document.querySelector('#tz-germany .timezone-display__time');
        const us = document.querySelector('#tz-usa .timezone-display__time');
        const ae = document.querySelector('#tz-uae .timezone-display__time');
        if (de) de.textContent = fmt('Europe/Berlin');
        if (us) us.textContent = fmt('America/New_York');
        if (ae) ae.textContent = fmt('Asia/Dubai');
    }
    updateTimezones();
    setInterval(updateTimezones, 30000);

    // ==========================================
    // 3. MOBILE MENU TOGGLE
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ==========================================
    // 4. SCROLL REVEAL ANIMATIONS
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger delay based on sibling position
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let siblingIndex = 0;
                siblings.forEach((sib, i) => {
                    if (sib === entry.target) siblingIndex = i;
                });

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, siblingIndex * 100);

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 5. COUNTER ANIMATION
    // ==========================================
    const counters = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function (ease-out cubic)
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);

                    counter.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ==========================================
    // 6. MAGNETIC BUTTON EFFECT
    // ==========================================
    if (isDesktop) {
        const magneticBtns = document.querySelectorAll('.magnetic-btn');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;

                const inner = btn.querySelector('span');
                if (inner) {
                    inner.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
                }
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                const inner = btn.querySelector('span');
                if (inner) inner.style.transform = '';
            });
        });
    }

    // ==========================================
    // 7. LINK PREVIEW POPUP (Aceternity-style)
    // ==========================================
    const linkPreviewPopup = document.getElementById('linkPreviewPopup');
    const linkPreviewText = linkPreviewPopup?.querySelector('.link-preview-popup__text');
    const previewTriggers = document.querySelectorAll('.link-preview-trigger');

    if (linkPreviewPopup && isDesktop) {
        previewTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => {
                const preview = trigger.dataset.preview;
                if (!preview) return;
                linkPreviewText.textContent = preview;
                linkPreviewPopup.classList.add('visible');
            });

            trigger.addEventListener('mousemove', (e) => {
                const x = e.clientX + 16;
                const y = e.clientY - 60;
                linkPreviewPopup.style.left = x + 'px';
                linkPreviewPopup.style.top = y + 'px';
            });

            trigger.addEventListener('mouseleave', () => {
                linkPreviewPopup.classList.remove('visible');
            });
        });
    }

    // ==========================================
    // 9. TILT CARD 3D EFFECT
    // ==========================================
    if (isDesktop) {
        const tiltCards = document.querySelectorAll('.tilt-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================
    // 10. FAQ ACCORDION
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        const answer = item.querySelector('.faq-item__answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-item__answer').style.maxHeight = '0';
            });

            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ==========================================
    // 11. SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Account for fixed nav
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 12. MARQUEE PAUSE ON HOVER (Tech + Client)
    // ==========================================
    document.querySelectorAll('.tech-marquee__track, .client-marquee__track').forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });

    // ==========================================
    // 13. VIDEO MODAL
    // ==========================================
    const videoModal = document.getElementById('videoModal');
    const videoModalIframe = document.getElementById('videoModalIframe');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoTriggers = document.querySelectorAll('.testimonial-card__video');

    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const videoUrl = trigger.dataset.video;
            if (videoUrl && videoModal) {
                videoModalIframe.src = videoUrl + '?autoplay=1';
                videoModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            videoModalIframe.src = '';
            document.body.style.overflow = '';
        }
    }

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModal) videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeVideoModal();
    });

    // ==========================================
    // 14. ANIMATED GRID PATTERN ON LIGHT SECTIONS
    // ==========================================
    document.querySelectorAll('.section--white, .section--light').forEach(section => {
        const grid = document.createElement('div');
        grid.className = 'animated-grid';
        section.insertBefore(grid, section.firstChild);

        const rect = section.getBoundingClientRect();
        const cols = Math.floor(rect.width / 48);
        const rows = Math.floor(rect.height / 48);
        const totalSquares = Math.min(cols * rows, 200);
        const activeCount = Math.min(Math.floor(totalSquares * 0.08), 15);

        for (let i = 0; i < activeCount; i++) {
            const sq = document.createElement('div');
            sq.className = 'animated-grid__square';
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            sq.style.left = (col * 48 + 1) + 'px';
            sq.style.top = (row * 48 + 1) + 'px';
            sq.style.animationDelay = (Math.random() * 8) + 's';
            sq.style.animationDuration = (3 + Math.random() * 4) + 's';
            grid.appendChild(sq);
        }
    });

    // ==========================================
    // 15. RESIZE HANDLER
    // ==========================================
    window.addEventListener('resize', () => {
        isDesktop = window.innerWidth > 1024;
    });

});

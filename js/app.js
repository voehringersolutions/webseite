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
        // Mobile timezone clocks
        const mDe = document.getElementById('tz-m-de');
        const mUs = document.getElementById('tz-m-us');
        const mAe = document.getElementById('tz-m-ae');
        if (mDe) mDe.textContent = fmt('Europe/Berlin');
        if (mUs) mUs.textContent = fmt('America/New_York');
        if (mAe) mAe.textContent = fmt('Asia/Dubai');
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
    // 14. DASHBOARD CONTAINER SCROLL ANIMATION
    // ==========================================
    const dashboardFrame = document.querySelector('.dashboard-showcase__frame');
    const dashboardContainer = document.querySelector('.dashboard-showcase');

    if (dashboardFrame && dashboardContainer) {
        function updateDashboardScroll() {
            const rect = dashboardContainer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate progress: 0 = element just entered viewport, 1 = element center at viewport center
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;

            // Start animation when element enters viewport bottom, end when center reaches viewport center
            const startPoint = windowHeight;
            const endPoint = viewportCenter;
            const progress = Math.max(0, Math.min(1, (startPoint - elementCenter) / (startPoint - endPoint)));

            // Ease out cubic for smoother feel
            const eased = 1 - Math.pow(1 - progress, 3);

            const rotateX = 25 * (1 - eased); // 25deg → 0deg
            const scale = 0.9 + 0.1 * eased;  // 0.9 → 1.0

            dashboardFrame.style.transform = `rotateX(${rotateX}deg) scale(${scale})`;

            if (eased > 0.95) {
                dashboardFrame.classList.add('scroll-flat');
            } else {
                dashboardFrame.classList.remove('scroll-flat');
            }
        }

        window.addEventListener('scroll', updateDashboardScroll, { passive: true });
        updateDashboardScroll(); // Initial call
    }

    // ==========================================
    // 15a. ANIMATED GRID PATTERN ON LIGHT SECTIONS
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

    // ==========================================
    // 16. CTA DITHERING SHADER (WebGL) — Performance optimized
    // ==========================================
    const ctaCard = document.getElementById('cta-card');
    const canvas = document.getElementById('cta-shader');
    if (canvas && ctaCard) {
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'low-power' });
        if (gl) {
            let speed = 0.2;
            let targetSpeed = 0.2;
            let isVisible = false;
            let animId = null;

            ctaCard.addEventListener('mouseenter', () => { targetSpeed = 0.6; });
            ctaCard.addEventListener('mouseleave', () => { targetSpeed = 0.2; });

            const vsSource = `
                attribute vec2 a_position;
                varying vec2 v_uv;
                void main() {
                    v_uv = a_position * 0.5 + 0.5;
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;

            // Optimized: 3 octaves instead of 5, single warp layer
            const fsSource = `
                precision mediump float;
                varying vec2 v_uv;
                uniform float u_time;
                uniform float u_speed;

                float bayer4(vec2 p) {
                    vec2 i = floor(mod(p, 4.0));
                    int idx = int(i.x) + int(i.y) * 4;
                    float m[16];
                    m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
                    m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
                    m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
                    m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
                    for(int k=0; k<16; k++) {
                        if(k==idx) return m[k] / 16.0;
                    }
                    return 0.0;
                }

                vec2 hash(vec2 p) {
                    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
                    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                        mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
                        u.y
                    );
                }

                float fbm(vec2 p) {
                    float v = 0.0;
                    v += 0.5 * noise(p); p *= 2.0;
                    v += 0.25 * noise(p); p *= 2.0;
                    v += 0.125 * noise(p);
                    return v;
                }

                void main() {
                    vec2 uv = v_uv;
                    float t = u_time * u_speed;

                    vec2 warp = vec2(
                        fbm(uv * 2.5 + t * 0.3),
                        fbm(uv * 2.5 + t * 0.2 + 5.0)
                    );
                    float f = fbm(uv * 2.0 + warp * 2.0 + t * 0.1);

                    vec2 edge = smoothstep(0.0, 0.06, uv) * smoothstep(0.0, 0.06, 1.0 - uv);
                    float intensity = (f * 0.5 + 0.5) * edge.x * edge.y;

                    vec2 pixel = floor(gl_FragCoord.xy / 3.0);
                    float dithered = step(bayer4(pixel), intensity);

                    vec3 col = mix(vec3(0.231, 0.510, 0.965), vec3(0.024, 0.714, 0.831), f * 0.5 + 0.5);
                    gl_FragColor = vec4(col, dithered * 0.45);
                }
            `;

            function compileShader(type, source) {
                const s = gl.createShader(type);
                gl.shaderSource(s, source);
                gl.compileShader(s);
                return s;
            }

            const vs = compileShader(gl.VERTEX_SHADER, vsSource);
            const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
            const aPos = gl.getAttribLocation(prog, 'a_position');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            const uTime = gl.getUniformLocation(prog, 'u_time');
            const uSpeed = gl.getUniformLocation(prog, 'u_speed');

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            function resize() {
                const r = ctaCard.getBoundingClientRect();
                // Half resolution for performance
                canvas.width = Math.floor(r.width * 0.5);
                canvas.height = Math.floor(r.height * 0.5);
                canvas.style.width = r.width + 'px';
                canvas.style.height = r.height + 'px';
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
            resize();
            window.addEventListener('resize', resize);

            // Only render when CTA is in viewport
            const observer = new IntersectionObserver(entries => {
                isVisible = entries[0].isIntersecting;
                if (isVisible && !animId) render();
            }, { threshold: 0.1 });
            observer.observe(ctaCard);

            let startTime = performance.now();
            function render() {
                if (!isVisible) { animId = null; return; }
                speed += (targetSpeed - speed) * 0.02;
                const t = (performance.now() - startTime) / 1000;
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.uniform1f(uTime, t);
                gl.uniform1f(uSpeed, speed);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                animId = requestAnimationFrame(render);
            }
        }
    }

});

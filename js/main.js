/* =====================================================
   VIPUL H. HARIHAR
   Small, quiet behaviour. Nothing decorative.
   ===================================================== */

(() => {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Navigation ─────────────────────────────────── */

    const nav = $('#nav');
    const navLinks = $('#navLinks');
    const navToggle = $('#navToggle');
    let lastY = window.scrollY;

    const updateNav = () => {
        if (!nav) return;
        const y = window.scrollY;
        nav.classList.toggle('solid', y > 10);
        // Step out of the way going down, return on the way up
        const menuOpen = navLinks && navLinks.classList.contains('open');
        const goingDown = y > lastY && y > 420;
        nav.classList.toggle('hidden', goingDown && !menuOpen);
        lastY = y;
    };

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ── Reveals ────────────────────────────────────── */

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    $$('.reveal').forEach((el, i) => {
        // Siblings arriving together get a light stagger, never a cascade
        el.style.transitionDelay = (Math.min(i % 4, 3) * 0.07) + 's';
        revealObserver.observe(el);
    });

    /* ── Counters ───────────────────────────────────── */

    const runCount = (el) => {
        const target = parseFloat(el.dataset.target || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (reduced) {
            el.textContent = prefix + target + suffix;
            return;
        }
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / 1600, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCount(entry.target);
            countObserver.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    $$('.count').forEach((el) => countObserver.observe(el));

    /* ── Roles ──────────────────────────────────────── */

    $$('.role-head').forEach((head) => {
        const body = head.nextElementSibling;
        head.addEventListener('click', () => {
            const open = head.getAttribute('aria-expanded') === 'true';
            head.setAttribute('aria-expanded', String(!open));
            if (body) body.style.maxHeight = open ? '0px' : body.scrollHeight + 'px';
        });
    });

    window.addEventListener('resize', () => {
        $$('.role-head[aria-expanded="true"]').forEach((head) => {
            const body = head.nextElementSibling;
            if (body) body.style.maxHeight = body.scrollHeight + 'px';
        });
    }, { passive: true });

    /* ── Films: only play what is on screen ─────────── */

    // The scrubbed film is driven by scroll position, never by playback
    $$('video:not(#scrubVideo)').forEach((video) => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (video.preload === 'none') video.preload = 'auto';
                    const p = video.play();
                    if (p) p.catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.15 });
        io.observe(video);
    });

    /* ── Résumé ─────────────────────────────────────── */

    const resumeToggle = $('#resumeToggle');
    const resumePreview = $('#resumePreview');

    if (resumeToggle && resumePreview) {
        resumeToggle.addEventListener('click', () => {
            const frame = $('iframe', resumePreview);
            const opening = resumePreview.hidden;
            if (opening && frame && !frame.getAttribute('src')) {
                frame.setAttribute('src', frame.dataset.src);
            }
            resumePreview.hidden = !opening;
            resumeToggle.setAttribute('aria-expanded', String(opening));
            resumeToggle.textContent = opening ? 'Hide preview' : 'Preview here';
        });
    }

    /* ── Story sheet ────────────────────────────────── */

    const sheet = $('#storySheet');
    const storyOpen = $('#storyOpen');

    const closeSheet = () => {
        if (!sheet) return;
        sheet.hidden = true;
        document.body.classList.remove('locked');
    };

    if (sheet && storyOpen) {
        storyOpen.addEventListener('click', () => {
            sheet.hidden = false;
            document.body.classList.add('locked');
        });
        $$('[data-close]', sheet).forEach((el) => el.addEventListener('click', closeSheet));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sheet.hidden) closeSheet();
        });
    }

    /* ── Contact form ───────────────────────────────── */

    const form = $('#contactForm');
    if (form) {
        const status = $('#formStatus');
        const submit = $('#contactSubmit');
        const ADDRESS = 'vhh2105@columbia.edu';

        const say = (text, kind) => {
            if (!status) return;
            status.textContent = text;
            status.classList.toggle('err', kind === 'err');
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = $('#cfName').value.trim();
            const email = $('#cfEmail').value.trim();
            const message = $('#cfMsg').value.trim();

            if (form.querySelector('[name="_honey"]').value) return;

            if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                say('Please add your name, a valid email and a message.', 'err');
                return;
            }

            submit.disabled = true;
            submit.textContent = 'Sending';
            say('');

            try {
                const res = await fetch('https://formsubmit.co/ajax/' + ADDRESS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        _subject: 'Portfolio message from ' + name,
                        _template: 'table'
                    })
                });
                if (!res.ok) throw new Error(String(res.status));
                await res.json();
                form.reset();
                submit.textContent = 'Sent';
                say('Thank you. I will come back to you shortly.');
                setTimeout(() => {
                    submit.textContent = 'Send';
                    submit.disabled = false;
                }, 4000);
            } catch (err) {
                // Fall back to the visitor's own mail client
                submit.textContent = 'Send';
                submit.disabled = false;
                say('Opening your email app instead.', 'err');
                window.location.href = 'mailto:' + ADDRESS +
                    '?subject=' + encodeURIComponent('Portfolio message from ' + name) +
                    '&body=' + encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');
            }
        });
    }

    /* ── Word reveal ────────────────────────────────── */
    /* Each word lights as the line travels through the viewport. */

    const wordBlocks = $$('[data-words]').map((el) => {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach((w, i) => {
            const span = document.createElement('span');
            span.textContent = w;
            el.appendChild(span);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        return { el, spans: $$('span', el) };
    });

    const updateWords = () => {
        if (reduced) return;
        const vh = window.innerHeight;
        wordBlocks.forEach(({ el, spans }) => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            // 0 when the block enters the lower third, 1 once it clears the middle
            const p = (vh * 0.82 - rect.top) / (vh * 0.52 + rect.height * 0.5);
            const lit = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
            spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
        });
    };

    /* ── Parallax ───────────────────────────────────── */

    const parallaxEls = $$('[data-parallax]').map((el) => ({ el, k: parseFloat(el.dataset.parallax) || 0.3 }));
    const parallaxImgs = $$('[data-parallax-img]');

    const updateParallax = () => {
        if (reduced) return;
        const vh = window.innerHeight;

        parallaxEls.forEach(({ el, k }) => {
            const rect = el.parentElement.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            el.style.transform = `translate3d(0, ${(-rect.top * k).toFixed(1)}px, 0)`;
        });

        parallaxImgs.forEach((img) => {
            const frame = img.parentElement;
            const rect = frame.getBoundingClientRect();
            if (rect.bottom < -60 || rect.top > vh + 60) return;
            const centre = rect.top + rect.height / 2;
            const off = ((centre - vh / 2) / vh) * 26;
            img.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.14)`;
        });
    };

    /* ── Scroll-scrubbed film ───────────────────────── */

    const scrubSection = $('#revealFilm');
    const scrubVideo = $('#scrubVideo');
    const scrubCopies = $$('[data-scrub-copy]');
    let scrubReady = false;
    let scrubTarget = 0;
    let scrubCurrent = 0;

    if (scrubSection && scrubVideo) {
        // A progress rail makes the pinned section feel intentional
        const rail = document.createElement('div');
        rail.className = 'scrub-rail';
        rail.innerHTML = '<i></i>';
        scrubSection.querySelector('.reveal-film-stage').appendChild(rail);
        const railFill = rail.querySelector('i');

        scrubVideo.addEventListener('loadedmetadata', () => { scrubReady = true; });
        // Safari will not decode a frame until it has been asked to play once
        scrubVideo.play().then(() => scrubVideo.pause()).catch(() => {});

        var updateScrub = () => {
            const rect = scrubSection.getBoundingClientRect();
            const total = scrubSection.offsetHeight - window.innerHeight;
            if (total <= 0) return;
            const p = Math.max(0, Math.min(1, -rect.top / total));

            railFill.style.width = (p * 100).toFixed(1) + '%';

            // Two lines of copy, each holding for part of the scroll
            scrubCopies.forEach((q, i) => {
                const on = i === 0 ? p < 0.52 : p >= 0.52;
                q.classList.toggle('on', on && p > 0.04 && p < 0.97);
            });

            if (scrubReady && scrubVideo.duration) {
                scrubTarget = p * (scrubVideo.duration - 0.05);
            }
        };

        // Ease the playhead toward the target so scrolling feels liquid
        const scrubLoop = () => {
            if (scrubReady && Math.abs(scrubTarget - scrubCurrent) > 0.005) {
                scrubCurrent += (scrubTarget - scrubCurrent) * 0.16;
                try { scrubVideo.currentTime = scrubCurrent; } catch (e) {}
            }
            requestAnimationFrame(scrubLoop);
        };
        if (!reduced) requestAnimationFrame(scrubLoop);
    }

    /* ── Mesh gradient band ─────────────────────────── */
    /* Drawn at a small size with additive blending, then blurred up
       by CSS. Cheap to run and gives the soft mesh blending.       */

    const bandCanvas = $('#bandCanvas');
    if (bandCanvas) {
        const g = bandCanvas.getContext('2d');
        const W = 300, H = 170;
        bandCanvas.width = W;
        bandCanvas.height = H;

        // Navy anchors the field; the colour sits on top at low alpha so
        // the band reads deep and premium rather than neon.
        const blobs = [
            { c: [ 88,  80, 236], a: 0.62, x: 0.26, y: 0.32, r: 0.60, ax: 0.18, ay: 0.15, sx: 0.00023, sy: 0.00031, ph: 0.0 },
            { c: [ 12, 122, 224], a: 0.58, x: 0.72, y: 0.26, r: 0.56, ax: 0.17, ay: 0.19, sx: 0.00019, sy: 0.00026, ph: 1.7 },
            { c: [  0, 168, 176], a: 0.46, x: 0.86, y: 0.74, r: 0.46, ax: 0.15, ay: 0.16, sx: 0.00025, sy: 0.00018, ph: 3.1 },
            { c: [190,  70, 150], a: 0.34, x: 0.54, y: 0.82, r: 0.44, ax: 0.19, ay: 0.13, sx: 0.00027, sy: 0.00021, ph: 4.6 },
            { c: [216, 118,  72], a: 0.26, x: 0.14, y: 0.84, r: 0.38, ax: 0.14, ay: 0.14, sx: 0.00017, sy: 0.00029, ph: 5.9 },
        ];

        const paint = (t) => {
            g.globalCompositeOperation = 'source-over';
            g.fillStyle = '#08203a';
            g.fillRect(0, 0, W, H);
            g.globalCompositeOperation = 'lighter';

            for (const b of blobs) {
                const x = (b.x + Math.sin(t * b.sx + b.ph) * b.ax) * W;
                const y = (b.y + Math.cos(t * b.sy + b.ph) * b.ay) * H;
                const r = b.r * W;
                const grad = g.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0,    `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a})`);
                grad.addColorStop(0.45, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${(b.a * 0.4).toFixed(3)})`);
                grad.addColorStop(1,    `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
                g.fillStyle = grad;
                g.beginPath();
                g.arc(x, y, r, 0, Math.PI * 2);
                g.fill();
            }
            g.globalCompositeOperation = 'source-over';
        };

        paint(0);

        if (!reduced) {
            let running = false;
            let raf = null;
            let frame = 0;
            const loop = (now) => {
                // The field drifts slowly, so a third of the frames is plenty
                // and it leaves the budget to the WebGL layer above it
                if ((frame++ & 3) === 0) paint(now);
                raf = requestAnimationFrame(loop);
            };
            // Only animate while the band is on screen
            new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !running) {
                        running = true;
                        raf = requestAnimationFrame(loop);
                    } else if (!entry.isIntersecting && running) {
                        running = false;
                        cancelAnimationFrame(raf);
                    }
                });
            }, { threshold: 0 }).observe(bandCanvas.parentElement);
        }
    }

    /* ── Work showcase counter ──────────────────────── */

    const workCards = $$('[data-work]');
    const workIndex = $('#workIndex');

    const updateWork = () => {
        if (!workIndex || !workCards.length) return;
        const mid = window.innerHeight * 0.48;
        let active = 0;
        workCards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < mid) active = i;
        });
        workCards.forEach((c, i) => c.classList.toggle('active', i === active));
        workIndex.textContent = String(active + 1).padStart(2, '0');
    };

    /* ── Scroll loop ────────────────────────────────── */

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateNav();
            updateWords();
            updateParallax();
            updateWork();
            if (typeof updateScrub === 'function') updateScrub();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
})();

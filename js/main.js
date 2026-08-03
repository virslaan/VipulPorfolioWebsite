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

    const updateNav = () => {
        if (nav) nav.classList.toggle('solid', window.scrollY > 10);
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

    $$('video').forEach((video) => {
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

    /* ── Scroll loop ────────────────────────────────── */

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateNav();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
})();

/* =====================================================
   COVER
   The film fades in over its still frame, loops, and drifts
   with scroll, the pointer and a finger. A soft light follows
   the pointer or touch. Everything is driven through CSS
   variables on the cover.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    const video = document.getElementById('heroVideo');
    if (!hero) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Film ───────────────────────────────────────── */

    let heroVisible = true;

    if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute('muted', '');

        const show = () => video.classList.add('is-playing');
        video.addEventListener('playing', show);
        video.addEventListener('timeupdate', () => { if (video.currentTime > 0) show(); });
        if (!video.paused && video.readyState >= 3) show();

        const kick = () => {
            if (!heroVisible || !video.paused) return;
            const p = video.play();
            if (p) p.catch(() => {});
        };

        // Autoplay can be refused or dropped (Low Power Mode, data saver,
        // restoring a background tab). Retry on every chance the browser gives.
        kick();
        ['loadeddata', 'canplay'].forEach((ev) => video.addEventListener(ev, kick));
        ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach((ev) =>
            window.addEventListener(ev, kick, { passive: true }));
        window.addEventListener('pageshow', kick);
        window.addEventListener('focus', kick);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
        setInterval(kick, 2000);

        new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                heroVisible = e.isIntersecting;
                if (heroVisible) kick();
                else video.pause();
            });
        }, { threshold: 0.05 }).observe(hero);
    }

    if (reduced) return;

    const target = { p: 0, mx: 0, my: 0 };
    const state = { p: 0, mx: 0, my: 0 };

    /* ── Scroll, pointer and touch ──────────────────── */

    const measure = () => {
        const h = hero.offsetHeight || window.innerHeight;
        target.p = Math.max(0, Math.min(1, window.scrollY / h));
    };

    let dimTimer = 0;
    const aim = (x, y) => {
        const r = hero.getBoundingClientRect();
        const fx = (x - r.left) / r.width;
        const fy = (y - r.top) / r.height;
        target.mx = fx - 0.5;
        target.my = fy - 0.5;
        hero.style.setProperty('--lx', (fx * 100).toFixed(1) + '%');
        hero.style.setProperty('--ly', (fy * 100).toFixed(1) + '%');
        hero.classList.add('is-lit');
        clearTimeout(dimTimer);
    };
    const release = (delay) => {
        clearTimeout(dimTimer);
        dimTimer = setTimeout(() => {
            target.mx = 0;
            target.my = 0;
            hero.classList.remove('is-lit');
        }, delay);
    };

    hero.addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
    hero.addEventListener('pointerleave', () => release(0), { passive: true });
    hero.addEventListener('touchstart', (e) => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    hero.addEventListener('touchmove', (e) => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    hero.addEventListener('touchend', () => release(900), { passive: true });

    let visible = true;
    new IntersectionObserver((entries) => {
        entries.forEach((e) => { visible = e.isIntersecting; });
    }, { threshold: 0 }).observe(hero);

    const tick = () => {
        if (visible) {
            state.p += (target.p - state.p) * 0.14;
            state.mx += (target.mx - state.mx) * 0.08;
            state.my += (target.my - state.my) * 0.08;
            hero.style.setProperty('--p', state.p.toFixed(4));
            hero.style.setProperty('--mx', state.mx.toFixed(4));
            hero.style.setProperty('--my', state.my.toFixed(4));
            hero.classList.toggle('is-moving', state.p > 0.03);
        }
        requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    requestAnimationFrame(tick);
})();

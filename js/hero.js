/* =====================================================
   COVER
   The film fades in over its still frame, fades through black
   on each loop, and drifts with scroll and the pointer.
   Everything is driven through CSS variables on the cover.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    const video = document.getElementById('heroVideo');
    if (!hero) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !(navigator.maxTouchPoints > 0);

    /* ── Film ───────────────────────────────────────── */

    if (video) {
        const show = () => video.classList.add('is-playing');
        video.addEventListener('playing', show);
        if (!video.paused && video.readyState >= 3) show();

        // Fade through black instead of cutting back to the wide shot
        video.addEventListener('timeupdate', () => {
            if (video.duration && video.duration - video.currentTime < 1.0) {
                video.classList.add('is-fading');
            }
        });
        video.addEventListener('ended', () => {
            video.currentTime = 0;
            const p = video.play();
            if (p) p.catch(() => {});
            setTimeout(() => video.classList.remove('is-fading'), 120);
        });

        // Autoplay can be refused (Low Power Mode, data saver). The still
        // frame underneath already covers that case; try again on first touch.
        const kick = () => {
            if (video.paused) {
                const p = video.play();
                if (p) p.catch(() => {});
            }
        };
        const p = video.play();
        if (p) p.catch(() => {
            window.addEventListener('touchstart', kick, { once: true, passive: true });
            window.addEventListener('pointerdown', kick, { once: true, passive: true });
        });

        // Pause while the cover is off screen
        new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) kick();
                else video.pause();
            });
        }, { threshold: 0.05 }).observe(hero);
    }

    if (reduced) return;

    const target = { p: 0, mx: 0, my: 0 };
    const state = { p: 0, mx: 0, my: 0 };

    /* ── Scroll and pointer ─────────────────────────── */

    const measure = () => {
        const h = hero.offsetHeight || window.innerHeight;
        target.p = Math.max(0, Math.min(1, window.scrollY / h));
    };

    if (finePointer) {
        hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            target.mx = (e.clientX - r.left) / r.width - 0.5;
            target.my = (e.clientY - r.top) / r.height - 0.5;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { target.mx = 0; target.my = 0; }, { passive: true });
    }

    let visible = true;
    new IntersectionObserver((entries) => {
        entries.forEach((e) => { visible = e.isIntersecting; });
    }, { threshold: 0 }).observe(hero);

    const tick = () => {
        if (visible) {
            state.p += (target.p - state.p) * 0.14;
            state.mx += (target.mx - state.mx) * 0.06;
            state.my += (target.my - state.my) * 0.06;
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

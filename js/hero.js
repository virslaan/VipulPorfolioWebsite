/* =====================================================
   COVER
   The astronaut film fades in over its still frame, fades
   through black on each loop, and drifts with scroll and the
   pointer. A light starfield twinkles in the dark above Earth.
   Everything is driven through CSS variables on the cover.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    const video = document.getElementById('heroVideo');
    const canvas = document.getElementById('orbitStars');
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

    /* ── Starfield ──────────────────────────────────── */

    let stars = [];
    let ctx = null;
    let cw = 0, ch = 0, dpr = 1;
    const target = { p: 0, mx: 0, my: 0 };
    const state = { p: 0, mx: 0, my: 0 };

    const sizeCanvas = () => {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
        ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(170, (cw * ch) / 5200));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * cw,
            y: Math.random() * ch,
            r: Math.random() < 0.08 ? 1.25 + Math.random() * 0.6 : 0.4 + Math.random() * 0.7,
            depth: 0.2 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 1.4,
        }));
    };

    const drawStars = (t) => {
        if (!ctx) return;
        ctx.clearRect(0, 0, cw, ch);
        for (const s of stars) {
            const x = s.x - state.mx * 18 * s.depth;
            const y = s.y - state.my * 10 * s.depth - state.p * 60 * s.depth;
            const fade = Math.min(1, Math.max(0, 1 - y / ch) * 1.6);
            const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
            ctx.globalAlpha = fade * tw * (0.35 + s.depth * 0.6);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    };

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

    const tick = (t) => {
        if (visible) {
            state.p += (target.p - state.p) * 0.14;
            state.mx += (target.mx - state.mx) * 0.06;
            state.my += (target.my - state.my) * 0.06;
            hero.style.setProperty('--p', state.p.toFixed(4));
            hero.style.setProperty('--mx', state.mx.toFixed(4));
            hero.style.setProperty('--my', state.my.toFixed(4));
            hero.classList.toggle('is-moving', state.p > 0.03);
            drawStars(t);
        }
        requestAnimationFrame(tick);
    };

    sizeCanvas();
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', () => { sizeCanvas(); measure(); }, { passive: true });
    requestAnimationFrame(tick);
})();

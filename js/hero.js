/* =====================================================
   HERO
   The cover film settles into a floating frame as the
   page scrolls, while a soft light and a slight parallax
   follow the pointer. Everything is driven through CSS
   custom properties on the header.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    if (!hero) return;

    const video = document.getElementById('heroVideo');
    if (video) {
        const show = () => video.classList.add('is-active');
        if (video.readyState >= 2) show();
        else video.addEventListener('loadeddata', show, { once: true });
    }

    document.documentElement.classList.add('cover-ready', 'cover-live');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const s = { p: 0, tp: 0, mx: 0, my: 0, tmx: 0, tmy: 0, lx: 50, ly: 45, tlx: 50, tly: 45 };
    let raf = 0;

    const measure = () => {
        const total = hero.offsetHeight - window.innerHeight;
        s.tp = total > 0 ? Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / total)) : 0;
        kick();
    };

    const loop = () => {
        s.p += (s.tp - s.p) * 0.14;
        s.mx += (s.tmx - s.mx) * 0.06;
        s.my += (s.tmy - s.my) * 0.06;
        s.lx += (s.tlx - s.lx) * 0.08;
        s.ly += (s.tly - s.ly) * 0.08;

        hero.style.setProperty('--p', s.p.toFixed(4));
        hero.classList.toggle('is-moving', s.p > 0.03);
        hero.style.setProperty('--mx', s.mx.toFixed(4));
        hero.style.setProperty('--my', s.my.toFixed(4));
        hero.style.setProperty('--lx', s.lx.toFixed(2) + '%');
        hero.style.setProperty('--ly', s.ly.toFixed(2) + '%');

        const settled = Math.abs(s.tp - s.p) < 0.0005 && Math.abs(s.tmx - s.mx) < 0.001 &&
            Math.abs(s.tmy - s.my) < 0.001 && Math.abs(s.tlx - s.lx) < 0.05 && Math.abs(s.tly - s.ly) < 0.05;
        raf = settled ? 0 : requestAnimationFrame(loop);
    };

    function kick() {
        if (!raf) raf = requestAnimationFrame(loop);
    }

    if (finePointer) {
        hero.addEventListener('pointermove', (e) => {
            const r = hero.querySelector('.hero-stage').getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            s.tmx = (x - 0.5) * 2;
            s.tmy = (y - 0.5) * 2;
            s.tlx = x * 100;
            s.tly = y * 100;
            hero.classList.add('is-lit');
            kick();
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            s.tmx = s.tmy = 0;
            s.tlx = 50;
            s.tly = 45;
            hero.classList.remove('is-lit');
            kick();
        }, { passive: true });
    }

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
})();

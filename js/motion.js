/* =====================================================
   MOTION
   Heading line reveals, the kinetic ribbon, card
   spotlights, console tilt and magnetic links.
   ===================================================== */

(() => {
    'use strict';

    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ── Headings rise line by line from a mask ─────── */

    // The work heading paints a pointer-driven gradient through its text,
    // which a per-line mask would clip, so it keeps its own treatment.
    const headings = $$('.sec-title').filter((h) => !h.closest('.work-sticky'));
    if (!reduced) {
        headings.forEach((h) => {
            const lines = h.innerHTML.split(/<br\s*\/?>/i);
            h.innerHTML = lines
                .map((line, i) => `<span class="tl"><span class="tl-in" style="transition-delay:${(i * 0.12).toFixed(2)}s">${line.trim()}</span></span>`)
                .join('');
            h.classList.add('tl-ready');
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('tl-on');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.4, rootMargin: '0px 0px -8% 0px' });
        headings.forEach((h) => io.observe(h));
    }

    /* ── Kinetic ribbon: drifts, then surges with scroll ─ */

    const rows = $$('.ribbon-row').map((row) => ({
        row,
        track: row.querySelector('.ribbon-track'),
        dir: Number(row.dataset.dir || 1),
        x: 0,
    }));
    const ribbon = document.querySelector('.ribbon');

    if (rows.length && ribbon && !reduced) {
        let visible = false;
        let lastY = window.scrollY;
        let velocity = 0;
        let last = performance.now();

        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
            .observe(ribbon);

        const tick = (now) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const y = window.scrollY;
            const raw = (y - lastY) / Math.max(dt, 0.001);
            lastY = y;
            velocity += (raw - velocity) * 0.12;

            if (visible) {
                const boost = Math.min(Math.abs(velocity) / 900, 3);
                const skew = Math.max(-9, Math.min(9, velocity / -260));
                rows.forEach((r) => {
                    const half = r.track.scrollWidth / 2;
                    if (!half) return;
                    r.x -= r.dir * (60 + boost * 260) * dt * (velocity < 0 ? -1 : 1);
                    r.x = ((r.x % half) + half) % half;
                    r.track.style.transform = `translate3d(${-r.x}px,0,0) skewX(${skew.toFixed(2)}deg)`;
                });
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    if (!finePointer || reduced) return;

    /* ── Platform cards: a light that follows the cursor ─ */

    $$('.card, .tile').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
            card.classList.add('lit');
        }, { passive: true });
        card.addEventListener('pointerleave', () => card.classList.remove('lit'), { passive: true });
    });

    /* ── AURA console: tilts toward the cursor ──────── */

    const consoleEl = document.querySelector('.aura-console');
    if (consoleEl) {
        const stage = consoleEl.parentElement;
        const t = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
        const loop = () => {
            t.x += (t.tx - t.x) * 0.1;
            t.y += (t.ty - t.y) * 0.1;
            consoleEl.style.transform = `perspective(1400px) rotateX(${(t.y * -5).toFixed(2)}deg) rotateY(${(t.x * 7).toFixed(2)}deg)`;
            consoleEl.style.setProperty('--gx', `${(50 + t.x * 40).toFixed(1)}%`);
            consoleEl.style.setProperty('--gy', `${(50 + t.y * 40).toFixed(1)}%`);
            if (Math.abs(t.tx - t.x) > 0.001 || Math.abs(t.ty - t.y) > 0.001) t.raf = requestAnimationFrame(loop);
            else t.raf = 0;
        };
        const kick = () => { if (!t.raf) t.raf = requestAnimationFrame(loop); };
        stage.addEventListener('pointermove', (e) => {
            const r = consoleEl.getBoundingClientRect();
            t.tx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
            t.ty = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
            kick();
        }, { passive: true });
        stage.addEventListener('pointerleave', () => { t.tx = 0; t.ty = 0; kick(); }, { passive: true });
    }

    /* ── Magnetic links ─────────────────────────────── */

    // Uses the standalone translate property so it never fights transforms
    // set by reveals or hover styles.
    $$('.hero-links .link-chevron, .vira-links .link-chevron, .nav-cta').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            el.style.translate = `${(dx * 0.28).toFixed(1)}px ${(dy * 0.4).toFixed(1)}px`;
        }, { passive: true });
        el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; }, { passive: true });
    });
})();

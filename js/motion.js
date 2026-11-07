/* =====================================================
   MOTION
   Heading line reveals, card spotlights and
   magnetic links.
   ===================================================== */

(() => {
    'use strict';

    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !(navigator.maxTouchPoints > 0);

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

    /* ── Magnetic links ─────────────────────────────── */

    // Uses the standalone translate property so it never fights transforms
    // set by reveals or hover styles.
    $$('.hero-links .link-chevron, .nav-cta').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            el.style.translate = `${(dx * 0.28).toFixed(1)}px ${(dy * 0.4).toFixed(1)}px`;
        }, { passive: true });
        el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; }, { passive: true });
    });
})();

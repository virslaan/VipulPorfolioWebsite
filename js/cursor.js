/* =====================================================
   SITE CURSOR
   A restrained pointer that adopts each section's tone.
   Hidden for touch, coarse pointers and reduced motion.
   ===================================================== */

(() => {
    'use strict';

    const cursor = document.getElementById('siteCursor');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!cursor || !finePointer) return;

    document.body.classList.add('has-site-cursor');

    const position = { x: -80, y: -80, tx: -80, ty: -80 };
    let visible = false;
    let frame = 0;

    const setTheme = (target) => {
        const region = target?.closest('[data-cursor-theme]');
        cursor.dataset.theme = region?.dataset.cursorTheme || 'default';
        cursor.classList.toggle('is-link', Boolean(target?.closest('a, button, summary, input, textarea')));
    };

    window.addEventListener('pointermove', (event) => {
        position.tx = event.clientX;
        position.ty = event.clientY;
        if (!visible) {
            position.x = position.tx;
            position.y = position.ty;
            visible = true;
            cursor.classList.add('is-visible');
        }
        setTheme(event.target);
    }, { passive: true });

    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'), { passive: true });
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'), { passive: true });
    document.addEventListener('mouseout', (event) => {
        if (!event.relatedTarget) {
            visible = false;
            cursor.classList.remove('is-visible', 'is-link', 'is-down');
        }
    });

    const render = () => {
        const easing = reduced ? 1 : 0.22;
        position.x += (position.tx - position.x) * easing;
        position.y += (position.ty - position.y) * easing;
        cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
        frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frame);
        } else {
            frame = requestAnimationFrame(render);
        }
    });
})();

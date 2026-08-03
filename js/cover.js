/* =====================================================
   COVER FIELD
   An interactive atmosphere over the hero: soft light
   nodes that breathe and lean toward the pointer. No
   library. Falls back to stillness if canvas is absent
   or the visitor prefers reduced motion.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    const canvas = document.getElementById('coverCanvas');
    if (!hero || !canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const media = hero.querySelector('.hero-media');
    const copy = document.getElementById('heroCopy');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = true;
    let raf = 0;
    let born = performance.now();

    const pointer = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45, active: false };
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    const COUNT = Math.min(32, Math.floor((window.innerWidth * window.innerHeight) / 38000));
    const nodes = Array.from({ length: COUNT }, () => spawn(true));

    function spawn(spread) {
        return {
            x: Math.random(),
            y: Math.random(),
            z: 0.35 + Math.random() * 0.65,
            vx: (Math.random() - 0.5) * 0.00022,
            vy: (Math.random() - 0.5) * 0.00022,
            r: 0.6 + Math.random() * 2.4,
            phase: Math.random() * Math.PI * 2,
            pulse: 0.6 + Math.random() * 0.8,
        };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!pointer.active) {
            pointer.x = pointer.tx = 0.5;
            pointer.y = pointer.ty = 0.42;
        }
    }

    function onMove(clientX, clientY) {
        const rect = hero.getBoundingClientRect();
        if (rect.height <= 0) return;
        pointer.tx = (clientX - rect.left) / rect.width;
        pointer.ty = (clientY - rect.top) / rect.height;
        pointer.active = true;
        tilt.tx = (pointer.tx - 0.5) * 2;
        tilt.ty = (pointer.ty - 0.5) * 2;
    }

    hero.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    hero.addEventListener('pointerleave', () => {
        pointer.active = false;
        pointer.tx = 0.5;
        pointer.ty = 0.42;
        tilt.tx = 0;
        tilt.ty = 0;
    }, { passive: true });

    // Touch: keep the field alive under the finger
    hero.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (t) onMove(t.clientX, t.clientY);
    }, { passive: true });

    function step(now) {
        const t = (now - born) * 0.001;
        const enter = Math.min(1, t / 1.8);

        pointer.x += (pointer.tx - pointer.x) * 0.08;
        pointer.y += (pointer.ty - pointer.y) * 0.08;
        tilt.x += (tilt.tx - tilt.x) * 0.06;
        tilt.y += (tilt.ty - tilt.y) * 0.06;

        // Film and type lean with the pointer
        if (media && !reduced) {
            const sx = 1.08 + Math.abs(tilt.x) * 0.02;
            const sy = 1.08 + Math.abs(tilt.y) * 0.02;
            media.style.transform =
                `translate(${tilt.x * -18}px, ${tilt.y * -12}px) scale(${Math.max(sx, sy)})`;
        }
        if (copy && !reduced) {
            copy.style.transform =
                `translate3d(${tilt.x * 14}px, ${tilt.y * 10}px, 0)`;
        }

        ctx.clearRect(0, 0, w, h);

        // Soft breath of light around the pointer
        const gx = pointer.x * w;
        const gy = pointer.y * h;
        const breath = 0.55 + Math.sin(t * 1.1) * 0.12;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.42);
        glow.addColorStop(0, `rgba(210, 230, 255, ${0.16 * enter * breath})`);
        glow.addColorStop(0.35, `rgba(160, 200, 255, ${0.06 * enter})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // A few restrained light motes, never a decorative constellation
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const dist2 = dx * dx + dy * dy;
            const pull = pointer.active ? 0.00055 : 0.00018;
            const falloff = Math.exp(-dist2 * 7.5);

            n.vx += dx * pull * falloff;
            n.vy += dy * pull * falloff;
            n.vx += Math.sin(t * 0.7 + n.phase) * 0.000015;
            n.vy += Math.cos(t * 0.55 + n.phase * 1.3) * 0.000015;
            n.vx *= 0.965;
            n.vy *= 0.965;
            n.x += n.vx;
            n.y += n.vy;

            // Soft wrap
            if (n.x < -0.05) n.x = 1.05;
            if (n.x > 1.05) n.x = -0.05;
            if (n.y < -0.05) n.y = 1.05;
            if (n.y > 1.05) n.y = -0.05;

            const px = n.x * w;
            const py = n.y * h;
            const pulse = 0.55 + Math.sin(t * n.pulse + n.phase) * 0.45;
            const near = Math.exp(-dist2 * 10);
            const alpha = (0.08 + near * 0.28) * n.z * enter * pulse;
            const radius = (n.r + near * 1.8) * (0.7 + n.z * 0.5);

            ctx.beginPath();
            ctx.fillStyle = `rgba(235, 245, 255, ${alpha})`;
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();

            if (near > 0.2) {
                const halo = ctx.createRadialGradient(px, py, 0, px, py, radius * 6);
                halo.addColorStop(0, `rgba(190, 220, 255, ${near * 0.10 * enter})`);
                halo.addColorStop(1, 'rgba(190, 220, 255, 0)');
                ctx.fillStyle = halo;
                ctx.beginPath();
                ctx.arc(px, py, radius * 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Soft focus around the pointer
        if (enter > 0.2) {
            const core = 8 + Math.sin(t * 2.2) * 2;
            const coreG = ctx.createRadialGradient(gx, gy, 0, gx, gy, core * 5);
            coreG.addColorStop(0, `rgba(255, 255, 255, ${0.28 * enter})`);
            coreG.addColorStop(0.25, `rgba(200, 225, 255, ${0.12 * enter})`);
            coreG.addColorStop(1, 'rgba(200, 225, 255, 0)');
            ctx.fillStyle = coreG;
            ctx.beginPath();
            ctx.arc(gx, gy, core * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (running) raf = requestAnimationFrame(step);
    }

    function start() {
        resize();
        if (reduced) {
            // One still frame: a quiet glow, no chase
            pointer.x = pointer.tx = 0.5;
            pointer.y = pointer.ty = 0.42;
            born = performance.now() - 2000;
            step(performance.now());
            return;
        }
        running = true;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize, { passive: true });

    // Pause when the cover leaves the viewport
    new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!reduced && !running) start();
            } else if (running) {
                running = false;
                cancelAnimationFrame(raf);
            }
        });
    }, { threshold: 0.05 }).observe(hero);

    // Entrance class handoff for CSS choreography
    document.documentElement.classList.add('cover-ready');
    requestAnimationFrame(() => {
        document.documentElement.classList.add('cover-live');
        start();
    });
})();

/* =====================================================
   HERO
   The name assembles from points of light, ripples away
   from the pointer and scatters into depth on scroll.
   The real <h1> stays in the document for search and
   assistive technology; the canvas only paints over it.
   ===================================================== */

(() => {
    'use strict';

    const hero = document.getElementById('top');
    const canvas = document.getElementById('heroParticles');
    const title = hero && hero.querySelector('.hero-name');
    if (!hero || !canvas || !title) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (reduced || !ctx) {
        document.documentElement.classList.add('cover-live');
        return;
    }

    document.documentElement.classList.add('hero-fx');

    const PALETTE = [
        [111, 141, 255],
        [180, 155, 255],
        [127, 220, 255],
    ];
    const BUCKETS = 28;
    const bucketColor = Array.from({ length: BUCKETS }, (_, i) => {
        const t = i / (BUCKETS - 1);
        const seg = t < 0.5 ? 0 : 1;
        const f = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        const a = PALETTE[seg];
        const b = PALETTE[seg + 1];
        return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles = [];
    let stars = [];
    let glyphGlow = null;
    let glyphBox = null;
    let born = 0;
    let running = false;
    let raf = 0;
    let scrollP = 0;

    const pointer = { x: -9999, y: -9999, sx: 0.5, sy: 0.45, active: false };

    function sampleTitle() {
        const heroRect = hero.getBoundingClientRect();
        const rect = title.getBoundingClientRect();
        const cs = getComputedStyle(title);
        const size = parseFloat(cs.fontSize);
        const text = title.textContent.trim();

        const off = document.createElement('canvas');
        off.width = Math.ceil(w);
        off.height = Math.ceil(h);
        const o = off.getContext('2d');
        o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
        if ('letterSpacing' in o) o.letterSpacing = cs.letterSpacing;
        o.textAlign = 'center';
        o.textBaseline = 'middle';

        // Wrap the same way the browser wraps the real heading
        const lines = [];
        let line = '';
        for (const word of text.split(/\s+/)) {
            const next = line ? line + ' ' + word : word;
            if (line && o.measureText(next).width > rect.width * 1.01) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        }
        if (line) lines.push(line);

        const widest = Math.max(...lines.map((l) => o.measureText(l).width));
        const scale = widest > rect.width * 1.02 ? (rect.width * 1.02) / widest : 1;
        o.font = `${cs.fontWeight} ${size * scale}px ${cs.fontFamily}`;
        o.fillStyle = '#fff';
        const lineH = (parseFloat(cs.lineHeight) || size) * scale;
        const cx = rect.left - heroRect.left + rect.width / 2;
        const cy = rect.top - heroRect.top + rect.height / 2;
        lines.forEach((l, i) => {
            o.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lineH);
        });

        const data = o.getImageData(0, 0, off.width, off.height).data;
        const gap = size * scale > 80 ? 3 : 2;
        const pts = [];
        let minX = Infinity;
        let maxX = -Infinity;
        for (let y = 0; y < off.height; y += gap) {
            for (let x = 0; x < off.width; x += gap) {
                if (data[(y * off.width + x) * 4 + 3] > 140) {
                    pts.push(x, y);
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                }
            }
        }

        // A blurred copy of the glyphs lends the formed name a soft bloom
        const glow = document.createElement('canvas');
        glow.width = off.width;
        glow.height = off.height;
        const g = glow.getContext('2d');
        g.filter = `blur(${Math.round(size * 0.18)}px)`;
        g.drawImage(off, 0, 0);
        glyphGlow = glow;
        glyphBox = { minX, maxX };
        return pts;
    }

    function build() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const pts = sampleTitle();
        const span = Math.max(1, glyphBox.maxX - glyphBox.minX);
        const previous = particles;
        particles = [];
        for (let i = 0; i < pts.length; i += 2) {
            const hx = pts[i] + (Math.random() - 0.5) * 2.2;
            const hy = pts[i + 1] + (Math.random() - 0.5) * 2.2;
            const old = previous[(i / 2) % (previous.length || 1)];
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.max(w, h) * (0.35 + Math.random() * 0.6);
            particles.push({
                hx,
                hy,
                x: old ? old.x : w / 2 + Math.cos(angle) * radius,
                y: old ? old.y : h / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                delay: ((hx - glyphBox.minX) / span) * 0.7 + Math.random() * 0.35,
                dx: Math.cos(angle),
                dy: Math.sin(angle) - 0.25,
                depth: 0.4 + Math.random() * 1.6,
                size: Math.random() < 0.1 ? 2.1 : 1.2 + Math.random() * 0.5,
                bucket: Math.min(BUCKETS - 1, Math.floor(((hx - glyphBox.minX) / span) * BUCKETS)),
                phase: Math.random() * Math.PI * 2,
            });
        }

        particles.sort((a, b) => a.bucket - b.bucket);

        const starCount = Math.round(Math.min(260, (w * h) / 6000));
        stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            z: 0.2 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
        }));
    }

    function frame(now) {
        const t = (now - born) / 1000;
        ctx.clearRect(0, 0, w, h);

        pointer.sx += ((pointer.active ? pointer.x / w : 0.5) - pointer.sx) * 0.05;
        pointer.sy += ((pointer.active ? pointer.y / h : 0.45) - pointer.sy) * 0.05;

        const fade = 1 - scrollP;
        const lift = scrollP * scrollP;

        // Ambient light that drifts toward the pointer
        const gx = pointer.sx * w;
        const gy = pointer.sy * h;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
        glow.addColorStop(0, `rgba(90, 120, 255, ${0.16 * fade})`);
        glow.addColorStop(0.4, `rgba(120, 90, 255, ${0.06 * fade})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Depth field: distant points that parallax with the pointer and stream on scroll
        ctx.fillStyle = '#cfdcff';
        for (const s of stars) {
            const px = s.x + (0.5 - pointer.sx) * 40 * s.z;
            const py = s.y + (0.45 - pointer.sy) * 30 * s.z - lift * 500 * s.z;
            ctx.globalAlpha = (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.phase))) * s.z * Math.min(1, t / 1.5);
            ctx.fillRect(px, ((py % h) + h) % h, s.z * 1.6, s.z * 1.6);
        }

        let formed = 0;
        const R = Math.max(70, w * 0.07);
        const R2 = R * R;

        for (const p of particles) {
            const local = Math.max(0, Math.min(1, (t - 0.25 - p.delay) / 1.1));
            const k = 0.012 + local * 0.075;
            p.vx += (p.hx - p.x) * k * local;
            p.vy += (p.hy - p.y) * k * local;

            if (pointer.active) {
                const ddx = p.x - pointer.x;
                const ddy = p.y - pointer.y;
                const d2 = ddx * ddx + ddy * ddy;
                if (d2 < R2 && d2 > 0.01) {
                    const d = Math.sqrt(d2);
                    const f = (1 - d / R) * (1 - d / R) * 7;
                    p.vx += (ddx / d) * f;
                    p.vy += (ddy / d) * f;
                }
            }

            p.vx *= 0.82;
            p.vy *= 0.82;
            p.x += p.vx;
            p.y += p.vy;
            formed += local;
        }
        formed /= particles.length || 1;

        // Bloom behind the formed name
        if (glyphGlow && formed > 0.3) {
            ctx.globalAlpha = Math.min(1, (formed - 0.3) / 0.7) * 0.32 * fade;
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(glyphGlow, 0, -lift * 120, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.9 * fade + 0.1;
        let bucket = -1;
        for (const p of particles) {
            if (p.bucket !== bucket) {
                bucket = p.bucket;
                ctx.fillStyle = bucketColor[bucket];
            }
            const shimmer = Math.sin(t * 2 + p.phase) * 0.35;
            const sx = p.x + p.dx * lift * 900 * p.depth;
            const sy = p.y + p.dy * lift * 900 * p.depth - lift * 120 + shimmer;
            const s = p.size * (1 + lift * 2.5 * p.depth);
            ctx.fillRect(sx, sy, s, s);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.active = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; pointer.x = pointer.y = -9999; }, { passive: true });
    hero.addEventListener('touchmove', (e) => {
        const r = hero.getBoundingClientRect();
        const touch = e.touches[0];
        if (!touch) return;
        pointer.x = touch.clientX - r.left;
        pointer.y = touch.clientY - r.top;
        pointer.active = true;
    }, { passive: true });
    hero.addEventListener('touchend', () => { pointer.active = false; pointer.x = pointer.y = -9999; }, { passive: true });

    window.addEventListener('scroll', () => {
        scrollP = Math.max(0, Math.min(1, window.scrollY / (h * 0.85 || 1)));
    }, { passive: true });

    let resizeTimer = 0;
    let lastW = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Mobile browsers resize when the toolbar hides; only rebuild on real width changes
            if (Math.abs(hero.clientWidth - lastW) < 2 && Math.abs(hero.clientHeight - h) < 140) return;
            lastW = hero.clientWidth;
            build();
        }, 180);
    }, { passive: true });

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
    }, { threshold: 0 }).observe(hero);

    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
        lastW = hero.clientWidth;
        build();
        born = performance.now();
        document.documentElement.classList.add('cover-ready', 'cover-live');
        start();
    });
})();

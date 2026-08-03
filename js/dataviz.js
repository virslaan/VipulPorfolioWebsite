/* =====================================================
   DATA FIELD
   A city of data columns rising and falling on a grid,
   with a bright sweep travelling through it. Written
   against raw WebGL so the page carries no library
   payload; if WebGL is missing the gradient behind it
   stands on its own.
   ===================================================== */

(() => {
    'use strict';

    const canvas = document.querySelector('.data-viz__canvas');
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
    });

    if (!gl) return;

    const VERT = `
        precision highp float;

        attribute vec3 aBar;       // x, z in -1..1, w = 0 base / 1 top
        uniform float uTime;
        uniform float uAspect;
        uniform vec2  uPointer;
        uniform float uSize;
        varying float vLevel;
        varying float vDepth;
        varying float vEdge;
        varying float vTip;

        float column(vec2 p, float t) {
            float h  = sin(p.x * 2.9 + t * 0.62) * 0.5 + 0.5;
            h *= sin(p.y * 2.2 - t * 0.48) * 0.35 + 0.65;
            h += sin((p.x + p.y) * 3.4 + t * 0.9) * 0.14;
            h += sin(p.x * 7.1 - t * 1.3) * 0.06;
            return clamp(h, 0.04, 1.4);
        }

        void main() {
            vec2 g = aBar.xy;
            float t = uTime;

            float level = column(g, t);

            // A sweep of light travels away from the viewer
            float sweep = fract(t * 0.09);
            float band = 1.0 - smoothstep(0.0, 0.16, abs((g.y * 0.5 + 0.5) - sweep));
            level += band * 0.55;

            // The pointer lifts the columns nearest to it
            float d = distance(g, uPointer);
            level += exp(-d * d * 3.0) * 0.5;

            vLevel = level;
            vTip = aBar.z;

            // Clears out of the way of the copy on the left, so the field
            // occupies the right of the band the way a product shot would
            float leftFade = smoothstep(-0.85, 0.05, g.x);

            vEdge = (1.0 - smoothstep(0.62, 1.0, abs(g.x)))
                  * (1.0 - smoothstep(0.5, 1.0, g.y))
                  * leftFade;

            float height = level * 0.40 * aBar.z;

            float zNear = 1.15;
            float zFar  = 11.0;
            vec3 pos = vec3(
                g.x * 6.6,
                height,
                mix(zNear, zFar, g.y * 0.5 + 0.5)
            );

            const float CAM_H = 1.35;
            const float PITCH = 0.235;
            float ca = cos(PITCH), sa = sin(PITCH);

            // A slow sway keeps the field from feeling like a static render
            float sway = sin(t * 0.14) * 0.28;

            vec3 rel = vec3(pos.x + sway, pos.y - CAM_H, pos.z);
            vec3 c = vec3(
                rel.x,
                ca * rel.y + sa * rel.z,
                -sa * rel.y + ca * rel.z
            );

            vDepth = c.z;

            float f = 1.45;
            gl_Position = vec4(c.x * f, c.y * f * uAspect, c.z * 0.01, c.z);
            gl_PointSize = clamp(uSize * (1.0 + level) / c.z, 1.0, 6.0);
        }
    `;

    const FRAG = `
        precision highp float;

        varying float vLevel;
        varying float vDepth;
        varying float vEdge;
        varying float vTip;

        void main() {
            float lv = clamp(vLevel * 0.72, 0.0, 1.4);

            vec3 base = vec3(0.13, 0.24, 0.60);   // deep indigo at the floor
            vec3 mid  = vec3(0.26, 0.56, 1.00);   // stripe blue
            vec3 hot  = vec3(0.72, 0.94, 1.00);   // near-white crest

            vec3 col = mix(base, mid, smoothstep(0.05, 0.62, lv));
            col = mix(col, hot, smoothstep(0.72, 1.25, lv));

            // Caps burn brighter than the shafts, the floor sits quietly under both
            float tipBoost = mix(0.42, 1.0, vTip);

            float depthFade = smoothstep(10.5, 1.4, vDepth);
            float alpha = vEdge * depthFade * tipBoost * (0.30 + lv * 1.05);
            alpha = clamp(alpha, 0.0, 1.0);

            gl_FragColor = vec4(col * alpha, alpha);
        }
    `;

    const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn('data field shader:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn('data field link:', gl.getProgramInfoLog(prog));
        return;
    }
    gl.useProgram(prog);

    // One column per cell: a shaft (two vertices) and a cap (the top vertex)
    const COLS = 76, ROWS = 42;
    const shafts = new Float32Array(COLS * ROWS * 2 * 3);
    const caps = new Float32Array(COLS * ROWS * 3);
    let i = 0, j = 0;

    for (let z = 0; z < ROWS; z++) {
        for (let x = 0; x < COLS; x++) {
            const gx = (x / (COLS - 1)) * 2 - 1;
            const gz = (z / (ROWS - 1)) * 2 - 1;
            shafts[i++] = gx; shafts[i++] = gz; shafts[i++] = 0; // base
            shafts[i++] = gx; shafts[i++] = gz; shafts[i++] = 1; // top
            caps[j++] = gx; caps[j++] = gz; caps[j++] = 1;
        }
    }

    // Floor lattice at ground level, so the columns stand on something
    const floorVerts = new Float32Array(COLS * ROWS * 3);
    let fi = 0;
    for (let z = 0; z < ROWS; z++) {
        for (let x = 0; x < COLS; x++) {
            floorVerts[fi++] = (x / (COLS - 1)) * 2 - 1;
            floorVerts[fi++] = (z / (ROWS - 1)) * 2 - 1;
            floorVerts[fi++] = 0;
        }
    }

    const floorIdx = new Uint16Array(((COLS - 1) * ROWS + COLS * (ROWS - 1)) * 2);
    let k = 0;
    for (let z = 0; z < ROWS; z++) {
        for (let x = 0; x < COLS - 1; x++) {
            floorIdx[k++] = z * COLS + x;
            floorIdx[k++] = z * COLS + x + 1;
        }
    }
    for (let x = 0; x < COLS; x++) {
        for (let z = 0; z < ROWS - 1; z++) {
            floorIdx[k++] = z * COLS + x;
            floorIdx[k++] = (z + 1) * COLS + x;
        }
    }
    const FLOOR_COUNT = k;

    const floorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, floorVerts, gl.STATIC_DRAW);

    const floorIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floorIdx, gl.STATIC_DRAW);

    const shaftBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shaftBuf);
    gl.bufferData(gl.ARRAY_BUFFER, shafts, gl.STATIC_DRAW);

    const capBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, capBuf);
    gl.bufferData(gl.ARRAY_BUFFER, caps, gl.STATIC_DRAW);

    const aBar = gl.getAttribLocation(prog, 'aBar');
    gl.enableVertexAttribArray(aBar);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uAspect = gl.getUniformLocation(prog, 'uAspect');
    const uPointer = gl.getUniformLocation(prog, 'uPointer');
    const uSize = gl.getUniformLocation(prog, 'uSize');

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let bufW = 0, bufH = 0;

    // Re-measured from the element itself, so late layout, zoom and
    // orientation changes cannot leave the buffer at the wrong size
    const sync = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(Math.round(canvas.clientWidth), 1);
        const h = Math.max(Math.round(canvas.clientHeight), 1);
        const nw = Math.round(w * dpr);
        const nh = Math.round(h * dpr);
        if (nw === bufW && nh === bufH) return;
        bufW = nw; bufH = nh;
        canvas.width = nw;
        canvas.height = nh;
        gl.viewport(0, 0, nw, nh);
        gl.uniform1f(uAspect, w / h);
        gl.uniform1f(uSize, 5.4);
    };

    const pointer = { x: 0.4, y: 0.2, tx: 0.4, ty: 0.2 };
    const band = canvas.closest('.band') || canvas.parentElement;

    band.addEventListener('mousemove', (e) => {
        const r = band.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    }, { passive: true });

    band.addEventListener('mouseleave', () => {
        pointer.tx = 0.4;
        pointer.ty = 0.2;
    });

    const draw = (t) => {
        sync();
        pointer.x += (pointer.tx - pointer.x) * 0.055;
        pointer.y += (pointer.ty - pointer.y) * 0.055;

        gl.uniform1f(uTime, t);
        gl.uniform2f(uPointer, pointer.x, pointer.y);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, floorBuf);
        gl.vertexAttribPointer(aBar, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIbo);
        gl.drawElements(gl.LINES, FLOOR_COUNT, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, shaftBuf);
        gl.vertexAttribPointer(aBar, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, COLS * ROWS * 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, capBuf);
        gl.vertexAttribPointer(aBar, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
    };

    sync();
    draw(0);

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(() => draw(lastT)).observe(canvas);
    }
    window.addEventListener('resize', () => draw(lastT), { passive: true });

    let lastT = 0;
    if (reduced) return;

    let raf = null;
    let running = false;

    const loop = (now) => {
        lastT = now * 0.001;
        draw(lastT);
        raf = requestAnimationFrame(loop);
    };

    new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !running) {
                running = true;
                raf = requestAnimationFrame(loop);
            } else if (!entry.isIntersecting && running) {
                running = false;
                cancelAnimationFrame(raf);
            }
        });
    }, { threshold: 0 }).observe(band);
})();

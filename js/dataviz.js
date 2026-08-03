/* =====================================================
   DATA FIELD
   A GPU-driven point lattice that ripples like a data
   surface. Written against raw WebGL so the page carries
   no library payload; falls back silently to the gradient
   alone if WebGL is unavailable.
   ===================================================== */

(() => {
    'use strict';

    const canvas = document.querySelector('.data-viz__canvas');
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
    });

    if (!gl) return; // the gradient behind is a complete visual on its own

    const VERT = `
        precision highp float;

        attribute vec2 aGrid;      // -1..1 across the field
        uniform float uTime;
        uniform float uAspect;
        uniform vec2  uPointer;    // -1..1, eased
        varying float vHeight;
        varying float vDepth;
        varying float vEdge;

        // Layered waves stand in for noise: cheap, smooth, and endless
        float surface(vec2 p, float t) {
            float h  = sin(p.x * 2.6 + t * 0.55) * 0.50;
            h += sin(p.y * 2.1 - t * 0.42) * 0.42;
            h += sin((p.x + p.y) * 1.7 + t * 0.31) * 0.30;
            h += sin((p.x - p.y) * 3.3 - t * 0.24) * 0.16;
            return h * 0.58;
        }

        void main() {
            vec2 g = aGrid;

            // A soft swell follows the pointer across the surface
            float d = distance(g, uPointer);
            float lift = exp(-d * d * 2.2) * 0.28;

            float h = surface(g, uTime) + lift;
            vHeight = h;

            // Dissolve at the rim and before the horizon, so nothing ends abruptly
            vEdge = (1.0 - smoothstep(0.62, 1.0, abs(g.x)))
                  * (1.0 - smoothstep(0.55, 1.0, g.y));

            // Ground plane receding from just under the camera to a horizon
            float zNear = 0.9;
            float zFar  = 10.5;
            vec3 pos = vec3(
                g.x * 6.4,
                h,
                mix(zNear, zFar, g.y * 0.5 + 0.5)
            );

            const float CAM_H = 1.05;   // camera height above the surface
            const float PITCH = 0.255;  // tilt down, which lifts the horizon
            float ca = cos(PITCH), sa = sin(PITCH);

            vec3 rel = vec3(pos.x, pos.y - CAM_H, pos.z);
            vec3 c = vec3(
                rel.x,
                ca * rel.y + sa * rel.z,
                -sa * rel.y + ca * rel.z
            );

            vDepth = c.z;

            float f = 1.5;
            gl_Position = vec4(c.x * f, c.y * f * uAspect, c.z * 0.01, c.z);
            gl_PointSize = clamp(7.5 / c.z, 0.8, 3.4);
        }
    `;

    const FRAG = `
        precision highp float;

        varying float vHeight;
        varying float vDepth;
        varying float vEdge;

        void main() {
            float lift = clamp(vHeight * 1.6 + 0.5, 0.0, 1.0);

            vec3 low  = vec3(0.20, 0.32, 0.72);   // deep indigo in the troughs
            vec3 mid  = vec3(0.36, 0.62, 1.00);   // stripe blue
            vec3 high = vec3(0.74, 0.95, 1.00);   // pale crest

            vec3 col = mix(low, mid, smoothstep(0.0, 0.6, lift));
            col = mix(col, high, smoothstep(0.6, 1.0, lift));

            float depthFade = smoothstep(9.5, 1.6, vDepth);
            float alpha = vEdge * depthFade * (0.18 + lift * 0.78);

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

    // Lattice, drawn as a wireframe surface
    const COLS = 132, ROWS = 74;
    const verts = new Float32Array(COLS * ROWS * 2);
    let i = 0;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            verts[i++] = (x / (COLS - 1)) * 2 - 1;
            verts[i++] = (y / (ROWS - 1)) * 2 - 1;
        }
    }

    // Segment indices: along each row, then down each column
    const idx = new Uint16Array(((COLS - 1) * ROWS + COLS * (ROWS - 1)) * 2);
    let k = 0;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS - 1; x++) {
            idx[k++] = y * COLS + x;
            idx[k++] = y * COLS + x + 1;
        }
    }
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS - 1; y++) {
            idx[k++] = y * COLS + x;
            idx[k++] = (y + 1) * COLS + x;
        }
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const INDEX_COUNT = k;

    const aGrid = gl.getAttribLocation(prog, 'aGrid');
    gl.enableVertexAttribArray(aGrid);
    gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uAspect = gl.getUniformLocation(prog, 'uAspect');
    const uPointer = gl.getUniformLocation(prog, 'uPointer');

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied additive-ish

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(canvas.clientWidth, 1);
        const h = Math.max(canvas.clientHeight, 1);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(uAspect, w / h);
    };

    const pointer = { x: 0.35, y: 0.1, tx: 0.35, ty: 0.1 };

    const band = canvas.closest('.band') || canvas.parentElement;
    band.addEventListener('mousemove', (e) => {
        const r = band.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    }, { passive: true });

    band.addEventListener('mouseleave', () => {
        pointer.tx = 0.35;
        pointer.ty = 0.1;
    });

    const draw = (tSeconds) => {
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        gl.uniform1f(uTime, tSeconds);
        gl.uniform2f(uPointer, pointer.x, pointer.y);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.LINES, INDEX_COUNT, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    draw(0);

    if (reduced) return; // a single settled frame is enough

    let raf = null;
    let running = false;

    const loop = (now) => {
        draw(now * 0.001);
        raf = requestAnimationFrame(loop);
    };

    // Idle whenever the band is not on screen
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

/* Vipul H. Harihar — Portfolio interactions */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ---------- Navigation: hide on scroll down, show on up ---------- */
    var nav = document.getElementById('nav');
    var lastY = window.scrollY;
    var navHidden = false;

    window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y > lastY && y > 160 && !navHidden) {
            nav.classList.add('is-hidden');
            navHidden = true;
        } else if ((y < lastY || y <= 160) && navHidden) {
            nav.classList.remove('is-hidden');
            navHidden = false;
        }
        lastY = y;
    }, { passive: true });

    /* ---------- Mobile menu ---------- */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var open = navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
        navLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Active section highlighting ---------- */
    var linkMap = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
        linkMap[a.getAttribute('href').slice(1)] = a;
    });
    var sections = Array.from(document.querySelectorAll('main section[id], footer[id]'));

    if ('IntersectionObserver' in window) {
        var activeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                Object.values(linkMap).forEach(function (a) { a.classList.remove('is-active'); });
                if (linkMap[id]) linkMap[id].classList.add('is-active');
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(function (s) { activeObserver.observe(s); });
    }

    /* ---------- Reveal fallback (browsers without scroll-driven animations) ---------- */
    var needsFallback = !CSS.supports('animation-timeline: view()');
    if (needsFallback && 'IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.style.opacity = '0';
            el.style.transition = 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)';
            revealObserver.observe(el);
        });
    }

    /* ---------- Stat counters ---------- */
    function animateCount(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        if (reducedMotion) {
            el.textContent = prefix + target + suffix;
            return;
        }
        var duration = 900;
        var start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.stat-value').forEach(function (el) {
            countObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.stat-value').forEach(animateCount);
    }

    /* ---------- Hero canvas — subtle node network ---------- */
    var canvas = document.getElementById('heroCanvas');
    if (canvas && !reducedMotion) {
        var ctx = canvas.getContext('2d');
        var nodes = [];
        var NODE_COUNT = 42;
        var LINK_DIST = 150;
        var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width; h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seed() {
            nodes = [];
            for (var i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.22,
                    vy: (Math.random() - 0.5) * 0.22,
                    r: Math.random() * 1.4 + 0.6
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            var i, j, a, b, dx, dy, dist;

            for (i = 0; i < nodes.length; i++) {
                a = nodes[i];
                a.x += a.vx; a.y += a.vy;
                if (a.x < -10) a.x = w + 10; else if (a.x > w + 10) a.x = -10;
                if (a.y < -10) a.y = h + 10; else if (a.y > h + 10) a.y = -10;
            }

            for (i = 0; i < nodes.length; i++) {
                a = nodes[i];
                for (j = i + 1; j < nodes.length; j++) {
                    b = nodes[j];
                    dx = a.x - b.x; dy = a.y - b.y;
                    dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        ctx.strokeStyle = 'rgba(217, 164, 65, ' + (0.10 * (1 - dist / LINK_DIST)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            ctx.fillStyle = 'rgba(236, 232, 223, 0.35)';
            for (i = 0; i < nodes.length; i++) {
                a = nodes[i];
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(draw);
        }

        resize();
        seed();
        requestAnimationFrame(draw);
        window.addEventListener('resize', function () { resize(); seed(); });
    }

    /* ---------- Forbes story modal ---------- */
    var modal = document.getElementById('forbesModal');
    var forbesBadge = document.getElementById('forbesBadge');
    var storyClose = document.getElementById('storyClose');

    function openStory() {
        if (!modal) return;
        modal.hidden = false;
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { modal.classList.add('is-open'); });
        });
        document.body.style.overflow = 'hidden';
        if (storyClose) storyClose.focus();
    }

    function closeStory() {
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        window.setTimeout(function () { modal.hidden = true; }, 320);
    }

    if (forbesBadge && modal) {
        forbesBadge.addEventListener('click', openStory);
        storyClose.addEventListener('click', closeStory);
        modal.querySelector('.story-backdrop').addEventListener('click', closeStory);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hidden) closeStory();
        });
    }
})();

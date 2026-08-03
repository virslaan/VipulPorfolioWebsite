/* ════════════════════════════════════════════════════════════
   VIPUL H. HARIHAR - PORTFOLIO ENGINE
   Vanilla JS. No dependencies. Everything degrades gracefully.
   ════════════════════════════════════════════════════════════ */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ═══════════ PRELOADER ═══════════ */

    const preloader = $('#preloader');
    const preloaderBar = $('#preloaderBar');

    if (preloader) {
        let progress = 0;
        const tick = setInterval(() => {
            progress = Math.min(progress + 8 + Math.random() * 14, 92);
            if (preloaderBar) preloaderBar.style.width = progress + '%';
        }, 110);

        const finish = () => {
            clearInterval(tick);
            if (preloaderBar) preloaderBar.style.width = '100%';
            setTimeout(() => {
                preloader.classList.add('done');
                document.body.classList.add('loaded');
            }, prefersReducedMotion ? 0 : 420);
        };

        if (document.readyState === 'complete') {
            setTimeout(finish, prefersReducedMotion ? 0 : 900);
        } else {
            window.addEventListener('load', () => {
                setTimeout(finish, prefersReducedMotion ? 0 : 900);
            });
            // Safety net: never trap the visitor behind the loader.
            setTimeout(finish, 4000);
        }
    }

    /* ═══════════ SCROLL PROGRESS ═══════════ */

    const progressBar = $('#scrollProgress');
    const updateProgress = () => {
        if (!progressBar) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };

    /* ═══════════ NAV ═══════════ */

    const nav = $('#nav');
    const navLinks = $('#navLinks');
    const burger = $('#navBurger');

    const updateNav = () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
    };

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            burger.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
        });
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                navLinks.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Active section highlighting
    const sectionIds = ['about', 'platforms', 'experience', 'projects', 'skills', 'education', 'resume', 'contact'];
    const navAnchors = $$('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach((a) => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-38% 0px -55% 0px' });

    sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    /* ═══════════ CUSTOM CURSOR ═══════════ */

    if (isFinePointer && !prefersReducedMotion) {
        const dot = $('#cursorDot');
        const ring = $('#cursorRing');
        let mx = -100, my = -100, rx = -100, ry = -100;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            document.body.classList.add('cursor-active');
        }, { passive: true });

        document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));

        const hoverables = 'a, button, .tilt, input, textarea, [role="button"]';
        document.addEventListener('mouseover', (e) => {
            document.body.classList.toggle('cursor-hover', !!e.target.closest(hoverables));
        }, { passive: true });

        (function cursorLoop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(cursorLoop);
        })();
    }

    /* ═══════════ HERO: GOLDEN FLOW FIELD ═══════════
       Hundreds of particles ride an animated vector field and
       leave silky molten-gold trails. The field bends around
       the cursor, so the whole stream reacts to the visitor.  */

    const canvas = $('#heroCanvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let W = 0, H = 0;
        const mouse = { x: -9999, y: -9999 };
        const DPR = Math.min(window.devicePixelRatio || 1, 2);
        const PALETTE = [
            'rgba(242, 207, 118, A)',
            'rgba(232, 181, 74, A)',
            'rgba(208, 138, 46, A)',
            'rgba(194, 94, 42, A)',
            'rgba(247, 230, 176, A)'
        ];

        const spawn = () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            speed: 0.6 + Math.random() * 1.4,
            life: 120 + Math.random() * 240,
            width: 0.6 + Math.random() * 1.2,
            color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
        });

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvas.width = W * DPR;
            canvas.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.fillStyle = '#070706';
            ctx.fillRect(0, 0, W, H);
            const count = Math.min(Math.floor((W * H) / 6000), 320);
            particles = Array.from({ length: count }, spawn);
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });

        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, { passive: true });

        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        let t = 0;
        const MOUSE_R = 220;

        const fieldAngle = (x, y) => {
            // Layered waves produce an organic, slowly evolving current
            let a = Math.sin(x * 0.0016 + t * 0.6) * 1.3
                  + Math.cos(y * 0.0021 - t * 0.45) * 1.3
                  + Math.sin((x + y) * 0.0008 + t * 0.25) * 0.8;
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < MOUSE_R) {
                // Bend the current into a vortex around the cursor
                const f = 1 - d / MOUSE_R;
                a += Math.atan2(dy, dx) * f * 0.9 + f * 2.4;
            }
            return a;
        };

        (function draw() {
            t += 0.005;
            // Translucent wipe leaves glowing trails behind
            ctx.fillStyle = 'rgba(7, 7, 6, 0.07)';
            ctx.fillRect(0, 0, W, H);
            ctx.lineCap = 'round';

            for (const p of particles) {
                const a = fieldAngle(p.x, p.y);
                const nx = p.x + Math.cos(a) * p.speed;
                const ny = p.y + Math.sin(a) * p.speed;

                ctx.strokeStyle = p.color.replace('A', '0.5');
                ctx.lineWidth = p.width;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(nx, ny);
                ctx.stroke();

                p.x = nx;
                p.y = ny;
                p.life--;

                if (p.life <= 0 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
                    Object.assign(p, spawn());
                }
            }

            requestAnimationFrame(draw);
        })();
    }

    /* ═══════════ TYPEWRITER ═══════════ */

    const typeTarget = $('#typewriter');
    if (typeTarget) {
        const phrases = [
            'Lead Software Engineer @ GenTrust',
            'Architect of AIRIA & AURA',
            'Enterprise AI · $5B+ AUM',
            'Columbia MS in Data Science',
            'Forbes 30 Under 30 · 2026 Nominee',
            'Full-stack. Solo. Production.'
        ];

        if (prefersReducedMotion) {
            typeTarget.textContent = phrases[0];
        } else {
            let pi = 0, ci = 0, deleting = false;
            const step = () => {
                const phrase = phrases[pi];
                if (!deleting) {
                    ci++;
                    typeTarget.textContent = phrase.slice(0, ci);
                    if (ci === phrase.length) {
                        deleting = true;
                        setTimeout(step, 2100);
                        return;
                    }
                    setTimeout(step, 42 + Math.random() * 46);
                } else {
                    ci--;
                    typeTarget.textContent = phrase.slice(0, ci);
                    if (ci === 0) {
                        deleting = false;
                        pi = (pi + 1) % phrases.length;
                        setTimeout(step, 380);
                        return;
                    }
                    setTimeout(step, 22);
                }
            };
            setTimeout(step, 1300);
        }
    }

    /* ═══════════ SCROLL REVEALS ═══════════ */

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal-up').forEach((el) => revealObserver.observe(el));

    /* ═══════════ COUNTERS ═══════════ */

    const animateCounter = (el) => {
        const target = parseFloat(el.dataset.target || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion) {
            el.textContent = prefix + target + suffix;
            return;
        }
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    $$('.counter').forEach((el) => counterObserver.observe(el));

    /* ═══════════ TIMELINE ═══════════ */

    $$('.timeline-card').forEach((card) => {
        const body = $('.timeline-body', card);
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const expanded = card.getAttribute('aria-expanded') === 'true';
            card.setAttribute('aria-expanded', String(!expanded));
            if (body) body.style.maxHeight = expanded ? '0px' : body.scrollHeight + 'px';
        });
    });

    // Timeline line fill follows scroll
    const timeline = $('#timeline');
    const timelineFill = $('#timelineFill');
    const updateTimeline = () => {
        if (!timeline || !timelineFill) return;
        const rect = timeline.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height;
        const passed = Math.min(Math.max(vh * 0.65 - rect.top, 0), total);
        timelineFill.style.height = (passed / total) * 100 + '%';
    };

    /* ═══════════ TILT ═══════════ */

    if (isFinePointer && !prefersReducedMotion) {
        $$('.tilt').forEach((el) => {
            let raf = null;
            el.addEventListener('mousemove', (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / rect.width - 0.5;
                    const py = (e.clientY - rect.top) / rect.height - 0.5;
                    el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-4px)`;
                    raf = null;
                });
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ═══════════ MAGNETIC BUTTONS ═══════════ */

    if (isFinePointer && !prefersReducedMotion) {
        $$('.magnetic').forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.18}px, ${y * 0.24}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ═══════════ PROJECT FILTERS ═══════════ */

    const filterButtons = $$('.project-filter');
    const projectCards = $$('.project-card');

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            projectCards.forEach((card) => {
                const cats = (card.dataset.cat || '').split(/\s+/);
                const show = filter === 'all' || cats.includes(filter);
                card.classList.toggle('filtered-out', !show);
            });
        });
    });

    /* ═══════════ RESUME PREVIEW ═══════════ */

    const resumeToggle = $('#resumeToggle');
    const resumePreview = $('#resumePreview');

    if (resumeToggle && resumePreview) {
        resumeToggle.addEventListener('click', () => {
            const iframe = $('iframe', resumePreview);
            const opening = resumePreview.hidden;
            if (opening && iframe && !iframe.getAttribute('src')) {
                iframe.setAttribute('src', iframe.dataset.src);
            }
            resumePreview.hidden = !opening;
            resumeToggle.setAttribute('aria-expanded', String(opening));
            $('span', resumeToggle).textContent = opening ? 'Hide preview' : 'Preview in browser';
            if (opening) resumePreview.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        });
    }

    /* ═══════════ FORBES MODAL + CONFETTI ═══════════ */

    const forbesModal = $('#forbesModal');
    const confettiCanvas = $('#confettiCanvas');
    let confettiTimer = null;

    const launchConfetti = () => {
        if (!confettiCanvas || prefersReducedMotion) return;
        const cctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        confettiCanvas.style.display = 'block';

        const colors = ['#f5c518', '#f2cf76', '#e8b54a', '#d08a2e', '#c25e2a', '#fff6dd'];
        const pieces = Array.from({ length: 160 }, () => ({
            x: Math.random() * confettiCanvas.width,
            y: -20 - Math.random() * confettiCanvas.height * 0.5,
            w: 6 + Math.random() * 7,
            h: 8 + Math.random() * 9,
            vy: 2.2 + Math.random() * 3.4,
            vx: (Math.random() - 0.5) * 2.4,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.22,
            c: colors[Math.floor(Math.random() * colors.length)]
        }));

        const started = performance.now();
        cancelAnimationFrame(confettiTimer);

        const frame = (now) => {
            cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = false;
            for (const p of pieces) {
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.y * 0.02) * 0.6;
                p.rot += p.vr;
                if (p.y < confettiCanvas.height + 30) alive = true;
                cctx.save();
                cctx.translate(p.x, p.y);
                cctx.rotate(p.rot);
                cctx.fillStyle = p.c;
                cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                cctx.restore();
            }
            if (alive && now - started < 5200) {
                confettiTimer = requestAnimationFrame(frame);
            } else {
                confettiCanvas.style.display = 'none';
            }
        };
        confettiTimer = requestAnimationFrame(frame);
    };

    const openForbesModal = () => {
        if (!forbesModal) return;
        forbesModal.hidden = false;
        document.body.classList.add('no-scroll');
        launchConfetti();
    };

    const closeForbesModal = () => {
        if (!forbesModal) return;
        forbesModal.hidden = true;
        document.body.classList.remove('no-scroll');
        if (confettiCanvas) confettiCanvas.style.display = 'none';
        cancelAnimationFrame(confettiTimer);
    };

    ['forbesBadge', 'forbesAwardCard'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', openForbesModal);
    });

    if (forbesModal) {
        $$('[data-close-modal]', forbesModal).forEach((el) => el.addEventListener('click', closeForbesModal));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !forbesModal.hidden) closeForbesModal();
        });
    }

    /* ═══════════ CONTACT FORM (FormSubmit AJAX, works on GitHub Pages) ═══════════ */

    const contactForm = $('#contactForm');
    if (contactForm) {
        const statusEl = $('#formStatus');
        const submitBtn = $('#contactSubmit');
        const CONTACT_EMAIL = 'vhh2105@columbia.edu';

        const setStatus = (msg, kind) => {
            if (!statusEl) return;
            statusEl.textContent = msg;
            statusEl.classList.remove('ok', 'err');
            if (kind) statusEl.classList.add(kind);
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = $('#cfName').value.trim();
            const email = $('#cfEmail').value.trim();
            const message = $('#cfMsg').value.trim();
            const honey = contactForm.querySelector('[name="_honey"]').value;

            if (honey) return; // bot caught in the honeypot
            if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setStatus('Please fill in your name, a valid email, and a message.', 'err');
                return;
            }

            submitBtn.disabled = true;
            $('span', submitBtn).textContent = 'Sending…';
            setStatus('');

            try {
                const res = await fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        _subject: 'New message from your portfolio: ' + name,
                        _template: 'table'
                    })
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                await res.json();
                contactForm.reset();
                $('span', submitBtn).textContent = 'Message sent';
                setStatus("Got it. I'll get back to you soon.", 'ok');
                launchConfetti();
                setTimeout(() => {
                    $('span', submitBtn).textContent = 'Send message';
                    submitBtn.disabled = false;
                }, 4000);
            } catch (err) {
                // Network/service failure: hand off to the visitor's mail app instead
                $('span', submitBtn).textContent = 'Send message';
                submitBtn.disabled = false;
                setStatus('Direct send failed, opening your email app instead…', 'err');
                const body = encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');
                window.location.href = 'mailto:' + CONTACT_EMAIL +
                    '?subject=' + encodeURIComponent('Portfolio message from ' + name) +
                    '&body=' + body;
            }
        });
    }

    /* ═══════════ BACK TO TOP ═══════════ */

    const backToTop = $('#backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ═══════════ KONAMI EASTER EGG ═══════════ */

    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIdx = 0;
    document.addEventListener('keydown', (e) => {
        konamiIdx = e.key === konami[konamiIdx] ? konamiIdx + 1 : (e.key === konami[0] ? 1 : 0);
        if (konamiIdx === konami.length) {
            konamiIdx = 0;
            launchConfetti();
        }
    });

    /* ═══════════ SCROLL LOOP ═══════════ */

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateProgress();
            updateNav();
            updateTimeline();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    /* ═══════════ CONSOLE SIGNATURE ═══════════ */

    console.log(
        '%c VH %c Vipul H. Harihar. Built end-to-end, like everything else. %c vhh2105@columbia.edu ',
        'background:linear-gradient(100deg,#f2cf76,#e0a83e,#c25e2a);color:#0c0a06;font-weight:bold;border-radius:4px 0 0 4px;padding:4px 6px;',
        'background:#171410;color:#ede9e0;padding:4px 8px;',
        'background:#171410;color:#e8b54a;border-radius:0 4px 4px 0;padding:4px 8px;'
    );
})();

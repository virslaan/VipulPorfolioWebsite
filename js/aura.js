/* =====================================================
   AURA SHOWCASE
   A scripted walk through how AURA handles a request:
   route to an agent, gather approved context, apply
   guardrails, answer. Sample data only.
   ===================================================== */

(() => {
    'use strict';

    const root = document.getElementById('aura');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const promptsEl = root.querySelector('.aura-prompts');
    const logEl = root.querySelector('.aura-log');
    const nodesEl = root.querySelector('.aura-nodes');
    const linksEl = root.querySelector('.aura-links');
    const SVG = 'http://www.w3.org/2000/svg';

    const NODES = [
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'trading', label: 'Trading' },
        { id: 'tax', label: 'Tax' },
        { id: 'research', label: 'Research' },
        { id: 'salesforce', label: 'Salesforce' },
        { id: 'addepar', label: 'Addepar' },
        { id: 'documents', label: 'Documents' },
        { id: 'compliance', label: 'Compliance' },
    ];

    const SCENARIOS = [
        {
            chip: 'Portfolio drift',
            ask: 'Which households are overweight equities against their benchmark?',
            route: ['portfolio', 'addepar', 'compliance'],
            trace: [
                ['Route', 'Portfolio agent'],
                ['Context', 'Addepar holdings · benchmark policy · asset class map'],
                ['Guardrail', 'Household names masked · read-only access'],
                ['Model', 'Scoped prompt · calculations run outside the model'],
            ],
            answer: 'Three of 42 sample households sit more than five points overweight equities. The largest drift is Household ••27 at +8.4 points, driven by US large cap. I have drafted a rebalance review for the advisor. No trades were placed.',
        },
        {
            chip: 'Meeting to CRM',
            ask: 'Summarise my 2 pm client meeting and log it to Salesforce.',
            route: ['salesforce', 'documents', 'compliance'],
            trace: [
                ['Route', 'OTO meeting agent'],
                ['Context', 'On-device transcript · client record · open tasks'],
                ['Guardrail', 'Personal details redacted · advisor approval required'],
                ['Model', 'Summary, action items, CRM note'],
            ],
            answer: 'Three points: the client wants more liquidity before Q2, is open to a municipal bond ladder, and asked for a tax projection. Two follow-ups are due Friday. The Salesforce note is drafted and waiting for your approval.',
        },
        {
            chip: 'Tax-loss harvest',
            ask: 'Find tax-loss harvesting opportunities this week.',
            route: ['tax', 'trading', 'addepar', 'compliance'],
            trace: [
                ['Route', 'Tax agent'],
                ['Context', 'Lot-level positions · wash-sale windows · replacement list'],
                ['Guardrail', 'Execution disabled · human sign-off before any order'],
                ['Model', 'Ranked candidates with reasoning'],
            ],
            answer: 'Seven lots across four sample accounts show harvestable losses totalling $186K. Each has a replacement that keeps exposure within tolerance and clears the wash-sale window. The list is ready for trader review.',
        },
        {
            chip: 'Explain research',
            ask: 'Explain this research PDF like I am not a quant.',
            route: ['research', 'documents'],
            trace: [
                ['Route', 'Research agent'],
                ['Context', 'Password-protected PDF · firm glossary'],
                ['Guardrail', 'Nothing retained · no external training'],
                ['Model', 'Plain-language summary for a non-specialist'],
            ],
            answer: 'In short: the report expects rates to fall slowly, which usually helps longer-dated bonds more than cash. The risk it flags is inflation staying sticky. For clients who need income, it leans toward locking in yields now.',
        },
    ];

    /* ── Graph ──────────────────────────────────────── */

    const nodeEls = {};
    const linkEls = {};
    NODES.forEach((n, i) => {
        const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(a) * 150;
        const y = 200 + Math.sin(a) * 150;

        const line = document.createElementNS(SVG, 'line');
        line.setAttribute('x1', '200');
        line.setAttribute('y1', '200');
        line.setAttribute('x2', x.toFixed(1));
        line.setAttribute('y2', y.toFixed(1));
        line.setAttribute('class', 'aura-link');
        linksEl.appendChild(line);
        linkEls[n.id] = line;

        const g = document.createElementNS(SVG, 'g');
        g.setAttribute('class', 'aura-node');
        const c = document.createElementNS(SVG, 'circle');
        c.setAttribute('cx', x.toFixed(1));
        c.setAttribute('cy', y.toFixed(1));
        c.setAttribute('r', '7');
        const t = document.createElementNS(SVG, 'text');
        const outside = Math.cos(a);
        t.setAttribute('x', (x + (Math.abs(outside) < 0.2 ? 0 : outside > 0 ? 14 : -14)).toFixed(1));
        t.setAttribute('y', (y + (Math.abs(outside) < 0.2 ? (Math.sin(a) > 0 ? 24 : -16) : 4)).toFixed(1));
        t.setAttribute('text-anchor', Math.abs(outside) < 0.2 ? 'middle' : outside > 0 ? 'start' : 'end');
        t.textContent = n.label;
        g.appendChild(c);
        g.appendChild(t);
        nodesEl.appendChild(g);
        nodeEls[n.id] = g;
    });

    const lightRoute = (ids) => {
        NODES.forEach((n) => {
            const on = ids.includes(n.id);
            nodeEls[n.id].classList.toggle('on', on);
            linkEls[n.id].classList.toggle('on', on);
        });
    };

    /* ── Console ────────────────────────────────────── */

    const chips = SCENARIOS.map((sc, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.textContent = sc.chip;
        b.addEventListener('click', () => play(i, true));
        promptsEl.appendChild(b);
        return b;
    });

    const wait = (ms) => new Promise((res) => setTimeout(res, reduced ? 0 : ms));
    let run = 0;
    let current = -1;
    let autoplay = true;
    let cycleTimer = null;

    const el = (tag, cls, text) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    };

    const typeInto = async (node, text, speed, id) => {
        if (reduced) { node.textContent = text; return; }
        for (let i = 0; i <= text.length; i++) {
            if (id !== run) return;
            node.textContent = text.slice(0, i);
            await wait(speed);
        }
    };

    async function play(index, fromUser) {
        const id = ++run;
        current = index;
        if (fromUser) autoplay = false;
        clearTimeout(cycleTimer);
        chips.forEach((c, i) => c.setAttribute('aria-selected', String(i === index)));
        const sc = SCENARIOS[index];

        logEl.textContent = '';
        lightRoute([]);

        const ask = el('div', 'aura-msg aura-msg--user');
        ask.appendChild(el('span', 'aura-who', 'Advisor'));
        const askText = el('p');
        ask.appendChild(askText);
        logEl.appendChild(ask);
        await typeInto(askText, sc.ask, 18, id);
        if (id !== run) return;

        const trace = el('ol', 'aura-trace');
        logEl.appendChild(trace);
        for (const [k, v] of sc.trace) {
            await wait(420);
            if (id !== run) return;
            const li = el('li');
            li.appendChild(el('b', null, k));
            li.appendChild(el('span', null, v));
            trace.appendChild(li);
            requestAnimationFrame(() => li.classList.add('in'));
            if (k === 'Route') lightRoute(sc.route.slice(0, 1));
            if (k === 'Context') lightRoute(sc.route);
        }

        await wait(380);
        if (id !== run) return;
        const reply = el('div', 'aura-msg aura-msg--aura');
        reply.appendChild(el('span', 'aura-who', 'AURA'));
        const replyText = el('p');
        reply.appendChild(replyText);
        logEl.appendChild(reply);
        await typeInto(replyText, sc.answer, 11, id);
        if (id !== run) return;

        if (autoplay) {
            cycleTimer = setTimeout(() => play((index + 1) % SCENARIOS.length, false), 5200);
        }
    }

    // Start only once the showcase is on screen, pause the cycle when it leaves
    let started = false;
    new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !started) {
                started = true;
                play(0, false);
            } else if (!entry.isIntersecting && started && autoplay) {
                clearTimeout(cycleTimer);
                run++;
                started = false;
            }
        });
    }, { threshold: 0.35 }).observe(root);
})();

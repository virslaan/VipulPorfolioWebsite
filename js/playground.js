/* =====================================================
   LIVE INTELLIGENCE PLAYGROUND
   Public Hacker News signals, ranked in the browser by
   a transparent model the visitor can tune. No private
   tracking, no API key, and no invented engagement.
   ===================================================== */

(() => {
    'use strict';

    const root = document.getElementById('playground');
    if (!root) return;

    const form = document.getElementById('signalSearch');
    const queryInput = document.getElementById('signalQuery');
    const resultsEl = document.getElementById('signalResults');
    const statusEl = document.getElementById('signalStatus');
    const refreshEl = document.getElementById('signalRefresh');
    const pinJson = document.getElementById('pinJson');
    const copyButton = document.getElementById('copyPins');
    const downloadButton = document.getElementById('downloadPins');
    const resetButton = document.getElementById('resetWeights');

    const controls = {
        relevance: document.getElementById('relevanceWeight'),
        momentum: document.getElementById('momentumWeight'),
        conversation: document.getElementById('conversationWeight'),
        freshness: document.getElementById('freshnessWeight'),
    };

    const outputs = {
        relevance: document.getElementById('relevanceOut'),
        momentum: document.getElementById('momentumOut'),
        conversation: document.getElementById('conversationOut'),
        freshness: document.getElementById('freshnessOut'),
    };

    const defaults = { relevance: 40, momentum: 25, conversation: 20, freshness: 15 };
    const PIN_KEY = 'vipul-signal-pins-v1';
    const CACHE_KEY = 'vipul-signal-cache-v1';
    const REFRESH_MS = 60000;

    let items = [];
    let ranked = [];
    let pins = readJson(PIN_KEY, []);
    let activeQuery = queryInput.value.trim();
    let abortController = null;
    let secondsToRefresh = REFRESH_MS / 1000;

    function readJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch (_) {
            return fallback;
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (_) {
            // Storage can be unavailable in strict privacy modes; the live feed still works.
        }
    }

    function clamp(value, min = 0, max = 100) {
        return Math.min(max, Math.max(min, value));
    }

    function ageLabel(hours) {
        if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`;
        if (hours < 24) return `${Math.round(hours)}h ago`;
        if (hours < 24 * 30) return `${Math.round(hours / 24)}d ago`;
        return `${Math.round(hours / (24 * 30))}mo ago`;
    }

    function domainFor(item) {
        try {
            return new URL(item.url).hostname.replace(/^www\./, '');
        } catch (_) {
            return 'news.ycombinator.com';
        }
    }

    function getWeights() {
        return Object.fromEntries(
            Object.entries(controls).map(([key, input]) => [key, Number(input.value)])
        );
    }

    function normalizeItems(source, query) {
        const now = Date.now();
        const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
        const prepared = source.map((item) => {
            const title = (item.title || item.story_title || 'Untitled story').trim();
            const url = item.url || item.story_url || `https://news.ycombinator.com/item?id=${item.objectID}`;
            const createdAt = new Date(item.created_at || item.createdAt || item.created_at_i * 1000);
            const ageHours = Math.max(0.05, (now - createdAt.getTime()) / 3600000);
            const points = Math.max(0, Number(item.points) || 0);
            const comments = Math.max(0, Number(item.num_comments) || 0);
            const haystack = `${title} ${item.story_text || ''}`.toLowerCase();
            const matched = terms.filter((term) => haystack.includes(term)).length;

            return {
                id: String(item.objectID || item.id),
                title,
                url,
                source: domainFor({ url }),
                createdAt: createdAt.toISOString(),
                ageHours,
                points,
                comments,
                relevanceRaw: terms.length ? matched / terms.length : 1,
                matched,
                termCount: terms.length,
                velocityRaw: points / Math.pow(ageHours + 2, 0.65),
            };
        });

        const maxVelocity = Math.max(1, ...prepared.map((item) => item.velocityRaw));
        const maxComments = Math.max(1, ...prepared.map((item) => item.comments));

        return prepared.map((item) => ({
            ...item,
            factors: {
                relevance: clamp(item.relevanceRaw * 100),
                momentum: clamp((Math.log1p(item.velocityRaw) / Math.log1p(maxVelocity)) * 100),
                conversation: clamp((Math.log1p(item.comments) / Math.log1p(maxComments)) * 100),
                freshness: clamp(Math.exp(-item.ageHours / 168) * 100),
            },
        }));
    }

    function reasonFor(item, contributions) {
        const strongest = Object.entries(contributions).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (strongest === 'relevance') {
            const coverage = item.termCount ? `${item.matched}/${item.termCount}` : 'full';
            return `<b>Query fit leads.</b> ${coverage} search concepts appear in this story.`;
        }
        if (strongest === 'momentum') {
            return `<b>Momentum leads.</b> ${item.points.toLocaleString()} public votes over ${ageLabel(item.ageHours).replace(' ago', '')}.`;
        }
        if (strongest === 'conversation') {
            return `<b>Conversation leads.</b> ${item.comments.toLocaleString()} public comments signal active attention.`;
        }
        return `<b>Freshness leads.</b> Published ${ageLabel(item.ageHours)}, so recency carries this result.`;
    }

    function scoreItems(source) {
        const weights = getWeights();
        const weightTotal = Math.max(1, Object.values(weights).reduce((sum, value) => sum + value, 0));

        return source.map((item) => {
            const contributions = Object.fromEntries(
                Object.keys(weights).map((key) => [key, item.factors[key] * weights[key]])
            );
            const score = Object.values(contributions).reduce((sum, value) => sum + value, 0) / weightTotal;
            return {
                ...item,
                score: Math.round(score),
                reason: reasonFor(item, contributions),
            };
        }).sort((a, b) => b.score - a.score || b.points - a.points);
    }

    function buildSignalCard(item, index) {
        const article = document.createElement('article');
        article.className = 'signal-card';
        article.style.setProperty('--rank', index);
        article.dataset.id = item.id;

        const score = document.createElement('div');
        score.className = 'signal-score';
        score.style.setProperty('--score', item.score);
        score.textContent = item.score;
        score.setAttribute('aria-label', `Signal score ${item.score} out of 100`);

        const copy = document.createElement('div');
        copy.className = 'signal-copy';

        const source = document.createElement('p');
        source.className = 'signal-source';
        [item.source, ageLabel(item.ageHours), `${item.points} votes`, `${item.comments} comments`].forEach((text) => {
            const span = document.createElement('span');
            span.textContent = text;
            source.appendChild(span);
        });

        const title = document.createElement('h3');
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;
        title.appendChild(link);

        const reason = document.createElement('p');
        reason.className = 'signal-reason';
        // reason is generated only from numeric values and fixed strings above.
        reason.innerHTML = item.reason;

        copy.append(source, title, reason);

        const pin = document.createElement('button');
        const pinned = pins.some((entry) => entry.id === item.id);
        pin.type = 'button';
        pin.className = `pin-button${pinned ? ' is-pinned' : ''}`;
        pin.dataset.pin = item.id;
        pin.setAttribute('aria-label', pinned ? `Unpin ${item.title}` : `Pin ${item.title} as JSON`);
        pin.setAttribute('aria-pressed', String(pinned));

        article.append(score, copy, pin);
        return article;
    }

    function renderResults() {
        ranked = scoreItems(items);
        resultsEl.replaceChildren();

        if (!ranked.length) {
            const empty = document.createElement('p');
            empty.className = 'signal-empty';
            empty.textContent = 'No public stories matched. Try a broader search.';
            resultsEl.appendChild(empty);
            updatePinJson();
            return;
        }

        ranked.slice(0, 8).forEach((item, index) => {
            resultsEl.appendChild(buildSignalCard(item, index));
        });
        updatePinsFromLiveData();
        updatePinJson();
    }

    function updatePinsFromLiveData() {
        const currentById = new Map(ranked.map((item) => [item.id, item]));
        pins = pins.map((pin) => {
            const live = currentById.get(pin.id);
            if (!live) {
                const rescored = scoreItems(normalizeItems([pin], activeQuery))[0];
                return { ...pin, ...rescored, pinnedAt: pin.pinnedAt };
            }
            return { ...pin, ...live, pinnedAt: pin.pinnedAt };
        });
        saveJson(PIN_KEY, pins);
    }

    function exportPayload() {
        const weights = getWeights();
        return {
            query: activeQuery,
            generatedAt: new Date().toISOString(),
            refreshSeconds: REFRESH_MS / 1000,
            algorithm: {
                weights,
                inputs: ['query match', 'public votes per hour', 'public comments', 'publication time'],
            },
            pins: pins.map((pin) => ({
                id: pin.id,
                title: pin.title,
                url: pin.url,
                source: pin.source,
                score: pin.score,
                reason: pin.reason.replace(/<[^>]+>/g, ''),
                metrics: {
                    publicVotes: pin.points,
                    publicComments: pin.comments,
                    ageHours: Number(pin.ageHours.toFixed(2)),
                },
                pinnedAt: pin.pinnedAt,
            })),
        };
    }

    function updatePinJson() {
        pinJson.textContent = JSON.stringify(exportPayload(), null, 2);
    }

    function togglePin(id) {
        const existing = pins.findIndex((item) => item.id === id);
        if (existing >= 0) {
            pins.splice(existing, 1);
        } else {
            const item = ranked.find((entry) => entry.id === id);
            if (item) pins.unshift({ ...item, pinnedAt: new Date().toISOString() });
        }
        saveJson(PIN_KEY, pins);
        renderResults();
    }

    function showLoading() {
        resultsEl.replaceChildren();
        for (let i = 0; i < 4; i += 1) {
            const skeleton = document.createElement('div');
            skeleton.className = 'signal-skeleton';
            resultsEl.appendChild(skeleton);
        }
    }

    async function fetchStories({ quiet = false } = {}) {
        const query = queryInput.value.trim();
        if (!query) {
            queryInput.focus();
            return;
        }

        activeQuery = query;
        secondsToRefresh = REFRESH_MS / 1000;
        if (!quiet) showLoading();
        statusEl.textContent = quiet ? 'Refreshing live signals…' : `Searching “${query}”…`;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const timer = window.setTimeout(() => abortController.abort(), 12000);

        try {
            const endpoint = new URL('https://hn.algolia.com/api/v1/search_by_date');
            endpoint.searchParams.set('query', query);
            endpoint.searchParams.set('tags', 'story');
            endpoint.searchParams.set('hitsPerPage', '60');

            const response = await fetch(endpoint, {
                signal: abortController.signal,
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(`Feed returned ${response.status}`);
            const data = await response.json();

            items = normalizeItems(data.hits || [], query);
            saveJson(CACHE_KEY, { query, savedAt: Date.now(), hits: data.hits || [] });
            renderResults();

            const time = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
            statusEl.textContent = `${items.length} public stories · updated ${time}`;
        } catch (error) {
            if (error.name === 'AbortError' && abortController.signal.aborted) {
                statusEl.textContent = 'The live feed took too long. Showing the last verified snapshot.';
            } else {
                statusEl.textContent = 'Live feed unavailable. Showing the last verified snapshot.';
            }

            const cached = readJson(CACHE_KEY, null);
            if (cached?.hits?.length) {
                items = normalizeItems(cached.hits, query);
                renderResults();
            } else {
                items = [];
                renderResults();
            }
        } finally {
            window.clearTimeout(timer);
        }
    }

    function updateControls() {
        Object.entries(controls).forEach(([key, input]) => {
            const value = Number(input.value);
            outputs[key].textContent = value;
            input.style.setProperty('--fill', `${value}%`);
        });
        if (items.length) renderResults();
        else updatePinJson();
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchStories();
    });

    resultsEl.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pin]');
        if (button) togglePin(button.dataset.pin);
    });

    Object.values(controls).forEach((input) => input.addEventListener('input', updateControls));

    resetButton.addEventListener('click', () => {
        Object.entries(defaults).forEach(([key, value]) => { controls[key].value = value; });
        updateControls();
    });

    copyButton.addEventListener('click', async () => {
        const text = JSON.stringify(exportPayload(), null, 2);
        try {
            await navigator.clipboard.writeText(text);
            copyButton.textContent = 'Copied';
        } catch (_) {
            const area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            copyButton.textContent = 'Copied';
        }
        window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1600);
    });

    downloadButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(exportPayload(), null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `signal-${activeQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brief'}.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 500);
    });

    window.setInterval(() => {
        secondsToRefresh -= 1;
        if (secondsToRefresh <= 0) {
            fetchStories({ quiet: true });
            secondsToRefresh = REFRESH_MS / 1000;
        }
        refreshEl.textContent = `Auto-refresh · ${secondsToRefresh}s`;
    }, 1000);

    updateControls();
    updatePinJson();
    fetchStories();
})();

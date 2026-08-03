/* =====================================================
   SIGNAL
   Portfolio posts plus live research constrained to the
   subjects represented by Vipul's work. Queries outside
   that scope receive an honest Google search handoff.
   ===================================================== */

(() => {
    'use strict';

    const postsEl = document.getElementById('signalPosts');
    const form = document.getElementById('signalSearch');
    const queryInput = document.getElementById('signalQuery');
    const resultsEl = document.getElementById('signalResults');
    const statusEl = document.getElementById('signalStatus');
    if (!postsEl || !form || !queryInput || !resultsEl || !statusEl) return;

    const PORTFOLIO_TERMS = [
        'vipul', 'harihar', 'airia', 'aura', 'gentrust',
        'ai', 'artificial intelligence', 'machine learning', 'llm', 'language model',
        'rag', 'retrieval', 'agent', 'automation', 'model', 'prompt',
        'finance', 'financial', 'investment', 'trading', 'portfolio', 'risk',
        'wealth', 'advisor', 'advisory', 'compliance', 'tax',
        'data', 'pipeline', 'analytics', 'dashboard', 'api', 'cloud',
        'software', 'engineering', 'system', 'platform', 'security',
        'governance', 'mobile', 'python', 'javascript', 'tensorflow',
        'healthcare', 'medical', 'geospatial', 'carbon', 'wind',
        'columbia', 'ibm', 'technology', 'product'
    ];

    let activeQuery = queryInput.value.trim();
    let abortController = null;

    function isPortfolioQuery(query) {
        const normalized = query.toLowerCase();
        return PORTFOLIO_TERMS.some((term) => normalized.includes(term));
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(`${value}T12:00:00Z`));
    }

    function ageLabel(hours) {
        if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`;
        if (hours < 24) return `${Math.round(hours)}h ago`;
        if (hours < 24 * 30) return `${Math.round(hours / 24)}d ago`;
        return `${Math.round(hours / (24 * 30))}mo ago`;
    }

    function sourceDomain(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (_) {
            return 'news.ycombinator.com';
        }
    }

    async function loadPosts() {
        try {
            const response = await fetch('data/signal-posts.json', { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`Posts returned ${response.status}`);
            const posts = await response.json();
            postsEl.replaceChildren(...posts.map(buildPost));
        } catch (_) {
            const error = document.createElement('p');
            error.className = 'signal-post-error';
            error.textContent = 'The posts could not be loaded. Please refresh the page.';
            postsEl.replaceChildren(error);
        }
    }

    function buildPost(post) {
        const article = document.createElement('article');
        article.className = 'signal-post';
        article.id = post.slug;

        const meta = document.createElement('p');
        meta.className = 'signal-post-meta';
        meta.textContent = `${post.label} / ${formatDate(post.date)}`;

        const title = document.createElement('h3');
        title.textContent = post.title;

        const excerpt = document.createElement('p');
        excerpt.className = 'signal-post-excerpt';
        excerpt.textContent = post.excerpt;

        const tags = document.createElement('ul');
        tags.className = 'signal-post-tags';
        post.tags.forEach((tag) => {
            const item = document.createElement('li');
            item.textContent = tag;
            tags.appendChild(item);
        });

        const details = document.createElement('details');
        details.className = 'signal-post-details';
        const summary = document.createElement('summary');
        summary.textContent = 'Read note';
        details.appendChild(summary);
        post.body.forEach((paragraph) => {
            const text = document.createElement('p');
            text.textContent = paragraph;
            details.appendChild(text);
        });

        article.append(meta, title, excerpt, tags, details);
        return article;
    }

    function scoreStories(hits, query) {
        const now = Date.now();
        const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);

        return hits.map((hit) => {
            const title = (hit.title || hit.story_title || 'Untitled story').trim();
            const url = hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
            const ageHours = Math.max(0.1, (now - new Date(hit.created_at).getTime()) / 3600000);
            const points = Math.max(0, Number(hit.points) || 0);
            const comments = Math.max(0, Number(hit.num_comments) || 0);
            const haystack = `${title} ${hit.story_text || ''}`.toLowerCase();
            const matched = terms.filter((term) => haystack.includes(term)).length;
            const relevance = terms.length ? matched / terms.length : 1;
            const momentum = Math.log1p(points / Math.pow(ageHours + 2, 0.55));
            const conversation = Math.log1p(comments);
            const freshness = Math.exp(-ageHours / 240);

            return {
                id: String(hit.objectID),
                title,
                url,
                source: sourceDomain(url),
                points,
                comments,
                ageHours,
                matched,
                termCount: terms.length,
                raw: relevance * 5 + momentum * 0.7 + conversation * 0.32 + freshness,
            };
        }).sort((a, b) => b.raw - a.raw).slice(0, 8).map((item, index, list) => {
            const max = Math.max(1, list[0]?.raw || 1);
            return { ...item, score: Math.round(55 + (item.raw / max) * 44 - index * 0.6) };
        });
    }

    function storyReason(item) {
        if (item.matched === item.termCount && item.termCount > 0) {
            return `Direct query match with ${item.points} public votes and ${item.comments} comments.`;
        }
        if (item.comments > item.points * 0.4) {
            return `Active discussion: ${item.comments} public comments around this story.`;
        }
        return `${item.points} public votes, published ${ageLabel(item.ageHours)}.`;
    }

    function buildStory(item) {
        const article = document.createElement('article');
        article.className = 'signal-card';

        const score = document.createElement('div');
        score.className = 'signal-score';
        score.style.setProperty('--score', Math.min(100, item.score));
        score.textContent = Math.min(100, item.score);
        score.setAttribute('aria-label', `Portfolio relevance score ${item.score} out of 100`);

        const copy = document.createElement('div');
        copy.className = 'signal-copy';

        const source = document.createElement('p');
        source.className = 'signal-source';
        [item.source, ageLabel(item.ageHours), `${item.points} votes`, `${item.comments} comments`].forEach((value) => {
            const span = document.createElement('span');
            span.textContent = value;
            source.appendChild(span);
        });

        const heading = document.createElement('h3');
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;
        heading.appendChild(link);

        const reason = document.createElement('p');
        reason.className = 'signal-reason';
        reason.textContent = storyReason(item);

        copy.append(source, heading, reason);
        article.append(score, copy);
        return article;
    }

    function showLoading() {
        resultsEl.replaceChildren();
        for (let index = 0; index < 3; index += 1) {
            const skeleton = document.createElement('div');
            skeleton.className = 'signal-skeleton';
            resultsEl.appendChild(skeleton);
        }
    }

    function showGoogleHandoff(query, unavailable = false) {
        const card = document.createElement('article');
        card.className = 'google-handoff';

        const label = document.createElement('p');
        label.className = 'mini-label';
        label.textContent = unavailable ? 'Live source unavailable' : 'Outside this portfolio';

        const title = document.createElement('h3');
        title.textContent = unavailable
            ? 'Continue this search on Google.'
            : `“${query}” is not represented by Vipul’s work.`;

        const text = document.createElement('p');
        text.textContent = 'Rather than manufacture a portfolio answer, open the full web search.';

        const link = document.createElement('a');
        link.className = 'google-search-link';
        link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `Search Google for “${query}”`;

        card.append(label, title, text, link);
        resultsEl.replaceChildren(card);
        statusEl.textContent = 'Portfolio boundary reached';
    }

    async function search(query = queryInput.value.trim()) {
        if (!query) {
            queryInput.focus();
            return;
        }

        activeQuery = query;
        queryInput.value = query;

        if (!isPortfolioQuery(query)) {
            if (abortController) abortController.abort();
            showGoogleHandoff(query);
            return;
        }

        showLoading();
        statusEl.textContent = `Researching “${query}”…`;
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const timer = window.setTimeout(() => abortController.abort(), 12000);

        try {
            const endpoint = new URL('https://hn.algolia.com/api/v1/search');
            endpoint.searchParams.set('query', query);
            endpoint.searchParams.set('tags', 'story');
            endpoint.searchParams.set('hitsPerPage', '50');

            const response = await fetch(endpoint, {
                signal: abortController.signal,
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(`Research source returned ${response.status}`);
            const payload = await response.json();
            const stories = scoreStories(payload.hits || [], query);

            if (!stories.length) {
                showGoogleHandoff(query);
                return;
            }

            resultsEl.replaceChildren(...stories.map(buildStory));
            const time = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
            statusEl.textContent = `${stories.length} relevant public stories / updated ${time}`;
        } catch (_) {
            showGoogleHandoff(query, true);
        } finally {
            window.clearTimeout(timer);
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        search();
    });

    document.querySelectorAll('[data-signal-topic]').forEach((button) => {
        button.addEventListener('click', () => {
            const query = button.dataset.signalTopic;
            search(query);
            document.getElementById('playground').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    loadPosts();
    search(activeQuery);
})();

/**
 * AI Portfolio Generation — Granular Multi-Agent Real DOM Builder
 *
 * Flow:
 * 1. Minimal 1-Pill Splash Screen typing "Create me a portfolio" + circular Send button.
 * 2. Scans the REAL portfolio DOM (.container) recursively into ~300 individual visual layers
 *    (cards/boxes -> media canvases -> images -> buttons -> badges/tags -> icons -> text).
 *    No duplicate mockup HTML is created.
 * 3. 18 concurrent Figma AI agents work together in parallel:
 *    - Parent boxes/cards/buttons/tags are drawn first with '+' crosshair & live W × H dimensions,
 *      materializing INSTANTLY as empty shells at 0ms post-drag delay.
 *    - Free agents pre-position around active boxes and immediately swarm inside to place images,
 *      drop SVG icons, drag inner buttons/tags, and live-type every heading, paragraph & label
 *      with 'I'-beam cursors and zero layout reflow.
 *    - Smooth 60fps camera auto-scroll ("Touring") follows the build frontier from top to bottom,
 *      then glides smoothly back to top and restores a 100% clean native DOM.
 */

(function () {
    'use strict';

    const PROMPT_TEXT = 'Create me a portfolio';
    const AGENT_COUNT = 18;

    const AGENT_COLORS = [
        '#0d99ff', '#1bc47d', '#f24822', '#a259ff', '#ffc700', '#00c4cc',
        '#ff5c8a', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#8b5cf6',
        '#06b6d4', '#ef4444', '#84cc16', '#6366f1', '#14b8a6', '#eab308'
    ];

    const BOX_SELECTORS = [
        '.project-card',
        '.bento-card',
        '.bento-hero-canvas',
        '.bento-uiux-canvas',
        '.bento-video-canvas',
        '.bento-media-wrap',
        '.bento-palette-preview',
        '.timeline-dot',
        '.bento-color-dot'
    ].join(',');

    const BUTTON_SELECTORS = [
        '.btn-resume',
        '.btn-header-link',
        '.btn-view-project',
        '.btn-store',
        '.contact-link-card',
        '.bento-play-circle'
    ].join(',');

    const TAG_SELECTORS = [
        '.badge',
        '.timeline-date',
        '.tech-tag',
        '.mini-tag',
        '.section-badge',
        '.bento-category-tag',
        '.bento-media-tag',
        '.bento-badge-chip'
    ].join(',');

    const TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'span']);

    const TYPE_PRIORITY = {
        line: 0,
        box: 1,
        image: 2,
        button: 2,
        tag: 3,
        icon: 4,
        text: 4
    };

    class AIPortfolioBuilder {
        constructor() {
            this.layers = [];
            this.agents = [];
            this.wrappedSpans = [];

            this.speed = 1;
            this.isRunning = false;
            this.phase = 'idle'; // 'prompt' | 'touring' | 'returning' | 'done'
            this.builtCount = 0;

            this.rafId = null;
            this.typingTimer = null;
            this.guideTimer = null;
            this.lastFrameTime = 0;
            this.scrollY = 0;
            this.returnStartScrollY = 0;
            this.returnElapsed = 0;

            this.promptOverlay = null;
            this.promptTextEl = null;
            this.sendBtn = null;
            this.liveStage = null;
            this.workLayer = null;
            this.cursorsLayer = null;
            this.dockLayersEl = null;
            this.dockFillEl = null;
            this.dockModeEl = null;
            this.dockSpeedBtn = null;
            this.dockCloseBtn = null;
            this.guideH = null;
            this.guideV = null;
            this.replayPill = null;

            this.boundBlockWheel = this.handleWheelLock.bind(this);
            this.boundKeyDown = this.handleKeyDown.bind(this);

            this.init();
        }

        init() {
            this.buildOverlayUI();
            this.bindEvents();
            this.startSequence();
        }

        /* ==================================================================
           Overlay UI Construction (Minimal 1-Pill Splash + Figma Stage + Dock)
           ================================================================== */
        buildOverlayUI() {
            // 1. Minimal 1-Pill Splash Screen
            const promptOverlay = document.createElement('div');
            promptOverlay.className = 'ai-prompt-overlay';
            promptOverlay.id = 'ai-prompt-overlay';
            promptOverlay.innerHTML = `
                <div class="ai-prompt-pill" id="ai-prompt-pill">
                    <div class="ai-prompt-input-wrap">
                        <span class="ai-prompt-text" id="ai-prompt-text"></span>
                        <span class="ai-typing-cursor"></span>
                    </div>
                    <button class="ai-prompt-send-btn" id="ai-btn-send" aria-label="Send prompt">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(promptOverlay);

            // 2. Live Figma Stage Overlay
            const liveStage = document.createElement('div');
            liveStage.className = 'ai-live-stage';
            liveStage.id = 'ai-live-stage';

            let rulerTopHTML = '';
            for (let x = 0; x <= 2600; x += 100) {
                rulerTopHTML += `<div class="ai-ruler-tick-h">${x}</div>`;
            }
            let rulerLeftHTML = '';
            for (let y = 0; y <= 2400; y += 100) {
                rulerLeftHTML += `<div class="ai-ruler-tick-v">${y}</div>`;
            }

            const dotColors = ['#0d99ff', '#1bc47d', '#f24822', '#a259ff', '#ffc700'];
            const dotsHTML = dotColors
                .map((c) => `<span class="ai-dock-dot" style="background:${c}"></span>`)
                .join('');

            liveStage.innerHTML = `
                <div class="ai-ruler-corner"></div>
                <div class="ai-ruler-top">${rulerTopHTML}</div>
                <div class="ai-ruler-left">${rulerLeftHTML}</div>

                <div class="ai-smart-guide-h" id="ai-smart-guide-h"></div>
                <div class="ai-smart-guide-v" id="ai-smart-guide-v"></div>

                <div class="ai-work-layer" id="ai-work-layer"></div>
                <div class="ai-cursors-layer" id="ai-cursors-layer"></div>

                <div class="ai-dock" id="ai-dock">
                    <div class="ai-dock-dots">${dotsHTML}</div>
                    <span class="ai-dock-agents">${AGENT_COUNT} agents</span>
                    <span class="ai-dock-sep">·</span>
                    <span class="ai-dock-layers" id="ai-dock-layers">0 / 0 layers</span>
                    <div class="ai-dock-track">
                        <div class="ai-dock-fill" id="ai-dock-fill"></div>
                    </div>
                    <span class="ai-dock-mode" id="ai-dock-mode">Touring</span>
                    <button class="ai-dock-btn" id="ai-dock-speed" type="button" title="Toggle build speed">1x</button>
                    <button class="ai-dock-btn ai-dock-close" id="ai-dock-close" type="button" aria-label="Skip build animation" title="Skip (Esc)">×</button>
                </div>
            `;
            document.body.appendChild(liveStage);

            // 3. Post-Build Replay Pill
            const replayPill = document.createElement('button');
            replayPill.className = 'ai-replay-pill';
            replayPill.id = 'ai-replay-pill';
            replayPill.type = 'button';
            replayPill.innerHTML = `
                <span class="ai-replay-dot"></span>
                <span>Replay AI Build</span>
            `;
            document.body.appendChild(replayPill);

            // Cache DOM refs
            this.promptOverlay = promptOverlay;
            this.promptTextEl = promptOverlay.querySelector('#ai-prompt-text');
            this.sendBtn = promptOverlay.querySelector('#ai-btn-send');
            this.liveStage = liveStage;
            this.workLayer = liveStage.querySelector('#ai-work-layer');
            this.cursorsLayer = liveStage.querySelector('#ai-cursors-layer');
            this.dockLayersEl = liveStage.querySelector('#ai-dock-layers');
            this.dockFillEl = liveStage.querySelector('#ai-dock-fill');
            this.dockModeEl = liveStage.querySelector('#ai-dock-mode');
            this.dockSpeedBtn = liveStage.querySelector('#ai-dock-speed');
            this.dockCloseBtn = liveStage.querySelector('#ai-dock-close');
            this.guideH = liveStage.querySelector('#ai-smart-guide-h');
            this.guideV = liveStage.querySelector('#ai-smart-guide-v');
            this.replayPill = replayPill;

            this.createAgentCursors();
        }

        createAgentCursors() {
            this.agents = [];
            this.cursorsLayer.innerHTML = '';

            for (let i = 0; i < AGENT_COUNT; i++) {
                const color = AGENT_COLORS[i % AGENT_COLORS.length];
                const selColor = i % 4 === 2 ? '#f24822' : (i % 5 === 3 ? '#a259ff' : '#0d99ff');

                const el = document.createElement('div');
                el.className = 'ai-cursor';
                el.setAttribute('data-tool', 'pointer');
                el.innerHTML = `
                    <svg class="tool-icon tool-pointer" viewBox="0 0 24 24" fill="none">
                        <path d="M4.5 2.5L19.5 11.2L12.1 13.1L8.8 20.2L4.5 2.5Z"
                            fill="${color}" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>
                    </svg>
                    <svg class="tool-icon tool-crosshair" viewBox="0 0 16 16" fill="none">
                        <line x1="8" y1="1" x2="8" y2="15" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
                        <line x1="1" y1="8" x2="15" y2="8" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
                        <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
                        <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                    <svg class="tool-icon tool-ibeam" viewBox="0 0 14 18" fill="none">
                        <path d="M4 2H10M7 2V16M4 16H10" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M4 2H10M7 2V16M4 16H10" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                `;
                this.cursorsLayer.appendChild(el);

                this.agents.push({
                    index: i,
                    color,
                    selColor,
                    el,
                    x: 0,
                    y: 0,
                    startX: 0,
                    startY: 0,
                    phase: 'idle', // 'idle' | 'flying' | 'working'
                    layer: null,
                    preTarget: null,
                    selBox: null,
                    dimPill: null,
                    visSpan: null,
                    caretSpan: null,
                    ghostSpan: null,
                    lastCharCount: -1,
                    elapsed: 0,
                    flyDuration: 120,
                    workDuration: 220
                });
            }
        }

        bindEvents() {
            this.sendBtn.addEventListener('click', () => {
                if (this.phase === 'prompt') {
                    this.submitPrompt();
                }
            });

            this.dockSpeedBtn.addEventListener('click', () => {
                if (this.speed === 1) this.speed = 2;
                else if (this.speed === 2) this.speed = 4;
                else if (this.speed === 4) this.speed = 0.5;
                else this.speed = 1;
                this.dockSpeedBtn.textContent = `${this.speed}x`;
            });

            this.dockCloseBtn.addEventListener('click', () => {
                this.skipAndFinish();
            });

            this.replayPill.addEventListener('click', () => {
                this.startSequence();
            });

            window.addEventListener('keydown', this.boundKeyDown);
        }

        handleKeyDown(e) {
            if (!this.isRunning) return;
            if (e.key === 'Enter' && this.phase === 'prompt') {
                e.preventDefault();
                this.submitPrompt();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.skipAndFinish();
            }
        }

        handleWheelLock(e) {
            if (this.isRunning && (this.phase === 'touring' || this.phase === 'returning')) {
                e.preventDefault();
            }
        }

        /* ==================================================================
           Phase 1: Splash Prompt Sequence ("Create me a portfolio")
           ================================================================== */
        startSequence() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            if (this.typingTimer) clearTimeout(this.typingTimer);
            this.cleanupActiveVisuals();
            this.unwrapAllTemporarySpans();

            this.isRunning = true;
            this.phase = 'prompt';
            this.builtCount = 0;

            // Reset scroll to top before scanning DOM
            window.scrollTo(0, 0);
            this.scrollY = 0;

            // Scan & hide every visual object in .container
            document.body.classList.remove('ai-completed');
            document.body.classList.add('ai-building');
            this.scanPortfolioDOM();

            // Show splash overlay, lock scroll during prompt
            document.body.style.overflow = 'hidden';
            this.replayPill.classList.remove('visible');
            this.liveStage.classList.remove('active');
            this.promptOverlay.classList.remove('hidden');
            this.sendBtn.classList.remove('sending');
            this.promptTextEl.textContent = '';

            this.updateDockUI();

            // Type "Create me a portfolio" at brisk pace then auto-send
            let idx = 0;
            const typeStep = () => {
                if (!this.isRunning || this.phase !== 'prompt') return;
                if (idx < PROMPT_TEXT.length) {
                    this.promptTextEl.textContent += PROMPT_TEXT.charAt(idx);
                    idx++;
                    this.typingTimer = setTimeout(typeStep, 34 + Math.random() * 18);
                } else {
                    this.typingTimer = setTimeout(() => {
                        if (this.isRunning && this.phase === 'prompt') {
                            this.submitPrompt();
                        }
                    }, 380);
                }
            };
            this.typingTimer = setTimeout(typeStep, 240);
        }

        submitPrompt() {
            if (this.typingTimer) clearTimeout(this.typingTimer);
            this.promptTextEl.textContent = PROMPT_TEXT;
            this.sendBtn.classList.add('sending');

            this.typingTimer = setTimeout(() => {
                if (!this.isRunning) return;
                this.promptOverlay.classList.add('hidden');
                this.beginMultiAgentTour();
            }, 250);
        }

        /* ==================================================================
           Recursive Real DOM Scanner (Containers -> Inner Buttons/Tags/Text)
           ================================================================== */
        wrapDirectTextNodes(el, trimText) {
            const childNodes = Array.from(el.childNodes);
            for (const node of childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 0) {
                    const span = document.createElement('span');
                    span.className = 'ai-inner-text';
                    span.dataset.aiWrapped = '1';
                    span._aiOriginalNodeText = node.nodeValue;
                    span.textContent = trimText ? node.nodeValue.trim() : node.nodeValue;
                    el.replaceChild(span, node);
                    this.wrappedSpans.push(span);
                }
            }
        }

        unwrapAllTemporarySpans() {
            for (const span of this.wrappedSpans) {
                if (span && span.parentNode) {
                    const parent = span.parentNode;
                    const rawText = span._aiOriginalNodeText !== undefined
                        ? span._aiOriginalNodeText
                        : span.textContent;
                    parent.replaceChild(document.createTextNode(rawText), span);
                    parent.normalize();
                }
            }
            this.wrappedSpans = [];
        }

        scanPortfolioDOM() {
            this.layers = [];
            const container = document.querySelector('.container');
            if (!container) return;

            let nextId = 0;

            const addLayer = (el, type, parent, sectionIdx, extra = {}) => {
                const rect = el.getBoundingClientRect();
                const layer = {
                    id: nextId++,
                    el,
                    type,
                    parent,
                    depth: parent ? parent.depth + 1 : 0,
                    sectionIdx,
                    docTop: rect.top + window.scrollY,
                    docLeft: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                    originalText: type === 'text' ? el.textContent : null,
                    lineAxis: extra.lineAxis || null,
                    assigned: false,
                    built: false,
                    preTargetedBy: null
                };
                el.classList.remove('ai-layer-built');
                el.classList.add('ai-layer-hidden');
                this.layers.push(layer);
                return layer;
            };

            const walk = (el, parentLayer, sectionIdx) => {
                if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

                const tag = el.tagName.toLowerCase();

                // Track top-level portfolio sections in visual order
                if (tag === 'header') sectionIdx = 0;
                else if (el.id === 'about') sectionIdx = 1;
                else if (el.id === 'experience') sectionIdx = 2;
                else if (el.id === 'tech-stack') sectionIdx = 3;
                else if (el.classList.contains('projects-section')) sectionIdx = 4;
                else if (el.id === 'graphic-design') sectionIdx = 5;
                else if (el.id === 'contact') sectionIdx = 6;

                // 1. Atomic theme toggle button (keep internal sun/moon SVG theme opacity untouched)
                if (el.id === 'theme-toggle') {
                    addLayer(el, 'button', parentLayer, sectionIdx);
                    return;
                }

                // 2. Atomic SVG graphics / icons (never recurse into SVG path/rect/text internals)
                if (tag === 'svg') {
                    const svgType = el.classList.contains('glot-logo-svg') ? 'image' : 'icon';
                    addLayer(el, svgType, parentLayer, sectionIdx);
                    return;
                }

                // 3. Atomic Images
                if (tag === 'img') {
                    addLayer(el, 'image', parentLayer, sectionIdx);
                    return;
                }

                // 4. Divider / Rail Line Containers (.timeline vertical rail, .contact-section top border)
                if (el.classList.contains('timeline')) {
                    const lineLayer = addLayer(el, 'line', parentLayer, sectionIdx, { lineAxis: 'vertical' });
                    Array.from(el.children).forEach((c) => walk(c, lineLayer, sectionIdx));
                    return;
                }
                if (el.classList.contains('contact-section')) {
                    const lineLayer = addLayer(el, 'line', parentLayer, sectionIdx, { lineAxis: 'horizontal' });
                    Array.from(el.children).forEach((c) => walk(c, lineLayer, sectionIdx));
                    return;
                }

                // 5. Card Shells, Media Canvases, Palette Strip & Dots
                if (el.matches(BOX_SELECTORS)) {
                    const boxLayer = addLayer(el, 'box', parentLayer, sectionIdx);
                    Array.from(el.children).forEach((c) => walk(c, boxLayer, sectionIdx));
                    return;
                }

                // 6. Interactive Buttons & Link Cards (build button box first, then icon & text inside!)
                if (el.matches(BUTTON_SELECTORS)) {
                    this.wrapDirectTextNodes(el, true);
                    const btnLayer = addLayer(el, 'button', parentLayer, sectionIdx);
                    Array.from(el.children).forEach((c) => walk(c, btnLayer, sectionIdx));
                    return;
                }

                // 7. Pill Badges, Tech Tags & Category Chips (build pill box first, then text/icon inside!)
                if (el.matches(TAG_SELECTORS)) {
                    this.wrapDirectTextNodes(el, true);
                    const tagLayer = addLayer(el, 'tag', parentLayer, sectionIdx);
                    Array.from(el.children).forEach((c) => walk(c, tagLayer, sectionIdx));
                    return;
                }

                // 8. Typography / Text Nodes (h1-h4, p, span)
                if (TEXT_TAGS.has(tag)) {
                    if (el.children.length === 0) {
                        if (el.textContent && el.textContent.trim().length > 0) {
                            addLayer(el, 'text', parentLayer, sectionIdx);
                        }
                        return;
                    } else {
                        // Mixed inline text container (e.g. .timeline-role + .timeline-company)
                        this.wrapDirectTextNodes(el, false);
                        Array.from(el.children).forEach((c) => walk(c, parentLayer, sectionIdx));
                        return;
                    }
                }

                // 9. Transparent layout wrappers: recurse without adding a ghost layer
                Array.from(el.children).forEach((c) => walk(c, parentLayer, sectionIdx));
            };

            walk(container, null, 0);
        }

        /* ==================================================================
           Phase 2: 18-Agent Concurrent Build Engine & Smooth Auto-Scroll
           ================================================================== */
        beginMultiAgentTour() {
            this.phase = 'touring';
            document.body.style.overflow = '';
            window.scrollTo(0, 0);
            this.scrollY = 0;

            window.addEventListener('wheel', this.boundBlockWheel, { passive: false });
            window.addEventListener('touchmove', this.boundBlockWheel, { passive: false });

            // Refresh exact document coordinates right before agents launch
            for (const l of this.layers) {
                const r = l.el.getBoundingClientRect();
                l.docTop = r.top + window.scrollY;
                l.docLeft = r.left + window.scrollX;
                l.width = r.width;
                l.height = r.height;
            }

            // Spawn all 18 cursors distributed gracefully around the viewport edges/center
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            this.agents.forEach((agent, i) => {
                const angle = (i / AGENT_COUNT) * Math.PI * 2;
                const rx = vw * 0.36;
                const ry = vh * 0.34;
                agent.x = vw * 0.5 + Math.cos(angle) * rx;
                agent.y = vh * 0.42 + Math.sin(angle) * ry;
                agent.phase = 'idle';
                agent.layer = null;
                agent.preTarget = null;
                this.setCursorTool(agent, 'pointer');
                this.renderCursorPos(agent);
                agent.el.classList.remove('resting');
                agent.el.classList.add('visible');
            });

            this.dockModeEl.textContent = 'Touring';
            this.updateDockUI();
            this.liveStage.classList.add('active');

            this.lastFrameTime = performance.now();
            this.rafId = requestAnimationFrame((now) => this.tick(now));
        }

        tick(now) {
            if (!this.isRunning) return;

            const rawDt = Math.min(48, Math.max(1, now - this.lastFrameTime));
            this.lastFrameTime = now;
            const dt = rawDt * this.speed;

            if (this.phase === 'touring') {
                this.updateCameraScroll(dt);
                this.updateAgents(dt);

                if (this.builtCount >= this.layers.length) {
                    this.beginReturnToTop();
                }
            } else if (this.phase === 'returning') {
                this.updateReturnToTop(dt);
            }

            if (this.isRunning) {
                this.rafId = requestAnimationFrame((nextNow) => this.tick(nextNow));
            }
        }

        getLiveDocTop(layer) {
            return layer.el.getBoundingClientRect().top + window.scrollY;
        }

        updateCameraScroll(dt) {
            let minReadyDocTop = Infinity;
            for (const l of this.layers) {
                if (!l.built && (!l.parent || l.parent.built)) {
                    const top = this.getLiveDocTop(l);
                    if (top < minReadyDocTop) minReadyDocTop = top;
                }
            }

            if (!Number.isFinite(minReadyDocTop)) return;

            const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const desiredY = Math.max(0, Math.min(maxScrollY, minReadyDocTop - window.innerHeight * 0.22));

            const diff = desiredY - this.scrollY;
            if (Math.abs(diff) > 0.4) {
                const alpha = 1 - Math.exp(-0.0056 * dt);
                this.scrollY += diff * alpha;
            } else {
                this.scrollY = desiredY;
            }

            window.scrollTo(0, this.scrollY);
            this.minReadyDocTop = minReadyDocTop;
            this.maxScrollY = maxScrollY;
        }

        pickNextLayerForAgent(agent) {
            const vh = window.innerHeight;
            const atBottom = this.scrollY >= (this.maxScrollY || 0) - 14;
            const viewportCutoff = atBottom ? Infinity : (this.scrollY + vh - 82);
            const frontierCutoff = (this.minReadyDocTop || 0) + Math.min(480, vh * 0.52);
            const maxAllowedDocTop = Math.min(viewportCutoff, frontierCutoff);

            let bestLayer = null;
            let bestScore = Infinity;

            for (const l of this.layers) {
                if (l.built || l.assigned) continue;
                if (l.parent && !l.parent.built) continue;

                const docTop = this.getLiveDocTop(l);
                if (docTop > maxAllowedDocTop) continue;

                const rect = l.el.getBoundingClientRect();
                const dist = Math.hypot(rect.left - agent.x, rect.top - agent.y);
                const typeRank = TYPE_PRIORITY[l.type] ?? 3;

                // Prioritize earlier sections, top-down flow, parent containers/buttons before leaves,
                // and nearby elements so collaborating agents naturally cluster inside the same card!
                const score =
                    l.sectionIdx * 2400 +
                    docTop * 1.15 +
                    typeRank * 95 +
                    dist * 0.14;

                if (score < bestScore) {
                    bestScore = score;
                    bestLayer = l;
                }
            }

            return bestLayer;
        }

        pickUpcomingPreTarget(agent) {
            // If a parent container (e.g. a .project-card or .bento-card) is currently being dragged,
            // idle helper agents fly inside it ahead of time so the moment the box snaps in,
            // the whole team is already inside ready to build its buttons, tags, icon & text!
            for (const l of this.layers) {
                if (l.built || l.assigned) continue;
                if (l.preTargetedBy && l.preTargetedBy !== agent) continue;
                if (l.parent && l.parent.assigned && !l.parent.built) {
                    return l;
                }
            }
            // Otherwise hover toward the next ready/upcoming unbuilt element near the frontier
            for (const l of this.layers) {
                if (!l.built && !l.assigned && (!l.preTargetedBy || l.preTargetedBy === agent)) {
                    return l;
                }
            }
            return null;
        }

        computeWorkDuration(layer, rect) {
            const area = Math.max(1, rect.width * rect.height);
            switch (layer.type) {
                case 'box':
                    return area > 40000 ? 520 : (area > 5000 ? 390 : 230);
                case 'image':
                    return area > 20000 ? 480 : 320;
                case 'button':
                    return rect.width > 120 ? 360 : 280;
                case 'tag':
                    return 220;
                case 'icon':
                    return 185;
                case 'line':
                    return 350;
                case 'text': {
                    const len = (layer.originalText || '').length;
                    if (len > 90) return 660;
                    if (len > 35) return 450;
                    if (len > 14) return 310;
                    return 220;
                }
                default:
                    return 300;
            }
        }

        assignLayerToAgent(agent, layer) {
            if (agent.preTarget) {
                agent.preTarget.preTargetedBy = null;
                agent.preTarget = null;
            }
            if (layer.preTargetedBy) {
                layer.preTargetedBy = null;
            }

            layer.assigned = true;
            agent.layer = layer;
            agent.phase = 'flying';
            agent.elapsed = 0;
            agent.startX = agent.x;
            agent.startY = agent.y;
            agent.el.classList.remove('resting');
            this.setCursorTool(agent, 'pointer');

            const rect = layer.el.getBoundingClientRect();
            const dist = Math.hypot(rect.left - agent.x, rect.top - agent.y);
            agent.flyDuration = Math.max(140, Math.min(310, 110 + dist * 0.44));
            agent.workDuration = this.computeWorkDuration(layer, rect);
        }

        beginWorkingOnLayer(agent) {
            const layer = agent.layer;
            if (!layer) return;

            agent.phase = 'working';
            agent.elapsed = 0;
            agent.lastCharCount = -1;

            const rect = layer.el.getBoundingClientRect();

            // Create Figma selection box overlay
            const selBox = document.createElement('div');
            const compact = rect.width < 46 || rect.height < 26;
            selBox.className = `ai-selection-box is-${layer.type}${compact ? ' compact-handles' : ''}`;
            selBox.style.setProperty('--sel-color', agent.selColor);

            let innerHTML = `
                <div class="ai-handle tl"></div>
                <div class="ai-handle tr"></div>
                <div class="ai-handle bl"></div>
                <div class="ai-handle br"></div>
            `;

            if (layer.type === 'image' && rect.width >= 40 && rect.height >= 40) {
                innerHTML += `
                    <svg class="ai-img-placeholder-icon" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                `;
            }

            const showDimPill =
                layer.type === 'line' ||
                (layer.type === 'text' && rect.width >= 85 && rect.height >= 24) ||
                (layer.type !== 'text' && rect.width >= 44 && rect.height >= 20);

            if (showDimPill) {
                innerHTML += `<div class="ai-dim-pill">0 × 0</div>`;
            }

            selBox.innerHTML = innerHTML;
            this.workLayer.appendChild(selBox);

            agent.selBox = selBox;
            agent.dimPill = showDimPill ? selBox.querySelector('.ai-dim-pill') : null;

            if (layer.type === 'text') {
                this.setCursorTool(agent, 'ibeam');

                // Zero-reflow character streaming setup:
                // Full string remains in layout flow (visible slice + 0px caret + transparent ghost slice)
                const fullText = layer.originalText || '';
                const visSpan = document.createElement('span');
                visSpan.className = 'ai-typed-visible';
                visSpan.textContent = '';

                const caretSpan = document.createElement('span');
                caretSpan.className = 'ai-typed-caret';

                const ghostSpan = document.createElement('span');
                ghostSpan.className = 'ai-typed-ghost';
                ghostSpan.textContent = fullText;

                layer.el.textContent = '';
                layer.el.append(visSpan, caretSpan, ghostSpan);
                layer.el.classList.remove('ai-layer-hidden');
                layer.el.classList.add('ai-layer-built');

                agent.visSpan = visSpan;
                agent.caretSpan = caretSpan;
                agent.ghostSpan = ghostSpan;
            } else {
                this.setCursorTool(agent, 'crosshair');
            }

            // Flash subtle Figma alignment guide on major cards & buttons
            if (layer.type === 'box' || layer.type === 'button') {
                this.flashSmartGuides(rect.left, rect.top);
            }
        }

        updateAgents(dt) {
            for (const agent of this.agents) {
                // 1. Idle agent: grab next ready layer or pre-fly to assist inside an active container
                if (agent.phase === 'idle') {
                    const nextLayer = this.pickNextLayerForAgent(agent);
                    if (nextLayer) {
                        this.assignLayerToAgent(agent, nextLayer);
                    } else {
                        const upcoming = this.pickUpcomingPreTarget(agent);
                        if (upcoming) {
                            agent.preTarget = upcoming;
                            upcoming.preTargetedBy = agent;
                            const r = upcoming.el.getBoundingClientRect();
                            const tx = Math.max(24, Math.min(window.innerWidth - 24, r.left + 6));
                            const ty = Math.max(24, Math.min(window.innerHeight - 90, r.top + 6));
                            const lerp = 1 - Math.exp(-0.007 * dt);
                            agent.x += (tx - agent.x) * lerp;
                            agent.y += (ty - agent.y) * lerp;
                            agent.el.classList.remove('resting');
                            this.renderCursorPos(agent);
                        } else {
                            agent.el.classList.add('resting');
                        }
                        continue;
                    }
                }

                // 2. Flying toward layer start coordinate
                if (agent.phase === 'flying') {
                    agent.elapsed += dt;
                    const p = Math.min(1, agent.elapsed / agent.flyDuration);
                    const ease = p < 0.5
                        ? 4 * p * p * p
                        : 1 - Math.pow(-2 * p + 2, 3) / 2;

                    const rect = agent.layer.el.getBoundingClientRect();
                    const targetX = rect.left;
                    const targetY = agent.layer.type === 'text'
                        ? rect.top + Math.min(12, rect.height * 0.5)
                        : rect.top;

                    agent.x = agent.startX + (targetX - agent.startX) * ease;
                    agent.y = agent.startY + (targetY - agent.startY) * ease;
                    this.renderCursorPos(agent);

                    if (p >= 1) {
                        this.beginWorkingOnLayer(agent);
                    }
                    continue;
                }

                // 3. Actively constructing the layer (Drag-to-Create OR Live Text Streaming)
                if (agent.phase === 'working') {
                    agent.elapsed += dt;
                    const p = Math.min(1, agent.elapsed / agent.workDuration);
                    const layer = agent.layer;
                    const rect = layer.el.getBoundingClientRect();

                    if (layer.type === 'text') {
                        const fullText = layer.originalText || '';
                        const totalChars = fullText.length;
                        const count = Math.max(1, Math.ceil(totalChars * p));

                        if (count !== agent.lastCharCount && agent.visSpan && agent.ghostSpan) {
                            agent.lastCharCount = count;
                            agent.visSpan.textContent = fullText.slice(0, count);
                            agent.ghostSpan.textContent = fullText.slice(count);
                        }

                        if (agent.selBox) {
                            const bx = rect.left - 2;
                            const by = rect.top - 1;
                            const bw = Math.max(8, rect.width + 4);
                            const bh = Math.max(12, rect.height + 2);
                            agent.selBox.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
                            agent.selBox.style.width = `${bw}px`;
                            agent.selBox.style.height = `${bh}px`;
                            if (agent.dimPill) {
                                agent.dimPill.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
                            }
                        }

                        if (agent.caretSpan) {
                            const cr = agent.caretSpan.getBoundingClientRect();
                            agent.x = cr.left;
                            agent.y = cr.top + 8;
                        } else {
                            agent.x = rect.left + rect.width * p;
                            agent.y = rect.bottom;
                        }
                        this.renderCursorPos(agent);
                    } else {
                        // Box / Button / Tag / Image / Icon / Line Drag-to-Create
                        const ease = p < 0.5
                            ? 2 * p * p
                            : 1 - Math.pow(-2 * p + 2, 2) / 2;
                        let fullW = rect.width;
                        let fullH = rect.height;

                        if (layer.type === 'line') {
                            if (layer.lineAxis === 'vertical') {
                                fullW = 16;
                            } else {
                                fullH = 3;
                            }
                        }

                        const curW = Math.max(2, fullW * ease);
                        const curH = Math.max(2, fullH * ease);

                        if (agent.selBox) {
                            agent.selBox.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
                            agent.selBox.style.width = `${curW}px`;
                            agent.selBox.style.height = `${curH}px`;
                            if (agent.dimPill) {
                                agent.dimPill.textContent = `${Math.round(curW)} × ${Math.round(curH)}`;
                            }
                        }

                        // Pixel-locked to bottom-right drag handle (0ms lag!)
                        agent.x = rect.left + curW;
                        agent.y = rect.top + curH;
                        this.renderCursorPos(agent);
                    }

                    // Instant materialization at p === 1 (zero delay!)
                    if (p >= 1) {
                        this.completeAgentLayer(agent);
                    }
                }
            }
        }

        completeAgentLayer(agent) {
            const layer = agent.layer;
            if (!layer) return;

            if (layer.type === 'text') {
                layer.el.textContent = layer.originalText;
            }
            layer.el.classList.remove('ai-layer-hidden');
            layer.el.classList.add('ai-layer-built');
            layer.built = true;

            if (agent.selBox) {
                agent.selBox.remove();
                agent.selBox = null;
                agent.dimPill = null;
            }
            agent.visSpan = null;
            agent.caretSpan = null;
            agent.ghostSpan = null;
            agent.layer = null;
            agent.phase = 'idle';
            this.setCursorTool(agent, 'pointer');

            this.builtCount++;
            this.updateDockUI();
        }

        /* ==================================================================
           Phase 3: Smooth Return Glide to Top & Full Native DOM Restoration
           ================================================================== */
        beginReturnToTop() {
            this.phase = 'returning';
            this.returnStartScrollY = window.scrollY;
            this.returnElapsed = 0;
            this.dockModeEl.textContent = 'Complete';
            this.clearSmartGuides();

            this.agents.forEach((agent) => {
                this.setCursorTool(agent, 'pointer');
                agent.el.classList.add('resting');
            });
        }

        updateReturnToTop(dt) {
            this.returnElapsed += dt;
            const holdPause = 220;
            const glideDuration = 950;

            if (this.returnElapsed < holdPause) {
                return;
            }

            const p = Math.min(1, (this.returnElapsed - holdPause) / glideDuration);
            const ease = p < 0.5
                ? 4 * p * p * p
                : 1 - Math.pow(-2 * p + 2, 3) / 2;

            const y = this.returnStartScrollY * (1 - ease);
            window.scrollTo(0, y);

            // Gently drift cursors outward as camera glides to top
            const cx = window.innerWidth * 0.5;
            const cy = window.innerHeight * 0.45;
            for (const agent of this.agents) {
                const dx = agent.x - cx;
                const dy = agent.y - cy;
                const len = Math.hypot(dx, dy) || 1;
                agent.x += (dx / len) * 0.12 * dt;
                agent.y += (dy / len) * 0.12 * dt;
                this.renderCursorPos(agent);
            }

            if (p >= 1) {
                window.scrollTo(0, 0);
                this.finalizeCleanDOM();
            }
        }

        skipAndFinish() {
            this.finalizeCleanDOM();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        finalizeCleanDOM() {
            this.isRunning = false;
            this.phase = 'done';

            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.typingTimer = null;
            }

            window.removeEventListener('wheel', this.boundBlockWheel);
            window.removeEventListener('touchmove', this.boundBlockWheel);

            this.cleanupActiveVisuals();

            // Restore any mid-stream text nodes & remove all temporary build classes
            for (const l of this.layers) {
                if (l.type === 'text' && l.originalText !== null) {
                    l.el.textContent = l.originalText;
                }
                l.el.classList.remove('ai-layer-hidden', 'ai-layer-built');
            }

            // Unwrap all temporary <span class="ai-inner-text"> back to exact original Text nodes
            this.unwrapAllTemporarySpans();

            // Ensure all .scroll-reveal sections stay permanently revealed
            document.querySelectorAll('.scroll-reveal').forEach((sec) => {
                sec.classList.add('revealed');
            });

            document.body.style.overflow = '';
            document.body.classList.remove('ai-building');
            document.body.classList.add('ai-completed');

            this.promptOverlay.classList.add('hidden');
            this.liveStage.classList.remove('active');
            this.replayPill.classList.add('visible');
        }

        cleanupActiveVisuals() {
            this.clearSmartGuides();
            if (this.workLayer) {
                this.workLayer.innerHTML = '';
            }
            for (const agent of this.agents) {
                agent.selBox = null;
                agent.dimPill = null;
                agent.visSpan = null;
                agent.caretSpan = null;
                agent.ghostSpan = null;
                agent.layer = null;
                agent.preTarget = null;
                agent.phase = 'idle';
                agent.el.classList.remove('visible', 'resting');
            }
        }

        /* ==================================================================
           UI Helpers
           ================================================================== */
        setCursorTool(agent, tool) {
            if (agent.currentTool !== tool) {
                agent.currentTool = tool;
                agent.el.setAttribute('data-tool', tool);
            }
        }

        renderCursorPos(agent) {
            agent.el.style.transform = `translate3d(${agent.x}px, ${agent.y}px, 0)`;
        }

        flashSmartGuides(x, y) {
            if (this.guideTimer) clearTimeout(this.guideTimer);
            this.guideV.style.left = `${Math.round(x)}px`;
            this.guideH.style.top = `${Math.round(y)}px`;
            this.guideV.classList.add('visible');
            this.guideH.classList.add('visible');
            this.guideTimer = setTimeout(() => this.clearSmartGuides(), 180);
        }

        clearSmartGuides() {
            if (this.guideH) this.guideH.classList.remove('visible');
            if (this.guideV) this.guideV.classList.remove('visible');
        }

        updateDockUI() {
            const total = this.layers.length;
            if (this.dockLayersEl) {
                this.dockLayersEl.textContent = `${this.builtCount} / ${total} layers`;
            }
            if (this.dockFillEl) {
                const pct = total > 0 ? (this.builtCount / total) * 100 : 0;
                this.dockFillEl.style.width = `${pct.toFixed(1)}%`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new AIPortfolioBuilder());
    } else {
        new AIPortfolioBuilder();
    }
})();

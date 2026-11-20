// ==============================================================================
// ZION MEMORIAL GARDEN - AUTOMATIC PERIMETER FENCE & ENTRANCE GATE
// Shared by the Layout Studio (map-editor.html) and the client map views.
//
//  - The perimeter fence is generated automatically around every visible area
//    vector, so it always encapsulates the entire map (no wall image needed).
//  - The entrance gate is a regular map layer (kind: 'entrance'). It snaps onto
//    the nearest fence edge and the fence opens a gap where the gate sits.
// ==============================================================================
(function () {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const ENTRANCE_ASPECT = 0.5;        // gate height / gate width
    const GATE_GAP_RATIO = 0.82;        // fence opening relative to gate width
    const STRUCTURAL_SRC = /boundary|Group 109|Framework/i;

    function isEntrance(v) {
        return !!v && v.kind === 'entrance';
    }

    function isStructural(v) {
        return !!v && ((v.id === 'group-109') ||
            (v.src && v.src.indexOf('data:') !== 0 && STRUCTURAL_SRC.test(v.src)));
    }

    // Legacy "walls" artwork that has been replaced by the generated fence
    function isLegacyWall(v) {
        return isStructural(v);
    }

    function isDecorPart(v) {
        return !!v && v.kind === 'decor';
    }

    function isFenceable(v) {
        return !!v && v.visible !== false && !isEntrance(v) && !isStructural(v) && (!isDecorPart(v) || v.fenceExclude !== true);
    }

    // ── Entrance gate artwork (faces "down"; centre line = fence line) ──
    function entranceSvgDataUrl() {
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120">' +
            '<rect x="44" y="52" width="152" height="16" fill="#d9d3c4"/>' +
            '<line x1="44" y1="60" x2="196" y2="60" stroke="#9b9482" stroke-width="2" stroke-dasharray="10 8"/>' +
            '<rect x="4" y="14" width="40" height="92" fill="#5a605a" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="0" y="8" width="48" height="14" fill="#7a817a" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="196" y="14" width="40" height="92" fill="#5a605a" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="192" y="8" width="48" height="14" fill="#7a817a" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="44" y="20" width="152" height="12" fill="#1e3a29" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="44" y="88" width="152" height="12" fill="#1e3a29" stroke="#2f332f" stroke-width="3"/>' +
            '<rect x="14" y="30" width="20" height="60" fill="#6c736c"/>' +
            '<rect x="206" y="30" width="20" height="60" fill="#6c736c"/>' +
            '</svg>';
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    function createEntranceLayer(overrides) {
        return Object.assign({
            id: 'entrance-' + Date.now(),
            kind: 'entrance',
            name: 'Main Entrance Gate',
            desc: 'Cemetery entrance gate (snaps to the perimeter fence)',
            src: entranceSvgDataUrl(),
            left: 42.0,
            top: 92.0,
            width: 12.0,
            rotate: 0,
            opacity: 1.0,
            zIndex: 9,
            visible: true,
            needsSnap: true
        }, overrides || {});
    }

    // ── Measurement helpers ──
    function containerSize(container) {
        return { W: container.offsetWidth || 1, H: container.offsetHeight || 1 };
    }

    function findLayerElement(container, id) {
        const nodes = container.querySelectorAll('[data-vector-id]');
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].dataset.vectorId === String(id)) return nodes[i];
        }
        return null;
    }

    function resolveLayerBoxPx(container, v, requireLoaded) {
        const el = findLayerElement(container, v.id);
        const imgEl = (el && el.tagName === 'IMG')
            ? el
            : (el && typeof el.querySelector === 'function' ? el.querySelector('img') : null);
        const hasInlinePoly = !!(sanitizePolygonPoints(v && v.points, MIN_POLYGON_POINTS) && v && Number(v.shapeAspect) > 0);
        const aspectFromData = el && el.dataset && Number(el.dataset.aspectRatio) > 0 ? Number(el.dataset.aspectRatio) : 0;
        const hasBuiltinHull = !!(v && v.src && builtinSilhouetteForSrc(v.src) && aspectFromData > 0);
        if (!el && !hasInlinePoly) return null;
        if (requireLoaded && !hasInlinePoly && !hasBuiltinHull && (!imgEl || !(imgEl.complete && imgEl.naturalWidth > 0))) {
            return null;
        }
        const { W } = containerSize(container);
        const w = (Number(v.width) || 0) / 100 * W;
        let h = el ? (el.offsetHeight || 0) : 0;
        if (h <= 0 && imgEl && imgEl.naturalWidth > 0) {
            h = w * (imgEl.naturalHeight / imgEl.naturalWidth);
        }
        if (h <= 0 && aspectFromData > 0) {
            h = w * aspectFromData;
        }
        if (h <= 0 && Number(v.shapeAspect) > 0) {
            h = w * Number(v.shapeAspect);
        }
        if (w <= 0 || h <= 0) return null;
        return { el, imgEl, w, h };
    }

    function layerBox(container, v, requireLoaded) {
        const size = resolveLayerBoxPx(container, v, requireLoaded);
        if (!size) return null;
        const { W, H } = containerSize(container);
        const { w, h } = size;
        const left = (Number(v.left) || 0) / 100 * W;
        const top = (Number(v.top) || 0) / 100 * H;
        const rot = ((Number(v.rotate) || 0) * Math.PI) / 180;
        const bw = Math.abs(w * Math.cos(rot)) + Math.abs(h * Math.sin(rot));
        const bh = Math.abs(w * Math.sin(rot)) + Math.abs(h * Math.cos(rot));
        const cx = left + w / 2;
        const cy = top + h / 2;
        return { cx, cy, w, h, minX: cx - bw / 2, maxX: cx + bw / 2, minY: cy - bh / 2, maxY: cy + bh / 2 };
    }

    const FENCE_STORAGE_KEY = 'zion_cemetery_fence_config_v1';
    const MIN_POLYGON_POINTS = 3;
    const MAX_POLYGON_POINTS = 32;

    function round2(n) {
        return Math.round(n * 100) / 100;
    }

    function clampNum(v, lo, hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    function sanitizePolygonPoints(pts, minPts) {
        const minCount = Math.max(3, Number(minPts) || MIN_POLYGON_POINTS);
        if (!Array.isArray(pts)) return null;
        const clean = [];
        for (let i = 0; i < pts.length && clean.length < MAX_POLYGON_POINTS; i++) {
            const p = pts[i];
            if (!p || typeof p !== 'object') continue;
            const x = Number(p.x);
            const y = Number(p.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
            clean.push({ x: round2(x), y: round2(y) });
        }
        return clean.length >= minCount ? clean : null;
    }

    function readStoredFenceConfig() {
        try {
            const raw = localStorage.getItem(FENCE_STORAGE_KEY);
            if (!raw) return { mode: 'auto', points: [] };
            const parsed = JSON.parse(raw);
            const pts = sanitizePolygonPoints(parsed && parsed.points, MIN_POLYGON_POINTS);
            if (parsed && parsed.mode === 'custom' && pts) {
                return { mode: 'custom', points: pts };
            }
            return { mode: 'auto', points: pts || [] };
        } catch (e) {
            return { mode: 'auto', points: [] };
        }
    }

    function writeStoredFenceConfig(cfg) {
        const pts = sanitizePolygonPoints(cfg && cfg.points, MIN_POLYGON_POINTS);
        const normalized = {
            mode: (cfg && cfg.mode === 'custom' && pts) ? 'custom' : 'auto',
            points: pts || []
        };
        try {
            localStorage.setItem(FENCE_STORAGE_KEY, JSON.stringify(normalized));
        } catch (e) { /* storage disabled */ }
        return normalized;
    }

    function signedAreaPx(pts) {
        if (!Array.isArray(pts) || pts.length < 3) return 0;
        let sum = 0;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            sum += a.x * b.y - b.x * a.y;
        }
        return sum;
    }

    // Build a closed clockwise polygon with `count` (3..32) vertices from a rectangle.
    // For count >= 4, all 4 sharp corners are kept and extra vertices split the longest edges evenly.
    function rectToPolygonPoints(rectPct, count, aspectScale) {
        const r = rectPct || { x: 0, y: 0, w: 100, h: 100 };
        const n = clampNum(Math.round(Number(count) || 4), MIN_POLYGON_POINTS, MAX_POLYGON_POINTS);
        const sx = aspectScale && aspectScale > 0 ? aspectScale : 1;

        if (n === 3) {
            return [
                { x: round2(r.x + r.w * 0.5), y: round2(r.y) },
                { x: round2(r.x + r.w), y: round2(r.y + r.h) },
                { x: round2(r.x), y: round2(r.y + r.h) }
            ];
        }

        const corners = [
            { x: r.x, y: r.y },
            { x: r.x + r.w, y: r.y },
            { x: r.x + r.w, y: r.y + r.h },
            { x: r.x, y: r.y + r.h }
        ];
        if (n === 4) {
            return corners.map(c => ({ x: round2(c.x), y: round2(c.y) }));
        }

        const edgeWeights = [r.w * sx, r.h, r.w * sx, r.h];
        const totalLen = edgeWeights.reduce((a, b) => a + b, 0) || 1;
        const extra = n - 4;
        const quotas = edgeWeights.map(len => (len / totalLen) * extra);
        const counts = quotas.map(q => Math.floor(q));
        let rem = extra - counts.reduce((a, b) => a + b, 0);
        const order = [0, 1, 2, 3].sort((i, j) => (quotas[j] - counts[j]) - (quotas[i] - counts[i]));
        for (let i = 0; i < order.length && rem > 0; i++) {
            counts[order[i]] += 1;
            rem -= 1;
        }

        const out = [];
        for (let e = 0; e < 4; e++) {
            const a = corners[e];
            const b = corners[(e + 1) % 4];
            out.push({ x: round2(a.x), y: round2(a.y) });
            const k = counts[e];
            for (let j = 1; j <= k; j++) {
                const t = j / (k + 1);
                out.push({
                    x: round2(a.x + (b.x - a.x) * t),
                    y: round2(a.y + (b.y - a.y) * t)
                });
            }
        }
        return out;
    }

    function defaultShapePoints(count, shapeAspect) {
        const aspect = shapeAspect && Number(shapeAspect) > 0 ? Number(shapeAspect) : 1;
        return rectToPolygonPoints({ x: 0, y: 0, w: 100, h: 100 }, count, 1 / aspect);
    }

    // Adjust a polygon's vertex count while preserving existing corner geometry:
    // - Increasing inserts midpoints on the longest edges.
    // - Decreasing removes vertices with the smallest perpendicular deviation.
    function resamplePolygonPoints(pts, count, aspectScale) {
        const clean = sanitizePolygonPoints(pts, MIN_POLYGON_POINTS);
        const target = clampNum(Math.round(Number(count) || 4), MIN_POLYGON_POINTS, MAX_POLYGON_POINTS);
        if (!clean) return defaultShapePoints(target);

        const sx = aspectScale && aspectScale > 0 ? aspectScale : 1;
        const work = clean.map(p => ({ x: p.x, y: p.y }));

        while (work.length < target) {
            let bestEdge = 0;
            let bestLen = -1;
            for (let i = 0; i < work.length; i++) {
                const a = work[i];
                const b = work[(i + 1) % work.length];
                const len = Math.hypot((b.x - a.x) * sx, b.y - a.y);
                if (len > bestLen) {
                    bestLen = len;
                    bestEdge = i;
                }
            }
            const a = work[bestEdge];
            const b = work[(bestEdge + 1) % work.length];
            work.splice(bestEdge + 1, 0, {
                x: round2((a.x + b.x) / 2),
                y: round2((a.y + b.y) / 2)
            });
        }

        while (work.length > target) {
            let removeIdx = 0;
            let minArea = Infinity;
            for (let i = 0; i < work.length; i++) {
                const prev = work[(i - 1 + work.length) % work.length];
                const curr = work[i];
                const next = work[(i + 1) % work.length];
                const ax = (curr.x - prev.x) * sx;
                const ay = curr.y - prev.y;
                const bx = (next.x - prev.x) * sx;
                const by = next.y - prev.y;
                const area = Math.abs(ax * by - ay * bx);
                if (area < minArea) {
                    minArea = area;
                    removeIdx = i;
                }
            }
            work.splice(removeIdx, 1);
        }

        return work;
    }

    // Returns the fence rectangle {x, y, w, h} or null when nothing can be measured yet
    function computeFenceRect(container, layers, opts) {
        opts = opts || {};
        const { W, H } = containerSize(container);
        const areas = (layers || []).filter(isFenceable);
        if (areas.length === 0) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const v of areas) {
            const box = layerBox(container, v, true);
            if (!box) return null; // artwork still loading
            minX = Math.min(minX, box.minX);
            minY = Math.min(minY, box.minY);
            maxX = Math.max(maxX, box.maxX);
            maxY = Math.max(maxY, box.maxY);
        }

        const pad = opts.pad != null ? opts.pad : (opts.padding != null ? opts.padding : Math.max(14, W * 0.03));
        let x = minX - pad, y = minY - pad, x2 = maxX + pad, y2 = maxY + pad;

        if (opts.clamp) {
            const m = 3;
            x = Math.max(m, x); y = Math.max(m, y);
            x2 = Math.min(W - m, x2); y2 = Math.min(H - m, y2);
        }
        return { x, y, w: x2 - x, h: y2 - y };
    }

    function computeFencePolygon(container, layers, opts) {
        opts = opts || {};
        const { W, H } = containerSize(container);
        const cfg = opts.fenceConfig || readStoredFenceConfig();
        const customPts = (cfg && cfg.mode === 'custom')
            ? sanitizePolygonPoints(cfg.points, MIN_POLYGON_POINTS)
            : null;

        if (customPts) {
            const ptsPx = customPts.map(p => ({ x: (p.x / 100) * W, y: (p.y / 100) * H }));
            return {
                points: ptsPx,
                rect: pointsBounds(ptsPx),
                isCustomPolygon: true
            };
        }

        const padPx = opts.pad != null ? opts.pad : (opts.padding != null ? opts.padding : Math.max(18, W * 0.028));
        const polys = collectAreaPolygonsPx(container, layers, true);
        let ptsPx = null;
        if (polys && polys.length > 0) {
            ptsPx = buildAutoWrappedPolygon(polys, padPx);
        }
        if (!ptsPx) {
            const rect = computeFenceRect(container, layers, opts);
            if (!rect) return null;
            ptsPx = [
                { x: rect.x, y: rect.y },
                { x: rect.x + rect.w, y: rect.y },
                { x: rect.x + rect.w, y: rect.y + rect.h },
                { x: rect.x, y: rect.y + rect.h }
            ];
            return { points: ptsPx, rect: rect, isCustomPolygon: false };
        }

        if (opts.clamp) {
            const m = 3;
            ptsPx = ptsPx.map(pt => ({
                x: clampNum(pt.x, m, Math.max(m, W - m)),
                y: clampNum(pt.y, m, Math.max(m, H - m))
            }));
        }
        return {
            points: ptsPx,
            rect: pointsBounds(ptsPx),
            isCustomPolygon: false
        };
    }

    // Compact normalized silhouettes for built-in area PNGs (so auto-wrap works even offline or on file://)
    const BUILTIN_SILHOUETTES = {
        'Vector (3).png':  [[0,0.062],[0.022,0.042],[0.103,0],[0.834,0.021],[1,0.042],[1,0.396],[0.022,0.979],[0,0.979]],
        'Vector (4).png':  [[0,0.208],[0.084,0.166],[0.5,0],[0.98,0.313],[1,0.355],[1,0.771],[0.042,0.979],[0,0.834]],
        'Vector (5).png':  [[0,0],[1,0],[1,1],[0,1]],
        'Vector (6).png':  [[0,0],[1,0],[1,0.834],[0.895,1],[0,1]],
        'Vector (7).png':  [[0,0],[0.542,0],[0.979,0.021],[0.979,0.041],[0.729,0.563],[0.646,0.625],[0.083,0.979],[0,0.792]],
        'Vector (8).png':  [[0,0.229],[0.312,0],[1,0],[1,0.979],[0.98,1],[0,1]],
        'Vector (9).png':  [[0,0],[0.688,0],[1,0.229],[1,0.979],[0.98,1],[0,1]],
        'Vector (10).png': [[0,0],[0.353,0.042],[0.416,0.103],[0.832,0.688],[0.979,0.897],[0.979,0.938],[0.916,1],[0,1]],
        'Vector (11).png': [[0,0.041],[0.146,0.021],[0.271,0.063],[0.896,0.292],[0.979,0.333],[1,0.979],[0.979,1],[0,1]],
        'Vector (12).png': [[0,0],[1,0],[1,0.75],[0.666,1],[0,1]],
        'Vector (13).png': [[0,0],[1,0],[1,0.979],[0.98,1],[0.312,1],[0,0.75]],
        'Vector (14).png': [[0,0.667],[0.021,0.479],[0.041,0.458],[0.292,0.333],[0.959,0.021],[0.979,0.021],[0.979,1],[0,1]]
    };
    const alphaHullCache = {};

    function pointsBounds(pts) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    function cross2d(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    function convexHull2d(pts) {
        const sorted = pts.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
        if (sorted.length <= 3) return sorted;
        const lower = [], upper = [];
        for (let i = 0; i < sorted.length; i++) {
            const p = sorted[i];
            while (lower.length >= 2 && cross2d(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
            lower.push(p);
        }
        for (let i = sorted.length - 1; i >= 0; i--) {
            const p = sorted[i];
            while (upper.length >= 2 && cross2d(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
            upper.push(p);
        }
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    function builtinSilhouetteForSrc(src) {
        if (!src || src.indexOf('data:') === 0) return null;
        let clean = String(src).split('?')[0].split('#')[0];
        try { clean = decodeURIComponent(clean); } catch (e) { /* keep raw */ }
        const parts = clean.split(/[\\/]/);
        const file = parts[parts.length - 1];
        return BUILTIN_SILHOUETTES[file] || null;
    }

    function extractImageHullNormalized(el, src) {
        if (!src) return null;
        if (alphaHullCache[src]) return alphaHullCache[src];
        const preset = builtinSilhouetteForSrc(src);
        if (preset) {
            alphaHullCache[src] = preset;
            return preset;
        }
        if (!el || !el.complete || !el.naturalWidth || typeof document === 'undefined') return null;
        try {
            const cw = 48, ch = 48;
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext && canvas.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(el, 0, 0, cw, ch);
            const data = ctx.getImageData(0, 0, cw, ch).data;
            const raw = [];
            for (let y = 0; y < ch; y++) {
                let minX = cw, maxX = -1;
                for (let x = 0; x < cw; x++) {
                    if (data[(y * cw + x) * 4 + 3] > 20) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
                if (maxX >= 0) {
                    raw.push({ x: minX / (cw - 1), y: y / (ch - 1) });
                    if (maxX > minX) raw.push({ x: maxX / (cw - 1), y: y / (ch - 1) });
                }
            }
            if (raw.length < 3) return null;
            let hull = convexHull2d(raw);
            while (hull.length > 10) {
                let bestI = 0, minA = Infinity;
                for (let i = 0; i < hull.length; i++) {
                    const p0 = hull[(i - 1 + hull.length) % hull.length];
                    const p1 = hull[i];
                    const p2 = hull[(i + 1) % hull.length];
                    const a = Math.abs(cross2d(p0, p1, p2));
                    if (a < minA) { minA = a; bestI = i; }
                }
                hull.splice(bestI, 1);
            }
            const norm = hull.map(p => [Math.round(p.x * 1000) / 1000, Math.round(p.y * 1000) / 1000]);
            alphaHullCache[src] = norm;
            return norm;
        } catch (e) {
            return null;
        }
    }

    function layerPolygonPx(container, v, requireLoaded) {
        const size = resolveLayerBoxPx(container, v, requireLoaded);
        if (!size) return null;
        const { W, H } = containerSize(container);
        const { el, imgEl, w, h } = size;

        const left = (Number(v.left) || 0) / 100 * W;
        const top = (Number(v.top) || 0) / 100 * H;
        const cx = left + w / 2;
        const cy = top + h / 2;
        const rot = ((Number(v.rotate) || 0) * Math.PI) / 180;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);

        let normPts = null;
        const customShape = sanitizePolygonPoints(v.points, MIN_POLYGON_POINTS);
        if (customShape) {
            normPts = customShape.map(p => [p.x / 100, p.y / 100]);
        } else if (imgEl || el) {
            normPts = extractImageHullNormalized(imgEl || el, v.src);
        }
        if (!normPts || normPts.length < 3) {
            normPts = [[0, 0], [1, 0], [1, 1], [0, 1]];
        }

        return normPts.map(pt => {
            const lx = (pt[0] - 0.5) * w;
            const ly = (pt[1] - 0.5) * h;
            return {
                x: cx + lx * cos - ly * sin,
                y: cy + lx * sin + ly * cos
            };
        });
    }

    function collectAreaPolygonsPx(container, layers, requireLoaded) {
        const areas = (layers || []).filter(isFenceable);
        if (areas.length === 0) return null;
        const polys = [];
        for (let i = 0; i < areas.length; i++) {
            const poly = layerPolygonPx(container, areas[i], requireLoaded);
            if (!poly) return null;
            polys.push(poly);
        }
        return polys;
    }

    // 1D Squared Euclidean Distance Transform (Felzenszwalb & Huttenlocher)
    function edt1d(f, n, v, z, d) {
        let k = 0;
        v[0] = 0;
        z[0] = -1e18;
        z[1] = 1e18;
        for (let q = 1; q < n; q++) {
            let s;
            while (true) {
                const r = v[k];
                s = ((f[q] + q * q) - (f[r] + r * r)) / (2 * q - 2 * r);
                if (s > z[k]) break;
                k--;
            }
            k++;
            v[k] = q;
            z[k] = s;
            z[k + 1] = 1e18;
        }
        k = 0;
        for (let q = 0; q < n; q++) {
            while (z[k + 1] < q) k++;
            const diff = q - v[k];
            d[q] = diff * diff + f[v[k]];
        }
    }

    function edt2d(mask, GW, GH, targetVal) {
        const INF = 1e9;
        const grid = new Float64Array(GW * GH);
        for (let i = 0; i < GW * GH; i++) grid[i] = mask[i] === targetVal ? 0 : INF;
        const maxDim = Math.max(GW, GH);
        const f = new Float64Array(maxDim);
        const d = new Float64Array(maxDim);
        const v = new Int32Array(maxDim);
        const z = new Float64Array(maxDim + 1);
        for (let x = 0; x < GW; x++) {
            for (let y = 0; y < GH; y++) f[y] = grid[y * GW + x];
            edt1d(f, GH, v, z, d);
            for (let y = 0; y < GH; y++) grid[y * GW + x] = d[y];
        }
        for (let y = 0; y < GH; y++) {
            const off = y * GW;
            for (let x = 0; x < GW; x++) f[x] = grid[off + x];
            edt1d(f, GW, v, z, d);
            for (let x = 0; x < GW; x++) grid[off + x] = d[x];
        }
        return grid;
    }

    function buildAutoWrappedPolygon(polys, padPx) {
        if (!Array.isArray(polys) || polys.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        polys.forEach(p => p.forEach(pt => {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        }));
        const span = Math.max(maxX - minX, maxY - minY, 80);
        const closePx = Math.max(padPx * 1.25, span * 0.062);
        const margin = padPx + closePx + span * 0.04;
        const bx0 = minX - margin;
        const by0 = minY - margin;
        const bw = (maxX - minX) + margin * 2;
        const bh = (maxY - minY) + margin * 2;

        const GW = 128, GH = 128;
        const scale = Math.min(GW / bw, GH / bh);
        const mask = new Uint8Array(GW * GH);

        polys.forEach(poly => {
            let py0 = Infinity, py1 = -Infinity;
            const gp = poly.map(p => {
                const gx = (p.x - bx0) * scale;
                const gy = (p.y - by0) * scale;
                if (gy < py0) py0 = gy;
                if (gy > py1) py1 = gy;
                return { x: gx, y: gy };
            });
            const yStart = Math.max(0, Math.floor(py0));
            const yEnd = Math.min(GH - 1, Math.ceil(py1));
            for (let y = yStart; y <= yEnd; y++) {
                const sy = y + 0.5;
                const xs = [];
                for (let i = 0; i < gp.length; i++) {
                    const a = gp[i], b = gp[(i + 1) % gp.length];
                    if ((a.y <= sy && b.y > sy) || (b.y <= sy && a.y > sy)) {
                        xs.push(a.x + ((sy - a.y) * (b.x - a.x)) / (b.y - a.y));
                    }
                }
                xs.sort((a, b) => a - b);
                for (let k = 0; k + 1 < xs.length; k += 2) {
                    const x0 = Math.max(0, Math.floor(xs[k]));
                    const x1 = Math.min(GW - 1, Math.ceil(xs[k + 1]));
                    for (let x = x0; x <= x1; x++) mask[y * GW + x] = 1;
                }
            }
            // Also stamp polygon perimeter segments so narrow wall strips / thin blocks never drop cells
            for (let i = 0; i < gp.length; i++) {
                const a = gp[i], b = gp[(i + 1) % gp.length];
                const edgeSteps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2));
                for (let s = 0; s <= edgeSteps; s++) {
                    const t = s / edgeSteps;
                    const gx = Math.round(a.x + (b.x - a.x) * t);
                    const gy = Math.round(a.y + (b.y - a.y) * t);
                    if (gx >= 0 && gx < GW && gy >= 0 && gy < GH) mask[gy * GW + gx] = 1;
                }
            }
        });

        // Bridge detached areas with MST corridors so the fence stays one continuous perimeter loop
        if (polys.length > 1) {
            const used = new Set([0]);
            while (used.size < polys.length) {
                let best = { idx: -1, d: Infinity, a: null, b: null };
                used.forEach(i => {
                    for (let j = 0; j < polys.length; j++) {
                        if (used.has(j)) continue;
                        for (let ia = 0; ia < polys[i].length; ia++) {
                            const pa = polys[i][ia];
                            for (let ib = 0; ib < polys[j].length; ib++) {
                                const pb = polys[j][ib];
                                const d = (pa.x - pb.x) * (pa.x - pb.x) + (pa.y - pb.y) * (pa.y - pb.y);
                                if (d < best.d) best = { idx: j, d: d, a: pa, b: pb };
                            }
                        }
                    }
                });
                if (best.idx < 0) break;
                used.add(best.idx);
                const ax = (best.a.x - bx0) * scale, ay = (best.a.y - by0) * scale;
                const bx = (best.b.x - bx0) * scale, by = (best.b.y - by0) * scale;
                const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
                const br = Math.max(1.5, scale * padPx * 0.4);
                const brCeil = Math.ceil(br);
                for (let s = 0; s <= steps; s++) {
                    const gx = Math.round(ax + (bx - ax) * (s / steps));
                    const gy = Math.round(ay + (by - ay) * (s / steps));
                    for (let dy = -brCeil; dy <= brCeil; dy++) {
                        for (let dx = -brCeil; dx <= brCeil; dx++) {
                            if (dx * dx + dy * dy <= br * br) {
                                const nx = gx + dx, ny = gy + dy;
                                if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) mask[ny * GW + nx] = 1;
                            }
                        }
                    }
                }
            }
        }

        const closeCells = Math.max(1.8, closePx * scale);
        const padCells = Math.max(1.5, padPx * scale);
        const dilateSq = (closeCells + padCells) * (closeCells + padCells);
        const erodeSq = closeCells * closeCells;

        const distIn = edt2d(mask, GW, GH, 1);
        const dilated = new Uint8Array(GW * GH);
        for (let i = 0; i < GW * GH; i++) {
            if (distIn[i] <= dilateSq) dilated[i] = 1;
        }

        const distOut = edt2d(dilated, GW, GH, 0);
        const finalMask = new Uint8Array(GW * GH);
        for (let i = 0; i < GW * GH; i++) {
            if (distOut[i] > erodeSq) finalMask[i] = 1;
        }

        // Moore-Neighbor outer contour trace
        let start = -1;
        for (let y = 1; y < GH - 1 && start < 0; y++) {
            for (let x = 1; x < GW - 1; x++) {
                if (finalMask[y * GW + x] === 1 && finalMask[y * GW + x - 1] === 0) {
                    start = y * GW + x;
                    break;
                }
            }
        }
        if (start < 0) return null;

        const sx = start % GW, sy = Math.floor(start / GW);
        const dirs = [[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1]];
        const raw = [];
        let cx = sx, cy = sy, backIdx = 0;
        for (let iter = 0; iter < GW * GH; iter++) {
            raw.push({ x: bx0 + (cx + 0.5) / scale, y: by0 + (cy + 0.5) / scale });
            let found = false;
            for (let k = 1; k <= 8; k++) {
                const idx = (backIdx + k) % 8;
                const nx = cx + dirs[idx][0], ny = cy + dirs[idx][1];
                if (nx >= 0 && nx < GW && ny >= 0 && ny < GH && finalMask[ny * GW + nx] === 1) {
                    const prevIdx = (idx + 7) % 8;
                    const emptyX = cx + dirs[prevIdx][0], emptyY = cy + dirs[prevIdx][1];
                    cx = nx; cy = ny;
                    const dx = emptyX - cx, dy = emptyY - cy;
                    backIdx = dirs.findIndex(d => d[0] === dx && d[1] === dy);
                    if (backIdx < 0) backIdx = (idx + 4) % 8;
                    found = true;
                    break;
                }
            }
            if (!found || (cx === sx && cy === sy && raw.length > 3)) break;
        }
        if (raw.length < 3) return null;

        const dpSeg = (pts, aIdx, bIdx, eps) => {
            const a = pts[aIdx], b = pts[bIdx];
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            let maxD = -1, bestI = -1;
            for (let i = aIdx + 1; i < bIdx; i++) {
                const p = pts[i];
                const d = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) / len;
                if (d > maxD) { maxD = d; bestI = i; }
            }
            if (maxD > eps && bestI > aIdx) {
                return dpSeg(pts, aIdx, bestI, eps).slice(0, -1).concat(dpSeg(pts, bestI, bIdx, eps));
            }
            return [a, b];
        };

        let simp = raw;
        if (raw.length > 5) {
            const mid = Math.floor(raw.length / 2);
            const eps = Math.min(padPx * 0.38, Math.max(6, span * 0.015));
            simp = dpSeg(raw, 0, mid, eps).slice(0, -1).concat(dpSeg(raw, mid, raw.length - 1, eps).slice(0, -1));
        }

        // Sharp corner mitering: intersect long adjacent walls across tiny rounded corner chamfers
        const minChamfer = Math.max(padPx * 1.4, span * 0.045);
        let changed = true;
        while (changed && simp.length > 4) {
            changed = false;
            for (let i = 0; i < simp.length && simp.length > 4; i++) {
                const n = simp.length;
                const p0 = simp[(i - 1 + n) % n];
                const p1 = simp[i];
                const p2 = simp[(i + 1) % n];
                const p3 = simp[(i + 2) % n];
                const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                if (segLen >= minChamfer) continue;
                const d1x = p1.x - p0.x, d1y = p1.y - p0.y;
                const d2x = p3.x - p2.x, d2y = p3.y - p2.y;
                if (Math.hypot(d1x, d1y) < segLen || Math.hypot(d2x, d2y) < segLen) continue;
                const det = d1x * d2y - d1y * d2x;
                if (Math.abs(det) < 1e-4) continue;
                const t = ((p2.x - p0.x) * d2y - (p2.y - p0.y) * d2x) / det;
                const ix = p0.x + d1x * t, iy = p0.y + d1y * t;
                const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
                if (Math.hypot(ix - midX, iy - midY) <= padPx * 1.2) {
                    simp[i] = { x: ix, y: iy };
                    simp.splice((i + 1) % n, 1);
                    changed = true;
                    break;
                }
            }
        }

        // Collinear & tiny stub cleanup
        const minCos = Math.cos(14 * Math.PI / 180);
        changed = true;
        while (changed && simp.length > 3) {
            changed = false;
            for (let i = 0; i < simp.length && simp.length > 3; i++) {
                const n = simp.length;
                const prev = simp[(i - 1 + n) % n], curr = simp[i], next = simp[(i + 1) % n];
                if (Math.hypot(curr.x - prev.x, curr.y - prev.y) < padPx * 0.65) {
                    simp.splice(i, 1);
                    changed = true;
                    break;
                }
                const v1x = curr.x - prev.x, v1y = curr.y - prev.y;
                const v2x = next.x - curr.x, v2y = next.y - curr.y;
                const dot = (v1x * v2x + v1y * v2y) / ((Math.hypot(v1x, v1y) || 1) * (Math.hypot(v2x, v2y) || 1));
                if (dot > minCos) {
                    simp.splice(i, 1);
                    changed = true;
                    break;
                }
            }
        }

        if (simp.length > MAX_POLYGON_POINTS) {
            simp = resamplePolygonPoints(simp, MAX_POLYGON_POINTS, 1);
        }
        if (signedAreaPx(simp) < 0) simp.reverse();
        return simp.map(p => ({ x: round2(p.x), y: round2(p.y) }));
    }

    function nearestPolygonEdge(ptsPx, cx, cy) {
        if (!Array.isArray(ptsPx) || ptsPx.length < 2) return null;
        let best = null;
        for (let i = 0; i < ptsPx.length; i++) {
            const a = ptsPx[i];
            const b = ptsPx[(i + 1) % ptsPx.length];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const lenSq = dx * dx + dy * dy;
            if (lenSq < 1e-6) continue;
            const t = clampNum(((cx - a.x) * dx + (cy - a.y) * dy) / lenSq, 0, 1);
            const projX = a.x + dx * t;
            const projY = a.y + dy * t;
            const dist = Math.hypot(cx - projX, cy - projY);
            if (!best || dist < best.dist) {
                best = {
                    index: i,
                    t: t,
                    projX: projX,
                    projY: projY,
                    dist: dist,
                    segLen: Math.sqrt(lenSq),
                    dx: dx,
                    dy: dy,
                    ax: a.x,
                    ay: a.y,
                    bx: b.x,
                    by: b.y
                };
            }
        }
        return best;
    }

    function toPolygonPointsPx(rectOrPoly) {
        if (!rectOrPoly) return null;
        if (Array.isArray(rectOrPoly)) return rectOrPoly;
        if (Array.isArray(rectOrPoly.points)) return rectOrPoly.points;
        if (typeof rectOrPoly.x === 'number' && typeof rectOrPoly.w === 'number') {
            return [
                { x: rectOrPoly.x, y: rectOrPoly.y },
                { x: rectOrPoly.x + rectOrPoly.w, y: rectOrPoly.y },
                { x: rectOrPoly.x + rectOrPoly.w, y: rectOrPoly.y + rectOrPoly.h },
                { x: rectOrPoly.x, y: rectOrPoly.y + rectOrPoly.h }
            ];
        }
        return null;
    }

    // Snap an entrance layer onto the nearest fence segment (axis-aligned or angled polygon).
    function snapEntrance(container, v, rectOrPoly) {
        const ptsPx = toPolygonPointsPx(rectOrPoly);
        if (!container || !v || !ptsPx || ptsPx.length < 2) return false;
        const { W, H } = containerSize(container);
        const w = (Number(v.width) || 12) / 100 * W;
        const h = w * ENTRANCE_ASPECT;
        const cx = (Number(v.left) || 0) / 100 * W + w / 2;
        const cy = (Number(v.top) || 0) / 100 * H + h / 2;

        const best = nearestPolygonEdge(ptsPx, cx, cy);
        if (!best) return false;

        const halfRatio = Math.min(0.5, (w / 2) / Math.max(1, best.segLen));
        const clampedT = best.segLen <= w
            ? 0.5
            : Math.max(halfRatio, Math.min(1 - halfRatio, best.t));
        const snapX = best.ax + best.dx * clampedT;
        const snapY = best.ay + best.dy * clampedT;

        const areaSum = signedAreaPx(ptsPx);
        const segAngle = (Math.atan2(best.dy, best.dx) * 180) / Math.PI;
        let rotate = Math.round((((areaSum >= 0 ? segAngle + 180 : segAngle) % 360) + 360) % 360);
        if (rotate === 360) rotate = 0;

        const newLeft = round2((snapX - w / 2) / W * 100);
        const newTop = round2((snapY - h / 2) / H * 100);
        const changed = (newLeft !== Number(v.left)) || (newTop !== Number(v.top)) || (rotate !== (Number(v.rotate) || 0));
        v.left = newLeft;
        v.top = newTop;
        v.rotate = rotate;
        v.needsSnap = false;
        return changed;
    }

    // ── SVG drawing ──
    function line(svg, x1, y1, x2, y2, stroke, width) {
        const el = document.createElementNS(SVG_NS, 'line');
        el.setAttribute('x1', x1); el.setAttribute('y1', y1);
        el.setAttribute('x2', x2); el.setAttribute('y2', y2);
        el.setAttribute('stroke', stroke);
        el.setAttribute('stroke-width', width);
        el.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(el);
    }

    function post(svg, cx, cy, size, fill) {
        const el = document.createElementNS(SVG_NS, 'rect');
        el.setAttribute('x', cx - size / 2);
        el.setAttribute('y', cy - size / 2);
        el.setAttribute('width', size);
        el.setAttribute('height', size);
        el.setAttribute('fill', fill);
        svg.appendChild(el);
    }

    function drawSegment(svg, x1, y1, x2, y2, opts) {
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (len < 2) return;
        line(svg, x1, y1, x2, y2, opts.rail, opts.railWidth);
        const count = Math.max(1, Math.round(len / opts.spacing));
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            post(svg, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, opts.postSize, opts.post);
        }
    }

    function getSvg(container) {
        let svg = null;
        for (let i = 0; i < container.children.length; i++) {
            const c = container.children[i];
            if (c.tagName && c.tagName.toLowerCase() === 'svg' && c.classList.contains('zmg-map-fence')) { svg = c; break; }
        }
        if (!svg) {
            svg = document.createElementNS(SVG_NS, 'svg');
            svg.setAttribute('class', 'zmg-map-fence');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:2;';
            container.appendChild(svg);
        }
        return svg;
    }

    function removeFence(container) {
        const svg = getSvg(container);
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    // Temporarily disabled: set to true to re-enable the brown perimeter wall/fence
    const PERIMETER_WALL_ENABLED = false;

    // Draw the fence (auto-fitted rect OR custom N-point polygon).
    // Also performs a pending auto-snap for freshly added gates.
    function render(container, layers, opts) {
        if (!container) return { rect: null, points: null, isCustomPolygon: false, snapped: false };
        if (!PERIMETER_WALL_ENABLED) {
            removeFence(container);
            return { rect: null, points: null, isCustomPolygon: false, snapped: false };
        }
        opts = opts || {};
        const svg = getSvg(container);
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const poly = computeFencePolygon(container, layers, opts);
        if (!poly) return { rect: null, points: null, isCustomPolygon: false, snapped: false };

        const { W, H } = containerSize(container);
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

        // Auto-snap newly placed entrance gates onto the fence
        let snapped = false;
        const entrances = (layers || []).filter(v => isEntrance(v) && v.visible !== false);
        entrances.forEach(v => {
            if (v.needsSnap) {
                if (snapEntrance(container, v, poly.points)) snapped = true;
                const el = findLayerElement(container, v.id);
                if (el) {
                    el.style.left = v.left + '%';
                    el.style.top = v.top + '%';
                    el.style.transform = 'rotate(' + v.rotate + 'deg)';
                }
            }
        });

        // Gate openings mapped onto each polygon edge by arc distance along the edge
        const edgeCount = poly.points.length;
        const edgeGaps = Array.from({ length: edgeCount }, () => []);
        entrances.forEach(v => {
            const box = layerBox(container, v, false);
            if (!box) return;
            const best = nearestPolygonEdge(poly.points, box.cx, box.cy);
            if (!best || best.dist > Math.max(box.w, box.h) * 0.75) return;
            const half = (box.w * GATE_GAP_RATIO) / 2;
            const sCenter = best.t * best.segLen;
            edgeGaps[best.index].push([sCenter - half, sCenter + half]);
        });

        const unitScale = Math.max(1, Math.min(2.6, W / 1100));
        const style = {
            rail: '#5b4636',
            railWidth: Number((3 * unitScale).toFixed(1)),
            post: '#33271d',
            postSize: Number((6 * unitScale).toFixed(1)),
            spacing: Math.round(22 * unitScale)
        };
        const splitInterval = (endLen, gapList) => {
            const sorted = gapList.slice().sort((a, b) => a[0] - b[0]);
            const segs = [];
            let cursor = 0;
            sorted.forEach(g => {
                const gs = Math.max(0, g[0]);
                const ge = Math.min(endLen, g[1]);
                if (ge <= gs) return;
                if (gs > cursor) segs.push([cursor, gs]);
                cursor = Math.max(cursor, ge);
            });
            if (cursor < endLen) segs.push([cursor, endLen]);
            return segs;
        };

        for (let i = 0; i < edgeCount; i++) {
            const a = poly.points[i];
            const b = poly.points[(i + 1) % edgeCount];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const segLen = Math.hypot(dx, dy);
            if (segLen < 2) continue;
            const subSegs = splitInterval(segLen, edgeGaps[i]);
            subSegs.forEach(s => {
                const t0 = s[0] / segLen;
                const t1 = s[1] / segLen;
                drawSegment(svg, a.x + dx * t0, a.y + dy * t0, a.x + dx * t1, a.y + dy * t1, style);
            });
        }

        // Heavier vertex corner posts
        const cornerSize = Number((11 * unitScale).toFixed(1));
        poly.points.forEach(pt => post(svg, pt.x, pt.y, cornerSize, '#2a1f16'));

        return {
            rect: poly.rect,
            points: poly.points,
            isCustomPolygon: poly.isCustomPolygon,
            snapped: snapped
        };
    }

    // ── Custom (admin-created) cemetery areas ──
    // A custom area lives on the map as a vector layer flagged `custom: true`
    // that carries its own plot-grid settings (cols, rows, prefix, category).
    const PLOT_CELL_PX = 25;
    const LAYOUT_STORAGE_KEY = 'zion_cemetery_map_vector_layout_v2';
    const CATEGORY_TABS = {
        'Single Teired': 'single-teired',
        'Supreme': 'supreme',
        'Special Supreme': 'special-supreme',
        'Family Estate Jr.': 'family-estate',
        'Condominium': 'condominium',
        'Mausoleum': 'mausoleum'
    };

    function polygonCentroid(ptsPx) {
        let doubleArea = 0;
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < ptsPx.length; i++) {
            const a = ptsPx[i];
            const b = ptsPx[(i + 1) % ptsPx.length];
            const cross = a.x * b.y - b.x * a.y;
            doubleArea += cross;
            cx += (a.x + b.x) * cross;
            cy += (a.y + b.y) * cross;
        }
        if (Math.abs(doubleArea) > 1) {
            return { x: cx / (3 * doubleArea), y: cy / (3 * doubleArea) };
        }
        const sum = ptsPx.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: sum.x / ptsPx.length, y: sum.y / ptsPx.length };
    }

    function buildAreaSvgDataUrl(cols, rows, areaNo, points, shapeAspect) {
        const cell = 10;
        const W = Math.max(40, Math.round((Number(cols) || 20) * cell));
        const aspect = shapeAspect && Number(shapeAspect) > 0
            ? Number(shapeAspect)
            : ((Number(rows) || 20) / Math.max(1, Number(cols) || 20));
        const H = Math.max(40, Math.round(W * aspect));
        const fontSize = Math.max(14, Math.round(Math.min(W, H) * 0.16));
        const label = 'AREA ' + String(areaNo).replace(/[^0-9A-Za-z]/g, '');

        const cleanPts = sanitizePolygonPoints(points, MIN_POLYGON_POINTS);
        let svg = '';
        if (cleanPts) {
            const ptsPx = cleanPts.map(p => ({
                x: Number(((p.x / 100) * W).toFixed(2)),
                y: Number(((p.y / 100) * H).toFixed(2))
            }));
            const ptAttr = ptsPx.map(p => p.x + ',' + p.y).join(' ');
            const center = polygonCentroid(ptsPx);
            const labelX = clampNum(center.x, W * 0.15, W * 0.85).toFixed(1);
            const labelY = clampNum(center.y + fontSize / 3, fontSize * 0.9, H - fontSize * 0.3).toFixed(1);
            // Clip strokes strictly inside the polygon so vertices at 0..100% never clip at viewBox edges
            svg =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
                '<defs><clipPath id="areaClip"><polygon points="' + ptAttr + '"/></clipPath></defs>' +
                '<polygon points="' + ptAttr + '" fill="#cfe3c9"/>' +
                '<g clip-path="url(#areaClip)">' +
                '<polygon points="' + ptAttr + '" fill="none" stroke="#1e3a29" stroke-width="18" stroke-dasharray="12 8" opacity="0.16"/>' +
                '<polygon points="' + ptAttr + '" fill="none" stroke="#2d4a36" stroke-width="10" stroke-linejoin="miter"/>' +
                '</g>' +
                '<text x="' + labelX + '" y="' + labelY + '" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="' + fontSize + '" fill="#1e3a29">' + label + '</text>' +
                '</svg>';
        } else {
            svg =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
                '<rect x="3" y="3" width="' + (W - 6) + '" height="' + (H - 6) + '" fill="#cfe3c9" stroke="#2d4a36" stroke-width="6"/>' +
                '<rect x="14" y="14" width="' + (W - 28) + '" height="' + (H - 28) + '" fill="none" stroke="#2d4a36" stroke-width="2" stroke-dasharray="12 8" opacity="0.55"/>' +
                '<text x="' + (W / 2) + '" y="' + (H / 2 + fontSize / 3) + '" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="' + fontSize + '" fill="#1e3a29">' + label + '</text>' +
                '</svg>';
        }
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    function isCustomArea(v) {
        return !!v && v.custom === true && v.area != null;
    }

    function customAreaLayers(layers) {
        return (layers || []).filter(isCustomArea);
    }

    function shapeEntryFromLayer(v) {
        const cols = Number(v.cols) || 20;
        const rows = Number(v.rows) || 20;
        const aspect = v.shapeAspect && Number(v.shapeAspect) > 0
            ? Number(v.shapeAspect)
            : (rows / Math.max(1, cols));
        const pts = sanitizePolygonPoints(v.points, MIN_POLYGON_POINTS);
        const widthPx = cols * PLOT_CELL_PX;
        const heightPx = pts
            ? Math.max(PLOT_CELL_PX * 2, Math.round(widthPx * aspect))
            : rows * PLOT_CELL_PX;
        const asset = pts
            ? buildAreaSvgDataUrl(cols, rows, v.area, pts, aspect)
            : v.src;
        return {
            area: String(v.area),
            asset: asset,
            prefix: v.prefix || ('A' + v.area),
            category: v.category || 'Supreme',
            cols: cols,
            rows: rows,
            widthPx: widthPx,
            heightPx: heightPx,
            points: pts,
            shapeAspect: aspect,
            tab: v.tab || CATEGORY_TABS[v.category] || 'supreme',
            custom: true
        };
    }

    // { 'Area 14 - Lawn of Joy': { ...SECTION_SHAPE_MAP-compatible entry... } }
    function customShapeEntries(layers) {
        const out = {};
        customAreaLayers(layers).forEach(v => { out[v.name] = shapeEntryFromLayer(v); });
        return out;
    }

    // ── Custom (non-area) architectural & decorative parts (walls, blocks, rotary, buildings) ──
    function circlePolygonPoints(count) {
        const n = Math.max(8, Math.min(32, Math.round(Number(count) || 16)));
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            pts.push({
                x: round2(50 + Math.cos(a) * 46),
                y: round2(50 + Math.sin(a) * 46)
            });
        }
        return pts;
    }

    const PART_PRESETS = {
        'block': {
            name: 'Side Block',
            fill: '#f3ecd8',
            stroke: '#2f332e',
            strokeWidth: 2.5,
            dashed: false,
            label: '',
            width: 8.5,
            shapeAspect: 1.0,
            fenceInclude: true,
            points: [
                { x: 34, y: 6 },
                { x: 96, y: 44 },
                { x: 58, y: 96 },
                { x: 4, y: 58 }
            ]
        },
        'wing-wall': {
            name: 'Entrance Wing Wall',
            fill: '#f3ecd8',
            stroke: '#2f332e',
            strokeWidth: 2.5,
            dashed: false,
            label: '',
            width: 22.0,
            shapeAspect: 0.9,
            fenceInclude: true,
            points: [
                { x: 6, y: 6 },
                { x: 18, y: 4 },
                { x: 26, y: 76 },
                { x: 96, y: 84 },
                { x: 94, y: 96 },
                { x: 14, y: 88 }
            ]
        },
        'wall-strip': {
            name: 'Wall Segment',
            fill: '#e8dfc7',
            stroke: '#2f332e',
            strokeWidth: 2.5,
            dashed: false,
            label: '',
            width: 18.0,
            shapeAspect: 0.22,
            fenceInclude: true,
            points: [
                { x: 2, y: 10 },
                { x: 98, y: 10 },
                { x: 98, y: 90 },
                { x: 2, y: 90 }
            ]
        },
        'creek-wall': {
            name: 'Blue Border / Waterway',
            fill: '#2d88a8',
            stroke: '#184b5e',
            strokeWidth: 2.5,
            dashed: false,
            label: '',
            width: 16.0,
            shapeAspect: 1.1,
            fenceInclude: true,
            points: [
                { x: 10, y: 4 },
                { x: 78, y: 34 },
                { x: 96, y: 86 },
                { x: 82, y: 96 },
                { x: 66, y: 42 },
                { x: 4, y: 16 }
            ]
        },
        'rotary': {
            name: 'Roundabout Plaza',
            fill: '#f7f5ef',
            stroke: '#444a43',
            strokeWidth: 2.5,
            dashed: false,
            label: '',
            width: 10.5,
            shapeAspect: 1.0,
            fenceInclude: true,
            points: circlePolygonPoints(16)
        },
        'chapel': {
            name: 'Admin Office / Chapel',
            fill: '#e6dec8',
            stroke: '#2f332e',
            strokeWidth: 2.5,
            dashed: false,
            label: 'OFFICE',
            width: 12.0,
            shapeAspect: 0.65,
            fenceInclude: true,
            points: [
                { x: 4, y: 6 },
                { x: 96, y: 6 },
                { x: 96, y: 94 },
                { x: 4, y: 94 }
            ]
        }
    };

    function sanitizeSvgColor(raw, fallback) {
        const s = String(raw || '').trim();
        if (s === 'none' || s === 'transparent') return s;
        if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
        return fallback;
    }

    function escapeXmlText(raw) {
        return String(raw || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function buildPartSvgDataUrl(part) {
        const p = part || {};
        const W = 240;
        const aspect = clampNum(Number(p.shapeAspect) || 1.0, 0.12, 6.0);
        const H = Math.max(24, Math.round(W * aspect));
        const cleanPts = sanitizePolygonPoints(p.points, MIN_POLYGON_POINTS) || defaultShapePoints(4, aspect);
        const ptsPx = cleanPts.map(pt => ({
            x: Number(((pt.x / 100) * W).toFixed(2)),
            y: Number(((pt.y / 100) * H).toFixed(2))
        }));
        const ptAttr = ptsPx.map(pt => pt.x + ',' + pt.y).join(' ');
        const fill = sanitizeSvgColor(p.fill, '#f3ecd8');
        const stroke = sanitizeSvgColor(p.stroke, '#2f332e');
        const strokeW = clampNum(p.strokeWidth !== undefined ? Number(p.strokeWidth) : 2.5, 0, 14);
        const dashAttr = p.dashed ? ' stroke-dasharray="10 6"' : '';
        const label = String(p.label || '').trim().slice(0, 24);
        const labelColor = sanitizeSvgColor(p.labelColor, '#232924');

        let labelSvg = '';
        if (label) {
            const center = polygonCentroid(ptsPx);
            const fontSize = clampNum(Math.round(Math.min(W, H) * 0.16), 11, 32);
            const lx = clampNum(center.x, W * 0.12, W * 0.88).toFixed(1);
            const ly = clampNum(center.y + fontSize * 0.34, fontSize * 0.9, H - fontSize * 0.25).toFixed(1);
            labelSvg = '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="' + fontSize + '" fill="' + labelColor + '">' + escapeXmlText(label) + '</text>';
        }

        const borderSvg = (stroke !== 'none' && strokeW > 0)
            ? '<g clip-path="url(#partClip)"><polygon points="' + ptAttr + '" fill="none" stroke="' + stroke + '" stroke-width="' + (strokeW * 2).toFixed(1) + '" stroke-linejoin="miter"' + dashAttr + '/></g>'
            : '';

        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
            '<defs><clipPath id="partClip"><polygon points="' + ptAttr + '"/></clipPath></defs>' +
            '<polygon points="' + ptAttr + '" fill="' + fill + '"/>' +
            borderSvg +
            labelSvg +
            '</svg>';
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    function isPointInPolygonPct(px, py, poly) {
        const clean = sanitizePolygonPoints(poly, MIN_POLYGON_POINTS);
        if (!clean) return true;
        let inside = false;
        for (let i = 0, j = clean.length - 1; i < clean.length; j = i++) {
            const xi = clean[i].x, yi = clean[i].y;
            const xj = clean[j].x, yj = clean[j].y;
            const intersect = ((yi > py) !== (yj > py)) &&
                (px < ((xj - xi) * (py - yi)) / ((yj - yi) || 1e-9) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function mergeLayoutLayers(defaultVectors, savedLayers) {
        const defaults = Array.isArray(defaultVectors) ? defaultVectors : [];
        if (!Array.isArray(savedLayers) || savedLayers.length === 0) {
            return defaults.map(d => ({ ...d, visible: d.visible !== false }));
        }
        const filtered = savedLayers.filter(v => v && !isLegacyWall(v));
        const mergedDefaults = defaults.map(def => {
            const found = filtered.find(p =>
                (def.area != null && p.area != null && String(p.area) === String(def.area) && !p.custom) ||
                p.id === def.id
            );
            if (!found) return { ...def, visible: def.visible !== false };
            return {
                ...def,
                left: typeof found.left === 'number' ? found.left : def.left,
                top: typeof found.top === 'number' ? found.top : def.top,
                width: typeof found.width === 'number' ? found.width : def.width,
                rotate: typeof found.rotate === 'number' ? found.rotate : def.rotate,
                opacity: typeof found.opacity === 'number' ? found.opacity : (def.opacity ?? 1),
                zIndex: typeof found.zIndex === 'number' ? found.zIndex : (def.zIndex || 5),
                visible: found.visible !== false
            };
        });

        const defaultIds = new Set(defaults.map(d => d.id));
        const defaultAreas = new Set(defaults.map(d => String(d.area)));
        const extras = filtered.filter(p => {
            if (isEntrance(p) || isDecorPart(p) || isCustomArea(p)) return true;
            return !defaultIds.has(p.id) && (!p.area || !defaultAreas.has(String(p.area)));
        }).map(p => {
            if (isEntrance(p)) {
                return {
                    ...p,
                    kind: 'entrance',
                    visible: p.visible !== false,
                    src: p.src || entranceSvgDataUrl()
                };
            }
            if (isDecorPart(p)) {
                const fenceExclude = !!p.fenceExclude;
                const copy = {
                    ...p,
                    kind: 'decor',
                    custom: false,
                    area: null,
                    visible: p.visible !== false,
                    fenceExclude,
                    fenceInclude: !fenceExclude
                };
                if (Array.isArray(copy.points) && copy.points.length >= MIN_POLYGON_POINTS) {
                    copy.src = buildPartSvgDataUrl(copy);
                }
                return copy;
            }
            if (isCustomArea(p)) {
                const copy = {
                    ...p,
                    custom: true,
                    visible: p.visible !== false
                };
                if (copy.preserveCustomSrc && copy.src) {
                    delete copy.points;
                } else {
                    copy.src = (Array.isArray(copy.points) && copy.points.length >= MIN_POLYGON_POINTS)
                        ? buildAreaSvgDataUrl(copy.cols || 20, copy.rows || 20, copy.area, copy.points, copy.shapeAspect)
                        : (copy.src || buildAreaSvgDataUrl(copy.cols || 6, copy.rows || 5, copy.area));
                }
                return copy;
            }
            return { ...p, visible: p.visible !== false };
        });

        return mergedDefaults.concat(extras);
    }

    function computeContentFitTransform(board, viewportRect, boardW, boardH, itemSelector, opts) {
        opts = opts || {};
        const minZ = opts.minZoom != null ? opts.minZoom : 0.3;
        const maxZ = opts.maxZoom != null ? opts.maxZoom : 1.4;
        const pad = opts.padding != null ? opts.padding : 48;
        const vw = Math.max(100, viewportRect ? viewportRect.width : 800);
        const vh = Math.max(100, viewportRect ? viewportRect.height : 600);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        if (board && typeof board.querySelectorAll === 'function') {
            const items = board.querySelectorAll(itemSelector);
            for (let i = 0; i < items.length; i++) {
                const el = items[i];
                if (el.style && el.style.display === 'none') continue;
                const leftPct = parseFloat(el.dataset && el.dataset.leftPct !== undefined ? el.dataset.leftPct : el.style.left);
                const topPct = parseFloat(el.dataset && el.dataset.topPct !== undefined ? el.dataset.topPct : el.style.top);
                const widthPct = parseFloat(el.dataset && el.dataset.widthPct !== undefined ? el.dataset.widthPct : el.style.width);
                if (!Number.isFinite(leftPct) || !Number.isFinite(topPct) || !Number.isFinite(widthPct) || widthPct <= 0) continue;

                const w = (widthPct / 100) * boardW;
                let aspect = parseFloat(el.dataset && el.dataset.aspectRatio);
                if (!Number.isFinite(aspect) || aspect <= 0) {
                    aspect = (el.naturalWidth > 0 && el.naturalHeight > 0)
                        ? (el.naturalHeight / el.naturalWidth)
                        : (el.offsetWidth > 0 && el.offsetHeight > 0 ? (el.offsetHeight / el.offsetWidth) : 1);
                }
                const h = w * aspect;
                const x0 = (leftPct / 100) * boardW;
                const y0 = (topPct / 100) * boardH;
                const cx = x0 + w / 2;
                const cy = y0 + h / 2;
                const rotMatch = el.style && el.style.transform ? /rotate\(([-\d.]+)deg\)/.exec(el.style.transform) : null;
                const deg = parseFloat((el.dataset && el.dataset.rotate !== undefined) ? el.dataset.rotate : (rotMatch ? rotMatch[1] : '0')) || 0;
                const rad = (deg * Math.PI) / 180;
                const bw = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
                const bh = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
                minX = Math.min(minX, cx - bw / 2);
                maxX = Math.max(maxX, cx + bw / 2);
                minY = Math.min(minY, cy - bh / 2);
                maxY = Math.max(maxY, cy + bh / 2);
            }
        }

        if (!Number.isFinite(minX) || maxX <= minX || maxY <= minY) {
            const zoom = Math.max(minZ, Math.min((vw - pad) / 1540, (vh - pad) / 1460, maxZ));
            return { zoom, panX: -110 * zoom, panY: 180 * zoom };
        }

        const margin = opts.fenceMargin != null ? opts.fenceMargin : 70;
        const cMinX = minX - margin;
        const cMaxX = maxX + margin;
        const cMinY = minY - margin;
        const cMaxY = maxY + margin;
        const contentW = Math.max(200, cMaxX - cMinX);
        const contentH = Math.max(200, cMaxY - cMinY);
        const zoom = Math.max(minZ, Math.min((vw - pad) / contentW, (vh - pad) / contentH, maxZ));
        const midX = (cMinX + cMaxX) / 2;
        const midY = (cMinY + cMaxY) / 2;
        return {
            zoom,
            panX: -(midX - boardW / 2) * zoom,
            panY: -(midY - boardH / 2) * zoom
        };
    }

    async function fetchMapConfigFromSupabase(client) {
        if (!client || typeof client.from !== 'function') return null;
        try {
            const { data, error } = await client
                .from('memorial_spaces')
                .select('coordinates')
                .eq('plot_identifier', 'ZMG-MAP-VECTOR-LAYOUT-CONFIG')
                .maybeSingle();
            if (!error && data && data.coordinates) return data.coordinates;
        } catch (_) {}
        return null;
    }

    function readStoredLayers() {
        try {
            const parsed = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    window.ZMGFence = {
        ASPECT: ENTRANCE_ASPECT,
        CATEGORY_TABS,
        FENCE_STORAGE_KEY,
        MIN_POLYGON_POINTS,
        MAX_POLYGON_POINTS,
        isEntrance,
        isDecorPart,
        isStructural,
        isLegacyWall,
        isFenceable,
        PART_PRESETS,
        circlePolygonPoints,
        buildPartSvgDataUrl,
        entranceSvgDataUrl,
        createEntranceLayer,
        sanitizePolygonPoints,
        isPointInPolygonPct,
        mergeLayoutLayers,
        computeContentFitTransform,
        fetchMapConfigFromSupabase,
        readStoredFenceConfig,
        writeStoredFenceConfig,
        rectToPolygonPoints,
        defaultShapePoints,
        resamplePolygonPoints,
        computeFenceRect,
        computeFencePolygon,
        nearestPolygonEdge,
        snapEntrance,
        render,
        removeFence,
        buildAreaSvgDataUrl,
        isCustomArea,
        customAreaLayers,
        shapeEntryFromLayer,
        customShapeEntries,
        readStoredLayers
    };
})();

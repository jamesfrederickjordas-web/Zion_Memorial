// ==============================================================================
// MAP VECTOR LAYOUT CONTROLLER & ADMIN DRAG-AND-DROP EDITOR
// Zion Memorial Garden - Cloud-Based Online Reservation & Records Management
// ==============================================================================

const MAP_VECTOR_STORAGE_KEY = 'zion_cemetery_map_vector_layout_v2';

// ==============================================================================
// MAP VECTOR ASSET TO REAL CEMETERY AREA MAPPING
// Each vector PNG has its actual Area number stamped directly into the artwork:
//   Vector (7)  -> Area 1
//   Vector (8)  -> Area 2
//   Vector (9)  -> Area 3
//   Vector (12) -> Area 4
//   Vector (13) -> Area 5
//   Vector (6)  -> Area 6
//   Vector (5)  -> Area 7
//   Vector (10) -> Area 8
//   Vector (11) -> Area 9
//   Vector (14) -> Area 10
//   Vector (3)  -> Area 11
//   Vector (4)  -> Area 12
//   Group 109   -> Base Framework
// ==============================================================================
const VECTOR_FILE_TO_AREA = {
    'Vector (7).png':  { area: '1',  name: 'Area 1 - Single Tiered Lawn', category: 'Single Teired', tab: 'single-teired', desc: 'Area 1 - Single Tiered Lawn entry area' },
    'Vector (8).png':  { area: '2',  name: 'Area 2 - Lawn of Love', category: 'Special Supreme', tab: 'special-supreme', desc: 'Area 2 - Lawn of Love memorial section' },
    'Vector (9).png':  { area: '3',  name: 'Area 3 - Lawn of Hope (Family Estate)', category: 'Family Estate Jr.', tab: 'family-estate', desc: 'Area 3 - Lawn of Hope (Family Estate) memorial section' },
    'Vector (12).png': { area: '4',  name: 'Area 4 - Supreme Garden', category: 'Supreme', tab: 'supreme', desc: 'Area 4 - Supreme Garden memorial section' },
    'Vector (13).png': { area: '5',  name: 'Area 5 - Special Supreme Estate', category: 'Special Supreme', tab: 'special-supreme', desc: 'Area 5 - Special Supreme Estate central lawn' },
    'Vector (6).png':  { area: '6',  name: 'Area 6 - Lawn of Peace', category: 'Single Teired', tab: 'single-teired', desc: 'Area 6 - Lawn of Peace memorial section' },
    'Vector (5).png':  { area: '7',  name: 'Area 7 - Lawn of Faith', category: 'Supreme', tab: 'supreme', desc: 'Area 7 - Lawn of Faith memorial section' },
    'Vector (10).png': { area: '8',  name: 'Area 8 - Lawn of Grace', category: 'Supreme', tab: 'supreme', desc: 'Area 8 - Lawn of Grace memorial section' },
    'Vector (11).png': { area: '9',  name: 'Area 9 - Lawn of Serenity', category: 'Special Supreme', tab: 'special-supreme', desc: 'Area 9 - Lawn of Serenity memorial section' },
    'Vector (14).png': { area: '10', name: 'Area 10 - Condominium Block A', category: 'Condominium', tab: 'condominium', desc: 'Area 10 - Condominium Block A lawn & niches' },
    'Vector (3).png':  { area: '11', name: 'Area 11 - Lawn of Memories', category: 'Special Supreme', tab: 'special-supreme', desc: 'Area 11 - Lawn of Memories memorial section' },
    'Vector (4).png':  { area: '12', name: 'Area 12 - Mausoleum Court', category: 'Mausoleum', tab: 'mausoleum', desc: 'Area 12 - Mausoleum Court memorial section' }
};

// Default layout coordinates calibrated for Zion Memorial Garden vector assets (ZERO OVERLAPS)
const DEFAULT_MAP_VECTORS = [
    {
        id: 'vector-14',
        area: '10',
        name: 'Area 10 - Condominium Block A',
        src: 'assets/images/Map/Vector (14).png',
        left: 41.0,
        top: 4.0,
        width: 18.0,
        rotate: 0,
        opacity: 1.0,
        zIndex: 5,
        desc: 'Area 10 - Condominium Block A lawn & niches'
    },
    {
        id: 'vector-12',
        area: '4',
        name: 'Area 4 - Supreme Garden',
        src: 'assets/images/Map/Vector (12).png',
        left: 24.0,
        top: 25.0,
        width: 15.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 4 - Supreme Garden memorial section'
    },
    {
        id: 'vector-11',
        area: '9',
        name: 'Area 9 - Lawn of Serenity',
        src: 'assets/images/Map/Vector (11).png',
        left: 42.0,
        top: 25.0,
        width: 14.5,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 9 - Lawn of Serenity memorial section'
    },
    {
        id: 'vector-10',
        area: '8',
        name: 'Area 8 - Lawn of Grace',
        src: 'assets/images/Map/Vector (10).png',
        left: 59.0,
        top: 27.0,
        width: 8.5,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 8 - Lawn of Grace memorial section'
    },
    {
        id: 'vector-13',
        area: '5',
        name: 'Area 5 - Special Supreme Estate',
        src: 'assets/images/Map/Vector (13).png',
        left: 42.0,
        top: 46.0,
        width: 14.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 5 - Special Supreme Estate central lawn'
    },
    {
        id: 'vector-5',
        area: '7',
        name: 'Area 7 - Lawn of Faith',
        src: 'assets/images/Map/Vector (5).png',
        left: 58.5,
        top: 44.5,
        width: 9.5,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 7 - Lawn of Faith memorial section'
    },
    {
        id: 'vector-6',
        area: '6',
        name: 'Area 6 - Lawn of Peace',
        src: 'assets/images/Map/Vector (6).png',
        left: 58.0,
        top: 66.0,
        width: 9.5,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 6 - Lawn of Peace memorial section'
    },
    {
        id: 'vector-3',
        area: '11',
        name: 'Area 11 - Lawn of Memories',
        src: 'assets/images/Map/Vector (3).png',
        left: 70.0,
        top: 43.0,
        width: 6.5,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 11 - Lawn of Memories memorial section'
    },
    {
        id: 'vector-4',
        area: '12',
        name: 'Area 12 - Mausoleum Court',
        src: 'assets/images/Map/Vector (4).png',
        left: 78.5,
        top: 45.0,
        width: 12.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 12 - Mausoleum Court memorial section'
    },
    {
        id: 'vector-8',
        area: '2',
        name: 'Area 2 - Lawn of Love',
        src: 'assets/images/Map/Vector (8).png',
        left: 24.0,
        top: 48.5,
        width: 15.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 2 - Lawn of Love memorial section'
    },
    {
        id: 'vector-9',
        area: '3',
        name: 'Area 3 - Lawn of Hope (Family Estate)',
        src: 'assets/images/Map/Vector (9).png',
        left: 7.0,
        top: 48.5,
        width: 15.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 3 - Lawn of Hope (Family Estate) memorial section'
    },
    {
        id: 'vector-7',
        area: '1',
        name: 'Area 1 - Single Tiered Lawn',
        src: 'assets/images/Map/Vector (7).png',
        left: 16.0,
        top: 73.5,
        width: 15.0,
        rotate: 0,
        opacity: 0.95,
        zIndex: 5,
        desc: 'Area 1 - Single Tiered Lawn entry area'
    }
];

// Working layout state
let currentVectorLayout = [];
let activeVectorId = 'vector-14';
let isMapEditorActive = false;
let isDraggingVector = false;
let dragStartX = 0;
let dragStartY = 0;
let initialVectorLeft = 0;
let initialVectorTop = 0;

// Helper: Normalize vector item metadata to ensure accurate Area names
function isLegacyWallVector(v) {
    if (!v) return true;
    if (window.ZMGFence && typeof window.ZMGFence.isLegacyWall === 'function') {
        return window.ZMGFence.isLegacyWall(v);
    }
    const src = String(v.src || '').toLowerCase();
    return v.id === 'group-109' || (!src.startsWith('data:') && (src.includes('group 109') || src.includes('cemetery-boundary')));
}

function normalizeVectorItem(v) {
    if (!v) return v;
    if (window.ZMGFence && typeof window.ZMGFence.isEntrance === 'function' && window.ZMGFence.isEntrance(v)) {
        v.kind = 'entrance';
        v.area = null;
        v.tab = null;
        if (!v.src) v.src = window.ZMGFence.entranceSvgDataUrl();
        return v;
    }
    if (window.ZMGFence && typeof window.ZMGFence.isDecorPart === 'function' && window.ZMGFence.isDecorPart(v)) {
        v.kind = 'decor';
        v.custom = false;
        v.area = null;
        v.tab = null;
        v.fenceExclude = !!v.fenceExclude;
        v.fenceInclude = !v.fenceExclude;
        if (Array.isArray(v.points) && v.points.length >= 3) {
            v.src = window.ZMGFence.buildPartSvgDataUrl(v);
        }
        return v;
    }
    const fileName = (v.src && !String(v.src).startsWith('data:')) ? v.src.split('/').pop() : '';
    const meta = fileName ? VECTOR_FILE_TO_AREA[fileName] : null;
    if (meta) {
        v.name = meta.name;
        v.desc = meta.desc;
        v.area = meta.area;
        v.category = meta.category;
        v.tab = meta.tab;
    } else if (v.custom && window.ZMGFence) {
        if (!v.tab && v.category && window.ZMGFence.CATEGORY_TABS) {
            v.tab = window.ZMGFence.CATEGORY_TABS[v.category] || 'special-supreme';
        }
        if (Array.isArray(v.points) && v.points.length >= 3) {
            v.src = window.ZMGFence.buildAreaSvgDataUrl(v.cols || 20, v.rows || 20, v.area, v.points, v.shapeAspect);
        } else if (!v.src) {
            v.src = window.ZMGFence.buildAreaSvgDataUrl(v.cols || 6, v.rows || 5, v.area);
        }
    }
    return v;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initVectorMapSystem();
});

const ZMG_DB_MAP_CONFIG_ID = 'ZMG-MAP-VECTOR-LAYOUT-CONFIG';
let lastSyncedMapSignature = null;
let mapSyncInFlight = false;
let mapLiveSyncInitialized = false;

// Exposed global init for dynamic component loaders
window.initVectorMapSystem = function() {
    loadSavedVectorLayout();
    renderVectorMapElements();
    setupMapEditorEvents();
    syncMapVectorLayoutWithSupabase(true);
    setupLiveMapSync();

    // Check if ?editMap=true query param is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('editMap') === 'true') {
        setTimeout(() => setMapEditorMode(true), 250);
    }
};

function applyCloudMapConfig(coordinates) {
    if (!coordinates || !Array.isArray(coordinates.vectorLayers)) return false;

    const sig = coordinates.updatedAt || JSON.stringify(coordinates.vectorLayers.map(v => `${v.id}:${v.left}:${v.top}:${v.width}:${v.rotate}:${v.visible}`));
    if (lastSyncedMapSignature && sig === lastSyncedMapSignature) {
        return false;
    }
    lastSyncedMapSignature = sig;

    const dbVectors = coordinates.vectorLayers
        .filter(v => !isLegacyWallVector(v))
        .map(normalizeVectorItem);
    currentVectorLayout = dbVectors;
    localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));

    if (coordinates.bgConfig) {
        localStorage.setItem('zion_cemetery_dashboard_bg_v1', JSON.stringify(coordinates.bgConfig));
        localStorage.setItem('zion_cemetery_map_bg_v1', JSON.stringify(coordinates.bgConfig));
    }
    if (coordinates.fenceConfig && window.ZMGFence) {
        window.ZMGFence.writeStoredFenceConfig(coordinates.fenceConfig);
    }
    window.dispatchEvent(new CustomEvent('zmg:vector-layout-updated', { detail: currentVectorLayout }));
    renderVectorMapElements();
    renderDashboardBg();
    return true;
}

// Cloud Sync: Fetch saved Map Vector Layout from Supabase DB (or push existing local custom layout to DB)
async function syncMapVectorLayoutWithSupabase(force = false) {
    if (typeof supabaseClient === 'undefined' || mapSyncInFlight) return;
    mapSyncInFlight = true;
    try {
        const { data: row, error } = await supabaseClient
            .from('memorial_spaces')
            .select('coordinates')
            .eq('plot_identifier', ZMG_DB_MAP_CONFIG_ID)
            .maybeSingle();

        if (!error && row && row.coordinates && Array.isArray(row.coordinates.vectorLayers)) {
            if (force) lastSyncedMapSignature = null;
            applyCloudMapConfig(row.coordinates);
            return;
        }

        // If DB has no saved layout yet, but this browser has a customized localStorage layout, push it to DB!
        const localRaw = localStorage.getItem(MAP_VECTOR_STORAGE_KEY);
        if (localRaw) {
            await persistMapVectorLayoutToSupabase(currentVectorLayout);
        }
    } catch (err) {
        console.warn('Cloud map vector sync notice:', err);
    } finally {
        mapSyncInFlight = false;
    }
}

function setupLiveMapSync() {
    if (mapLiveSyncInitialized) return;
    mapLiveSyncInitialized = true;

    // 1. Supabase Realtime subscription for instant cross-browser/cross-device updates
    if (typeof supabaseClient !== 'undefined' && typeof supabaseClient.channel === 'function') {
        try {
            supabaseClient
                .channel('zmg-map-layout-sync')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'memorial_spaces',
                        filter: `plot_identifier=eq.${ZMG_DB_MAP_CONFIG_ID}`
                    },
                    (payload) => {
                        const coords = payload && payload.new && payload.new.coordinates;
                        if (coords && Array.isArray(coords.vectorLayers)) {
                            applyCloudMapConfig(coords);
                        }
                    }
                )
                .subscribe();
        } catch (err) {
            console.warn('Map Realtime subscription notice:', err);
        }
    }

    // 2. Sync immediately when user returns to this tab or window
    window.addEventListener('focus', () => {
        syncMapVectorLayoutWithSupabase();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            syncMapVectorLayoutWithSupabase();
        }
    });

    // 3. Lightweight periodic fallback sync while tab is visible
    setInterval(() => {
        if (document.visibilityState === 'visible' && !isMapEditorActive) {
            syncMapVectorLayoutWithSupabase();
        }
    }, 15000);
}

async function persistMapVectorLayoutToSupabase(vectorsToSave) {
    if (typeof supabaseClient === 'undefined') return;
    try {
        let bgCfg = null;
        try {
            const rawBg = localStorage.getItem('zion_cemetery_dashboard_bg_v1') || localStorage.getItem('zion_cemetery_map_bg_v1');
            if (rawBg) bgCfg = JSON.parse(rawBg);
        } catch (_) {}
        const fenceCfg = window.ZMGFence ? window.ZMGFence.readStoredFenceConfig() : null;
        const updatedAt = new Date().toISOString();

        const { error } = await supabaseClient
            .from('memorial_spaces')
            .upsert([{
                plot_identifier: ZMG_DB_MAP_CONFIG_ID,
                section_name: '__SYSTEM_MAP_CONFIG__',
                category: 'Supreme',
                status: 'maintenance',
                price: 0,
                down_payment: 0,
                col_num: 0,
                row_num: 0,
                coordinates: {
                    vectorLayers: vectorsToSave,
                    bgConfig: bgCfg,
                    fenceConfig: fenceCfg,
                    updatedAt
                }
            }], { onConflict: 'plot_identifier' });
        if (error) {
            console.warn('Supabase map vector persist error:', error);
        } else {
            lastSyncedMapSignature = updatedAt;
        }
    } catch (err) {
        console.warn('Could not persist map vector layout to Supabase:', err);
    }
}

window.toggleMapVectorEditor = function() {
    setMapEditorMode(!isMapEditorActive);
};

// Listen for cross-tab updates (e.g. when user clicks Save Layout in map-editor.html)
window.addEventListener('storage', (e) => {
    if (e.key === MAP_VECTOR_STORAGE_KEY) {
        loadSavedVectorLayout();
        renderVectorMapElements();
        window.dispatchEvent(new CustomEvent('zmg:vector-layout-updated', { detail: currentVectorLayout }));
    }
    if (e.key === 'zion_cemetery_fence_config_v1') {
        renderVectorMapElements();
    }
    if (e.key === 'zion_cemetery_dashboard_bg_v1' || e.key === 'zion_cemetery_map_bg_v1') {
        renderDashboardBg();
    }
});

// Load saved layout from localStorage with fallback to defaults
function loadSavedVectorLayout() {
    try {
        const saved = localStorage.getItem(MAP_VECTOR_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Filter out legacy Group 109 red/green pixel grid and normalize area names
                currentVectorLayout = parsed
                    .filter(v => !isLegacyWallVector(v))
                    .map(normalizeVectorItem);
                if (currentVectorLayout.length > 0) return;
            }
        }
    } catch (e) {
        console.warn('Failed to parse saved vector map layout:', e);
    }
    // Deep clone defaults with normalized names
    currentVectorLayout = JSON.parse(JSON.stringify(DEFAULT_MAP_VECTORS)).map(normalizeVectorItem);
}

// Only Group 109 (base framework & roads) is structural.
// All 12 cemetery Area vectors (1 to 12) are interactive plot areas on the dashboard.
const STRUCTURAL_VECTOR_IDS = new Set(['group-109']);

// Returns true if this vector is an interactive plot area (clickable on dashboard)
function isPlotVector(vectorOrId, src = '') {
    const v = (vectorOrId && typeof vectorOrId === 'object') ? vectorOrId : { id: vectorOrId, src };
    if (window.ZMGFence) {
        if (ZMGFence.isEntrance(v) || ZMGFence.isStructural(v) || ZMGFence.isLegacyWall(v)) return false;
        if (v.kind === 'decor') return false;
        return true;
    }
    const vectorId = String(v.id || '');
    const vSrc = String(v.src || src || '');
    if (STRUCTURAL_VECTOR_IDS.has(vectorId)) return false;
    if (v.kind === 'entrance' || v.kind === 'decor') return false;
    if (vSrc && !vSrc.startsWith('data:') && (vSrc.includes('Group 109') || vSrc.includes('boundary') || vSrc.includes('Framework') || vSrc.includes('cemetery-boundary'))) return false;
    return true;
}

// ── Render background image from map-editor's published localStorage key ──
function renderDashboardBg(targetCanvas = null, bgImgId = null) {
    const canvas = targetCanvas || document.getElementById('vectorMapCanvas');
    if (!canvas) return;

    const dashKey = 'zion_cemetery_dashboard_bg_v1';
    let cfg = null;

    try {
        const saved = localStorage.getItem(dashKey);
        if (saved) cfg = JSON.parse(saved);
    } catch (e) {
        console.warn('Dashboard BG render error:', e);
    }

    // Walls/boundary default background removed — perimeter fence is rendered dynamically around active areas.
    const defaultBgSrc = '';
    const rawBgSrc = (cfg && cfg.src) ? String(cfg.src) : '';
    const src = (rawBgSrc && !rawBgSrc.includes('cemetery-boundary') && !rawBgSrc.includes('Group 109')) ? rawBgSrc : defaultBgSrc;
    const opacity = (cfg && cfg.opacity !== undefined) ? cfg.opacity : 1.0;
    const visible = (cfg && cfg.visible !== undefined) ? cfg.visible : true;
    const x = (cfg && cfg.x) ? cfg.x : 0;
    const y = (cfg && cfg.y) ? cfg.y : 0;
    const scale = (cfg && cfg.scale) ? cfg.scale : 1.0;
    const rotate = (cfg && cfg.rotate !== undefined) ? cfg.rotate : 0;

    const elementId = bgImgId || (canvas.id === 'modalVectorMapCanvas' ? 'modalDashboardBgImg' : 'dashboardBgImg');
    let bgEl = document.getElementById(elementId);
    if (!bgEl) {
        bgEl = document.createElement('img');
        bgEl.id = elementId;
        bgEl.alt = 'Cemetery Map Background';
    }

    // Hide standalone bg unless a custom non-boundary background was explicitly set
    const hasVectorBg = currentVectorLayout && currentVectorLayout.some(v => v.src && !String(v.src).startsWith('data:') && (v.src.includes('Group 109') || v.src.includes('cemetery-boundary') || v.src.includes('boundary')));
    if (!src || hasVectorBg) {
        bgEl.style.display = 'none';
        return;
    }

    Object.assign(bgEl.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        zIndex: '0',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: `${opacity}`,
        display: visible ? 'block' : 'none',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotate}deg) scale(${scale})`
    });

    bgEl.src = src;

    // Ensure it is placed as the very first element (behind all vectors)
    if (!bgEl.parentNode || bgEl.parentNode !== canvas) {
        canvas.insertBefore(bgEl, canvas.firstChild);
    }
}

// Render all vector layers on canvas (supports both dashboard canvas & modal canvas)
function renderVectorMapElements() {
    const targetCanvases = [
        document.getElementById('vectorMapCanvas'),
        document.getElementById('modalVectorMapCanvas')
    ].filter(Boolean);

    if (targetCanvases.length === 0) return;

    targetCanvases.forEach(canvas => {
        const isModal = (canvas.id === 'modalVectorMapCanvas');
        const bgImgId = isModal ? 'modalDashboardBgImg' : 'dashboardBgImg';

        // The blueprint reference guide is disabled on the client dashboard
        if (!isModal) {
            const blueprint = document.getElementById('mapBlueprintReference');
            if (blueprint) {
                blueprint.style.display = 'none';
            }
        }

        const dashBg = document.getElementById(bgImgId);

        canvas.innerHTML = '';

        // Re-attach background first (lowest z-index)
        if (dashBg) canvas.appendChild(dashBg);

        // Refresh BG from configuration or default boundary
        renderDashboardBg(canvas, bgImgId);

        currentVectorLayout.forEach(v => {
            if (v.visible === false && !(isMapEditorActive && !isModal)) return;
            const fileName = v.src ? v.src.split('/').pop() : '';
            const meta = VECTOR_FILE_TO_AREA[fileName];
            const areaId = (meta && meta.area) ? meta.area : (v.area || null);

            const img = document.createElement('img');
            img.id = `${isModal ? 'modal-' : ''}vec-item-${v.id}`;
            img.className = `map-vector-element ${v.id === activeVectorId && isMapEditorActive && !isModal ? 'selected-vector' : ''}`;
            img.src = v.src;
            img.alt = v.name;
            img.dataset.vectorId = v.id;
            if (areaId) {
                img.dataset.areaId = String(areaId);
            }

            // Apply spatial properties
            img.style.position = 'absolute';
            img.style.left = `${v.left}%`;
            img.style.top = `${v.top}%`;
            img.style.width = `${v.width}%`;
            img.style.height = 'auto';
            img.style.transform = `rotate(${v.rotate || 0}deg)`;
            img.style.opacity = `${v.opacity ?? 1.0}`;
            img.style.zIndex = `${v.zIndex || 5}`;
            img.style.userSelect = 'none';
            img.draggable = false;

            if (isMapEditorActive && !isModal) {
                // Admin editor — all vectors are draggable
                img.title = `${v.name} - ${v.desc} [Click or drag to move]`;
                img.style.cursor = 'grab';
                img.style.pointerEvents = 'auto';

                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectVectorLayer(v.id);
                });
                img.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    selectVectorLayer(v.id);
                    startVectorDrag(e, v);
                });
            } else {
                // Client view — only plot vectors are interactive (default + custom areas)
                if (isPlotVector(v, v.src)) {
                    img.title = `${v.name} - ${v.desc || v.name} [Click to select this lawn category]`;
                    img.style.cursor = 'pointer';
                    img.style.pointerEvents = 'auto';

                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isModal) {
                            // Inside modal: highlight vector and switch category
                            if (areaId && typeof window.selectCemeteryArea === 'function') {
                                window.selectCemeteryArea(areaId, false);
                            }
                        } else {
                            // On dashboard: select area & trigger animated transition to reservation map
                            handleClientVectorClick(v, e);
                        }
                    });
                } else {
                    // Structural / entrance elements — pass-through clicks
                    img.title = (window.ZMGFence && window.ZMGFence.isEntrance(v)) ? (v.name || 'Main Entrance Gate') : '';
                    img.style.cursor = 'default';
                    img.style.pointerEvents = 'none';
                }
            }

            if (window.ZMGFence && typeof window.ZMGFence.render === 'function') {
                img.addEventListener('load', () => {
                    window.ZMGFence.render(canvas, currentVectorLayout, { clamp: true });
                });
            }

            canvas.appendChild(img);
        });

        if (window.ZMGFence && typeof window.ZMGFence.render === 'function') {
            window.ZMGFence.render(canvas, currentVectorLayout, { clamp: true });
        }
    });

    updateInspectorValues();
}

// Client click on vector opens reservation modal pre-populated with area info via smooth map transition
function handleClientVectorClick(vector, clickEvent = null) {
    const fileName = (vector.src && !String(vector.src).startsWith('data:')) ? vector.src.split('/').pop() : '';
    const meta = fileName ? VECTOR_FILE_TO_AREA[fileName] : null;
    const areaId = (meta && meta.area) ? meta.area : (vector.area || null);
    const areaName = meta ? meta.name : (vector.name || `Area ${areaId}`);
    const resolvedCategory = (meta && meta.category) ? meta.category : (vector.category || '');
    const resolvedTab = (meta && meta.tab)
        ? meta.tab
        : (vector.tab || (window.ZMGFence && window.ZMGFence.CATEGORY_TABS && window.ZMGFence.CATEGORY_TABS[resolvedCategory]) || null);

    // Persist selected area in sessionStorage for cross-component access
    sessionStorage.setItem('selectedMapArea', JSON.stringify({
        id:       vector.id,
        area:     areaId,
        name:     areaName,
        category: resolvedCategory,
        desc:     vector.desc || areaName,
        tab:      resolvedTab
    }));

    // If dashboard loader's selectCemeteryArea is available, switch lawn tab, filter plots & run map animation transition
    if (areaId && typeof window.selectCemeteryArea === 'function') {
        window.selectCemeteryArea(areaId, true, clickEvent);
        return;
    }

    // Direct fallback: open reservation modal
    if (typeof window.openReservationModal === 'function') {
        window.openReservationModal({ targetAreaId: areaId, clickEvent: clickEvent });
    } else {
        const modal = document.querySelector('.reservation-modal-overlay') || document.getElementById('reservationModal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }
}

// ==============================================================================
// DRAG AND DROP HANDLING
// ==============================================================================
function startVectorDrag(e, vector) {
    isDraggingVector = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialVectorLeft = Number(vector.left);
    initialVectorTop = Number(vector.top);

    const targetEl = document.getElementById(`vec-item-${vector.id}`);
    if (targetEl) targetEl.style.cursor = 'grabbing';

    window.addEventListener('mousemove', onVectorDragMove);
    window.addEventListener('mouseup', onVectorDragEnd);
}

function onVectorDragMove(e) {
    if (!isDraggingVector) return;

    const canvas = document.getElementById('vectorMapCanvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // Convert pixels to percentage of canvas width/height
    const deltaLeftPct = (deltaX / canvasRect.width) * 100;
    const deltaTopPct = (deltaY / canvasRect.height) * 100;

    const target = currentVectorLayout.find(v => v.id === activeVectorId);
    if (target) {
        target.left = parseFloat((initialVectorLeft + deltaLeftPct).toFixed(1));
        target.top = parseFloat((initialVectorTop + deltaTopPct).toFixed(1));

        const targetEl = document.getElementById(`vec-item-${target.id}`);
        if (targetEl) {
            targetEl.style.left = `${target.left}%`;
            targetEl.style.top = `${target.top}%`;
        }

        updateInspectorValues();
    }
}

function onVectorDragEnd() {
    if (!isDraggingVector) return;
    isDraggingVector = false;

    const targetEl = document.getElementById(`vec-item-${activeVectorId}`);
    if (targetEl) targetEl.style.cursor = 'grab';

    window.removeEventListener('mousemove', onVectorDragMove);
    window.removeEventListener('mouseup', onVectorDragEnd);

    // Auto-save draft in localStorage
    localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
}

// ==============================================================================
// INSPECTOR PANEL & CONTROLS
// ==============================================================================
function setupMapEditorEvents() {
    const toggleBtn = document.getElementById('btnToggleMapEditor');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            setMapEditorMode(!isMapEditorActive);
        });
    }

    const directBtn = document.getElementById('btnOpenMapEditorDirect');
    if (directBtn) {
        directBtn.addEventListener('click', () => {
            setMapEditorMode(true);
        });
    }

    // Layer selector dropdown
    const layerSelect = document.getElementById('inspectorLayerSelect');
    if (layerSelect) {
        layerSelect.innerHTML = currentVectorLayout.map(v => `
            <option value="${v.id}">${v.name}</option>
        `).join('');

        layerSelect.addEventListener('change', (e) => {
            selectVectorLayer(e.target.value);
        });
    }

    // Range & number inputs
    bindInspectorInput('inputLeftRange', 'inputLeftNum', 'left', val => `${val}%`);
    bindInspectorInput('inputTopRange', 'inputTopNum', 'top', val => `${val}%`);
    bindInspectorInput('inputWidthRange', 'inputWidthNum', 'width', val => `${val}%`);
    bindInspectorInput('inputRotateRange', 'inputRotateNum', 'rotate', val => `rotate(${val}deg)`);
    bindInspectorInput('inputOpacityRange', 'inputOpacityNum', 'opacity', val => `${val}`);
    bindInspectorInput(null, 'inputZIndexNum', 'zIndex', val => `${val}`);

    // Directional Nudge Buttons
    setupNudgeButton('btnNudgeUp', 0, -0.5);
    setupNudgeButton('btnNudgeDown', 0, 0.5);
    setupNudgeButton('btnNudgeLeft', -0.5, 0);
    setupNudgeButton('btnNudgeRight', 0.5, 0);

    // Rotate shortcut buttons
    const btnRotateCcw = document.getElementById('btnRotateCcw');
    if (btnRotateCcw) {
        btnRotateCcw.addEventListener('click', () => nudgeProperty('rotate', -5));
    }
    const btnRotateCw = document.getElementById('btnRotateCw');
    if (btnRotateCw) {
        btnRotateCw.addEventListener('click', () => nudgeProperty('rotate', 5));
    }
    const btnRotateZero = document.getElementById('btnRotateZero');
    if (btnRotateZero) {
        btnRotateZero.addEventListener('click', () => setProperty('rotate', 0));
    }

    // Blueprint Reference Opacity Slider
    const blueprintSlider = document.getElementById('blueprintOpacitySlider');
    if (blueprintSlider) {
        blueprintSlider.addEventListener('input', (e) => {
            const blueprint = document.getElementById('mapBlueprintReference');
            if (blueprint) blueprint.style.opacity = `${e.target.value}`;
        });
    }

    // Save Button
    const btnSave = document.getElementById('btnSaveMapVectorLayout') || document.getElementById('adminSaveVectorLayoutBtn');
    if (btnSave) {
        btnSave.addEventListener('click', saveVectorLayout);
    }

    // Reset Button
    const btnReset = document.getElementById('btnResetMapVectorLayout') || document.getElementById('adminResetVectorLayoutBtn');
    if (btnReset) {
        btnReset.addEventListener('click', resetVectorLayout);
    }

    // Export Button
    const btnExport = document.getElementById('btnExportMapVectorLayout') || document.getElementById('adminExportVectorLayoutBtn');
    if (btnExport) {
        btnExport.addEventListener('click', exportVectorLayoutJson);
    }
}

function bindInspectorInput(rangeId, numId, propKey, cssFormatFn) {
    const rangeEl = rangeId ? document.getElementById(rangeId) : null;
    const numEl = numId ? document.getElementById(numId) : null;

    const updateProp = (val) => {
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return;

        const target = currentVectorLayout.find(v => v.id === activeVectorId);
        if (target) {
            target[propKey] = numVal;
            const targetEl = document.getElementById(`vec-item-${target.id}`);
            if (targetEl) {
                if (propKey === 'left' || propKey === 'top' || propKey === 'width') {
                    targetEl.style[propKey] = `${numVal}%`;
                } else if (propKey === 'rotate') {
                    targetEl.style.transform = `rotate(${numVal}deg)`;
                } else if (propKey === 'opacity') {
                    targetEl.style.opacity = `${numVal}`;
                } else if (propKey === 'zIndex') {
                    targetEl.style.zIndex = `${numVal}`;
                }
            }
            if (rangeEl && rangeEl.value != numVal) rangeEl.value = numVal;
            if (numEl && numEl.value != numVal) numEl.value = numVal;
            localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
        }
    };

    if (rangeEl) rangeEl.addEventListener('input', (e) => updateProp(e.target.value));
    if (numEl) numEl.addEventListener('change', (e) => updateProp(e.target.value));
}

function setupNudgeButton(btnId, deltaLeft, deltaTop) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const target = currentVectorLayout.find(v => v.id === activeVectorId);
        if (target) {
            target.left = parseFloat((target.left + deltaLeft).toFixed(1));
            target.top = parseFloat((target.top + deltaTop).toFixed(1));
            const targetEl = document.getElementById(`vec-item-${target.id}`);
            if (targetEl) {
                targetEl.style.left = `${target.left}%`;
                targetEl.style.top = `${target.top}%`;
            }
            updateInspectorValues();
            localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
        }
    });
}

function nudgeProperty(key, delta) {
    const target = currentVectorLayout.find(v => v.id === activeVectorId);
    if (target) {
        target[key] = (Number(target[key]) || 0) + delta;
        renderVectorMapElements();
        localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
    }
}

function setProperty(key, value) {
    const target = currentVectorLayout.find(v => v.id === activeVectorId);
    if (target) {
        target[key] = value;
        renderVectorMapElements();
        localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
    }
}

function selectVectorLayer(id) {
    activeVectorId = id;
    const layerSelect = document.getElementById('inspectorLayerSelect');
    if (layerSelect) layerSelect.value = id;

    document.querySelectorAll('.map-vector-element').forEach(el => {
        el.classList.remove('selected-vector');
    });

    const activeEl = document.getElementById(`vec-item-${id}`);
    if (activeEl) activeEl.classList.add('selected-vector');

    updateInspectorValues();
}

function updateInspectorValues() {
    const target = currentVectorLayout.find(v => v.id === activeVectorId);
    if (!target) return;

    setVal('inputLeftRange', target.left);
    setVal('inputLeftNum', target.left);
    setVal('inputTopRange', target.top);
    setVal('inputTopNum', target.top);
    setVal('inputWidthRange', target.width);
    setVal('inputWidthNum', target.width);
    setVal('inputRotateRange', target.rotate || 0);
    setVal('inputRotateNum', target.rotate || 0);
    setVal('inputOpacityRange', target.opacity ?? 1.0);
    setVal('inputOpacityNum', target.opacity ?? 1.0);
    setVal('inputZIndexNum', target.zIndex || 5);

    const layerTitle = document.getElementById('inspectorSelectedLayerName');
    if (layerTitle) layerTitle.textContent = target.name;
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// Toggle Editor Mode On / Off
function setMapEditorMode(enable) {
    isMapEditorActive = enable;
    const panel = document.getElementById('mapEditorInspectorPanel');
    const toggleBtn = document.getElementById('btnToggleMapEditor');
    const directBtn = document.getElementById('btnOpenMapEditorDirect');

    if (panel) panel.style.display = isMapEditorActive ? 'block' : 'none';

    if (toggleBtn) {
        toggleBtn.innerHTML = isMapEditorActive 
            ? '<span>&#10006;</span> Close Map Editor' 
            : '<span>&#9997;&#65039;</span> Edit Map Vector Layout';
        toggleBtn.className = isMapEditorActive ? 'btn-toggle-map-editor active' : 'btn-toggle-map-editor';
    }

    if (directBtn) {
        directBtn.innerHTML = isMapEditorActive
            ? '&#10006; Close Inspector'
            : '&#9997;&#65039; Edit Map Vectors';
    }

    renderVectorMapElements();
}

// Save Layout to localStorage and Supabase cloud DB
async function saveVectorLayout() {
    localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(currentVectorLayout));
    await persistMapVectorLayoutToSupabase(currentVectorLayout);

    if (typeof showNotification === 'function') {
        showNotification('Map Layout Saved to Database', 'Vector positions, scales, and rotations saved to Supabase DB!', 'success');
    } else {
        alert('Cemetery Map Vector Layout saved to Supabase DB successfully!');
    }
}

// Reset Layout to Defaults
async function resetVectorLayout() {
    if (!await showConfirmModal({ title: "Reset Vectors", message: "Are you sure you want to reset all vector positions to default?", confirmText: "Reset to Default", type: "warning", danger: true })) return;
    localStorage.removeItem(MAP_VECTOR_STORAGE_KEY);
    currentVectorLayout = JSON.parse(JSON.stringify(DEFAULT_MAP_VECTORS));
    renderVectorMapElements();

    if (typeof showNotification === 'function') {
        showNotification('Layout Reset', 'Vector map layout restored to original coordinates.', 'info');
    } else {
        alert('Map layout reset to default coordinates.');
    }
}

// Export Layout JSON
function exportVectorLayoutJson() {
    const jsonStr = JSON.stringify(currentVectorLayout, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        if (typeof showNotification === 'function') {
            showNotification('JSON Copied', 'Map layout JSON copied to clipboard!', 'success');
        } else {
            alert('Map layout JSON copied to clipboard!');
        }
    }).catch(() => {
        showPromptModal({ title: "Vector Layout JSON", message: "Copy the layout JSON below:", defaultValue: jsonStr, confirmText: "Done" });
    });
}

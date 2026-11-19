
let activePromoCode = '';
let promoCodeDiscountAmount = 0;
let currentPaymentProofDataUrl = '';

// ==============================================================================
// ONE BIG MAP CONTROLLER - CEMETERY MASTER LAYOUT & ALL PLOTS
// Zion Memorial Garden - Cloud-Based Online Reservation & Records Management
// Combines the entire cemetery layout and all plot setups on ONE interactive map
// ==============================================================================

const urlParams = new URLSearchParams(window.location.search);
let initialTargetPlotCode = urlParams.get('plot') || '';

// Master Canvas Dimensions & Pan/Zoom State
const BOARD_WIDTH = 2400;
const BOARD_HEIGHT = 1800;

let currentZoom = 0.55;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let origPanX = 0;
let origPanY = 0;

// Application State
let allPlotsMasterList = [];
let allPlotsByIdentifier = {};
let allPlotsBySection = {};
let activeSelectedPlot = null;
let locatedPlotTarget = null;

// Storage Keys
const MAP_VECTOR_STORAGE_KEY = 'zion_cemetery_map_vector_layout_v2';

// Calibrated 12-Area Layout Coordinates (Master Cemetery Grounds)
const DEFAULT_MAP_VECTORS = [
    { id: 'vector-14', area: '10', name: 'Area 10 - Condominium Block A', src: 'assets/images/Map/Vector (14).png', left: 33.4, top: -20.0, width: 21.5, rotate: 30, opacity: 1.0, zIndex: 5 },
    { id: 'vector-12', area: '4',  name: 'Area 4 - Supreme Garden',       src: 'assets/images/Map/Vector (12).png', left: 23.0, top: 2.3,   width: 20.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-11', area: '9',  name: 'Area 9 - Lawn of Serenity',     src: 'assets/images/Map/Vector (11).png', left: 53.5, top: -5.9,  width: 17.5, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-10', area: '8',  name: 'Area 8 - Lawn of Grace',        src: 'assets/images/Map/Vector (10).png', left: 68.9, top: 13.3,  width: 7.5,  rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-13', area: '5',  name: 'Area 5 - Special Supreme Estate',src: 'assets/images/Map/Vector (13).png', left: 42.5, top: 15.8,  width: 18.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-5',  area: '7',  name: 'Area 7 - Lawn of Faith',         src: 'assets/images/Map/Vector (5).png',  left: 61.8, top: 26.8,  width: 11.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-6',  area: '6',  name: 'Area 6 - Lawn of Peace',         src: 'assets/images/Map/Vector (6).png',  left: 52.4, top: 47.2,  width: 11.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-3',  area: '11', name: 'Area 11 - Lawn of Memories',     src: 'assets/images/Map/Vector (3).png',  left: 68.4, top: 33.1,  width: 9.5,  rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-4',  area: '12', name: 'Area 12 - Mausoleum Court',      src: 'assets/images/Map/Vector (4).png',  left: 82.4, top: 40.1,  width: 16.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-8',  area: '2',  name: 'Area 2 - Lawn of Love',          src: 'assets/images/Map/Vector (8).png',  left: 29.5, top: 44.7,  width: 18.5, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-9',  area: '3',  name: 'Area 3 - Lawn of Hope (Family Estate)', src: 'assets/images/Map/Vector (9).png', left: 10.5, top: 31.1, width: 20.0, rotate: 30, opacity: 0.95, zIndex: 5 },
    { id: 'vector-7',  area: '1',  name: 'Area 1 - Single Tiered Lawn',    src: 'assets/images/Map/Vector (7).png',  left: 16.8, top: 75.7,  width: 23.0, rotate: 30, opacity: 0.95, zIndex: 5 }
];

// Area Grid and Dimension Specifications (True Natural Dimensions)
const SECTION_SHAPE_MAP = {
    'Area 1 - Single Tiered Lawn': {
        area: '1',
        asset: 'assets/images/Map/Vector (7).png',
        prefix: 'ST1',
        category: 'Single Teired',
        cols: 24,
        rows: 24,
        widthPx: 1109,
        heightPx: 1165
    },
    'Area 2 - Lawn of Love': {
        area: '2',
        asset: 'assets/images/Map/Vector (8).png',
        prefix: 'LL',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 786,
        heightPx: 971
    },
    'Area 3 - Lawn of Hope (Family Estate)': {
        area: '3',
        asset: 'assets/images/Map/Vector (9).png',
        prefix: 'FE',
        category: 'Family Estate Jr.',
        cols: 24,
        rows: 26,
        widthPx: 881,
        heightPx: 969
    },
    'Area 4 - Supreme Garden': {
        area: '4',
        asset: 'assets/images/Map/Vector (12).png',
        prefix: 'SUP4',
        category: 'Supreme',
        cols: 24,
        rows: 26,
        widthPx: 894,
        heightPx: 964
    },
    'Area 5 - Special Supreme Estate': {
        area: '5',
        asset: 'assets/images/Map/Vector (13).png',
        prefix: 'SPEC5',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 782,
        heightPx: 964
    },
    'Area 6 - Lawn of Peace': {
        area: '6',
        asset: 'assets/images/Map/Vector (6).png',
        prefix: 'ST6',
        category: 'Single Teired',
        cols: 18,
        rows: 28,
        widthPx: 468,
        heightPx: 765
    },
    'Area 7 - Lawn of Faith': {
        area: '7',
        asset: 'assets/images/Map/Vector (5).png',
        prefix: 'SUP7',
        category: 'Supreme',
        cols: 18,
        rows: 26,
        widthPx: 462,
        heightPx: 697
    },
    'Area 8 - Lawn of Grace': {
        area: '8',
        asset: 'assets/images/Map/Vector (10).png',
        prefix: 'SUP8',
        category: 'Supreme',
        cols: 16,
        rows: 22,
        widthPx: 335,
        heightPx: 456
    },
    'Area 9 - Lawn of Serenity': {
        area: '9',
        asset: 'assets/images/Map/Vector (11).png',
        prefix: 'SER9',
        category: 'Special Supreme',
        cols: 24,
        rows: 24,
        widthPx: 777,
        heightPx: 799
    },
    'Area 10 - Condominium Block A': {
        area: '10',
        asset: 'assets/images/Map/Vector (14).png',
        prefix: 'COND',
        category: 'Condominium',
        cols: 28,
        rows: 24,
        widthPx: 899,
        heightPx: 757
    },
    'Area 11 - Lawn of Memories': {
        area: '11',
        asset: 'assets/images/Map/Vector (3).png',
        prefix: 'SPEC11',
        category: 'Special Supreme',
        cols: 16,
        rows: 36,
        widthPx: 417,
        heightPx: 1444
    },
    'Area 12 - Mausoleum Court': {
        area: '12',
        asset: 'assets/images/Map/Vector (4).png',
        prefix: 'MAUS',
        category: 'Mausoleum',
        cols: 24,
        rows: 24,
        widthPx: 691,
        heightPx: 669
    }
};

// ==============================================================================
// 1. INITIALIZATION & DOM READY
// ==============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    setupHeaderButtons();
    setupCanvasPanAndZoom();
    setupSearchLocator();
    setupBookingModalAndAmortization();
    loadUserHeaderAvatar();

    // 1. Load plots data across all areas
    await loadAllPlotsData();

    // 2. Render the ONE BIG MAP with all plots placed on it
    renderEntireCemeteryMapWithPlots();

    // 3. If an initial target plot was provided in URL (?plot=...), locate it!
    if (initialTargetPlotCode) {
        setTimeout(() => {
            locatePlotByIdentifier(initialTargetPlotCode, { smoothCenter: true });
        }, 120);
    } else {
        autoFitMapToViewport();
    }
});

function syncCustomAreasToLocator(layersOverride) {
    if (!window.ZMGFence || typeof window.ZMGFence.customShapeEntries !== 'function') return;
    const layers = Array.isArray(layersOverride)
        ? layersOverride
        : (typeof window.ZMGFence.readStoredLayers === 'function' ? window.ZMGFence.readStoredLayers() : []);
    const entries = window.ZMGFence.customShapeEntries(layers);
    Object.keys(SECTION_SHAPE_MAP).forEach(secName => {
        if (SECTION_SHAPE_MAP[secName].custom && !entries[secName]) {
            delete SECTION_SHAPE_MAP[secName];
        }
    });
    Object.entries(entries).forEach(([secName, meta]) => {
        SECTION_SHAPE_MAP[secName] = {
            ...meta,
            asset: meta.asset || window.ZMGFence.buildAreaSvgDataUrl(meta.cols, meta.rows, meta.area)
        };
    });
}

function getVectorLayout() {
    try {
        const saved = localStorage.getItem(MAP_VECTOR_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (window.ZMGFence && typeof window.ZMGFence.mergeLayoutLayers === 'function') {
                    return window.ZMGFence.mergeLayoutLayers(DEFAULT_MAP_VECTORS, parsed);
                }
                const filtered = parsed.filter(v => v && (!window.ZMGFence || !window.ZMGFence.isLegacyWall(v)));
                return filtered.length > 0 ? filtered : DEFAULT_MAP_VECTORS;
            }
        }
    } catch (e) {
        console.warn('Notice parsing saved vectors:', e);
    }
    return DEFAULT_MAP_VECTORS;
}

// ==============================================================================
// 2. LOAD ALL PLOTS (Supabase Cloud + Fallback Generators for All Sections)
// ==============================================================================
async function loadAllPlotsData() {
    allPlotsMasterList = [];
    allPlotsByIdentifier = {};
    allPlotsBySection = {};

    try {
        // Query live plots from Supabase using pagination to bypass PostgREST's 1,000-row limit
        let dbPlots = [];
        let page = 0;
        let fetchError = null;
        const PAGE_SIZE = 1000;
        while (true) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const { data, error } = await supabaseClient
                .from('memorial_spaces')
                .select('*')
                .range(from, to)
                .order('id', { ascending: true });

            if (error) {
                console.warn('Notice loading plots batch:', error);
                fetchError = error;
                break;
            }
            if (!data || data.length === 0) break;
            dbPlots = dbPlots.concat(data);
            if (data.length < PAGE_SIZE) break;
            page++;
        }

        const dbGrouped = {};
        let systemVectorLayers = null;
        let systemFenceConfig = null;
        let hasPrimaryMapConfig = false;
        if (!fetchError && dbPlots && dbPlots.length > 0) {
            dbPlots.forEach(p => {
                const isPrimaryCfg = p.plot_identifier === 'ZMG-MAP-VECTOR-LAYOUT-CONFIG';
                const isLegacyCfg = !isPrimaryCfg && p.section_name === '__SYSTEM_MAP_CONFIG__';
                if ((isPrimaryCfg || (isLegacyCfg && !hasPrimaryMapConfig)) && p.coordinates?.vectorLayers) {
                    systemVectorLayers = p.coordinates.vectorLayers;
                    if (p.coordinates.fenceConfig) systemFenceConfig = p.coordinates.fenceConfig;
                    if (isPrimaryCfg) hasPrimaryMapConfig = true;
                }
                if (!p.section_name || p.section_name.includes('__SYSTEM')) return;
                if (!dbGrouped[p.section_name]) dbGrouped[p.section_name] = [];
                dbGrouped[p.section_name].push(p);
            });
        }

        if ((!hasPrimaryMapConfig || !systemVectorLayers || !systemFenceConfig) && window.ZMGFence && typeof window.ZMGFence.fetchMapConfigFromSupabase === 'function') {
            const directCfg = await window.ZMGFence.fetchMapConfigFromSupabase(supabaseClient);
            if (directCfg) {
                if (Array.isArray(directCfg.vectorLayers) && directCfg.vectorLayers.length > 0) systemVectorLayers = directCfg.vectorLayers;
                if (directCfg.fenceConfig) systemFenceConfig = directCfg.fenceConfig;
            }
        }

        // Keep local vector cache aligned with cloud system config (strip legacy walls, register custom areas)
        if (systemFenceConfig && window.ZMGFence) {
            window.ZMGFence.writeStoredFenceConfig(systemFenceConfig);
        }
        if (systemVectorLayers && Array.isArray(systemVectorLayers) && systemVectorLayers.length > 0) {
            const cleanedSystem = systemVectorLayers.filter(v => !window.ZMGFence || !window.ZMGFence.isLegacyWall(v));
            try {
                localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(cleanedSystem));
            } catch (_) {}
            syncCustomAreasToLocator(cleanedSystem);
        } else {
            syncCustomAreasToLocator();
        }

        // For each known cemetery area: use DB plots if available, local cache if present, or generate blueprint
        Object.keys(SECTION_SHAPE_MAP).forEach(secName => {
            const shapeInfo = SECTION_SHAPE_MAP[secName];
            let sectionPlots = dbGrouped[secName];

            if (!sectionPlots || sectionPlots.length === 0) {
                try {
                    const cachedRaw = localStorage.getItem('zion_section_plots_v1_' + secName);
                    if (cachedRaw) {
                        const cached = JSON.parse(cachedRaw);
                        if (Array.isArray(cached) && cached.length > 0) sectionPlots = cached;
                    }
                } catch (_) {}
            }

            if (!sectionPlots || sectionPlots.length === 0) {
                if (secName === 'Area 5 - Special Supreme Estate') {
                    sectionPlots = generateArea5ExactBlueprintLayout();
                } else {
                    sectionPlots = generateGenericSectionBlueprint(secName, shapeInfo);
                }
            }

            allPlotsBySection[secName] = sectionPlots;
            sectionPlots.forEach(p => {
                allPlotsMasterList.push(p);
                allPlotsByIdentifier[String(p.plot_identifier).toUpperCase()] = p;
            });
        });

        // Update Stats Counters
        const total = allPlotsMasterList.length;
        const avail = allPlotsMasterList.filter(p => (p.status || 'available').toLowerCase() === 'available').length;
        const res = allPlotsMasterList.filter(p => (p.status || '').toLowerCase() === 'reserved').length;
        const occ = allPlotsMasterList.filter(p => (p.status || '').toLowerCase() === 'occupied').length;
        const maint = Math.max(0, total - (avail + res + occ));
        const availPct = total > 0 ? Math.round((avail / total) * 100) : 0;

        setText('statTotal', total.toLocaleString());
        setText('statAvail', avail.toLocaleString());
        setText('statRes', res.toLocaleString());
        setText('statOcc', occ.toLocaleString());

        setText('legendCountTotal', total.toLocaleString());
        setText('legendCountAvail', avail.toLocaleString());
        setText('legendCountRes', res.toLocaleString());
        setText('legendCountOcc', occ.toLocaleString());
        setText('legendCountMaint', maint.toLocaleString());
        setText('legendAvailRate', `${availPct}%`);

    } catch (err) {
        console.error('Error loading all plots:', err);
        // Fallback safety: ensure all sections have plots even if cloud query failed
        syncCustomAreasToLocator();
        if (allPlotsMasterList.length === 0) {
            Object.keys(SECTION_SHAPE_MAP).forEach(secName => {
                const shapeInfo = SECTION_SHAPE_MAP[secName];
                const sectionPlots = (secName === 'Area 5 - Special Supreme Estate')
                    ? generateArea5ExactBlueprintLayout()
                    : generateGenericSectionBlueprint(secName, shapeInfo);
                allPlotsBySection[secName] = sectionPlots;
                sectionPlots.forEach(p => {
                    allPlotsMasterList.push(p);
                    allPlotsByIdentifier[String(p.plot_identifier).toUpperCase()] = p;
                });
            });
            const total = allPlotsMasterList.length;
            const avail = allPlotsMasterList.filter(p => (p.status || 'available').toLowerCase() === 'available').length;
            const res = allPlotsMasterList.filter(p => (p.status || '').toLowerCase() === 'reserved').length;
            const occ = allPlotsMasterList.filter(p => (p.status || '').toLowerCase() === 'occupied').length;
            const maint = Math.max(0, total - (avail + res + occ));
            const availPct = total > 0 ? Math.round((avail / total) * 100) : 0;

            setText('statTotal', total.toLocaleString());
            setText('statAvail', avail.toLocaleString());
            setText('statRes', res.toLocaleString());
            setText('statOcc', occ.toLocaleString());

            setText('legendCountTotal', total.toLocaleString());
            setText('legendCountAvail', avail.toLocaleString());
            setText('legendCountRes', res.toLocaleString());
            setText('legendCountOcc', occ.toLocaleString());
            setText('legendCountMaint', maint.toLocaleString());
            setText('legendAvailRate', `${availPct}%`);
        }
    }
}

function generateArea5ExactBlueprintLayout() {
    const plots = [];
    const sectionName = 'Area 5 - Special Supreme Estate';
    const category = 'Special Supreme';
    const price = 85000;
    const downPayment = 12500;
    let seq = 1;

    const rowStartCols = [
        { row: 1,  startCol: 1 },
        { row: 4,  startCol: 1 },
        { row: 7,  startCol: 1 },
        { row: 10, startCol: 1 },
        { row: 13, startCol: 1 },
        { row: 16, startCol: 1 },
        { row: 19, startCol: 1 },
        { row: 22, startCol: 5 },
        { row: 25, startCol: 7 }
    ];

    for (const rSpec of rowStartCols) {
        for (let c = rSpec.startCol; c <= 21; c += 2) {
            const code = `SPEC5-${String(seq).padStart(3, '0')}`;
            plots.push({
                id: 5000 + seq,
                plot_identifier: code,
                section_name: sectionName,
                category: category,
                status: 'available',
                price: price,
                down_payment: downPayment,
                col_num: c,
                row_num: rSpec.row,
                coordinates: { width: 2, height: 3, col_span: 2, row_span: 3 }
            });
            seq++;
        }
    }
    return plots;
}

function generateGenericSectionBlueprint(sectionName, shapeInfo) {
    const plots = [];
    const cols = shapeInfo.cols || 24;
    const rows = shapeInfo.rows || 24;
    const cat = String(shapeInfo.category || 'Supreme');
    const isCondo = shapeInfo.prefix === 'COND' || cat === 'Condominium';
    const isFamily = cat.includes('Family');
    const isMaus = cat.includes('Mausoleum');
    const isSpecial = cat.includes('Special');
    const isSupreme = cat.includes('Supreme');

    const pW = isCondo ? 1 : (isFamily ? 4 : (isMaus ? 3 : (isSupreme ? 2 : 1)));
    const pH = isCondo ? 1 : (isFamily ? 4 : (isMaus ? 3 : (isSupreme ? 2 : 2)));
    const price = shapeInfo.defaultPrice || (isCondo ? 35000 : (isFamily ? 220000 : (isMaus ? 150000 : (isSpecial ? 85000 : (isSupreme ? 65000 : 55000)))));
    const dp = shapeInfo.defaultDown || (isCondo ? 5250 : Math.round(price * 0.15));
    const polyPts = Array.isArray(shapeInfo.points) && shapeInfo.points.length >= 3 ? shapeInfo.points : null;
    let seq = 1;

    for (let r = 1; r <= rows - pH + 1; r += (pH + (isCondo ? 0 : 1))) {
        for (let c = 1; c <= cols - pW + 1; c += (pW + (isCondo ? 0 : 1))) {
            if (polyPts && window.ZMGFence && typeof window.ZMGFence.isPointInPolygonPct === 'function') {
                const cxPct = ((c - 1 + pW / 2) / cols) * 100;
                const cyPct = ((r - 1 + pH / 2) / rows) * 100;
                if (!window.ZMGFence.isPointInPolygonPct(cxPct, cyPct, polyPts)) continue;
            }
            const code = `${shapeInfo.prefix}-${String(seq).padStart(3, '0')}`;
            plots.push({
                id: ((parseInt(shapeInfo.area, 10) || 1) * 1000) + seq,
                plot_identifier: code,
                section_name: sectionName,
                category: cat,
                status: 'available',
                price: price,
                down_payment: dp,
                col_num: c,
                row_num: r,
                coordinates: { width: pW, height: pH, col_span: pW, row_span: pH }
            });
            seq++;
        }
    }
    return plots;
}

// ==============================================================================
// 3. RENDER THE ONE BIG MAP WITH ALL PLOTS
// ==============================================================================
function renderEntireCemeteryMapWithPlots() {
    const board = document.getElementById('entireMapBoard');
    if (!board) return;

    // Remove any previous dynamic areas, entrances, & structural decor parts
    board.querySelectorAll('.pd-map-area, .pd-map-entrance, .pd-map-decor').forEach(el => el.remove());

    syncCustomAreasToLocator();
    const layout = getVectorLayout();

    layout.forEach(v => {
        if (v.visible === false) return;
        const isEntrance = window.ZMGFence && window.ZMGFence.isEntrance(v);
        const isDecor = !isEntrance && ((window.ZMGFence && window.ZMGFence.isDecorPart && window.ZMGFence.isDecorPart(v)) || !v.area);
        if (isEntrance || isDecor) {
            if (!v.src && !isEntrance) return;
            const partImg = document.createElement('img');
            partImg.className = isEntrance ? 'pd-map-entrance' : 'pd-map-decor';
            partImg.dataset.vectorId = v.id || '';
            partImg.dataset.kind = isEntrance ? 'entrance' : 'decor';
            partImg.src = isEntrance ? (v.src || window.ZMGFence.entranceSvgDataUrl()) : v.src;
            partImg.alt = v.name || (isEntrance ? 'Main Entrance Gate' : 'Map Structure');
            partImg.draggable = false;
            partImg.style.position = 'absolute';
            partImg.style.left = `${v.left}%`;
            partImg.style.top = `${v.top}%`;
            partImg.style.width = `${v.width || (isEntrance ? 11 : 16)}%`;
            partImg.style.height = 'auto';
            partImg.style.transform = `rotate(${v.rotate || 0}deg)`;
            partImg.style.transformOrigin = 'center center';
            partImg.style.opacity = String(v.opacity ?? 1);
            partImg.style.zIndex = String(v.zIndex || (isEntrance ? 25 : 6));
            partImg.style.pointerEvents = 'none';
            partImg.addEventListener('load', () => {
                if (window.ZMGFence) {
                    window.ZMGFence.render(board, layout, { clamp: false, padding: 64 });
                }
            });
            board.appendChild(partImg);
            return;
        }

        const shapeMeta = Object.values(SECTION_SHAPE_MAP).find(s => s.area === String(v.area));
        const sectionName = shapeMeta ? Object.keys(SECTION_SHAPE_MAP).find(k => SECTION_SHAPE_MAP[k].area === String(v.area)) : v.name;
        if (!shapeMeta) return;

        const plots = allPlotsBySection[sectionName] || [];

        // Dynamically ensure cols and rows cover all plots in this section
        let maxPlotCol = 1;
        let maxPlotRow = 1;
        plots.forEach(p => {
            const cEnd = (p.col_num || 1) + (p.coordinates?.width || p.coordinates?.col_span || 1) - 1;
            const rEnd = (p.row_num || 1) + (p.coordinates?.height || p.coordinates?.row_span || 1) - 1;
            if (cEnd > maxPlotCol) maxPlotCol = cEnd;
            if (rEnd > maxPlotRow) maxPlotRow = rEnd;
        });
        const cols = Math.max(shapeMeta.cols || 24, maxPlotCol);
        const rows = Math.max(shapeMeta.rows || 24, maxPlotRow);

        // 1. Create Area Container placed directly on master map layout
        const areaContainer = document.createElement('div');
        areaContainer.className = 'pd-map-area';
        areaContainer.id = `area-zone-${v.area}`;
        areaContainer.dataset.vectorId = v.id || '';
        areaContainer.dataset.area = v.area;
        areaContainer.dataset.sectionName = sectionName;
        areaContainer.dataset.leftPct = v.left;
        areaContainer.dataset.topPct = v.top;
        areaContainer.dataset.widthPct = v.width;
        areaContainer.dataset.cols = cols;
        areaContainer.dataset.rows = rows;
        areaContainer.dataset.rotate = v.rotate || 0;

        // Position on 2400x1800 board
        const aspect = shapeMeta.heightPx / shapeMeta.widthPx;
        areaContainer.dataset.aspectRatio = aspect;
        areaContainer.style.left = `${v.left}%`;
        areaContainer.style.top = `${v.top}%`;
        areaContainer.style.width = `${v.width}%`;
        areaContainer.style.aspectRatio = `${shapeMeta.widthPx} / ${shapeMeta.heightPx}`;
        areaContainer.style.transform = `rotate(${v.rotate || 0}deg)`;
        if (v.zIndex) areaContainer.style.zIndex = String(v.zIndex);

        // 2. Vector Shape Silhouette Backdrop Image
        const shapeImg = document.createElement('img');
        shapeImg.src = v.src || shapeMeta.asset;
        shapeImg.alt = sectionName;
        shapeImg.className = 'pd-area-shape-img';
        shapeImg.draggable = false;
        if (window.ZMGFence && typeof window.ZMGFence.render === 'function') {
            shapeImg.addEventListener('load', () => {
                window.ZMGFence.render(board, layout, { clamp: false, padding: 64 });
            });
        }
        areaContainer.appendChild(shapeImg);

        // 3. Floating Area Name Badge Above Area
        const badge = document.createElement('div');
        badge.className = 'pd-area-floating-label';
        badge.innerHTML = `<span class="pd-area-tag-num">Area ${v.area}</span> <span class="pd-area-tag-cat">${shapeMeta.category}</span>`;
        areaContainer.appendChild(badge);

        // 4. Embedded Plot Grid Layer (Overlaid directly on top of the vector shape)
        const gridLayer = document.createElement('div');
        gridLayer.className = 'pd-area-plots-grid';
        gridLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // 4. Render Every Plot Inside this Area
        plots.forEach(plot => {
            const status = (plot.status || 'available').toLowerCase();
            const colNum = plot.col_num || 1;
            const rowNum = plot.row_num || 1;
            const w = plot.coordinates?.width || plot.coordinates?.col_span || 1;
            const h = plot.coordinates?.height || plot.coordinates?.row_span || 1;
            const isTarget = locatedPlotTarget && String(locatedPlotTarget.plot_identifier).toUpperCase() === String(plot.plot_identifier).toUpperCase();
            const isSelected = activeSelectedPlot && String(activeSelectedPlot.plot_identifier).toUpperCase() === String(plot.plot_identifier).toUpperCase();

            const slot = document.createElement('div');
            slot.className = `pd-map-plot-slot status-${status} ${isTarget ? 'target-located-cell' : ''} ${isSelected ? 'selected' : ''}`;
            slot.id = `slot-${plot.plot_identifier}`;
            slot.dataset.identifier = plot.plot_identifier;
            slot.dataset.status = status;
            slot.dataset.col = colNum;
            slot.dataset.row = rowNum;
            slot.dataset.area = v.area;
            slot.dataset.section = sectionName;

            slot.style.gridColumn = `${colNum} / span ${w}`;
            slot.style.gridRow = `${rowNum} / span ${h}`;
            slot.title = `${plot.plot_identifier} • ${sectionName} • ${status.toUpperCase()} • Click to view`;

            // Plot number label
            const label = document.createElement('span');
            label.className = 'pd-slot-text';
            const parts = String(plot.plot_identifier).split('-');
            label.textContent = parts[parts.length - 1] || plot.plot_identifier;
            slot.appendChild(label);

            // Click Plot Cell
            slot.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPlot(plot, slot, v);
            });

            // If this is the located target, attach beacon pin
            if (isTarget) {
                attachPinToSlot(slot, plot.plot_identifier, v.rotate || 0);
            }

            gridLayer.appendChild(slot);
        });

        areaContainer.appendChild(gridLayer);
        board.appendChild(areaContainer);
    });

    if (window.ZMGFence && typeof window.ZMGFence.render === 'function') {
        window.ZMGFence.render(board, layout, { clamp: false, padding: 64 });
    }
}

function attachPinToSlot(slotEl, plotCode, areaRotate = 0) {
    // Remove any existing pins
    document.querySelectorAll('.pd-locator-pin').forEach(p => p.remove());

    const pin = document.createElement('div');
    pin.id = 'mapLocatorPin';
    pin.className = 'pd-locator-pin';

    // Keep pin badge readable upright against area rotation
    pin.style.transform = `translate(-50%, -100%) rotate(${-areaRotate}deg)`;

    pin.innerHTML = `
        <div class="pd-pin-badge">
            <span class="pd-pin-beacon-dot"></span>
            <span> ${plotCode}</span>
        </div>
        <div class="pd-pin-stem"></div>
        <div class="pd-pin-base-ripple"></div>
    `;

    slotEl.appendChild(pin);
}

// ==============================================================================
// 4. SELECT PLOT & POPULATE SIDEBAR DETAILS
// ==============================================================================
async function selectPlot(plot, slotEl = null, areaMeta = null) {
    activeSelectedPlot = plot;

    // Highlight slot on map
    document.querySelectorAll('.pd-map-plot-slot').forEach(s => s.classList.remove('selected'));
    if (!slotEl) {
        slotEl = document.getElementById(`slot-${plot.plot_identifier}`);
    }
    if (slotEl) {
        slotEl.classList.add('selected');
        const rotate = areaMeta?.rotate || 0;
        attachPinToSlot(slotEl, plot.plot_identifier, rotate);
    }

    // Highlight area zone
    document.querySelectorAll('.pd-map-area').forEach(a => a.classList.remove('active-zone'));
    const parentArea = slotEl?.closest('.pd-map-area');
    if (parentArea) parentArea.classList.add('active-zone');

    // Populate Sidebar
    const sidebarBox = document.getElementById('plotSidebarInfo');
    const plotCode = document.getElementById('sidebarPlotCode');
    const plotSection = document.getElementById('sidebarPlotSectionName');
    const plotCat = document.getElementById('sidebarPlotCat');
    const plotCoords = document.getElementById('sidebarPlotCoords');
    const plotPrice = document.getElementById('sidebarPlotPrice');
    const plotDownPayment = document.getElementById('sidebarPlotDownPayment');
    const plotStatusTag = document.getElementById('sidebarPlotStatusTag');
    const btnReserve = document.getElementById('btnReservePlotDirect');
    const locatorPill = document.getElementById('sidebarLocatorPill');

    if (sidebarBox) sidebarBox.style.display = 'block';
    if (plotCode) plotCode.textContent = plot.plot_identifier;
    if (plotSection) plotSection.textContent = plot.section_name;
    if (plotCat) plotCat.textContent = `Category: ${plot.category || 'Memorial Plot'}`;

    const colNum = plot.col_num || 1;
    const rowNum = plot.row_num || 1;
    const w = plot.coordinates?.width || plot.coordinates?.col_span || 1;
    const h = plot.coordinates?.height || plot.coordinates?.row_span || 1;
    if (plotCoords) plotCoords.textContent = `Grid Location: Col ${colNum}, Row ${rowNum} (${w}×${h} slots)`;

    const price = Number(plot.price || 85000);
    const dp = Number(plot.down_payment || (price * 0.15));
    if (plotPrice) plotPrice.textContent = `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (plotDownPayment) plotDownPayment.textContent = `Down Payment: ₱ ${dp.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const status = (plot.status || 'available').toLowerCase();
    if (plotStatusTag) {
        plotStatusTag.textContent = status.toUpperCase();
        plotStatusTag.className = `sidebar-status-tag ${status}`;
    }

    const isTarget = locatedPlotTarget && String(locatedPlotTarget.plot_identifier).toUpperCase() === String(plot.plot_identifier).toUpperCase();
    if (locatorPill) locatorPill.style.display = isTarget ? 'inline-flex' : 'none';

    // Reserve Button visibility
    if (btnReserve) {
        if (status === 'available') {
            btnReserve.style.display = 'block';
            btnReserve.disabled = false;
        } else {
            btnReserve.style.display = 'none';
        }
    }

    // Check for deceased record if occupied
    await loadDeceasedRecordForPlot(plot);
}

async function loadDeceasedRecordForPlot(plot) {
    const deceasedCard = document.getElementById('sidebarDeceasedInfo');
    const nameEl = document.getElementById('sidebarDeceasedName');
    const datesEl = document.getElementById('sidebarDeceasedDates');
    const burialEl = document.getElementById('sidebarDeceasedBurial');
    const epitaphEl = document.getElementById('sidebarDeceasedEpitaph');

    if (!deceasedCard) return;

    if ((plot.status || '').toLowerCase() !== 'occupied' && !plot.deceased_name) {
        deceasedCard.style.display = 'none';
        return;
    }

    try {
        const { data: record } = await supabaseClient
            .from('memorial_records')
            .select('*')
            .eq('space_id', plot.id)
            .maybeSingle();

        if (record) {
            deceasedCard.style.display = 'block';
            if (nameEl) nameEl.textContent = record.deceased_name || 'Resting Family Member';
            const lifespan = (record.birth_date && record.death_date)
                ? `${new Date(record.birth_date).getFullYear()} - ${new Date(record.death_date).getFullYear()}`
                : (record.death_date ? `Passed ${new Date(record.death_date).toLocaleDateString()}` : 'In Blessed Memory');
            if (datesEl) datesEl.textContent = lifespan;
            if (burialEl) burialEl.textContent = record.burial_date ? `Interred: ${new Date(record.burial_date).toLocaleDateString()}` : 'Interment Recorded';
            if (epitaphEl) {
                if (record.epitaph) {
                    epitaphEl.style.display = 'block';
                    epitaphEl.textContent = `"${record.epitaph}"`;
                } else {
                    epitaphEl.style.display = 'none';
                }
            }
        } else if (plot.deceased_name) {
            deceasedCard.style.display = 'block';
            if (nameEl) nameEl.textContent = plot.deceased_name;
            if (datesEl) datesEl.textContent = 'In Blessed Memory';
            if (burialEl) burialEl.textContent = 'Interment Recorded';
            if (epitaphEl) epitaphEl.style.display = 'none';
        } else {
            deceasedCard.style.display = 'none';
        }
    } catch (e) {
        deceasedCard.style.display = 'none';
    }
}

// ==============================================================================
// 5. LOCATE PLOT ON BIG MAP (URL & Search Box)
// ==============================================================================
async function locatePlotByIdentifier(codeQuery, options = { smoothCenter: true }) {
    if (!codeQuery) return;
    const cleanCode = codeQuery.trim().toUpperCase();
    const noticeEl = document.getElementById('searchNoticeMsg');
    const statusBadge = document.getElementById('pdLocatedStatusBadge');
    const statusText = document.getElementById('pdLocatedStatusText');

    let targetPlot = allPlotsByIdentifier[cleanCode];

    // Fallback: search cloud directly if not yet in cache
    if (!targetPlot) {
        try {
            const { data } = await supabaseClient
                .from('memorial_spaces')
                .select('*')
                .ilike('plot_identifier', cleanCode)
                .limit(1);
            if (data && data.length > 0) targetPlot = data[0];
        } catch (e) {}
    }

    // Fallback: match prefix to section
    if (!targetPlot) {
        for (const secName of Object.keys(SECTION_SHAPE_MAP)) {
            const meta = SECTION_SHAPE_MAP[secName];
            if (cleanCode.startsWith(meta.prefix)) {
                targetPlot = {
                    id: 99999,
                    plot_identifier: cleanCode,
                    section_name: secName,
                    category: meta.category,
                    status: 'available',
                    price: 85000,
                    down_payment: 12500,
                    col_num: 1,
                    row_num: 1
                };
                break;
            }
        }
    }

    if (!targetPlot) {
        if (noticeEl) {
            noticeEl.style.display = 'block';
            noticeEl.className = 'search-notice-msg error';
            noticeEl.textContent = `Plot "${cleanCode}" not found. Please verify code.`;
        }
        return;
    }

    locatedPlotTarget = targetPlot;

    if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.className = 'search-notice-msg success';
        noticeEl.textContent = `Located plot ${targetPlot.plot_identifier} in ${targetPlot.section_name}!`;
    }

    if (statusBadge && statusText) {
        statusBadge.style.display = 'inline-flex';
        statusText.textContent = `Target: ${targetPlot.plot_identifier} (${targetPlot.section_name})`;
    }

    // Highlight cell and attach locator pin
    document.querySelectorAll('.pd-map-plot-slot').forEach(s => s.classList.remove('target-located-cell'));
    const slotEl = document.getElementById(`slot-${targetPlot.plot_identifier}`);
    if (slotEl) {
        slotEl.classList.add('target-located-cell');
        const areaZone = slotEl.closest('.pd-map-area');
        const rot = areaZone ? parseFloat(areaZone.dataset.rotate || '0') : 0;
        attachPinToSlot(slotEl, targetPlot.plot_identifier, rot);
    }

    // Select in sidebar
    selectPlot(targetPlot, slotEl);

    // Update URL cleanly
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `plot-locator.html?plot=${encodeURIComponent(targetPlot.plot_identifier)}`);
    }

    // Center and zoom directly to this plot on the big map!
    if (options.smoothCenter && slotEl) {
        centerOnPlotSlot(slotEl, 1.8);
    }
}

function centerOnPlotSlot(slotEl, targetZoom = 1.8) {
    if (!slotEl) return;
    const areaEl = slotEl.closest('.pd-map-area');
    if (!areaEl) return;

    const areaLeftPct = parseFloat(areaEl.dataset.leftPct || '0');
    const areaTopPct = parseFloat(areaEl.dataset.topPct || '0');
    const areaWidthPct = parseFloat(areaEl.dataset.widthPct || '0');
    const cols = parseInt(areaEl.dataset.cols || '22', 10);
    const rows = parseInt(areaEl.dataset.rows || '28', 10);
    const col = parseInt(slotEl.dataset.col || '1', 10);
    const row = parseInt(slotEl.dataset.row || '1', 10);

    const aX = (areaLeftPct / 100) * BOARD_WIDTH;
    const aY = (areaTopPct / 100) * BOARD_HEIGHT;
    const aW = (areaWidthPct / 100) * BOARD_WIDTH;
    const aspect = parseFloat(areaEl.dataset.aspectRatio || '1.0');
    const aH = aW * aspect;

    const relX = ((col + 0.5) / cols) * aW;
    const relY = ((row + 0.5) / rows) * aH;

    // Board center is (1200, 900)
    const targetX = aX + relX - (BOARD_WIDTH / 2);
    const targetY = aY + relY - (BOARD_HEIGHT / 2);

    currentZoom = targetZoom;
    panX = -targetX * currentZoom;
    panY = -targetY * currentZoom;

    applyCanvasTransform();
}

function setupSearchLocator() {
    const input = document.getElementById('plotSearchInput');
    const btn = document.getElementById('btnSearchPlot');
    const btnCenter = document.getElementById('btnCenterPlotOnMap');

    const handleSearch = () => {
        if (input && input.value.trim()) {
            locatePlotByIdentifier(input.value.trim(), { smoothCenter: true });
        }
    };

    if (btn) btn.addEventListener('click', handleSearch);
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    if (btnCenter) {
        btnCenter.addEventListener('click', () => {
            if (activeSelectedPlot) {
                const slot = document.getElementById(`slot-${activeSelectedPlot.plot_identifier}`);
                if (slot) centerOnPlotSlot(slot, 1.8);
            } else {
                autoFitMapToViewport();
            }
        });
    }

    const btnViewArea = document.getElementById('btnViewSingleAreaLayout');
    if (btnViewArea) {
        btnViewArea.addEventListener('click', () => {
            if (!activeSelectedPlot) return;
            const areaNum = activeSelectedPlot.area_number || activeSelectedPlot.space_id || '';
            const secName = activeSelectedPlot.section_name || '';
            const plotCode = activeSelectedPlot.plot_identifier || '';
            window.location.href = `plot-details.html?plot=${encodeURIComponent(plotCode)}&area=${encodeURIComponent(areaNum)}&areaName=${encodeURIComponent(secName)}`;
        });
    }
}

// ==============================================================================
// 6. CANVAS PAN & ZOOM ENGINE (Canva-Style Boundless Stage)
// ==============================================================================
function setupCanvasPanAndZoom() {
    const viewport = document.getElementById('pdViewport');
    const zoomIn = document.getElementById('btnZoomIn');
    const zoomOut = document.getElementById('btnZoomOut');
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomFit = document.getElementById('btnZoomFit');
    const zoomCenter = document.getElementById('btnZoomCenter');

    if (!viewport) return;

    // Mouse Pan Drag
    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        // Don't drag if clicking a plot slot or interactive element
        if (e.target.closest('.pd-map-plot-slot, button, input, select, a')) return;

        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        origPanX = panX;
        origPanY = panY;
        viewport.classList.add('panning');

        const onPanMove = (me) => {
            if (!isPanning) return;
            panX = origPanX + (me.clientX - panStartX);
            panY = origPanY + (me.clientY - panStartY);
            applyCanvasTransform();
        };

        const onPanUp = () => {
            isPanning = false;
            viewport.classList.remove('panning');
            window.removeEventListener('mousemove', onPanMove);
            window.removeEventListener('mouseup', onPanUp);
        };

        window.addEventListener('mousemove', onPanMove);
        window.addEventListener('mouseup', onPanUp);
    });

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - rect.width / 2;
        const cursorY = e.clientY - rect.top - rect.height / 2;

        const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
        applyZoom(currentZoom + zoomDelta, cursorX, cursorY);
    }, { passive: false });

    // Floating Zoom Bar Buttons
    if (zoomIn) zoomIn.addEventListener('click', () => applyZoom(currentZoom + 0.18));
    if (zoomOut) zoomOut.addEventListener('click', () => applyZoom(currentZoom - 0.18));
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            applyZoom(parseFloat(zoomSlider.value) / 100);
        });
    }
    if (zoomFit) zoomFit.addEventListener('click', autoFitMapToViewport);
    if (zoomCenter) zoomCenter.addEventListener('click', centerMap);
}

function applyZoom(newZoom, originX = null, originY = null) {
    const clamped = Math.max(0.2, Math.min(3.0, newZoom));
    if (originX !== null && originY !== null) {
        panX = originX - (originX - panX) * (clamped / currentZoom);
        panY = originY - (originY - panY) * (clamped / currentZoom);
    }
    currentZoom = clamped;
    applyCanvasTransform();
}

function applyCanvasTransform() {
    const stage = document.getElementById('entireMapStage');
    const label = document.getElementById('zoomLabel');
    const slider = document.getElementById('zoomSlider');
    const viewport = document.getElementById('pdViewport');

    if (stage) {
        stage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    }

    if (viewport) {
        const dotSize = 24 * currentZoom;
        const rect = viewport.getBoundingClientRect();
        const offsetX = ((rect.width / 2 + panX) % dotSize + dotSize) % dotSize;
        const offsetY = ((rect.height / 2 + panY) % dotSize + dotSize) % dotSize;
        viewport.style.backgroundSize = `${dotSize}px ${dotSize}px`;
        viewport.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    }

    const pct = Math.round(currentZoom * 100);
    if (label) label.textContent = `${pct}%`;
    if (slider) slider.value = pct;
}

function centerMap() {
    const board = document.getElementById('entireMapBoard');
    const viewport = document.getElementById('pdViewport');
    if (window.ZMGFence && typeof window.ZMGFence.computeContentFitTransform === 'function' && board && viewport) {
        const fit = window.ZMGFence.computeContentFitTransform(
            board,
            viewport.getBoundingClientRect(),
            BOARD_WIDTH,
            BOARD_HEIGHT,
            '.pd-map-area, .pd-map-entrance, .pd-map-decor',
            { minZoom: 0.35, maxZoom: 1.4, padding: 40 }
        );
        const factor = currentZoom / (fit.zoom || 1);
        panX = fit.panX * factor;
        panY = fit.panY * factor;
        applyCanvasTransform();
        return;
    }
    // Center directly on the active cemetery grounds cluster
    panX = -110 * currentZoom;
    panY = 180 * currentZoom;
    applyCanvasTransform();
}

function autoFitMapToViewport() {
    const viewport = document.getElementById('pdViewport');
    const board = document.getElementById('entireMapBoard');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    if (rect.width > 50 && rect.height > 50) {
        if (window.ZMGFence && typeof window.ZMGFence.computeContentFitTransform === 'function' && board) {
            const fit = window.ZMGFence.computeContentFitTransform(
                board,
                rect,
                BOARD_WIDTH,
                BOARD_HEIGHT,
                '.pd-map-area, .pd-map-entrance, .pd-map-decor',
                { minZoom: 0.35, maxZoom: 1.4, padding: 40 }
            );
            currentZoom = fit.zoom;
            panX = fit.panX;
            panY = fit.panY;
            applyCanvasTransform();
            return;
        }
        // Tightly fit to the actual cemetery grounds cluster (no dead space)
        const CLUSTER_WIDTH = 1540;
        const CLUSTER_HEIGHT = 1460;
        const fitW = (rect.width - 40) / CLUSTER_WIDTH;
        const fitH = (rect.height - 40) / CLUSTER_HEIGHT;
        currentZoom = Math.max(0.35, Math.min(fitW, fitH, 1.4));
        centerMap();
    }
}

// ==============================================================================
// 7. HEADER & USER AVATAR CONTROLS
// ==============================================================================
function setupHeaderButtons() {
    const backBtn = document.getElementById('backToMapBtnTop') || document.getElementById('backToMapBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    const menuBtn = document.getElementById('menuIconBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    const userBtn = document.getElementById('userIconBtn');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html?openProfile=true';
        });
    }
}

async function loadUserHeaderAvatar() {
    const avatarImg = document.getElementById('plotDetailsUserAvatar') || document.querySelector('#userIconBtn img');
    if (!avatarImg) return;

    const cachedPic = localStorage.getItem('userProfilePicture');
    if (cachedPic) avatarImg.src = cachedPic;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();
            if (profile?.avatar_url) avatarImg.src = profile.avatar_url;
        }
    } catch (e) {}
}

// ==============================================================================
// 8. DIRECT PLOT RESERVATION & AMORTIZATION MODAL
// ==============================================================================
function setupBookingModalAndAmortization() {
    const btnDirect = document.getElementById('btnReservePlotDirect');
    const modal = document.getElementById('reservationBookingModal');
    const closeBtn = document.getElementById('closeBookingModalBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn');
    const form = document.getElementById('plotReservationForm');
    const termSelect = document.getElementById('installmentTerm');
    const dpInput = document.getElementById('customDownPayment');

    if (btnDirect) {
        btnDirect.addEventListener('click', () => {
            if (!activeSelectedPlot) return;
            if ((activeSelectedPlot.status || 'available').toLowerCase() !== 'available') {
                alert('This plot is already reserved or occupied.');
                return;
            }
            openBookingModalForPlot(activeSelectedPlot);
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.classList.remove('active'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { if (modal) modal.classList.remove('active'); });

    // Setup Chronological Date Validation for Interred Loved One
    if (typeof setupChronologicalDateValidation === 'function') {
        setupChronologicalDateValidation({
            birthInput: 'bookDeceasedBirthDate',
            deathInput: 'bookDeceasedDeathDate',
            burialInput: 'bookDeceasedBurialDate',
            errorContainer: 'bookDeceasedDateError'
        });
    }

    // Recalculate amortization on changes
    if (termSelect) termSelect.addEventListener('change', calculateAmortization);
    
    if (dpInput) dpInput.addEventListener('input', calculateAmortization);

    // Plan Type Radios & Priority Notice
    document.querySelectorAll('input[name="planType"]').forEach(r => {
        r.addEventListener('change', () => {
            const isAtNeed = r.value === 'AT-NEED';
            const notice = document.getElementById('atNeedPriorityNotice');
            if (notice) notice.style.display = isAtNeed ? 'block' : 'none';
        });
    });

    // Promo Code Apply Button
    document.getElementById('btnApplyPromo')?.addEventListener('click', () => {
        const basePrice = Number(document.getElementById('bookPlotPrice')?.value || 85000);
        const grossPrice = basePrice + 2500 + 1200;
        const code = (document.getElementById('bookPromoCode')?.value || '').trim().toUpperCase();
        let msg = '';
        let color = '#15803d';

        if (!code) {
            activePromoCode = '';
            promoCodeDiscountAmount = 0;
            msg = '';
        } else {
            // Check dynamic promotions list (from Admin Pricing Module)
            let promosList = [];
            try {
                const stored = localStorage.getItem('zmg_active_promotions');
                if (stored) promosList = JSON.parse(stored);
            } catch (_) {}

            if (!promosList || promosList.length === 0) {
                promosList = [
                    { code: 'ZIONPROMO', type: 'PERCENT', value: 5, isActive: true },
                    { code: 'PROMO5', type: 'PERCENT', value: 5, isActive: true },
                    { code: 'MEMORIAL2026', type: 'FIXED', value: 3000, isActive: true },
                    { code: 'SPOTCASH10', type: 'PERCENT', value: 10, isActive: true }
                ];
            }

            const matchedPromo = promosList.find(p => (p.code || '').toUpperCase() === code);
            const now = new Date();
            const isExpired = matchedPromo?.expiry ? new Date(matchedPromo.expiry) < now : false;

            if (matchedPromo && matchedPromo.isActive && !isExpired) {
                if (matchedPromo.minTcp && grossPrice < matchedPromo.minTcp) {
                    activePromoCode = '';
                    promoCodeDiscountAmount = 0;
                    msg = `Minimum contract value of ₱${Number(matchedPromo.minTcp).toLocaleString()} required.`;
                    color = '#dc2626';
                } else {
                    activePromoCode = code;
                    if (matchedPromo.type === 'PERCENT') {
                        promoCodeDiscountAmount = Math.round(grossPrice * (Number(matchedPromo.value) / 100));
                        msg = `${matchedPromo.value}% Promotional Discount Applied!`;
                    } else {
                        promoCodeDiscountAmount = Number(matchedPromo.value);
                        msg = `₱${Number(matchedPromo.value).toLocaleString()} Special Promo Applied!`;
                    }
                }
            } else {
                activePromoCode = '';
                promoCodeDiscountAmount = 0;
                msg = isExpired ? 'This promo code has expired' : 'Invalid or inactive promo code';
                color = '#dc2626';
            }
        }

        const msgEl = document.getElementById('promoStatusMessage');
        if (msgEl) {
            msgEl.textContent = msg;
            msgEl.style.color = color;
        }
        calculateAmortization();
    });

    // Payment Proof File Upload
    document.getElementById('bookPaymentProofFile')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                currentPaymentProofDataUrl = ev.target.result;
                window.stagedGcashReceiptProofUrl = ev.target.result;
                const prevImg = document.getElementById('paymentProofPreviewImg');
                if (prevImg) prevImg.src = currentPaymentProofDataUrl;
                const nameEl = document.getElementById('paymentProofFileName');
                if (nameEl) nameEl.textContent = file.name;
                const box = document.getElementById('paymentProofPreviewBox');
                if (box) box.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove Payment Proof
    document.getElementById('btnRemovePaymentProof')?.addEventListener('click', () => {
        currentPaymentProofDataUrl = '';
        window.stagedGcashReceiptProofUrl = null;
        const fileInput = document.getElementById('bookPaymentProofFile');
        if (fileInput) fileInput.value = '';
        const box = document.getElementById('paymentProofPreviewBox');
        if (box) box.style.display = 'none';
    });


    // Payment Option Radios
    const paymentRadios = document.querySelectorAll('input[name="paymentOption"]');
    paymentRadios.forEach(r => {
        r.addEventListener('change', () => {
            const amortPanel = document.getElementById('amortizationPanel');
            if (amortPanel) amortPanel.style.display = r.value === 'INSTALLMENT' ? 'block' : 'none';
            calculateAmortization();
        });
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitPlotReservation(form);
        });
    }
}

function openBookingModalForPlot(plot) {
    const modal = document.getElementById('reservationBookingModal');
    if (!modal) return;

    setText('bookDisplayPlotCode', plot.plot_identifier);
    setText('bookDisplaySection', `${plot.section_name} | ${plot.category || 'Memorial Space'}`);

    const price = Number(plot.price || 85000);
    const dp = 100.00;

    setText('bookDisplayPrice', `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

    const elSpaceId = document.getElementById('bookSpaceId');
    const elCode = document.getElementById('bookPlotIdentifier');
    const elPrice = document.getElementById('bookPlotPrice');
    const elDp = document.getElementById('bookPlotDownPayment');
    const dpInput = document.getElementById('customDownPayment');

    if (elSpaceId) elSpaceId.value = plot.id;
    if (elCode) elCode.value = plot.plot_identifier;
    if (elPrice) elPrice.value = price;
    activePromoCode = '';
    promoCodeDiscountAmount = 0;
    currentPaymentProofDataUrl = '';
    window.stagedGcashReceiptProofUrl = null;
    if (typeof stagedGcashReceiptProofUrl !== 'undefined') stagedGcashReceiptProofUrl = null;
    if (document.getElementById('zmgGcashReceiptUpload')) document.getElementById('zmgGcashReceiptUpload').value = '';
    if (document.getElementById('zmgGcashReceiptThumbBox')) document.getElementById('zmgGcashReceiptThumbBox').style.display = 'none';
    if (document.getElementById('bookPromoCode')) document.getElementById('bookPromoCode').value = '';
    if (document.getElementById('promoStatusMessage')) document.getElementById('promoStatusMessage').textContent = '';
    if (document.getElementById('bookPaymentRefNumber')) document.getElementById('bookPaymentRefNumber').value = '';
    if (document.getElementById('paymentProofPreviewBox')) document.getElementById('paymentProofPreviewBox').style.display = 'none';
    const notice = document.getElementById('atNeedPriorityNotice');
    if (notice) notice.style.display = 'none';
    if (elDp) elDp.value = dp;

    // Only GCash for clients; GCash & Cash Over Counter for staff/admin
    if (typeof detectCurrentUserStaffRole === 'function') {
        detectCurrentUserStaffRole().then(isStaff => {
            const cashPill = document.getElementById('channelPillCash');
            if (cashPill) cashPill.style.display = isStaff ? 'inline-flex' : 'none';
            if (!isStaff) {
                const gcashRadio = document.querySelector('input[name="paymentChannel"][value="GCash"]');
                if (gcashRadio) {
                    gcashRadio.checked = true;
                    document.querySelectorAll('.channel-pill').forEach(p => p.classList.remove('active'));
                    document.getElementById('channelPillGcash')?.classList.add('active');
                }
            }
            if (typeof renderReservationChecksPanel === 'function') {
                renderReservationChecksPanel();
            }
        });
    }
    if (dpInput) {
        dpInput.value = dp.toFixed(2);
        dpInput.min = "100";
    }

    calculateAmortization();
    
    document.querySelectorAll('input[name="paymentChannel"]').forEach(r => {
        r.addEventListener('change', () => {
            document.querySelectorAll('.channel-pill').forEach(p => p.classList.remove('active'));
            r.closest('.channel-pill')?.classList.add('active');
            if (typeof renderReservationChecksPanel === 'function') {
                renderReservationChecksPanel();
            }
        });
    });
if (typeof window.setupDynamicPaymentChannelPanel === 'function') {
        window.setupDynamicPaymentChannelPanel();
    }
    modal.classList.add('active');
}

function calculateAmortization() {
    const basePrice = Number(document.getElementById('bookPlotPrice')?.value || 85000);
    const maintenanceFee = 2500.00;
    const cemeteryTax = 1200.00;
    const grossPrice = basePrice + maintenanceFee + cemeteryTax;

    const isFullPayment = document.querySelector('input[name="paymentOption"]:checked')?.value === 'FULL_PAYMENT';
    const spotDiscount = isFullPayment ? Math.round(grossPrice * 0.10) : 0;
    const totalDiscount = spotDiscount + promoCodeDiscountAmount;
    const netPrice = Math.max(100, grossPrice - totalDiscount);

    const dpInput = document.getElementById('customDownPayment');
    const rawDp = dpInput && dpInput.value !== '' ? Number(dpInput.value) : 100;
    const dp = Math.max(100, isNaN(rawDp) ? 100 : rawDp);
    const term = parseInt(document.getElementById('installmentTerm')?.value || 60, 10);

    const balance = isFullPayment ? 0 : Math.max(0, netPrice - dp);
    const monthly = (term > 0 && !isFullPayment) ? (balance / term) : 0;

    const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    setText('displayBasePlotPrice', peso(basePrice));
    setText('displayMaintenanceFee', peso(maintenanceFee));
    setText('displayCemeteryTax', peso(cemeteryTax));
    setText('displayNetContractPrice', peso(netPrice));
    setText('bookDisplayPrice', peso(netPrice));
    setText('calcTotalPrice', peso(netPrice));
    setText('calcDownPayment', peso(dp));
    setText('calcRemainingBalance', peso(balance));
    setText('calcBalance', peso(balance));
    setText('calcMonthlyAmortization', `${peso(monthly)} / mo`);
    setText('calcMonthly', `${peso(monthly)} / mo`);

    const rowPromo = document.getElementById('rowPromoDiscount');
    if (rowPromo) {
        rowPromo.style.display = totalDiscount > 0 ? 'flex' : 'none';
        setText('displayPromoDiscount', '- ' + peso(totalDiscount));
    }
}

async function submitPlotReservation(form) {
    const submitBtn = document.getElementById('submitReservationBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');

    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';
    if (submitBtn) submitBtn.disabled = true;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Please sign in or register to complete plot reservation.');
            window.location.href = 'index.html?openLogin=true';
            return;
        }

        const planType = document.querySelector('input[name="planType"]:checked')?.value || 'PRE-NEED';
        const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
        const paymentChannel = document.querySelector('input[name="paymentChannel"]:checked')?.value || 'GCash';
        const notes = document.getElementById('reservationNotes')?.value || '';

        const spaceId = document.getElementById('bookSpaceId')?.value;
        const plotCode = document.getElementById('bookPlotIdentifier')?.value;
        const basePrice = Number(document.getElementById('bookPlotPrice')?.value || 0);
        const maintenanceFee = 2500.00;
        const cemeteryTax = 1200.00;
        const grossPrice = basePrice + maintenanceFee + cemeteryTax;
        const isFullPayment = paymentOption === 'FULL_PAYMENT';
        const spotDiscount = isFullPayment ? Math.round(grossPrice * 0.10) : 0;
        const totalDiscount = spotDiscount + promoCodeDiscountAmount;
        const price = Math.max(100, grossPrice - totalDiscount);
        const manualRef = (document.getElementById('bookPaymentRefNumber')?.value || '').trim();
        const counterRef = (document.getElementById('counterCashReceiptNumber')?.value || '').trim();
        const gcashQrRef = (document.getElementById('zmgGcashQrRefNumber')?.value || '').trim();
        const isCash = paymentChannel === 'Cash';
        const dp = Number(document.getElementById('customDownPayment')?.value || 0);
        const term = parseInt(document.getElementById('installmentTerm')?.value || 60, 10);
        if (paymentOption === 'INSTALLMENT' && dp < 100) {
            alert('Minimum down payment is ₱100.00.');
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoader) btnLoader.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        // Deceased Details
        const deceasedFirstName = document.getElementById('bookDeceasedFirstName')?.value?.trim() || '';
        const deceasedMiddleName = document.getElementById('bookDeceasedMiddleName')?.value?.trim() || '';
        const deceasedLastName = document.getElementById('bookDeceasedLastName')?.value?.trim() || '';
        const deceasedGender = document.getElementById('bookDeceasedGender')?.value || '';
        const deceasedBirthDate = document.getElementById('bookDeceasedBirthDate')?.value || null;
        const deceasedDeathDate = document.getElementById('bookDeceasedDeathDate')?.value || null;
        const deceasedBurialDate = document.getElementById('bookDeceasedBurialDate')?.value || null;
        const deceasedEpitaph = document.getElementById('bookDeceasedEpitaph')?.value?.trim() || null;

        let fullDeceasedName = [deceasedFirstName, deceasedMiddleName, deceasedLastName].filter(Boolean).join(' ').trim();
        if (!fullDeceasedName && deceasedFirstName) fullDeceasedName = deceasedFirstName;
        if (!fullDeceasedName && deceasedLastName) fullDeceasedName = deceasedLastName;

        if (planType === 'AT-NEED' && !fullDeceasedName) {
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoader) btnLoader.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            alert('Please enter at least the First Name and Last Name of the deceased for your At-Need reservation.');
            document.getElementById('bookDeceasedFirstName')?.focus();
            return;
        }

        // Chronological Date Validation for Interred Loved One
        if (typeof checkDateChronology === 'function') {
            const dateCheck = checkDateChronology(deceasedBirthDate, deceasedDeathDate, deceasedBurialDate);
            if (!dateCheck.valid) {
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
                alert('Invalid Date Chronology:\n\n' + dateCheck.message);
                if (dateCheck.field === 'birth') document.getElementById('bookDeceasedBirthDate')?.focus();
                else if (dateCheck.field === 'death') document.getElementById('bookDeceasedDeathDate')?.focus();
                else if (dateCheck.field === 'burial') document.getElementById('bookDeceasedBurialDate')?.focus();
                return;
            }
        }

        const amountNow = paymentOption === 'INSTALLMENT' ? (dp > 0 ? dp : price) : price;
        const isGcashQr = !isCash && !document.getElementById('zmgGcashSubMethodAutoDebit')?.checked;
        const hasGcashAutoDebit = Boolean(document.getElementById('zmgGcashSubMethodAutoDebit')?.checked);
        const attachedProof = currentPaymentProofDataUrl || window.stagedGcashReceiptProofUrl || (typeof stagedGcashReceiptProofUrl !== 'undefined' ? stagedGcashReceiptProofUrl : null);

        // Mandatory GCash Screenshot Validation (Required instead of typing reference number)
        if (paymentChannel === 'GCash' && !hasGcashAutoDebit && !attachedProof) {
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoader) btnLoader.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            alert('Please attach your GCash payment screenshot to proceed. Screenshot is required for GCash reservations.');
            const fileInput = document.getElementById('zmgGcashReceiptUpload') || document.getElementById('bookPaymentProofFile');
            if (fileInput) fileInput.focus();
            return;
        }

        const isImmediatelyPaid = isCash || isGcashQr || Boolean(attachedProof) || Boolean(manualRef);
        const totalPaidRecorded = isImmediatelyPaid ? amountNow : 0.00;
        const balanceRecorded = isImmediatelyPaid ? Math.max(0, price - amountNow) : price;
        const monthly = term > 0 ? (balanceRecorded / term) : 0;
        const paymentTag = isImmediatelyPaid ? 'PAID' : 'UNPAID';
        const paymentReference = isCash
            ? (counterRef || manualRef || `CSH-COUNTER-${Date.now().toString(36).toUpperCase()}`)
            : (gcashQrRef || manualRef || `GCASH-SS-${Date.now().toString(36).toUpperCase()}`);
        const resNumber = `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const deceasedTagNote = fullDeceasedName ? ` [Interred: ${fullDeceasedName}${deceasedDeathDate ? ` (DOD: ${deceasedDeathDate})` : ''}]` : '';
        const finalNotes = `[Channel: ${paymentChannel}] [Receipt Tag: ${paymentTag}] [Ref: ${paymentReference}]${deceasedTagNote} ${notes}`.trim();

        const { data: newReservation, error: resError } = await supabaseClient
            .from('reservations')
            .insert([{
                user_id: user.id,
                space_id: parseInt(spaceId),
                reservation_number: resNumber,
                status: 'PENDING',
                plan_type: planType,
                payment_method: paymentOption,
                total_price: price,
                down_payment_amount: dp,
                balance: balanceRecorded,
                total_paid: totalPaidRecorded,
                installment_term_months: term,
                monthly_amortization: monthly,
                notes: finalNotes
            }])
            .select()
            .single();

        if (resError) throw resError;

        // Record payment in payments table
        await supabaseClient.from('payments').insert([{
            reservation_id: newReservation.id,
            payment_reference: manualRef || paymentReference,
            amount: amountNow,
            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
            payment_method: isCash ? 'Cash' : 'GCash',
            status: isImmediatelyPaid ? 'COMPLETED' : 'PENDING',
            receipt_url: attachedProof || currentPaymentProofDataUrl || null,
            paid_at: isImmediatelyPaid ? new Date().toISOString() : null,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }]);

        // Insert Interred Deceased into memorial_records if provided
        const targetSpaceId = parseInt(spaceId);
        if (fullDeceasedName && targetSpaceId) {
            try {
                await supabaseClient
                    .from('memorial_records')
                    .insert([{
                        space_id: targetSpaceId,
                        family_contact_id: user.id,
                        deceased_name: fullDeceasedName,
                        birth_date: deceasedBirthDate || null,
                        death_date: deceasedDeathDate || null,
                        burial_date: deceasedBurialDate || null,
                        gender: (['Male', 'Female', 'Other'].includes(deceasedGender)) ? deceasedGender : null,
                        epitaph: deceasedEpitaph || null
                    }]);
            } catch (memErr) {
                console.warn('Could not record deceased in memorial_records:', memErr);
            }
        }

        // Update plot status
        const spaceStatus = (fullDeceasedName && (deceasedBurialDate || planType === 'AT-NEED')) ? 'occupied' : 'reserved';
        await supabaseClient
            .from('memorial_spaces')
            .update({ status: spaceStatus })
            .eq('id', targetSpaceId);

        // Generate receipt
        if (typeof window.generateAndDownloadReceiptPDF === 'function') {
            const { data: userProfile } = await supabaseClient.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
            const clientName = userProfile?.full_name || userProfile?.username || user.email?.split('@')[0] || 'Valued Client';
            const receiptData = {
                paymentTag,
                reservationNumber: resNumber,
                paymentReference,
                paymentChannel: (paymentChannel === 'GCash' ? 'GCash (Instant Pay)' : 'Cash (Over the Counter)'),
                gcashReference: (paymentChannel === 'GCash' ? paymentReference : ''),
                dateIssued: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                clientName,
                clientEmail: user.email || '',
                plotIdentifier: plotCode,
                sectionName: activeSelectedPlot?.section_name || 'Memorial Section',
                category: activeSelectedPlot?.category || 'Memorial Space',
                planType,
                paymentOption,
                termMonths: term,
                totalPrice: price,
                amountNow,
                remainingBalance: balanceRecorded,
                monthlyAmortization: monthly,
                counterInstructions: isCash
                    ? 'Please present this receipt at the counter when called.'
                    : 'Payment settled via official GCash merchant QR.'
            };
            window.generateAndDownloadReceiptPDF(receiptData);
            if (typeof window.sendReceiptViaEmailJS === 'function') {
                window.sendReceiptViaEmailJS(receiptData).catch(() => {});
            }
        }

        alert(`Congratulations! Reservation ${resNumber} for plot ${plotCode} has been submitted successfully (${paymentTag}).`);
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error('Reservation error:', err);
        alert('Failed to submit reservation: ' + err.message);
    } finally {
        if (btnText) btnText.style.display = 'inline-block';
        if (btnLoader) btnLoader.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

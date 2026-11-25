
let activePromoCode = '';
let promoCodeDiscountAmount = 0;
let currentPaymentProofDataUrl = '';

// ==============================================================================
// INTERACTIVE SINGLE PLOT LAYOUT CONTROLLER - RESERVATION PORTAL
// Zion Memorial Garden - Cloud-Based Online Reservation & Records Management
// Displays ONE section / plot layout at a time for focused interactive booking
// ==============================================================================

// Area Grid and Dimension Specifications (True Vector Assets & Natural Dimensions)
const SECTION_SHAPE_MAP = {
    'Area 1 - Single Tiered Lawn': {
        area: '1',
        tab: 'single-teired',
        asset: 'assets/images/Map/Vector (7).png',
        prefix: 'ST1',
        category: 'Single Teired',
        cols: 24,
        rows: 24,
        widthPx: 1109,
        heightPx: 1165,
        defaultPrice: 65000,
        defaultDown: 11960
    },
    'Area 2 - Lawn of Love': {
        area: '2',
        tab: 'special-supreme',
        asset: 'assets/images/Map/Vector (8).png',
        prefix: 'LL',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 786,
        heightPx: 971,
        defaultPrice: 120000,
        defaultDown: 22080
    },
    'Area 3 - Lawn of Hope (Family Estate)': {
        area: '3',
        tab: 'family-estate',
        asset: 'assets/images/Map/Vector (9).png',
        prefix: 'FE',
        category: 'Family Estate Jr.',
        cols: 24,
        rows: 26,
        widthPx: 881,
        heightPx: 969,
        defaultPrice: 1000000,
        defaultDown: 184000
    },
    'Area 4 - Supreme Garden': {
        area: '4',
        tab: 'supreme',
        asset: 'assets/images/Map/Vector (12).png',
        prefix: 'SUP4',
        category: 'Supreme',
        cols: 24,
        rows: 26,
        widthPx: 894,
        heightPx: 964,
        defaultPrice: 80000,
        defaultDown: 14720
    },
    'Area 5 - Special Supreme Estate': {
        area: '5',
        tab: 'special-supreme',
        asset: 'assets/images/Map/Vector (13).png',
        prefix: 'SPEC5',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 782,
        heightPx: 964,
        defaultPrice: 120000,
        defaultDown: 22080
    },
    'Area 6 - Lawn of Peace': {
        area: '6',
        tab: 'single-teired',
        asset: 'assets/images/Map/Vector (6).png',
        prefix: 'ST6',
        category: 'Single Teired',
        cols: 18,
        rows: 28,
        widthPx: 468,
        heightPx: 765,
        defaultPrice: 65000,
        defaultDown: 11960
    },
    'Area 7 - Lawn of Faith': {
        area: '7',
        tab: 'supreme',
        asset: 'assets/images/Map/Vector (5).png',
        prefix: 'SUP7',
        category: 'Supreme',
        cols: 18,
        rows: 26,
        widthPx: 462,
        heightPx: 697,
        defaultPrice: 80000,
        defaultDown: 14720
    },
    'Area 8 - Lawn of Grace': {
        area: '8',
        tab: 'supreme',
        asset: 'assets/images/Map/Vector (10).png',
        prefix: 'SUP8',
        category: 'Supreme',
        cols: 16,
        rows: 22,
        widthPx: 335,
        heightPx: 456,
        defaultPrice: 80000,
        defaultDown: 14720
    },
    'Area 9 - Lawn of Serenity': {
        area: '9',
        tab: 'special-supreme',
        asset: 'assets/images/Map/Vector (11).png',
        prefix: 'SER9',
        category: 'Special Supreme',
        cols: 24,
        rows: 24,
        widthPx: 777,
        heightPx: 799,
        defaultPrice: 120000,
        defaultDown: 22080
    },
    'Area 10 - Condominium Block A': {
        area: '10',
        tab: 'condominium',
        asset: 'assets/images/Map/Vector (14).png',
        prefix: 'COND',
        category: 'Condominium',
        cols: 28,
        rows: 24,
        widthPx: 899,
        heightPx: 757,
        defaultPrice: 45000,
        defaultDown: 8280
    },
    'Area 11 - Lawn of Memories': {
        area: '11',
        tab: 'special-supreme',
        asset: 'assets/images/Map/Vector (3).png',
        prefix: 'SPEC11',
        category: 'Special Supreme',
        cols: 16,
        rows: 36,
        widthPx: 417,
        heightPx: 1444,
        defaultPrice: 120000,
        defaultDown: 22080
    },
    'Area 12 - Mausoleum Court': {
        area: '12',
        tab: 'mausoleum',
        asset: 'assets/images/Map/Vector (4).png',
        prefix: 'MAUS',
        category: 'Mausoleum',
        cols: 24,
        rows: 24,
        widthPx: 691,
        heightPx: 669,
        defaultPrice: 1000000,
        defaultDown: 184000
    }
};

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
let currentSectionName = resolveInitialSectionFromUrl();
let initialTargetPlotCode = (urlParams.get('plot') || '').toUpperCase();

// State
let currentPlotsList = [];
let activeSelectedPlot = null;
let currentStatusFilter = 'all';

// Pan & Zoom State for the Single Area Board
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;
let basePanX = 0;
let basePanY = 0;

// Resolve which section to display initially
function resolveInitialSectionFromUrl() {
    const rawAreaName = urlParams.get('areaName');
    if (rawAreaName && SECTION_SHAPE_MAP[rawAreaName]) {
        return rawAreaName;
    }

    const rawArea = urlParams.get('area');
    if (rawArea) {
        const found = Object.keys(SECTION_SHAPE_MAP).find(k => SECTION_SHAPE_MAP[k].area === String(rawArea));
        if (found) return found;
    }

    const rawSection = urlParams.get('section');
    if (rawSection) {
        const found = Object.keys(SECTION_SHAPE_MAP).find(k => SECTION_SHAPE_MAP[k].tab === rawSection);
        if (found) return found;
    }

    // Default to Area 10 - Condominium Block A
    return 'Area 10 - Condominium Block A';
}

// ==============================================================================
const CUSTOM_CATEGORY_DEFAULTS = {
    'Single Teired':     { defaultPrice: 65000,   defaultDown: 11960 },
    'Supreme':           { defaultPrice: 80000,   defaultDown: 14720 },
    'Special Supreme':   { defaultPrice: 120000,  defaultDown: 22080 },
    'Condominium':       { defaultPrice: 45000,   defaultDown: 8280 },
    'Family Estate Jr.': { defaultPrice: 1000000, defaultDown: 184000 },
    'Mausoleum':         { defaultPrice: 1000000, defaultDown: 184000 }
};

function syncSectionDropdownOptions() {
    const dropdown = document.getElementById('sectionSelectDropdown');
    if (!dropdown) return;
    const prevVal = dropdown.value || currentSectionName;
    const orderedNames = Object.keys(SECTION_SHAPE_MAP).sort((a, b) => {
        const na = parseInt(SECTION_SHAPE_MAP[a].area, 10) || 999;
        const nb = parseInt(SECTION_SHAPE_MAP[b].area, 10) || 999;
        return na !== nb ? na - nb : a.localeCompare(b);
    });
    dropdown.innerHTML = '';
    orderedNames.forEach(secName => {
        const meta = SECTION_SHAPE_MAP[secName];
        const opt = document.createElement('option');
        opt.value = secName;
        opt.dataset.area = meta.area || '';
        opt.dataset.tab = meta.tab || '';
        opt.textContent = secName;
        dropdown.appendChild(opt);
    });
    if (SECTION_SHAPE_MAP[prevVal]) dropdown.value = prevVal;
}

function registerCustomAreasForPlotDetails(layersOverride) {
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
        const pricing = CUSTOM_CATEGORY_DEFAULTS[meta.category] || { defaultPrice: 65000, defaultDown: 9750 };
        SECTION_SHAPE_MAP[secName] = {
            ...meta,
            asset: meta.asset || window.ZMGFence.buildAreaSvgDataUrl(meta.cols, meta.rows, meta.area),
            defaultPrice: pricing.defaultPrice,
            defaultDown: pricing.defaultDown
        };
    });
    syncSectionDropdownOptions();
}

async function syncCustomAreasFromSupabase() {
    registerCustomAreasForPlotDetails();
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data: cfgRow, error } = await supabaseClient
            .from('memorial_spaces')
            .select('coordinates')
            .eq('plot_identifier', 'ZMG-MAP-VECTOR-LAYOUT-CONFIG')
            .maybeSingle();
        if (!error && cfgRow && cfgRow.coordinates && Array.isArray(cfgRow.coordinates.vectorLayers)) {
            const cleaned = cfgRow.coordinates.vectorLayers.filter(v => !window.ZMGFence || !window.ZMGFence.isLegacyWall(v));
            try {
                localStorage.setItem('zion_cemetery_map_vector_layout_v2', JSON.stringify(cleaned));
            } catch (_) {}
            registerCustomAreasForPlotDetails(cleaned);
        }
    } catch (err) {
        console.warn('Notice syncing custom map areas for plot-details:', err);
    }
}

// ==============================================================================
// 1. DOM READY & INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    await syncCustomAreasFromSupabase();
    currentSectionName = resolveInitialSectionFromUrl();

    setupHeaderButtons();
    setupSectionDropdown();
    setupStatusFilters();
    setupPanAndZoom();
    setupBookingModal();
    loadUserAvatar();

    // Load and render active section
    await switchSection(currentSectionName, initialTargetPlotCode);
});

function setupHeaderButtons() {
    const backBtn = document.getElementById('backToMapBtnTop');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (document.referrer && document.referrer.includes('dashboard')) {
                window.location.href = 'dashboard.html';
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'dashboard.html';
            }
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
            window.location.href = 'dashboard.html';
        });
    }
}

function setupSectionDropdown() {
    const dropdown = document.getElementById('sectionSelectDropdown');
    if (!dropdown) return;

    const existingValues = new Set(Array.from(dropdown.options).map(o => o.value));
    Object.entries(SECTION_SHAPE_MAP).forEach(([secName, meta]) => {
        if (!existingValues.has(secName)) {
            const opt = document.createElement('option');
            opt.value = secName;
            opt.dataset.area = meta.area || '';
            opt.dataset.tab = meta.tab || '';
            opt.textContent = secName;
            dropdown.appendChild(opt);
        }
    });

    dropdown.value = currentSectionName;
    dropdown.addEventListener('change', async (e) => {
        const selected = e.target.value;
        if (selected && SECTION_SHAPE_MAP[selected]) {
            await switchSection(selected);
        }
    });
}

function setupStatusFilters() {
    const buttons = document.querySelectorAll('#statusFilterPills .status-filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.filter || 'all';
            renderActiveSectionGrid();
        });
    });
}

async function loadUserAvatar() {
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .maybeSingle();

            if (profile?.avatar_url) {
                const img = document.getElementById('plotDetailsUserAvatar');
                if (img) img.src = profile.avatar_url;
            }
        }
    } catch (_) {}
}

// ==============================================================================
// 2. SWITCH & LOAD SECTION (ONE PLOT LAYOUT AT A TIME)
// ==============================================================================
async function switchSection(sectionName, targetPlotCode = '') {
    currentSectionName = sectionName;
    const shapeInfo = SECTION_SHAPE_MAP[sectionName] || SECTION_SHAPE_MAP['Area 10 - Condominium Block A'];

    // Update Dropdown, Header Badge, and Section Titles
    const dropdown = document.getElementById('sectionSelectDropdown');
    if (dropdown && dropdown.value !== sectionName) dropdown.value = sectionName;

    const badge = document.getElementById('headerSectionBadge');
    if (badge) badge.textContent = sectionName;

    const title = document.getElementById('gridSectionTitle');
    if (title) title.textContent = sectionName;

    const subtitle = document.getElementById('gridSectionSubtitle');
    if (subtitle) subtitle.textContent = `${shapeInfo.category} plot layout & live reservation availability`;

    // Update URL without refreshing page
    const cleanUrl = `plot-details.html?section=${shapeInfo.tab}&area=${shapeInfo.area}&areaName=${encodeURIComponent(sectionName)}`;
    window.history.replaceState(null, '', cleanUrl);

    // Setup Board Dimensions to match natural aspect ratio of the vector asset
    setupBoardDimensions(shapeInfo);

    // Fetch or Generate Plots for this single section
    await loadPlotsForSection(sectionName, shapeInfo);

    // Render the Grid
    renderActiveSectionGrid();

    // Auto fit/center the board
    fitBoardToViewport();

    // If target plot provided, select and highlight it
    if (targetPlotCode) {
        const found = currentPlotsList.find(p => String(p.plot_identifier).toUpperCase() === targetPlotCode);
        if (found) {
            selectPlot(found);
        } else if (currentPlotsList.length > 0) {
            selectPlot(currentPlotsList[0]);
        }
    } else if (currentPlotsList.length > 0) {
        // Default select first available plot
        const firstAvail = currentPlotsList.find(p => (p.status || '').toLowerCase() === 'available') || currentPlotsList[0];
        selectPlot(firstAvail);
    }
}

function setupBoardDimensions(shapeInfo) {
    const board = document.getElementById('singleAreaBoard');
    const shapeImg = document.getElementById('areaShapeImg');
    if (!board || !shapeImg) return;

    // Standard baseline width for crisp layout view
    const BASE_WIDTH = 920;
    const aspect = shapeInfo.heightPx / shapeInfo.widthPx;
    const boardHeight = Math.round(BASE_WIDTH * aspect);

    board.style.width = `${BASE_WIDTH}px`;
    board.style.height = `${boardHeight}px`;

    // Silhouette outline backdrop image
    shapeImg.src = shapeInfo.asset;
    shapeImg.alt = shapeInfo.prefix;
}

// ==============================================================================
// 3. LOAD PLOTS (Cloud Supabase + Blueprint Layout Fallbacks)
// ==============================================================================
async function loadPlotsForSection(sectionName, shapeInfo) {
    currentPlotsList = [];

    try {
        if (typeof supabaseClient !== 'undefined') {
            const aliases = (window.ZMGFence && typeof window.ZMGFence.sectionNameAliases === 'function')
                ? window.ZMGFence.sectionNameAliases(sectionName)
                : [sectionName];
            let query = supabaseClient
                .from('memorial_spaces')
                .select('*');
            if (aliases.length > 1) {
                query = query.in('section_name', aliases);
            } else {
                query = query.ilike('section_name', `%${sectionName}%`);
            }
            const { data: dbPlots, error } = await query.order('plot_identifier', { ascending: true });

            if (!error && dbPlots && dbPlots.length > 0) {
                dbPlots.forEach(p => {
                    if (window.ZMGFence && typeof window.ZMGFence.normalizeSectionName === 'function') {
                        p.section_name = window.ZMGFence.normalizeSectionName(p.section_name);
                    }
                });
                currentPlotsList = dbPlots;
            }
        }
    } catch (e) {
        console.warn('Notice loading section plots from cloud:', e);
    }

    // Local editor cache fallback before blueprint generation
    if (currentPlotsList.length === 0) {
        try {
            const cachedRaw = localStorage.getItem('zion_section_plots_v1_' + sectionName);
            if (cachedRaw) {
                const parsed = JSON.parse(cachedRaw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    currentPlotsList = parsed;
                }
            }
        } catch (_) {}
    }

    // Fallback: Generate full accurate blueprint plots if no rows exist in DB
    if (currentPlotsList.length === 0) {
        if (sectionName === 'Area 5 - Special Supreme Estate') {
            currentPlotsList = generateArea5Blueprint();
        } else {
            currentPlotsList = generateGenericBlueprint(sectionName, shapeInfo);
        }
    }

    // Compute Section KPIs
    updateSectionKPIs();
}

function updateSectionKPIs() {
    const total = currentPlotsList.length;
    const avail = currentPlotsList.filter(p => (p.status || 'available').toLowerCase() === 'available').length;
    const res = currentPlotsList.filter(p => (p.status || '').toLowerCase() === 'reserved').length;
    const occ = currentPlotsList.filter(p => (p.status || '').toLowerCase() === 'occupied').length;
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

function generateArea5Blueprint() {
    const plots = [];
    const sectionName = 'Area 5 - Special Supreme Estate';
    const category = 'Special Supreme';
    const price = 85000;
    const dp = 12500;
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
                down_payment: dp,
                col_num: c,
                row_num: rSpec.row,
                coordinates: { width: 2, height: 3, col_span: 2, row_span: 3 }
            });
            seq++;
        }
    }
    return plots;
}

function generateGenericBlueprint(sectionName, shapeInfo) {
    const plots = [];
    const cols = shapeInfo.cols || 24;
    const rows = shapeInfo.rows || 24;
    const isCondo = shapeInfo.prefix === 'COND';
    const isFamily = shapeInfo.category.includes('Family');
    const isSupreme = shapeInfo.category.includes('Supreme');

    const pW = isCondo ? 1 : (isFamily ? 4 : (isSupreme ? 2 : 1));
    const pH = isCondo ? 1 : (isFamily ? 4 : (isSupreme ? 2 : 2));
    const price = shapeInfo.defaultPrice || (isCondo ? 35000 : 65000);
    const dp = shapeInfo.defaultDown || Math.round(price * 0.15);
    let seq = 1;

    const stepCol = pW + (isCondo ? 0 : 1);
    const stepRow = pH + (isCondo ? 0 : 1);
    const polyPts = Array.isArray(shapeInfo.points) && shapeInfo.points.length >= 3 ? shapeInfo.points : null;

    for (let r = 1; r <= rows - pH + 1; r += stepRow) {
        for (let c = 1; c <= cols - pW + 1; c += stepCol) {
            if (polyPts && window.ZMGFence && typeof window.ZMGFence.isPointInPolygonPct === 'function') {
                const cxPct = ((c - 1 + pW / 2) / cols) * 100;
                const cyPct = ((r - 1 + pH / 2) / rows) * 100;
                if (!window.ZMGFence.isPointInPolygonPct(cxPct, cyPct, polyPts)) continue;
            }
            const code = `${shapeInfo.prefix}-${String(seq).padStart(3, '0')}`;
            plots.push({
                id: ((parseInt(shapeInfo.area, 10) || 13) * 1000) + seq,
                plot_identifier: code,
                section_name: sectionName,
                category: shapeInfo.category,
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
// 4. RENDER GRID (ONLY PLOTS FOR THIS ACTIVE SECTION)
// ==============================================================================
function renderActiveSectionGrid() {
    const gridLayer = document.getElementById('singleAreaPlotsGrid');
    if (!gridLayer) return;

    gridLayer.innerHTML = '';

    const shapeInfo = SECTION_SHAPE_MAP[currentSectionName] || { cols: 24, rows: 24 };

    // Determine max columns & rows based on actual plots in section
    let maxCol = shapeInfo.cols || 24;
    let maxRow = shapeInfo.rows || 24;
    currentPlotsList.forEach(p => {
        const cEnd = (p.col_num || 1) + (p.coordinates?.width || p.coordinates?.col_span || 1) - 1;
        const rEnd = (p.row_num || 1) + (p.coordinates?.height || p.coordinates?.row_span || 1) - 1;
        if (cEnd > maxCol) maxCol = cEnd;
        if (rEnd > maxRow) maxRow = rEnd;
    });

    gridLayer.style.gridTemplateColumns = `repeat(${maxCol}, 1fr)`;
    gridLayer.style.gridTemplateRows = `repeat(${maxRow}, 1fr)`;

    // Filter plots if status filter active
    let displayPlots = currentPlotsList;
    if (currentStatusFilter !== 'all') {
        displayPlots = currentPlotsList.filter(p => (p.status || 'available').toLowerCase() === currentStatusFilter);
    }

    displayPlots.forEach(plot => {
        const status = (plot.status || 'available').toLowerCase();
        const colNum = plot.col_num || 1;
        const rowNum = plot.row_num || 1;
        const w = plot.coordinates?.width || plot.coordinates?.col_span || 1;
        const h = plot.coordinates?.height || plot.coordinates?.row_span || 1;
        const isSelected = activeSelectedPlot && String(activeSelectedPlot.plot_identifier).toUpperCase() === String(plot.plot_identifier).toUpperCase();

        const cell = document.createElement('div');
        cell.className = `single-area-plot-cell status-${status} ${isSelected ? 'selected' : ''}`;
        cell.id = `plot-slot-${plot.plot_identifier}`;
        cell.style.gridColumn = `${colNum} / span ${w}`;
        cell.style.gridRow = `${rowNum} / span ${h}`;
        cell.dataset.plotCode = plot.plot_identifier;
        cell.title = `${plot.plot_identifier} - ${plot.category} (${status.toUpperCase()}) - ₱ ${Number(plot.price || 0).toLocaleString()}`;

        // Text label
        const label = document.createElement('span');
        label.className = 'plot-label';
        label.textContent = plot.plot_identifier;
        cell.appendChild(label);

        // Click to Select
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            selectPlot(plot);
        });

        gridLayer.appendChild(cell);
    });
}

// ==============================================================================
// 5. PLOT SELECTION & SIDEBAR DETAILS
// ==============================================================================
async function selectPlot(plot) {
    if (!plot) return;
    activeSelectedPlot = plot;

    // Update active highlight on grid
    document.querySelectorAll('.single-area-plot-cell').forEach(el => {
        el.classList.toggle('selected', el.dataset.plotCode === plot.plot_identifier);
    });

    // Populate Sidebar Info Box
    const status = (plot.status || 'available').toUpperCase();
    const price = Number(plot.price || 0);
    const dp = Number(plot.down_payment || Math.round(price * 0.15));
    const colNum = plot.col_num || 1;
    const rowNum = plot.row_num || 1;
    const w = plot.coordinates?.width || plot.coordinates?.col_span || 1;
    const h = plot.coordinates?.height || plot.coordinates?.row_span || 1;

    setText('sidebarPlotCode', plot.plot_identifier);
    setText('sidebarPlotSectionName', plot.section_name || currentSectionName);
    setText('sidebarPlotCat', plot.category || 'Memorial Space');
    setText('sidebarPlotCoords', `Grid: Column ${colNum}, Row ${rowNum} (${w}×${h} units)`);
    setText('sidebarPlotPrice', `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    setText('sidebarPlotDownPayment', `Min. Down Payment: ₱ ${dp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    const statusTag = document.getElementById('sidebarPlotStatusTag');
    if (statusTag) {
        statusTag.textContent = status;
        statusTag.style.color = status === 'AVAILABLE' ? '#16a34a' : (status === 'RESERVED' ? '#ca8a04' : '#dc2626');
    }

    // Reserve Button State
    const reserveBtn = document.getElementById('btnReservePlotDirect');
    if (reserveBtn) {
        if (status === 'AVAILABLE') {
            reserveBtn.disabled = false;
            reserveBtn.innerHTML = `Reserve ${plot.plot_identifier}`;
            reserveBtn.style.background = '#2d4a36';
            reserveBtn.style.cursor = 'pointer';
            reserveBtn.onclick = () => openBookingModalForPlot(plot);
        } else {
            reserveBtn.disabled = true;
            reserveBtn.innerHTML = `Plot is ${status}`;
            reserveBtn.style.background = '#94a3b8';
            reserveBtn.style.cursor = 'not-allowed';
            reserveBtn.onclick = null;
        }
    }

    // Check for Deceased Family Records if Occupied
    const deceasedBox = document.getElementById('sidebarDeceasedInfo');
    if (deceasedBox) {
        if (status === 'OCCUPIED') {
            deceasedBox.style.display = 'block';
            setText('sidebarDeceasedName', 'Fetching Memorial Record...');
            setText('sidebarDeceasedDates', 'Please wait...');
            setText('sidebarDeceasedBurial', '');

            try {
                if (typeof supabaseClient !== 'undefined') {
                    const { data: rec } = await supabaseClient
                        .from('deceased_records')
                        .select('*')
                        .eq('space_id', plot.id)
                        .maybeSingle();

                    if (rec) {
                        const fullName = `${rec.first_name || ''} ${rec.middle_name ? rec.middle_name + ' ' : ''}${rec.last_name || ''}`.trim();
                        setText('sidebarDeceasedName', fullName || 'Departed Loved One');
                        setText('sidebarDeceasedDates', `Born: ${rec.date_of_birth || '--'} • Died: ${rec.date_of_death || '--'}`);
                        setText('sidebarDeceasedBurial', `Burial: ${rec.burial_date || 'Interred in Grace'}`);
                    } else {
                        setText('sidebarDeceasedName', 'Interred Memorial Space');
                        setText('sidebarDeceasedDates', 'Recorded in cemetery books');
                        setText('sidebarDeceasedBurial', 'Resting in peace');
                    }
                }
            } catch (_) {
                setText('sidebarDeceasedName', 'Interred Memorial Space');
            }
        } else {
            deceasedBox.style.display = 'none';
        }
    }
}

// ==============================================================================
// 6. PAN & ZOOM CONTROLLER (SMOOTH & RESPONSIVE)
// ==============================================================================
function setupPanAndZoom() {
    const viewport = document.getElementById('pdViewport');
    const stage = document.getElementById('singleAreaStage');
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomLabel = document.getElementById('zoomLabel');
    const btnIn = document.getElementById('btnZoomIn');
    const btnOut = document.getElementById('btnZoomOut');
    const btnFit = document.getElementById('btnZoomFit');
    const btnCenter = document.getElementById('btnZoomCenter');

    if (!viewport || !stage) return;

    function applyTransform() {
        stage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
        if (zoomSlider) zoomSlider.value = Math.round(zoomLevel * 100);
        if (zoomLabel) zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    }

    // Drag to Pan
    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        basePanX = panX;
        basePanY = panY;
        viewport.classList.add('panning');
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = basePanX + (e.clientX - startX);
        panY = basePanY + (e.clientY - startY);
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            viewport.classList.remove('panning');
        }
    });

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.min(3.0, Math.max(0.3, zoomLevel * factor));

        // Zoom centered on cursor
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        panX = mouseX - (mouseX - panX) * (newZoom / zoomLevel);
        panY = mouseY - (mouseY - panY) * (newZoom / zoomLevel);
        zoomLevel = newZoom;

        applyTransform();
    }, { passive: false });

    // Zoom Buttons
    if (btnIn) {
        btnIn.addEventListener('click', () => {
            zoomLevel = Math.min(3.0, zoomLevel + 0.15);
            applyTransform();
        });
    }

    if (btnOut) {
        btnOut.addEventListener('click', () => {
            zoomLevel = Math.max(0.3, zoomLevel - 0.15);
            applyTransform();
        });
    }

    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            zoomLevel = Math.min(3.0, Math.max(0.3, parseInt(e.target.value) / 100));
            applyTransform();
        });
    }

    if (btnFit) {
        btnFit.addEventListener('click', () => {
            fitBoardToViewport();
        });
    }

    if (btnCenter) {
        btnCenter.addEventListener('click', () => {
            panX = 0;
            panY = 0;
            applyTransform();
        });
    }

    window.fitBoardToViewport = function() {
        const board = document.getElementById('singleAreaBoard');
        if (!board || !viewport) return;

        const vRect = viewport.getBoundingClientRect();
        const bWidth = parseFloat(board.style.width) || 920;
        const bHeight = parseFloat(board.style.height) || 750;

        const padX = 60;
        const padY = 60;
        const fitScaleX = (vRect.width - padX) / bWidth;
        const fitScaleY = (vRect.height - padY) / bHeight;
        zoomLevel = Math.min(1.4, Math.max(0.4, Math.min(fitScaleX, fitScaleY)));

        panX = 0;
        panY = 0;
        applyTransform();
    };
}

// ==============================================================================
// 7. RESERVATION BOOKING MODAL & AMORTIZATION
// ==============================================================================
function updatePlanTypeUi(type) {
    const subLabel = document.getElementById('bookDeceasedSubLabel');
    const helpText = document.getElementById('bookDeceasedHelpText');
    const section = document.getElementById('bookDeceasedSection');
    const reqFirst = document.getElementById('reqDeceasedFirst');
    const reqLast = document.getElementById('reqDeceasedLast');

    const priorityNotice = document.getElementById('atNeedPriorityNotice');
    if (priorityNotice) priorityNotice.style.display = (type === 'AT-NEED') ? 'block' : 'none';
    if (type === 'AT-NEED') {
        if (subLabel) subLabel.innerHTML = '<span style="color: #dc2626; font-weight: 700;"> Required for At-Need Interment</span>';
        if (helpText) {
            helpText.textContent = "Immediate interment requirement: Please enter your loved one's full details below to assign this plot and create the interment record.";
            helpText.style.color = '#b91c1c';
        }
        if (section) section.style.borderColor = '#15803d';
        if (reqFirst) reqFirst.style.display = 'inline';
        if (reqLast) reqLast.style.display = 'inline';
    } else {
        if (subLabel) subLabel.textContent = 'Optional (can be assigned or edited later)';
        if (helpText) {
            helpText.textContent = 'If reserving for an immediate need or specific loved one, enter details below. Otherwise leave blank for pre-need.';
            helpText.style.color = '#555';
        }
        if (section) section.style.borderColor = '#d4dfd2';
        if (reqFirst) reqFirst.style.display = 'none';
        if (reqLast) reqLast.style.display = 'none';
    }
}

function setupBookingModal() {
    const modal = document.getElementById('reservationBookingModal');
    const closeBtn = document.getElementById('closeBookingModalBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn') || document.getElementById('cancelBookingModalBtn');
    const form = document.getElementById('plotReservationForm');
    const termSelect = document.getElementById('installmentTerm');
    const customDpInput = document.getElementById('customDownPayment');

    const closeModal = () => modal?.classList.remove('active');
    const noticeEl = document.getElementById('atNeedPriorityNotice');

    // Setup Chronological Date Validation for Interred Loved One
    if (typeof setupChronologicalDateValidation === 'function') {
        setupChronologicalDateValidation({
            birthInput: 'bookDeceasedBirthDate',
            deathInput: 'bookDeceasedDeathDate',
            burialInput: 'bookDeceasedBurialDate',
            errorContainer: 'bookDeceasedDateError'
        });
    }

    // Promo Code Apply Button
    document.getElementById('btnApplyPromo')?.addEventListener('click', () => {
        const basePrice = parseFloat(document.getElementById('bookPlotPrice')?.value) || 0;
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
        recalculateAmortization();
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

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Plan Type Radios
    document.querySelectorAll('input[name="planType"]').forEach(r => {
        r.addEventListener('change', () => {
            document.querySelectorAll('input[name="planType"]').forEach(el => el.closest('.radio-card')?.classList.remove('active'));
            r.closest('.radio-card')?.classList.add('active');
            updatePlanTypeUi(r.value);
            recalculateAmortization();
        });
    });

    // Payment Option Radios (Installment vs Full Payment)
    document.querySelectorAll('input[name="paymentOption"]').forEach(r => {
        r.addEventListener('change', () => {
            document.querySelectorAll('input[name="paymentOption"]').forEach(el => el.closest('.radio-card')?.classList.remove('active'));
            r.closest('.radio-card')?.classList.add('active');

            const isInstallment = r.value === 'INSTALLMENT';
            const amortPanel = document.getElementById('amortizationPanel');
            const fullPanel = document.getElementById('fullPaymentPanel');

            if (amortPanel) amortPanel.style.display = isInstallment ? 'block' : 'none';
            if (fullPanel) fullPanel.style.display = isInstallment ? 'none' : 'block';

            recalculateAmortization();
        });
    });

    // Installment Term Change
    if (termSelect) {
        termSelect.addEventListener('change', recalculateAmortization);
    }

    // Custom Down Payment Input Change
    if (customDpInput) {
        customDpInput.addEventListener('input', recalculateAmortization);
    }

    // Payment Channel Pills (GCash, Bank, Maya, Card, Cash)
    document.querySelectorAll('input[name="paymentChannel"]').forEach(r => {
        r.addEventListener('change', () => {
            document.querySelectorAll('.channel-pill').forEach(p => p.classList.remove('active'));
            r.closest('.channel-pill')?.classList.add('active');
            if (typeof renderReservationChecksPanel === 'function') {
                renderReservationChecksPanel();
            }
        });
    });

    // Bank Dropdown Change
    const bankSelect = document.getElementById('zmgBankSelect');
    if (bankSelect) {
        bankSelect.addEventListener('change', () => {
            const opt = bankSelect.options[bankSelect.selectedIndex];
            const acc = opt.getAttribute('data-acc') || '';
            const branch = opt.getAttribute('data-branch') || '';
            const type = opt.getAttribute('data-type') || '';
            setText('zmgBankAccDisplay', acc);
            setText('zmgBankBranchDisplay', `${branch} • ${type}`);
        });
    }

    // Reservation Submit Handler
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
}

function openBookingModalForPlot(plot) {
    const modal = document.getElementById('reservationBookingModal');
    if (!modal || !plot) return;

    const price = Number(plot.price || 65000);
    const cat = plot.category || '';
    const initialPricing = (window.ZMG_PRICING && typeof window.ZMG_PRICING.computePlanPricing === 'function')
        ? window.ZMG_PRICING.computePlanPricing({ lotPrice: price, category: cat, planType: 'PRE-NEED', paymentOption: 'INSTALLMENT', termMonths: 60 })
        : null;
    const dp = Number(plot.down_payment) > 0 ? Number(plot.down_payment) : (initialPricing ? initialPricing.defaultDown20 : Math.round(price * 0.92 * 0.20));

    document.getElementById('bookSpaceId').value = plot.id;
    document.getElementById('bookPlotIdentifier').value = plot.plot_identifier;
    const priceEl = document.getElementById('bookPlotPrice');
    priceEl.value = price;
    priceEl.dataset.category = cat;
    document.getElementById('bookPlotDownPayment').value = dp;
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

    const customDpInput = document.getElementById('customDownPayment');
    if (customDpInput) {
        customDpInput.value = dp.toFixed(2);
        customDpInput.min = "100";
    }

    setText('bookDisplayPlotCode', plot.plot_identifier);
    setText('bookDisplaySection', `${plot.section_name || currentSectionName} | ${plot.category || 'Memorial Space'}`);
    setText('bookDisplayPrice', `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    setText('displayFullDue', `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

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

    // Reset deceased fields
    ['bookDeceasedFirstName', 'bookDeceasedMiddleName', 'bookDeceasedLastName', 'bookDeceasedBirthDate', 'bookDeceasedDeathDate', 'bookDeceasedBurialDate', 'bookDeceasedEpitaph'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const genderSelect = document.getElementById('bookDeceasedGender');
    if (genderSelect) genderSelect.value = '';

    // Reset plan type to Pre-Need
    const preNeedRadio = document.querySelector('input[name="planType"][value="PRE-NEED"]');
    if (preNeedRadio) {
        preNeedRadio.checked = true;
        document.querySelectorAll('input[name="planType"]').forEach(el => el.closest('.radio-card')?.classList.remove('active'));
        preNeedRadio.closest('.radio-card')?.classList.add('active');
    }
    updatePlanTypeUi('PRE-NEED');

    recalculateAmortization();

    modal.classList.add('active');
}

function recalculateAmortization() {
    const priceEl = document.getElementById('bookPlotPrice');
    const basePrice = parseFloat(priceEl?.value) || 0;
    const category = priceEl?.dataset?.category || '';
    const planType = document.querySelector('input[name="planType"]:checked')?.value || 'PRE-NEED';
    const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
    const isFullPayment = paymentOption === 'FULL_PAYMENT';

    const customDpInput = document.getElementById('customDownPayment');
    const hasCustomDp = customDpInput && customDpInput.value !== '' && !Number.isNaN(parseFloat(customDpInput.value));
    const termSelect = document.getElementById('installmentTerm');
    const term = parseInt(termSelect?.value, 10) || 60;

    const pricing = (window.ZMG_PRICING && typeof window.ZMG_PRICING.computePlanPricing === 'function')
        ? window.ZMG_PRICING.computePlanPricing({
            lotPrice: basePrice,
            category,
            planType,
            paymentOption,
            termMonths: term,
            customDownPayment: hasCustomDp ? parseFloat(customDpInput.value) : undefined,
            promoDiscount: promoCodeDiscountAmount
        })
        : {
            lotPrice: basePrice,
            pmcf: Math.round(basePrice * 0.10 * 100) / 100,
            isAtNeed: planType === 'AT-NEED',
            planDiscount: Math.round(basePrice * (planType === 'AT-NEED' ? 0.08 : 0.18) * 100) / 100,
            contractPrice: Math.max(0, basePrice * (planType === 'AT-NEED' ? 1.02 : 0.92) - promoCodeDiscountAmount),
            spotCashDiscount: 0,
            spotCashPrice: Math.max(0, basePrice * (planType === 'AT-NEED' ? 1.02 : 0.92) - promoCodeDiscountAmount),
            downPayment: hasCustomDp ? parseFloat(customDpInput.value) : Math.round(basePrice * 0.92 * 0.20),
            remainingBalance: 0,
            monthlyPayment: 0
        };

    const finalNetPrice = isFullPayment ? pricing.spotCashPrice : pricing.contractPrice;
    const totalSavings = pricing.spotCashDiscount + promoCodeDiscountAmount;

    const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    setText('displayBasePlotPrice', peso(pricing.lotPrice));
    setText('displayMaintenanceFee', peso(pricing.pmcf));
    setText('labelPlanDiscount', pricing.isAtNeed ? 'At-Need Discount (8% of Lot):' : 'Pre-Need Discount (18% of Lot):');
    setText('displayCemeteryTax', '- ' + peso(pricing.planDiscount));
    setText('displayNetContractPrice', peso(finalNetPrice));
    setText('bookDisplayPrice', peso(finalNetPrice));
    setText('calcDownPayment', peso(pricing.downPayment));
    setText('calcRemainingBalance', peso(pricing.remainingBalance));
    setText('calcMonthlyAmortization', `${peso(pricing.monthlyPayment)} / mo`);
    setText('displayFullDue', peso(finalNetPrice));

    const rowPromo = document.getElementById('rowPromoDiscount');
    if (rowPromo) {
        rowPromo.style.display = totalSavings > 0 ? 'flex' : 'none';
        setText('displayPromoDiscount', '- ' + peso(totalSavings));
    }
}

async function handleReservationSubmit(e) {
    e.preventDefault();

    if (typeof supabaseClient === 'undefined') {
        alert('Database connection error. Please refresh and try again.');
        return;
    }

    const submitBtn = document.getElementById('submitReservationBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Reservation...';
    }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Please sign in to place an official plot reservation.');
            window.location.href = 'index.html';
            return;
        }

        const planType = document.querySelector('input[name="planType"]:checked')?.value || 'PRE-NEED';
        const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
        const paymentChannel = document.querySelector('input[name="paymentChannel"]:checked')?.value || 'GCash';
        const notes = document.getElementById('reservationNotes')?.value.trim() || '';

        const spaceId = document.getElementById('bookSpaceId').value;
        const plotCode = document.getElementById('bookPlotIdentifier').value;
        const basePrice = parseFloat(document.getElementById('bookPlotPrice').value) || 0;
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
        const customDpInput = document.getElementById('customDownPayment');
        let dp = customDpInput && customDpInput.value !== '' ? parseFloat(customDpInput.value) : (parseFloat(document.getElementById('bookPlotDownPayment')?.value) || 0);
        if (isNaN(dp) || dp < 0) dp = 0;

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
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm & Place Reservation';
            }
            alert('Please enter at least the First Name and Last Name of the deceased for your At-Need reservation.');
            document.getElementById('bookDeceasedFirstName')?.focus();
            return;
        }

        // Chronological Date Validation for Interred Loved One
        if (typeof checkDateChronology === 'function') {
            const dateCheck = checkDateChronology(deceasedBirthDate, deceasedDeathDate, deceasedBurialDate);
            if (!dateCheck.valid) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Confirm & Place Reservation';
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoader = submitBtn.querySelector('.btn-loader');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoader) btnLoader.style.display = 'none';
                }
                alert('Invalid Date Chronology:\n\n' + dateCheck.message);
                if (dateCheck.field === 'birth') document.getElementById('bookDeceasedBirthDate')?.focus();
                else if (dateCheck.field === 'death') document.getElementById('bookDeceasedDeathDate')?.focus();
                else if (dateCheck.field === 'burial') document.getElementById('bookDeceasedBurialDate')?.focus();
                return;
            }
        }

        const term = paymentOption === 'INSTALLMENT' ? (parseInt(document.getElementById('installmentTerm')?.value) || 60) : 0;
        const amountNow = paymentOption === 'INSTALLMENT' ? (dp > 0 ? dp : price) : price;
        const isGcashQr = !isCash && !document.getElementById('zmgGcashSubMethodAutoDebit')?.checked;
        const hasGcashAutoDebit = Boolean(document.getElementById('zmgGcashSubMethodAutoDebit')?.checked);
        const attachedProof = currentPaymentProofDataUrl || window.stagedGcashReceiptProofUrl || (typeof stagedGcashReceiptProofUrl !== 'undefined' ? stagedGcashReceiptProofUrl : null);

        // Mandatory GCash Screenshot Validation (Required instead of typing reference number)
        if (paymentChannel === 'GCash' && !hasGcashAutoDebit && !attachedProof) {
            if (submitBtn) {
                submitBtn.disabled = false;
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
            }
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

        // 1. Create Reservation in Supabase (down_payment_amount is the correct DB column)
        const { data: newRes, error: resError } = await supabaseClient
            .from('reservations')
            .insert([{
                user_id: user.id,
                space_id: spaceId ? (isNaN(spaceId) ? null : Number(spaceId)) : null,
                reservation_number: resNumber,
                status: balanceRecorded <= 0 ? 'COMPLETED' : 'PENDING',
                plan_type: planType,
                payment_method: paymentOption,
                total_price: price,
                down_payment_amount: dp,
                total_paid: totalPaidRecorded,
                balance: balanceRecorded,
                installment_term_months: term,
                monthly_amortization: monthly,
                notes: finalNotes
            }])
            .select()
            .single();

        if (resError) throw resError;

        // 2. Insert Payment Record
        await supabaseClient.from('payments').insert([{
            reservation_id: newRes.id,
            payment_reference: manualRef || paymentReference,
            amount: amountNow,
            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
            payment_method: isCash ? 'Cash' : 'GCash',
            status: isImmediatelyPaid ? 'COMPLETED' : 'PENDING',
            receipt_url: attachedProof || currentPaymentProofDataUrl || null,
            paid_at: isImmediatelyPaid ? new Date().toISOString() : null,
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        }]);

        // 3. Insert Interred Deceased into memorial_records if provided
        const targetSpaceId = spaceId && !isNaN(spaceId) ? Number(spaceId) : null;
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
                console.warn('Could not record deceased memorial record:', memErr);
            }
        }

        // 4. Update Memorial Space status (occupied if At-Need or burial date given, otherwise reserved)
        const spaceStatus = (fullDeceasedName && (deceasedBurialDate || planType === 'AT-NEED')) ? 'occupied' : 'reserved';
        if (targetSpaceId) {
            await supabaseClient
                .from('memorial_spaces')
                .update({ status: spaceStatus, updated_at: new Date().toISOString() })
                .eq('id', targetSpaceId);
        }

        // Close Modal
        document.getElementById('reservationBookingModal')?.classList.remove('active');

        // 5. Generate Paid / Official PDF Receipt and Email confirmation
        let clientName = 'Valued Client';
        try {
            const { data: profile } = await supabaseClient.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
            clientName = profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client';
        } catch (_) {}

        if (typeof window.generateAndDownloadReceiptPDF === 'function') {
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
                sectionName: currentSectionName,
                category: activeSelectedPlot?.category || 'Memorial Space',
                planType,
                paymentOption,
                termMonths: term,
                totalPrice: price,
                amountNow,
                remainingBalance: balanceRecorded,
                monthlyAmortization: monthly,
                counterInstructions: isCash
                    ? 'Please present this reservation confirmation at the Zion Memorial Garden counter.'
                    : 'Payment settled via official GCash merchant QR.'
            };

            window.generateAndDownloadReceiptPDF(receiptData);
            if (typeof window.sendReceiptViaEmailJS === 'function') {
                window.sendReceiptViaEmailJS(receiptData);
            }
            if (typeof window.showOfficialReceiptModal === 'function') {
                window.showOfficialReceiptModal(receiptData);
            }
        }

        // 6. Update local state & re-render section plots
        if (activeSelectedPlot) {
            activeSelectedPlot.status = spaceStatus;
        }
        const pObj = currentPlotsList.find(p => p.plot_identifier === plotCode);
        if (pObj) pObj.status = spaceStatus;

        updateSectionKPIs();
        renderActiveSectionGrid();
        selectPlot(pObj || activeSelectedPlot);

        if (typeof showNotification === 'function') {
            showNotification(
                'Reservation Confirmed!',
                `Successfully reserved plot ${plotCode} in ${currentSectionName}! Your receipt has been downloaded.`,
                'success'
            );
        } else {
            alert(`Reservation Confirmed for ${plotCode}!`);
        }

    } catch (err) {
        console.error('Reservation submission error:', err);
        alert('Failed to submit reservation: ' + (err.message || String(err)));
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm & Place Reservation';
        }
    }
}

// Helper
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

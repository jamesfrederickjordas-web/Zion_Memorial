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

function getVectorLayout() {
    try {
        const saved = localStorage.getItem(MAP_VECTOR_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Merge saved coordinates with base catalog definitions to preserve image assets and metadata
                return DEFAULT_MAP_VECTORS.map(def => {
                    const found = parsed.find(p => String(p.area) === String(def.area) || p.id === def.id);
                    if (found) {
                        const left = typeof found.left === 'number' ? found.left : def.left;
                        const top = typeof found.top === 'number' ? found.top : def.top;
                        const width = typeof found.width === 'number' ? found.width : def.width;
                        const rotate = typeof found.rotate === 'number' ? found.rotate : def.rotate;

                        return {
                            ...def,
                            left,
                            top,
                            width,
                            rotate
                        };
                    }
                    return def;
                });
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
        if (!fetchError && dbPlots && dbPlots.length > 0) {
            dbPlots.forEach(p => {
                if (p.section_name === '__SYSTEM_MAP_CONFIG__' && p.coordinates?.vectorLayers) {
                    systemVectorLayers = p.coordinates.vectorLayers;
                }
                if (!p.section_name || p.section_name.includes('__SYSTEM')) return;
                if (!dbGrouped[p.section_name]) dbGrouped[p.section_name] = [];
                dbGrouped[p.section_name].push(p);
            });
        }

        // Keep local vector cache aligned with cloud system config
        if (systemVectorLayers && Array.isArray(systemVectorLayers) && systemVectorLayers.length > 0) {
            try {
                localStorage.setItem(MAP_VECTOR_STORAGE_KEY, JSON.stringify(systemVectorLayers));
            } catch (_) {}
        }

        // For each known cemetery area: use DB plots if available, or generate exact blueprint
        Object.keys(SECTION_SHAPE_MAP).forEach(secName => {
            const shapeInfo = SECTION_SHAPE_MAP[secName];
            let sectionPlots = dbGrouped[secName];

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

        setText('statTotal', total.toLocaleString());
        setText('statAvail', avail.toLocaleString());
        setText('statRes', res.toLocaleString());
        setText('statOcc', occ.toLocaleString());

    } catch (err) {
        console.error('Error loading all plots:', err);
        // Fallback safety: ensure all sections have plots even if cloud query failed
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
            setText('statTotal', total.toLocaleString());
            setText('statAvail', avail.toLocaleString());
            setText('statRes', res.toLocaleString());
            setText('statOcc', occ.toLocaleString());
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
    const isCondo = shapeInfo.prefix === 'COND';
    const pW = isCondo ? 1 : (shapeInfo.category.includes('Supreme') ? 2 : (shapeInfo.category.includes('Family') ? 4 : 1));
    const pH = isCondo ? 1 : (shapeInfo.category.includes('Supreme') ? 2 : (shapeInfo.category.includes('Family') ? 4 : 2));
    const price = isCondo ? 35000 : (shapeInfo.category.includes('Family') ? 220000 : 65000);
    const dp = isCondo ? 5250 : (price * 0.15);
    let seq = 1;

    for (let r = 1; r <= rows - pH + 1; r += (pH + (isCondo ? 0 : 1))) {
        for (let c = 1; c <= cols - pW + 1; c += (pW + (isCondo ? 0 : 1))) {
            const code = `${shapeInfo.prefix}-${String(seq).padStart(3, '0')}`;
            plots.push({
                id: 1000 + seq,
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
// 3. RENDER THE ONE BIG MAP WITH ALL PLOTS
// ==============================================================================
function renderEntireCemeteryMapWithPlots() {
    const board = document.getElementById('entireMapBoard');
    if (!board) return;

    // Remove any previous dynamic areas (preserve master boundary guide image)
    board.querySelectorAll('.pd-map-area').forEach(el => el.remove());

    const layout = getVectorLayout();

    layout.forEach(v => {
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

        // 2. Vector Shape Silhouette Backdrop Image
        const shapeImg = document.createElement('img');
        shapeImg.src = v.src || shapeMeta.asset;
        shapeImg.alt = sectionName;
        shapeImg.className = 'pd-area-shape-img';
        shapeImg.draggable = false;
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
    // Center directly on the active cemetery grounds cluster
    panX = -110 * currentZoom;
    panY = 180 * currentZoom;
    applyCanvasTransform();
}

function autoFitMapToViewport() {
    const viewport = document.getElementById('pdViewport');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    if (rect.width > 50 && rect.height > 50) {
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

    // Recalculate amortization on changes
    if (termSelect) termSelect.addEventListener('change', calculateAmortization);
    if (dpInput) dpInput.addEventListener('input', calculateAmortization);

    // Payment Option Radios
    const paymentRadios = document.querySelectorAll('input[name="paymentOption"]');
    paymentRadios.forEach(r => {
        r.addEventListener('change', () => {
            const amortPanel = document.getElementById('amortizationPanel');
            if (amortPanel) amortPanel.style.display = r.value === 'INSTALLMENT' ? 'block' : 'none';
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
    if (elDp) elDp.value = dp;
    if (dpInput) {
        dpInput.value = dp.toFixed(2);
        dpInput.min = "100";
    }

    calculateAmortization();
    if (typeof window.setupDynamicPaymentChannelPanel === 'function') {
        window.setupDynamicPaymentChannelPanel();
    }
    modal.classList.add('active');
}

function calculateAmortization() {
    const price = Number(document.getElementById('bookPlotPrice')?.value || 85000);
    const dpInput = document.getElementById('customDownPayment');
    const rawDp = dpInput && dpInput.value !== '' ? Number(dpInput.value) : 100;
    const dp = Math.max(100, isNaN(rawDp) ? 100 : rawDp);
    const term = parseInt(document.getElementById('installmentTerm')?.value || 60, 10);

    const balance = Math.max(0, price - dp);
    const monthly = term > 0 ? (balance / term) : 0;

    setText('calcTotalPrice', `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('calcDownPayment', `₱ ${dp.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('calcBalance', `₱ ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setText('calcMonthly', `₱ ${monthly.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo`);
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

        const spaceId = document.getElementById('bookSpaceId')?.value;
        const plotCode = document.getElementById('bookPlotIdentifier')?.value;
        const price = Number(document.getElementById('bookPlotPrice')?.value || 0);
        const dp = Number(document.getElementById('customDownPayment')?.value || 0);
        const term = parseInt(document.getElementById('installmentTerm')?.value || 60, 10);
        const planType = document.querySelector('input[name="planType"]:checked')?.value || 'PRE-NEED';
        const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
        if (paymentOption === 'INSTALLMENT' && dp < 100) {
            alert('Minimum down payment is ₱100.00.');
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoader) btnLoader.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        const paymentChannel = document.querySelector('input[name="paymentChannel"]:checked')?.value || 'GCash';
        const notes = document.getElementById('reservationNotes')?.value || '';

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

        const isGcash = paymentChannel === 'GCash';
        const isBank = paymentChannel === 'Bank';

        const bankSelectEl = document.getElementById('zmgBankSelect');
        const bankOpt = bankSelectEl?.options[bankSelectEl.selectedIndex];
        const bankName = bankOpt?.text || 'BDO Unibank';
        const bankRefInput = document.getElementById('zmgBankTestRefNumber')?.value?.trim();
        const bankTestConfirmCheck = document.getElementById('zmgCheckConfirmBankTest');
        const isBankTestPaid = isBank && (!bankTestConfirmCheck || bankTestConfirmCheck.checked);

        const amountNow = paymentOption === 'INSTALLMENT' ? (dp > 0 ? dp : price) : price;
        const isGcashQr = isGcash && !document.getElementById('zmgGcashSubMethodAutoDebit')?.checked;
        const gcashQrRef = document.getElementById('zmgGcashQrRefNumber')?.value?.trim();
        const isImmediatelyPaid = isBankTestPaid || isGcashQr;
        const totalPaidRecorded = isImmediatelyPaid ? amountNow : 0.00;
        const balanceRecorded = isImmediatelyPaid ? Math.max(0, price - amountNow) : price;
        const monthly = term > 0 ? (balanceRecorded / term) : 0;
        const paymentTag = isImmediatelyPaid ? 'PAID' : 'UNPAID';
        const paymentReference = isBank
            ? (bankRefInput || `BNK-TEST-${Date.now().toString(36).toUpperCase()}`)
            : (isGcashQr ? (gcashQrRef || `GCASH-QR-${Date.now().toString(36).toUpperCase()}`) : (isGcash ? `GCASH-PENDING-${Date.now().toString(36).toUpperCase()}` : `CASH-UNPAID-${Date.now().toString(36).toUpperCase()}`));

        const resNumber = `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const deceasedTagNote = fullDeceasedName ? ` [Interred: ${fullDeceasedName}${deceasedDeathDate ? ` (DOD: ${deceasedDeathDate})` : ''}]` : '';
        const finalNotes = `[Channel: ${isBank ? `Bank Transfer (${bankName})` : paymentChannel}]${isBankTestPaid ? ` [Receipt Tag: PAID] (Test Mode Bank Authorized: ${bankName} | Ref: ${paymentReference})` : ''}${deceasedTagNote} ${notes}`.trim();

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
            payment_reference: paymentReference,
            amount: amountNow,
            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
            payment_method: isBank ? 'Bank Transfer' : (paymentChannel === 'GCash' ? 'GCash' : (paymentChannel === 'Maya' ? 'Maya' : (paymentChannel === 'Card' ? 'Card' : 'Cash'))),
            status: isImmediatelyPaid ? 'COMPLETED' : 'PENDING',
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
                paymentChannel: isBank ? `Bank Transfer (${bankName} - Test Mode)` : (isGcash ? 'GCash Auto-Debit' : 'Cash (Over the Counter)'),
                gcashReference: isBank ? paymentReference : '',
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
                counterInstructions: isBankTestPaid
                    ? `ONLINE BANK PAYMENT AUTHORIZED IN TEST MODE (TAG: PAID • ${bankName} • Ref: ${paymentReference}). Verified via Zion Memorial Garden test sandbox.`
                    : 'Please present this receipt at the counter when called.'
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

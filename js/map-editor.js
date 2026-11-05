// ==============================================================================
// CANVA-STYLE CEMETERY LAYOUT STUDIO CONTROLLER
// Zion Memorial Garden - Unified Map Vector & Plot Grid Studio
// ==============================================================================

const MAP_STORAGE_KEY = 'zion_cemetery_map_vector_layout_v2';
const MAP_DIR = 'assets/images/Map/';

// ── Master Asset Catalog for "Add Vector" ──
// ── Master Asset Catalog for "Add Vector" ──
// Each vector PNG artwork has its actual Area number stamped directly into the image:
//   Vector (7)  -> Area 1 - Single Tiered Lawn
//   Vector (8)  -> Area 2 - Lawn of Love
//   Vector (9)  -> Area 3 - Lawn of Hope (Family Estate)
//   Vector (12) -> Area 4 - Supreme Garden
//   Vector (13) -> Area 5 - Special Supreme Estate
//   Vector (6)  -> Area 6 - Lawn of Peace
//   Vector (5)  -> Area 7 - Lawn of Faith
//   Vector (10) -> Area 8 - Lawn of Grace
//   Vector (11) -> Area 9 - Lawn of Serenity
//   Vector (14) -> Area 10 - Condominium Block A
//   Vector (3)  -> Area 11 - Lawn of Memories
//   Vector (4)  -> Area 12 - Mausoleum Court
//   Group 109   -> Base Framework
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
    'Vector (4).png':  { area: '12', name: 'Area 12 - Mausoleum Court', category: 'Mausoleum', tab: 'mausoleum', desc: 'Area 12 - Mausoleum Court memorial section' },
    'Group 109.png':   { area: null, name: 'Group 109 (Base Framework & Pathways)', category: 'Framework', tab: null, desc: 'Master cemetery boundary and pathways framework' },
    'cemetery-boundary-bg.png': { area: null, name: 'Cemetery Boundary & Pathways (Full)', category: 'Framework', tab: null, desc: 'Master cemetery boundary and road framework' }
};

const VECTOR_CATALOG = [
    { file: 'cemetery-boundary-bg.png', name: 'Cemetery Boundary & Pathways (Full)', desc: 'Master cemetery boundary, road pathways, & water canal', defaultW: 90, defaultZ: 1 },
    { file: 'Group 109.png',   name: 'Group 109 (Base Framework)', desc: 'Master cemetery boundary & roads framework', defaultW: 82, defaultZ: 2 },
    { file: 'Vector (7).png',   name: 'Area 1 - Single Tiered Lawn', desc: 'Single Tiered Lawn entry area', defaultW: 22, defaultZ: 6 },
    { file: 'Vector (8).png',   name: 'Area 2 - Lawn of Love', desc: 'Lawn of Love section', defaultW: 14, defaultZ: 6 },
    { file: 'Vector (9).png',   name: 'Area 3 - Lawn of Hope (Family Estate)', desc: 'Family Estate Jr. premium lot', defaultW: 20, defaultZ: 6 },
    { file: 'Vector (12).png',  name: 'Area 4 - Supreme Garden', desc: 'Supreme Garden memorial section', defaultW: 20, defaultZ: 6 },
    { file: 'Vector (13).png',  name: 'Area 5 - Special Supreme Estate', desc: 'Special Supreme Estate central lawn', defaultW: 17, defaultZ: 6 },
    { file: 'Vector (6).png',   name: 'Area 6 - Lawn of Peace', desc: 'Lawn of Peace section', defaultW: 16, defaultZ: 6 },
    { file: 'Vector (5).png',   name: 'Area 7 - Lawn of Faith', desc: 'Lawn of Faith section', defaultW: 24, defaultZ: 5 },
    { file: 'Vector (10).png',  name: 'Area 8 - Lawn of Grace', desc: 'Lawn of Grace section', defaultW: 14, defaultZ: 6 },
    { file: 'Vector (11).png',  name: 'Area 9 - Lawn of Serenity', desc: 'Lawn of Serenity section', defaultW: 18, defaultZ: 6 },
    { file: 'Vector (14).png',  name: 'Area 10 - Condominium Block A', desc: 'Vertical columbarium wall ribbon & niches', defaultW: 25, defaultZ: 10 },
    { file: 'Vector (3).png',   name: 'Area 11 - Lawn of Memories', desc: 'Lawn of Memories section', defaultW: 18, defaultZ: 6 },
    { file: 'Vector (4).png',   name: 'Area 12 - Mausoleum Court', desc: 'Mausoleum Court memorial section', defaultW: 20, defaultZ: 6 }
];

// ── Default Vector Layout Coordinates (ZERO OVERLAPS) ──
const DEFAULT_VECTORS = [
    { id: 'vector-14', area: '10', name: 'Area 10 - Condominium Block A', src: MAP_DIR + 'Vector (14).png', left: 41.0, top: 4.0, width: 18.0, rotate: 0, opacity: 1.0, zIndex: 5, visible: true },
    { id: 'vector-12', area: '4',  name: 'Area 4 - Supreme Garden', src: MAP_DIR + 'Vector (12).png', left: 24.0, top: 25.0, width: 15.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-11', area: '9',  name: 'Area 9 - Lawn of Serenity', src: MAP_DIR + 'Vector (11).png', left: 42.0, top: 25.0, width: 14.5, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-10', area: '8',  name: 'Area 8 - Lawn of Grace', src: MAP_DIR + 'Vector (10).png', left: 59.0, top: 27.0, width: 8.5, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-13', area: '5',  name: 'Area 5 - Special Supreme Estate', src: MAP_DIR + 'Vector (13).png', left: 42.0, top: 46.0, width: 14.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-5',  area: '7',  name: 'Area 7 - Lawn of Faith', src: MAP_DIR + 'Vector (5).png', left: 58.5, top: 44.5, width: 9.5, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-6',  area: '6',  name: 'Area 6 - Lawn of Peace', src: MAP_DIR + 'Vector (6).png', left: 58.0, top: 66.0, width: 9.5, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-3',  area: '11', name: 'Area 11 - Lawn of Memories', src: MAP_DIR + 'Vector (3).png', left: 70.0, top: 43.0, width: 6.5, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-4',  area: '12', name: 'Area 12 - Mausoleum Court', src: MAP_DIR + 'Vector (4).png', left: 78.5, top: 45.0, width: 12.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-8',  area: '2',  name: 'Area 2 - Lawn of Love', src: MAP_DIR + 'Vector (8).png', left: 24.0, top: 48.5, width: 15.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-9',  area: '3',  name: 'Area 3 - Lawn of Hope (Family Estate)', src: MAP_DIR + 'Vector (9).png', left: 7.0, top: 48.5, width: 15.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true },
    { id: 'vector-7',  area: '1',  name: 'Area 1 - Single Tiered Lawn', src: MAP_DIR + 'Vector (7).png', left: 16.0, top: 73.5, width: 15.0, rotate: 0, opacity: 0.95, zIndex: 5, visible: true }
];

// ── Virtual Board Coordinate Frame Dimensions ──
const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 900;

// ── Background Image State ──
const BG_STORAGE_KEY = 'zion_cemetery_map_bg_v1';
const DEFAULT_BG_CONFIG = {
    src: 'assets/images/backgrounds/cemetery-boundary-bg.png',
    opacity: 1.0,
    visible: true,
    x: 0, y: 0,
    scale: 1.0,
    rotate: 0,
    unlocked: true
};
let bgConfig = { ...DEFAULT_BG_CONFIG };

// ── Blueprint Reference Alignment State ──
const BLUEPRINT_STORAGE_KEY = 'zion_cemetery_blueprint_config_v1';
const DEFAULT_BLUEPRINT_CONFIG = {
    rotate: 30.0,
    scale: 0.68, // 68% size - ample margin on the boundless canvas!
    x: 0,
    y: 0,
    opacity: 0.70,
    visible: true,
    unlocked: true // Movable by default!
};
let blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG };

// ── Application & Infinite Canvas State ──
let currentMode = 'map'; // 'map' or 'plots'
let vectorLayers = [];
let activeVectorId = null;
let selectedVectorIds = new Set();
let activeSelectionType = null; // 'vector' | 'blueprint' | null
let currentZoom = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let origPanX = 0;
let origPanY = 0;
let spacebarPressed = false;
let panHasMoved = false;
let isDraggingVector = false;
let dragContext = null;

// Plot State
let currentPlotsList = [];
let activePlotId = null;
let currentPlotFilter = 'all';

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initModeTabs();
    initVectorSystem();
    initBlueprintSystem();
    initBgSystem();
    initPlotSystem();
    initZoomControls();
    initKeyboardShortcuts();
    autoFitCanvas();
    setTimeout(autoFitCanvas, 150);

    // Check URL search params for mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'plots') {
        switchEditorMode('plots');
        const targetSec = urlParams.get('section');
        if (targetSec) {
            const secSelect = document.getElementById('editorSectionSelect');
            if (secSelect) {
                secSelect.value = targetSec;
                if (typeof loadPlotSectionData === 'function') loadPlotSectionData();
            }
        }
    } else {
        switchEditorMode('map');
    }
});

window.addEventListener('load', () => {
    setTimeout(autoFitCanvas, 100);
});

// ==============================================================================
// MODE SWITCHER (MAP VECTORS vs PLOT LAYOUTS)
// ==============================================================================
function initModeTabs() {
    const tabMap = document.getElementById('tabModeMap');
    const tabPlots = document.getElementById('tabModePlots');

    if (tabMap) tabMap.addEventListener('click', () => switchEditorMode('map'));
    if (tabPlots) tabPlots.addEventListener('click', () => switchEditorMode('plots'));
}

function switchEditorMode(mode) {
    currentMode = mode;

    const tabMap = document.getElementById('tabModeMap');
    const tabPlots = document.getElementById('tabModePlots');
    const panelMap = document.getElementById('panelMapLayers');
    const panelPlots = document.getElementById('panelPlotSections');
    const viewport = document.getElementById('viewport');
    const stageMap = document.getElementById('viewportStage');
    const stagePlot = document.getElementById('plotStage');
    const mapActions = document.getElementById('mapActionsGroup');
    const plotActions = document.getElementById('plotActionsGroup');
    const inspMap = document.getElementById('inspectorMapMode');
    const inspPlot = document.getElementById('inspectorPlotMode');
    const badge = document.getElementById('activeModeBadge');
    const detail = document.getElementById('activeModeDetail');
    const hint = document.getElementById('canvasHint');
    const bpWrap = document.getElementById('blueprintToggleWrapper');
    const quickDragBtn = document.getElementById('btnQuickDragBp');

    if (mode === 'map') {
        if (tabMap) tabMap.classList.add('active');
        if (tabPlots) tabPlots.classList.remove('active');
        if (panelMap) panelMap.style.display = 'flex';
        if (panelPlots) panelPlots.style.display = 'none';
        if (viewport) viewport.classList.remove('is-plot-view');
        if (stageMap) stageMap.style.display = 'block';
        if (stagePlot) stagePlot.style.display = 'none';
        if (mapActions) mapActions.style.display = 'flex';
        if (plotActions) plotActions.style.display = 'none';
        if (inspMap) inspMap.style.display = 'block';
        if (inspPlot) inspPlot.style.display = 'none';
        if (bpWrap) bpWrap.style.display = 'flex';
        if (quickDragBtn) quickDragBtn.style.display = 'inline-flex';

        if (badge) badge.textContent = ' Map Vector Editor';
        if (detail) detail.textContent = `${vectorLayers.length} Vectors Loaded · Boundless Canvas`;
        if (hint) hint.innerHTML = ' <strong>Boundless Canvas:</strong> Drag empty space to pan · Drag vectors anywhere · Scroll to zoom';

        renderVectorMap();
        renderLayerSidebar();
        updateVectorInspector();
        applyCanvasTransform();
    } else {
        if (tabPlots) tabPlots.classList.add('active');
        if (tabMap) tabMap.classList.remove('active');
        if (panelMap) panelMap.style.display = 'none';
        if (panelPlots) panelPlots.style.display = 'flex';
        if (viewport) viewport.classList.add('is-plot-view');
        if (stageMap) stageMap.style.display = 'none';
        if (stagePlot) stagePlot.style.display = 'block';
        if (mapActions) mapActions.style.display = 'none';
        if (plotActions) plotActions.style.display = 'flex';
        if (inspMap) inspMap.style.display = 'none';
        if (inspPlot) inspPlot.style.display = 'block';
        if (bpWrap) bpWrap.style.display = 'none';
        if (quickDragBtn) quickDragBtn.style.display = 'none';

        if (badge) badge.textContent = ' Plot Grid Editor';
        if (detail) detail.textContent = 'Interactive Grid · Click cell to toggle status or inspect';
        if (hint) hint.innerHTML = ' <strong>Shortcuts:</strong> Drag to Paint Multiple · <strong>[Del]</strong> Delete · <strong>[Ctrl+Z]</strong> Undo · <strong>[Ctrl+Y]</strong> Redo · <strong>[1]</strong> Select <strong>[2]</strong> Place <strong>[3]</strong> Erase · <strong>Arrows</strong> Nudge · <strong>[Ctrl+S]</strong> Save';

        loadPlotSectionData();
    }
}

// ==============================================================================
// 1. MAP VECTOR SYSTEM
// ==============================================================================
function initVectorSystem() {
    loadSavedVectors();
    renderVectorMap();
    renderLayerSidebar();
    setupVectorInspectorEvents();
    setupVectorAssetGalleryModal();

    // Toolbar button bindings
    const btnSave = document.getElementById('btnSaveLayout');
    if (btnSave) btnSave.addEventListener('click', saveVectorLayout);

    const btnReset = document.getElementById('btnResetLayout');
    if (btnReset) btnReset.addEventListener('click', resetVectorLayout);

    const btnExport = document.getElementById('btnExportJson');
    if (btnExport) btnExport.addEventListener('click', exportVectorLayoutJson);

    const btnAddTop = document.getElementById('btnAddVectorTop');
    if (btnAddTop) btnAddTop.addEventListener('click', openVectorAssetModal);

    const btnAddSidebar = document.getElementById('btnAddLayerSidebar');
    if (btnAddSidebar) btnAddSidebar.addEventListener('click', openVectorAssetModal);

    const chkBlueprint = document.getElementById('chkBlueprint');
    if (chkBlueprint) {
        chkBlueprint.addEventListener('change', (e) => {
            const bp = document.getElementById('blueprintImg');
            if (bp) bp.style.display = e.target.checked ? 'block' : 'none';
        });
    }
}

// ── Blueprint Reference Alignment Controller ──
function initBlueprintSystem() {
    loadBlueprintConfig();
    applyBlueprintConfig();
    setupBlueprintEvents();
}

function loadBlueprintConfig() {
    try {
        const saved = localStorage.getItem(BLUEPRINT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Auto-heal if previously saved with the oversized >100% scale
            if (parsed.scale && parsed.scale > 0.9) {
                parsed.scale = 0.68;
            }
            if (parsed.opacity === undefined || parsed.opacity < 0.4) {
                parsed.opacity = 0.70;
            }
            // Ensure unlocked is true so reference image is immediately movable
            parsed.unlocked = true;
            blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG, ...parsed, unlocked: true };
            return;
        }
    } catch (e) {
        console.warn('Blueprint config parse notice:', e);
    }
    blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG, unlocked: true };
}

function saveBlueprintConfig() {
    localStorage.setItem(BLUEPRINT_STORAGE_KEY, JSON.stringify(blueprintConfig));
}

function applyBlueprintConfig() {
    const bp = document.getElementById('blueprintImg');
    if (bp) {
        bp.style.setProperty('--bp-rotate', `${blueprintConfig.rotate}deg`);
        bp.style.setProperty('--bp-scale', blueprintConfig.scale);
        bp.style.setProperty('--bp-x', `${blueprintConfig.x}px`);
        bp.style.setProperty('--bp-y', `${blueprintConfig.y}px`);
        bp.style.setProperty('--bp-opacity', blueprintConfig.opacity);
        bp.style.display = blueprintConfig.visible ? 'block' : 'none';
        bp.classList.toggle('is-locked', !blueprintConfig.unlocked);
    }

    // Sync input values
    setVal('quickRefRotateNum', blueprintConfig.rotate);
    setVal('bpRefRotSlider', blueprintConfig.rotate);
    setVal('bpRefRotNum', blueprintConfig.rotate);
    setVal('bpRefScaleSlider', Math.round(blueprintConfig.scale * 100));
    setVal('bpRefScaleNum', Math.round(blueprintConfig.scale * 100));
    setVal('bpRefOpacitySlider', Math.round(blueprintConfig.opacity * 100));
    setVal('bpRefOpacityNum', Math.round(blueprintConfig.opacity * 100));
    setVal('bpRefOffsetX', blueprintConfig.x);
    setVal('bpRefOffsetY', blueprintConfig.y);

    const chk = document.getElementById('chkBlueprint');
    if (chk) chk.checked = blueprintConfig.visible;

    const dragBtnLabel = document.getElementById('lblToggleDragBp');
    if (dragBtnLabel) {
        dragBtnLabel.textContent = blueprintConfig.unlocked ? 'Lock Reference in Place' : 'Unlock to Move Reference';
    }

    const quickDragBtn = document.getElementById('btnQuickDragBp');
    if (quickDragBtn) {
        quickDragBtn.classList.toggle('active', !!blueprintConfig.unlocked);
        quickDragBtn.innerHTML = blueprintConfig.unlocked ? ' Ref Movable' : ' Ref Locked';
        quickDragBtn.title = blueprintConfig.unlocked ? 'Reference image is movable (Click to lock)' : 'Reference image is locked (Click to unlock)';
    }

    const sidebarLockBtn = document.getElementById('sidebarBpLockBtn');
    if (sidebarLockBtn) {
        sidebarLockBtn.textContent = blueprintConfig.unlocked ? '' : '';
        sidebarLockBtn.title = blueprintConfig.unlocked ? 'Movable: Click to lock' : 'Locked: Click to unlock';
    }

    const sidebarVisBtn = document.getElementById('sidebarBpVisBtn');
    if (sidebarVisBtn) {
        sidebarVisBtn.textContent = blueprintConfig.visible ? '' : '‍';
        sidebarVisBtn.title = blueprintConfig.visible ? 'Hide Blueprint' : 'Show Blueprint';
    }

    // Highlight active scale buttons
    const curScalePct = Math.round(blueprintConfig.scale * 100);
    const setBtnActive = (id, targetVal) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', Math.abs(curScalePct - targetVal) <= 3);
    };
    setBtnActive('btnBpScale50', 50);
    setBtnActive('btnBpScale70', 70);
    setBtnActive('btnBpScale85', 85);
    setBtnActive('btnBpScale100', 100);

    // Highlight active preset button
    document.querySelectorAll('.btn-tilt-preset, .me-ref-guide-card .btn-preset').forEach(b => {
        const val = parseFloat(b.textContent);
        if (!isNaN(val)) {
            b.classList.toggle('active', Math.abs(val - blueprintConfig.rotate) < 0.1);
        }
    });

    updateSidebarBlueprintMeta();
    saveBlueprintConfig();
}

function updateSidebarBlueprintMeta() {
    const sub = document.getElementById('sidebarBpSub');
    if (sub) {
        sub.textContent = `X: ${blueprintConfig.x}px, Y: ${blueprintConfig.y}px · ${blueprintConfig.rotate}° · ${Math.round(blueprintConfig.scale * 100)}%`;
    }
}

function setupBlueprintEvents() {
    // Quick statusbar reposition / lock toggle
    const quickDragBtn = document.getElementById('btnQuickDragBp');
    if (quickDragBtn) {
        quickDragBtn.addEventListener('click', () => {
            blueprintConfig.unlocked = !blueprintConfig.unlocked;
            applyBlueprintConfig();
        });
    }

    // Quick statusbar tilt input
    const quickInput = document.getElementById('quickRefRotateNum');
    if (quickInput) {
        quickInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                blueprintConfig.rotate = val;
                applyBlueprintConfig();
            }
        });
    }

    // Quick statusbar tilt presets
    const btnQuick30 = document.getElementById('btnQuickTilt30');
    if (btnQuick30) {
        btnQuick30.addEventListener('click', () => {
            blueprintConfig.rotate = 30.0;
            applyBlueprintConfig();
        });
    }
    const btnQuick0 = document.getElementById('btnQuickTilt0');
    if (btnQuick0) {
        btnQuick0.addEventListener('click', () => {
            blueprintConfig.rotate = 0.0;
            applyBlueprintConfig();
        });
    }

    // Inspector card sliders & inputs
    const rotSlider = document.getElementById('bpRefRotSlider');
    const rotNum = document.getElementById('bpRefRotNum');
    const onRotChange = (val) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            blueprintConfig.rotate = num;
            applyBlueprintConfig();
        }
    };
    if (rotSlider) rotSlider.addEventListener('input', (e) => onRotChange(e.target.value));
    if (rotNum) rotNum.addEventListener('input', (e) => onRotChange(e.target.value));

    // Preset buttons in inspector
    const bindPreset = (id, deg) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                blueprintConfig.rotate = deg;
                applyBlueprintConfig();
            });
        }
    };
    bindPreset('btnBpPreset30', 30.0);
    bindPreset('btnBpPreset0', 0.0);
    bindPreset('btnBpPresetM30', -30.0);
    bindPreset('btnBpPreset45', 45.0);

    // Scale
    const scaleSlider = document.getElementById('bpRefScaleSlider');
    const scaleNum = document.getElementById('bpRefScaleNum');
    const onScaleChange = (val) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            blueprintConfig.scale = parseFloat((num / 100).toFixed(2));
            applyBlueprintConfig();
        }
    };
    if (scaleSlider) scaleSlider.addEventListener('input', (e) => onScaleChange(e.target.value));
    if (scaleNum) scaleNum.addEventListener('input', (e) => onScaleChange(e.target.value));

    // Scale preset buttons
    const bindScalePreset = (id, scaleVal) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                blueprintConfig.scale = scaleVal;
                applyBlueprintConfig();
            });
        }
    };
    bindScalePreset('btnBpScale50', 0.50);
    bindScalePreset('btnBpScale70', 0.68);
    bindScalePreset('btnBpScale85', 0.85);
    bindScalePreset('btnBpScale100', 1.00);

    // Toggle drag on canvas
    const btnToggleDrag = document.getElementById('btnToggleDragBp');
    if (btnToggleDrag) {
        btnToggleDrag.addEventListener('click', () => {
            blueprintConfig.unlocked = !blueprintConfig.unlocked;
            applyBlueprintConfig();
        });
    }

    // Direct drag blueprint on canvas
    const bpImg = document.getElementById('blueprintImg');
    if (bpImg) {
        bpImg.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            if (spacebarPressed) return; // Spacebar pans canvas

            e.preventDefault(); // Stop native browser image ghost dragging!
            e.stopPropagation();

            selectBlueprint();
            if (blueprintConfig.unlocked) {
                startBlueprintDrag(e);
            }
        });
    }

    // Sidebar Blueprint Item Click
    const sidebarBpItem = document.getElementById('sidebarBlueprintItem');
    if (sidebarBpItem) {
        sidebarBpItem.addEventListener('click', (e) => {
            if (e.target.closest('#sidebarBpLockBtn')) {
                e.stopPropagation();
                blueprintConfig.unlocked = !blueprintConfig.unlocked;
                applyBlueprintConfig();
                return;
            }
            if (e.target.closest('#sidebarBpVisBtn')) {
                e.stopPropagation();
                blueprintConfig.visible = !blueprintConfig.visible;
                applyBlueprintConfig();
                return;
            }
            selectBlueprint();
        });
    }

    // Blueprint Directional Nudge Pad
    const setupBpNudge = (id, dx, dy) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                blueprintConfig.x += dx;
                blueprintConfig.y += dy;
                applyBlueprintConfig();
            });
        }
    };
    setupBpNudge('btnBpNudgeUp', 0, -2);
    setupBpNudge('btnBpNudgeDown', 0, 2);
    setupBpNudge('btnBpNudgeLeft', -2, 0);
    setupBpNudge('btnBpNudgeRight', 2, 0);

    // Opacity
    const opSlider = document.getElementById('bpRefOpacitySlider');
    const opNum = document.getElementById('bpRefOpacityNum');
    const onOpChange = (val) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            blueprintConfig.opacity = parseFloat((num / 100).toFixed(2));
            applyBlueprintConfig();
        }
    };
    if (opSlider) opSlider.addEventListener('input', (e) => onOpChange(e.target.value));
    if (opNum) opNum.addEventListener('input', (e) => onOpChange(e.target.value));

    // Offsets
    const offX = document.getElementById('bpRefOffsetX');
    const offY = document.getElementById('bpRefOffsetY');
    if (offX) offX.addEventListener('input', (e) => {
        blueprintConfig.x = parseFloat(e.target.value) || 0;
        applyBlueprintConfig();
    });
    if (offY) offY.addEventListener('input', (e) => {
        blueprintConfig.y = parseFloat(e.target.value) || 0;
        applyBlueprintConfig();
    });

    // Reset button
    const btnResetRef = document.getElementById('btnResetBpRef');
    if (btnResetRef) {
        btnResetRef.addEventListener('click', () => {
            blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG, unlocked: true };
            applyBlueprintConfig();
            if (typeof showNotification === 'function') {
                showNotification('Reference Reset', 'Blueprint guide restored to 68% size and 30° tilt.', 'info');
            }
        });
    }

    // Blueprint toggle
    const chk = document.getElementById('chkBlueprint');
    if (chk) {
        chk.addEventListener('change', (e) => {
            blueprintConfig.visible = e.target.checked;
            applyBlueprintConfig();
        });
    }
}

// ==============================================================================
// BACKGROUND IMAGE SYSTEM  (draggable, scalable, rotatable — just like blueprint)
// ==============================================================================
function initBgSystem() {
    loadBgConfig();
    applyBgConfig();
    setupBgEvents();
}

function loadBgConfig() {
    try {
        const saved = localStorage.getItem(BG_STORAGE_KEY);
        if (saved) {
            bgConfig = { ...DEFAULT_BG_CONFIG, ...JSON.parse(saved) };
            return;
        }
    } catch (e) { console.warn('BG config parse error:', e); }
    bgConfig = { ...DEFAULT_BG_CONFIG };
}

function saveBgConfig() {
    const toSave = { ...bgConfig };
    if (toSave.src && toSave.src.startsWith('data:')) {
        try { localStorage.setItem(BG_STORAGE_KEY + '_src', toSave.src); } catch (_) {}
        toSave.src = '__dataurl__';
    }
    localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(toSave));
}

function applyBgConfig() {
    let bgEl = document.getElementById('mapBgImg');
    const board = document.getElementById('mapBoard');
    if (!board) return;

    let resolvedSrc = bgConfig.src;
    if (resolvedSrc === '__dataurl__') resolvedSrc = localStorage.getItem(BG_STORAGE_KEY + '_src') || '';

    if (!resolvedSrc) {
        if (bgEl) bgEl.style.display = 'none';
        updateSidebarBgMeta();
        return;
    }

    if (!bgEl) {
        bgEl = document.createElement('img');
        bgEl.id = 'mapBgImg';
        bgEl.className = 'me-bg-image';
        bgEl.draggable = false;
        bgEl.alt = 'Map Background';
        board.insertBefore(bgEl, board.firstChild);
        setupBgCanvasDrag(bgEl);
    }

    bgEl.src = resolvedSrc;
    bgEl.style.display = bgConfig.visible ? 'block' : 'none';
    bgEl.style.opacity = bgConfig.opacity;
    bgEl.classList.toggle('is-locked', !bgConfig.unlocked);

    // Apply transform via CSS custom props
    bgEl.style.setProperty('--bg-x', `${bgConfig.x}px`);
    bgEl.style.setProperty('--bg-y', `${bgConfig.y}px`);
    bgEl.style.setProperty('--bg-scale', bgConfig.scale);
    bgEl.style.setProperty('--bg-rotate', `${bgConfig.rotate}deg`);

    updateSidebarBgMeta();
    syncBgInspector();
}

function syncBgInspector() {
    setVal('bgOpacitySlider',  Math.round(bgConfig.opacity * 100));
    setVal('bgOpacityNum',     Math.round(bgConfig.opacity * 100));
    setVal('bgScaleSlider',    Math.round(bgConfig.scale * 100));
    setVal('bgScaleNum',       Math.round(bgConfig.scale * 100));
    setVal('bgRotateSlider',   bgConfig.rotate);
    setVal('bgRotateNum',      bgConfig.rotate);
    setVal('bgOffsetX',        bgConfig.x);
    setVal('bgOffsetY',        bgConfig.y);

    const lockBtn = document.getElementById('btnBgLockToggle');
    if (lockBtn) {
        lockBtn.textContent = bgConfig.unlocked ? ' BG Movable' : ' BG Locked';
        lockBtn.classList.toggle('active', bgConfig.unlocked);
    }
}

function updateSidebarBgMeta() {
    const hasSrc = !!(bgConfig.src && bgConfig.src !== '');
    const sub = document.getElementById('sidebarBgSub');
    if (sub) sub.textContent = hasSrc
        ? `${Math.round(bgConfig.scale * 100)}% · ${bgConfig.rotate}° · ${Math.round(bgConfig.opacity * 100)}% op`
        : 'No image — click Upload';

    const sidebarThumb = document.getElementById('sidebarBgThumb');
    if (sidebarThumb) {
        let src = bgConfig.src === '__dataurl__' ? (localStorage.getItem(BG_STORAGE_KEY + '_src') || '') : bgConfig.src;
        sidebarThumb.src = src;
        sidebarThumb.style.display = src ? 'block' : 'none';
        const noImg = document.getElementById('sidebarBgNoImg');
        if (noImg) noImg.style.display = src ? 'none' : 'block';
    }

    const cardPreview = document.getElementById('bgCardPreview');
    if (cardPreview) {
        let src = bgConfig.src === '__dataurl__' ? (localStorage.getItem(BG_STORAGE_KEY + '_src') || '') : bgConfig.src;
        cardPreview.src = src;
        cardPreview.style.display = src ? 'block' : 'none';
    }

    const visBtn = document.getElementById('sidebarBgVisBtn');
    if (visBtn) {
        visBtn.textContent = bgConfig.visible ? '' : '‍';
        visBtn.title = bgConfig.visible ? 'Hide Background' : 'Show Background';
    }
}

// ── BG canvas drag (mirrors blueprint drag) ──
let isDraggingBg = false;
let bgDragStartX = 0, bgDragStartY = 0;
let bgOrigX = 0, bgOrigY = 0;

function selectBg() {
    activeSelectionType = 'bg';
    activeVectorId = null;

    // Deselect others
    const bp = document.getElementById('blueprintImg');
    if (bp) bp.classList.remove('selected');
    const sbBpItem = document.getElementById('sidebarBlueprintItem');
    if (sbBpItem) sbBpItem.classList.remove('active');
    document.querySelectorAll('.me-vec-element').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.me-layer-item:not(.me-layer-bg)').forEach(el => el.classList.remove('active'));

    // Highlight BG on canvas
    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.add('selected');

    // Highlight in sidebar
    const sbItem = document.getElementById('sidebarBgItem');
    if (sbItem) sbItem.classList.add('active');

    // Scroll inspector to BG card
    const card = document.getElementById('bgRefCard');
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        card.classList.add('highlighted');
        setTimeout(() => card.classList.remove('highlighted'), 800);
    }
}

function setupBgCanvasDrag(bgEl) {
    bgEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        selectBg();
        if (!bgConfig.unlocked) return;
        startBgDrag(e);
    });
}

function startBgDrag(e) {
    isDraggingBg = true;
    bgDragStartX = e.clientX;
    bgDragStartY = e.clientY;
    bgOrigX = Number(bgConfig.x) || 0;
    bgOrigY = Number(bgConfig.y) || 0;

    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.add('dragging');

    const onBgMove = (mv) => {
        if (!isDraggingBg) return;
        const dx = (mv.clientX - bgDragStartX) / currentZoom;
        const dy = (mv.clientY - bgDragStartY) / currentZoom;
        bgConfig.x = Math.round(bgOrigX + dx);
        bgConfig.y = Math.round(bgOrigY + dy);
        if (bgEl) {
            bgEl.style.setProperty('--bg-x', `${bgConfig.x}px`);
            bgEl.style.setProperty('--bg-y', `${bgConfig.y}px`);
        }
        setVal('bgOffsetX', bgConfig.x);
        setVal('bgOffsetY', bgConfig.y);
        updateSidebarBgMeta();
    };

    const onBgUp = () => {
        isDraggingBg = false;
        if (bgEl) bgEl.classList.remove('dragging');
        window.removeEventListener('mousemove', onBgMove);
        window.removeEventListener('mouseup', onBgUp);
        saveBgConfig();
        publishBgToDashboard();
    };

    window.addEventListener('mousemove', onBgMove);
    window.addEventListener('mouseup', onBgUp);
}

function setupBgEvents() {
    // Upload
    const uploadBtn = document.getElementById('btnUploadBg');
    const fileInput = document.getElementById('bgFileInput');
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                bgConfig.src = ev.target.result;
                bgConfig.visible = true;
                saveBgConfig();
                applyBgConfig();
                publishBgToDashboard(ev.target.result);
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        });
    }

    // Sidebar vis toggle
    const visBtn = document.getElementById('sidebarBgVisBtn');
    if (visBtn) visBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bgConfig.visible = !bgConfig.visible;
        saveBgConfig(); applyBgConfig(); publishBgToDashboard();
    });

    // Sidebar item click → select + open inspector card
    const sidebarItem = document.getElementById('sidebarBgItem');
    if (sidebarItem) sidebarItem.addEventListener('click', (e) => {
        if (e.target.closest('.me-action-icon-btn')) return;
        selectBg();
    });

    // Lock toggle
    const lockBtn = document.getElementById('btnBgLockToggle');
    if (lockBtn) lockBtn.addEventListener('click', () => {
        bgConfig.unlocked = !bgConfig.unlocked;
        saveBgConfig(); applyBgConfig();
    });

    // Opacity
    bindSliderNum('bgOpacitySlider', 'bgOpacityNum', (v) => {
        bgConfig.opacity = v / 100;
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });

    // Scale
    bindSliderNum('bgScaleSlider', 'bgScaleNum', (v) => {
        bgConfig.scale = v / 100;
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });

    // Rotation
    bindSliderNum('bgRotateSlider', 'bgRotateNum', (v) => {
        bgConfig.rotate = v;
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });

    // Offset X / Y number inputs
    const offX = document.getElementById('bgOffsetX');
    const offY = document.getElementById('bgOffsetY');
    if (offX) offX.addEventListener('input', (e) => {
        bgConfig.x = parseInt(e.target.value) || 0;
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });
    if (offY) offY.addEventListener('input', (e) => {
        bgConfig.y = parseInt(e.target.value) || 0;
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });

    // Nudge buttons
    const nudge = (dx, dy) => { bgConfig.x += dx; bgConfig.y += dy; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); };
    bindBtn('btnBgNudgeUp',    () => nudge(0, -2));
    bindBtn('btnBgNudgeDown',  () => nudge(0,  2));
    bindBtn('btnBgNudgeLeft',  () => nudge(-2, 0));
    bindBtn('btnBgNudgeRight', () => nudge(2,  0));

    // Scale presets
    bindBtn('btnBgScale50',  () => { bgConfig.scale = 0.50; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgScale75',  () => { bgConfig.scale = 0.75; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgScale100', () => { bgConfig.scale = 1.00; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgScale150', () => { bgConfig.scale = 1.50; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });

    // Rotate presets
    bindBtn('btnBgRot0',    () => { bgConfig.rotate =   0; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgRot30',   () => { bgConfig.rotate =  30; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgRotM30',  () => { bgConfig.rotate = -30; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });
    bindBtn('btnBgRot45',   () => { bgConfig.rotate =  45; applyBgConfig(); saveBgConfig(); publishBgToDashboard(); });

    // Reset button
    bindBtn('btnResetBg', () => {
        const src = bgConfig.src; // keep image, reset transforms
        bgConfig = { ...DEFAULT_BG_CONFIG, src, visible: bgConfig.visible };
        applyBgConfig(); saveBgConfig(); publishBgToDashboard();
    });

    // Remove button
    const removeBtn = document.getElementById('btnRemoveBg');
    if (removeBtn) removeBtn.addEventListener('click', async () => {
        if (!bgConfig.src) return;
        if (!await showConfirmModal({ title: "Remove Background", message: "Remove the background image?", confirmText: "Remove Image", cancelText: "Cancel", type: "warning", danger: true })) return;
        bgConfig = { ...DEFAULT_BG_CONFIG };
        saveBgConfig();
        localStorage.removeItem(BG_STORAGE_KEY + '_src');
        applyBgConfig();
        publishBgToDashboard('');
        deselectAll();
    });
}

// Helper: bind a slider + number input pair
function bindSliderNum(sliderId, numId, callback) {
    const slider = document.getElementById(sliderId);
    const num    = document.getElementById(numId);
    if (slider) slider.addEventListener('input', (e) => {
        if (num) num.value = e.target.value;
        callback(parseFloat(e.target.value));
    });
    if (num) num.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value) || 0;
        if (slider) slider.value = v;
        callback(v);
    });
}

// Helper: bind a button click
function bindBtn(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
}

// Publish BG to dashboard localStorage key
function publishBgToDashboard(srcOverride) {
    const dashKey = 'zion_cemetery_dashboard_bg_v1';
    const src = srcOverride !== undefined ? srcOverride
        : (bgConfig.src === '__dataurl__' ? (localStorage.getItem(BG_STORAGE_KEY + '_src') || '') : bgConfig.src);
    const payload = {
        src,
        opacity: bgConfig.opacity,
        visible: bgConfig.visible,
        x: bgConfig.x, y: bgConfig.y,
        scale: bgConfig.scale,
        rotate: bgConfig.rotate
    };
    try { localStorage.setItem(dashKey, JSON.stringify(payload)); } catch (_) {}
}

function normalizeEditorVector(v) {
    if (!v) return v;
    const fileName = v.src ? v.src.split('/').pop() : '';
    const meta = VECTOR_FILE_TO_AREA[fileName];
    if (meta) {
        v.name = meta.name;
        v.desc = meta.desc;
        v.area = meta.area;
    }
    return v;
}

const ZMG_DB_MAP_CONFIG_ID = 'ZMG-MAP-VECTOR-LAYOUT-CONFIG';

function loadSavedVectors() {
    try {
        const saved = localStorage.getItem(MAP_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                vectorLayers = parsed
                    .filter(v => v && v.id !== 'group-109' && !(v.src && v.src.includes('Group 109')))
                    .map(v => normalizeEditorVector({ visible: true, ...v }));
                if (vectorLayers.length > 0) {
                    activeVectorId = vectorLayers[0]?.id || null;
                    selectedVectorIds = activeVectorId ? new Set([activeVectorId]) : new Set();
                    syncEditorVectorsWithSupabase();
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to parse vector layout:', e);
    }
    vectorLayers = JSON.parse(JSON.stringify(DEFAULT_VECTORS)).map(normalizeEditorVector);
    activeVectorId = 'vector-14';
    selectedVectorIds = new Set(['vector-14']);
    syncEditorVectorsWithSupabase();
}

async function syncEditorVectorsWithSupabase() {
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data: row, error } = await supabaseClient
            .from('memorial_spaces')
            .select('coordinates')
            .eq('plot_identifier', ZMG_DB_MAP_CONFIG_ID)
            .maybeSingle();

        if (!error && row && row.coordinates && Array.isArray(row.coordinates.vectorLayers) && row.coordinates.vectorLayers.length > 0) {
            vectorLayers = row.coordinates.vectorLayers
                .filter(v => v && v.id !== 'group-109' && !(v.src && v.src.includes('Group 109')))
                .map(v => normalizeEditorVector({ visible: true, ...v }));
            localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));

            if (row.coordinates.bgConfig) {
                bgConfig = { ...DEFAULT_BG_CONFIG, ...row.coordinates.bgConfig };
                saveBgConfig();
                applyBgConfig();
                publishBgToDashboard();
            }
            if (row.coordinates.blueprintConfig) {
                blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG, ...row.coordinates.blueprintConfig };
                saveBlueprintConfig();
                applyBlueprintConfig();
            }
            renderVectorMap();
            renderLayerSidebar();
            updateVectorInspector();
            return;
        }

        // If DB has no saved layout yet, push current localStorage layout to DB
        if (localStorage.getItem(MAP_STORAGE_KEY)) {
            await persistEditorVectorsToSupabase();
        }
    } catch (err) {
        console.warn('Editor Supabase vector sync notice:', err);
    }
}

async function persistEditorVectorsToSupabase() {
    if (typeof supabaseClient === 'undefined') return;
    try {
        await supabaseClient
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
                    vectorLayers,
                    bgConfig,
                    blueprintConfig,
                    updatedAt: new Date().toISOString()
                }
            }], { onConflict: 'plot_identifier' });
    } catch (err) {
        console.warn('Could not save map vector layout to Supabase:', err);
    }
}

async function saveVectorLayout() {
    if (typeof currentMode !== 'undefined' && currentMode === 'plots') {
        saveCurrentPlotLayoutToDatabase();
        return;
    }
    try {
        // 1. Persist vector layers locally
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));

        // 2. Persist background & publish to dashboard
        if (typeof saveBgConfig === 'function') saveBgConfig();
        if (typeof publishBgToDashboard === 'function') publishBgToDashboard();

        // 3. Persist blueprint settings
        if (typeof saveBlueprintConfig === 'function') saveBlueprintConfig();

        // 4. Persist to Supabase DB so all browsers/devices load the exact same map layout!
        await persistEditorVectorsToSupabase();

        // 5. Immediate visual feedback on the Save button
        const btnSave = document.getElementById('btnSaveLayout');
        if (btnSave) {
            const origHTML = btnSave.innerHTML;
            btnSave.classList.add('me-btn-saved');
            btnSave.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span> Saved to DB!</span>
            `;
            setTimeout(() => {
                btnSave.classList.remove('me-btn-saved');
                btnSave.innerHTML = origHTML;
            }, 1800);
        }

        if (typeof showNotification === 'function') {
            showNotification('Layout Saved to Database', 'Map vector layout, background, and settings saved to Supabase DB!', 'success');
        } else {
            alert('Cemetery Map Vector Layout saved to Supabase DB successfully!');
        }
    } catch (err) {
        console.error('Error saving layout:', err);
        if (typeof showNotification === 'function') {
            showNotification('Save Failed', 'Unable to save layout: ' + err.message, 'error');
        }
    }
}

async function resetVectorLayout() {
    if (!await showConfirmModal({ title: "Reset Vectors", message: "Are you sure you want to reset all vectors to factory default positions?", confirmText: "Reset to Default", cancelText: "Cancel", type: "warning", danger: true })) return;
    localStorage.removeItem(MAP_STORAGE_KEY);
    vectorLayers = JSON.parse(JSON.stringify(DEFAULT_VECTORS));
    activeVectorId = vectorLayers[0]?.id || null;
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    if (typeof showNotification === 'function') {
        showNotification('Layout Reset', 'Restored default vector coordinates.', 'info');
    }
}

function exportVectorLayoutJson() {
    const jsonStr = JSON.stringify(vectorLayers, null, 2);
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

// ── Render Board Vectors ──
function renderVectorMap() {
    const board = document.getElementById('mapBoard');
    if (!board) return;

    // Remove all old vector elements (preserve blueprint & bg image)
    board.querySelectorAll('.me-vec-element').forEach(el => el.remove());

    // Sort by zIndex ascending so higher z-index paints on top
    const sorted = [...vectorLayers].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));

    sorted.forEach(v => {
        const img = document.createElement('img');
        const isSelected = selectedVectorIds.has(v.id);
        img.className = `me-vec-element ${isSelected ? 'selected' : ''} ${!v.visible ? 'element-hidden' : ''}`;
        img.src = v.src;
        img.alt = v.name;
        img.dataset.vectorId = v.id;
        img.draggable = false;

        img.style.left = `${v.left}%`;
        img.style.top = `${v.top}%`;
        img.style.width = `${v.width}%`;
        img.style.transform = `rotate(${v.rotate || 0}deg)`;
        img.style.opacity = `${v.opacity ?? 1.0}`;
        img.style.zIndex = `${v.zIndex || 5}`;

        // Mousedown selects & starts dragging (supports Shift / Ctrl multi-select)
        img.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const isMultiKey = e.shiftKey || e.ctrlKey || e.metaKey;
            if (isMultiKey) {
                toggleSelectVector(v.id);
            } else {
                if (!selectedVectorIds.has(v.id)) {
                    selectVector(v.id, false);
                } else {
                    activeVectorId = v.id;
                    syncSelectionUI();
                    updateVectorInspector();
                }
            }
            startVectorDrag(e, v);
        });

        board.appendChild(img);
    });
}

// ── Render Left Sidebar Layers List ──
function renderLayerSidebar() {
    const list = document.getElementById('layersList');
    const badge = document.getElementById('layerCountBadge');
    if (!list) return;

    if (badge) badge.textContent = vectorLayers.length.toString();
    list.innerHTML = '';

    // Show highest z-index at top of list (Photoshop style)
    const sorted = [...vectorLayers].sort((a, b) => (Number(b.zIndex) || 0) - (Number(a.zIndex) || 0));

    sorted.forEach(v => {
        const item = document.createElement('div');
        const isSelected = selectedVectorIds.has(v.id);
        item.className = `me-layer-item ${isSelected ? 'active' : ''}`;
        item.dataset.vectorId = v.id;

        item.innerHTML = `
            <div class="me-layer-thumb">
                <img src="${v.src}" alt="${v.name}">
            </div>
            <div class="me-layer-meta">
                <span class="me-layer-name">${v.name}</span>
                <span class="me-layer-sub">${Math.round(v.left)}%, ${Math.round(v.top)}% · ${Math.round(v.width)}% w</span>
            </div>
            <div class="me-layer-actions">
                <button type="button" class="me-action-icon-btn btn-vis" title="${v.visible ? 'Hide Layer' : 'Show Layer'}">
                    ${v.visible ? '' : '‍'}
                </button>
                <button type="button" class="me-action-icon-btn btn-trash" title="Delete Vector Layer">
                    
                </button>
            </div>
        `;

        item.addEventListener('click', (e) => {
            const trashBtn = e.target.closest('.btn-trash');
            if (trashBtn) {
                e.stopPropagation();
                deleteVector(v.id);
                return;
            }

            const visBtn = e.target.closest('.btn-vis');
            if (visBtn) {
                e.stopPropagation();
                v.visible = !v.visible;
                renderVectorMap();
                renderLayerSidebar();
                saveVectorLayout();
                return;
            }

            const isMultiKey = e.shiftKey || e.ctrlKey || e.metaKey;
            if (isMultiKey) {
                toggleSelectVector(v.id);
            } else {
                selectVector(v.id, false);
            }
        });

        list.appendChild(item);
    });
}

function selectBlueprint() {
    activeSelectionType = 'blueprint';
    activeVectorId = null;
    selectedVectorIds.clear();

    // Deselect vectors and bg
    document.querySelectorAll('.me-vec-element').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.me-layer-item:not(.me-layer-blueprint)').forEach(el => el.classList.remove('active'));
    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.remove('selected');
    const sbBgItem = document.getElementById('sidebarBgItem');
    if (sbBgItem) sbBgItem.classList.remove('active');

    // Highlight blueprint on canvas
    const bp = document.getElementById('blueprintImg');
    if (bp) bp.classList.add('selected');

    // Highlight blueprint in sidebar
    const sbItem = document.getElementById('sidebarBlueprintItem');
    if (sbItem) sbItem.classList.add('active');

    // Scroll inspector to blueprint card with soft glow
    const card = document.getElementById('blueprintRefCard');
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        card.classList.add('highlighted');
        setTimeout(() => card.classList.remove('highlighted'), 800);
    }
}

function deselectAll() {
    activeSelectionType = null;
    activeVectorId = null;
    selectedVectorIds.clear();

    const bp = document.getElementById('blueprintImg');
    if (bp) bp.classList.remove('selected');
    const sbItem = document.getElementById('sidebarBlueprintItem');
    if (sbItem) sbItem.classList.remove('active');

    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.remove('selected');
    const sbBgItem = document.getElementById('sidebarBgItem');
    if (sbBgItem) sbBgItem.classList.remove('active');

    document.querySelectorAll('.me-vec-element').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.me-layer-item').forEach(el => el.classList.remove('active'));

    updateVectorInspector();
}

function toggleSelectVector(id) {
    activeSelectionType = 'vector';
    if (selectedVectorIds.has(id)) {
        selectedVectorIds.delete(id);
        if (activeVectorId === id) {
            const arr = Array.from(selectedVectorIds);
            activeVectorId = arr.length > 0 ? arr[arr.length - 1] : null;
        }
    } else {
        selectedVectorIds.add(id);
        activeVectorId = id;
    }

    // Deselect blueprint and background
    const bp = document.getElementById('blueprintImg');
    if (bp) bp.classList.remove('selected');
    const sbItem = document.getElementById('sidebarBlueprintItem');
    if (sbItem) sbItem.classList.remove('active');
    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.remove('selected');
    const sbBgItem = document.getElementById('sidebarBgItem');
    if (sbBgItem) sbBgItem.classList.remove('active');

    syncSelectionUI();
    updateVectorInspector();
}

function selectVector(id, isMulti = false) {
    if (isMulti) {
        toggleSelectVector(id);
        return;
    }
    activeSelectionType = 'vector';
    activeVectorId = id;
    selectedVectorIds = new Set([id]);

    // Deselect blueprint and bg
    const bp = document.getElementById('blueprintImg');
    if (bp) bp.classList.remove('selected');
    const sbItem = document.getElementById('sidebarBlueprintItem');
    if (sbItem) sbItem.classList.remove('active');
    const bgEl = document.getElementById('mapBgImg');
    if (bgEl) bgEl.classList.remove('selected');
    const sbBgItem = document.getElementById('sidebarBgItem');
    if (sbBgItem) sbBgItem.classList.remove('active');

    syncSelectionUI();
    updateVectorInspector();
}

function syncSelectionUI() {
    // Highlight all selected on canvas
    document.querySelectorAll('.me-vec-element').forEach(el => {
        const isSel = selectedVectorIds.has(el.dataset.vectorId);
        el.classList.toggle('selected', isSel);
    });

    // Highlight all selected in sidebar
    document.querySelectorAll('.me-layer-item:not(.me-layer-blueprint):not(#sidebarBgItem)').forEach(el => {
        const isSel = selectedVectorIds.has(el.dataset.vectorId);
        el.classList.toggle('active', isSel);
    });
}

// ── Blueprint Drag & Drop ──
let isDraggingBp = false;
let bpDragStartX = 0;
let bpDragStartY = 0;
let bpOrigX = 0;
let bpOrigY = 0;

function startBlueprintDrag(e) {
    if (!blueprintConfig.unlocked) return;

    isDraggingBp = true;
    bpDragStartX = e.clientX;
    bpDragStartY = e.clientY;
    bpOrigX = Number(blueprintConfig.x) || 0;
    bpOrigY = Number(blueprintConfig.y) || 0;

    const bpImg = document.getElementById('blueprintImg');
    if (bpImg) bpImg.classList.add('dragging');

    const onBpMove = (moveEvt) => {
        if (!isDraggingBp) return;
        const dx = (moveEvt.clientX - bpDragStartX) / currentZoom;
        const dy = (moveEvt.clientY - bpDragStartY) / currentZoom;
        blueprintConfig.x = Math.round(bpOrigX + dx);
        blueprintConfig.y = Math.round(bpOrigY + dy);

        // Fast 60fps CSS transform property update
        if (bpImg) {
            bpImg.style.setProperty('--bp-x', `${blueprintConfig.x}px`);
            bpImg.style.setProperty('--bp-y', `${blueprintConfig.y}px`);
        }
        setVal('bpRefOffsetX', blueprintConfig.x);
        setVal('bpRefOffsetY', blueprintConfig.y);
        updateSidebarBlueprintMeta();
    };

    const onBpUp = () => {
        isDraggingBp = false;
        if (bpImg) bpImg.classList.remove('dragging');
        window.removeEventListener('mousemove', onBpMove);
        window.removeEventListener('mouseup', onBpUp);
        saveBlueprintConfig();
        updateSidebarBlueprintMeta();
    };

    window.addEventListener('mousemove', onBpMove);
    window.addEventListener('mouseup', onBpUp);
}

// ── Vector Drag & Drop (Supports Multi-Vector Drag) ──
function startVectorDrag(e, vector) {
    if (!vector.visible) return;

    if (!selectedVectorIds.has(vector.id)) {
        selectedVectorIds.add(vector.id);
        activeVectorId = vector.id;
        syncSelectionUI();
    }

    isDraggingVector = true;
    dragContext = {
        primaryId: vector.id,
        startX: e.clientX,
        startY: e.clientY,
        vectors: Array.from(selectedVectorIds).map(id => {
            const v = vectorLayers.find(layer => layer.id === id);
            return {
                id,
                initialLeft: Number(v ? v.left : 0),
                initialTop: Number(v ? v.top : 0)
            };
        })
    };

    selectedVectorIds.forEach(id => {
        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${id}"]`);
        if (targetEl) targetEl.classList.add('dragging');
    });

    window.addEventListener('mousemove', onVectorDragMove);
    window.addEventListener('mouseup', onVectorDragEnd);
}

// Helper: Check if moving vector to (candidateLeft, candidateTop) intersects another visible vector
function getVectorOverlap(currentVector, candidateLeft, candidateTop) {
    if (!currentVector || currentVector.id === 'group-109') return null;
    const w1 = Number(currentVector.width) || 15;
    const h1 = w1 * 1.1; // proportional height
    const r1 = {
        left: candidateLeft,
        top: candidateTop,
        right: candidateLeft + w1,
        bottom: candidateTop + h1
    };

    for (const other of vectorLayers) {
        if (!other.visible || other.id === currentVector.id || other.id === 'group-109') continue;
        const w2 = Number(other.width) || 15;
        const h2 = w2 * 1.1;
        const r2 = {
            left: Number(other.left),
            top: Number(other.top),
            right: Number(other.left) + w2,
            bottom: Number(other.top) + h2
        };

        // 1.5% buffer tolerance to avoid false positives on adjacent borders
        const buffer = 1.5;
        if (r1.left < r2.right - buffer && r1.right > r2.left + buffer &&
            r1.top < r2.bottom - buffer && r1.bottom > r2.top + buffer) {
            return other;
        }
    }
    return null;
}

function onVectorDragMove(e) {
    if (!isDraggingVector || !dragContext) return;

    const board = document.getElementById('mapBoard');
    if (!board) return;

    const deltaX = (e.clientX - dragContext.startX) / currentZoom;
    const deltaY = (e.clientY - dragContext.startY) / currentZoom;

    // Convert pixel deltas to percentage of virtual board width / height
    const pctDeltaX = (deltaX / BOARD_WIDTH) * 100;
    const pctDeltaY = (deltaY / BOARD_HEIGHT) * 100;

    dragContext.vectors.forEach(item => {
        const v = vectorLayers.find(layer => layer.id === item.id);
        if (!v) return;

        v.left = parseFloat((item.initialLeft + pctDeltaX).toFixed(1));
        v.top  = parseFloat((item.initialTop + pctDeltaY).toFixed(1));

        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
        if (targetEl) {
            targetEl.style.left = `${v.left}%`;
            targetEl.style.top  = `${v.top}%`;
        }
    });

    const activeV = vectorLayers.find(l => l.id === activeVectorId);
    if (activeV) {
        setVal('propX', activeV.left);
        setVal('propY', activeV.top);
    }
}

function onVectorDragEnd() {
    if (!isDraggingVector) return;
    isDraggingVector = false;

    if (dragContext) {
        dragContext.vectors.forEach(item => {
            const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${item.id}"]`);
            if (targetEl) {
                targetEl.classList.remove('dragging');
                targetEl.classList.remove('me-vec-overlap');
            }
        });
        dragContext = null;
    }

    window.removeEventListener('mousemove', onVectorDragMove);
    window.removeEventListener('mouseup', onVectorDragEnd);

    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    renderLayerSidebar();
    updateVectorInspector();
}

// ── Quick Actions: Resize & Rotate Multi-Select ──
function quickResizeSelected(delta) {
    if (selectedVectorIds.size === 0 && activeVectorId) {
        selectedVectorIds.add(activeVectorId);
    }
    if (selectedVectorIds.size === 0) return;

    selectedVectorIds.forEach(id => {
        const v = vectorLayers.find(layer => layer.id === id);
        if (!v) return;
        const currentW = Number(v.width) || 15;
        const newW = parseFloat(Math.max(2, Math.min(150, currentW + delta)).toFixed(1));
        v.width = newW;

        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
        if (targetEl) targetEl.style.width = `${v.width}%`;
    });

    renderLayerSidebar();
    updateVectorInspector();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
}

function quickRotateSelected(deg, isDelta = true) {
    if (selectedVectorIds.size === 0 && activeVectorId) {
        selectedVectorIds.add(activeVectorId);
    }
    if (selectedVectorIds.size === 0) return;

    selectedVectorIds.forEach(id => {
        const v = vectorLayers.find(layer => layer.id === id);
        if (!v) return;
        let newRot = isDelta ? ((Number(v.rotate) || 0) + deg) : deg;
        if (newRot > 180) newRot -= 360;
        if (newRot < -180) newRot += 360;
        v.rotate = Math.round(newRot);

        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
        if (targetEl) targetEl.style.transform = `rotate(${v.rotate}deg)`;
    });

    updateVectorInspector();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
}

async function deleteSelectedVectors() {
    if (selectedVectorIds.size === 0) return;
    const count = selectedVectorIds.size;
    if (count === 1) {
        deleteVector(Array.from(selectedVectorIds)[0]);
        return;
    }
    if (!await showConfirmModal({ title: "Delete Vector Layers", message: `Delete all ${count} selected vector layers?`, confirmText: "Delete Layers", cancelText: "Cancel", type: "warning", danger: true })) return;

    vectorLayers = vectorLayers.filter(l => !selectedVectorIds.has(l.id));
    deselectAll();
    renderVectorMap();
    renderLayerSidebar();
    saveVectorLayout();
}

// ── Vector Inspector Panel Events & Sync ──
function setupVectorInspectorEvents() {
    const bindVal = (id, propKey, isNumeric = true, transform = null) => {
        const el = document.getElementById(id);
        if (!el) return;

        const updateFn = (val) => {
            const v = vectorLayers.find(l => l.id === activeVectorId);
            if (!v) return;

            let parsed = isNumeric ? parseFloat(val) : val;
            if (isNumeric && isNaN(parsed)) return;
            if (transform) parsed = transform(parsed);

            if (selectedVectorIds.size > 1 && (propKey === 'width' || propKey === 'rotate' || propKey === 'opacity' || propKey === 'zIndex')) {
                const oldVal = v[propKey] || 0;
                const delta = parsed - oldVal;
                selectedVectorIds.forEach(id => {
                    const layer = vectorLayers.find(l => l.id === id);
                    if (!layer) return;
                    if (propKey === 'width') {
                        layer.width = parseFloat(Math.max(2, Math.min(150, (Number(layer.width) || 15) + delta)).toFixed(1));
                    } else if (propKey === 'rotate') {
                        let newR = Math.round((Number(layer.rotate) || 0) + delta);
                        if (newR > 180) newR -= 360;
                        if (newR < -180) newR += 360;
                        layer.rotate = newR;
                    } else {
                        layer[propKey] = parsed;
                    }
                });
            } else {
                v[propKey] = parsed;
            }

            renderVectorMap();
            renderLayerSidebar();
            localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
        };

        el.addEventListener('input', (e) => updateFn(e.target.value));
        el.addEventListener('change', (e) => updateFn(e.target.value));
    };

    bindVal('propName', 'name', false);
    bindVal('propX', 'left');
    bindVal('propY', 'top');
    bindVal('propW', 'width');
    bindVal('propWidthSlider', 'width');
    bindVal('propR', 'rotate');
    bindVal('propRotSlider', 'rotate');
    bindVal('propOpacity', 'opacity', true, v => v / 100);
    bindVal('propOpSlider', 'opacity', true, v => v / 100);
    bindVal('propZ', 'zIndex');

    // Directional Nudge Pad (applies to all selected vectors)
    const setupNudge = (btnId, dx, dy) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                if (selectedVectorIds.size === 0 && activeVectorId) {
                    selectedVectorIds.add(activeVectorId);
                }
                selectedVectorIds.forEach(id => {
                    const v = vectorLayers.find(l => l.id === id);
                    if (!v) return;
                    v.left = parseFloat((v.left + dx).toFixed(1));
                    v.top = parseFloat((v.top + dy).toFixed(1));
                    const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
                    if (targetEl) {
                        targetEl.style.left = `${v.left}%`;
                        targetEl.style.top = `${v.top}%`;
                    }
                });
                renderLayerSidebar();
                updateVectorInspector();
                localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
            });
        }
    };
    setupNudge('btnNudgeUp', 0, -0.5);
    setupNudge('btnNudgeDown', 0, 0.5);
    setupNudge('btnNudgeLeft', -0.5, 0);
    setupNudge('btnNudgeRight', 0.5, 0);

    // Quick Size +/- Buttons
    bindBtn('btnQuickSizeMinus', () => quickResizeSelected(-0.5));
    bindBtn('btnQuickSizePlus', () => quickResizeSelected(0.5));

    // Rotation Presets & Quick Buttons
    bindBtn('btnRotLeftK', () => quickRotateSelected(-5, true));
    bindBtn('btnRotRightL', () => quickRotateSelected(5, true));

    const setupRotPreset = (btnId, deg, isDelta = false) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                quickRotateSelected(deg, isDelta);
            });
        }
    };
    setupRotPreset('btnRotM5', -5, true);
    setupRotPreset('btnRot0', 0, false);
    setupRotPreset('btnRotP5', 5, true);
    setupRotPreset('btnRot30', 30, false);

    // Stacking Order Buttons
    const btnBringFwd = document.getElementById('btnBringFwd');
    if (btnBringFwd) {
        btnBringFwd.addEventListener('click', () => {
            const v = vectorLayers.find(l => l.id === activeVectorId);
            if (v) {
                v.zIndex = (Number(v.zIndex) || 5) + 1;
                renderVectorMap();
                renderLayerSidebar();
                updateVectorInspector();
                localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
            }
        });
    }

    const btnSendBack = document.getElementById('btnSendBack');
    if (btnSendBack) {
        btnSendBack.addEventListener('click', () => {
            const v = vectorLayers.find(l => l.id === activeVectorId);
            if (v) {
                v.zIndex = Math.max(1, (Number(v.zIndex) || 5) - 1);
                renderVectorMap();
                renderLayerSidebar();
                updateVectorInspector();
                localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
            }
        });
    }

    // Delete Button in Inspector
    const btnDelete = document.getElementById('btnDeleteLayer');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            if (selectedVectorIds.size > 1) {
                deleteSelectedVectors();
            } else if (activeVectorId) {
                deleteVector(activeVectorId);
            }
        });
    }
}

function updateVectorInspector() {
    const v = vectorLayers.find(l => l.id === activeVectorId);
    const emptyMsg = document.getElementById('propsEmptyMap');
    const form = document.getElementById('propsFormMap');
    const multiBadge = document.getElementById('multiSelectBadge');
    const multiCount = document.getElementById('multiSelectCount');

    if (!v) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (form) form.style.display = 'none';
        if (multiBadge) multiBadge.style.display = 'none';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (form) form.style.display = 'block';

    if (multiBadge) {
        if (selectedVectorIds.size > 1) {
            multiBadge.style.display = 'inline-flex';
            if (multiCount) multiCount.textContent = `${selectedVectorIds.size} Layers Selected (Multi-Edit)`;
        } else {
            multiBadge.style.display = 'none';
        }
    }

    setVal('propName', v.name);
    setVal('propX', v.left);
    setVal('propY', v.top);
    setVal('propW', v.width);
    setVal('propWidthSlider', v.width);
    setVal('propR', v.rotate || 0);
    setVal('propRotSlider', v.rotate || 0);

    const opPct = Math.round((v.opacity ?? 1.0) * 100);
    setVal('propOpacity', opPct);
    setVal('propOpSlider', opPct);
    setVal('propZ', v.zIndex || 5);
}

// ── Deleting Vectors ──
async function deleteVector(id) {
    const v = vectorLayers.find(l => l.id === id);
    const name = v ? v.name : 'Vector layer';

    if (!await showConfirmModal({ title: "Delete Vector", message: `Are you sure you want to delete "${name}" from the map?`, confirmText: "Delete", cancelText: "Cancel", type: "warning", danger: true })) return;

    vectorLayers = vectorLayers.filter(l => l.id !== id);
    selectedVectorIds.delete(id);
    if (activeVectorId === id) {
        activeVectorId = selectedVectorIds.size > 0 ? Array.from(selectedVectorIds)[0] : (vectorLayers[0]?.id || null);
    }

    saveVectorLayout();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();

    if (typeof showNotification === 'function') {
        showNotification('Layer Deleted', `Removed "${name}" from layout.`, 'info');
    }
}

// ── Adding Vectors (Canva Asset Gallery Modal) ──
function setupVectorAssetGalleryModal() {
    const modal = document.getElementById('addVectorModal');
    const grid = document.getElementById('assetGalleryGrid');
    const closeBtn = document.getElementById('btnCloseVectorModal');
    const customTrigger = document.getElementById('btnUploadCustomTrigger');
    const customFileInput = document.getElementById('customVectorFileInput');

    if (!grid) return;

    // Populate asset gallery
    grid.innerHTML = '';
    VECTOR_CATALOG.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'me-asset-card';
        card.innerHTML = `
            <img src="${MAP_DIR}${asset.file}" alt="${asset.name}">
            <span>${asset.name}</span>
        `;
        card.addEventListener('click', () => {
            addVectorFromAsset(asset);
            closeVectorAssetModal();
        });
        grid.appendChild(card);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeVectorAssetModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVectorAssetModal();
        });
    }

    // Custom upload
    if (customTrigger && customFileInput) {
        customTrigger.addEventListener('click', () => customFileInput.click());
        customFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (uploadEvt) => {
                    const newVector = {
                        id: `custom-vector-${Date.now()}`,
                        name: file.name.replace(/\.[^/.]+$/, ''),
                        src: uploadEvt.target.result,
                        left: 20.0,
                        top: 20.0,
                        width: 25.0,
                        rotate: 0,
                        opacity: 1.0,
                        zIndex: Math.max(...vectorLayers.map(l => Number(l.zIndex) || 0), 5) + 1,
                        visible: true
                    };
                    vectorLayers.push(newVector);
                    activeVectorId = newVector.id;
                    saveVectorLayout();
                    renderVectorMap();
                    renderLayerSidebar();
                    updateVectorInspector();
                    closeVectorAssetModal();
                    if (typeof showNotification === 'function') {
                        showNotification('Vector Uploaded', `Added "${newVector.name}" to canvas!`, 'success');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function openVectorAssetModal() {
    const modal = document.getElementById('addVectorModal');
    if (modal) modal.classList.add('open');
}

function closeVectorAssetModal() {
    const modal = document.getElementById('addVectorModal');
    if (modal) modal.classList.remove('open');
}

function addVectorFromAsset(asset) {
    const newVector = {
        id: `vec-${Date.now()}`,
        name: asset.name,
        src: MAP_DIR + asset.file,
        left: 25.0 + Math.random() * 5,
        top: 25.0 + Math.random() * 5,
        width: asset.defaultW || 20.0,
        rotate: 30,
        opacity: 0.95,
        zIndex: Math.max(...vectorLayers.map(l => Number(l.zIndex) || 0), 5) + 1,
        visible: true
    };

    vectorLayers.push(newVector);
    activeVectorId = newVector.id;
    saveVectorLayout();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();

    if (typeof showNotification === 'function') {
        showNotification('Vector Added', `Added "${asset.name}" to canvas!`, 'success');
    }
}

// ==============================================================================
// ==============================================================================
// 2. UNTILTED AREA SHAPE PLOT BLUEPRINT & MULTI-SIZE BUILDER SYSTEM
// ==============================================================================

const SECTION_SHAPE_MAP = {
    'Area 1 - Single Tiered Lawn': {
        area: '1',
        asset: 'assets/images/Map/Vector (7).png',
        prefix: 'ST1',
        category: 'Single Teired',
        cols: 24,
        rows: 24,
        widthPx: 600,
        heightPx: 630
    },
    'Area 2 - Lawn of Love': {
        area: '2',
        asset: 'assets/images/Map/Vector (8).png',
        prefix: 'LL',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 560,
        heightPx: 700
    },
    'Area 3 - Lawn of Hope (Family Estate)': {
        area: '3',
        asset: 'assets/images/Map/Vector (9).png',
        prefix: 'FE',
        category: 'Family Estate Jr.',
        cols: 24,
        rows: 26,
        widthPx: 580,
        heightPx: 640
    },
    'Area 4 - Supreme Garden': {
        area: '4',
        asset: 'assets/images/Map/Vector (12).png',
        prefix: 'SUP4',
        category: 'Supreme',
        cols: 24,
        rows: 26,
        widthPx: 580,
        heightPx: 630
    },
    'Area 5 - Special Supreme Estate': {
        area: '5',
        asset: 'assets/images/Map/Vector (13).png',
        prefix: 'SPEC5',
        category: 'Special Supreme',
        cols: 22,
        rows: 28,
        widthPx: 560,
        heightPx: 700
    },
    'Area 6 - Lawn of Peace': {
        area: '6',
        asset: 'assets/images/Map/Vector (6).png',
        prefix: 'ST6',
        category: 'Single Teired',
        cols: 18,
        rows: 28,
        widthPx: 460,
        heightPx: 720
    },
    'Area 7 - Lawn of Faith': {
        area: '7',
        asset: 'assets/images/Map/Vector (5).png',
        prefix: 'SUP7',
        category: 'Supreme',
        cols: 18,
        rows: 26,
        widthPx: 460,
        heightPx: 680
    },
    'Area 8 - Lawn of Grace': {
        area: '8',
        asset: 'assets/images/Map/Vector (10).png',
        prefix: 'SUP8',
        category: 'Supreme',
        cols: 16,
        rows: 22,
        widthPx: 420,
        heightPx: 580
    },
    'Area 9 - Lawn of Serenity': {
        area: '9',
        asset: 'assets/images/Map/Vector (11).png',
        prefix: 'SPEC9',
        category: 'Special Supreme',
        cols: 24,
        rows: 24,
        widthPx: 600,
        heightPx: 620
    },
    'Area 10 - Condominium Block A': {
        area: '10',
        asset: 'assets/images/Map/Vector (14).png',
        prefix: 'COND',
        category: 'Condominium',
        cols: 28,
        rows: 24,
        widthPx: 680,
        heightPx: 580
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
        widthPx: 600,
        heightPx: 600
    }
};

const CATEGORY_DEFAULT_SPECS = {
    'Single Teired':     { w: 1, h: 2, price: 42000, down: 6500 },
    'Supreme':           { w: 2, h: 2, price: 65000, down: 9500 },
    'Special Supreme':   { w: 2, h: 3, price: 85000, down: 12500 },
    'Family Estate Jr.': { w: 6, h: 6, price: 240000, down: 35000 },
    'Condominium':       { w: 1, h: 1, price: 35000, down: 5000 },
    'Mausoleum':         { w: 3, h: 3, price: 180000, down: 25000 },
    'Custom':            { w: 1, h: 1, price: 50000, down: 8000 }
};

let BUILDER_STATE = {
    activeTool: 'select', // 'select' or 'place'selectedCategory: 'Single Teired',
    plotWidth: 1,
    plotHeight: 2,
    plotStatus: 'available'
};

function initPlotSystem() {
    const sectionSelect = document.getElementById('editorSectionSelect');
    if (sectionSelect) {
        sectionSelect.addEventListener('change', () => {
            loadPlotSectionData();
        });
    }

    const btnReload = document.getElementById('btnReloadPlots');
    if (btnReload) btnReload.addEventListener('click', loadPlotSectionData);

    const btnAddTop = document.getElementById('btnAddPlotTop');
    if (btnAddTop) btnAddTop.addEventListener('click', () => setBuilderTool('place'));

    const btnAddSidebar = document.getElementById('btnAddPlotSidebar');
    if (btnAddSidebar) btnAddSidebar.addEventListener('click', () => setBuilderTool('place'));

    // Filter tabs (All, Available, Reserved, Occupied)
    document.querySelectorAll('.me-filter-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.me-filter-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentPlotFilter = e.target.dataset.filter;
            renderAreaBlueprintGrid();
            renderPlotQuickList();
        });
    });

    // Inspector plot update
    const btnUpdateLive = document.getElementById('btnUpdatePlotLive');
    if (btnUpdateLive) btnUpdateLive.addEventListener('click', saveActivePlotChanges);

    const btnDeletePlotLive = document.getElementById('btnDeletePlotLive');
    if (btnDeletePlotLive) btnDeletePlotLive.addEventListener('click', deleteActivePlot);

    // Inspector quick status buttons
    const btnAvail = document.getElementById('btnQuickStatusAvail');
    const btnRes = document.getElementById('btnQuickStatusRes');
    const btnOcc = document.getElementById('btnQuickStatusOcc');
    if (btnAvail) btnAvail.addEventListener('click', () => setQuickStatus('available'));
    if (btnRes) btnRes.addEventListener('click', () => setQuickStatus('reserved'));
    if (btnOcc) btnOcc.addEventListener('click', () => setQuickStatus('occupied'));

    // Setup Builder Tool Palette & Interactive Grid handlers
    setupPlotBuilderToolbar();
    setupAreaGridInteractions();
    setupAddPlotModal();
}

// Global mask bitmap data for boundary checking
let currentAreaMaskData = null;
let currentAreaMaskCols = 23;
let currentAreaMaskRows = 28;

function loadAreaMaskBitmap(assetSrc, cols, rows) {
    currentAreaMaskCols = cols;
    currentAreaMaskRows = rows;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        try {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = cols;
            offCanvas.height = rows;
            const offCtx = offCanvas.getContext('2d');
            offCtx.drawImage(img, 0, 0, cols, rows);
            currentAreaMaskData = offCtx.getImageData(0, 0, cols, rows).data;
        } catch (e) {
            console.warn('Mask read notice (fallback to bounding):', e);
            currentAreaMaskData = null;
        }
    };
    img.onerror = () => {
        currentAreaMaskData = null;
    };
    img.src = assetSrc;
}

function isCellInsideLawn(col, row, totalCols, totalRows) {
    if (col < 1 || col > totalCols || row < 1 || row > totalRows) return false;
    if (!currentAreaMaskData) return true; // If mask hasn't loaded yet, default to inside
    const c = Math.max(0, Math.min(totalCols - 1, col - 1));
    const r = Math.max(0, Math.min(totalRows - 1, row - 1));
    const idx = (r * totalCols + c) * 4 + 3; // Alpha channel
    return currentAreaMaskData[idx] > 30;
}

function isPlotInsideLawn(col, row, w, h, totalCols, totalRows) {
    for (let r = row; r < row + h; r++) {
        for (let c = col; c < col + w; c++) {
            if (!isCellInsideLawn(c, r, totalCols, totalRows)) {
                return false;
            }
        }
    }
    return true;
}

function setBuilderTool(tool) {
    BUILDER_STATE.activeTool = tool;
    const btnSelect = document.getElementById('toolSelectPlot');
    const btnAdd = document.getElementById('toolAddPlot');
    const btnErase = document.getElementById('toolErasePlot');
    const ghost = document.getElementById('areaPlacementGhost');

    if (btnSelect) btnSelect.classList.toggle('active', tool === 'select');
    if (btnAdd) btnAdd.classList.toggle('active', tool === 'place');
    if (btnErase) btnErase.classList.toggle('active', tool === 'erase');

    if (tool !== 'place' && ghost) {
        ghost.style.display = 'none';
    }
}

function setupPlotBuilderToolbar() {
    const btnSelect = document.getElementById('toolSelectPlot');
    const btnAdd = document.getElementById('toolAddPlot');
    const btnErase = document.getElementById('toolErasePlot');

    if (btnSelect) btnSelect.addEventListener('click', () => setBuilderTool('select'));
    if (btnAdd) btnAdd.addEventListener('click', () => setBuilderTool('place'));
    if (btnErase) btnErase.addEventListener('click', () => setBuilderTool('erase'));

    // Category pills click
    document.querySelectorAll('#builderCatPills .cat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#builderCatPills .cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const cat = pill.dataset.cat;
            const w = parseInt(pill.dataset.w) || 1;
            const h = parseInt(pill.dataset.h) || 1;

            BUILDER_STATE.selectedCategory = cat;
            BUILDER_STATE.plotWidth = w;
            BUILDER_STATE.plotHeight = h;

            const wInput = document.getElementById('builderPlotWidth');
            const hInput = document.getElementById('builderPlotHeight');
            if (wInput) wInput.value = w;
            if (hInput) hInput.value = h;

            // Automatically switch to placement mode
            setBuilderTool('place');
        });
    });

    // Custom width & height steppers
    const wInput = document.getElementById('builderPlotWidth');
    const hInput = document.getElementById('builderPlotHeight');
    if (wInput) {
        wInput.addEventListener('input', (e) => {
            BUILDER_STATE.plotWidth = Math.max(1, parseInt(e.target.value) || 1);
        });
    }
    if (hInput) {
        hInput.addEventListener('input', (e) => {
            BUILDER_STATE.plotHeight = Math.max(1, parseInt(e.target.value) || 1);
        });
    }

    // Status select
    const statusSelect = document.getElementById('builderPlotStatus');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            BUILDER_STATE.plotStatus = e.target.value;
        });
    }

    // Area silhouette opacity slider
    const opacitySlider = document.getElementById('builderShapeOpacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
            const shapeImg = document.getElementById('areaShapeImg');
            if (shapeImg) {
                shapeImg.style.opacity = (parseFloat(e.target.value) / 100).toFixed(2);
            }
        });
    }

    // Undo / Redo buttons
    const btnUndo = document.getElementById('btnUndoPlot');
    if (btnUndo) btnUndo.addEventListener('click', undoPlotAction);

    const btnRedo = document.getElementById('btnRedoPlot');
    if (btnRedo) btnRedo.addEventListener('click', redoPlotAction);

    // Save to DB and Clear Section action buttons
    const btnSaveDb = document.getElementById('btnSavePlotsDb');
    if (btnSaveDb) btnSaveDb.addEventListener('click', saveCurrentPlotLayoutToDatabase);

    const btnClearSection = document.getElementById('btnClearPlotsSection');
    if (btnClearSection) btnClearSection.addEventListener('click', clearCurrentSectionPlots);
}

// ── Plot History (Undo / Redo) ──
const plotUndoStack = [];
const plotRedoStack = [];

function recordPlotHistory(action) {
    plotUndoStack.push(action);
    plotRedoStack.length = 0;
    if (plotUndoStack.length > 50) plotUndoStack.shift();
}

function undoPlotAction() {
    if (plotUndoStack.length === 0) {
        if (typeof showNotification === 'function') showNotification('Undo', 'Nothing to undo', 'info');
        return;
    }
    const action = plotUndoStack.pop();
    plotRedoStack.push(action);

    if (action.type === 'add_batch') {
        const addedIds = new Set(action.plots.map(p => p.id));
        currentPlotsList = currentPlotsList.filter(p => !addedIds.has(p.id));
        action.plots.forEach(p => {
            supabaseClient.from('memorial_spaces').delete().eq('id', p.id).catch(() => {});
        });
        if (addedIds.has(activePlotId)) activePlotId = null;
    } else if (action.type === 'delete') {
        currentPlotsList.push(...action.plots);
    } else if (action.type === 'update') {
        const idx = currentPlotsList.findIndex(p => p.id === action.plotId);
        if (idx !== -1) {
            currentPlotsList[idx] = { ...action.previousState };
        }
    } else if (action.type === 'clear') {
        currentPlotsList = [...action.plots];
    }

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(activePlotId);

    if (typeof showNotification === 'function') {
        showNotification('Undo', `Undid ${action.description || 'action'}`, 'info');
    }
}

function redoPlotAction() {
    if (plotRedoStack.length === 0) {
        if (typeof showNotification === 'function') showNotification('Redo', 'Nothing to redo', 'info');
        return;
    }
    const action = plotRedoStack.pop();
    plotUndoStack.push(action);

    if (action.type === 'add_batch') {
        currentPlotsList.push(...action.plots);
    } else if (action.type === 'delete') {
        const delIds = new Set(action.plots.map(p => p.id));
        currentPlotsList = currentPlotsList.filter(p => !delIds.has(p.id));
        action.plots.forEach(p => {
            supabaseClient.from('memorial_spaces').delete().eq('id', p.id).catch(() => {});
        });
    } else if (action.type === 'update') {
        const idx = currentPlotsList.findIndex(p => p.id === action.plotId);
        if (idx !== -1) {
            currentPlotsList[idx] = { ...action.newState };
        }
    } else if (action.type === 'clear') {
        currentPlotsList = [];
    }

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(activePlotId);

    if (typeof showNotification === 'function') {
        showNotification('Redo', `Redid ${action.description || 'action'}`, 'info');
    }
}

// Check if a box (col, row, width, height) overlaps any existing plot
function checkPlotCollision(c, r, w, h, ignoreId = null) {
    return currentPlotsList.find(p => {
        if (ignoreId && p.id === ignoreId) return false;
        const pCol = p.col_num || 1;
        const pRow = p.row_num || 1;
        const pW = (p.coordinates?.col_span || p.coordinates?.width || 1);
        const pH = (p.coordinates?.row_span || p.coordinates?.height || 1);
        return !(c + w <= pCol || c >= pCol + pW || r + h <= pRow || r >= pRow + pH);
    });
}

// ── Box Drag Marquee Fill (Starting from Top-Left) ──
let isBoxDragging = false;
let boxDragStart = null; // { col, row }
let boxDragCurrent = null; // { col, row }
let boxPendingTiles = []; // Array of { col, row, width, height, valid, reason }

function createPlotObjectAt(col, row, chosenSection, shapeInfo, customNum = null) {
    const w = BUILDER_STATE.plotWidth;
    const h = BUILDER_STATE.plotHeight;
    const totalCols = shapeInfo.cols || 23;
    const totalRows = shapeInfo.rows || 28;

    if (col < 1 || col + w - 1 > totalCols || row < 1 || row + h - 1 > totalRows) return null;
    if (!isPlotInsideLawn(col, row, w, h, totalCols, totalRows)) return null;
    if (checkPlotCollision(col, row, w, h)) return null;

    const prefix = shapeInfo.prefix || 'PL';
    let nextNum = customNum;
    if (!nextNum) {
        let maxNum = 0;
        currentPlotsList.forEach(p => {
            if (p.plot_identifier && p.plot_identifier.startsWith(prefix)) {
                const parts = p.plot_identifier.split('-');
                const num = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        nextNum = maxNum + 1;
    }

    const code = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    const spec = CATEGORY_DEFAULT_SPECS[BUILDER_STATE.selectedCategory] || { price: 65000, down: 9500 };
    const validCategories = ['Condominium', 'Single Teired', 'Supreme', 'Special Supreme', 'Mausoleum', 'Family Estate Jr.'];
    const targetCategory = validCategories.includes(BUILDER_STATE.selectedCategory) ? BUILDER_STATE.selectedCategory : (shapeInfo.category || 'Supreme');

    return {
        id: `plot-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        plot_identifier: code,
        section_name: chosenSection,
        category: targetCategory,
        status: BUILDER_STATE.plotStatus,
        price: spec.price,
        down_payment: spec.down,
        col_num: col,
        row_num: row,
        coordinates: {
            col_span: w,
            row_span: h,
            width: w,
            height: h
        }
    };
}

function getCellCoordsFromEvent(e, gridLayer, totalCols, totalRows) {
    const rect = gridLayer.getBoundingClientRect();
    const cellW = rect.width / totalCols;
    const cellH = rect.height / totalRows;
    const mouseX = Math.max(0, Math.min(rect.width - 1, e.clientX - rect.left));
    const mouseY = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
    let col = Math.floor(mouseX / cellW) + 1;
    let row = Math.floor(mouseY / cellH) + 1;
    return {
        col: Math.max(1, Math.min(col, totalCols)),
        row: Math.max(1, Math.min(row, totalRows))
    };
}

function updateBoxMarqueeDisplay() {
    const marqueeBox = document.getElementById('areaMarqueeBox');
    const marqueeBadge = document.getElementById('areaMarqueeBadge');
    const marqueeGrid = document.getElementById('areaMarqueeGrid');
    const gridLayer = document.getElementById('areaGridLayer');
    if (!marqueeBox || !marqueeBadge || !marqueeGrid || !gridLayer || !boxDragStart || !boxDragCurrent) return;

    const rect = gridLayer.getBoundingClientRect();
    const sectionSelect = document.getElementById('editorSectionSelect');
    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
    const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };
    const totalCols = shapeInfo.cols || 23;
    const totalRows = shapeInfo.rows || 28;

    const cellW = rect.width / totalCols;
    const cellH = rect.height / totalRows;

    const w = BUILDER_STATE.plotWidth || 1;
    const h = BUILDER_STATE.plotHeight || 2;

    let minCol = Math.min(boxDragStart.col, boxDragCurrent.col);
    let maxCol = Math.max(boxDragStart.col, boxDragCurrent.col);
    let minRow = Math.min(boxDragStart.row, boxDragCurrent.row);
    let maxRow = Math.max(boxDragStart.row, boxDragCurrent.row);

    // Expand bounding box so at least 1 plot fits if user clicked or made a tiny drag
    if (maxCol - minCol + 1 < w) {
        maxCol = Math.min(totalCols, minCol + w - 1);
    }
    if (maxRow - minRow + 1 < h) {
        maxRow = Math.min(totalRows, minRow + h - 1);
    }

    // Set position and size of marquee container
    marqueeBox.style.display = 'block';
    marqueeBox.style.left = `${(minCol - 1) * cellW}px`;
    marqueeBox.style.top = `${(minRow - 1) * cellH}px`;
    marqueeBox.style.width = `${(maxCol - minCol + 1) * cellW}px`;
    marqueeBox.style.height = `${(maxRow - minRow + 1) * cellH}px`;

    // Fill starting from TOP-LEFT (minCol, minRow)
    boxPendingTiles = [];
    let validCount = 0;
    let invalidCount = 0;
    let tilesHTML = '';

    for (let r = minRow; r + h - 1 <= maxRow; r += h) {
        for (let c = minCol; c + w - 1 <= maxCol; c += w) {
            const insideLawn = isPlotInsideLawn(c, r, w, h, totalCols, totalRows);
            const overlappingPlot = checkPlotCollision(c, r, w, h);
            const isValid = insideLawn && !overlappingPlot;

            if (isValid) {
                validCount++;
            } else {
                invalidCount++;
            }

            boxPendingTiles.push({
                col: c,
                row: r,
                width: w,
                height: h,
                valid: isValid,
                reason: !insideLawn ? 'Outside Lawn' : (overlappingPlot ? `Overlaps ${overlappingPlot.plot_identifier}` : '')
            });

            const tileLeft = (c - minCol) * cellW;
            const tileTop = (r - minRow) * cellH;
            const tileW = Math.max(4, w * cellW - 2);
            const tileH = Math.max(4, h * cellH - 2);

            const label = isValid
                ? `${BUILDER_STATE.selectedCategory} (${w}×${h})`
                : (overlappingPlot ? ` ${overlappingPlot.plot_identifier}` : ` Outside`);

            tilesHTML += `
                <div class="marquee-ghost-tile ${isValid ? 'valid' : 'invalid'}"style="left: ${tileLeft}px; top: ${tileTop}px; width: ${tileW}px; height: ${tileH}px;">
                    <span>${label}</span>
                </div>
            `;
        }
    }

    marqueeGrid.innerHTML = tilesHTML;

    const spanCols = maxCol - minCol + 1;
    const spanRows = maxRow - minRow + 1;
    marqueeBadge.innerHTML = `
        <span> Box: ${spanCols}×${spanRows} cells</span>
        &nbsp;|&nbsp;
        <strong style="color: #4ade80;"> ${validCount} Plots</strong>
        ${invalidCount > 0 ? `&nbsp;|&nbsp;<span style="color: #f87171;"> ${invalidCount} Blocked</span>` : ''}
        &nbsp;|&nbsp;
        <span style="opacity: 0.85;">Starting Top-Left (${minCol}, ${minRow})</span>
    `;
}

function setupAreaGridInteractions() {
    const gridLayer = document.getElementById('areaGridLayer');
    const ghost = document.getElementById('areaPlacementGhost');
    const canvasEl = document.getElementById('areaBlueprintCanvas');
    if (!gridLayer || !ghost || !canvasEl) return;

    // Mouse down: start box drag in place mode
    gridLayer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Left click only
        if (BUILDER_STATE.activeTool === 'place') {
            isBoxDragging = true;
            const sectionSelect = document.getElementById('editorSectionSelect');
            const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
            const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };
            const pos = getCellCoordsFromEvent(e, gridLayer, shapeInfo.cols, shapeInfo.rows);

            boxDragStart = { col: pos.col, row: pos.row };
            boxDragCurrent = { col: pos.col, row: pos.row };

            ghost.style.display = 'none';
            updateBoxMarqueeDisplay();
            e.preventDefault();
        }
    });

    // Mouse move: update box drag marquee or single hover ghost
    window.addEventListener('mousemove', (e) => {
        if (isBoxDragging) {
            const sectionSelect = document.getElementById('editorSectionSelect');
            const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
            const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };
            const pos = getCellCoordsFromEvent(e, gridLayer, shapeInfo.cols, shapeInfo.rows);

            boxDragCurrent = { col: pos.col, row: pos.row };
            updateBoxMarqueeDisplay();
            return;
        }

        if (BUILDER_STATE.activeTool !== 'place') {
            ghost.style.display = 'none';
            return;
        }

        const rect = gridLayer.getBoundingClientRect();
        // Check if cursor is over gridLayer
        if (
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom
        ) {
            ghost.style.display = 'none';
            return;
        }

        const sectionSelect = document.getElementById('editorSectionSelect');
        const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
        const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };

        const totalCols = shapeInfo.cols || 23;
        const totalRows = shapeInfo.rows || 28;
        const cellW = rect.width / totalCols;
        const cellH = rect.height / totalRows;

        const pos = getCellCoordsFromEvent(e, gridLayer, totalCols, totalRows);
        let col = pos.col;
        let row = pos.row;

        const w = BUILDER_STATE.plotWidth;
        const h = BUILDER_STATE.plotHeight;

        col = Math.max(1, Math.min(col, totalCols - w + 1));
        row = Math.max(1, Math.min(row, totalRows - h + 1));

        // 1. Check boundary containment
        const insideLawn = isPlotInsideLawn(col, row, w, h, totalCols, totalRows);
        // 2. Check collision with existing plots
        const overlappingPlot = checkPlotCollision(col, row, w, h);
        const isColliding = !insideLawn || !!overlappingPlot;

        ghost.style.display = 'flex';
        ghost.style.left = `${(col - 1) * cellW}px`;
        ghost.style.top = `${(row - 1) * cellH}px`;
        ghost.style.width = `${w * cellW}px`;
        ghost.style.height = `${h * cellH}px`;
        ghost.className = `area-placement-ghost ${isColliding ? 'invalid' : 'valid'}`;

        if (!insideLawn) {
            ghost.textContent = ` Outside Lawn Contour`;
        } else if (overlappingPlot) {
            ghost.textContent = ` Overlaps ${overlappingPlot.plot_identifier}`;
        } else {
            ghost.textContent = ` Drag Box to Fill (${BUILDER_STATE.selectedCategory} ${w}×${h})`;
        }

        ghost.dataset.targetCol = col;
        ghost.dataset.targetRow = row;
        ghost.dataset.colliding = isColliding ? 'true' : 'false';
    });

    gridLayer.addEventListener('mouseleave', () => {
        if (!isBoxDragging) {
            ghost.style.display = 'none';
        }
    });

    // Window mouseup commits box drag placement
    window.addEventListener('mouseup', () => {
        if (!isBoxDragging) return;
        isBoxDragging = false;

        const marqueeBox = document.getElementById('areaMarqueeBox');
        if (marqueeBox) marqueeBox.style.display = 'none';

        if (boxPendingTiles && boxPendingTiles.length > 0) {
            const validTiles = boxPendingTiles.filter(t => t.valid);
            if (validTiles.length > 0) {
                const sectionSelect = document.getElementById('editorSectionSelect');
                const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
                const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };
                const prefix = shapeInfo.prefix || 'PL';

                // Calculate next sequential plot number base
                let maxNum = 0;
                currentPlotsList.forEach(p => {
                    if (p.plot_identifier && p.plot_identifier.startsWith(prefix)) {
                        const parts = p.plot_identifier.split('-');
                        const num = parseInt(parts[parts.length - 1], 10);
                        if (!isNaN(num) && num > maxNum) maxNum = num;
                    }
                });

                const newlyPlaced = [];
                for (const tile of validTiles) {
                    maxNum++;
                    const newPlot = createPlotObjectAt(tile.col, tile.row, chosenSection, shapeInfo, maxNum);
                    if (newPlot) {
                        currentPlotsList.push(newPlot);
                        newlyPlaced.push(newPlot);
                    }
                }

                if (newlyPlaced.length > 0) {
                    recordPlotHistory({
                        type: 'add_batch',
                        plots: [...newlyPlaced],
                        description: `box filled ${newlyPlaced.length} plot(s)`
                    });

                    activePlotId = newlyPlaced[newlyPlaced.length - 1].id;
                    updatePlotKPIs();
                    renderAreaBlueprintGrid();
                    renderPlotQuickList();
                    selectPlot(activePlotId);

                    // Auto-save batch to Supabase
                    saveCurrentPlotLayoutToDatabase();

                    if (typeof showNotification === 'function') {
                        showNotification(
                            'Plots Placed',
                            `Filled ${newlyPlaced.length} ${BUILDER_STATE.selectedCategory} plots starting from top-left!`,
                            'success'
                        );
                    }
                }
            }
        }

        boxPendingTiles = [];
        boxDragStart = null;
        boxDragCurrent = null;
    });
}

async function loadPlotSectionData() {
    const sectionSelect = document.getElementById('editorSectionSelect');
    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
    const stageTitle = document.getElementById('plotStageTitle');
    const shapeImg = document.getElementById('areaShapeImg');
    const blueprintCanvas = document.getElementById('areaBlueprintCanvas');
    const gridLayer = document.getElementById('areaGridLayer');

    const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || SECTION_SHAPE_MAP['Area 2 - Lawn of Love'];

    if (stageTitle) stageTitle.textContent = `${chosenSection} Blueprint Layout`;
    if (shapeImg && shapeInfo) {
        shapeImg.src = shapeInfo.asset;
        const opacitySlider = document.getElementById('builderShapeOpacity');
        const opVal = opacitySlider ? (parseFloat(opacitySlider.value) / 100).toFixed(2) : '0.35';
        shapeImg.style.opacity = opVal;
    }
    if (blueprintCanvas && shapeInfo) {
        blueprintCanvas.style.width = `${shapeInfo.widthPx || 560}px`;
        blueprintCanvas.style.height = `${shapeInfo.heightPx || 700}px`;
    }
    const cols = shapeInfo.cols || 23;
    const rows = shapeInfo.rows || 28;

    if (gridLayer) {
        gridLayer.style.setProperty('--grid-cols', cols);
        gridLayer.style.setProperty('--grid-rows', rows);
    }

    // Load mask alpha data for boundary checking
    loadAreaMaskBitmap(shapeInfo.asset, cols, rows);

    try {
        const { data: plots, error } = await supabaseClient
            .from('memorial_spaces')
            .select('*')
            .ilike('section_name', `%${chosenSection}%`)
            .order('plot_identifier', { ascending: true });

        if (error) throw error;
        currentPlotsList = plots || [];
    } catch (e) {
        console.warn('Supabase fetch notice:', e);
        currentPlotsList = [];
    }

    // Merge or fallback with localStorage section plot layout cache
    try {
        const cachedRaw = localStorage.getItem('zion_section_plots_v1_' + chosenSection);
        if (cachedRaw) {
            const cachedPlots = JSON.parse(cachedRaw);
            if (Array.isArray(cachedPlots) && cachedPlots.length > 0) {
                if (currentPlotsList.length === 0) {
                    currentPlotsList = cachedPlots;
                } else {
                    const cacheMap = new Map(cachedPlots.map(cp => [cp.plot_identifier, cp]));
                    currentPlotsList = currentPlotsList.map(p => {
                        const c = cacheMap.get(p.plot_identifier);
                        if (c) {
                            return {
                                ...p,
                                col_num: p.col_num || c.col_num || 1,
                                row_num: p.row_num || c.row_num || 1,
                                coordinates: p.coordinates || c.coordinates || { col_span: 1, row_span: 1, width: 1, height: 1 }
                            };
                        }
                        return p;
                    });
                }
            }
        }
    } catch (cacheErr) {
        console.warn('Plot layout cache read notice:', cacheErr);
    }

    syncPlotSectionLocalCache(chosenSection, currentPlotsList);

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();

    if (currentPlotsList.length > 0) {
        selectPlot(currentPlotsList[0].id);
    } else {
        selectPlot(null);
    }
}

function syncPlotSectionLocalCache(sectionName, plotsList) {
    if (!sectionName) return;
    try {
        localStorage.setItem('zion_section_plots_v1_' + sectionName, JSON.stringify(plotsList || []));
    } catch (e) {
        console.warn('Unable to cache section plots in localStorage:', e);
    }
}

function updatePlotKPIs() {
    const total = currentPlotsList.length;
    const avail = currentPlotsList.filter(p => p.status === 'available').length;
    const res   = currentPlotsList.filter(p => p.status === 'reserved').length;
    const occ   = currentPlotsList.filter(p => p.status === 'occupied').length;

    setValText('plotKpiTotal', total);
    setValText('plotKpiAvailable', avail);
    setValText('plotKpiReserved', res);
    setValText('plotKpiOccupied', occ);
}

function renderAreaBlueprintGrid() {
    const gridLayer = document.getElementById('areaGridLayer');
    if (!gridLayer) return;

    gridLayer.innerHTML = '';

    let filtered = currentPlotsList;
    if (currentPlotFilter !== 'all') {
        filtered = currentPlotsList.filter(p => p.status === currentPlotFilter);
    }

    filtered.forEach(plot => {
        const pCol = plot.col_num || 1;
        const pRow = plot.row_num || 1;
        const pW = (plot.coordinates?.col_span || plot.coordinates?.width || 1);
        const pH = (plot.coordinates?.row_span || plot.coordinates?.height || 1);

        const cell = document.createElement('div');
        cell.className = `area-plot-cell status-${plot.status || 'available'} ${plot.id === activePlotId ? 'selected' : ''}`;
        cell.style.gridColumn = `${pCol} / span ${pW}`;
        cell.style.gridRow = `${pRow} / span ${pH}`;
        cell.dataset.plotId = plot.id;
        cell.title = `${plot.plot_identifier} (${plot.category}) - ${plot.status.toUpperCase()} [${pW}×${pH} cells] (Click to inspect, dbl-click to toggle status)`;

        cell.innerHTML = `
            <span class="area-plot-code-text">${plot.plot_identifier}</span>
            ${pW > 1 && pH > 1 ? `<span class="area-plot-sub-text">${plot.category}</span>` : ''}
        `;

        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            if (BUILDER_STATE.activeTool === 'erase') {
                deletePlotDirectly(plot);
            } else {
                setBuilderTool('select');
                selectPlot(plot.id);
            }
        });

        cell.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            cyclePlotStatus(plot);
        });

        gridLayer.appendChild(cell);
    });
}

async function deletePlotDirectly(plot) {
    if (!plot) return;

    recordPlotHistory({
        type: 'delete',
        plots: [{ ...plot, coordinates: { ...(plot.coordinates || {}) } }],
        description: `erase ${plot.plot_identifier}`
    });

    try {
        await supabaseClient
            .from('memorial_spaces')
            .delete()
            .eq('id', plot.id);
    } catch (err) {
        console.warn('Deleted locally:', err);
    }

    currentPlotsList = currentPlotsList.filter(p => p.id !== plot.id);
    if (activePlotId === plot.id) activePlotId = null;

    const sectionSelect = document.getElementById('editorSectionSelect');
    if (sectionSelect) syncPlotSectionLocalCache(sectionSelect.value, currentPlotsList);

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(activePlotId);

    if (typeof showNotification === 'function') {
        showNotification('Plot Erased', `Removed ${plot.plot_identifier}.`, 'info');
    }
}

async function saveCurrentPlotLayoutToDatabase() {
    const sectionSelect = document.getElementById('editorSectionSelect');
    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';

    syncPlotSectionLocalCache(chosenSection, currentPlotsList);

    if (!currentPlotsList || currentPlotsList.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No Plots to Save', `There are no plots currently placed in ${chosenSection}.`, 'warning');
        }
        return;
    }

    const validCategories = ['Condominium', 'Single Teired', 'Supreme', 'Special Supreme', 'Mausoleum', 'Family Estate Jr.'];

    const payload = currentPlotsList.map(p => ({
        plot_identifier: p.plot_identifier,
        section_name: chosenSection,
        category: validCategories.includes(p.category) ? p.category : 'Supreme',
        status: p.status || 'available',
        price: Number(p.price) || 60000,
        down_payment: Number(p.down_payment) || 10200,
        col_num: p.col_num || 1,
        row_num: p.row_num || 1,
        coordinates: {
            width: (p.coordinates?.col_span || p.coordinates?.width || 1),
            height: (p.coordinates?.row_span || p.coordinates?.height || 1),
            col_span: (p.coordinates?.col_span || p.coordinates?.width || 1),
            row_span: (p.coordinates?.row_span || p.coordinates?.height || 1)
        }
    }));

    try {
        const { data, error } = await supabaseClient
            .from('memorial_spaces')
            .upsert(payload, { onConflict: 'plot_identifier' })
            .select();

        if (error) throw error;

        if (Array.isArray(data) && data.length > 0) {
            const dbMap = new Map(data.map(row => [row.plot_identifier, row]));
            currentPlotsList = currentPlotsList.map(p => {
                const dbRow = dbMap.get(p.plot_identifier);
                return dbRow ? { ...p, id: dbRow.id, coordinates: p.coordinates || dbRow.coordinates } : p;
            });
            syncPlotSectionLocalCache(chosenSection, currentPlotsList);
        }

        const btnSave = document.getElementById('btnSavePlotsDb');
        if (btnSave) {
            const orig = btnSave.innerHTML;
            btnSave.innerHTML = ` Saved ${payload.length} Plots!`;
            setTimeout(() => { btnSave.innerHTML = orig; }, 1800);
        }

        if (typeof showNotification === 'function') {
            showNotification('Plots Saved', `Successfully saved ${payload.length} plots for ${chosenSection} to database!`, 'success');
        }
    } catch (err) {
        console.error('Error saving plots to DB:', err);
        if (typeof showNotification === 'function') {
            showNotification('Save Notice', 'Plots saved to local memory.', 'info');
        }
    }
}

async function clearCurrentSectionPlots() {
    const sectionSelect = document.getElementById('editorSectionSelect');
    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';

    if (!await showConfirmModal({ title: "Clear Plots in Section", message: `Are you sure you want to clear all plots in ${chosenSection}? This cannot be undone.`, confirmText: "Clear All Plots", cancelText: "Cancel", type: "warning", danger: true })) {
        return;
    }

    if (currentPlotsList.length > 0) {
        recordPlotHistory({
            type: 'clear',
            plots: currentPlotsList.map(p => ({ ...p, coordinates: { ...(p.coordinates || {}) } })),
            description: `clear all plots in ${chosenSection}`
        });
    }

    try {
        await supabaseClient
            .from('memorial_spaces')
            .delete()
            .ilike('section_name', `%${chosenSection}%`);
    } catch (err) {
        console.warn('Cleared locally:', err);
    }

    currentPlotsList = [];
    activePlotId = null;
    syncPlotSectionLocalCache(chosenSection, []);

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(null);

    if (typeof showNotification === 'function') {
        showNotification('Section Cleared', `All plots in ${chosenSection} have been removed.`, 'info');
    }
}

function renderPlotQuickList() {
    const list = document.getElementById('plotQuickList');
    if (!list) return;

    let filtered = currentPlotsList;
    if (currentPlotFilter !== 'all') {
        filtered = currentPlotsList.filter(p => p.status === currentPlotFilter);
    }

    list.innerHTML = '';
    filtered.forEach(plot => {
        const row = document.createElement('div');
        row.className = `me-plot-quick-row ${plot.id === activePlotId ? 'active' : ''}`;
        row.innerHTML = `
            <span class="quick-code">${plot.plot_identifier}</span>
            <span class="quick-status-tag tag-${plot.status}">${plot.status}</span>
        `;
        row.addEventListener('click', () => {
            setBuilderTool('select');
            selectPlot(plot.id);
        });
        list.appendChild(row);
    });
}

function selectPlot(id) {
    activePlotId = id;
    const plot = currentPlotsList.find(p => p.id === id);

    // Update active highlight on grid
    document.querySelectorAll('.area-plot-cell').forEach(el => {
        el.classList.toggle('selected', el.dataset.plotId == id);
    });
    document.querySelectorAll('.me-plot-quick-row').forEach(el => {
        el.classList.toggle('active', el.dataset.plotId == id);
    });

    const emptyMsg = document.getElementById('propsEmptyPlot');
    const form = document.getElementById('propsFormPlot');

    if (!plot) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (form) form.style.display = 'none';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (form) form.style.display = 'block';

    setValText('inspPlotCodeBadge', plot.plot_identifier);
    const tag = document.getElementById('inspPlotStatusTag');
    if (tag) {
        tag.textContent = plot.status.toUpperCase();
        tag.className = `plot-status-tag tag-${plot.status}`;
    }

    setVal('inspPlotCode', plot.plot_identifier);
    setVal('inspPlotSection', plot.section_name);
    setVal('inspPlotCategorySelect', plot.category || 'Supreme');
    setVal('inspPlotStatusSelect', plot.status);
    setVal('inspPlotPrice', plot.price || 65000);
    setVal('inspPlotDown', plot.down_payment || 9500);

    const pCol = plot.col_num || 1;
    const pRow = plot.row_num || 1;
    const pW = (plot.coordinates?.col_span || plot.coordinates?.width || 1);
    const pH = (plot.coordinates?.row_span || plot.coordinates?.height || 1);

    setVal('inspPlotCol', pCol);
    setVal('inspPlotRow', pRow);
    setVal('inspPlotWidth', pW);
    setVal('inspPlotHeight', pH);
}

function setQuickStatus(status) {
    const plot = currentPlotsList.find(p => p.id === activePlotId);
    if (!plot) return;

    plot.status = status;
    const statusSelect = document.getElementById('inspPlotStatusSelect');
    if (statusSelect) statusSelect.value = status;

    saveActivePlotChanges();
}

async function cyclePlotStatus(plot) {
    const nextMap = {
        'available': 'reserved',
        'reserved': 'occupied',
        'occupied': 'maintenance',
        'maintenance': 'available'
    };
    plot.status = nextMap[plot.status] || 'available';

    try {
        await supabaseClient
            .from('memorial_spaces')
            .update({ status: plot.status, updated_at: new Date().toISOString() })
            .eq('id', plot.id);
    } catch (err) {
        console.warn('Status cycle saved locally:', err);
    }

    const sectionSelect = document.getElementById('editorSectionSelect');
    if (sectionSelect) syncPlotSectionLocalCache(sectionSelect.value, currentPlotsList);

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    if (activePlotId === plot.id) selectPlot(plot.id);
}

async function saveActivePlotChanges() {
    const plot = currentPlotsList.find(p => p.id === activePlotId);
    if (!plot) return;

    const previousState = { ...plot, coordinates: { ...(plot.coordinates || {}) } };

    plot.status = document.getElementById('inspPlotStatusSelect')?.value || plot.status;
    plot.category = document.getElementById('inspPlotCategorySelect')?.value || plot.category;
    plot.price = parseFloat(document.getElementById('inspPlotPrice')?.value) || plot.price;
    plot.down_payment = parseFloat(document.getElementById('inspPlotDown')?.value) || plot.down_payment;

    plot.col_num = parseInt(document.getElementById('inspPlotCol')?.value) || plot.col_num;
    plot.row_num = parseInt(document.getElementById('inspPlotRow')?.value) || plot.row_num;

    const newW = parseInt(document.getElementById('inspPlotWidth')?.value) || 1;
    const newH = parseInt(document.getElementById('inspPlotHeight')?.value) || 1;

    plot.coordinates = {
        col_span: newW,
        row_span: newH,
        width: newW,
        height: newH
    };

    recordPlotHistory({
        type: 'update',
        plotId: plot.id,
        previousState,
        newState: { ...plot, coordinates: { ...plot.coordinates } },
        description: `edit ${plot.plot_identifier}`
    });

    const sectionSelect = document.getElementById('editorSectionSelect');
    if (sectionSelect) syncPlotSectionLocalCache(sectionSelect.value, currentPlotsList);

    try {
        await supabaseClient
            .from('memorial_spaces')
            .update({
                status: plot.status,
                category: plot.category,
                price: plot.price,
                down_payment: plot.down_payment,
                col_num: plot.col_num,
                row_num: plot.row_num,
                coordinates: plot.coordinates,
                updated_at: new Date().toISOString()
            })
            .eq('id', plot.id);

        if (typeof showNotification === 'function') {
            showNotification('Plot Updated', `Saved changes for ${plot.plot_identifier}`, 'success');
        }
    } catch (err) {
        console.warn('Saved locally:', err);
        if (typeof showNotification === 'function') {
            showNotification('Plot Saved', `Saved changes locally for ${plot.plot_identifier}`, 'info');
        }
    }

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(plot.id);
}

async function deleteActivePlot() {
    const plot = currentPlotsList.find(p => p.id === activePlotId);
    if (!plot) return;

    if (!await showConfirmModal({ title: "Delete Plot Slot", message: `Are you sure you want to permanently delete plot slot "${plot.plot_identifier}"?`, confirmText: "Delete Slot", cancelText: "Cancel", type: "warning", danger: true })) return;

    recordPlotHistory({
        type: 'delete',
        plots: [{ ...plot, coordinates: { ...(plot.coordinates || {}) } }],
        description: `delete ${plot.plot_identifier}`
    });

    try {
        await supabaseClient
            .from('memorial_spaces')
            .delete()
            .eq('id', plot.id);
    } catch (err) {
        console.warn('Deleted locally:', err);
    }

    currentPlotsList = currentPlotsList.filter(p => p.id !== plot.id);
    activePlotId = currentPlotsList[0]?.id || null;

    const sectionSelect = document.getElementById('editorSectionSelect');
    if (sectionSelect) syncPlotSectionLocalCache(sectionSelect.value, currentPlotsList);

    updatePlotKPIs();
    renderAreaBlueprintGrid();
    renderPlotQuickList();
    selectPlot(activePlotId);

    if (typeof showNotification === 'function') {
        showNotification('Plot Deleted', `Removed plot ${plot.plot_identifier}.`, 'info');
    }
}

function setupAddPlotModal() {
    const modal = document.getElementById('addPlotModal');
    const form = document.getElementById('addNewPlotForm');
    const closeBtn = document.getElementById('btnClosePlotModal');
    const cancelBtn = document.getElementById('btnCancelAddPlot');

    if (closeBtn) closeBtn.addEventListener('click', closeAddPlotModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAddPlotModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAddPlotModal();
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const section = document.getElementById('newPlotSectionInput')?.value || 'Area 2 - Lawn of Love';
            const code = document.getElementById('newPlotCodeInput')?.value.trim();
            const category = document.getElementById('newPlotCategorySelect')?.value || 'Supreme';
            const price = parseFloat(document.getElementById('newPlotPriceInput')?.value) || 65000;
            const down = parseFloat(document.getElementById('newPlotDownInput')?.value) || 9500;

            if (!code) return;

            const spec = CATEGORY_DEFAULT_SPECS[category] || { w: 1, h: 2 };

            const newSlot = {
                id: `plot-${Date.now()}`,
                plot_identifier: code,
                section_name: section,
                category: category,
                status: 'available',
                price: price,
                down_payment: down,
                col_num: 1,
                row_num: 1,
                coordinates: {
                    col_span: spec.w,
                    row_span: spec.h,
                    width: spec.w,
                    height: spec.h
                }
            };

            try {
                const { data, error } = await supabaseClient
                    .from('memorial_spaces')
                    .insert([{
                        plot_identifier: newSlot.plot_identifier,
                        section_name: newSlot.section_name,
                        category: newSlot.category,
                        status: newSlot.status,
                        price: newSlot.price,
                        down_payment: newSlot.down_payment,
                        col_num: newSlot.col_num,
                        row_num: newSlot.row_num,
                        coordinates: newSlot.coordinates
                    }])
                    .select();

                if (!error && data && data[0]) {
                    newSlot.id = data[0].id;
                }
            } catch (err) {
                console.warn('Inserted to local list:', err);
            }

            currentPlotsList.push(newSlot);
            activePlotId = newSlot.id;
            updatePlotKPIs();
            renderAreaBlueprintGrid();
            renderPlotQuickList();
            selectPlot(newSlot.id);
            closeAddPlotModal();

            if (typeof showNotification === 'function') {
                showNotification('Plot Added', `Successfully added plot ${code}!`, 'success');
            }
        });
    }
}

function openAddPlotModal() {
    setBuilderTool('place');
}

function closeAddPlotModal() {
    const modal = document.getElementById('addPlotModal');
    if (modal) modal.classList.remove('open');
}

// ==============================================================================
// 3. BOUNDLESS 2D CANVAS PAN & ZOOM SYSTEM (ZERO DEAD SPACE)
// ==============================================================================
function initZoomControls() {
    const btnIn = document.getElementById('btnZoomIn');
    const btnOut = document.getElementById('btnZoomOut');
    const btnFit = document.getElementById('btnZoomFit');
    const btnCenter = document.getElementById('btnZoomCenter');
    const slider = document.getElementById('zoomSlider');

    if (btnIn) btnIn.addEventListener('click', () => applyZoom(currentZoom + 0.15));
    if (btnOut) btnOut.addEventListener('click', () => applyZoom(currentZoom - 0.15));
    if (btnFit) btnFit.addEventListener('click', autoFitCanvas);
    if (btnCenter) btnCenter.addEventListener('click', centerCanvas);

    if (slider) {
        slider.addEventListener('input', (e) => {
            applyZoom(e.target.value / 100);
        });
    }

    // Initialize 2D Canvas Drag-to-Pan and Wheel handlers
    initCanvasPanHandlers();

    // Sidebar collapse toggles
    setupPanelCollapseToggles();
}

function initCanvasPanHandlers() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    // Track Spacebar
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            if (!spacebarPressed) {
                spacebarPressed = true;
                if (currentMode === 'map') {
                    viewport.classList.add('space-pan-active');
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spacebarPressed = false;
            viewport.classList.remove('space-pan-active');
        }
    });

    // Mousedown on canvas viewport to pan
    viewport.addEventListener('mousedown', (e) => {
        if (currentMode !== 'map') return;

        const isMiddleClick = e.button === 1;
        const isLeftClick = e.button === 0;
        const hitVector = e.target.closest('.me-vec-element');
        const hitUnlockedBp = blueprintConfig.unlocked && e.target.id === 'blueprintImg';

        // Pan if middle click, spacebar held, OR clicking on empty canvas/stage/locked blueprint
        if (isMiddleClick || spacebarPressed || (isLeftClick && !hitVector && !hitUnlockedBp)) {
            e.preventDefault();
            isPanning = true;
            panHasMoved = false;
            panStartX = e.clientX;
            panStartY = e.clientY;
            origPanX = panX;
            origPanY = panY;
            viewport.classList.add('panning');

            const onPanMove = (moveEvt) => {
                if (!isPanning) return;
                const dx = moveEvt.clientX - panStartX;
                const dy = moveEvt.clientY - panStartY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    panHasMoved = true;
                }
                panX = origPanX + dx;
                panY = origPanY + dy;
                applyCanvasTransform();
            };

            const onPanUp = () => {
                isPanning = false;
                viewport.classList.remove('panning');
                window.removeEventListener('mousemove', onPanMove);
                window.removeEventListener('mouseup', onPanUp);

                // Deselect active vector or blueprint only if pure click without panning
                if (!panHasMoved && isLeftClick && !hitVector && !hitUnlockedBp) {
                    deselectAll();
                }
            };

            window.addEventListener('mousemove', onPanMove);
            window.addEventListener('mouseup', onPanUp);
        }
    });

    // Mouse wheel (Ctrl+wheel zooms toward cursor, regular wheel pans in 2D)
    viewport.addEventListener('wheel', (e) => {
        if (currentMode !== 'map') return;
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            const zoomDelta = e.deltaY < 0 ? 1.12 : 0.89;
            applyZoom(currentZoom * zoomDelta, e.clientX, e.clientY);
        } else {
            panX -= e.deltaX;
            panY -= e.deltaY;
            applyCanvasTransform();
        }
    }, { passive: false });
}

function setupPanelCollapseToggles() {
    const btnCollapseLeft = document.getElementById('btnToggleCollapseLeft');
    const btnCollapseLeftPlot = document.getElementById('btnToggleCollapseLeftPlot');
    const btnCollapseRight = document.getElementById('btnToggleCollapseRight');
    const panelLeft = document.getElementById('panelLeft');
    const panelRight = document.getElementById('panelRight');

    const toggleLeft = () => {
        if (!panelLeft) return;
        panelLeft.classList.toggle('collapsed');
        const isCollapsed = panelLeft.classList.contains('collapsed');
        if (btnCollapseLeft) btnCollapseLeft.textContent = isCollapsed ? '▶' : '◀';
        if (btnCollapseLeftPlot) btnCollapseLeftPlot.textContent = isCollapsed ? '▶' : '◀';
        setTimeout(autoFitCanvas, 220);
    };

    const toggleRight = () => {
        if (!panelRight) return;
        panelRight.classList.toggle('collapsed');
        const isCollapsed = panelRight.classList.contains('collapsed');
        if (btnCollapseRight) btnCollapseRight.textContent = isCollapsed ? '◀' : '▶';
        setTimeout(autoFitCanvas, 220);
    };

    if (btnCollapseLeft) btnCollapseLeft.addEventListener('click', toggleLeft);
    if (btnCollapseLeftPlot) btnCollapseLeftPlot.addEventListener('click', toggleLeft);
    if (btnCollapseRight) btnCollapseRight.addEventListener('click', toggleRight);
}

function applyZoom(newZoom, originX = null, originY = null) {
    newZoom = Math.max(0.20, Math.min(3.0, newZoom));
    if (Math.abs(newZoom - currentZoom) < 0.001) return;

    const viewport = document.getElementById('viewport');
    if (viewport && originX !== null && originY !== null) {
        const rect = viewport.getBoundingClientRect();
        const cx = originX - rect.left - rect.width / 2;
        const cy = originY - rect.top - rect.height / 2;

        panX = cx - (cx - panX) * (newZoom / currentZoom);
        panY = cy - (cy - panY) * (newZoom / currentZoom);
    } else {
        panX = panX * (newZoom / currentZoom);
        panY = panY * (newZoom / currentZoom);
    }

    currentZoom = newZoom;
    applyCanvasTransform();
}

function applyCanvasTransform() {
    const stage = document.getElementById('viewportStage');
    const viewport = document.getElementById('viewport');
    const label = document.getElementById('zoomLabel');
    const slider = document.getElementById('zoomSlider');

    if (stage) {
        stage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    }

    if (viewport) {
        // Move & scale background dots in sync with canvas
        const dotSize = 24 * currentZoom;
        const rect = viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = ((centerX + panX) % dotSize + dotSize) % dotSize;
        const offsetY = ((centerY + panY) % dotSize + dotSize) % dotSize;
        viewport.style.backgroundSize = `${dotSize}px ${dotSize}px`;
        viewport.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    }

    if (label) label.textContent = `${Math.round(currentZoom * 100)}%`;
    if (slider) slider.value = Math.round(currentZoom * 100);
}

function centerCanvas() {
    panX = 0;
    panY = 0;
    applyCanvasTransform();
}

function autoFitCanvas() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    panX = 0;
    panY = 0;

    const rect = viewport.getBoundingClientRect();
    const availableW = rect.width - 60;
    const availableH = rect.height - 60;

    if (availableW < 200 || availableH < 200) {
        applyZoom(1.0);
        return;
    }

    const scaleW = availableW / BOARD_WIDTH;
    const scaleH = availableH / BOARD_HEIGHT;
    let fitScale = Math.min(scaleW, scaleH);
    fitScale = Math.max(0.35, Math.min(fitScale, 1.8));

    currentZoom = fitScale;
    applyCanvasTransform();
}

// ==============================================================================
// 4. KEYBOARD SHORTCUTS
// ==============================================================================
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        // Ignore typing in input fields
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

        // ── PLOT MODE SHORTCUTS ──
        if (currentMode === 'plots') {
            // Undo: Ctrl+Z / Cmd+Z
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoPlotAction();
                return;
            }

            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
                e.preventDefault();
                redoPlotAction();
                return;
            }

            // Delete selected plot: Delete / Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && activePlotId) {
                e.preventDefault();
                const plot = currentPlotsList.find(p => p.id === activePlotId);
                if (plot) {
                    deletePlotDirectly(plot);
                }
                return;
            }

            // Tool switching: 1 or 'v' (Select), 2 or 'p' (Place), 3 or 'e' (Erase)
            if (e.key === '1' || e.key.toLowerCase() === 'v') {
                e.preventDefault();
                setBuilderTool('select');
                return;
            }
            if (e.key === '2' || e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setBuilderTool('place');
                return;
            }
            if (e.key === '3' || e.key.toLowerCase() === 'e') {
                e.preventDefault();
                setBuilderTool('erase');
                return;
            }

            // Deselect with Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                selectPlot(null);
                setBuilderTool('select');
                return;
            }

            // Arrow key nudge for selected plot
            if (activePlotId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const plot = currentPlotsList.find(p => p.id === activePlotId);
                if (plot) {
                    const sectionSelect = document.getElementById('editorSectionSelect');
                    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
                    const shapeInfo = SECTION_SHAPE_MAP[chosenSection] || { cols: 23, rows: 28 };
                    const totalCols = shapeInfo.cols || 23;
                    const totalRows = shapeInfo.rows || 28;

                    let newCol = plot.col_num || 1;
                    let newRow = plot.row_num || 1;
                    const w = (plot.coordinates?.col_span || plot.coordinates?.width || 1);
                    const h = (plot.coordinates?.row_span || plot.coordinates?.height || 1);

                    if (e.key === 'ArrowLeft')  newCol = Math.max(1, newCol - 1);
                    if (e.key === 'ArrowRight') newCol = Math.min(totalCols - w + 1, newCol + 1);
                    if (e.key === 'ArrowUp')    newRow = Math.max(1, newRow - 1);
                    if (e.key === 'ArrowDown')  newRow = Math.min(totalRows - h + 1, newRow + 1);

                    if (!checkPlotCollision(newCol, newRow, w, h, plot.id) && isPlotInsideLawn(newCol, newRow, w, h, totalCols, totalRows)) {
                        recordPlotHistory({
                            type: 'update',
                            plotId: plot.id,
                            previousState: { ...plot },
                            newState: { ...plot, col_num: newCol, row_num: newRow },
                            description: `move ${plot.plot_identifier}`
                        });
                        plot.col_num = newCol;
                        plot.row_num = newRow;
                        setVal('inspPlotCol', newCol);
                        setVal('inspPlotRow', newRow);
                        renderAreaBlueprintGrid();
                        selectPlot(plot.id);
                    }
                }
                return;
            }
        }

        // Spacebar panning handled in initCanvasPanHandlers

        // Center canvas with Home or '0'
        if (e.key === 'Home' || e.key === '0') {
            e.preventDefault();
            centerCanvas();
            return;
        }

        // Fit canvas with 'f' or 'F'
        if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            autoFitCanvas();
            return;
        }

        // Select All visible layers with Ctrl+A / Cmd+A
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && currentMode === 'map') {
            e.preventDefault();
            selectedVectorIds = new Set(vectorLayers.filter(l => l.visible).map(l => l.id));
            activeVectorId = Array.from(selectedVectorIds)[0] || null;
            activeSelectionType = 'vector';
            syncSelectionUI();
            updateVectorInspector();
            return;
        }

        // Quick Action: Rotate Left Counter-Clockwise with 'k' / 'K'
        if (e.key.toLowerCase() === 'k' && currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
            e.preventDefault();
            quickRotateSelected(e.shiftKey ? -15 : -5, true);
            return;
        }

        // Quick Action: Rotate Right Clockwise with 'l' / 'L'
        if (e.key.toLowerCase() === 'l' && currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
            e.preventDefault();
            quickRotateSelected(e.shiftKey ? 15 : 5, true);
            return;
        }

        // Quick Action: Scale / Size (+) with '+' or '='
        if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
            e.preventDefault();
            if (currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
                quickResizeSelected(e.shiftKey ? 2.0 : 0.5);
                return;
            }
            applyZoom(currentZoom + 0.15);
            return;
        }

        // Quick Action: Scale / Size (-) with '-' or '_'
        if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
            e.preventDefault();
            if (currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
                quickResizeSelected(e.shiftKey ? -2.0 : -0.5);
                return;
            }
            applyZoom(currentZoom - 0.15);
            return;
        }

        // Deselect with Escape
        if (e.key === 'Escape') {
            deselectAll();
            return;
        }

        // Arrow key nudge for Blueprint Reference
        if (currentMode === 'map' && activeSelectionType === 'blueprint') {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 2;
                if (e.key === 'ArrowLeft')  blueprintConfig.x -= step;
                if (e.key === 'ArrowRight') blueprintConfig.x += step;
                if (e.key === 'ArrowUp')    blueprintConfig.y -= step;
                if (e.key === 'ArrowDown')  blueprintConfig.y += step;

                const bp = document.getElementById('blueprintImg');
                if (bp) {
                    bp.style.setProperty('--bp-x', `${blueprintConfig.x}px`);
                    bp.style.setProperty('--bp-y', `${blueprintConfig.y}px`);
                }
                setVal('bpRefOffsetX', blueprintConfig.x);
                setVal('bpRefOffsetY', blueprintConfig.y);
                updateSidebarBlueprintMeta();
                saveBlueprintConfig();
                return;
            }
        }

        // Arrow key nudge for Background Image
        if (currentMode === 'map' && activeSelectionType === 'bg') {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 2;
                if (e.key === 'ArrowLeft')  bgConfig.x -= step;
                if (e.key === 'ArrowRight') bgConfig.x += step;
                if (e.key === 'ArrowUp')    bgConfig.y -= step;
                if (e.key === 'ArrowDown')  bgConfig.y += step;

                const bgEl = document.getElementById('mapBgImg');
                if (bgEl) {
                    bgEl.style.setProperty('--bg-x', `${bgConfig.x}px`);
                    bgEl.style.setProperty('--bg-y', `${bgConfig.y}px`);
                }
                setVal('bgOffsetX', bgConfig.x);
                setVal('bgOffsetY', bgConfig.y);
                updateSidebarBgMeta();
                saveBgConfig();
                publishBgToDashboard();
                return;
            }
        }

        // Delete active vector(s) in map mode
        if (currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelectedVectors();
                return;
            }

            // Arrow key nudge for all selected vectors
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 2.0 : 0.5;
                if (selectedVectorIds.size === 0 && activeVectorId) {
                    selectedVectorIds.add(activeVectorId);
                }
                selectedVectorIds.forEach(id => {
                    const v = vectorLayers.find(l => l.id === id);
                    if (!v || !v.visible) return;
                    if (e.key === 'ArrowLeft')  v.left = parseFloat((v.left - step).toFixed(1));
                    if (e.key === 'ArrowRight') v.left = parseFloat((v.left + step).toFixed(1));
                    if (e.key === 'ArrowUp')    v.top  = parseFloat((v.top - step).toFixed(1));
                    if (e.key === 'ArrowDown')  v.top  = parseFloat((v.top + step).toFixed(1));

                    const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
                    if (targetEl) {
                        targetEl.style.left = `${v.left}%`;
                        targetEl.style.top  = `${v.top}%`;
                    }
                });

                renderLayerSidebar();
                updateVectorInspector();
                localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
                return;
            }
        }

        // Ctrl + S: Save layout or plots
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            if (currentMode === 'map') {
                saveVectorLayout();
            } else {
                saveCurrentPlotLayoutToDatabase();
            }
        }
    });

    // Window resize auto-fit
    window.addEventListener('resize', () => {
        if (currentMode === 'map') {
            autoFitCanvas();
        }
    });
}

// ── Helpers ──
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function setValText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

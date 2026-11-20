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
};

const VECTOR_CATALOG = [
    { special: 'entrance', name: 'Entrance Gate', desc: 'Main gate - snaps onto the automatic perimeter fence', defaultW: 12, defaultZ: 9 },
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
    src: '',
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

// ── Perimeter Fence & Polygon Point-Edit State ──
const DEFAULT_FENCE_CONFIG = { mode: 'auto', points: [] };
let fenceConfig = { ...DEFAULT_FENCE_CONFIG };
let pointEditState = null; // null | { mode: 'wall' } | { mode: 'shape', layerId: string }
let isDraggingVertex = false;

// Map Vector Undo / Redo & Clipboard State
let mapUndoStack = [];
let mapRedoStack = [];
let mapUndoLastCoalesceKey = '';
let mapUndoLastCoalesceAt = 0;
let mapClipboard = [];
let mapPasteCounter = 0;
const MAX_MAP_HISTORY = 40;

// Plot State
let currentPlotsList = [];
let activePlotId = null;
let currentPlotFilter = 'all';

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initModeTabs();
    initNewAreaSystem();
    initMapPartSystem();
    initVectorSystem();
    initFenceSystem();
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
        if (hint) hint.innerHTML = '<strong>Shortcuts:</strong> <strong>[Ctrl+Z/Y]</strong> Undo/Redo · <strong>[Ctrl+C/X/V]</strong> Copy/Cut/Paste · <strong>[Ctrl+D]</strong> Dup · <strong>[Del]</strong> Del · <strong>[H]</strong> Hide · <strong>[Ctrl+S]</strong> Save';

        renderVectorMap();
        renderLayerSidebar();
        updateVectorInspector();
        updateWallPointsInspector();
        renderPointOverlay();
        applyCanvasTransform();
    } else {
        pointEditState = null;
        renderPointOverlay();
        updateWallPointsInspector();
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
const ME_ICONS = {
    eye: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>'
};

function focusVectorInspector() {
    const inspector = document.getElementById('inspectorMapMode');
    if (inspector && inspector.scrollTop > 0) {
        inspector.scrollTop = 0;
    }
}

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

    const btnUndoMap = document.getElementById('btnUndoMap');
    if (btnUndoMap) btnUndoMap.addEventListener('click', undoMapAction);

    const btnRedoMap = document.getElementById('btnRedoMap');
    if (btnRedoMap) btnRedoMap.addEventListener('click', redoMapAction);

    const btnShowShortcuts = document.getElementById('btnShowShortcuts');
    if (btnShowShortcuts) btnShowShortcuts.addEventListener('click', openShortcutsModal);

    const btnCloseShortcuts = document.getElementById('btnCloseShortcutsModal');
    if (btnCloseShortcuts) btnCloseShortcuts.addEventListener('click', closeShortcutsModal);

    const shortcutsModal = document.getElementById('shortcutsModal');
    if (shortcutsModal) {
        shortcutsModal.addEventListener('click', (e) => {
            if (e.target === shortcutsModal) closeShortcutsModal();
        });
    }

    updateMapHistoryButtons();

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
        quickDragBtn.innerHTML = blueprintConfig.unlocked
            ? `${ME_ICONS.unlock} <span>Ref Movable</span>`
            : `${ME_ICONS.lock} <span>Ref Locked</span>`;
        quickDragBtn.title = blueprintConfig.unlocked ? 'Reference image is movable (Click to lock)' : 'Reference image is locked (Click to unlock)';
    }

    const sidebarLockBtn = document.getElementById('sidebarBpLockBtn');
    if (sidebarLockBtn) {
        sidebarLockBtn.innerHTML = blueprintConfig.unlocked ? ME_ICONS.unlock : ME_ICONS.lock;
        sidebarLockBtn.title = blueprintConfig.unlocked ? 'Movable: Click to lock' : 'Locked: Click to unlock';
    }

    const sidebarVisBtn = document.getElementById('sidebarBpVisBtn');
    if (sidebarVisBtn) {
        sidebarVisBtn.innerHTML = blueprintConfig.visible ? ME_ICONS.eye : ME_ICONS.eyeOff;
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
            sanitizeBgConfig();
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
        visBtn.innerHTML = bgConfig.visible ? ME_ICONS.eye : ME_ICONS.eyeOff;
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
    if (v.kind === 'decor' && window.ZMGFence) {
        const aspect = (v.shapeAspect && Number(v.shapeAspect) > 0) ? Number(v.shapeAspect) : 1;
        v.area = null;
        v.custom = false;
        v.shapeAspect = parseFloat(aspect.toFixed(4));
        v.points = ZMGFence.sanitizePolygonPoints(v.points, 3) || ZMGFence.defaultShapePoints(4, aspect);
        v.fill = v.fill || '#f3ecd8';
        v.stroke = v.stroke || '#2f332e';
        v.strokeWidth = (v.strokeWidth !== undefined && Number.isFinite(Number(v.strokeWidth)))
            ? Number(v.strokeWidth)
            : 2.5;
        v.dashed = !!v.dashed;
        v.fenceExclude = !!v.fenceExclude;
        v.fenceInclude = !v.fenceExclude;
        v.label = String(v.label || '');
        v.src = ZMGFence.buildPartSvgDataUrl(v);
    } else if (v.custom && v.preserveCustomSrc) {
        delete v.points;
    } else if (v.custom && window.ZMGFence) {
        const cols = Number(v.cols) || 20;
        const rows = Number(v.rows) || 20;
        const aspect = (v.shapeAspect && Number(v.shapeAspect) > 0)
            ? Number(v.shapeAspect)
            : (rows / Math.max(1, cols));
        v.shapeAspect = parseFloat(aspect.toFixed(4));
        const pts = ZMGFence.sanitizePolygonPoints(v.points, 3) || ZMGFence.defaultShapePoints(4, aspect);
        v.points = pts;
        v.src = ZMGFence.buildAreaSvgDataUrl(cols, rows, v.area, pts, aspect);
    }
    return v;
}

const ZMG_DB_MAP_CONFIG_ID = 'ZMG-MAP-VECTOR-LAYOUT-CONFIG';

function loadSavedVectors() {
    if (window.ZMGFence) {
        fenceConfig = ZMGFence.readStoredFenceConfig();
    }
    try {
        const saved = localStorage.getItem(MAP_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                vectorLayers = parsed
                    .filter(v => v && !isLegacyWallLayer(v))
                    .map(v => normalizeEditorVector({ visible: true, ...v }));
                if (vectorLayers.length > 0) {
                    activeVectorId = vectorLayers[0]?.id || null;
                    selectedVectorIds = activeVectorId ? new Set([activeVectorId]) : new Set();
                    finalizeLoadedVectors(false);
                    resetMapUndoHistory();
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
    finalizeLoadedVectors(false);
    resetMapUndoHistory();
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
                .filter(v => v && !isLegacyWallLayer(v))
                .map(v => normalizeEditorVector({ visible: true, ...v }));
            finalizeLoadedVectors(!!row.coordinates.entranceSeeded);
            localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));

            if (row.coordinates.bgConfig) {
                bgConfig = { ...DEFAULT_BG_CONFIG, ...row.coordinates.bgConfig };
                sanitizeBgConfig();
                saveBgConfig();
                applyBgConfig();
                publishBgToDashboard();
            }
            if (row.coordinates.blueprintConfig) {
                blueprintConfig = { ...DEFAULT_BLUEPRINT_CONFIG, ...row.coordinates.blueprintConfig };
                saveBlueprintConfig();
                applyBlueprintConfig();
            }
            if (row.coordinates.fenceConfig && window.ZMGFence) {
                fenceConfig = ZMGFence.writeStoredFenceConfig(row.coordinates.fenceConfig);
            }
            renderVectorMap();
            renderLayerSidebar();
            updateVectorInspector();
            updateWallPointsInspector();
            renderPointOverlay();
            resetMapUndoHistory();
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
                    fenceConfig,
                    entranceSeeded: !!localStorage.getItem(ENTRANCE_SEEDED_KEY),
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
    const beforeSnap = captureMapSnapshot('reset layout');
    localStorage.removeItem(MAP_STORAGE_KEY);
    const keptCustomAreas = vectorLayers.filter(v => v.custom);
    vectorLayers = JSON.parse(JSON.stringify(DEFAULT_VECTORS)).concat(keptCustomAreas);
    localStorage.removeItem(ENTRANCE_SEEDED_KEY);
    fenceConfig = window.ZMGFence
        ? ZMGFence.writeStoredFenceConfig({ ...DEFAULT_FENCE_CONFIG })
        : { ...DEFAULT_FENCE_CONFIG };
    pointEditState = null;
    finalizeLoadedVectors(false);
    activeVectorId = vectorLayers[0]?.id || null;
    selectedVectorIds = activeVectorId ? new Set([activeVectorId]) : new Set();
    commitMapUndo(beforeSnap, 'reset layout');
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    updateWallPointsInspector();
    renderPointOverlay();
    if (typeof showNotification === 'function') {
        showNotification('Layout Reset', 'Restored default vector coordinates and auto-fit perimeter fence.', 'info');
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
        img.addEventListener('load', scheduleFence);
        if (v.area) {
            img.dataset.areaId = String(v.area);
            img.title = `${v.name} - double-click to edit its plots`;
            img.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                openAreaInPlotEditor(v);
            });
        } else if (v.kind === 'decor') {
            img.dataset.partId = String(v.id);
            img.title = `${v.name} - double-click to edit shape & style`;
            img.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                openEditPartModal(v.id);
            });
        }

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

    scheduleFence();
    renderPointOverlay();
    updateWallPointsInspector();
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

        item.classList.toggle('layer-hidden', !v.visible);
        item.innerHTML = `
            <div class="me-layer-thumb">
                <img src="${v.src}" alt="${v.name}">
            </div>
            <div class="me-layer-meta">
                <span class="me-layer-name">${v.name}${!v.visible ? '<span class="me-hidden-pill">Hidden</span>' : ''}</span>
                <span class="me-layer-sub">${Math.round(v.left)}%, ${Math.round(v.top)}% · ${Math.round(v.width)}% w</span>
            </div>
            <div class="me-layer-actions">
                <button type="button" class="me-action-icon-btn btn-vis" title="${v.visible ? 'Hide Layer' : 'Show Layer'}">
                    ${v.visible ? ME_ICONS.eye : ME_ICONS.eyeOff}
                </button>
                <button type="button" class="me-action-icon-btn btn-trash" title="Delete Vector Layer">
                    ${ME_ICONS.trash}
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
                toggleVectorVisibility([v.id]);
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

    const modeDetail = document.getElementById('activeModeDetail');
    if (modeDetail && currentMode === 'map') {
        modeDetail.textContent = `${vectorLayers.length} Vectors Loaded · Boundless Canvas`;
    }
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
    if (pointEditState && pointEditState.mode === 'shape') {
        pointEditState = null;
    }

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
    renderPointOverlay();
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
    if (pointEditState && pointEditState.mode === 'shape' && pointEditState.layerId !== activeVectorId) {
        pointEditState = null;
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
    focusVectorInspector();
    renderPointOverlay();
}

function selectVector(id, isMulti = false) {
    if (isMulti) {
        toggleSelectVector(id);
        return;
    }
    activeSelectionType = 'vector';
    activeVectorId = id;
    selectedVectorIds = new Set([id]);
    if (pointEditState && pointEditState.mode === 'shape' && pointEditState.layerId !== id) {
        pointEditState = null;
    }

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
    focusVectorInspector();
    renderPointOverlay();
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
        beforeSnapshot: captureMapSnapshot('move layer'),
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
    if (!currentVector || currentVector.id === 'group-109' || currentVector.kind === 'entrance') return null;
    const w1 = Number(currentVector.width) || 15;
    const h1 = w1 * 1.1; // proportional height
    const r1 = {
        left: candidateLeft,
        top: candidateTop,
        right: candidateLeft + w1,
        bottom: candidateTop + h1
    };

    for (const other of vectorLayers) {
        if (!other.visible || other.id === currentVector.id || other.id === 'group-109' || other.kind === 'entrance') continue;
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
    if (pointEditState) {
        renderPointOverlay();
    }
}

function onVectorDragEnd() {
    if (!isDraggingVector) return;
    isDraggingVector = false;
    let beforeSnap = null;

    if (dragContext) {
        beforeSnap = dragContext.beforeSnapshot || null;
        dragContext.vectors.forEach(item => {
            const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${item.id}"]`);
            if (targetEl) {
                targetEl.classList.remove('dragging');
                targetEl.classList.remove('me-vec-overlap');
            }
        });
        dragContext.vectors.forEach(item => {
            const dragged = vectorLayers.find(l => l.id === item.id);
            if (dragged && dragged.kind === 'entrance') snapEntranceLayer(dragged);
        });
        dragContext = null;
    }

    window.removeEventListener('mousemove', onVectorDragMove);
    window.removeEventListener('mouseup', onVectorDragEnd);

    if (beforeSnap) commitMapUndo(beforeSnap, 'move layer');
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();
}

// ── Quick Actions: Resize & Rotate Multi-Select ──
function quickResizeSelected(delta) {
    if (selectedVectorIds.size === 0 && activeVectorId) {
        selectedVectorIds.add(activeVectorId);
    }
    if (selectedVectorIds.size === 0) return;

    const beforeSnap = captureMapSnapshot('resize layer');
    selectedVectorIds.forEach(id => {
        const v = vectorLayers.find(layer => layer.id === id);
        if (!v) return;
        const currentW = Number(v.width) || 15;
        const newW = parseFloat(Math.max(2, Math.min(150, currentW + delta)).toFixed(1));
        v.width = newW;

        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
        if (targetEl) targetEl.style.width = `${v.width}%`;
    });

    commitMapUndo(beforeSnap, 'resize layer', 'quick-resize');
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
}

function quickRotateSelected(deg, isDelta = true) {
    if (selectedVectorIds.size === 0 && activeVectorId) {
        selectedVectorIds.add(activeVectorId);
    }
    if (selectedVectorIds.size === 0) return;

    const beforeSnap = captureMapSnapshot('rotate layer');
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

    commitMapUndo(beforeSnap, 'rotate layer', isDelta ? 'quick-rotate' : null);
    updateVectorInspector();
    renderPointOverlay();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
}

async function deleteSelectedVectors() {
    if (selectedVectorIds.size === 0) return;
    const count = selectedVectorIds.size;
    if (count === 1) {
        deleteVector(Array.from(selectedVectorIds)[0]);
        return;
    }
    const selectedCustom = vectorLayers.filter(l => selectedVectorIds.has(l.id) && l.custom);
    if (selectedCustom.length > 0) {
        if (typeof showNotification === 'function') {
            showNotification('Custom Areas Selected', 'Custom cemetery areas must be deleted one at a time so their plots can be checked first.', 'warning');
        }
        return;
    }
    if (!await showConfirmModal({ title: "Delete Vector Layers", message: `Delete all ${count} selected vector layers?`, confirmText: "Delete Layers", cancelText: "Cancel", type: "warning", danger: true })) return;

    const beforeSnap = captureMapSnapshot('delete layers');
    vectorLayers = vectorLayers.filter(l => !selectedVectorIds.has(l.id));
    commitMapUndo(beforeSnap, 'delete layers');
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

        let pendingSnap = null;
        const ensurePending = () => {
            if (!pendingSnap) pendingSnap = captureMapSnapshot(`edit ${propKey}`);
        };
        el.addEventListener('focus', ensurePending);
        el.addEventListener('pointerdown', ensurePending);

        const updateFn = (val, isCommit = false) => {
            const v = vectorLayers.find(l => l.id === activeVectorId);
            if (!v) return;
            if (propKey === 'name' && v.custom) return;

            let parsed = isNumeric ? parseFloat(val) : val;
            if (isNumeric && isNaN(parsed)) return;
            if (transform) parsed = transform(parsed);

            const beforeSnap = pendingSnap || captureMapSnapshot(`edit ${propKey}`);
            if (!pendingSnap && !isCommit) pendingSnap = beforeSnap;

            if (selectedVectorIds.size > 1 && (propKey === 'width' || propKey === 'rotate' || propKey === 'opacity' || propKey === 'zIndex')) {
                const oldVal = v[propKey] || 0;
                const delta = parsed - oldVal;
                selectedVectorIds.forEach(sid => {
                    const layer = vectorLayers.find(l => l.id === sid);
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

            commitMapUndo(beforeSnap, `edit ${propKey}`, `insp-${propKey}`);
            if (isCommit) pendingSnap = null;

            renderVectorMap();
            renderLayerSidebar();
            renderPointOverlay();
            localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
        };

        el.addEventListener('input', (e) => updateFn(e.target.value, false));
        el.addEventListener('change', (e) => updateFn(e.target.value, true));
        el.addEventListener('blur', () => { pendingSnap = null; });
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

    // Live Custom Part appearance controls (Fill, Border, Width, Dashed, Label, Fence wrap)
    const bindPartField = (id, eventName, mutator, labelText, coalescePrefix) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener(eventName, () => {
            const v = vectorLayers.find(l => l.id === activeVectorId);
            if (!v || v.kind !== 'decor') return;
            const beforeSnap = captureMapSnapshot(labelText);
            mutator(v, el);
            rebuildCustomShapeSvgAndSync(v);
            const img = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
            if (img) img.src = v.src;
            if (v.label !== undefined && id === 'inspPartLabel') {
                v.desc = v.label ? `${v.name} (${v.label})` : `${v.name} map structure`;
            }
            commitMapUndo(beforeSnap, labelText, coalescePrefix ? `${coalescePrefix}:${v.id}` : null);
            if (typeof scheduleFence === 'function') scheduleFence();
            localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
        });
    };
    bindPartField('inspPartLabel', 'input', (v, el) => { v.label = el.value.slice(0, 24); }, 'part label', 'part-label');
    bindPartField('inspPartFill', 'input', (v, el) => { v.fill = el.value; }, 'part fill', 'part-fill');
    bindPartField('inspPartStroke', 'input', (v, el) => { v.stroke = el.value; }, 'part border', 'part-stroke');
    bindPartField('inspPartStrokeW', 'input', (v, el) => {
        const sw = parseFloat(el.value);
        v.strokeWidth = Number.isFinite(sw) ? Math.max(0, Math.min(12, sw)) : 2.5;
    }, 'part border width', 'part-sw');
    bindPartField('inspPartDashed', 'change', (v, el) => { v.dashed = !!el.checked; }, 'part outline style', null);
    bindPartField('inspPartFenceInclude', 'change', (v, el) => {
        v.fenceInclude = !!el.checked;
        v.fenceExclude = !el.checked;
    }, 'part fence inclusion', null);

    // Directional Nudge Pad (applies to all selected vectors)
    const setupNudge = (btnId, dx, dy) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                if (selectedVectorIds.size === 0 && activeVectorId) {
                    selectedVectorIds.add(activeVectorId);
                }
                if (selectedVectorIds.size === 0) return;
                const beforeSnap = captureMapSnapshot('nudge layer');
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
                commitMapUndo(beforeSnap, 'nudge layer', 'btn-nudge');
                renderLayerSidebar();
                updateVectorInspector();
                renderPointOverlay();
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
    if (btnBringFwd) btnBringFwd.addEventListener('click', () => reorderSelectedVectors('forward'));

    const btnSendBack = document.getElementById('btnSendBack');
    if (btnSendBack) btnSendBack.addEventListener('click', () => reorderSelectedVectors('backward'));

    const btnShowHidden = document.getElementById('btnShowHiddenLayer');
    if (btnShowHidden) btnShowHidden.addEventListener('click', () => toggleVectorVisibility(null, true));

    const btnInspectorVis = document.getElementById('btnInspectorToggleVis');
    if (btnInspectorVis) btnInspectorVis.addEventListener('click', () => toggleVectorVisibility(null, null));

    const btnEditFromName = document.getElementById('btnEditCustomAreaFromName');
    if (btnEditFromName) {
        btnEditFromName.addEventListener('click', () => {
            if (activeVectorId) openEditAreaModal(activeVectorId);
        });
    }

    const btnConvertArea = document.getElementById('btnConvertLayerToArea');
    if (btnConvertArea) {
        btnConvertArea.addEventListener('click', () => {
            const ids = selectedVectorIds.size > 1
                ? Array.from(selectedVectorIds)
                : (activeVectorId ? [activeVectorId] : []);
            convertLayersToArea(ids);
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

function isShapeEditableLayer(v) {
    return !!v && (v.custom === true || Array.isArray(v.points));
}

function normalizeHex6(val, fallback) {
    const raw = String(val || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
        return ('#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3]).toLowerCase();
    }
    return fallback;
}

function updatePartStyleInspector(v) {
    const card = document.getElementById('partStyleGroup');
    if (!card) return;
    if (!v || v.kind !== 'decor') {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';
    const setIfIdle = (id, val) => {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) el.value = val;
    };
    setIfIdle('inspPartLabel', v.label || '');
    setIfIdle('inspPartFill', normalizeHex6(v.fill, '#f3ecd8'));
    setIfIdle('inspPartStroke', normalizeHex6(v.stroke, '#2f332e'));
    setIfIdle('inspPartStrokeW', v.strokeWidth ?? 2.5);
    const dashedEl = document.getElementById('inspPartDashed');
    if (dashedEl) dashedEl.checked = !!v.dashed;
    const fenceEl = document.getElementById('inspPartFenceInclude');
    if (fenceEl) fenceEl.checked = v.fenceExclude !== true;
}

function isConvertibleToAreaLayer(v) {
    return !!v && v.area == null && v.custom !== true && v.kind !== 'entrance' && !isLegacyWallLayer(v);
}

function updateShapePointsInspector(v) {
    const card = document.getElementById('shapePointsGroup');
    if (!card) return;
    if (!isShapeEditableLayer(v) || v.preserveCustomSrc) {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';
    const pts = ensureCustomShapePoints(v);
    const badge = document.getElementById('shapePointCountBadge');
    const countInput = document.getElementById('shapePointCountInput');
    const toggleBtn = document.getElementById('btnToggleEditShapePoints');
    const modalBtn = document.getElementById('btnOpenModalShapeEditor');
    const isEditingThis = !!(pointEditState && pointEditState.mode === 'shape' && pointEditState.layerId === v.id);

    if (badge) badge.textContent = `${pts.length} pts`;
    if (countInput && document.activeElement !== countInput) {
        countInput.value = pts.length;
    }
    if (toggleBtn) {
        toggleBtn.classList.toggle('me-btn-active-tool', isEditingThis);
        toggleBtn.textContent = isEditingThis ? 'Done Editing Shape Points' : 'Edit Shape Points on Map';
    }
    if (modalBtn) {
        modalBtn.textContent = v.kind === 'decor' ? 'Edit Part Shape & Style' : 'Open Visual Shape Editor';
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
        updatePartStyleInspector(null);
        updateShapePointsInspector(null);
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

    const isVisible = v.visible !== false;
    const hiddenBanner = document.getElementById('propHiddenBanner');
    if (hiddenBanner) hiddenBanner.style.display = isVisible ? 'none' : 'flex';

    const visToggleBtn = document.getElementById('btnInspectorToggleVis');
    if (visToggleBtn) {
        visToggleBtn.classList.toggle('is-hidden', !isVisible);
        visToggleBtn.innerHTML = isVisible
            ? `${ME_ICONS.eye} <span>Visible</span>`
            : `${ME_ICONS.eyeOff} <span>Hidden</span>`;
        visToggleBtn.title = isVisible ? 'Click to hide this layer on map' : 'Hidden on map — click to show';
    }

    setVal('propName', v.name);
    const propNameEl = document.getElementById('propName');
    if (propNameEl) propNameEl.readOnly = !!v.custom;
    const customHint = document.getElementById('propCustomAreaHint');
    if (customHint) customHint.style.display = v.custom ? 'flex' : 'none';
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
    updatePartStyleInspector(v);
    updateShapePointsInspector(v);
    const convertCard = document.getElementById('convertToAreaGroup');
    if (convertCard) {
        convertCard.style.display = isConvertibleToAreaLayer(v) ? 'block' : 'none';
    }
}

// ── Deleting Vectors ──
async function deleteVector(id) {
    const v = vectorLayers.find(l => l.id === id);
    const name = v ? v.name : 'Vector layer';

    if (v && v.custom && !(await canRemoveCustomArea(v.name))) return;

    if (!await showConfirmModal({ title: "Delete Vector", message: `Are you sure you want to delete "${name}" from the map?`, confirmText: "Delete", cancelText: "Cancel", type: "warning", danger: true })) return;

    const beforeSnap = captureMapSnapshot(`delete ${name}`);
    vectorLayers = vectorLayers.filter(l => l.id !== id);
    selectedVectorIds.delete(id);
    if (pointEditState && pointEditState.mode === 'shape' && pointEditState.layerId === id) {
        pointEditState = null;
    }
    syncCustomAreasFromLayers();
    if (activeVectorId === id) {
        activeVectorId = selectedVectorIds.size > 0 ? Array.from(selectedVectorIds)[0] : (vectorLayers[0]?.id || null);
    }

    commitMapUndo(beforeSnap, `delete ${name}`);
    saveVectorLayout();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();

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
            <img src="${asset.special === 'entrance' ? ZMGFence.entranceSvgDataUrl() : MAP_DIR + asset.file}" alt="${asset.name}">
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
                    const beforeSnap = captureMapSnapshot('upload vector');
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
                    commitMapUndo(beforeSnap, `upload ${newVector.name}`);
                    saveVectorLayout();
                    renderVectorMap();
                    renderLayerSidebar();
                    selectVector(newVector.id, false);
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
    if (asset.special === 'entrance') {
        addEntranceLayer();
        return;
    }
    const beforeSnap = captureMapSnapshot(`add ${asset.name}`);
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
    commitMapUndo(beforeSnap, `add ${asset.name}`);
    saveVectorLayout();
    renderVectorMap();
    renderLayerSidebar();
    selectVector(newVector.id, false);

    if (typeof showNotification === 'function') {
        showNotification('Vector Added', `Added "${asset.name}" to canvas!`, 'success');
    }
}

// ==============================================================================
// ==============================================================================
// ==============================================================================
// PERIMETER FENCE, ENTRANCE GATE & CUSTOM CEMETERY AREAS
// ==============================================================================
const ENTRANCE_SEEDED_KEY = 'zion_map_entrance_seeded_v1';
let fenceRaf = null;
let areaPrefixTouched = false;

function isLegacyWallLayer(v) {
    if (window.ZMGFence) return ZMGFence.isLegacyWall(v);
    return !!v && (v.id === 'group-109' || !!(v.src && /Group 109|boundary|Framework/i.test(v.src)));
}

function sanitizeBgConfig() {
    if (bgConfig && bgConfig.src && /cemetery-boundary-bg/i.test(bgConfig.src)) {
        bgConfig.src = '';
    }
}

// Seeds one entrance gate the first time a layout is opened (never re-adds a deleted one)
function finalizeLoadedVectors(entranceAlreadySeeded) {
    if (window.ZMGFence) {
        const hasEntrance = vectorLayers.some(v => v.kind === 'entrance');
        const seeded = entranceAlreadySeeded || !!localStorage.getItem(ENTRANCE_SEEDED_KEY);
        if (!hasEntrance && !seeded) {
            vectorLayers.push(ZMGFence.createEntranceLayer({ id: 'entrance-gate' }));
        }
        if (hasEntrance || entranceAlreadySeeded || !seeded) {
            localStorage.setItem(ENTRANCE_SEEDED_KEY, '1');
        }
    }
    syncCustomAreasFromLayers();
}

function scheduleFence() {
    if (fenceRaf) return;
    fenceRaf = requestAnimationFrame(() => {
        fenceRaf = null;
        updateFence();
    });
}

function updateFence() {
    const board = document.getElementById('mapBoard');
    if (!board || !window.ZMGFence || currentMode !== 'map') return;
    const result = ZMGFence.render(board, vectorLayers, { fenceConfig });
    if (result && result.snapped) {
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
        renderLayerSidebar();
        updateVectorInspector();
    }
    updateWallPointsInspector(result && Array.isArray(result.points) ? result.points.length : null);
}

// ── Polygon Geometry & Point-Editing System (Custom Area Shapes + Perimeter Wall) ──
function ensureCustomShapePoints(v) {
    if (!v || !window.ZMGFence) return [];
    const cols = Number(v.cols) || 20;
    const rows = Number(v.rows) || 20;
    const aspect = (v.shapeAspect && Number(v.shapeAspect) > 0)
        ? Number(v.shapeAspect)
        : (rows / Math.max(1, cols));
    v.shapeAspect = parseFloat(aspect.toFixed(4));
    const clean = ZMGFence.sanitizePolygonPoints(v.points, 3);
    if (clean) {
        v.points = clean;
        return clean;
    }
    v.points = ZMGFence.defaultShapePoints(4, aspect);
    return v.points;
}

function shapeLayerBoxMetrics(v) {
    const cols = Number(v.cols) || 20;
    const rows = Number(v.rows) || 20;
    const aspect = (v.shapeAspect && Number(v.shapeAspect) > 0)
        ? Number(v.shapeAspect)
        : (rows / Math.max(1, cols));
    const boxW = ((Number(v.width) || 15) / 100) * BOARD_WIDTH;
    const boxH = boxW * aspect;
    const cx = ((Number(v.left) || 0) / 100) * BOARD_WIDTH + boxW / 2;
    const cy = ((Number(v.top) || 0) / 100) * BOARD_HEIGHT + boxH / 2;
    const rot = ((Number(v.rotate) || 0) * Math.PI) / 180;
    return { boxW, boxH, cx, cy, rot, aspect };
}

function shapeLocalPctToBoardPx(v, pt) {
    const { boxW, boxH, cx, cy, rot } = shapeLayerBoxMetrics(v);
    const lx = ((Number(pt.x) || 0) / 100 - 0.5) * boxW;
    const ly = ((Number(pt.y) || 0) / 100 - 0.5) * boxH;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    return {
        x: cx + lx * cos - ly * sin,
        y: cy + lx * sin + ly * cos
    };
}

// Recompute layer bounding box (left, top, width, shapeAspect) and normalized 0..100 points
// from absolute board-pixel vertex positions while preserving v.rotate exactly.
function applyBoardPxPointsToShapeLayer(v, absPts) {
    if (!v || !Array.isArray(absPts) || absPts.length < 3) return;
    const rot = ((Number(v.rotate) || 0) * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    // Transform board points into layer's rotated local coordinates around origin
    const localPts = absPts.map(p => ({
        u: p.x * cos + p.y * sin,
        w: -p.x * sin + p.y * cos
    }));

    let minU = Infinity, maxU = -Infinity, minW = Infinity, maxW = -Infinity;
    localPts.forEach(lp => {
        if (lp.u < minU) minU = lp.u;
        if (lp.u > maxU) maxU = lp.u;
        if (lp.w < minW) minW = lp.w;
        if (lp.w > maxW) maxW = lp.w;
    });

    const boxW = Math.max(24, maxU - minU);
    const boxH = Math.max(24, maxW - minW);
    const midU = (minU + maxU) / 2;
    const midW = (minW + maxW) / 2;

    // Transform new center back into board pixel space
    const newCx = midU * cos - midW * sin;
    const newCy = midU * sin + midW * cos;

    v.left = parseFloat((((newCx - boxW / 2) / BOARD_WIDTH) * 100).toFixed(2));
    v.top = parseFloat((((newCy - boxH / 2) / BOARD_HEIGHT) * 100).toFixed(2));
    v.width = parseFloat(((boxW / BOARD_WIDTH) * 100).toFixed(2));
    v.shapeAspect = parseFloat((boxH / boxW).toFixed(4));
    v.points = localPts.map(lp => ({
        x: parseFloat((((lp.u - minU) / boxW) * 100).toFixed(2)),
        y: parseFloat((((lp.w - minW) / boxH) * 100).toFixed(2))
    }));
}

function rebuildCustomShapeSvgAndSync(v) {
    if (!v || !window.ZMGFence) return;
    const pts = ensureCustomShapePoints(v);
    if (v.kind === 'decor') {
        v.src = ZMGFence.buildPartSvgDataUrl(v);
        return;
    }
    v.src = ZMGFence.buildAreaSvgDataUrl(v.cols || 20, v.rows || 20, v.area, pts, v.shapeAspect);
    syncCustomAreasFromLayers();
}

function getAutoFenceRectPct() {
    const board = document.getElementById('mapBoard');
    if (board && window.ZMGFence) {
        const rect = ZMGFence.computeFenceRect(board, vectorLayers);
        if (rect) {
            return {
                x: (rect.x / BOARD_WIDTH) * 100,
                y: (rect.y / BOARD_HEIGHT) * 100,
                w: (rect.w / BOARD_WIDTH) * 100,
                h: (rect.h / BOARD_HEIGHT) * 100
            };
        }
    }
    return { x: 5, y: 5, w: 90, h: 90 };
}

function getAutoWrappedFencePointsPct() {
    const board = document.getElementById('mapBoard');
    if (board && window.ZMGFence) {
        const poly = ZMGFence.computeFencePolygon(board, vectorLayers, {
            fenceConfig: { mode: 'auto', points: [] }
        });
        if (poly && Array.isArray(poly.points) && poly.points.length >= 3) {
            const ptsPct = poly.points.map(p => ({
                x: (p.x / BOARD_WIDTH) * 100,
                y: (p.y / BOARD_HEIGHT) * 100
            }));
            const clean = ZMGFence.sanitizePolygonPoints(ptsPct, 3);
            if (clean) return clean;
        }
        return ZMGFence.rectToPolygonPoints(getAutoFenceRectPct(), 4, BOARD_WIDTH / BOARD_HEIGHT);
    }
    return [];
}

function getEditableWallPointsPct() {
    if (fenceConfig && fenceConfig.mode === 'custom' && window.ZMGFence) {
        const clean = ZMGFence.sanitizePolygonPoints(fenceConfig.points, 3);
        if (clean) return clean;
    }
    return getAutoWrappedFencePointsPct();
}

function updateWallPointsInspector(knownAutoCount = null) {
    const badge = document.getElementById('wallModeBadge');
    const toggleBtn = document.getElementById('btnToggleEditWallPoints');
    const topBtn = document.getElementById('btnEditWallPoints');
    const countInput = document.getElementById('wallPointCountInput');
    const isCustom = !!(fenceConfig && fenceConfig.mode === 'custom' && fenceConfig.points && fenceConfig.points.length >= 3);
    const isEditing = !!(pointEditState && pointEditState.mode === 'wall');
    const currentCount = isCustom
        ? fenceConfig.points.length
        : (knownAutoCount != null ? knownAutoCount : (getAutoWrappedFencePointsPct().length || 4));

    if (badge) badge.textContent = isCustom ? `Custom (${currentCount} pts)` : `Auto Wrap (${currentCount} pts)`;
    if (countInput && document.activeElement !== countInput) {
        countInput.value = currentCount;
    }
    if (toggleBtn) {
        toggleBtn.classList.toggle('me-btn-active-tool', isEditing);
        toggleBtn.textContent = isEditing ? 'Done Editing Wall Points' : 'Edit Wall Points';
    }
    if (topBtn) {
        topBtn.classList.toggle('me-btn-active-tool', isEditing);
    }
}

function commitWallPolygonPct(pts, persistToDb) {
    if (!window.ZMGFence) return;
    fenceConfig = ZMGFence.writeStoredFenceConfig({ mode: 'custom', points: pts });
    updateFence();
    updateWallPointsInspector();
    renderPointOverlay();
    if (persistToDb) {
        persistEditorVectorsToSupabase();
    }
}

function applyWallPointCount(targetCount, forceAutoWrap) {
    if (!window.ZMGFence) return;
    const beforeSnap = captureMapSnapshot('wall points');
    const basePts = forceAutoWrap ? getAutoWrappedFencePointsPct() : getEditableWallPointsPct();
    let nextPts;
    if (forceAutoWrap && targetCount == null) {
        nextPts = basePts;
    } else {
        const count = Math.max(3, Math.min(32, Math.round(Number(targetCount) || basePts.length || 4)));
        nextPts = ZMGFence.resamplePolygonPoints(basePts, count, BOARD_WIDTH / BOARD_HEIGHT);
    }
    pointEditState = { mode: 'wall' };
    commitWallPolygonPct(nextPts, true);
    commitMapUndo(beforeSnap, 'wall points');
}

function applyShapePointCount(targetCount) {
    const v = vectorLayers.find(l => l.id === activeVectorId);
    if (!isShapeEditableLayer(v) || !window.ZMGFence) return;
    const beforeSnap = captureMapSnapshot('shape points');
    const pts = ensureCustomShapePoints(v);
    const count = Math.max(3, Math.min(32, Math.round(Number(targetCount) || 4)));
    v.points = ZMGFence.resamplePolygonPoints(pts, count, 1 / (v.shapeAspect || 1));
    rebuildCustomShapeSvgAndSync(v);
    pointEditState = { mode: 'shape', layerId: v.id };
    commitMapUndo(beforeSnap, 'shape points');
    renderVectorMap();
    updateVectorInspector();
    persistMapStateNow();
}

function resetSelectedShapeToRect() {
    const v = vectorLayers.find(l => l.id === activeVectorId);
    if (!isShapeEditableLayer(v) || !window.ZMGFence) return;
    const beforeSnap = captureMapSnapshot('reset shape rectangle');
    const cols = Number(v.cols) || 20;
    const rows = Number(v.rows) || 20;
    const oldMetrics = shapeLayerBoxMetrics(v);
    const nextAspect = v.kind === 'decor'
        ? ((v.shapeAspect && Number(v.shapeAspect) > 0) ? Number(v.shapeAspect) : 1)
        : (rows / Math.max(1, cols));
    const nextH = oldMetrics.boxW * nextAspect;

    v.shapeAspect = parseFloat(nextAspect.toFixed(4));
    v.left = parseFloat((((oldMetrics.cx - oldMetrics.boxW / 2) / BOARD_WIDTH) * 100).toFixed(2));
    v.top = parseFloat((((oldMetrics.cy - nextH / 2) / BOARD_HEIGHT) * 100).toFixed(2));
    v.points = ZMGFence.defaultShapePoints(4, nextAspect);
    rebuildCustomShapeSvgAndSync(v);
    commitMapUndo(beforeSnap, 'reset shape rectangle');
    renderVectorMap();
    updateVectorInspector();
    persistMapStateNow();
}

function toggleWallPointEdit() {
    // Perimeter wall editing is temporarily disabled
    if (pointEditState && pointEditState.mode === 'wall') {
        pointEditState = null;
        renderPointOverlay();
    }
}

function toggleShapePointEdit(layerId) {
    const targetId = layerId || activeVectorId;
    const v = vectorLayers.find(l => l.id === targetId);
    if (!isShapeEditableLayer(v)) return;
    if (pointEditState && pointEditState.mode === 'shape' && pointEditState.layerId === v.id) {
        pointEditState = null;
    } else {
        ensureCustomShapePoints(v);
        pointEditState = { mode: 'shape', layerId: v.id };
    }
    renderPointOverlay();
    updateVectorInspector();
    updateWallPointsInspector();
}

function clientToBoardPx(clientX, clientY) {
    const board = document.getElementById('mapBoard');
    if (!board) return { x: 0, y: 0 };
    const r = board.getBoundingClientRect();
    return {
        x: ((clientX - r.left) / (r.width || 1)) * BOARD_WIDTH,
        y: ((clientY - r.top) / (r.height || 1)) * BOARD_HEIGHT
    };
}

function getOrCreateVertexOverlay(board) {
    let overlay = document.getElementById('vertexEditorOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'vertexEditorOverlay';
        overlay.className = 'me-vertex-overlay';
        board.appendChild(overlay);
    }
    return overlay;
}

function startVertexDrag(e, config) {
    e.preventDefault();
    e.stopPropagation();
    const { mode, index, wallPtsPct, layer, shapeAbsPts, overlay, isNewMidpoint } = config;
    const beforeSnap = config.beforeSnapshot || captureMapSnapshot(mode === 'wall' ? 'edit wall points' : 'edit shape points');
    isDraggingVertex = true;
    let moved = false;

    const imgEl = layer
        ? document.querySelector(`.me-vec-element[data-vector-id="${layer.id}"]`)
        : null;
    if (layer && imgEl) {
        imgEl.style.opacity = '0.15';
    }

    const svgEl = overlay.querySelector('.me-vertex-svg');
    const previewPoly = overlay.querySelector('.me-vertex-preview-poly');
    const guidePoly = overlay.querySelector('.me-vertex-guide-poly');
    const vertexHandles = overlay.querySelectorAll('.me-vertex-handle');
    const midpointHandles = overlay.querySelectorAll('.me-midpoint-handle');

    const activeHandle = overlay.querySelector(`.me-vertex-handle[data-pt-index="${index}"]`);
    if (activeHandle) activeHandle.classList.add('is-active');

    const updateDomHandles = (ptsPx) => {
        const attr = ptsPx.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        if (guidePoly) guidePoly.setAttribute('points', attr);
        if (previewPoly) previewPoly.setAttribute('points', attr);
        vertexHandles.forEach(h => {
            const i = parseInt(h.dataset.ptIndex, 10);
            if (ptsPx[i]) {
                h.style.left = `${(ptsPx[i].x / BOARD_WIDTH) * 100}%`;
                h.style.top = `${(ptsPx[i].y / BOARD_HEIGHT) * 100}%`;
            }
        });
        midpointHandles.forEach(m => {
            const i = parseInt(m.dataset.edgeIndex, 10);
            const a = ptsPx[i];
            const b = ptsPx[(i + 1) % ptsPx.length];
            if (a && b) {
                m.style.left = `${(((a.x + b.x) / 2) / BOARD_WIDTH) * 100}%`;
                m.style.top = `${(((a.y + b.y) / 2) / BOARD_HEIGHT) * 100}%`;
            }
        });
    };

    const onMove = (moveEvt) => {
        moved = true;
        const pos = clientToBoardPx(moveEvt.clientX, moveEvt.clientY);
        if (mode === 'wall') {
            wallPtsPct[index] = {
                x: Math.round(((pos.x / BOARD_WIDTH) * 100) * 100) / 100,
                y: Math.round(((pos.y / BOARD_HEIGHT) * 100) * 100) / 100
            };
            const ptsPx = wallPtsPct.map(p => ({ x: (p.x / 100) * BOARD_WIDTH, y: (p.y / 100) * BOARD_HEIGHT }));
            updateDomHandles(ptsPx);
            fenceConfig = { mode: 'custom', points: wallPtsPct };
            updateFence();
            if (svgEl) updateDomHandles(ptsPx);
        } else if (mode === 'shape' && layer) {
            shapeAbsPts[index] = pos;
            if (!previewPoly && svgEl) {
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('class', 'me-vertex-preview-poly');
                poly.setAttribute('fill', '#cfe3c9');
                poly.setAttribute('fill-opacity', '0.88');
                poly.setAttribute('stroke', '#2d4a36');
                poly.setAttribute('stroke-width', '3');
                svgEl.insertBefore(poly, svgEl.firstChild);
            }
            updateDomHandles(shapeAbsPts);
        }
    };

    const onUp = () => {
        isDraggingVertex = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        if (activeHandle) activeHandle.classList.remove('is-active');
        if (layer && imgEl) {
            imgEl.style.opacity = `${layer.opacity ?? 1.0}`;
        }

        if (mode === 'wall') {
            if (moved || isNewMidpoint) {
                commitWallPolygonPct(wallPtsPct, true);
                commitMapUndo(beforeSnap, 'edit wall points');
            } else {
                renderPointOverlay();
            }
        } else if (mode === 'shape' && layer) {
            if (moved || isNewMidpoint) {
                applyBoardPxPointsToShapeLayer(layer, shapeAbsPts);
                rebuildCustomShapeSvgAndSync(layer);
                commitMapUndo(beforeSnap, 'edit shape points');
                renderVectorMap();
                renderLayerSidebar();
                updateVectorInspector();
                persistMapStateNow();
            } else {
                renderPointOverlay();
            }
        }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
}

function renderPointOverlay() {
    const board = document.getElementById('mapBoard');
    if (!board) return;
    const overlay = getOrCreateVertexOverlay(board);
    overlay.innerHTML = '';

    if (currentMode !== 'map' || !pointEditState) return;

    let ptsPx = [];
    let isWall = false;
    let targetLayer = null;
    let wallPtsPct = null;

    if (pointEditState.mode === 'wall') {
        pointEditState = null;
        return;
    } else if (pointEditState.mode === 'shape') {
        targetLayer = vectorLayers.find(l => l.id === pointEditState.layerId);
        if (!isShapeEditableLayer(targetLayer)) {
            pointEditState = null;
            return;
        }
        const localPts = ensureCustomShapePoints(targetLayer);
        ptsPx = localPts.map(p => shapeLocalPctToBoardPx(targetLayer, p));
    }

    if (ptsPx.length < 3) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'me-vertex-svg');
    svg.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);

    if (!isWall) {
        const preview = document.createElementNS(svgNS, 'polygon');
        preview.setAttribute('class', 'me-vertex-preview-poly');
        preview.setAttribute('fill', 'none');
        preview.setAttribute('stroke', 'none');
        preview.setAttribute('points', ptsPx.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
        svg.appendChild(preview);
    }

    const guide = document.createElementNS(svgNS, 'polygon');
    guide.setAttribute('class', 'me-vertex-guide-poly');
    guide.setAttribute('fill', 'none');
    guide.setAttribute('stroke', isWall ? '#8c5228' : '#1e6b3d');
    guide.setAttribute('stroke-width', '2');
    guide.setAttribute('stroke-dasharray', '6 4');
    guide.setAttribute('points', ptsPx.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    svg.appendChild(guide);
    overlay.appendChild(svg);

    const canAddMore = ptsPx.length < (window.ZMGFence ? ZMGFence.MAX_POLYGON_POINTS : 32);
    if (canAddMore) {
        for (let i = 0; i < ptsPx.length; i++) {
            const a = ptsPx[i];
            const b = ptsPx[(i + 1) % ptsPx.length];
            const mid = document.createElement('div');
            mid.className = `me-midpoint-handle ${isWall ? 'is-wall' : 'is-shape'}`;
            mid.dataset.edgeIndex = String(i);
            mid.textContent = '+';
            mid.title = 'Click or drag to insert a new corner point';
            mid.style.left = `${(((a.x + b.x) / 2) / BOARD_WIDTH) * 100}%`;
            mid.style.top = `${(((a.y + b.y) / 2) / BOARD_HEIGHT) * 100}%`;
            mid.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                const beforeSnap = captureMapSnapshot(isWall ? 'add wall point' : 'add shape point');
                if (isWall) {
                    const pa = wallPtsPct[i];
                    const pb = wallPtsPct[(i + 1) % wallPtsPct.length];
                    wallPtsPct.splice(i + 1, 0, {
                        x: Math.round(((pa.x + pb.x) / 2) * 100) / 100,
                        y: Math.round(((pa.y + pb.y) / 2) * 100) / 100
                    });
                    fenceConfig = ZMGFence.writeStoredFenceConfig({ mode: 'custom', points: wallPtsPct });
                    updateFence();
                    updateWallPointsInspector();
                    renderPointOverlay();
                    const freshOverlay = document.getElementById('vertexEditorOverlay');
                    const freshPts = getEditableWallPointsPct().map(p => ({ x: p.x, y: p.y }));
                    startVertexDrag(e, { mode: 'wall', index: i + 1, wallPtsPct: freshPts, overlay: freshOverlay, isNewMidpoint: true, beforeSnapshot: beforeSnap });
                } else if (targetLayer) {
                    const updatedAbs = ptsPx.map(p => ({ x: p.x, y: p.y }));
                    updatedAbs.splice(i + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
                    applyBoardPxPointsToShapeLayer(targetLayer, updatedAbs);
                    rebuildCustomShapeSvgAndSync(targetLayer);
                    renderVectorMap();
                    updateVectorInspector();
                    const freshOverlay = document.getElementById('vertexEditorOverlay');
                    const freshAbs = ensureCustomShapePoints(targetLayer).map(p => shapeLocalPctToBoardPx(targetLayer, p));
                    startVertexDrag(e, { mode: 'shape', index: i + 1, layer: targetLayer, shapeAbsPts: freshAbs, overlay: freshOverlay, isNewMidpoint: true, beforeSnapshot: beforeSnap });
                }
            });
            overlay.appendChild(mid);
        }
    }

    ptsPx.forEach((pt, idx) => {
        const handle = document.createElement('div');
        handle.className = `me-vertex-handle ${isWall ? 'is-wall' : 'is-shape'}`;
        handle.dataset.ptIndex = String(idx);
        handle.title = `Point ${idx + 1} (drag to move, right-click or Alt+click to delete)`;
        handle.style.left = `${(pt.x / BOARD_WIDTH) * 100}%`;
        handle.style.top = `${(pt.y / BOARD_HEIGHT) * 100}%`;

        const removeThisPoint = () => {
            if (ptsPx.length <= 3) {
                notifyArea('Minimum Points Reached', 'A polygon shape needs at least 3 corner points.', 'warning');
                return;
            }
            const beforeSnap = captureMapSnapshot(isWall ? 'remove wall point' : 'remove shape point');
            if (isWall) {
                wallPtsPct.splice(idx, 1);
                commitWallPolygonPct(wallPtsPct, true);
                commitMapUndo(beforeSnap, 'remove wall point');
            } else if (targetLayer) {
                const remaining = ptsPx.filter((_, j) => j !== idx);
                applyBoardPxPointsToShapeLayer(targetLayer, remaining);
                rebuildCustomShapeSvgAndSync(targetLayer);
                commitMapUndo(beforeSnap, 'remove shape point');
                renderVectorMap();
                updateVectorInspector();
                persistMapStateNow();
            }
        };

        handle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeThisPoint();
        });

        handle.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                e.stopPropagation();
                removeThisPoint();
                return;
            }
            if (e.button !== 0) return;
            if (e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                removeThisPoint();
                return;
            }
            startVertexDrag(e, {
                mode: isWall ? 'wall' : 'shape',
                index: idx,
                wallPtsPct: wallPtsPct ? wallPtsPct.map(p => ({ x: p.x, y: p.y })) : null,
                layer: targetLayer,
                shapeAbsPts: !isWall ? ptsPx.map(p => ({ x: p.x, y: p.y })) : null,
                overlay
            });
        });

        overlay.appendChild(handle);
    });
}

function initFenceSystem() {
    if (window.ZMGFence) {
        fenceConfig = ZMGFence.readStoredFenceConfig();
    }

    const board = document.getElementById('mapBoard');
    if (board && window.MutationObserver) {
        // Any move / resize / rotate of a map layer redraws the fence live
        const observer = new MutationObserver((mutations) => {
            const relevant = mutations.some(m => m.target && m.target.classList && m.target.classList.contains('me-vec-element'));
            if (relevant) scheduleFence();
        });
        observer.observe(board, { subtree: true, attributes: true, attributeFilter: ['style'] });
    }

    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };

    bindClick('btnAddEntranceTop', addEntranceLayer);

    bindClick('btnToggleEditShapePoints', () => toggleShapePointEdit(activeVectorId));
    bindClick('btnApplyShapePointCount', () => {
        const val = parseInt(document.getElementById('shapePointCountInput')?.value, 10) || 4;
        applyShapePointCount(val);
    });
    bindClick('btnAddShapePoint', () => {
        const v = vectorLayers.find(l => l.id === activeVectorId);
        if (!isShapeEditableLayer(v)) return;
        const pts = ensureCustomShapePoints(v);
        applyShapePointCount(Math.min(32, pts.length + 1));
    });
    bindClick('btnRemoveShapePoint', () => {
        const v = vectorLayers.find(l => l.id === activeVectorId);
        if (!isShapeEditableLayer(v)) return;
        const pts = ensureCustomShapePoints(v);
        applyShapePointCount(Math.max(3, pts.length - 1));
    });
    bindClick('btnResetShapePoints', resetSelectedShapeToRect);
    bindClick('btnOpenModalShapeEditor', () => {
        const v = vectorLayers.find(l => l.id === activeVectorId);
        if (!v) return;
        if (v.kind === 'decor') openEditPartModal(v.id);
        else openEditAreaModal(v.id);
    });

    updateWallPointsInspector();
    scheduleFence();
}

function snapEntranceLayer(v) {
    const board = document.getElementById('mapBoard');
    if (!board || !window.ZMGFence || !v) return;
    const poly = ZMGFence.computeFencePolygon(board, vectorLayers, { fenceConfig });
    if (!poly) return;
    ZMGFence.snapEntrance(board, v, poly.points);
    const el = document.querySelector('.me-vec-element[data-vector-id="' + v.id + '"]');
    if (el) {
        el.style.left = v.left + '%';
        el.style.top = v.top + '%';
        el.style.transform = 'rotate(' + v.rotate + 'deg)';
    }
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    renderLayerSidebar();
    updateVectorInspector();
    scheduleFence();
}

function addEntranceLayer() {
    if (!window.ZMGFence) return;
    const beforeSnap = captureMapSnapshot('add entrance');
    const maxZ = Math.max(...vectorLayers.map(l => Number(l.zIndex) || 0), 5);
    const layer = ZMGFence.createEntranceLayer({ id: 'entrance-' + Date.now(), zIndex: Math.max(9, maxZ) });
    vectorLayers.push(layer);
    localStorage.setItem(ENTRANCE_SEEDED_KEY, '1');
    commitMapUndo(beforeSnap, 'add entrance');
    renderVectorMap();
    renderLayerSidebar();
    selectVector(layer.id, false);
    persistMapStateNow();
    if (typeof showNotification === 'function') {
        showNotification('Entrance Added', 'The entrance gate snaps onto the fence. Drag it along any edge to reposition it.', 'success');
    }
}

async function persistMapStateNow() {
    try {
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
        if (window.ZMGFence) {
            fenceConfig = ZMGFence.writeStoredFenceConfig(fenceConfig);
        }
        await persistEditorVectorsToSupabase();
    } catch (err) {
        console.warn('Map state persist notice:', err);
    }
}

// ── Custom areas ──
function allUsedAreaNumbers() {
    const used = new Set();
    Object.values(SECTION_SHAPE_MAP).forEach(s => { if (s.area != null) used.add(parseInt(s.area, 10)); });
    document.querySelectorAll('#editorSectionSelect option').forEach(o => {
        const m = /^Area\s+(\d+)/i.exec(o.value);
        if (m) used.add(parseInt(m[1], 10));
    });
    vectorLayers.forEach(v => { if (v.area != null && !isNaN(parseInt(v.area, 10))) used.add(parseInt(v.area, 10)); });
    return used;
}

function nextFreeAreaNumber() {
    const used = allUsedAreaNumbers();
    let n = 13;
    while (used.has(n)) n++;
    return n;
}

function allUsedPrefixes() {
    return new Set(Object.values(SECTION_SHAPE_MAP).map(s => String(s.prefix || '').toUpperCase()));
}

function suggestPrefix(name) {
    const words = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    let base = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
    if (base.length < 2) base = (words[0] || 'AR').slice(0, 3).toUpperCase();
    if (!base) base = 'AR';
    const used = allUsedPrefixes();
    let candidate = base;
    let i = 2;
    while (used.has(candidate)) candidate = base + i++;
    return candidate;
}

// Registers every custom-area layer in SECTION_SHAPE_MAP and the area dropdown
function syncCustomAreasFromLayers() {
    if (!window.ZMGFence || typeof SECTION_SHAPE_MAP === 'undefined') return;
    const select = document.getElementById('editorSectionSelect');
    const wanted = ZMGFence.customShapeEntries(vectorLayers);

    Object.keys(SECTION_SHAPE_MAP).forEach(name => {
        if (SECTION_SHAPE_MAP[name].custom && !wanted[name]) {
            delete SECTION_SHAPE_MAP[name];
            if (select) Array.from(select.options).forEach(o => { if (o.value === name) o.remove(); });
        }
    });

    Object.keys(wanted).forEach(name => {
        SECTION_SHAPE_MAP[name] = wanted[name];
        if (select && !Array.from(select.options).some(o => o.value === name)) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name + ' (Custom)';
            select.appendChild(opt);
        }
    });

    updateAreaActionButtons();
}

function measureLayerAspectRatio(v) {
    const el = document.querySelector('.me-vec-element[data-vector-id="' + v.id + '"]');
    const img = el ? (el.tagName === 'IMG' ? el : el.querySelector('img')) : null;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        return Math.max(0.12, Math.min(6.0, img.naturalHeight / img.naturalWidth));
    }
    if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        return Math.max(0.12, Math.min(6.0, el.offsetHeight / el.offsetWidth));
    }
    if (v.shapeAspect && Number(v.shapeAspect) > 0) {
        return Math.max(0.12, Math.min(6.0, Number(v.shapeAspect)));
    }
    return 1.0;
}

async function convertLayersToArea(ids) {
    if (!window.ZMGFence) return;
    const targets = (ids || [])
        .map(id => vectorLayers.find(l => l.id === id))
        .filter(isConvertibleToAreaLayer);
    if (targets.length === 0) return;

    const beforeSnap = captureMapSnapshot(targets.length > 1 ? 'convert layers to areas' : `convert ${targets[0].name} to area`);
    const convertedNames = [];

    targets.forEach(v => {
        const num = nextFreeAreaNumber();
        const rawLabel = String(v.name || `Section ${num}`).replace(/^Area\s+\d+\s*-\s*/i, '').trim() || `Section ${num}`;
        const fullName = `Area ${num} - ${rawLabel}`.slice(0, 56);
        const prefix = suggestPrefix(rawLabel);
        const aspect = parseFloat(measureLayerAspectRatio(v).toFixed(4));
        const cols = 36;
        const rows = Math.max(8, Math.min(60, Math.round(cols * aspect)));

        v.kind = 'area';
        v.custom = true;
        v.preserveCustomSrc = true;
        v.area = String(num);
        v.name = fullName;
        v.desc = `${fullName} memorial section`;
        v.category = v.category || 'Supreme';
        v.tab = ZMGFence.CATEGORY_TABS[v.category] || 'supreme';
        v.prefix = prefix;
        v.cols = cols;
        v.rows = rows;
        v.shapeAspect = aspect;
        delete v.points;
        convertedNames.push(fullName);
    });

    commitMapUndo(beforeSnap, targets.length > 1 ? 'convert layers to areas' : `convert ${convertedNames[0]}`);
    syncCustomAreasFromLayers();
    saveVectorLayout();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    await persistMapStateNow();

    let totalGeneratedPlots = 0;
    for (const fullName of convertedNames) {
        const shapeInfo = SECTION_SHAPE_MAP[fullName];
        if (!shapeInfo) continue;
        const generated = await generateMaskedPlotsForShape(fullName, shapeInfo, {
            w: 1,
            h: 1,
            category: shapeInfo.category || 'Supreme',
            status: 'available',
            existingPlots: []
        });
        if (generated.length > 0) {
            await savePlotsPayloadForSection(fullName, generated);
            totalGeneratedPlots += generated.length;
        }
    }

    if (typeof showNotification === 'function') {
        const msg = convertedNames.length === 1
            ? `"${convertedNames[0]}" is now an area with ${totalGeneratedPlots} plots inside it.`
            : `Converted ${convertedNames.length} layers into cemetery areas with ${totalGeneratedPlots} total plots inside them.`;
        showNotification('Converted to Cemetery Area', msg, 'success');
    }
}

function updateAreaActionButtons() {
    const select = document.getElementById('editorSectionSelect');
    const delBtn = document.getElementById('btnDeleteAreaSidebar');
    if (!delBtn || !select) return;
    const shape = SECTION_SHAPE_MAP[select.value];
    delBtn.style.display = (shape && shape.custom) ? 'inline-flex' : 'none';
}

function findFreeMapSpot(wPx, hPx) {
    const margin = 24;
    const boxes = [];
    vectorLayers.forEach(v => {
        if (v.visible === false) return;
        const el = document.querySelector('.me-vec-element[data-vector-id="' + v.id + '"]');
        if (!el) return;
        const w = el.offsetWidth || ((Number(v.width) || 10) / 100 * BOARD_WIDTH);
        const h = el.offsetHeight || w;
        const left = (Number(v.left) || 0) / 100 * BOARD_WIDTH;
        const top = (Number(v.top) || 0) / 100 * BOARD_HEIGHT;
        boxes.push({ l: left, t: top, r: left + w, b: top + h });
    });

    const free = (x, y) => !boxes.some(b => x < b.r + margin && x + wPx > b.l - margin && y < b.b + margin && y + hPx > b.t - margin);

    for (let y = 40; y <= BOARD_HEIGHT - hPx - 40; y += 20) {
        for (let x = 40; x <= BOARD_WIDTH - wPx - 40; x += 20) {
            if (free(x, y)) {
                return { left: parseFloat((x / BOARD_WIDTH * 100).toFixed(1)), top: parseFloat((y / BOARD_HEIGHT * 100).toFixed(1)) };
            }
        }
    }
    const maxRight = boxes.reduce((m, b) => Math.max(m, b.r), 0);
    return { left: parseFloat(((maxRight + 60) / BOARD_WIDTH * 100).toFixed(1)), top: 8.0 };
}

let modalShapeState = {
    editingLayerId: null,
    points: [],
    activeIdx: 0,
    lockedIdentity: false
};

function isPointInPolygonPct(x, y, poly) {
    if (window.ZMGFence && typeof window.ZMGFence.isPointInPolygonPct === 'function') {
        return window.ZMGFence.isPointInPolygonPct(x, y, poly);
    }
    if (!Array.isArray(poly) || poly.length < 3) return true;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = Number(poly[i].x), yi = Number(poly[i].y);
        const xj = Number(poly[j].x), yj = Number(poly[j].y);
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getShapePresetPoints(preset, cols, rows) {
    switch (preset) {
        case 'triangle':
            return [
                { x: 50, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ];
        case 'l-shape':
            return [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 50, y: 50 },
                { x: 100, y: 50 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ];
        case 'chamfer':
            return [
                { x: 15, y: 0 },
                { x: 85, y: 0 },
                { x: 100, y: 15 },
                { x: 100, y: 85 },
                { x: 85, y: 100 },
                { x: 15, y: 100 },
                { x: 0, y: 85 },
                { x: 0, y: 15 }
            ];
        case 'hex':
            return [
                { x: 50, y: 0 },
                { x: 100, y: 25 },
                { x: 100, y: 75 },
                { x: 50, y: 100 },
                { x: 0, y: 75 },
                { x: 0, y: 25 }
            ];
        case 'octagon':
            return [
                { x: 30, y: 0 },
                { x: 70, y: 0 },
                { x: 100, y: 30 },
                { x: 100, y: 70 },
                { x: 70, y: 100 },
                { x: 30, y: 100 },
                { x: 0, y: 70 },
                { x: 0, y: 30 }
            ];
        case 'rect':
        default:
            return window.ZMGFence
                ? ZMGFence.defaultShapePoints(4, (rows || 20) / Math.max(1, cols || 20))
                : [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
    }
}

function normalizeModalGridPoint(xPct, yPct, cols, rows, snapEnabled) {
    let x = Math.max(0, Math.min(100, xPct));
    let y = Math.max(0, Math.min(100, yPct));
    if (snapEnabled && cols >= 4 && rows >= 4) {
        x = (Math.round((x / 100) * cols) / cols) * 100;
        y = (Math.round((y / 100) * rows) / rows) * 100;
    }
    return {
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100
    };
}

function countUsableCellsInPolygon(cols, rows, pts) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        const cy = ((r + 0.5) / rows) * 100;
        for (let c = 0; c < cols; c++) {
            const cx = ((c + 0.5) / cols) * 100;
            if (isPointInPolygonPct(cx, cy, pts)) count++;
        }
    }
    return count;
}

function updateModalAreaReadout(pts) {
    const readout = document.getElementById('newAreaActivePtReadout');
    if (!readout) return;
    const idx = Math.max(0, Math.min(pts.length - 1, modalShapeState.activeIdx || 0));
    const pt = pts[idx];
    readout.textContent = pt
        ? `Pt ${idx + 1}/${pts.length}: ${Math.round(pt.x)}%, ${Math.round(pt.y)}%`
        : `${pts.length} pts`;
}

function renderModalAreaEditorSvgOnly() {
    const svg = document.getElementById('newAreaEditorSvg');
    const board = document.getElementById('newAreaEditorBoard');
    if (!svg || !board) return;

    const cols = Math.max(4, Math.min(60, parseInt(document.getElementById('newAreaCols')?.value, 10) || 20));
    const rows = Math.max(4, Math.min(60, parseInt(document.getElementById('newAreaRows')?.value, 10) || 20));
    const num = (document.getElementById('newAreaNumber')?.value || '').replace(/[^0-9A-Za-z]/g, '');
    const pts = modalShapeState.points;

    const maxW = 340;
    const maxH = 236;
    const scale = Math.min(maxW / cols, maxH / rows);
    const W = Math.max(96, Math.round(cols * scale));
    const H = Math.max(96, Math.round(rows * scale));
    board.style.width = `${W}px`;
    board.style.height = `${H}px`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const svgNS = 'http://www.w3.org/2000/svg';
    const cellW = W / cols;
    const cellH = H / rows;

    // 1. Single compound path highlighting plot slots inside the custom polygon
    let insidePath = '';
    for (let r = 0; r < rows; r++) {
        const cy = ((r + 0.5) / rows) * 100;
        const py = (r * cellH).toFixed(2);
        const hStr = cellH.toFixed(2);
        for (let c = 0; c < cols; c++) {
            const cx = ((c + 0.5) / cols) * 100;
            if (isPointInPolygonPct(cx, cy, pts)) {
                insidePath += `M${(c * cellW).toFixed(2)},${py}h${cellW.toFixed(2)}v${hStr}h-${cellW.toFixed(2)}z`;
            }
        }
    }
    if (insidePath) {
        const insideEl = document.createElementNS(svgNS, 'path');
        insideEl.setAttribute('d', insidePath);
        insideEl.setAttribute('fill', '#d5e6d8');
        svg.appendChild(insideEl);
    }

    // 2. Single compound path for crisp gridlines across cols x rows
    let gridPath = '';
    for (let c = 0; c <= cols; c++) {
        const x = (c * cellW).toFixed(2);
        gridPath += `M${x},0V${H}`;
    }
    for (let r = 0; r <= rows; r++) {
        const y = (r * cellH).toFixed(2);
        gridPath += `M0,${y}H${W}`;
    }
    const gridEl = document.createElementNS(svgNS, 'path');
    gridEl.setAttribute('d', gridPath);
    gridEl.setAttribute('stroke', '#c2d1c5');
    gridEl.setAttribute('stroke-width', '0.7');
    gridEl.setAttribute('fill', 'none');
    svg.appendChild(gridEl);

    // 3. Area shape polygon preview + label
    if (pts.length >= 3) {
        const ptStr = pts.map(p => `${((p.x / 100) * W).toFixed(1)},${((p.y / 100) * H).toFixed(1)}`).join(' ');
        const polyEl = document.createElementNS(svgNS, 'polygon');
        polyEl.setAttribute('points', ptStr);
        polyEl.setAttribute('fill', '#8fb897');
        polyEl.setAttribute('fill-opacity', '0.32');
        polyEl.setAttribute('stroke', '#1e4a2f');
        polyEl.setAttribute('stroke-width', '2.5');
        polyEl.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(polyEl);

        const sum = pts.reduce((acc, p) => ({ x: acc.x + (p.x / 100) * W, y: acc.y + (p.y / 100) * H }), { x: 0, y: 0 });
        const fontSize = Math.max(11, Math.min(20, Math.round(Math.min(W, H) * 0.11)));
        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', (sum.x / pts.length).toFixed(1));
        txt.setAttribute('y', ((sum.y / pts.length) + fontSize * 0.35).toFixed(1));
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', 'Arial, sans-serif');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('font-size', String(fontSize));
        txt.setAttribute('fill', '#173823');
        txt.textContent = 'AREA ' + (num || '');
        svg.appendChild(txt);
    }

    updateModalAreaReadout(pts);
}

// Shared polygon handle/midpoint renderer & drag handler used by modal shape editors
function startModalPolyDrag(e, idx, opts) {
    e.preventDefault();
    e.stopPropagation();
    const board = document.getElementById(opts.boardId);
    const handlesLayer = document.getElementById(opts.handlesId);
    if (!board || !handlesLayer) return;

    opts.state.activeIdx = idx;
    const handleEls = handlesLayer.querySelectorAll('.me-vertex-handle');
    const midpointEls = handlesLayer.querySelectorAll('.me-midpoint-handle');
    handleEls.forEach(h => h.classList.toggle('is-active', parseInt(h.dataset.ptIndex, 10) === idx));

    const updateHandlePositions = () => {
        const pts = opts.state.points;
        handleEls.forEach(h => {
            const i = parseInt(h.dataset.ptIndex, 10);
            if (pts[i]) {
                h.style.left = `${pts[i].x}%`;
                h.style.top = `${pts[i].y}%`;
            }
        });
        midpointEls.forEach(m => {
            const i = parseInt(m.dataset.edgeIndex, 10);
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            if (a && b) {
                m.style.left = `${(a.x + b.x) / 2}%`;
                m.style.top = `${(a.y + b.y) / 2}%`;
            }
        });
    };

    const onMove = (moveEvt) => {
        const r = board.getBoundingClientRect();
        const rawX = ((moveEvt.clientX - r.left) / (r.width || 1)) * 100;
        const rawY = ((moveEvt.clientY - r.top) / (r.height || 1)) * 100;
        opts.state.points[idx] = opts.normalizePt(rawX, rawY, moveEvt);
        updateHandlePositions();
        opts.onSvgUpdate();
    };

    const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        opts.onCommit();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
}

function renderModalPolyHandles(opts) {
    const handlesLayer = document.getElementById(opts.handlesId);
    if (!handlesLayer) return;
    handlesLayer.innerHTML = '';

    const pts = opts.state.points;
    const ptsInput = document.getElementById(opts.ptsInputId);
    if (ptsInput && document.activeElement !== ptsInput) {
        ptsInput.value = pts.length;
    }

    const canAdd = pts.length < (window.ZMGFence ? ZMGFence.MAX_POLYGON_POINTS : 32);
    if (canAdd) {
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            const mid = document.createElement('div');
            mid.className = 'me-midpoint-handle is-shape';
            mid.dataset.edgeIndex = String(i);
            mid.textContent = '+';
            mid.title = 'Click or drag to split this side with a new corner';
            mid.style.left = `${(a.x + b.x) / 2}%`;
            mid.style.top = `${(a.y + b.y) / 2}%`;
            mid.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                pts.splice(i + 1, 0, {
                    x: Math.round(((a.x + b.x) / 2) * 100) / 100,
                    y: Math.round(((a.y + b.y) / 2) * 100) / 100
                });
                opts.state.activeIdx = i + 1;
                opts.onCommit();
                startModalPolyDrag(e, i + 1, opts);
            });
            handlesLayer.appendChild(mid);
        }
    }

    pts.forEach((pt, idx) => {
        const handle = document.createElement('div');
        handle.className = `me-vertex-handle is-shape ${opts.state.activeIdx === idx ? 'is-active' : ''}`;
        handle.dataset.ptIndex = String(idx);
        handle.title = `Point ${idx + 1} (drag to move, right-click or Alt+click to delete)`;
        handle.style.left = `${pt.x}%`;
        handle.style.top = `${pt.y}%`;

        const removePt = () => {
            if (pts.length <= 3) {
                notifyArea('Minimum Points Reached', opts.minPointsMessage || 'A custom shape requires at least 3 corner points.', 'warning');
                return;
            }
            pts.splice(idx, 1);
            opts.state.activeIdx = Math.max(0, Math.min(pts.length - 1, idx));
            opts.onCommit();
        };

        handle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removePt();
        });

        handle.addEventListener('mousedown', (e) => {
            if (e.button === 2 || (e.button === 0 && e.altKey)) {
                e.preventDefault();
                e.stopPropagation();
                removePt();
                return;
            }
            if (e.button !== 0) return;
            startModalPolyDrag(e, idx, opts);
        });

        handlesLayer.appendChild(handle);
    });
}

function getNewAreaModalPolyOpts() {
    return {
        boardId: 'newAreaEditorBoard',
        handlesId: 'newAreaEditorHandles',
        ptsInputId: 'newAreaPoints',
        state: modalShapeState,
        minPointsMessage: 'A polygon area requires at least 3 corner points.',
        normalizePt: (rawX, rawY, moveEvt) => {
            const cols = Math.max(4, Math.min(60, parseInt(document.getElementById('newAreaCols')?.value, 10) || 20));
            const rows = Math.max(4, Math.min(60, parseInt(document.getElementById('newAreaRows')?.value, 10) || 20));
            const snapChk = document.getElementById('newAreaSnapGrid');
            const snapEnabled = snapChk ? (snapChk.checked && !moveEvt.shiftKey) : !moveEvt.shiftKey;
            return normalizeModalGridPoint(rawX, rawY, cols, rows, snapEnabled);
        },
        onSvgUpdate: () => {
            renderModalAreaEditorSvgOnly();
            updateNewAreaHintOnly();
        },
        onCommit: () => {
            renderModalAreaEditor();
            updateNewAreaHintOnly();
        }
    };
}

function renderModalAreaEditor() {
    renderModalAreaEditorSvgOnly();
    renderModalPolyHandles(getNewAreaModalPolyOpts());
}

function updateNewAreaHintOnly() {
    const cols = Math.max(4, parseInt(document.getElementById('newAreaCols')?.value, 10) || 20);
    const rows = Math.max(4, parseInt(document.getElementById('newAreaRows')?.value, 10) || 20);
    const pts = modalShapeState.points || [];
    const num = document.getElementById('newAreaNumber')?.value || '';
    const name = (document.getElementById('newAreaName')?.value || '').trim();
    const usable = countUsableCellsInPolygon(cols, rows, pts);
    const hint = document.getElementById('newAreaHint');
    if (hint) {
        const lockNote = modalShapeState.lockedIdentity
            ? ' (Area name and number are locked because plots already exist here.)'
            : '';
        hint.textContent = `${cols} x ${rows} grid -> ~${usable} plot slots inside this ${pts.length}-point shape. Saves as "Area ${num} - ${name || 'Name'}".${lockNote}`;
    }
}

function updateNewAreaPreview() {
    renderModalAreaEditor();
    updateNewAreaHintOnly();
}

function applyModalPointCount(targetCount) {
    if (!window.ZMGFence) return;
    const cols = Math.max(4, parseInt(document.getElementById('newAreaCols')?.value, 10) || 20);
    const rows = Math.max(4, parseInt(document.getElementById('newAreaRows')?.value, 10) || 20);
    const count = Math.max(3, Math.min(32, Math.round(Number(targetCount) || 4)));
    modalShapeState.points = ZMGFence.resamplePolygonPoints(modalShapeState.points, count, cols / rows);
    modalShapeState.activeIdx = Math.min(modalShapeState.activeIdx, modalShapeState.points.length - 1);
    renderModalAreaEditor();
    updateNewAreaHintOnly();
}

function applyModalShapePreset(preset) {
    const cols = Math.max(4, parseInt(document.getElementById('newAreaCols')?.value, 10) || 20);
    const rows = Math.max(4, parseInt(document.getElementById('newAreaRows')?.value, 10) || 20);
    modalShapeState.points = getShapePresetPoints(preset, cols, rows);
    modalShapeState.activeIdx = 0;
    renderModalAreaEditor();
    updateNewAreaHintOnly();
}

function setModalIdentityLock(locked) {
    modalShapeState.lockedIdentity = !!locked;
    const nameEl = document.getElementById('newAreaName');
    const numEl = document.getElementById('newAreaNumber');
    if (nameEl) nameEl.readOnly = !!locked;
    if (numEl) numEl.readOnly = !!locked;
}

function openNewAreaModal() {
    const modal = document.getElementById('newAreaModal');
    if (!modal) return;
    areaPrefixTouched = false;
    modalShapeState = {
        editingLayerId: null,
        points: getShapePresetPoints('rect', 20, 20),
        activeIdx: 0,
        lockedIdentity: false
    };
    setModalIdentityLock(false);

    const titleEl = document.getElementById('newAreaModalTitle');
    const subEl = document.getElementById('newAreaModalSub');
    const submitBtn = document.getElementById('btnSubmitNewArea');
    if (titleEl) titleEl.textContent = 'Create New Cemetery Area';
    if (subEl) subEl.textContent = 'Design the custom polygon outline and plot grid for this area. Drag points or click edge + markers to reshape.';
    if (submitBtn) submitBtn.textContent = 'Create Area';

    const setVal2 = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    setVal2('newAreaName', '');
    setVal2('newAreaNumber', nextFreeAreaNumber());
    setVal2('newAreaPrefix', '');
    setVal2('newAreaCols', 20);
    setVal2('newAreaRows', 20);
    setVal2('newAreaPoints', 4);
    setVal2('newAreaCategory', 'Supreme');
    modal.classList.add('open');
    updateNewAreaPreview();
    const nameInput = document.getElementById('newAreaName');
    if (nameInput) setTimeout(() => nameInput.focus(), 50);
}

async function openEditAreaModal(layerId) {
    const v = vectorLayers.find(l => l.id === layerId && isShapeEditableLayer(l));
    const modal = document.getElementById('newAreaModal');
    if (!v || !modal) return;

    areaPrefixTouched = true;
    const existingPts = ensureCustomShapePoints(v).map(p => ({ x: p.x, y: p.y }));
    const plotCount = await countPlotsInSection(v.name);

    modalShapeState = {
        editingLayerId: v.id,
        points: existingPts,
        activeIdx: 0,
        lockedIdentity: plotCount > 0
    };
    setModalIdentityLock(plotCount > 0);

    const titleEl = document.getElementById('newAreaModalTitle');
    const subEl = document.getElementById('newAreaModalSub');
    const submitBtn = document.getElementById('btnSubmitNewArea');
    if (titleEl) titleEl.textContent = `Edit Area Shape: ${v.name}`;
    if (subEl) subEl.textContent = 'Reshape polygon points, insert corners on any edge, or update grid dimensions.';
    if (submitBtn) submitBtn.textContent = 'Save Area Changes';

    const strippedName = String(v.name || '').replace(/^Area\s+\d+\s*-\s*/i, '').trim();
    const setVal2 = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal2('newAreaName', strippedName || v.name || '');
    setVal2('newAreaNumber', parseInt(v.area, 10) || 13);
    setVal2('newAreaPrefix', v.prefix || suggestPrefix(strippedName));
    setVal2('newAreaCols', Number(v.cols) || 20);
    setVal2('newAreaRows', Number(v.rows) || 20);
    setVal2('newAreaPoints', existingPts.length);
    setVal2('newAreaCategory', v.category || 'Supreme');

    modal.classList.add('open');
    updateNewAreaPreview();
}

function closeNewAreaModal() {
    const modal = document.getElementById('newAreaModal');
    if (modal) modal.classList.remove('open');
}

function notifyArea(title, message, type) {
    if (typeof showNotification === 'function') showNotification(title, message, type || 'info');
    else alert(title + ': ' + message);
}

async function createCustomAreaFromForm() {
    if (!window.ZMGFence) return;
    const editingLayer = modalShapeState.editingLayerId
        ? vectorLayers.find(l => l.id === modalShapeState.editingLayerId)
        : null;

    const name = (document.getElementById('newAreaName')?.value || '').trim().replace(/\s+/g, ' ');
    const num = parseInt(document.getElementById('newAreaNumber')?.value, 10);
    const category = document.getElementById('newAreaCategory')?.value || 'Supreme';
    let prefix = (document.getElementById('newAreaPrefix')?.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cols = parseInt(document.getElementById('newAreaCols')?.value, 10);
    const rows = parseInt(document.getElementById('newAreaRows')?.value, 10);
    const pts = ZMGFence.sanitizePolygonPoints(modalShapeState.points, 3);

    if (!name || name.length > 40 || !/^[A-Za-z0-9 ()&'.-]+$/.test(name)) {
        notifyArea('Invalid Area Name', 'Enter a name up to 40 characters (letters, numbers, spaces and ( ) & . - only).', 'warning');
        return;
    }
    if (!Number.isInteger(num) || num < 1 || num > 999) {
        notifyArea('Invalid Area Number', 'Area number must be a whole number between 1 and 999.', 'warning');
        return;
    }
    if (!editingLayer || String(num) !== String(editingLayer.area)) {
        if (allUsedAreaNumbers().has(num)) {
            notifyArea('Area Number In Use', 'Area ' + num + ' already exists. Choose a different number.', 'warning');
            return;
        }
    }
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 4 || cols > 60 || rows < 4 || rows > 60) {
        notifyArea('Invalid Grid Size', 'Columns and rows must each be between 4 and 60.', 'warning');
        return;
    }
    if (!pts || pts.length < 3) {
        notifyArea('Invalid Shape', 'Define at least 3 polygon points.', 'warning');
        return;
    }
    if (!prefix) prefix = suggestPrefix(name);
    if (!editingLayer || prefix !== String(editingLayer.prefix || '').toUpperCase()) {
        if (allUsedPrefixes().has(prefix)) {
            notifyArea('Plot Prefix In Use', 'The plot ID prefix "' + prefix + '" is used by another area. Choose a unique prefix.', 'warning');
            return;
        }
    }

    const fullName = (editingLayer && modalShapeState.lockedIdentity)
        ? editingLayer.name
        : ('Area ' + num + ' - ' + name);
    const finalNum = (editingLayer && modalShapeState.lockedIdentity)
        ? String(editingLayer.area)
        : String(num);

    if ((!editingLayer || fullName !== editingLayer.name) && SECTION_SHAPE_MAP[fullName]) {
        notifyArea('Area Exists', '"' + fullName + '" already exists.', 'warning');
        return;
    }

    const shapeAspect = parseFloat((rows / Math.max(1, cols)).toFixed(4));
    const svgUrl = ZMGFence.buildAreaSvgDataUrl(cols, rows, finalNum, pts, shapeAspect);

    if (editingLayer) {
        const beforeSnap = captureMapSnapshot(`edit ${fullName}`);
        editingLayer.area = finalNum;
        editingLayer.name = fullName;
        editingLayer.desc = fullName + ' memorial section';
        editingLayer.category = category;
        editingLayer.tab = ZMGFence.CATEGORY_TABS[category] || 'supreme';
        editingLayer.prefix = prefix;
        editingLayer.cols = cols;
        editingLayer.rows = rows;
        if (!editingLayer.preserveCustomSrc) {
            editingLayer.shapeAspect = shapeAspect;
            editingLayer.points = pts;
            editingLayer.src = svgUrl;
        }

        commitMapUndo(beforeSnap, `edit ${fullName}`);
        syncCustomAreasFromLayers();
        closeNewAreaModal();
        renderVectorMap();
        renderLayerSidebar();
        selectVector(editingLayer.id, false);
        await persistMapStateNow();
        if (currentMode === 'plots') {
            const select = document.getElementById('editorSectionSelect');
            if (select) {
                select.value = fullName;
                updateAreaActionButtons();
                loadPlotSectionData();
            }
        }
        notifyArea('Area Updated', '"' + fullName + '" shape and grid settings were updated.', 'success');
        return;
    }

    const widthPct = parseFloat(Math.max(8, Math.min(26, 14 * Math.sqrt((cols * rows) / (24 * 24)))).toFixed(1));
    const wPx = widthPct / 100 * BOARD_WIDTH;
    const hPx = wPx * rows / cols;
    const spot = findFreeMapSpot(wPx, hPx);
    const maxAreaZ = Math.max(...vectorLayers.filter(l => l.kind !== 'entrance').map(l => Number(l.zIndex) || 0), 5);

    const beforeSnap = captureMapSnapshot(`create ${fullName}`);
    const layer = {
        id: 'area-custom-' + finalNum + '-' + Date.now(),
        kind: 'area',
        custom: true,
        area: finalNum,
        name: fullName,
        desc: fullName + ' memorial section',
        category: category,
        tab: ZMGFence.CATEGORY_TABS[category] || 'supreme',
        prefix: prefix,
        cols: cols,
        rows: rows,
        shapeAspect: shapeAspect,
        points: pts,
        src: svgUrl,
        left: spot.left,
        top: spot.top,
        width: widthPct,
        rotate: 0,
        opacity: 0.95,
        zIndex: Math.min(20, maxAreaZ + 1),
        visible: true
    };

    vectorLayers.push(layer);
    commitMapUndo(beforeSnap, `create ${fullName}`);
    syncCustomAreasFromLayers();
    closeNewAreaModal();

    if (currentMode === 'plots') {
        selectedVectorIds = new Set([layer.id]);
        activeVectorId = layer.id;
        activeSelectionType = 'vector';
        const select = document.getElementById('editorSectionSelect');
        if (select) {
            select.value = fullName;
            updateAreaActionButtons();
            loadPlotSectionData();
        }
    } else {
        renderVectorMap();
        renderLayerSidebar();
        selectVector(layer.id, false);
    }

    await persistMapStateNow();
    notifyArea('Area Created', '"' + fullName + '" was placed on the map with its custom ' + pts.length + '-point shape.', 'success');
}

async function countPlotsInSection(sectionName) {
    try {
        const { count, error } = await supabaseClient
            .from('memorial_spaces')
            .select('id', { count: 'exact', head: true })
            .eq('section_name', sectionName);
        if (error) throw error;
        return count || 0;
    } catch (e) {
        console.warn('Plot count notice:', e);
        return -1;
    }
}

async function canRemoveCustomArea(sectionName) {
    const count = await countPlotsInSection(sectionName);
    if (count > 0) {
        notifyArea('Area Still Has Plots', '"' + sectionName + '" still contains ' + count + ' plot(s). Clear all plots in this area first (Plot Layouts - Clear), then delete the area.', 'warning');
        return false;
    }
    if (count < 0) {
        notifyArea('Could Not Verify Plots', 'Unable to check this area for plots right now. Try again once you are online.', 'warning');
        return false;
    }
    return true;
}

async function deleteSelectedCustomArea() {
    const select = document.getElementById('editorSectionSelect');
    if (!select) return;
    const name = select.value;
    const shape = SECTION_SHAPE_MAP[name];
    if (!shape || !shape.custom) return;
    if (!(await canRemoveCustomArea(name))) return;

    if (!await showConfirmModal({ title: 'Delete Custom Area', message: 'Delete "' + name + '" from the map? Its blueprint layer will be removed.', confirmText: 'Delete Area', cancelText: 'Cancel', type: 'warning', danger: true })) return;

    const beforeSnap = captureMapSnapshot(`delete ${name}`);
    const removedIds = new Set(vectorLayers.filter(v => v.custom && v.name === name).map(v => v.id));
    if (pointEditState && pointEditState.mode === 'shape' && removedIds.has(pointEditState.layerId)) {
        pointEditState = null;
    }
    vectorLayers = vectorLayers.filter(v => !(v.custom && v.name === name));
    commitMapUndo(beforeSnap, `delete ${name}`);
    selectedVectorIds.clear();
    activeVectorId = vectorLayers[0]?.id || null;
    syncCustomAreasFromLayers();
    if (select.options.length > 0) select.selectedIndex = 0;
    updateAreaActionButtons();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();
    await persistMapStateNow();
    if (currentMode === 'plots') loadPlotSectionData();
    notifyArea('Area Deleted', '"' + name + '" was removed.', 'info');
}

function openAreaInPlotEditor(v) {
    const select = document.getElementById('editorSectionSelect');
    if (!select || !v) return;
    const exists = Array.from(select.options).some(o => o.value === v.name);
    if (!exists) {
        notifyArea('No Plot Grid', 'This layer is not linked to a plot area.', 'info');
        return;
    }
    select.value = v.name;
    switchEditorMode('plots');
    updateAreaActionButtons();
}

function initNewAreaSystem() {
    const bind = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };
    bind('btnNewAreaTop', 'click', openNewAreaModal);
    bind('btnNewAreaSidebar', 'click', openNewAreaModal);
    bind('btnCreateAreaFromGallery', 'click', () => { closeVectorAssetModal(); openNewAreaModal(); });
    bind('btnDeleteAreaSidebar', 'click', deleteSelectedCustomArea);
    bind('btnCloseNewAreaModal', 'click', closeNewAreaModal);
    bind('btnCancelNewArea', 'click', closeNewAreaModal);
    bind('editorSectionSelect', 'change', updateAreaActionButtons);

    const modal = document.getElementById('newAreaModal');
    let modalMouseDownTarget = null;
    if (modal) {
        modal.addEventListener('mousedown', (e) => { modalMouseDownTarget = e.target; });
        modal.addEventListener('click', (e) => {
            if (e.target === modal && modalMouseDownTarget === modal) closeNewAreaModal();
        });
    }

    const form = document.getElementById('newAreaForm');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); createCustomAreaFromForm(); });

    ['newAreaName', 'newAreaNumber', 'newAreaCols', 'newAreaRows'].forEach(id => bind(id, 'input', updateNewAreaPreview));
    bind('newAreaPoints', 'change', () => {
        const val = parseInt(document.getElementById('newAreaPoints')?.value, 10) || 4;
        applyModalPointCount(val);
    });
    bind('btnModalApplyPoints', 'click', () => {
        const val = parseInt(document.getElementById('newAreaPoints')?.value, 10) || 4;
        applyModalPointCount(val);
    });
    bind('btnModalAddPoint', 'click', () => {
        const cur = (modalShapeState.points || []).length || 4;
        applyModalPointCount(Math.min(32, cur + 1));
    });
    bind('btnModalRemovePoint', 'click', () => {
        const cur = (modalShapeState.points || []).length || 4;
        applyModalPointCount(Math.max(3, cur - 1));
    });
    bind('btnModalResetShape', 'click', () => applyModalShapePreset('rect'));

    document.querySelectorAll('#newAreaPresetBar .me-shape-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyModalShapePreset(btn.dataset.shapePreset || 'rect');
        });
    });

    bind('newAreaName', 'input', () => {
        if (areaPrefixTouched || modalShapeState.lockedIdentity) return;
        const prefixEl = document.getElementById('newAreaPrefix');
        if (prefixEl) prefixEl.value = suggestPrefix(document.getElementById('newAreaName').value);
    });
    bind('newAreaPrefix', 'input', () => { areaPrefixTouched = true; });
}

// ==============================================================================
// CUSTOM NON-PLOT MAP PARTS SYSTEM (WALLS, SIDE BLOCKS, LANDMARKS)
// ==============================================================================
let partModalState = {
    editingLayerId: null,
    points: [],
    activeIdx: 0,
    aspect: 1,
    defaultWidth: 16
};

function readPartModalStyleValues() {
    const aspectPct = Math.max(15, Math.min(300, parseFloat(document.getElementById('partAspectPct')?.value) || 100));
    const sw = parseFloat(document.getElementById('partStrokeWidth')?.value);
    return {
        name: (document.getElementById('partName')?.value || '').trim(),
        label: (document.getElementById('partLabel')?.value || '').trim().slice(0, 24),
        fill: normalizeHex6(document.getElementById('partFillColor')?.value, '#f3ecd8'),
        stroke: normalizeHex6(document.getElementById('partStrokeColor')?.value, '#2f332e'),
        strokeWidth: Number.isFinite(sw) ? Math.max(0, Math.min(12, sw)) : 2.5,
        aspect: parseFloat((aspectPct / 100).toFixed(4)),
        dashed: !!document.getElementById('partDashed')?.checked,
        fenceInclude: document.getElementById('partFenceInclude') ? !!document.getElementById('partFenceInclude').checked : true,
        fenceExclude: document.getElementById('partFenceInclude') ? !document.getElementById('partFenceInclude').checked : false
    };
}

function syncPartPresetHighlight(presetKey) {
    document.querySelectorAll('#mapPartPresetBar .me-shape-preset-btn').forEach(btn => {
        btn.classList.toggle('is-active', !!presetKey && btn.dataset.partPreset === presetKey);
    });
}

function syncPartSwatchHighlight() {
    const fill = normalizeHex6(document.getElementById('partFillColor')?.value, '');
    const stroke = normalizeHex6(document.getElementById('partStrokeColor')?.value, '');
    document.querySelectorAll('#partColorSwatches .me-swatch-btn').forEach(btn => {
        const match = normalizeHex6(btn.dataset.fill, '') === fill && normalizeHex6(btn.dataset.stroke, '') === stroke;
        btn.classList.toggle('is-active', match);
    });
}

function renderMapPartSvgOnly() {
    const svg = document.getElementById('mapPartEditorSvg');
    const board = document.getElementById('mapPartEditorBoard');
    if (!svg || !board) return;

    const style = readPartModalStyleValues();
    partModalState.aspect = style.aspect;
    const pts = partModalState.points;

    const maxW = 340;
    const maxH = 236;
    const scale = Math.min(maxW / 100, maxH / (100 * style.aspect));
    const W = Math.max(72, Math.round(100 * scale));
    const H = Math.max(48, Math.round(100 * style.aspect * scale));
    board.style.width = `${W}px`;
    board.style.height = `${H}px`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const svgNS = 'http://www.w3.org/2000/svg';
    let gridPath = '';
    for (let x = 20; x < 100; x += 20) {
        const px = ((x / 100) * W).toFixed(1);
        gridPath += `M${px},0V${H}`;
    }
    for (let y = 20; y < 100; y += 20) {
        const py = ((y / 100) * H).toFixed(1);
        gridPath += `M0,${py}H${W}`;
    }
    if (gridPath) {
        const gridEl = document.createElementNS(svgNS, 'path');
        gridEl.setAttribute('d', gridPath);
        gridEl.setAttribute('stroke', '#dde5de');
        gridEl.setAttribute('stroke-width', '0.8');
        gridEl.setAttribute('fill', 'none');
        svg.appendChild(gridEl);
    }

    if (pts.length >= 3) {
        const ptStr = pts.map(p => `${((p.x / 100) * W).toFixed(1)},${((p.y / 100) * H).toFixed(1)}`).join(' ');
        const polyEl = document.createElementNS(svgNS, 'polygon');
        polyEl.setAttribute('points', ptStr);
        polyEl.setAttribute('fill', style.fill);
        polyEl.setAttribute('stroke', style.strokeWidth > 0 ? style.stroke : 'none');
        polyEl.setAttribute('stroke-width', String(style.strokeWidth));
        polyEl.setAttribute('stroke-linejoin', 'round');
        if (style.dashed && style.strokeWidth > 0) {
            polyEl.setAttribute('stroke-dasharray', '6 4');
        }
        svg.appendChild(polyEl);

        if (style.label) {
            const sum = pts.reduce((acc, p) => ({ x: acc.x + (p.x / 100) * W, y: acc.y + (p.y / 100) * H }), { x: 0, y: 0 });
            const fontSize = Math.max(10, Math.min(18, Math.round(Math.min(W, H) * 0.14)));
            const txt = document.createElementNS(svgNS, 'text');
            txt.setAttribute('x', (sum.x / pts.length).toFixed(1));
            txt.setAttribute('y', ((sum.y / pts.length) + fontSize * 0.35).toFixed(1));
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('font-family', 'Arial, sans-serif');
            txt.setAttribute('font-weight', '700');
            txt.setAttribute('font-size', String(fontSize));
            txt.setAttribute('fill', '#232822');
            txt.textContent = style.label;
            svg.appendChild(txt);
        }
    }

    const readout = document.getElementById('mapPartActivePtReadout');
    if (readout) {
        const idx = Math.max(0, Math.min(pts.length - 1, partModalState.activeIdx || 0));
        const pt = pts[idx];
        readout.textContent = pt
            ? `Pt ${idx + 1}/${pts.length}: ${Math.round(pt.x)}%, ${Math.round(pt.y)}%`
            : `${pts.length} pts`;
    }
}

function getMapPartModalPolyOpts() {
    return {
        boardId: 'mapPartEditorBoard',
        handlesId: 'mapPartEditorHandles',
        ptsInputId: 'mapPartPoints',
        state: partModalState,
        minPointsMessage: 'A custom map part requires at least 3 corner points.',
        normalizePt: (rawX, rawY, moveEvt) => {
            const x = Math.max(0, Math.min(100, rawX));
            const y = Math.max(0, Math.min(100, rawY));
            const snapChk = document.getElementById('mapPartSnapGrid');
            const snapEnabled = snapChk ? (snapChk.checked && !moveEvt.shiftKey) : false;
            if (snapEnabled) {
                return {
                    x: Math.max(0, Math.min(100, Math.round(x / 5) * 5)),
                    y: Math.max(0, Math.min(100, Math.round(y / 5) * 5))
                };
            }
            return {
                x: Math.round(x * 2) / 2,
                y: Math.round(y * 2) / 2
            };
        },
        onSvgUpdate: renderMapPartSvgOnly,
        onCommit: renderMapPartModal
    };
}

function renderMapPartModal() {
    renderMapPartSvgOnly();
    renderModalPolyHandles(getMapPartModalPolyOpts());
}

function applyPartModalPointCount(nextCount) {
    if (!window.ZMGFence) return;
    const minP = ZMGFence.MIN_POLYGON_POINTS || 3;
    const maxP = ZMGFence.MAX_POLYGON_POINTS || 32;
    const count = Math.max(minP, Math.min(maxP, parseInt(nextCount, 10) || 4));
    partModalState.points = ZMGFence.resamplePolygonPoints(partModalState.points, count, partModalState.aspect || 1);
    partModalState.activeIdx = Math.min(partModalState.activeIdx, partModalState.points.length - 1);
    renderMapPartModal();
}

function applyPartPreset(presetKey) {
    if (!window.ZMGFence || !ZMGFence.PART_PRESETS) return;
    const preset = ZMGFence.PART_PRESETS[presetKey] || ZMGFence.PART_PRESETS.block;
    const setElVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    setElVal('partName', preset.name);
    setElVal('partLabel', preset.label || '');
    setElVal('partFillColor', normalizeHex6(preset.fill, '#f3ecd8'));
    setElVal('partStrokeColor', normalizeHex6(preset.stroke, '#2f332e'));
    setElVal('partStrokeWidth', preset.strokeWidth ?? 2.5);
    setElVal('partAspectPct', Math.round((preset.shapeAspect || 1) * 100));
    const dashedEl = document.getElementById('partDashed');
    if (dashedEl) dashedEl.checked = !!preset.dashed;
    const fenceEl = document.getElementById('partFenceInclude');
    if (fenceEl) fenceEl.checked = preset.fenceInclude !== false;

    partModalState.points = preset.points.map(p => ({ x: p.x, y: p.y }));
    partModalState.activeIdx = 0;
    partModalState.aspect = preset.shapeAspect || 1;
    partModalState.defaultWidth = preset.width || 16;

    syncPartPresetHighlight(presetKey);
    syncPartSwatchHighlight();
    renderMapPartModal();
}

function openNewPartModal(presetKey = 'block') {
    const modal = document.getElementById('mapPartModal');
    if (!modal || !window.ZMGFence) return;

    partModalState.editingLayerId = null;
    const titleEl = document.getElementById('mapPartModalTitle');
    const subEl = document.getElementById('mapPartModalSub');
    const submitBtn = document.getElementById('btnSubmitMapPart');
    if (titleEl) titleEl.textContent = 'Add Custom Map Part';
    if (subEl) subEl.textContent = 'Create structural blocks, entrance wing walls, borders, roundabouts, or custom non-plot shapes. Drag points or click edge + markers to reshape.';
    if (submitBtn) submitBtn.textContent = 'Add Part to Map';

    applyPartPreset(presetKey);
    modal.classList.add('open');
    const nameInput = document.getElementById('partName');
    if (nameInput) setTimeout(() => nameInput.focus(), 50);
}

function openEditPartModal(layerId) {
    const v = vectorLayers.find(l => l.id === layerId && l.kind === 'decor');
    const modal = document.getElementById('mapPartModal');
    if (!v || !modal || !window.ZMGFence) return;

    const existingPts = ensureCustomShapePoints(v).map(p => ({ x: p.x, y: p.y }));
    const aspect = (v.shapeAspect && Number(v.shapeAspect) > 0) ? Number(v.shapeAspect) : 1;

    partModalState = {
        editingLayerId: v.id,
        points: existingPts,
        activeIdx: 0,
        aspect,
        defaultWidth: Number(v.width) || 16
    };

    const titleEl = document.getElementById('mapPartModalTitle');
    const subEl = document.getElementById('mapPartModalSub');
    const submitBtn = document.getElementById('btnSubmitMapPart');
    if (titleEl) titleEl.textContent = `Edit Map Part: ${v.name}`;
    if (subEl) subEl.textContent = 'Update polygon corners, proportions, colors, border thickness, or fence wrapping.';
    if (submitBtn) submitBtn.textContent = 'Save Part Changes';

    const setElVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setElVal('partName', v.name || 'Custom Map Part');
    setElVal('partLabel', v.label || '');
    setElVal('partFillColor', normalizeHex6(v.fill, '#f3ecd8'));
    setElVal('partStrokeColor', normalizeHex6(v.stroke, '#2f332e'));
    setElVal('partStrokeWidth', v.strokeWidth ?? 2.5);
    setElVal('partAspectPct', Math.round(aspect * 100));
    setElVal('mapPartPoints', existingPts.length);
    const dashedEl = document.getElementById('partDashed');
    if (dashedEl) dashedEl.checked = !!v.dashed;
    const fenceEl = document.getElementById('partFenceInclude');
    if (fenceEl) fenceEl.checked = v.fenceExclude !== true;

    syncPartPresetHighlight(null);
    syncPartSwatchHighlight();
    modal.classList.add('open');
    renderMapPartModal();
}

function closeMapPartModal() {
    const modal = document.getElementById('mapPartModal');
    if (modal) modal.classList.remove('open');
}

async function saveCustomPartFromForm() {
    if (!window.ZMGFence) return;
    const style = readPartModalStyleValues();
    if (!style.name) {
        notifyArea('Missing Name', 'Please enter a layer name for this map part.', 'warning');
        return;
    }

    const pts = ZMGFence.sanitizePolygonPoints(partModalState.points, 3);
    if (!pts || pts.length < 3) {
        notifyArea('Invalid Shape', 'Please define at least 3 corner points for the part shape.', 'warning');
        return;
    }

    const editingLayer = partModalState.editingLayerId
        ? vectorLayers.find(l => l.id === partModalState.editingLayerId && l.kind === 'decor')
        : null;

    if (editingLayer) {
        const beforeSnap = captureMapSnapshot(`edit ${style.name}`);
        const oldMetrics = shapeLayerBoxMetrics(editingLayer);
        const nextH = oldMetrics.boxW * style.aspect;
        editingLayer.top = parseFloat((((oldMetrics.cy - nextH / 2) / BOARD_HEIGHT) * 100).toFixed(2));
        editingLayer.name = style.name;
        editingLayer.label = style.label;
        editingLayer.desc = style.label ? `${style.name} (${style.label})` : `${style.name} map structure`;
        editingLayer.fill = style.fill;
        editingLayer.stroke = style.stroke;
        editingLayer.strokeWidth = style.strokeWidth;
        editingLayer.dashed = style.dashed;
        editingLayer.fenceInclude = style.fenceInclude;
        editingLayer.fenceExclude = style.fenceExclude;
        editingLayer.shapeAspect = style.aspect;
        editingLayer.points = pts;
        editingLayer.src = ZMGFence.buildPartSvgDataUrl(editingLayer);

        commitMapUndo(beforeSnap, `edit ${style.name}`);
        closeMapPartModal();
        if (currentMode !== 'map') switchEditorMode('map');
        renderVectorMap();
        renderLayerSidebar();
        selectVector(editingLayer.id, false);
        renderPointOverlay();
        scheduleFence();
        await persistMapStateNow();
        notifyArea('Map Part Updated', `"${style.name}" was updated on the map.`, 'success');
        return;
    }

    const beforeSnap = captureMapSnapshot(`add ${style.name}`);
    const widthPct = Math.max(4, Math.min(85, Number(partModalState.defaultWidth) || 16));
    const wPx = (widthPct / 100) * BOARD_WIDTH;
    const hPx = wPx * style.aspect;
    const spot = findFreeMapSpot(wPx, hPx);
    const maxNonEntranceZ = Math.max(...vectorLayers.filter(l => l.kind !== 'entrance').map(l => Number(l.zIndex) || 0), 5);

    const layer = {
        id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        kind: 'decor',
        custom: false,
        area: null,
        tab: null,
        name: style.name,
        desc: style.label ? `${style.name} (${style.label})` : `${style.name} map structure`,
        label: style.label,
        src: '',
        left: spot.left,
        top: spot.top,
        width: widthPct,
        rotate: 0,
        opacity: 1.0,
        zIndex: Math.min(8, maxNonEntranceZ + 1),
        visible: true,
        shapeAspect: style.aspect,
        points: pts,
        fill: style.fill,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        dashed: style.dashed,
        fenceInclude: style.fenceInclude,
        fenceExclude: style.fenceExclude
    };
    layer.src = ZMGFence.buildPartSvgDataUrl(layer);

    vectorLayers.push(layer);
    commitMapUndo(beforeSnap, `add ${style.name}`);
    closeMapPartModal();
    if (currentMode !== 'map') switchEditorMode('map');
    pointEditState = null;
    renderVectorMap();
    renderLayerSidebar();
    selectVector(layer.id, false);
    renderPointOverlay();
    scheduleFence();
    await persistMapStateNow();
    notifyArea('Map Part Added', `"${style.name}" was added. Drag into position or press P to reshape corners over the map.`, 'success');
}

function initMapPartSystem() {
    const bind = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };

    bind('btnAddPartTop', 'click', () => openNewPartModal('block'));
    bind('btnCreatePartFromGallery', 'click', () => {
        closeVectorAssetModal();
        openNewPartModal('block');
    });
    bind('btnCloseMapPartModal', 'click', closeMapPartModal);
    bind('btnCancelMapPart', 'click', closeMapPartModal);

    const modal = document.getElementById('mapPartModal');
    let modalMouseDownTarget = null;
    if (modal) {
        modal.addEventListener('mousedown', (e) => { modalMouseDownTarget = e.target; });
        modal.addEventListener('click', (e) => {
            if (e.target === modal && modalMouseDownTarget === modal) closeMapPartModal();
        });
    }

    const form = document.getElementById('mapPartForm');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); saveCustomPartFromForm(); });

    document.querySelectorAll('#mapPartPresetBar .me-shape-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPartPreset(btn.dataset.partPreset || 'block');
        });
    });

    document.querySelectorAll('#partColorSwatches .me-swatch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fillEl = document.getElementById('partFillColor');
            const strokeEl = document.getElementById('partStrokeColor');
            if (fillEl && btn.dataset.fill) fillEl.value = btn.dataset.fill;
            if (strokeEl && btn.dataset.stroke) strokeEl.value = btn.dataset.stroke;
            syncPartSwatchHighlight();
            renderMapPartSvgOnly();
        });
    });

    ['partLabel', 'partFillColor', 'partStrokeColor', 'partStrokeWidth', 'partAspectPct'].forEach(id => {
        bind(id, 'input', () => {
            syncPartSwatchHighlight();
            renderMapPartSvgOnly();
        });
    });
    bind('partDashed', 'change', renderMapPartSvgOnly);

    bind('mapPartPoints', 'change', () => {
        const val = parseInt(document.getElementById('mapPartPoints')?.value, 10) || 4;
        applyPartModalPointCount(val);
    });
    bind('btnPartApplyPoints', 'click', () => {
        const val = parseInt(document.getElementById('mapPartPoints')?.value, 10) || 4;
        applyPartModalPointCount(val);
    });
    bind('btnPartAddPoint', 'click', () => {
        const cur = (partModalState.points || []).length || 4;
        applyPartModalPointCount(Math.min(32, cur + 1));
    });
    bind('btnPartRemovePoint', 'click', () => {
        const cur = (partModalState.points || []).length || 4;
        applyPartModalPointCount(Math.max(3, cur - 1));
    });
    bind('btnPartResetShape', 'click', () => {
        if (!window.ZMGFence) return;
        partModalState.points = ZMGFence.defaultShapePoints(4, partModalState.aspect || 1);
        partModalState.activeIdx = 0;
        renderMapPartModal();
    });
}

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

    // Auto-Fill, Save to DB, and Clear Section action buttons
    const btnAutoFill = document.getElementById('btnAutoFillPlots');
    if (btnAutoFill) btnAutoFill.addEventListener('click', autoFillPlotsInCurrentSection);

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

function loadShapeMaskDataAsync(assetSrc, cols, rows) {
    return new Promise((resolve) => {
        if (!assetSrc) { resolve(null); return; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const offCanvas = document.createElement('canvas');
                offCanvas.width = cols;
                offCanvas.height = rows;
                const offCtx = offCanvas.getContext('2d');
                offCtx.drawImage(img, 0, 0, cols, rows);
                resolve(offCtx.getImageData(0, 0, cols, rows).data);
            } catch (_) {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = assetSrc;
    });
}

async function generateMaskedPlotsForShape(sectionName, shapeInfo, opts = {}) {
    if (!shapeInfo) return [];
    const cols = Number(shapeInfo.cols) || 28;
    const rows = Number(shapeInfo.rows) || 28;
    const w = Math.max(1, Number(opts.w) || 1);
    const h = Math.max(1, Number(opts.h) || 1);
    const prefix = shapeInfo.prefix || 'PL';
    const validCategories = ['Condominium', 'Single Teired', 'Supreme', 'Special Supreme', 'Mausoleum', 'Family Estate Jr.'];
    const targetCategory = validCategories.includes(opts.category)
        ? opts.category
        : (validCategories.includes(shapeInfo.category) ? shapeInfo.category : 'Supreme');
    const spec = CATEGORY_DEFAULT_SPECS[targetCategory] || { price: 65000, down: 9500 };
    const status = opts.status || 'available';
    const existing = Array.isArray(opts.existingPlots) ? opts.existingPlots : [];

    const maskData = await loadShapeMaskDataAsync(shapeInfo.asset, cols, rows);
    const isCellMasked = (c, r) => {
        if (c < 1 || c > cols || r < 1 || r > rows) return false;
        if (!maskData) return true;
        const idx = ((r - 1) * cols + (c - 1)) * 4 + 3;
        return maskData[idx] > 30;
    };
    const isRectInside = (col, row, pw, ph) => {
        for (let rr = row; rr < row + ph; rr++) {
            for (let cc = col; cc < col + pw; cc++) {
                if (!isCellMasked(cc, rr)) return false;
            }
        }
        return true;
    };
    const collides = (col, row, pw, ph, list) => list.some(p => {
        const pc = p.col_num || 1;
        const pr = p.row_num || 1;
        const pw2 = p.coordinates?.col_span || p.coordinates?.width || 1;
        const ph2 = p.coordinates?.row_span || p.coordinates?.height || 1;
        return col < pc + pw2 && col + pw > pc && row < pr + ph2 && row + ph > pr;
    });

    let maxNum = 0;
    existing.forEach(p => {
        if (p.plot_identifier && p.plot_identifier.startsWith(prefix)) {
            const parts = p.plot_identifier.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    });

    const created = [];
    const combined = existing.slice();
    const stepC = w;
    const stepR = h;
    for (let r = 1; r <= rows - h + 1; r += stepR) {
        for (let c = 1; c <= cols - w + 1; c += stepC) {
            if (!isRectInside(c, r, w, h)) continue;
            if (collides(c, r, w, h, combined)) continue;
            maxNum++;
            const plot = {
                id: `plot-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${maxNum}`,
                plot_identifier: `${prefix}-${String(maxNum).padStart(3, '0')}`,
                section_name: sectionName,
                category: targetCategory,
                status: status,
                price: spec.price,
                down_payment: spec.down,
                col_num: c,
                row_num: r,
                coordinates: { col_span: w, row_span: h, width: w, height: h }
            };
            created.push(plot);
            combined.push(plot);
        }
    }
    return created;
}

async function savePlotsPayloadForSection(sectionName, plotsList) {
    if (!plotsList || plotsList.length === 0) return;
    syncPlotSectionLocalCache(sectionName, plotsList);
    if (typeof supabaseClient === 'undefined') return;
    const validCategories = ['Condominium', 'Single Teired', 'Supreme', 'Special Supreme', 'Mausoleum', 'Family Estate Jr.'];
    const payload = plotsList.map(p => ({
        plot_identifier: p.plot_identifier,
        section_name: sectionName,
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
        await supabaseClient
            .from('memorial_spaces')
            .upsert(payload, { onConflict: 'plot_identifier' });
    } catch (err) {
        console.warn('Background plot upsert notice:', err);
    }
}

async function autoFillPlotsInCurrentSection() {
    const sectionSelect = document.getElementById('editorSectionSelect');
    const chosenSection = sectionSelect ? sectionSelect.value : 'Area 2 - Lawn of Love';
    const shapeInfo = SECTION_SHAPE_MAP[chosenSection];
    if (!shapeInfo) return;

    const btn = document.getElementById('btnAutoFillPlots');
    if (btn) { btn.disabled = true; btn.textContent = 'Filling...'; }

    try {
        let created = await generateMaskedPlotsForShape(chosenSection, shapeInfo, {
            w: BUILDER_STATE.plotWidth,
            h: BUILDER_STATE.plotHeight,
            category: BUILDER_STATE.selectedCategory,
            status: BUILDER_STATE.plotStatus,
            existingPlots: currentPlotsList
        });

        // If WxH is too large for a thin/curved strip, retry automatically with 1x1 plots
        if (created.length === 0 && (BUILDER_STATE.plotWidth > 1 || BUILDER_STATE.plotHeight > 1)) {
            created = await generateMaskedPlotsForShape(chosenSection, shapeInfo, {
                w: 1,
                h: 1,
                category: BUILDER_STATE.selectedCategory,
                status: BUILDER_STATE.plotStatus,
                existingPlots: currentPlotsList
            });
        }

        if (created.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('No Empty Cells', `No available empty cells found inside ${chosenSection}.`, 'info');
            }
            return;
        }

        currentPlotsList = currentPlotsList.concat(created);
        recordPlotHistory({
            type: 'add',
            plots: created.map(p => ({ ...p, coordinates: { ...(p.coordinates || {}) } })),
            description: `auto-fill ${created.length} plots in ${chosenSection}`
        });
        syncPlotSectionLocalCache(chosenSection, currentPlotsList);
        updatePlotKPIs();
        renderAreaBlueprintGrid();
        renderPlotQuickList();

        if (typeof showNotification === 'function') {
            showNotification('Plots Auto-Filled', `Added ${created.length} plots inside ${chosenSection}. Click "Save to DB" to publish.`, 'success');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Auto-Fill Plots'; }
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

        if (isDraggingVertex || e.target.closest('.me-vertex-overlay')) return;

        const isMiddleClick = e.button === 1;
        const isLeftClick = e.button === 0;
        const hitVector = e.target.closest('.me-vec-element');
        const hitPointUI = e.target.closest('.me-vertex-overlay');
        const hitUnlockedBp = blueprintConfig.unlocked && e.target.id === 'blueprintImg';

        // Pan if middle click, spacebar held, OR clicking on empty canvas/stage/locked blueprint
        if (isMiddleClick || spacebarPressed || (isLeftClick && !hitVector && !hitPointUI && !hitUnlockedBp)) {
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
                if (!panHasMoved && isLeftClick && !hitVector && !hitPointUI && !hitUnlockedBp) {
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
    const btnReopenLeft = document.getElementById('btnReopenLeftPanel');
    const btnReopenRight = document.getElementById('btnReopenRightPanel');
    const panelLeft = document.getElementById('panelLeft');
    const panelRight = document.getElementById('panelRight');

    const toggleLeft = () => {
        if (!panelLeft) return;
        panelLeft.classList.toggle('collapsed');
        const isCollapsed = panelLeft.classList.contains('collapsed');
        if (btnCollapseLeft) btnCollapseLeft.textContent = isCollapsed ? '▶' : '◀';
        if (btnCollapseLeftPlot) btnCollapseLeftPlot.textContent = isCollapsed ? '▶' : '◀';
        if (btnReopenLeft) btnReopenLeft.classList.toggle('is-visible', isCollapsed);
        setTimeout(autoFitCanvas, 220);
    };

    const toggleRight = () => {
        if (!panelRight) return;
        panelRight.classList.toggle('collapsed');
        const isCollapsed = panelRight.classList.contains('collapsed');
        if (btnCollapseRight) btnCollapseRight.textContent = isCollapsed ? '◀' : '▶';
        if (btnReopenRight) btnReopenRight.classList.toggle('is-visible', isCollapsed);
        setTimeout(autoFitCanvas, 220);
    };

    if (btnCollapseLeft) btnCollapseLeft.addEventListener('click', toggleLeft);
    if (btnCollapseLeftPlot) btnCollapseLeftPlot.addEventListener('click', toggleLeft);
    if (btnCollapseRight) btnCollapseRight.addEventListener('click', toggleRight);
    if (btnReopenLeft) btnReopenLeft.addEventListener('click', toggleLeft);
    if (btnReopenRight) btnReopenRight.addEventListener('click', toggleRight);
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
        const invZoom = Math.max(0.7, Math.min(2.2, 1 / Math.max(0.35, currentZoom || 1)));
        stage.style.setProperty('--me-inv-zoom', invZoom.toFixed(3));
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
// 4. MAP HISTORY (UNDO / REDO), CLIPBOARD, Z-ORDER & SHORTCUTS
// ==============================================================================
let mapClipboardFromCut = false;

function captureMapSnapshot(label = '') {
    return {
        label,
        vectorsJson: JSON.stringify(vectorLayers),
        fenceJson: JSON.stringify(fenceConfig),
        selectedIds: Array.from(selectedVectorIds),
        activeId: activeVectorId,
        pointEdit: pointEditState ? { ...pointEditState } : null
    };
}

function snapshotsEqual(a, b) {
    return !!a && !!b && a.vectorsJson === b.vectorsJson && a.fenceJson === b.fenceJson;
}

function updateMapHistoryButtons() {
    const undoBtn = document.getElementById('btnUndoMap');
    const redoBtn = document.getElementById('btnRedoMap');
    if (undoBtn) {
        undoBtn.disabled = mapUndoStack.length === 0;
        const lastLabel = mapUndoStack.length > 0 ? mapUndoStack[mapUndoStack.length - 1].label : '';
        undoBtn.title = lastLabel ? `Undo ${lastLabel} (Ctrl+Z)` : 'Undo (Ctrl+Z)';
    }
    if (redoBtn) {
        redoBtn.disabled = mapRedoStack.length === 0;
        const nextLabel = mapRedoStack.length > 0 ? mapRedoStack[mapRedoStack.length - 1].label : '';
        redoBtn.title = nextLabel ? `Redo ${nextLabel} (Ctrl+Y / Ctrl+Shift+Z)` : 'Redo (Ctrl+Y / Ctrl+Shift+Z)';
    }
}

function resetMapUndoHistory() {
    mapUndoStack.length = 0;
    mapRedoStack.length = 0;
    mapUndoLastCoalesceKey = '';
    mapUndoLastCoalesceAt = 0;
    updateMapHistoryButtons();
}

function commitMapUndo(beforeSnap, label = '', coalesceKey = null, coalesceMs = 800) {
    if (!beforeSnap) return;
    const afterSnap = captureMapSnapshot(label);
    if (snapshotsEqual(beforeSnap, afterSnap)) return;

    const now = Date.now();
    if (coalesceKey && mapUndoLastCoalesceKey === coalesceKey && (now - mapUndoLastCoalesceAt) < coalesceMs && mapUndoStack.length > 0) {
        mapUndoLastCoalesceAt = now;
        mapRedoStack.length = 0;
        updateMapHistoryButtons();
        return;
    }

    mapUndoStack.push({
        ...beforeSnap,
        label: label || beforeSnap.label || 'change'
    });
    if (mapUndoStack.length > MAX_MAP_HISTORY) mapUndoStack.shift();
    mapRedoStack.length = 0;
    mapUndoLastCoalesceKey = coalesceKey || '';
    mapUndoLastCoalesceAt = coalesceKey ? now : 0;
    updateMapHistoryButtons();
}

function restoreMapSnapshot(snap) {
    if (!snap) return;
    try {
        const parsedVectors = JSON.parse(snap.vectorsJson);
        if (Array.isArray(parsedVectors)) {
            vectorLayers = parsedVectors
                .filter(v => v && !isLegacyWallLayer(v))
                .map(v => normalizeEditorVector({ visible: true, ...v }));
        }
        const parsedFence = JSON.parse(snap.fenceJson || '{"mode":"auto","points":[]}');
        fenceConfig = window.ZMGFence ? ZMGFence.writeStoredFenceConfig(parsedFence) : parsedFence;
    } catch (err) {
        console.warn('Could not restore map history snapshot:', err);
        return;
    }

    const validIds = new Set(vectorLayers.map(l => l.id));
    selectedVectorIds = new Set((snap.selectedIds || []).filter(id => validIds.has(id)));
    activeVectorId = (snap.activeId && validIds.has(snap.activeId))
        ? snap.activeId
        : (Array.from(selectedVectorIds)[0] || null);
    activeSelectionType = selectedVectorIds.size > 0 ? 'vector' : null;

    if (snap.pointEdit && snap.pointEdit.mode === 'wall') {
        pointEditState = { mode: 'wall' };
    } else if (snap.pointEdit && snap.pointEdit.mode === 'shape' && validIds.has(snap.pointEdit.layerId)) {
        pointEditState = { mode: 'shape', layerId: snap.pointEdit.layerId };
    } else {
        pointEditState = null;
    }

    syncCustomAreasFromLayers();
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    updateWallPointsInspector();
    renderPointOverlay();
    updateFence();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    updateMapHistoryButtons();
}

function undoMapAction() {
    if (mapUndoStack.length === 0) {
        if (typeof showNotification === 'function') showNotification('Undo', 'Nothing to undo', 'info');
        return;
    }
    const prevSnap = mapUndoStack.pop();
    mapRedoStack.push(captureMapSnapshot(prevSnap.label));
    mapUndoLastCoalesceKey = '';
    mapUndoLastCoalesceAt = 0;
    restoreMapSnapshot(prevSnap);
    if (typeof showNotification === 'function') {
        showNotification('Undo', `Undid ${prevSnap.label || 'map change'}`, 'info');
    }
}

function redoMapAction() {
    if (mapRedoStack.length === 0) {
        if (typeof showNotification === 'function') showNotification('Redo', 'Nothing to redo', 'info');
        return;
    }
    const nextSnap = mapRedoStack.pop();
    mapUndoStack.push(captureMapSnapshot(nextSnap.label));
    mapUndoLastCoalesceKey = '';
    mapUndoLastCoalesceAt = 0;
    restoreMapSnapshot(nextSnap);
    if (typeof showNotification === 'function') {
        showNotification('Redo', `Redid ${nextSnap.label || 'map change'}`, 'info');
    }
}

function getActionableSelectedVectors() {
    if (selectedVectorIds.size === 0 && activeVectorId) {
        selectedVectorIds.add(activeVectorId);
    }
    return vectorLayers.filter(l => selectedVectorIds.has(l.id) && !isLegacyWallLayer(l));
}

function makeUniqueLayerCopyName(baseName, existingNames) {
    const clean = String(baseName || 'Vector Layer').replace(/\s*\(Copy(?:\s+\d+)?\)$/i, '').trim() || 'Vector Layer';
    let candidate = `${clean} (Copy)`;
    let idx = 2;
    while (existingNames.has(candidate.toLowerCase())) {
        candidate = `${clean} (Copy ${idx++})`;
    }
    existingNames.add(candidate.toLowerCase());
    return candidate;
}

function cloneVectorForInsertion(src, stepIdx, usedAreaNums, usedPrefixes, existingNames, batchIdx, preserveCutArea) {
    const copy = JSON.parse(JSON.stringify(src));
    const offset = 2.5 * Math.max(1, stepIdx || 1);
    let nextLeft = parseFloat(((Number(src.left) || 20) + offset).toFixed(1));
    let nextTop = parseFloat(((Number(src.top) || 20) + offset).toFixed(1));
    if (nextLeft > 92) nextLeft = parseFloat(((Number(src.left) || 20) - 8).toFixed(1));
    if (nextTop > 92) nextTop = parseFloat(((Number(src.top) || 20) - 8).toFixed(1));

    const maxZ = Math.max(...vectorLayers.map(l => Number(l.zIndex) || 0), 5);
    copy.left = nextLeft;
    copy.top = nextTop;
    copy.zIndex = Math.min(99, maxZ + 1 + batchIdx);
    copy.visible = true;

    const uid = `${Date.now()}-${batchIdx}-${Math.floor(Math.random() * 1000)}`;
    if (copy.custom) {
        const origNum = parseInt(src.area, 10);
        const origPrefix = String(src.prefix || '').toUpperCase();
        const canReuseOrig = preserveCutArea
            && Number.isInteger(origNum)
            && !usedAreaNums.has(origNum)
            && (!origPrefix || !usedPrefixes.has(origPrefix))
            && (typeof SECTION_SHAPE_MAP === 'undefined' || !SECTION_SHAPE_MAP[src.name]);

        if (canReuseOrig) {
            usedAreaNums.add(origNum);
            if (origPrefix) usedPrefixes.add(origPrefix);
            copy.id = `area-custom-${origNum}-${uid}`;
            existingNames.add(String(copy.name || '').toLowerCase());
        } else {
            let n = 13;
            while (usedAreaNums.has(n)) n++;
            usedAreaNums.add(n);

            const stripped = String(src.name || 'Custom Area')
                .replace(/^Area\s+\d+\s*-\s*/i, '')
                .replace(/\s*\(Copy(?:\s+\d+)?\)$/i, '')
                .trim() || 'Section';
            const copyLabel = `${stripped.slice(0, 31).trim()} (Copy)`;
            let fullName = `Area ${n} - ${copyLabel}`;
            while (existingNames.has(fullName.toLowerCase())) {
                n++;
                while (usedAreaNums.has(n)) n++;
                usedAreaNums.add(n);
                fullName = `Area ${n} - ${copyLabel}`;
            }
            existingNames.add(fullName.toLowerCase());

            const basePrefix = (origPrefix || suggestPrefix(stripped)).replace(/[0-9]+$/, '') || 'AR';
            let nextPrefix = origPrefix && !usedPrefixes.has(origPrefix) ? origPrefix : `${basePrefix}${n}`;
            let pCounter = 2;
            while (usedPrefixes.has(nextPrefix)) nextPrefix = `${basePrefix}${pCounter++}`;
            usedPrefixes.add(nextPrefix);

            copy.area = String(n);
            copy.prefix = nextPrefix;
            copy.name = fullName;
            copy.desc = `${fullName} memorial section`;
            copy.id = `area-custom-${n}-${uid}`;
            if (window.ZMGFence && !copy.preserveCustomSrc) {
                copy.src = ZMGFence.buildAreaSvgDataUrl(copy.cols || 20, copy.rows || 20, copy.area, copy.points, copy.shapeAspect);
            }
        }
    } else if (copy.kind === 'decor') {
        copy.id = `part-${uid}`;
        if (existingNames.has(String(copy.name || '').toLowerCase())) {
            copy.name = makeUniqueLayerCopyName(copy.name || 'Custom Map Part', existingNames);
        } else {
            existingNames.add(String(copy.name || '').toLowerCase());
        }
        if (window.ZMGFence) {
            copy.src = ZMGFence.buildPartSvgDataUrl(copy);
        }
    } else if (copy.kind === 'entrance') {
        copy.id = `entrance-${uid}`;
        if (existingNames.has(String(copy.name || '').toLowerCase())) {
            copy.name = makeUniqueLayerCopyName(copy.name || 'Entrance Gate', existingNames);
        } else {
            existingNames.add(String(copy.name || '').toLowerCase());
        }
    } else {
        copy.id = `vec-${uid}`;
        if (existingNames.has(String(copy.name || '').toLowerCase())) {
            copy.name = makeUniqueLayerCopyName(copy.name || 'Vector Layer', existingNames);
        } else {
            existingNames.add(String(copy.name || '').toLowerCase());
        }
    }
    return copy;
}

function insertClonedVectors(sourceItems, stepOffset, label, preserveCutArea = false) {
    if (!sourceItems || sourceItems.length === 0) return [];
    const beforeSnap = captureMapSnapshot(label);
    const usedAreaNums = allUsedAreaNumbers();
    const usedPrefixes = allUsedPrefixes();
    const existingNames = new Set(vectorLayers.map(l => String(l.name || '').toLowerCase()));

    const inserted = [];
    sourceItems.forEach((src, idx) => {
        if (!src || isLegacyWallLayer(src)) return;
        const copy = cloneVectorForInsertion(src, stepOffset, usedAreaNums, usedPrefixes, existingNames, idx, preserveCutArea);
        vectorLayers.push(copy);
        if (copy.kind === 'entrance') snapEntranceLayer(copy);
        inserted.push(copy);
    });

    if (inserted.length === 0) return [];

    selectedVectorIds = new Set(inserted.map(l => l.id));
    activeVectorId = inserted[inserted.length - 1].id;
    activeSelectionType = 'vector';
    if (pointEditState && pointEditState.mode === 'shape') pointEditState = null;

    syncCustomAreasFromLayers();
    commitMapUndo(beforeSnap, label);
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    updateWallPointsInspector();
    renderPointOverlay();
    scheduleFence();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    return inserted;
}

function copySelectedVectors() {
    const items = getActionableSelectedVectors();
    if (items.length === 0) return;
    mapClipboard = items.map(v => JSON.parse(JSON.stringify(v)));
    mapPasteCounter = 0;
    mapClipboardFromCut = false;
    if (typeof showNotification === 'function') {
        showNotification('Copied', `Copied ${items.length} layer${items.length === 1 ? '' : 's'} to clipboard.`, 'info');
    }
}

async function cutSelectedVectors() {
    const items = getActionableSelectedVectors();
    if (items.length === 0) return;

    const customItems = items.filter(v => v.custom);
    for (const cv of customItems) {
        if (!(await canRemoveCustomArea(cv.name))) return;
    }

    const beforeSnap = captureMapSnapshot(`cut ${items.length === 1 ? items[0].name : `${items.length} layers`}`);
    mapClipboard = items.map(v => JSON.parse(JSON.stringify(v)));
    mapPasteCounter = 0;
    mapClipboardFromCut = true;

    const cutIds = new Set(items.map(v => v.id));
    vectorLayers = vectorLayers.filter(l => !cutIds.has(l.id));
    if (pointEditState && pointEditState.mode === 'shape' && cutIds.has(pointEditState.layerId)) {
        pointEditState = null;
    }

    syncCustomAreasFromLayers();
    deselectAll();
    commitMapUndo(beforeSnap, items.length === 1 ? `cut ${items[0].name}` : `cut ${items.length} layers`);
    renderVectorMap();
    renderLayerSidebar();
    updateWallPointsInspector();
    scheduleFence();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    if (typeof showNotification === 'function') {
        showNotification('Cut', `Cut ${items.length} layer${items.length === 1 ? '' : 's'} (Ctrl+V to paste, Ctrl+Z to undo).`, 'info');
    }
}

function pasteClipboardVectors() {
    if (!mapClipboard || mapClipboard.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Clipboard Empty', 'Select a vector layer and press Ctrl+C or Ctrl+X first.', 'info');
        }
        return;
    }
    const useCutReuse = mapClipboardFromCut && mapPasteCounter === 0;
    mapPasteCounter++;
    mapClipboardFromCut = false;
    const step = useCutReuse ? 0 : mapPasteCounter;
    const inserted = insertClonedVectors(mapClipboard, step, `paste ${mapClipboard.length} layer${mapClipboard.length === 1 ? '' : 's'}`, useCutReuse);
    if (inserted.length > 0 && typeof showNotification === 'function') {
        showNotification('Pasted', `Pasted ${inserted.length} layer${inserted.length === 1 ? '' : 's'} onto canvas.`, 'success');
    }
}

function duplicateSelectedVectors() {
    const items = getActionableSelectedVectors();
    if (items.length === 0) return;
    const inserted = insertClonedVectors(items, 1, items.length === 1 ? `duplicate ${items[0].name}` : `duplicate ${items.length} layers`, false);
    if (inserted.length > 0 && typeof showNotification === 'function') {
        showNotification('Duplicated', `Duplicated ${inserted.length} layer${inserted.length === 1 ? '' : 's'}.`, 'success');
    }
}

function reorderSelectedVectors(mode) {
    const items = getActionableSelectedVectors();
    if (items.length === 0) return;

    const beforeSnap = captureMapSnapshot(`reorder (${mode})`);
    const selectedSet = new Set(items.map(v => v.id));
    const sortedSel = [...items].sort((a, b) => (Number(a.zIndex) || 5) - (Number(b.zIndex) || 5));

    if (mode === 'front') {
        const others = vectorLayers.filter(l => !selectedSet.has(l.id));
        const maxOther = others.length > 0 ? Math.max(...others.map(l => Number(l.zIndex) || 5)) : 5;
        let nextZ = maxOther + 1;
        if (nextZ + sortedSel.length - 1 > 99) {
            const overflow = (nextZ + sortedSel.length - 1) - 99;
            others.forEach(l => { l.zIndex = Math.max(1, (Number(l.zIndex) || 5) - overflow); });
            nextZ = Math.max(1, 99 - sortedSel.length + 1);
        }
        sortedSel.forEach((v, idx) => { v.zIndex = Math.min(99, nextZ + idx); });
    } else if (mode === 'back') {
        const others = vectorLayers.filter(l => !selectedSet.has(l.id));
        const minOther = others.length > 0 ? Math.min(...others.map(l => Number(l.zIndex) || 5)) : 5;
        if (minOther > sortedSel.length) {
            const startZ = Math.max(1, minOther - sortedSel.length);
            sortedSel.forEach((v, idx) => { v.zIndex = startZ + idx; });
        } else {
            const shift = sortedSel.length + 1 - minOther;
            others.forEach(l => { l.zIndex = Math.min(99, (Number(l.zIndex) || 5) + shift); });
            sortedSel.forEach((v, idx) => { v.zIndex = 1 + idx; });
        }
    } else if (mode === 'forward') {
        sortedSel.forEach(v => { v.zIndex = Math.min(99, (Number(v.zIndex) || 5) + 1); });
    } else if (mode === 'backward') {
        sortedSel.forEach(v => { v.zIndex = Math.max(1, (Number(v.zIndex) || 5) - 1); });
    }

    commitMapUndo(beforeSnap, `reorder (${mode})`, `z-${mode}`);
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
}

function toggleVectorVisibility(explicitIds = null, forceVisible = null) {
    const ids = (Array.isArray(explicitIds) && explicitIds.length > 0)
        ? explicitIds
        : getActionableSelectedVectors().map(l => l.id);
    if (ids.length === 0) return;

    const beforeSnap = captureMapSnapshot('toggle visibility');
    let changed = false;
    ids.forEach(id => {
        const v = vectorLayers.find(l => l.id === id);
        if (!v) return;
        const nextVis = forceVisible === null ? !v.visible : !!forceVisible;
        if (v.visible !== nextVis) {
            v.visible = nextVis;
            changed = true;
        }
    });
    if (!changed) return;

    commitMapUndo(beforeSnap, 'toggle visibility');
    renderVectorMap();
    renderLayerSidebar();
    updateVectorInspector();
    renderPointOverlay();
    scheduleFence();
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
    persistEditorVectorsToSupabase();
}

function openShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) modal.classList.add('open');
}

function closeShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) modal.classList.remove('open');
}

function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) modal.classList.toggle('open');
}

function isEditableKeyboardTarget(target) {
    if (!target) return false;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return true;
    if (target.isContentEditable) return true;
    if (typeof target.closest === 'function' && target.closest('[contenteditable="true"]')) return true;
    return false;
}

function closeTopOpenEditorOverlay() {
    const overlayIds = ['shortcutsModal', 'mapPartModal', 'newAreaModal', 'addVectorModal', 'addPlotModal'];
    for (const id of overlayIds) {
        const el = document.getElementById(id);
        if (el && el.classList.contains('open')) {
            el.classList.remove('open');
            return true;
        }
    }
    return false;
}

function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        // 1. Escape always closes open editor overlays cleanly (even when an input inside is focused)
        if (e.key === 'Escape' && closeTopOpenEditorOverlay()) {
            e.preventDefault();
            return;
        }

        // Ignore shortcuts behind open dialogs/modals
        if (document.querySelector('.me-overlay.open, .modal-overlay.open')) return;

        // Ignore typing in input fields
        if (isEditableKeyboardTarget(e.target) || isEditableKeyboardTarget(document.activeElement)) return;

        const key = String(e.key || '').toLowerCase();
        const hasPrimaryMod = (e.ctrlKey || e.metaKey) && !e.altKey;
        const noMods = !e.ctrlKey && !e.metaKey && !e.altKey;

        // Help Modal Toggle (?)
        if (noMods && e.key === '?') {
            e.preventDefault();
            toggleShortcutsModal();
            return;
        }

        // Ctrl + S: Save layout or plots
        if (hasPrimaryMod && !e.shiftKey && key === 's') {
            e.preventDefault();
            if (currentMode === 'map') {
                saveVectorLayout();
            } else {
                saveCurrentPlotLayoutToDatabase();
            }
            return;
        }

        // ── PLOT MODE SHORTCUTS ──
        if (currentMode === 'plots') {
            // Undo: Ctrl+Z / Cmd+Z
            if (hasPrimaryMod && !e.shiftKey && key === 'z') {
                e.preventDefault();
                undoPlotAction();
                return;
            }

            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if ((hasPrimaryMod && !e.shiftKey && key === 'y') || (hasPrimaryMod && e.shiftKey && key === 'z')) {
                e.preventDefault();
                redoPlotAction();
                return;
            }

            // Delete selected plot: Delete / Backspace
            if (noMods && !e.shiftKey && (e.key === 'Delete' || e.key === 'Backspace') && activePlotId) {
                e.preventDefault();
                const plot = currentPlotsList.find(p => p.id === activePlotId);
                if (plot) deletePlotDirectly(plot);
                return;
            }

            // Tool switching: 1 or 'v' (Select), 2 or 'p' (Place), 3 or 'e' (Erase)
            if (noMods && !e.shiftKey && (e.key === '1' || key === 'v')) {
                e.preventDefault();
                setBuilderTool('select');
                return;
            }
            if (noMods && !e.shiftKey && (e.key === '2' || key === 'p')) {
                e.preventDefault();
                setBuilderTool('place');
                return;
            }
            if (noMods && !e.shiftKey && (e.key === '3' || key === 'e')) {
                e.preventDefault();
                setBuilderTool('erase');
                return;
            }

            // Deselect with Escape
            if (noMods && e.key === 'Escape') {
                e.preventDefault();
                selectPlot(null);
                setBuilderTool('select');
                return;
            }

            // Arrow key nudge for selected plot
            if (noMods && activePlotId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
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

        // ── MAP MODE SHORTCUTS ──
        if (currentMode === 'map') {
            // Undo: Ctrl+Z / Cmd+Z
            if (hasPrimaryMod && !e.shiftKey && key === 'z') {
                e.preventDefault();
                undoMapAction();
                return;
            }

            // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
            if ((hasPrimaryMod && !e.shiftKey && key === 'y') || (hasPrimaryMod && e.shiftKey && key === 'z')) {
                e.preventDefault();
                redoMapAction();
                return;
            }

            // Duplicate: Ctrl+D / Cmd+D
            if (hasPrimaryMod && !e.shiftKey && key === 'd') {
                e.preventDefault();
                duplicateSelectedVectors();
                return;
            }

            // Select All visible layers: Ctrl+A / Cmd+A
            if (hasPrimaryMod && !e.shiftKey && key === 'a') {
                e.preventDefault();
                selectedVectorIds = new Set(vectorLayers.filter(l => l.visible && !isLegacyWallLayer(l)).map(l => l.id));
                activeVectorId = Array.from(selectedVectorIds)[0] || null;
                activeSelectionType = selectedVectorIds.size > 0 ? 'vector' : null;
                syncSelectionUI();
                updateVectorInspector();
                focusVectorInspector();
                return;
            }

            const hasNativeTextSel = window.getSelection && String(window.getSelection()).trim().length > 0;

            // Copy: Ctrl+C / Cmd+C
            if (hasPrimaryMod && !e.shiftKey && key === 'c' && !hasNativeTextSel) {
                if (getActionableSelectedVectors().length > 0) {
                    e.preventDefault();
                    copySelectedVectors();
                    return;
                }
            }

            // Cut: Ctrl+X / Cmd+X
            if (hasPrimaryMod && !e.shiftKey && key === 'x' && !hasNativeTextSel) {
                if (getActionableSelectedVectors().length > 0) {
                    e.preventDefault();
                    cutSelectedVectors();
                    return;
                }
            }

            // Paste: Ctrl+V / Cmd+V
            if (hasPrimaryMod && !e.shiftKey && key === 'v') {
                e.preventDefault();
                pasteClipboardVectors();
                return;
            }

            // Layer Z-Order: Ctrl+[ (Send to Back), Ctrl+] (Bring to Front), [ (Backward), ] (Forward)
            if (hasPrimaryMod && (e.key === ']' || e.code === 'BracketRight')) {
                e.preventDefault();
                reorderSelectedVectors('front');
                return;
            }
            if (hasPrimaryMod && (e.key === '[' || e.code === 'BracketLeft')) {
                e.preventDefault();
                reorderSelectedVectors('back');
                return;
            }
            if (noMods && !e.shiftKey && (e.key === ']' || e.code === 'BracketRight')) {
                e.preventDefault();
                reorderSelectedVectors('forward');
                return;
            }
            if (noMods && !e.shiftKey && (e.key === '[' || e.code === 'BracketLeft')) {
                e.preventDefault();
                reorderSelectedVectors('backward');
                return;
            }

            // Toggle Visibility: H
            if (noMods && !e.shiftKey && key === 'h' && getActionableSelectedVectors().length > 0) {
                e.preventDefault();
                toggleVectorVisibility(null, null);
                return;
            }

            // Toggle Shape Points Editing: P
            if (noMods && !e.shiftKey && key === 'p') {
                e.preventDefault();
                const targetLayer = vectorLayers.find(l => l.id === activeVectorId);
                if (isShapeEditableLayer(targetLayer)) {
                    toggleShapePointEdit(targetLayer.id);
                } else if (typeof showNotification === 'function') {
                    showNotification('Shape Points', 'Select a custom cemetery area first to edit its polygon corner points.', 'info');
                }
                return;
            }

            // Quick Action: Rotate Left (-5° / -15°) with K
            if (noMods && key === 'k' && (selectedVectorIds.size > 0 || activeVectorId)) {
                e.preventDefault();
                quickRotateSelected(e.shiftKey ? -15 : -5, true);
                return;
            }

            // Quick Action: Rotate Right (+5° / +15°) with L
            if (noMods && key === 'l' && (selectedVectorIds.size > 0 || activeVectorId)) {
                e.preventDefault();
                quickRotateSelected(e.shiftKey ? 15 : 5, true);
                return;
            }

            // Quick Action: Reset Rotation to 0° with R
            if (noMods && !e.shiftKey && key === 'r' && (selectedVectorIds.size > 0 || activeVectorId)) {
                e.preventDefault();
                quickRotateSelected(0, false);
                return;
            }

            // Escape: Exit Point Edit mode first, then Deselect
            if (noMods && e.key === 'Escape') {
                e.preventDefault();
                if (pointEditState) {
                    pointEditState = null;
                    renderPointOverlay();
                    updateWallPointsInspector();
                    updateVectorInspector();
                } else {
                    deselectAll();
                }
                return;
            }

            // Arrow key nudge for Blueprint Reference
            if (noMods && activeSelectionType === 'blueprint' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
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

            // Arrow key nudge for Background Image
            if (noMods && activeSelectionType === 'bg' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
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

            // Delete & Arrow nudge for Selected Vector(s)
            if (selectedVectorIds.size > 0 || activeVectorId) {
                if (noMods && !e.shiftKey && (e.key === 'Delete' || e.key === 'Backspace')) {
                    e.preventDefault();
                    deleteSelectedVectors();
                    return;
                }

                if (noMods && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                    const step = e.shiftKey ? 2.0 : 0.5;
                    if (selectedVectorIds.size === 0 && activeVectorId) {
                        selectedVectorIds.add(activeVectorId);
                    }
                    const beforeSnap = captureMapSnapshot('nudge layer');
                    let movedAny = false;
                    selectedVectorIds.forEach(id => {
                        const v = vectorLayers.find(l => l.id === id);
                        if (!v || !v.visible) return;
                        if (e.key === 'ArrowLeft')  v.left = parseFloat((v.left - step).toFixed(1));
                        if (e.key === 'ArrowRight') v.left = parseFloat((v.left + step).toFixed(1));
                        if (e.key === 'ArrowUp')    v.top  = parseFloat((v.top - step).toFixed(1));
                        if (e.key === 'ArrowDown')  v.top  = parseFloat((v.top + step).toFixed(1));
                        movedAny = true;

                        const targetEl = document.querySelector(`.me-vec-element[data-vector-id="${v.id}"]`);
                        if (targetEl) {
                            targetEl.style.left = `${v.left}%`;
                            targetEl.style.top  = `${v.top}%`;
                        }
                    });

                    if (movedAny) {
                        commitMapUndo(beforeSnap, 'nudge layer', 'kbd-nudge');
                        renderLayerSidebar();
                        updateVectorInspector();
                        renderPointOverlay();
                        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(vectorLayers));
                    }
                    return;
                }
            }
        }

        // ── GLOBAL CANVAS / VIEW SHORTCUTS ──
        // Spacebar panning handled in initCanvasPanHandlers

        // Center canvas with Home or '0'
        if (noMods && (e.key === 'Home' || (e.key === '0' && !e.shiftKey))) {
            e.preventDefault();
            centerCanvas();
            return;
        }

        // Fit canvas with 'f' or 'F' (never hijacks Ctrl+F)
        if (noMods && !e.shiftKey && key === 'f') {
            e.preventDefault();
            autoFitCanvas();
            return;
        }

        // Quick Action: Scale / Size (+) or Canvas Zoom In
        if (noMods && (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd')) {
            e.preventDefault();
            if (currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
                quickResizeSelected(e.shiftKey ? 2.0 : 0.5);
                return;
            }
            applyZoom(currentZoom + 0.15);
            return;
        }

        // Quick Action: Scale / Size (-) or Canvas Zoom Out
        if (noMods && (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract')) {
            e.preventDefault();
            if (currentMode === 'map' && (selectedVectorIds.size > 0 || activeVectorId)) {
                quickResizeSelected(e.shiftKey ? -2.0 : -0.5);
                return;
            }
            applyZoom(currentZoom - 0.15);
            return;
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

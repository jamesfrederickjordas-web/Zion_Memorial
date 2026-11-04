// ==============================================================================
// DASHBOARD COMPONENT LOADER & CONTROLLER (Supabase Live Integration)
// ==============================================================================

async function loadDashboardComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading dashboard component:', error);
    }
}

async function loadAllDashboardComponents() {
    // Load all dashboard components
    await Promise.all([
        loadDashboardComponent('sidebar-component', 'components/dashboard-sidebar.html'),
        loadDashboardComponent('header-component', 'components/dashboard-header.html'),
        loadDashboardComponent('content-component', 'components/dashboard-content.html'),
        loadDashboardComponent('profile-modal-component', 'components/profile-modal.html'),
        loadDashboardComponent('reservation-modal-component', 'components/reservation-modal.html'),
        loadDashboardComponent('edit-profile-page-component', 'components/edit-profile-page.html'),
        loadDashboardComponent('change-password-modal-component', 'components/change-password-modal.html'),
        loadDashboardComponent('my-reservation-page-component', 'components/my-reservation-content.html'),
        loadDashboardComponent('deceased-family-page-component', 'components/deceased-family-content.html'),
        loadDashboardComponent('maintenance-page-component', 'components/maintenance-content.html'),
        loadDashboardComponent('support-tickets-page-component', 'components/support-tickets-content.html'),
        loadDashboardComponent('featured-spaces-page-component', 'components/featured-spaces-content.html')
    ]);
    
    console.log('All dashboard components loaded successfully');
    
    // Initialize dashboard functionality
    initializeDashboard();
    
    // Initialize Vector Map System
    if (typeof initVectorMapSystem === "function") {
        initVectorMapSystem();
    }
    
    // Initialize subpages
    if (typeof initEditProfilePage === 'function') {
        initEditProfilePage();
    }
    if (typeof initChangePasswordModule === 'function') {
        initChangePasswordModule();
    }
    if (typeof initMyReservationPage === 'function') {
        initMyReservationPage();
    }
    if (typeof initDeceasedFamilyPage === 'function') {
        initDeceasedFamilyPage();
    }
    if (typeof initMaintenancePage === 'function') {
        initMaintenancePage();
    }
    if (typeof initSupportTicketsPage === 'function') {
        initSupportTicketsPage();
    }
    if (typeof initFeaturedSpacesPage === 'function') {
        initFeaturedSpacesPage();
    }
}

// Global cache for plots in active section/category
let categoryAvailablePlotsCache = [];
let currentSectionAllPlotsCache = [];
let selectedPlotToBook = null;
let currentResAreaSectionName = 'Area 5 - Special Supreme Estate';
let currentResPlotFilter = 'all';
let currentResViewMode = 'blueprint'; // 'blueprint' or 'map'

// Exact Area Shape & Grid Blueprint Configuration (Matches Layout Studio 1:1)
const RES_SECTION_SHAPE_MAP = {
    'Area 1 - Single Tiered Lawn': {
        area: '1',
        asset: 'assets/images/Map/Vector (7).png',
        prefix: 'ST1',
        category: 'Single Teired',
        tab: 'single-teired',
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
        tab: 'special-supreme',
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
        tab: 'family-estate',
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
        tab: 'supreme',
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
        tab: 'special-supreme',
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
        tab: 'single-teired',
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
        tab: 'supreme',
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
        tab: 'supreme',
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
        tab: 'special-supreme',
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
        tab: 'condominium',
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
        tab: 'special-supreme',
        cols: 16,
        rows: 36,
        widthPx: 400,
        heightPx: 820
    },
    'Area 12 - Mausoleum Court': {
        area: '12',
        asset: 'assets/images/Map/Vector (4).png',
        prefix: 'MAUS',
        category: 'Mausoleum',
        tab: 'mausoleum',
        cols: 24,
        rows: 24,
        widthPx: 600,
        heightPx: 600
    }
};

const LAWN_TAB_TO_SECTIONS = {
    'condominium': ['Area 10 - Condominium Block A'],
    'single-teired': ['Area 1 - Single Tiered Lawn', 'Area 6 - Lawn of Peace'],
    'supreme': ['Area 4 - Supreme Garden', 'Area 7 - Lawn of Faith', 'Area 8 - Lawn of Grace'],
    'special-supreme': ['Area 5 - Special Supreme Estate', 'Area 2 - Lawn of Love', 'Area 9 - Lawn of Serenity', 'Area 11 - Lawn of Memories'],
    'family-estate': ['Area 3 - Lawn of Hope (Family Estate)'],
    'mausoleum': ['Area 12 - Mausoleum Court']
};

// Generates the exact 94-plot 2x3 Special Supreme layout for Area 5 from Layout Studio
function generateArea5ExactBlueprintLayout() {
    const plots = [];
    const sectionName = 'Area 5 - Special Supreme Estate';
    const category = 'Special Supreme';
    const price = 85000;
    const downPayment = 12500;
    let seq = 1;

    // 9 rows of 2x3 plots on the 22x28 grid, respecting the bottom-left contour cutout
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
                coordinates: {
                    width: 2,
                    height: 3,
                    col_span: 2,
                    row_span: 3
                }
            });
            seq++;
        }
    }
    return plots;
}

async function initializeDashboard() {
    // =========================================
    // 1. SUPABASE AUTH & SESSION CHECK
    // =========================================
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
        sessionStorage.clear();
        alert("Please login first to access the dashboard.");
        window.location.href = "index.html";
        return;
    }

    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userId", user.id);

    // =========================================
    // 2. LIVE PROFILE & DASHBOARD DATA SYNC
    // =========================================
    await loadLiveUserProfile(user);
    await refreshDashboardKPIs(user.id);

    // Initialize Notification Bell & Center
    if (typeof window.initDashboardNotifications === 'function') {
        window.initDashboardNotifications();
    }

    // =========================================
    // 3. LOGOUT FUNCTIONALITY
    // =========================================
    const signoutBtn = document.querySelector('.signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            if (await showConfirmModal({ title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", cancelText: "Cancel", type: "warning" })) {
                await supabaseClient.auth.signOut();
                sessionStorage.clear();
                localStorage.removeItem("rememberedPassword");
                window.location.href = "index.html";
            }
        });
    }

    // =========================================
    // 4. SIDEBAR MENU TOGGLE
    // =========================================
    const menuBtn = document.querySelector('.menu-btn');
    const userBtn = document.querySelector('.user-btn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');

    if (menuBtn && sidebarMenu && overlay) {
        menuBtn.addEventListener('click', () => {
            sidebarMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (closeBtn && sidebarMenu && overlay) {
        closeBtn.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (overlay && sidebarMenu) {
        overlay.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (userBtn) {
        userBtn.addEventListener('click', () => {
            openProfileModal();
        });
    }

    // Navigation Menu Items
    const featuredSpacesMenuItem = document.getElementById('featuredSpacesMenuItem');
    if (featuredSpacesMenuItem) {
        featuredSpacesMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openFeaturedSpacesPage === 'function') {
                window.openFeaturedSpacesPage();
            }
            updateActiveMenuItem('featuredspaces');
            closeSidebar();
        });
    }

    const btnOpenFeaturedDash = document.getElementById('btnOpenFeaturedSpacesDash');
    if (btnOpenFeaturedDash) {
        btnOpenFeaturedDash.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openFeaturedSpacesPage === 'function') {
                window.openFeaturedSpacesPage();
            }
        });
    }

    const profileMenuItem = document.getElementById('profileMenuItem');
    const dashboardMenuItem = document.getElementById('dashboardMenuItem');
    const reservePlotMenuItem = document.getElementById('reservePlotMenuItem');
    const myReservationMenuItem = document.getElementById('myReservationMenuItem');
    const deceasedFamilyMenuItem = document.getElementById('deceasedFamilyMenuItem');

    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeAllSubpages();
            openProfileModal();
            updateActiveMenuItem('profile');
            closeSidebar();
        });
    }

    if (dashboardMenuItem) {
        dashboardMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            updateActiveMenuItem('dashboard');
            closeSidebar();
        });
    }

    if (reservePlotMenuItem) {
        reservePlotMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeProfileModal();
            closeAllSubpages();
            openReservationModal();
            updateActiveMenuItem('reservation');
            closeSidebar();
        });
    }

    if (myReservationMenuItem) {
        myReservationMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            
            const myReservationPage = document.getElementById('myReservationPage');
            if (myReservationPage) {
                myReservationPage.classList.add('active');
                if (typeof window.loadMyReservations === 'function') {
                    window.loadMyReservations();
                }
            }
            updateActiveMenuItem('myreservation');
            closeSidebar();
        });
    }

    if (deceasedFamilyMenuItem) {
        deceasedFamilyMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            
            const deceasedFamilyPage = document.getElementById('deceasedFamilyPage');
            if (deceasedFamilyPage) {
                deceasedFamilyPage.classList.add('active');
            }
            updateActiveMenuItem('deceasedfamily');
            closeSidebar();
        });
    }

    const maintenanceMenuItem = document.getElementById('maintenanceMenuItem');
    const supportTicketsMenuItem = document.getElementById('supportTicketsMenuItem');

    if (maintenanceMenuItem) {
        maintenanceMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            if (typeof window.openMaintenancePage === 'function') {
                window.openMaintenancePage();
            } else {
                const page = document.getElementById('maintenancePage');
                if (page) page.classList.add('active');
            }
            updateActiveMenuItem('maintenance');
            closeSidebar();
        });
    }

    if (supportTicketsMenuItem) {
        supportTicketsMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            if (typeof window.openSupportTicketsPage === 'function') {
                window.openSupportTicketsPage();
            } else {
                const page = document.getElementById('supportTicketsPage');
                if (page) page.classList.add('active');
            }
            updateActiveMenuItem('support');
            closeSidebar();
        });
    }

    function closeSidebar() {
        if (sidebarMenu && overlay) {
            sidebarMenu.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    function clearDashboardMapHighlights() {
        const dashMap = document.getElementById('vectorMapCanvas') || document.getElementById('dashboardCenterMap');
        if (dashMap) {
            dashMap.querySelectorAll('.map-vector-element').forEach(el => {
                el.classList.remove('active-vector-zone', 'selected-vector');
            });
            dashMap.querySelectorAll('.map-polygon').forEach(p => p.classList.remove('active-zone'));
            dashMap.querySelectorAll('.map-lawn-badge').forEach(b => b.classList.remove('active-badge'));
        }
        document.querySelectorAll('.dashboard-map-hero .map-vector-element').forEach(el => {
            el.classList.remove('active-vector-zone', 'selected-vector');
        });
        sessionStorage.removeItem('selectedMapArea');
    }
    window.clearDashboardMapHighlights = clearDashboardMapHighlights;

    function closeAllSubpages() {
        const myRes = document.getElementById('myReservationPage');
        const decFam = document.getElementById('deceasedFamilyPage');
        const maint = document.getElementById('maintenancePage');
        const support = document.getElementById('supportTicketsPage');
        const editProf = document.getElementById('edit-profile-page-component');
        const payFullPage = document.getElementById('zmgPaymentsFullPage');
        const featSpaces = document.getElementById('featuredSpacesPage');
        if (featSpaces) featSpaces.classList.remove('active');
        if (myRes) myRes.classList.remove('active');
        if (decFam) decFam.classList.remove('active');
        if (maint) maint.classList.remove('active');
        if (support) support.classList.remove('active');
        if (payFullPage) payFullPage.classList.remove('active');
        if (editProf) {
            editProf.style.display = 'none';
            editProf.classList.remove('active');
        }
        clearDashboardMapHighlights();
    }
    window.closeAllSubpages = closeAllSubpages;

    function updateActiveMenuItem(page) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        if (page === 'profile' && profileMenuItem) profileMenuItem.classList.add('active');
        else if (page === 'dashboard' && dashboardMenuItem) dashboardMenuItem.classList.add('active');
        else if (page === 'reservation' && reservePlotMenuItem) reservePlotMenuItem.classList.add('active');
        else if (page === 'myreservation' && myReservationMenuItem) myReservationMenuItem.classList.add('active');
        else if (page === 'deceasedfamily' && deceasedFamilyMenuItem) deceasedFamilyMenuItem.classList.add('active');
        else if (page === 'maintenance' && maintenanceMenuItem) maintenanceMenuItem.classList.add('active');
        else if (page === 'support' && supportTicketsMenuItem) supportTicketsMenuItem.classList.add('active');
    }
    window.updateActiveMenuItem = updateActiveMenuItem;

    // =========================================
    // 5. PROFILE MODAL CONTROLS
    // =========================================
    const profileModal = document.querySelector('.profile-modal-overlay');
    const profileCloseBtn = document.querySelector('.profile-close-btn');
    const backToDashboardBtn = document.getElementById('backToDashboard');
    const profileMenuBtn = document.getElementById('profileMenuBtn');

    function openProfileModal() {
        if (profileModal) {
            profileModal.classList.add('active');
            updateActiveMenuItem('profile');
        }
    }

    function closeProfileModal() {
        if (profileModal) {
            profileModal.classList.remove('active');
            updateActiveMenuItem('dashboard');
        }
    }

    if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', closeProfileModal);
    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeProfileModal);
    const profileHeaderLogo = document.querySelector('.profile-modal-logo');
    if (profileHeaderLogo) profileHeaderLogo.addEventListener('click', closeProfileModal);

    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (typeof window.openEditProfileModal === 'function') {
                window.openEditProfileModal();
            }
        });
    }

    if (profileMenuBtn && sidebarMenu && overlay) {
        profileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }

    // Wire up "Change Password" in Profile Modal
    const passwordBtn = document.getElementById('changePasswordBtn') || document.querySelector('.password-btn');
    if (passwordBtn) {
        passwordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openChangePasswordModal === 'function') {
                window.openChangePasswordModal();
            }
        });
    }

    // =========================================
    // 6. RESERVATION MODAL CONTROLS & STEP 1
    // =========================================
    const reservationModal = document.querySelector('.reservation-modal-overlay');
    const reservationMenuBtn = document.getElementById('reservationMenuBtn');
    const reservationUserBtn = document.getElementById('reservationUserBtn');
    const makeReservationBtn = document.getElementById('makeReservationBtn');

    function fitReservationModalMap() {
        const wrapper = document.getElementById('modalVectorMapWrapper');
        const canvas = document.getElementById('modalVectorMapCanvas');
        if (!wrapper || !canvas) return;
        const rect = wrapper.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        // 24px safety buffer on sides so it never overlaps left/right cards
        const maxW = Math.max(100, rect.width - 24);
        const maxH = Math.max(100, rect.height - 12);

        // Strict 4:3 containment
        let targetW = maxW;
        let targetH = targetW * 0.75;
        if (targetH > maxH) {
            targetH = maxH;
            targetW = targetH * (4 / 3);
        }

        // Scale down to 0.68 for generous breathing room (comfortably accommodates rotated negative top bounds)
        targetW *= 0.68;
        targetH *= 0.68;

        canvas.style.setProperty('width', `${Math.floor(targetW)}px`, 'important');
        canvas.style.setProperty('height', `${Math.floor(targetH)}px`, 'important');
        canvas.style.setProperty('overflow', 'visible', 'important');
        canvas.style.setProperty('margin-top', `${Math.round(targetH * 0.08)}px`, 'important');
    }
    window.fitReservationModalMap = fitReservationModalMap;
    window.addEventListener('resize', fitReservationModalMap);

    function openReservationModal() {
        if (reservationModal) {
            reservationModal.classList.add('active');

            // Re-render modal vector map to ensure synchronized vectors
            if (typeof renderVectorMapElements === 'function') {
                renderVectorMapElements();
            }

            requestAnimationFrame(() => {
                fitReservationModalMap();
            });
            setTimeout(fitReservationModalMap, 60);

            // Trigger loading plots for currently active lawn tab
            const activeTab = document.querySelector('.lawn-tab.active');
            const currentLawn = activeTab ? activeTab.getAttribute('data-lawn') : 'special-supreme';
            const sectionsForTab = LAWN_TAB_TO_SECTIONS[currentLawn] || ['Area 5 - Special Supreme Estate'];
            if (!sectionsForTab.includes(currentResAreaSectionName)) {
                currentResAreaSectionName = sectionsForTab[0];
            }
            const shapeInfo = RES_SECTION_SHAPE_MAP[currentResAreaSectionName];
            loadPlotsForCategory(currentLawn, shapeInfo ? shapeInfo.area : null, currentResAreaSectionName);

            // Sync highlight to active lawn on the Full Cemetery Map
            const tabToAreas = {
                'condominium': ['10'],
                'single-teired': ['1', '6'],
                'supreme': ['4', '7', '8'],
                'special-supreme': ['2', '5', '9', '11'],
                'family-estate': ['3'],
                'mausoleum': ['12']
            };
            const activeAreas = tabToAreas[currentLawn] || [];
            setTimeout(() => {
                const modalMap = document.getElementById('modalVectorMapCanvas');
                const targetEls = modalMap ? modalMap.querySelectorAll('.map-vector-element') : document.querySelectorAll('#modalVectorMapCanvas .map-vector-element');
                targetEls.forEach(el => {
                    el.classList.remove('active-vector-zone');
                    if (activeAreas.includes(el.dataset.areaId)) {
                        el.classList.add('active-vector-zone');
                    }
                });
                clearDashboardMapHighlights();
            }, 50);
        }
    }

    function closeReservationModal() {
        if (reservationModal) {
            reservationModal.classList.remove('active');
        }
        clearDashboardMapHighlights();
    }

    // Expose modal controls globally
    window.openReservationModal = openReservationModal;
    window.closeReservationModal = closeReservationModal;

    if (makeReservationBtn) {
        makeReservationBtn.addEventListener('click', () => {
            openReservationModal();
        });
    }

    const dashboardCenterMap = document.getElementById('dashboardCenterMap');
    if (dashboardCenterMap) {
        dashboardCenterMap.addEventListener('click', (e) => {
            // If clicking a vector element, let the vector element's own click handler run
            if (e.target && e.target.closest && e.target.closest('.map-vector-element')) {
                return;
            }
            openReservationModal();
        });
    }

    if (reservationMenuBtn && sidebarMenu && overlay) {
        reservationMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (reservationUserBtn) {
        reservationUserBtn.addEventListener('click', () => {
            closeReservationModal();
            openProfileModal();
        });
    }

    const reservationCloseBtn = document.getElementById('reservationCloseBtn');
    if (reservationCloseBtn) {
        reservationCloseBtn.addEventListener('click', () => {
            closeReservationModal();
            updateActiveMenuItem('dashboard');
        });
    }

    if (reservationModal) {
        reservationModal.addEventListener('click', (e) => {
            if (e.target === reservationModal) {
                closeReservationModal();
                updateActiveMenuItem('dashboard');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeReservationModal();
            closeProfileModal();
            clearDashboardMapHighlights();
        }
    });

    // Lawn Descriptions
    const lawnDescriptions = {
        'condominium': {
            categoryName: 'Condominium',
            title: 'Condominium:',
            desc: 'A vertical interment facility featuring stacked, above-ground vaults. This section offers a structured and organized memorial space, utilizing a multi-level grid system for efficient space management and easy identification of individual niches.'
        },
        'single-teired': {
            categoryName: 'Single Tiered',
            title: 'Single Tiered:',
            desc: 'Traditional ground burial plots arranged in a single level. This classic option provides a peaceful resting place with individual grave sites, perfect for families seeking a traditional memorial setting.'
        },
        'supreme': {
            categoryName: 'Supreme',
            title: 'Supreme:',
            desc: 'Premium ground burial plots with enhanced features and larger space. These plots offer superior positioning and additional amenities for families who desire an elevated memorial experience.'
        },
        'special-supreme': {
            categoryName: 'Special Supreme',
            title: 'Special Supreme:',
            desc: 'Our most exclusive ground burial option, featuring the finest locations and maximum space. Special Supreme plots provide unparalleled prestige and comfort for distinguished families.'
        },
        'family-estate': {
            categoryName: 'Family Estate Jr.',
            title: 'Family Estate Jr.:',
            desc: 'Exclusive private multi-vault family estate lots with custom borders and generous personal space for family legacies.'
        },
        'mausoleum': {
            categoryName: 'Mausoleum',
            title: 'Mausoleum:',
            desc: 'Above-ground entombment in a permanent structure. Mausoleums offer protection from the elements and provide a dignified, lasting memorial in a climate-controlled environment.'
        }
    };

    // Lawn Tabs Click Handler
    const lawnTabs = document.querySelectorAll('.lawn-tab');
    const lawnTitle = document.getElementById('lawnTitle');
    const lawnDesc = document.getElementById('lawnDesc');
    const viewFullGridLink = document.getElementById('viewFullGridLink');

    lawnTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            lawnTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const lawnType = tab.getAttribute('data-lawn');
            const lawnInfo = lawnDescriptions[lawnType];
            const sectionsForTab = LAWN_TAB_TO_SECTIONS[lawnType] || ['Area 5 - Special Supreme Estate'];
            const targetSectionName = sectionsForTab.includes(currentResAreaSectionName)
                ? currentResAreaSectionName
                : sectionsForTab[0];
            currentResAreaSectionName = targetSectionName;
            const shapeInfo = RES_SECTION_SHAPE_MAP[targetSectionName];
            const areaId = shapeInfo ? shapeInfo.area : '5';

            if (lawnInfo) {
                if (lawnTitle) lawnTitle.textContent = lawnInfo.title;
                if (lawnDesc) lawnDesc.textContent = lawnInfo.desc;
                if (viewFullGridLink) {
                    viewFullGridLink.href = `plot-details.html?section=${lawnType}&area=${areaId}&areaName=${encodeURIComponent(targetSectionName)}`;
                }
            }

            // Highlight all vectors matching this lawn category on the Full Cemetery Map
            const tabToAreas = {
                'condominium': ['10'],
                'single-teired': ['1', '6'],
                'supreme': ['4', '7', '8'],
                'special-supreme': ['2', '5', '9', '11'],
                'family-estate': ['3'],
                'mausoleum': ['12']
            };
            const activeAreas = tabToAreas[lawnType] || [];
            const modalMap = document.getElementById('modalVectorMapCanvas');
            const targetEls = modalMap ? modalMap.querySelectorAll('.map-vector-element') : document.querySelectorAll('#modalVectorMapCanvas .map-vector-element');
            targetEls.forEach(el => {
                el.classList.remove('active-vector-zone');
                if (activeAreas.includes(el.dataset.areaId)) {
                    el.classList.add('active-vector-zone');
                }
            });
            clearDashboardMapHighlights();

            // Load plots for this category/area
            loadPlotsForCategory(lawnType, areaId, targetSectionName);
        });
    });

    // =========================================
    // 7. STEP 2: BOOKING MODAL & AMORTIZATION
    // =========================================
    setupBookingModalAndAmortization(user);
    setupInteractiveCemeteryMap();
    clearDashboardMapHighlights();

    // =========================================
    // 8. PAYMENT OVERVIEW -> OPEN FULL-SCREEN PAYMENTS & GCASH TAB
    // =========================================
    const paymentHistoryLink = document.querySelector('.payment-history');
    if (paymentHistoryLink) {
        paymentHistoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeReservationModal();
            closeProfileModal();
            closeAllSubpages();
            if (typeof window.openGcashPaymentsFullPage === 'function') {
                window.openGcashPaymentsFullPage(false);
            }
        });
    }

    // =========================================
    // 9. CHECK URL PARAMETERS
    // =========================================
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openReservation') === 'true') {
        setTimeout(openReservationModal, 150);
        // Clean up URL query string so subsequent refreshes or back button navigation stay on the dashboard
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }

    const preselectPlotId = urlParams.get('reserve');
    if (preselectPlotId) {
        setTimeout(async () => {
            const { data: plot } = await supabaseClient
                .from('memorial_spaces')
                .select('*')
                .eq('plot_identifier', preselectPlotId)
                .single();
            if (plot) {
                openBookingModalForPlot(plot);
            }
        }, 300);
    }
}

// ==============================================================================
// INTERACTIVE CEMETERY MAP & AREA SELECTION
// ==============================================================================
function setupInteractiveCemeteryMap() {
    const lawnZones = document.querySelectorAll('.interactive-lawn-zone');
    const lawnBadges = document.querySelectorAll('.map-lawn-badge');

    const areaMeta = {
        '1': { name: 'Area 1 - Single Tiered Lawn', category: 'Single Teired', tab: 'single-teired' },
        '2': { name: 'Area 2 - Lawn of Love', category: 'Special Supreme', tab: 'special-supreme' },
        '3': { name: 'Area 3 - Lawn of Hope (Family Estate)', category: 'Family Estate Jr.', tab: 'family-estate' },
        '4': { name: 'Area 4 - Supreme Garden', category: 'Supreme', tab: 'supreme' },
        '5': { name: 'Area 5 - Special Supreme Estate', category: 'Special Supreme', tab: 'special-supreme' },
        '6': { name: 'Area 6 - Lawn of Peace', category: 'Single Teired', tab: 'single-teired' },
        '7': { name: 'Area 7 - Lawn of Faith', category: 'Supreme', tab: 'supreme' },
        '8': { name: 'Area 8 - Lawn of Grace', category: 'Supreme', tab: 'supreme' },
        '9': { name: 'Area 9 - Lawn of Serenity', category: 'Special Supreme', tab: 'special-supreme' },
        '10': { name: 'Area 10 - Condominium Block A', category: 'Condominium', tab: 'condominium' },
        '11': { name: 'Area 11 - Lawn of Memories', category: 'Special Supreme', tab: 'special-supreme' },
        '12': { name: 'Area 12 - Mausoleum Court', category: 'Mausoleum', tab: 'mausoleum' },
        'condominium': { name: 'Area 10 - Condominium Block A', category: 'Condominium', tab: 'condominium' }
    };

    function selectArea(areaId) {
        const meta = areaMeta[areaId];
        if (!meta) return;

        currentResAreaSectionName = meta.name;

        // 1. Highlight active polygon (legacy)
        document.querySelectorAll('.map-polygon').forEach(p => p.classList.remove('active-zone'));
        const targetPoly = document.querySelector(`.map-polygon[data-lawn-id="${areaId}"]`);
        if (targetPoly) targetPoly.classList.add('active-zone');

        // 2. Highlight active badge (legacy)
        document.querySelectorAll('.map-lawn-badge').forEach(b => b.classList.remove('active-badge'));
        const targetBadge = document.querySelector(`.map-lawn-badge[data-lawn-id="${areaId}"]`);
        if (targetBadge) targetBadge.classList.add('active-badge');

        // 3. Highlight active vector element (Modal only - never highlight on dashboard hero map)
        const modalMap = document.getElementById('modalVectorMapCanvas');
        const targetEls = modalMap ? modalMap.querySelectorAll('.map-vector-element') : document.querySelectorAll('#modalVectorMapCanvas .map-vector-element');
        targetEls.forEach(el => {
            el.classList.remove('active-vector-zone');
            if (el.dataset.areaId === String(areaId)) {
                el.classList.add('active-vector-zone');
            }
        });
        clearDashboardMapHighlights();

        // 4. Switch active tab
        const lawnTabs = document.querySelectorAll('.lawn-tab');
        lawnTabs.forEach(t => {
            if (t.getAttribute('data-lawn') === meta.tab) {
                lawnTabs.forEach(tb => tb.classList.remove('active'));
                t.classList.add('active');
            }
        });

        // 5. Update Description
        const lawnDescriptionsMap = {
            'condominium': 'A vertical interment facility featuring stacked, above-ground vaults and niches.',
            'single-teired': 'Traditional ground burial plots arranged in a single level.',
            'supreme': 'Premium ground burial plots with enhanced positioning and space.',
            'special-supreme': 'Exclusive ground burial plots featuring prime locations in the cemetery.',
            'family-estate': 'Private multi-vault family estates with custom borders.',
            'mausoleum': 'Above-ground entombment in a permanent, distinguished memorial structure.'
        };
        const lawnTitle = document.getElementById('lawnTitle');
        const lawnDesc = document.getElementById('lawnDesc');
        if (lawnTitle) lawnTitle.textContent = `${meta.name}:`;
        if (lawnDesc) lawnDesc.textContent = lawnDescriptionsMap[meta.tab] || 'Zion Memorial Garden peaceful resting space.';

        // 6. Update Quick Card & Links
        const quickCard = document.getElementById('activeLawnQuickCard');
        const quickName = document.getElementById('quickCardLawnName');
        const quickGridBtn = document.getElementById('quickCardGridBtn');
        const normalizedAreaId = areaId === 'condominium' ? '10' : areaId;
        if (quickCard && quickName) {
            quickCard.style.display = 'block';
            quickName.textContent = meta.name;
            if (quickGridBtn) {
                quickGridBtn.href = `plot-details.html?section=${meta.tab}&area=${normalizedAreaId}&areaName=${encodeURIComponent(meta.name)}`;
            }
        }

        const viewFullGridLink = document.getElementById('viewFullGridLink');
        if (viewFullGridLink) {
            viewFullGridLink.href = `plot-details.html?section=${meta.tab}&area=${normalizedAreaId}&areaName=${encodeURIComponent(meta.name)}`;
        }

        // 7. Load plots specifically for this area
        loadPlotsForCategory(meta.tab, normalizedAreaId, meta.name);
    }

    // Expose selectArea globally so vector clicks on dashboard map trigger area selection
    window.selectCemeteryArea = function(areaId, openModal = true) {
        if (openModal && typeof window.openReservationModal === 'function') {
            const reservationModal = document.querySelector('.reservation-modal-overlay');
            if (reservationModal) reservationModal.classList.add('active');
            if (typeof renderVectorMapElements === 'function') {
                renderVectorMapElements();
            }
        }
        selectArea(areaId);
    };

    lawnZones.forEach(zone => {
        zone.addEventListener('click', (e) => {
            e.preventDefault();
            const areaId = zone.getAttribute('data-lawn-id');
            selectArea(areaId);
        });
    });

    lawnBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.preventDefault();
            const areaId = badge.getAttribute('data-lawn-id');
            selectArea(areaId);
        });
    });
}

// Enhanced loadPlotsForCategory supporting exact section plot sync
async function loadPlotsForCategory(lawnType, filterAreaId = null, filterAreaName = '') {
    const dropdown = document.getElementById('lawnPlotSelect');
    const summaryBox = document.getElementById('plotQuickSummary');
    const proceedBtn = document.getElementById('proceedToBookingBtn');
    const quickPlotCount = document.getElementById('quickCardPlotCount');
    const quickName = document.getElementById('quickCardLawnName');
    const quickGridBtn = document.getElementById('quickCardGridBtn');
    const viewFullGridLink = document.getElementById('viewFullGridLink');

    if (!dropdown) return;

    // Resolve target section name (exact cemetery area)
    const sectionsForTab = LAWN_TAB_TO_SECTIONS[lawnType] || ['Area 5 - Special Supreme Estate'];
    let targetSectionName = filterAreaName;
    if (!targetSectionName || !RES_SECTION_SHAPE_MAP[targetSectionName]) {
        if (filterAreaId) {
            const matchedEntry = Object.entries(RES_SECTION_SHAPE_MAP).find(([, v]) => v.area === String(filterAreaId));
            if (matchedEntry) targetSectionName = matchedEntry[0];
        }
    }
    if (!targetSectionName || !RES_SECTION_SHAPE_MAP[targetSectionName]) {
        targetSectionName = sectionsForTab.includes(currentResAreaSectionName)
            ? currentResAreaSectionName
            : sectionsForTab[0];
    }

    currentResAreaSectionName = targetSectionName;
    const shapeInfo = RES_SECTION_SHAPE_MAP[targetSectionName] || RES_SECTION_SHAPE_MAP['Area 5 - Special Supreme Estate'];

    // Update quick card and fullscreen links to point to the exact area
    if (quickName) quickName.textContent = targetSectionName;
    if (quickGridBtn) {
        quickGridBtn.href = `plot-details.html?section=${shapeInfo.tab}&area=${shapeInfo.area}&areaName=${encodeURIComponent(targetSectionName)}`;
    }
    if (viewFullGridLink) {
        viewFullGridLink.href = `plot-details.html?section=${shapeInfo.tab}&area=${shapeInfo.area}&areaName=${encodeURIComponent(targetSectionName)}`;
    }

    dropdown.innerHTML = '<option value="">-- Loading plots from cloud... --</option>';
    dropdown.disabled = true;
    if (proceedBtn) proceedBtn.disabled = true;
    if (summaryBox) summaryBox.style.display = 'none';

    try {
        // 1. Fetch ALL plots (available, reserved, occupied) in this exact cemetery section from Supabase
        const { data: dbSectionPlots, error } = await supabaseClient
            .from('memorial_spaces')
            .select('*')
            .ilike('section_name', `%${targetSectionName}%`)
            .order('plot_identifier', { ascending: true });

        if (error) throw error;

        let allSectionPlots = dbSectionPlots || [];

        // 2. Check localStorage cache synced from Layout Studio (`map-editor.html`)
        try {
            const localRaw = localStorage.getItem('zion_section_plots_v1_' + targetSectionName);
            if (localRaw) {
                const localPlots = JSON.parse(localRaw);
                if (Array.isArray(localPlots) && localPlots.length > 0) {
                    const dbMap = new Map(allSectionPlots.map(p => [p.plot_identifier, p]));
                    allSectionPlots = localPlots.map(lp => {
                        const dbMatch = dbMap.get(lp.plot_identifier);
                        if (dbMatch) {
                            return {
                                ...dbMatch,
                                col_num: lp.col_num ?? dbMatch.col_num,
                                row_num: lp.row_num ?? dbMatch.row_num,
                                coordinates: lp.coordinates || dbMatch.coordinates
                            };
                        }
                        return lp;
                    });
                }
            }
        } catch (cacheErr) {
            console.warn('Could not read local plot cache:', cacheErr);
        }

        // 3. Ensure Area 5 - Special Supreme Estate uses the exact 94 2x3 SPEC5-001..SPEC5-094 layout from Layout Studio
        if (targetSectionName === 'Area 5 - Special Supreme Estate') {
            const hasSpec5 = allSectionPlots.some(p => String(p.plot_identifier || '').startsWith('SPEC5-'));
            if (!hasSpec5) {
                const exactArea5Plots = generateArea5ExactBlueprintLayout();
                try {
                    const payload = exactArea5Plots.map(p => ({
                        plot_identifier: p.plot_identifier,
                        section_name: p.section_name,
                        category: p.category,
                        status: p.status,
                        price: p.price,
                        down_payment: p.down_payment,
                        col_num: p.col_num,
                        row_num: p.row_num,
                        coordinates: p.coordinates
                    }));
                    const legacyIds = (dbSectionPlots || [])
                        .filter(p => String(p.plot_identifier || '').startsWith('SPEC-L') && p.status === 'available')
                        .map(p => p.id);
                    if (legacyIds.length > 0) {
                        await supabaseClient.from('memorial_spaces').delete().in('id', legacyIds);
                    }
                    const { data: upserted } = await supabaseClient
                        .from('memorial_spaces')
                        .upsert(payload, { onConflict: 'plot_identifier' })
                        .select('*');
                    if (upserted && upserted.length > 0) {
                        allSectionPlots = upserted.sort((a, b) =>
                            String(a.plot_identifier).localeCompare(String(b.plot_identifier), undefined, { numeric: true })
                        );
                    } else {
                        allSectionPlots = exactArea5Plots;
                    }
                } catch (syncErr) {
                    console.warn('Area 5 blueprint DB sync fallback:', syncErr);
                    allSectionPlots = exactArea5Plots;
                }
                try {
                    localStorage.setItem('zion_section_plots_v1_' + targetSectionName, JSON.stringify(allSectionPlots));
                } catch (_) {}
            }
        }

        // Sort plots naturally by plot_identifier
        allSectionPlots.sort((a, b) =>
            String(a.plot_identifier || '').localeCompare(String(b.plot_identifier || ''), undefined, { numeric: true })
        );

        currentSectionAllPlotsCache = allSectionPlots;
        const availablePlots = allSectionPlots.filter(p => (p.status || 'available').toLowerCase() === 'available');
        categoryAvailablePlotsCache = availablePlots;

        if (quickPlotCount) {
            quickPlotCount.textContent = `● ${availablePlots.length} Available / ${allSectionPlots.length} Total Plots`;
        }

        if (availablePlots.length === 0) {
            dropdown.innerHTML = '<option value="">-- No available plots in this area --</option>';
            dropdown.disabled = true;
            handlePlotSelectChange(null);
            return;
        }

        dropdown.innerHTML = '<option value="">-- Select an Available Plot --</option>' +
            availablePlots.map(p => `
                <option value="${p.id}" data-id="${p.id}" data-identifier="${p.plot_identifier}">
                    ${p.plot_identifier} - ${p.section_name} (₱ ${Number(p.price).toLocaleString()})
                </option>
            `).join('');

        dropdown.disabled = false;

        // Auto-select first available plot
        dropdown.value = availablePlots[0].id;
        handlePlotSelectChange(availablePlots[0]);

        dropdown.onchange = (e) => {
            const val = e.target.value;
            const chosen = categoryAvailablePlotsCache.find(p => String(p.id) === String(val) || p.plot_identifier === val);
            handlePlotSelectChange(chosen);
        };

    } catch (err) {
        console.error('Failed to load category plots:', err);
        dropdown.innerHTML = '<option value="">-- Error loading plots --</option>';
        dropdown.disabled = true;
    }
}

function handlePlotSelectChange(plot) {
    const summaryBox = document.getElementById('plotQuickSummary');
    const proceedBtn = document.getElementById('proceedToBookingBtn');

    if (!plot) {
        selectedPlotToBook = null;
        if (summaryBox) summaryBox.style.display = 'none';
        if (proceedBtn) proceedBtn.disabled = true;
        document.querySelectorAll('#resAreaGridLayer .area-plot-cell').forEach(cell => {
            cell.classList.remove('selected-plot');
        });
        return;
    }

    selectedPlotToBook = plot;

    // Highlight selected plot cell on the interactive blueprint grid
    document.querySelectorAll('#resAreaGridLayer .area-plot-cell').forEach(cell => {
        const isMatch = cell.dataset.plotCode === plot.plot_identifier ||
            (plot.id && String(cell.dataset.plotId) === String(plot.id));
        cell.classList.toggle('selected-plot', Boolean(isMatch));
    });

    const plotCode = document.getElementById('summaryPlotCode');
    const plotSection = document.getElementById('summaryPlotSection');
    const plotPrice = document.getElementById('summaryPlotPrice');
    const plotDown = document.getElementById('summaryPlotDownPayment');
    const plotMonthly = document.getElementById('summaryPlotMonthly');

    if (plotCode) plotCode.textContent = plot.plot_identifier;
    if (plotSection) plotSection.textContent = `${plot.section_name} • ${plot.category}`;
    if (plotPrice) plotPrice.textContent = `₱ ${Number(plot.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (plotDown) plotDown.textContent = `₱ ${Number(plot.down_payment || 10200).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    
    // Default estimated 60 months amortization
    const estMonthly = (Number(plot.price) - Number(plot.down_payment || 10200)) / 60;
    if (plotMonthly) plotMonthly.textContent = `₱ ${estMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo (60 mos)`;

    if (summaryBox) summaryBox.style.display = 'flex';
    if (proceedBtn) {
        proceedBtn.disabled = false;
        proceedBtn.onclick = () => {
            openBookingModalForPlot(selectedPlotToBook);
        };
    }
}

// ==============================================================================
// STEP 2 RESERVATION BOOKING MODAL & AMORTIZATION CONTROLLER
// ==============================================================================
function setupBookingModalAndAmortization(user) {
    const bookingModal = document.getElementById('reservationBookingModal');
    const closeBookingBtn = document.getElementById('closeBookingModalBtn');
    const cancelBookingBtn = document.getElementById('cancelBookingBtn');
    const form = document.getElementById('plotReservationForm');
    const planTypeInputs = document.querySelectorAll('input[name="planType"]');
    const paymentOptionInputs = document.querySelectorAll('input[name="paymentOption"]');
    const termSelect = document.getElementById('installmentTerm');
    const downPaymentInput = document.getElementById('customDownPayment');
    const amortPanel = document.getElementById('amortizationPanel');

    const closeBooking = () => {
        if (bookingModal) bookingModal.classList.remove('active');
    };

    if (closeBookingBtn) closeBookingBtn.addEventListener('click', closeBooking);
    if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', closeBooking);

    function updatePlanTypeUi(type) {
        const subLabel = document.getElementById('bookDeceasedSubLabel');
        const helpText = document.getElementById('bookDeceasedHelpText');
        const section = document.getElementById('bookDeceasedSection');
        const reqFirst = document.getElementById('reqDeceasedFirst');
        const reqLast = document.getElementById('reqDeceasedLast');

        if (type === 'AT-NEED') {
            if (subLabel) {
                subLabel.innerHTML = '<span style="color: #dc2626; font-weight: 700;">● Required for At-Need Interment</span>';
            }
            if (helpText) {
                helpText.textContent = 'Immediate interment requirement: Please enter your loved one’s full details below to assign this plot and create the interment record.';
                helpText.style.color = '#b91c1c';
            }
            if (section) {
                section.style.borderColor = '#15803d';
                section.style.backgroundColor = '#f0fdf4';
            }
            if (reqFirst) reqFirst.style.display = 'inline';
            if (reqLast) reqLast.style.display = 'inline';
        } else {
            if (subLabel) {
                subLabel.textContent = 'Optional (can be assigned or edited later)';
                subLabel.style.color = '#666';
            }
            if (helpText) {
                helpText.textContent = 'If reserving for an immediate need or specific loved one, enter details below. Otherwise leave blank for pre-need.';
                helpText.style.color = '#555';
            }
            if (section) {
                section.style.borderColor = '#d4dfd2';
                section.style.backgroundColor = '#fafaf8';
            }
            if (reqFirst) reqFirst.style.display = 'none';
            if (reqLast) reqLast.style.display = 'none';
        }
    }

    // Radio card toggle styles
    planTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.plan-type-selector .radio-card').forEach(c => c.classList.remove('active'));
            input.closest('.radio-card').classList.add('active');
            updatePlanTypeUi(input.value);
        });
    });

    const activePlanInput = document.querySelector('input[name="planType"]:checked');
    if (activePlanInput) updatePlanTypeUi(activePlanInput.value);

    paymentOptionInputs.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.payment-option-selector .radio-card').forEach(c => c.classList.remove('active'));
            input.closest('.radio-card').classList.add('active');
            
            if (input.value === 'FULL_PAYMENT') {
                if (amortPanel) amortPanel.style.display = 'none';
            } else {
                if (amortPanel) amortPanel.style.display = 'block';
                recalculateAmortization();
            }
        });
    });

    // Channel pills active toggle
    document.querySelectorAll('.payment-channels-grid input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.channel-pill').forEach(p => p.classList.remove('active'));
            radio.closest('.channel-pill').classList.add('active');
        });
    });

    // Recalculate amortization on term or down payment changes
    if (termSelect) termSelect.addEventListener('change', recalculateAmortization);
    if (downPaymentInput) downPaymentInput.addEventListener('input', recalculateAmortization);
    if (typeof window.setupDynamicPaymentChannelPanel === 'function') {
        window.setupDynamicPaymentChannelPanel();
    }

    // FORM SUBMISSION TO SUPABASE
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submitReservationBtn');
            const btnText = submitBtn?.querySelector('.btn-text');
            const btnLoader = submitBtn?.querySelector('.btn-loader');

            let spaceId = Number(document.getElementById('bookSpaceId').value);
            const plotIdentifier = document.getElementById('bookPlotIdentifier').value;
            const totalPrice = Number(document.getElementById('bookPlotPrice').value);
            const planType = document.querySelector('input[name="planType"]:checked')?.value || 'PRE-NEED';
            const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
            const paymentChannel = document.querySelector('input[name="paymentChannel"]:checked')?.value || 'GCash';
            const notes = document.getElementById('reservationNotes').value.trim();

            const isGcash = paymentChannel === 'GCash';
            const isBank = paymentChannel === 'Bank';
            const isStaffCashPaid = !isGcash && !isBank && typeof window.isCurrentUserStaffOrAdmin === 'function' && window.isCurrentUserStaffOrAdmin();

            if (isGcash && typeof window.validateGcashSetupOrRedirect === 'function') {
                if (!window.validateGcashSetupOrRedirect(paymentChannel)) {
                    return; // Redirected to the separate GCash Setup tab
                }
            }

            const staffClientNameInput = document.getElementById('zmgStaffClientName')?.value?.trim() || '';
            const staffClientEmailInput = document.getElementById('zmgStaffClientEmail')?.value?.trim() || '';
            const staffCashReceivedInput = Number(document.getElementById('zmgStaffCashAmountReceived')?.value || 0);

            if (isStaffCashPaid) {
                if (!staffClientEmailInput || !staffClientEmailInput.includes('@')) {
                    alert('Please enter the Client\'s Gmail / Email Address so we can send their PAID receipt.');
                    document.getElementById('zmgStaffClientEmail')?.focus();
                    return;
                }
                if (!staffCashReceivedInput || staffCashReceivedInput <= 0) {
                    alert('Please enter the Cash Payment Amount Received from the client.');
                    document.getElementById('zmgStaffCashAmountReceived')?.focus();
                    return;
                }
            }

            const bankSelectEl = document.getElementById('zmgBankSelect');
            const bankOpt = bankSelectEl?.options[bankSelectEl.selectedIndex];
            const bankName = bankOpt?.text || 'BDO Unibank';
            const bankRefInput = document.getElementById('zmgBankTestRefNumber')?.value?.trim();
            const bankTestConfirmCheck = document.getElementById('zmgCheckConfirmBankTest');
            const isBankTestPaid = isBank && (!bankTestConfirmCheck || bankTestConfirmCheck.checked);

            const isGcashQr = isGcash && !document.getElementById('zmgGcashSubMethodAutoDebit')?.checked;
            const gcashQrRef = document.getElementById('zmgGcashQrRefNumber')?.value?.trim();

            const linkedAcct = typeof window.getLinkedGcashAccount === 'function' ? window.getLinkedGcashAccount() : null;
            let paymentTag = (isStaffCashPaid || isBankTestPaid || isGcashQr) ? 'PAID' : 'UNPAID';
            const gcashSender = isGcashQr ? (gcashQrRef || 'GCash QR') : (linkedAcct?.mobileNumber || document.getElementById('zmgGcashSenderNumber')?.value?.trim() || '');
            let gcashRef = isBank ? (bankRefInput || `BNK-TEST-${Date.now().toString(36).toUpperCase()}`) : (isGcashQr ? (gcashQrRef || `GCASH-QR-${Date.now().toString(36).toUpperCase()}`) : '');

            let termMonths = 60;
            let downPayment = 0;
            let monthlyAmortization = 0;
            let balance = totalPrice;

            if (paymentOption === 'INSTALLMENT') {
                termMonths = Number(document.getElementById('installmentTerm')?.value || 60);
                downPayment = Number(document.getElementById('customDownPayment')?.value || 0);
                const remaining = Math.max(0, totalPrice - downPayment);
                monthlyAmortization = termMonths > 0 ? (remaining / termMonths) : 0;
                balance = remaining;
            } else {
                downPayment = totalPrice;
                monthlyAmortization = 0;
                balance = 0;
            }

            const isImmediatelyPaid = isStaffCashPaid || isBankTestPaid || isGcashQr;
            const amountNow = isStaffCashPaid ? staffCashReceivedInput : (downPayment > 0 ? downPayment : totalPrice);
            // For GCash, initial insert sets total_paid=0 & balance=totalPrice; server RPC zmg_apply_payment_to_reservation atomically applies amountNow once Xendit confirms SUCCEEDED
            const totalPaidRecorded = isImmediatelyPaid ? amountNow : 0.00;
            const balanceRecorded = isImmediatelyPaid ? Math.max(0, totalPrice - amountNow) : totalPrice;
            if (isImmediatelyPaid) {
                balance = balanceRecorded;
                if (paymentOption === 'INSTALLMENT' && termMonths > 0) {
                    monthlyAmortization = balance / termMonths;
                }
            }

            // Generate clean reservation number: ZMG-YYYYMMDD-XXX
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomCode = Math.floor(100 + Math.random() * 900);
            const reservationNumber = `ZMG-${todayStr}-${randomCode}`;
            let paymentReference = isGcashQr
                ? (gcashQrRef || `GCASH-QR-${Date.now().toString(36).toUpperCase()}`)
                : (isGcash
                    ? `GCASH-PENDING-${Date.now().toString(36).toUpperCase()}`
                    : (isBank
                        ? (bankRefInput || `BNK-TEST-${Date.now().toString(36).toUpperCase()}`)
                        : (isStaffCashPaid
                            ? `CASH-PAID-COUNTER-${Date.now().toString(36).toUpperCase()}`
                            : `CASH-UNPAID-${Date.now().toString(36).toUpperCase()}`)));

            // Show submitting state
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline';

            try {
                // Ensure the plot exists in memorial_spaces with a numeric spaceId
                if (!spaceId || Number.isNaN(spaceId)) {
                    const { data: existingPlot } = await supabaseClient
                        .from('memorial_spaces')
                        .select('id')
                        .eq('plot_identifier', plotIdentifier)
                        .maybeSingle();

                    if (existingPlot && existingPlot.id) {
                        spaceId = existingPlot.id;
                    } else if (selectedPlotToBook) {
                        const { data: upsertedPlot, error: upsertErr } = await supabaseClient
                            .from('memorial_spaces')
                            .upsert([{
                                plot_identifier: selectedPlotToBook.plot_identifier,
                                section_name: selectedPlotToBook.section_name || currentResAreaSectionName,
                                category: selectedPlotToBook.category || 'Special Supreme',
                                status: 'available',
                                price: selectedPlotToBook.price || totalPrice,
                                down_payment: selectedPlotToBook.down_payment || downPayment,
                                col_num: selectedPlotToBook.col_num || 1,
                                row_num: selectedPlotToBook.row_num || 1,
                                coordinates: selectedPlotToBook.coordinates || { width: 2, height: 3 }
                            }], { onConflict: 'plot_identifier' })
                            .select('id')
                            .single();
                        if (upsertErr) throw upsertErr;
                        spaceId = upsertedPlot.id;
                    }
                }

                let counterInstructions = isStaffCashPaid
                    ? `CASH PAYMENT RECEIVED IN OFFICE BY STAFF/ADMIN (TAG: PAID • Amount Received: ₱ ${Number(amountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}). Official receipt issued directly at the Zion Memorial Garden counter and sent to ${staffClientEmailInput}.`
                    : (isBankTestPaid
                        ? `ONLINE BANK PAYMENT AUTHORIZED (TAG: PAID • ${bankName} • Ref: ${paymentReference}). Verified via Zion Memorial Garden online banking. Please present this receipt for verification and official contract signing.`
                        : (isBank
                            ? `BANK TRANSFER PENDING (TAG: UNPAID • Bank: ${bankName}). Please deposit or transfer ₱${Number(amountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })} to the Zion Memorial Garden corporate account and present receipt at counter.`
                            : 'CASH OVER THE COUNTER (TAG: UNPAID). Please present this receipt once called onto the counter at the Zion Memorial Garden office to settle your amount due in cash.'));

                // Extract deceased details early so we can validate and attach to notes
                const isAtNeed = planType === 'AT-NEED';
                const deceasedFirstName = document.getElementById('bookDeceasedFirstName')?.value?.trim() || '';
                const deceasedMiddleName = document.getElementById('bookDeceasedMiddleName')?.value?.trim() || '';
                const deceasedLastName = document.getElementById('bookDeceasedLastName')?.value?.trim() || '';
                const deceasedGender = document.getElementById('bookDeceasedGender')?.value || null;
                const deceasedBirthDate = document.getElementById('bookDeceasedBirthDate')?.value || null;
                const deceasedDeathDate = document.getElementById('bookDeceasedDeathDate')?.value || null;
                const deceasedBurialDate = document.getElementById('bookDeceasedBurialDate')?.value || null;
                const deceasedEpitaph = document.getElementById('bookDeceasedEpitaph')?.value?.trim() || null;

                let fullDeceasedName = [deceasedFirstName, deceasedMiddleName, deceasedLastName].filter(Boolean).join(' ').trim();
                if (!fullDeceasedName && deceasedFirstName) fullDeceasedName = deceasedFirstName;
                if (!fullDeceasedName && deceasedLastName) fullDeceasedName = deceasedLastName;

                if (isAtNeed && !fullDeceasedName) {
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoader) btnLoader.style.display = 'none';
                    alert('Please enter at least the First Name and Last Name of the deceased for your At-Need reservation.');
                    document.getElementById('bookDeceasedFirstName')?.focus();
                    return;
                }

                const deceasedTagNote = fullDeceasedName ? ` [Interred: ${fullDeceasedName}${deceasedDeathDate ? ` (DOD: ${deceasedDeathDate})` : ''}]` : '';
                const finalReservationNotes = `[Channel: ${isBank ? `Bank Transfer (${bankName})` : (isGcashQr ? 'GCash QR' : paymentChannel)}]${isGcashQr ? ` [Receipt Tag: PAID] (GCash QR Ref: ${paymentReference})` : (isGcash ? ` (GCash Auto-Debit Linked: ${gcashSender})` : (isBankTestPaid ? ` [Receipt Tag: PAID] (Test Mode Bank Authorized: ${bankName} | Ref: ${paymentReference})` : (isStaffCashPaid ? ` [Receipt Tag: PAID] (Staff Counter Cash Paid: ₱${amountNow} | Client: ${staffClientNameInput || 'Walk-in'} <${staffClientEmailInput}>)` : ' [Receipt Tag: UNPAID] (Pay Over the Counter)')))}.${deceasedTagNote} ${notes}`.trim();

                // 1. Insert into public.reservations
                const { data: newReservation, error: insertError } = await supabaseClient
                    .from('reservations')
                    .insert([{
                        reservation_number: reservationNumber,
                        user_id: user.id,
                        space_id: spaceId,
                        plan_type: planType,
                        payment_method: paymentOption,
                        installment_term_months: termMonths,
                        total_price: totalPrice,
                        down_payment_amount: downPayment,
                        monthly_amortization: Number(monthlyAmortization.toFixed(2)),
                        total_paid: Number(totalPaidRecorded.toFixed(2)),
                        balance: Number(balanceRecorded.toFixed(2)),
                        status: 'PENDING',
                        reservation_date: new Date().toISOString().split('T')[0],
                        notes: finalReservationNotes
                    }])
                    .select()
                    .single();

                if (insertError) throw insertError;

                // 1b. Insert deceased record into memorial_records and assign to plot
                const targetSpaceId = parseInt(newReservation?.space_id || spaceId, 10);
                if (fullDeceasedName && targetSpaceId) {
                    try {
                        const { data: memData, error: memErr } = await supabaseClient
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
                            }])
                            .select()
                            .single();

                        if (memErr) {
                            console.error('Notice: Could not insert memorial record:', memErr);
                            alert(`Reservation created, but recording the deceased details encountered an issue: ${memErr.message}.\nYou can also re-assign or update the deceased record anytime in "My Reservations".`);
                        } else {
                            console.log('Interred deceased record created and linked to space:', memData);
                        }
                    } catch (memEx) {
                        console.error('Exception during deceased record creation:', memEx);
                    }

                    // Ensure space status is marked occupied if burialDate or AT-NEED
                    if (deceasedBurialDate || isAtNeed) {
                        try {
                            await supabaseClient
                                .from('memorial_spaces')
                                .update({ status: 'occupied', updated_at: new Date().toISOString() })
                                .eq('id', targetSpaceId);
                        } catch (_) {}
                    }
                }

                // Ensure plot status in localStorage cache is updated immediately
                const targetCacheStatus = (fullDeceasedName || isAtNeed) ? 'occupied' : 'reserved';
                try {
                    const cacheKey = 'zion_section_plots_v1_' + currentResAreaSectionName;
                    const cachedRaw = localStorage.getItem(cacheKey);
                    if (cachedRaw) {
                        const cachedArr = JSON.parse(cachedRaw);
                        if (Array.isArray(cachedArr)) {
                            cachedArr.forEach(cp => {
                                if (cp.plot_identifier === plotIdentifier || String(cp.id) === String(targetSpaceId) || String(cp.id) === String(spaceId)) {
                                    cp.status = targetCacheStatus;
                                    cp.id = targetSpaceId;
                                }
                            });
                            localStorage.setItem(cacheKey, JSON.stringify(cachedArr));
                        }
                    }
                } catch (_) {}

                // 2. Charge Linked GCash via Xendit Edge Function OR insert Cash payment record
                let skipClientEmail = false;
                if (isGcashQr) {
                    await supabaseClient
                        .from('payments')
                        .insert([{
                            reservation_id: newReservation.id,
                            payment_reference: paymentReference,
                            amount: amountNow,
                            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
                            payment_method: 'GCash',
                            status: 'COMPLETED',
                            due_date: new Date().toISOString().split('T')[0],
                            paid_at: new Date().toISOString(),
                            receipt_url: window.stagedGcashReceiptProofUrl || null
                        }]);
                    paymentTag = 'PAID';
                    counterInstructions = `GCASH PAYMENT VERIFIED VIA OFFICIAL GCASH QR (TAG: PAID • Ref: ${paymentReference}). Verified against Zion Memorial Garden merchant account. Please present this receipt for verification and contract signing.`;
                } else if (isGcash && typeof window.zmgPayReservationWithGcash === 'function') {
                    const autoDebitCheck = document.getElementById('zmgLinkGcashAutoDebit');
                    if (autoDebitCheck && typeof window.zmgGcashApi === 'function') {
                        window.zmgGcashApi('set_auto_debit', { enabled: autoDebitCheck.checked }).catch(() => {});
                    }
                    if (btnLoader) btnLoader.textContent = 'Charging Linked GCash...';
                    const chargeResult = await window.zmgPayReservationWithGcash(newReservation.id);
                    if (chargeResult.reference) {
                        paymentReference = chargeResult.reference;
                        gcashRef = chargeResult.reference;
                    }
                    if (chargeResult.status === 'SUCCEEDED') {
                        paymentTag = 'PAID';
                        balance = Number(chargeResult.reservation?.balance ?? Math.max(0, totalPrice - amountNow));
                        skipClientEmail = Boolean(chargeResult.server_email && chargeResult.receipt_emailed);
                        counterInstructions = `PAYMENT AUTOMATICALLY DEDUCTED VIA LINKED GCASH (TAG: PAID • Ref: ${paymentReference}). Present this receipt once called onto the counter at Zion Memorial Garden for verification and official contract signing.`;
                    } else if (chargeResult.status === 'FAILED') {
                        paymentTag = 'UNPAID';
                        balance = totalPrice;
                        counterInstructions = `GCASH AUTO-DEBIT DECLINED (${chargeResult.failure || 'Payment failed'}). Your plot reservation is saved — open the Payments & GCash Tab anytime to retry payment or pay at the counter.`;
                        alert(`Your plot reservation (${reservationNumber}) was saved, but the GCash auto-debit failed: ${chargeResult.failure || 'Declined'}.\n\nYou can retry the payment anytime in the Payments & GCash Tab.`);
                    } else {
                        paymentTag = 'PROCESSING';
                        balance = totalPrice;
                        counterInstructions = `GCASH AUTO-DEBIT PROCESSING (Ref: ${paymentReference}). Your PAID receipt will be emailed automatically as soon as GCash confirms the deduction.`;
                    }
                } else if (isBank) {
                    await supabaseClient
                        .from('payments')
                        .insert([{
                            reservation_id: newReservation.id,
                            payment_reference: paymentReference,
                            amount: amountNow,
                            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
                            payment_method: 'Bank Transfer',
                            status: isBankTestPaid ? 'COMPLETED' : 'PENDING',
                            paid_at: isBankTestPaid ? new Date().toISOString() : null,
                            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        }]);
                } else {
                    await supabaseClient
                        .from('payments')
                        .insert([{
                            reservation_id: newReservation.id,
                            payment_reference: paymentReference,
                            amount: amountNow,
                            payment_type: paymentOption === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
                            payment_method: paymentChannel,
                            status: isStaffCashPaid ? 'COMPLETED' : 'PENDING',
                            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        }]);
                }

                // Reset button state
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';

                // Close modals
                closeBooking();
                const reservationModal = document.querySelector('.reservation-modal-overlay');
                if (reservationModal) reservationModal.classList.remove('active');

                // Switch to "My Reservation" page
                const myReservationPage = document.getElementById('myReservationPage');
                if (myReservationPage) {
                    myReservationPage.classList.add('active');
                    if (typeof window.loadMyReservations === 'function') {
                        window.loadMyReservations();
                    }
                }

                // Refresh dashboard KPIs
                await refreshDashboardKPIs(user.id);

                // Generate PDF Receipt (PAID / UNPAID), Email via EmailJS, and Display Official Receipt Modal
                const { data: userProfile } = await supabaseClient
                    .from('profiles')
                    .select('full_name, username')
                    .eq('id', user.id)
                    .maybeSingle();
                const defaultClientName = userProfile?.full_name || userProfile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client';
                const clientName = isStaffCashPaid ? (staffClientNameInput || staffClientEmailInput.split('@')[0] || defaultClientName) : defaultClientName;
                const clientEmail = isStaffCashPaid ? staffClientEmailInput : (user.email || '');
                const receiptData = {
                    paymentTag,
                    reservationNumber,
                    paymentReference,
                    paymentChannel: isGcash
                        ? 'GCash Auto-Debit'
                        : (isBank ? `Bank Transfer (${bankName} - Test Mode)` : (isStaffCashPaid ? 'Cash (In-Office Staff Counter)' : 'Cash (Over the Counter)')),
                    gcashReference: isBank ? paymentReference : gcashRef,
                    skipClientEmail,
                    dateIssued: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                    clientName,
                    clientEmail,
                    plotIdentifier,
                    sectionName: selectedPlotToBook?.section_name || currentResAreaSectionName,
                    category: selectedPlotToBook?.category || 'Memorial Space',
                    planType,
                    paymentOption,
                    termMonths,
                    totalPrice,
                    amountNow,
                    remainingBalance: balance,
                    monthlyAmortization,
                    counterInstructions
                };

                if (typeof window.processReservationReceiptAndEmail === 'function') {
                    await window.processReservationReceiptAndEmail(receiptData);
                }

            } catch (err) {
                console.error('Reservation submission error:', err);
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';

                if (typeof showErrorModal === 'function') {
                    showErrorModal("Reservation Error", err.message || "Failed to record reservation. Please try again.");
                } else {
                    alert("Reservation failed: " + err.message);
                }
            }
        });
    }
}

function openBookingModalForPlot(plot) {
    if (!plot) return;
    const bookingModal = document.getElementById('reservationBookingModal');
    if (!bookingModal) return;

    // Set hidden fields
    document.getElementById('bookSpaceId').value = plot.id;
    document.getElementById('bookPlotIdentifier').value = plot.plot_identifier;
    document.getElementById('bookPlotPrice').value = plot.price;
    document.getElementById('bookPlotDownPayment').value = plot.down_payment || 10200.00;

    // Banner display
    document.getElementById('bookDisplayPlotCode').textContent = plot.plot_identifier;
    document.getElementById('bookDisplaySection').textContent = `${plot.section_name} • ${plot.category}`;
    document.getElementById('bookDisplayPrice').textContent = `₱ ${Number(plot.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Set default down payment input
    const downInput = document.getElementById('customDownPayment');
    if (downInput) {
        downInput.value = (plot.down_payment || 10200.00).toFixed(2);
    }

    // Clear optional deceased inputs
    ['bookDeceasedFirstName', 'bookDeceasedMiddleName', 'bookDeceasedLastName', 'bookDeceasedGender', 'bookDeceasedBirthDate', 'bookDeceasedDeathDate', 'bookDeceasedBurialDate', 'bookDeceasedEpitaph'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    recalculateAmortization();
    if (typeof window.setupDynamicPaymentChannelPanel === 'function') {
        window.setupDynamicPaymentChannelPanel();
    }

    bookingModal.classList.add('active');
}

function recalculateAmortization() {
    const totalPrice = Number(document.getElementById('bookPlotPrice')?.value || 0);
    const downInput = document.getElementById('customDownPayment');
    const termSelect = document.getElementById('installmentTerm');

    const downPayment = Number(downInput?.value || 0);
    const termMonths = Number(termSelect?.value || 60);

    const remainingBalance = Math.max(0, totalPrice - downPayment);
    const monthly = termMonths > 0 ? (remainingBalance / termMonths) : 0;

    const calcDown = document.getElementById('calcDownPayment');
    const calcBal = document.getElementById('calcRemainingBalance');
    const calcMonthly = document.getElementById('calcMonthlyAmortization');

    if (calcDown) calcDown.textContent = `₱ ${downPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (calcBal) calcBal.textContent = `₱ ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (calcMonthly) calcMonthly.textContent = `₱ ${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo`;
}

// ==============================================================================
// LIVE USER PROFILE LOADER (Supabase profiles table)
// ==============================================================================
async function loadLiveUserProfile(user) {
    try {
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.warn('Could not fetch profiles table record:', error.message);
        }

        const fullName = profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0];
        const username = profile?.username || user.user_metadata?.username || user.email.split('@')[0];
        const phone = profile?.phone || user.user_metadata?.phone || 'Not set';
        const avatarUrl = profile?.avatar_url || localStorage.getItem('userProfilePicture') || 'assets/dashboard/image 8.png';
        if (profile?.avatar_url) {
            localStorage.setItem('userProfilePicture', profile.avatar_url);
        }
        const memberSince = profile?.member_since || '2026-04-07';
        const accountStatus = profile?.account_status || 'ACTIVE';

        // Show or hide Staff & Inventory Portal based on user role
        const dbRole = String(profile?.role || '').toLowerCase();
        const metaRole = String(user.user_metadata?.role || '').toLowerCase();
        const emailLower = String(user.email || '').toLowerCase();
        const isStaffOrAdmin =
            dbRole === 'staff' ||
            dbRole === 'admin' ||
            metaRole === 'staff' ||
            metaRole === 'admin' ||
            emailLower.startsWith('admin') ||
            emailLower.startsWith('staff');

        const adminSidebarSection = document.getElementById('adminSidebarSection');
        if (adminSidebarSection) {
            adminSidebarSection.style.display = isStaffOrAdmin ? 'block' : 'none';
        }
        const adminPortalMenuItem = document.getElementById('adminPortalMenuItem');
        if (adminPortalMenuItem) {
            adminPortalMenuItem.style.display = isStaffOrAdmin ? 'flex' : 'none';
        }

        // Update Header & Sidebar Avatars
        document.querySelectorAll('.user-btn img, .profile-user-btn img, #reservationUserAvatar, #myReservationUserAvatar').forEach(img => {
            img.src = avatarUrl;
        });

        const profileAvatar = document.getElementById('profilePicture');
        if (profileAvatar) profileAvatar.src = avatarUrl;

        // Update Profile Modal fields
        setText('profileFullName', fullName);
        setText('profileUsername', username);
        setText('profileEmail', user.email);
        setText('profilePhone', phone);
        setText('profileDisplayName', fullName.toUpperCase());
        setText('profileUsernameDisplay', username);

        // Account Activity
        const memberDateFormatted = formatMemberSince(memberSince);
        const memberSinceEls = document.querySelectorAll('.member-info');
        memberSinceEls.forEach(el => {
            if (el.textContent.includes('Member Since')) {
                el.textContent = `Member Since: ${memberDateFormatted}`;
            }
        });

    } catch (e) {
        console.error('Error syncing profile:', e);
    }
}

// ==============================================================================
// DASHBOARD KPI & PAYMENT OVERVIEW REFRESH (Supabase)
// ==============================================================================
async function refreshDashboardKPIs(userId) {
    if (!userId) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) userId = user.id;
        else return;
    }

    try {
        // Query user's reservations
        const { data: reservations } = await supabaseClient
            .from('reservations')
            .select(`
                id,
                total_price,
                down_payment_amount,
                monthly_amortization,
                balance,
                status,
                payments (
                    id,
                    amount,
                    status,
                    due_date
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        const activeRes = reservations?.find(r => r.status === 'PENDING' || r.status === 'APPROVED');

        const paymentStatusBadge = document.querySelector('.payment-card .status-badge');
        const paymentRows = document.querySelectorAll('.payment-card .payment-row span:last-child');

        if (activeRes) {
            if (paymentStatusBadge) {
                const isPending = activeRes.status === 'PENDING';
                paymentStatusBadge.textContent = isPending ? 'Pending Down Payment' : 'Active Amortization';
                paymentStatusBadge.style.backgroundColor = isPending ? '#fef3c7' : '#e8eee8';
                paymentStatusBadge.style.color = isPending ? '#92400e' : '#2d4a36';
                paymentStatusBadge.style.border = `1px solid ${isPending ? '#fde68a' : '#c2cfc2'}`;
                paymentStatusBadge.style.borderRadius = '4px';
                paymentStatusBadge.style.fontSize = '0.60rem';
                paymentStatusBadge.style.padding = '2.5px 6px';
                paymentStatusBadge.style.whiteSpace = 'nowrap';
                paymentStatusBadge.style.overflow = 'hidden';
                paymentStatusBadge.style.textOverflow = 'ellipsis';
                paymentStatusBadge.style.maxWidth = '100%';
                paymentStatusBadge.style.display = 'inline-block';
            }
            if (paymentRows && paymentRows.length >= 2) {
                // Current Due
                paymentRows[0].textContent = `₱ ${Number(activeRes.down_payment_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                // Next Payment
                paymentRows[1].textContent = `₱ ${Number(activeRes.monthly_amortization).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            }
        } else {
            if (paymentStatusBadge) {
                paymentStatusBadge.textContent = 'No Active Due';
                paymentStatusBadge.style.backgroundColor = '#f3f4f6';
                paymentStatusBadge.style.color = '#4b5563';
                paymentStatusBadge.style.border = '1px solid #e5e7eb';
                paymentStatusBadge.style.borderRadius = '4px';
                paymentStatusBadge.style.fontSize = '0.60rem';
                paymentStatusBadge.style.padding = '2.5px 6px';
                paymentStatusBadge.style.whiteSpace = 'nowrap';
                paymentStatusBadge.style.overflow = 'hidden';
                paymentStatusBadge.style.textOverflow = 'ellipsis';
                paymentStatusBadge.style.maxWidth = '100%';
                paymentStatusBadge.style.display = 'inline-block';
            }
            if (paymentRows && paymentRows.length >= 2) {
                paymentRows[0].textContent = '₱ 0.00';
                paymentRows[1].textContent = 'None';
            }
        }
    } catch (err) {
        console.error('Failed to refresh dashboard KPIs:', err);
    }
}

// Helper utilities
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function formatMemberSince(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return 'October, 2026';
    }
}

// ==============================================================================
// 10. CLIENT MAINTENANCE VISITS & SUPPORT TICKETS MODULES
// ==============================================================================
let clientReservedSpacesCache = [];

function openMaintenanceModal(preselectedSpaceId = null) {
    if (typeof window.openMaintenancePage === 'function') {
        window.openMaintenancePage(preselectedSpaceId);
        return;
    }
    const modal = document.getElementById('maintenancePage') || document.getElementById('maintenanceModal');
    if (!modal) return;
    modal.classList.add('active');
    setupMaintenanceModalEvents();
    loadClientReservedSpaces(preselectedSpaceId);
    loadClientMaintenanceVisits();
}

function closeMaintenanceModal() {
    const modal = document.getElementById('maintenancePage') || document.getElementById('maintenanceModal');
    if (modal) modal.classList.remove('active');
}

let maintenanceEventsInitialized = false;
function setupMaintenanceModalEvents() {
    if (maintenanceEventsInitialized) return;
    maintenanceEventsInitialized = true;

    const modal = document.getElementById('maintenanceModal');
    const closeBtn = document.getElementById('closeMaintenanceModalBtn');
    const tabList = document.getElementById('tabClientMaintList');
    const tabNew = document.getElementById('tabClientMaintNew');
    const listView = document.getElementById('clientMaintListView');
    const formView = document.getElementById('clientMaintForm');
    const cancelBtn = document.getElementById('btnCancelMaintForm');
    const emptyCreateBtn = document.getElementById('btnMaintEmptyCreate');

    if (closeBtn) closeBtn.addEventListener('click', closeMaintenanceModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeMaintenanceModal();
        });
    }

    const showList = () => {
        if (tabList) {
            tabList.style.borderBottomColor = '#2d4a36';
            tabList.style.color = '#2d4a36';
            tabList.style.fontWeight = '700';
        }
        if (tabNew) {
            tabNew.style.borderBottomColor = 'transparent';
            tabNew.style.color = '#64748b';
            tabNew.style.fontWeight = '600';
        }
        if (listView) listView.style.display = 'block';
        if (formView) formView.style.display = 'none';
        loadClientMaintenanceVisits();
    };

    const showNew = () => {
        if (tabNew) {
            tabNew.style.borderBottomColor = '#2d4a36';
            tabNew.style.color = '#2d4a36';
            tabNew.style.fontWeight = '700';
        }
        if (tabList) {
            tabList.style.borderBottomColor = 'transparent';
            tabList.style.color = '#64748b';
            tabList.style.fontWeight = '600';
        }
        if (listView) listView.style.display = 'none';
        if (formView) formView.style.display = 'block';

        // Set default minimum date to tomorrow
        const dateInput = document.getElementById('clientMaintDateInput');
        if (dateInput && !dateInput.value) {
            const tmrw = new Date();
            tmrw.setDate(tmrw.getDate() + 1);
            dateInput.min = tmrw.toISOString().split('T')[0];
            dateInput.value = tmrw.toISOString().split('T')[0];
        }
    };

    if (tabList) tabList.addEventListener('click', showList);
    if (tabNew) tabNew.addEventListener('click', showNew);
    if (cancelBtn) cancelBtn.addEventListener('click', showList);
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', showNew);

    if (formView) {
        formView.addEventListener('submit', async (e) => {
            e.preventDefault();
            const spaceId = document.getElementById('clientMaintSpaceSelect')?.value;
            const visitType = document.getElementById('clientMaintTypeSelect')?.value;
            const schedDate = document.getElementById('clientMaintDateInput')?.value;
            const notes = document.getElementById('clientMaintNotesInput')?.value.trim();
            const submitBtn = document.getElementById('btnSubmitMaintForm');

            if (!spaceId || !visitType || !schedDate) {
                alert('Please select a reserved plot, service type, and preferred date.');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting Request...';
            }

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error('Please sign in to schedule maintenance.');

                const { error } = await supabaseClient
                    .from('maintenance_visits')
                    .insert([{
                        space_id: parseInt(spaceId),
                        requested_by: user.id,
                        visit_type: visitType,
                        scheduled_date: schedDate,
                        notes: notes || null,
                        status: 'scheduled'
                    }]);

                if (error) throw error;

                if (typeof window.showSuccessModal === 'function') {
                    window.showSuccessModal('Request Submitted', `Your ${visitType} request for ${schedDate} has been scheduled. Cemetery staff will inspect and tend to your plot.`);
                } else {
                    alert(`Your ${visitType} request has been scheduled for ${schedDate}.`);
                }

                formView.reset();
                showList();

            } catch (err) {
                console.error('Maintenance request error:', err);
                alert('Failed to submit request: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Request';
                }
            }
        });
    }
}

async function loadClientReservedSpaces(preselectedSpaceId = null) {
    const spaceSelect = document.getElementById('clientMaintSpaceSelect');
    if (!spaceSelect) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: reservations } = await supabaseClient
            .from('reservations')
            .select('space_id, memorial_spaces (id, plot_identifier, section_name, category)')
            .eq('user_id', user.id)
            .not('status', 'in', '("CANCELLED","REJECTED")');

        clientReservedSpacesCache = (reservations || []).map(r => r.memorial_spaces).filter(Boolean);

        if (clientReservedSpacesCache.length === 0) {
            spaceSelect.innerHTML = '<option value="">-- No Reserved Plots Found --</option>';
            return;
        }

        spaceSelect.innerHTML = '<option value="">-- Choose Reserved Plot --</option>' +
            clientReservedSpacesCache.map(s => `
                <option value="${s.id}" ${preselectedSpaceId && Number(preselectedSpaceId) === Number(s.id) ? 'selected' : ''}>
                    ${s.plot_identifier} - ${s.section_name} (${s.category})
                </option>
            `).join('');

        if (preselectedSpaceId) {
            spaceSelect.value = String(preselectedSpaceId);
        }

    } catch (err) {
        console.error('Failed to load user spaces for maintenance:', err);
    }
}

async function loadClientMaintenanceVisits() {
    const loading = document.getElementById('clientMaintLoading');
    const empty = document.getElementById('clientMaintEmpty');
    const container = document.getElementById('clientMaintListContainer');

    if (loading) loading.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (container) container.style.display = 'none';

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: visits, error } = await supabaseClient
            .from('maintenance_visits')
            .select(`
                id,
                visit_type,
                scheduled_date,
                status,
                notes,
                completed_at,
                space_id,
                memorial_spaces (id, plot_identifier, section_name, category)
            `)
            .eq('requested_by', user.id)
            .order('scheduled_date', { ascending: false });

        if (loading) loading.style.display = 'none';

        if (error || !visits || visits.length === 0) {
            if (empty) empty.style.display = 'block';
            if (container) container.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (container) {
            container.style.display = 'flex';
            container.innerHTML = visits.map(v => {
                const space = v.memorial_spaces || {};
                const plotCode = space.plot_identifier || 'Assigned Plot';
                const section = space.section_name || 'Section';
                const status = (v.status || 'scheduled').toLowerCase();
                
                let badgeBg = '#fef3c7';
                let badgeColor = '#92400e';
                let badgeLabel = 'Scheduled';

                if (status === 'completed') {
                    badgeBg = '#dcfce7';
                    badgeColor = '#166534';
                    badgeLabel = 'Completed';
                } else if (status === 'in-progress') {
                    badgeBg = '#e0f2fe';
                    badgeColor = '#0369a1';
                    badgeLabel = 'In-Progress';
                } else if (status === 'cancelled') {
                    badgeBg = '#fee2e2';
                    badgeColor = '#991b1b';
                    badgeLabel = 'Cancelled';
                }

                return `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <strong style="color: #1e293b; font-size: 0.95rem;">${v.visit_type}</strong>
                                <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${badgeLabel}</span>
                            </div>
                            <div style="font-size: 0.8rem; color: #64748b;">
                                <span>Plot: <strong>${plotCode}</strong> &bull; ${section}</span>
                                &bull;
                                <span>Scheduled: <strong>${new Date(v.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                            </div>
                            ${v.notes ? `
                                <div style="font-size: 0.78rem; color: #475569; margin-top: 4px; font-style: italic;">
                                    Notes: ${v.notes}
                                </div>
                            ` : ''}
                        </div>
                        <div>
                            ${status === 'scheduled' ? `
                                <button type="button" style="padding: 4px 10px; font-size: 0.75rem; color: #dc2626; border: 1px solid #fca5a5; background: #fff5f5; border-radius: 4px; cursor: pointer;" onclick="cancelClientMaintenanceVisit(${v.id})">Cancel</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Failed to load maintenance visits:', err);
    }
}

window.cancelClientMaintenanceVisit = async function(visitId) {
    if (!await showConfirmModal({ title: "Cancel Service Request", message: "Are you sure you want to cancel this scheduled service request?", confirmText: "Cancel Request", cancelText: "Keep", type: "warning", danger: true })) return;
    try {
        const { error } = await supabaseClient
            .from('maintenance_visits')
            .update({ status: 'cancelled' })
            .eq('id', visitId);

        if (error) throw error;
        alert('Service request cancelled.');
        loadClientMaintenanceVisits();
    } catch (err) {
        alert('Failed to cancel request: ' + err.message);
    }
};

// ------------------------------------------------------------------------------
// Support Tickets Client Controller
// ------------------------------------------------------------------------------
function openSupportTicketsModal() {
    if (typeof window.openSupportTicketsPage === 'function') {
        window.openSupportTicketsPage();
        return;
    }
    const modal = document.getElementById('supportTicketsPage') || document.getElementById('supportTicketsModal');
    if (!modal) return;
    modal.classList.add('active');
    setupSupportTicketsModalEvents();
    loadClientSupportTickets();
}

function closeSupportTicketsModal() {
    const modal = document.getElementById('supportTicketsPage') || document.getElementById('supportTicketsModal');
    if (modal) modal.classList.remove('active');
}

let supportTicketsEventsInitialized = false;
function setupSupportTicketsModalEvents() {
    if (supportTicketsEventsInitialized) return;
    supportTicketsEventsInitialized = true;

    const modal = document.getElementById('supportTicketsModal');
    const closeBtn = document.getElementById('closeSupportModalBtn');
    const tabList = document.getElementById('tabClientTicketList');
    const tabNew = document.getElementById('tabClientTicketNew');
    const listView = document.getElementById('clientTicketListView');
    const formView = document.getElementById('clientTicketForm');
    const cancelBtn = document.getElementById('btnCancelTicketForm');
    const emptyCreateBtn = document.getElementById('btnTicketEmptyCreate');

    if (closeBtn) closeBtn.addEventListener('click', closeSupportTicketsModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSupportTicketsModal();
        });
    }

    const showList = () => {
        if (tabList) {
            tabList.style.borderBottomColor = '#0369a1';
            tabList.style.color = '#0369a1';
            tabList.style.fontWeight = '700';
        }
        if (tabNew) {
            tabNew.style.borderBottomColor = 'transparent';
            tabNew.style.color = '#64748b';
            tabNew.style.fontWeight = '600';
        }
        if (listView) listView.style.display = 'block';
        if (formView) formView.style.display = 'none';
        loadClientSupportTickets();
    };

    const showNew = () => {
        if (tabNew) {
            tabNew.style.borderBottomColor = '#0369a1';
            tabNew.style.color = '#0369a1';
            tabNew.style.fontWeight = '700';
        }
        if (tabList) {
            tabList.style.borderBottomColor = 'transparent';
            tabList.style.color = '#64748b';
            tabList.style.fontWeight = '600';
        }
        if (listView) listView.style.display = 'none';
        if (formView) formView.style.display = 'block';
    };

    if (tabList) tabList.addEventListener('click', showList);
    if (tabNew) tabNew.addEventListener('click', showNew);
    if (cancelBtn) cancelBtn.addEventListener('click', showList);
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', showNew);

    if (formView) {
        formView.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subject = document.getElementById('clientTicketSubjectInput')?.value.trim();
            const category = document.getElementById('clientTicketCategorySelect')?.value;
            const priority = document.getElementById('clientTicketPrioritySelect')?.value;
            const message = document.getElementById('clientTicketMessageInput')?.value.trim();
            const submitBtn = document.getElementById('btnSubmitTicketForm');

            if (!subject || !message) {
                alert('Please enter a subject and message for your ticket.');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting Ticket...';
            }

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error('Please sign in to submit a support ticket.');

                const ticketNo = `TCK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

                const { error } = await supabaseClient
                    .from('support_tickets')
                    .insert([{
                        ticket_number: ticketNo,
                        user_id: user.id,
                        subject: subject,
                        category: category,
                        priority: priority,
                        message: message,
                        status: 'open'
                    }]);

                if (error) throw error;

                if (typeof window.showSuccessModal === 'function') {
                    window.showSuccessModal('Ticket Submitted', `Your ticket ${ticketNo} has been opened. Our support staff has been notified and will reply shortly.`);
                } else {
                    alert(`Your ticket ${ticketNo} has been submitted.`);
                }

                formView.reset();
                showList();

            } catch (err) {
                console.error('Support ticket error:', err);
                alert('Failed to submit ticket: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Ticket';
                }
            }
        });
    }
}

async function loadClientSupportTickets() {
    const loading = document.getElementById('clientTicketLoading');
    const empty = document.getElementById('clientTicketEmpty');
    const container = document.getElementById('clientTicketListContainer');

    if (loading) loading.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (container) container.style.display = 'none';

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: tickets, error } = await supabaseClient
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (loading) loading.style.display = 'none';

        if (error || !tickets || tickets.length === 0) {
            if (empty) empty.style.display = 'block';
            if (container) container.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (container) {
            container.style.display = 'flex';
            container.innerHTML = tickets.map(t => {
                const status = (t.status || 'open').toLowerCase();
                let badgeBg = '#e0f2fe';
                let badgeColor = '#0369a1';
                let badgeLabel = 'Open';

                if (status === 'resolved' || status === 'closed') {
                    badgeBg = '#dcfce7';
                    badgeColor = '#166534';
                    badgeLabel = status.toUpperCase();
                } else if (status === 'in-progress') {
                    badgeBg = '#fef3c7';
                    badgeColor = '#92400e';
                    badgeLabel = 'In-Progress';
                }

                return `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong style="color: #1e293b; font-size: 0.95rem;">${t.subject}</strong>
                                <span style="background: #f1f5f9; color: #475569; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${t.ticket_number}</span>
                            </div>
                            <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${badgeLabel}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">
                            <span>Category: <strong>${t.category}</strong></span> &bull; 
                            <span>Priority: <strong style="text-transform: capitalize;">${t.priority}</strong></span> &bull; 
                            <span>Date: ${new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #334155; background: #f8fafc; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; white-space: pre-wrap;">${t.message}</div>
                        ${t.resolution_notes ? `
                            <div style="font-size: 0.82rem; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; margin-top: 6px;">
                                <strong>Staff Response / Resolution:</strong> ${t.resolution_notes}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Failed to load support tickets:', err);
    }
}

window.openMaintenanceModal = openMaintenanceModal;
window.closeMaintenanceModal = closeMaintenanceModal;
window.openSupportTicketsModal = openSupportTicketsModal;
window.closeSupportTicketsModal = closeSupportTicketsModal;

// Global exposure
window.refreshDashboardKPIs = refreshDashboardKPIs;
window.openBookingModalForPlot = openBookingModalForPlot;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', loadAllDashboardComponents);

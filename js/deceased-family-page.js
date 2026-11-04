// ==============================================================================
// DECEASED FAMILY PAGE CONTROLLER (Dedicated Subpage - Live Supabase)
// Clean enterprise design: NO EMOJIS, NO GRADIENTS, CRISP <= 4PX CORNERS
// ==============================================================================

let deceasedRecordsCache = [];

function initDeceasedFamilyPage() {
    const deceasedFamilyPage = document.getElementById('deceasedFamilyPage');
    const deceasedFamilyMenuBtn = document.getElementById('deceasedFamilyMenuBtn');
    const deceasedFamilyUserBtn = document.getElementById('deceasedFamilyUserBtn');
    const makeDeceasedFamilyReservationBtn = document.getElementById('makeDeceasedFamilyReservationBtn');
    const dfViewMyReservationsBtn = document.getElementById('dfViewMyReservationsBtn');
    const dfBtnManagePlots = document.getElementById('dfBtnManagePlots');
    const dfEmptyAddBtn = document.getElementById('dfEmptyAddBtn');
    const dfOpenPaymentHistoryLink = document.getElementById('dfOpenPaymentHistoryLink');
    const dfSearchInput = document.getElementById('dfSearchInput');

    // Menu button - toggle sidebar menu
    if (deceasedFamilyMenuBtn) {
        deceasedFamilyMenuBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar-menu');
            const overlay = document.getElementById('overlay');
            if (sidebar) sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    // User button - close deceased family and open profile modal
    if (deceasedFamilyUserBtn) {
        deceasedFamilyUserBtn.addEventListener('click', () => {
            if (deceasedFamilyPage) deceasedFamilyPage.classList.remove('active');
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    // Make reservation button - open reservation modal
    const openReservation = () => {
        if (deceasedFamilyPage) deceasedFamilyPage.classList.remove('active');
        const reservationModal = document.querySelector('.reservation-modal-overlay');
        if (reservationModal) reservationModal.classList.add('active');
    };
    if (makeDeceasedFamilyReservationBtn) makeDeceasedFamilyReservationBtn.addEventListener('click', openReservation);

    // Switch to My Reservations
    const openMyReservations = () => {
        if (deceasedFamilyPage) deceasedFamilyPage.classList.remove('active');
        const myReservationPage = document.getElementById('myReservationPage');
        if (myReservationPage) {
            myReservationPage.classList.add('active');
            if (typeof window.loadMyReservations === 'function') {
                window.loadMyReservations();
            }
        }
    };
    if (dfViewMyReservationsBtn) dfViewMyReservationsBtn.addEventListener('click', openMyReservations);
    if (dfBtnManagePlots) dfBtnManagePlots.addEventListener('click', openMyReservations);
    if (dfEmptyAddBtn) dfEmptyAddBtn.addEventListener('click', openMyReservations);

    // Payment History Link
    if (dfOpenPaymentHistoryLink) {
        dfOpenPaymentHistoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openGcashPaymentsFullPage === 'function') {
                window.openGcashPaymentsFullPage(false, 'history');
            }
        });
    }

    // Search input listener
    if (dfSearchInput) {
        dfSearchInput.addEventListener('input', () => {
            const query = dfSearchInput.value.trim().toLowerCase();
            renderDeceasedTable(query);
        });
    }

    // Listen for tab/page activation to load live data
    if (deceasedFamilyPage) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && deceasedFamilyPage.classList.contains('active')) {
                    loadDeceasedFamilyLiveContent();
                }
            });
        });
        observer.observe(deceasedFamilyPage, { attributes: true });
        if (deceasedFamilyPage.classList.contains('active')) {
            loadDeceasedFamilyLiveContent();
        }
    }
}

async function loadDeceasedFamilyLiveContent() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // 1. Load User Profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, member_since, account_status, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        const memberSinceDate = profile?.member_since ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently Joined';
        const memberStatus = profile?.account_status || 'ACTIVE';
        
        const elStatus = document.getElementById('dfAccountStatus');
        if (elStatus) elStatus.textContent = memberStatus;
        const elMemberSince = document.getElementById('dfMemberSince');
        if (elMemberSince) elMemberSince.textContent = `Member Since: ${memberSinceDate}`;

        // Sync Avatar
        const avatarImg = document.getElementById('deceasedFamilyUserAvatar');
        if (avatarImg) {
            const savedPic = localStorage.getItem('userProfilePicture');
            if (savedPic) avatarImg.src = savedPic;
            else if (profile?.avatar_url) avatarImg.src = profile.avatar_url;
        }

        // 2. Load User's Reservations
        const { data: reservations } = await supabaseClient
            .from('reservations')
            .select(`
                id,
                reservation_number,
                status,
                space_id,
                balance,
                monthly_amortization,
                memorial_spaces (id, plot_identifier, section_name, category)
            `)
            .eq('user_id', user.id)
            .not('status', 'in', '("CANCELLED","REJECTED")');

        const activeReservations = reservations || [];
        const plotsCount = activeReservations.length;
        const elPlotsCount = document.getElementById('dfActivePlotsCount');
        if (elPlotsCount) elPlotsCount.textContent = `${plotsCount} Plots`;

        const elPlotsSummary = document.getElementById('dfPlotsSummaryText');
        if (elPlotsSummary) {
            if (plotsCount === 0) {
                elPlotsSummary.textContent = 'No plots reserved yet.';
            } else {
                const plotCodes = activeReservations.map(r => r.memorial_spaces?.plot_identifier).filter(Boolean).slice(0, 3).join(', ');
                elPlotsSummary.textContent = `${plotsCount} Plot${plotsCount > 1 ? 's' : ''} (${plotCodes}${plotsCount > 3 ? '...' : ''})`;
            }
        }

        // Financial Overview
        const totalBalance = activeReservations.reduce((sum, r) => sum + Number(r.balance || 0), 0);
        const elBal = document.getElementById('dfRemainingBalance');
        if (elBal) elBal.textContent = `PHP ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        const elPayBadge = document.getElementById('dfPaymentStatusBadge');
        if (elPayBadge) {
            if (totalBalance <= 0 && plotsCount > 0) {
                elPayBadge.textContent = 'Fully Paid';
                elPayBadge.style.background = '#dcfce7';
                elPayBadge.style.color = '#15803d';
            } else if (totalBalance > 0) {
                elPayBadge.textContent = 'Active Amortization';
                elPayBadge.style.background = '#e0f2fe';
                elPayBadge.style.color = '#0369a1';
            } else {
                elPayBadge.textContent = 'No Dues';
                elPayBadge.style.background = '#f1f5f9';
                elPayBadge.style.color = '#64748b';
            }
        }

        // 3. Load Deceased Records for User's Spaces
        const spaceIds = activeReservations.map(r => r.space_id).filter(Boolean);
        const loadingEl = document.getElementById('dfDeceasedLoading');
        const emptyEl = document.getElementById('dfDeceasedEmpty');
        const tableContainerEl = document.getElementById('dfTableContainer');

        if (spaceIds.length === 0) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
            updateInterredKpis(0);
            return;
        }

        const { data: deceasedRecords, error: decErr } = await supabaseClient
            .from('memorial_records')
            .select(`
                id,
                deceased_name,
                birth_date,
                death_date,
                burial_date,
                gender,
                epitaph,
                space_id,
                memorial_spaces (id, plot_identifier, section_name, category)
            `)
            .in('space_id', spaceIds)
            .order('death_date', { ascending: false });

        if (loadingEl) loadingEl.style.display = 'none';

        if (decErr || !deceasedRecords || deceasedRecords.length === 0) {
            deceasedRecordsCache = [];
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
            updateInterredKpis(0);
            return;
        }

        deceasedRecordsCache = deceasedRecords;
        updateInterredKpis(deceasedRecordsCache.length);
        renderDeceasedTable();

    } catch (err) {
        console.error('Failed to load live deceased family content:', err);
    }
}

function updateInterredKpis(count) {
    const elInterredCount = document.getElementById('dfInterredCount');
    if (elInterredCount) elInterredCount.textContent = `${count} Interred`;
    
    const elRegistryBadge = document.getElementById('dfRegistryCountBadge');
    if (elRegistryBadge) elRegistryBadge.textContent = `${count} Records`;
}

function renderDeceasedTable(query = '') {
    const emptyEl = document.getElementById('dfDeceasedEmpty');
    const tableContainerEl = document.getElementById('dfTableContainer');
    const tbody = document.getElementById('dfDeceasedTableBody');
    if (!tbody) return;

    let records = deceasedRecordsCache;
    if (query) {
        records = records.filter(d => {
            const name = (d.deceased_name || '').toLowerCase();
            const plot = (d.memorial_spaces?.plot_identifier || '').toLowerCase();
            const sec = (d.memorial_spaces?.section_name || '').toLowerCase();
            const cat = (d.memorial_spaces?.category || '').toLowerCase();
            const epitaph = (d.epitaph || '').toLowerCase();
            return name.includes(query) || plot.includes(query) || sec.includes(query) || cat.includes(query) || epitaph.includes(query);
        });
    }

    if (records.length === 0) {
        if (deceasedRecordsCache.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (tableContainerEl) tableContainerEl.style.display = 'block';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                        No records match the filter query "${escapeHtml(query)}".
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (tableContainerEl) tableContainerEl.style.display = 'block';

    tbody.innerHTML = records.map(d => {
        const space = d.memorial_spaces || {};
        const plotCode = space.plot_identifier || 'Assigned Plot';
        const section = space.section_name || 'Garden Section';
        const category = space.category || 'Memorial Space';
        const lifespan = (d.birth_date && d.death_date)
            ? `${new Date(d.birth_date).getFullYear()} - ${new Date(d.death_date).getFullYear()}`
            : (d.death_date ? `Passed ${new Date(d.death_date).toLocaleDateString()}` : 'In Loving Memory');
        const intermentDate = d.burial_date ? new Date(d.burial_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recorded';

        return `
            <tr>
                <td>
                    <strong style="color: #1e3a29; font-size: 0.92rem;">${escapeHtml(d.deceased_name)}</strong>
                </td>
                <td>
                    <span class="subpage-badge" style="font-family: monospace; font-weight: 700;">${escapeHtml(plotCode)}</span>
                </td>
                <td>${escapeHtml(section)}</td>
                <td>${escapeHtml(category)}</td>
                <td>${lifespan}</td>
                <td>${intermentDate}</td>
                <td style="font-style: italic; color: #475569; max-width: 250px;">
                    ${d.epitaph ? `"${escapeHtml(d.epitaph)}"` : '<span style="color: #94a3b8;">--</span>'}
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <a href="plot-locator.html?plot=${encodeURIComponent(plotCode)}" class="btn-subpage-outline btn-subpage-sm" style="margin-right: 6px;">Locate Plot</a>
                    <button type="button" class="btn-subpage-primary btn-subpage-sm" onclick="if (typeof window.openMaintenancePage === 'function') window.openMaintenancePage(${d.space_id});">Request Care</button>
                </td>
            </tr>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

window.loadDeceasedFamilyLiveContent = loadDeceasedFamilyLiveContent;

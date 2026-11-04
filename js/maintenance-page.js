// ==============================================================================
// MAINTENANCE & VISITS PAGE CONTROLLER (Dedicated Subpage - Live Supabase)
// Clean enterprise design: NO EMOJIS, NO GRADIENTS, CRISP <= 4PX CORNERS
// ==============================================================================

let maintenanceVisitsCache = [];
let maintenanceReservedSpacesCache = [];

function initMaintenancePage() {
    const maintenancePage = document.getElementById('maintenancePage');
    const menuBtn = document.getElementById('maintenanceMenuBtn');
    const userBtn = document.getElementById('maintenanceUserBtn');
    const btnGoReservations = document.getElementById('btnMaintGoReservations');
    const btnOpenCreateTop = document.getElementById('btnMaintOpenCreateTop');
    const btnSwitchToNewForm = document.getElementById('btnMaintSwitchToNewForm');
    const btnEmptyCreate = document.getElementById('btnMaintEmptyCreate');
    const btnBackToList = document.getElementById('btnMaintBackToList');
    const btnCancelForm = document.getElementById('btnCancelMaintForm');
    const tabList = document.getElementById('tabMaintList');
    const tabNew = document.getElementById('tabMaintNew');
    const form = document.getElementById('maintForm');
    const searchInput = document.getElementById('maintSearchInput');
    const statusFilter = document.getElementById('maintStatusFilter');

    // Sidebar navigation toggling
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar-menu');
            const overlay = document.getElementById('overlay');
            if (sidebar) sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    // Profile button
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            if (maintenancePage) maintenancePage.classList.remove('active');
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    // Go to My Reservations
    if (btnGoReservations) {
        btnGoReservations.addEventListener('click', () => {
            if (maintenancePage) maintenancePage.classList.remove('active');
            const myRes = document.getElementById('myReservationPage');
            if (myRes) {
                myRes.classList.add('active');
                if (typeof window.loadMyReservations === 'function') {
                    window.loadMyReservations();
                }
            }
        });
    }

    // Tab & View Switching
    const showListView = () => {
        if (tabList) tabList.classList.add('active');
        if (tabNew) tabNew.classList.remove('active');
        const listView = document.getElementById('maintListView');
        const formView = document.getElementById('maintFormView');
        if (listView) listView.style.display = 'block';
        if (formView) formView.style.display = 'none';
        renderMaintenanceTable();
    };

    const showFormView = (preselectedSpaceId = null) => {
        if (tabNew) tabNew.classList.add('active');
        if (tabList) tabList.classList.remove('active');
        const listView = document.getElementById('maintListView');
        const formView = document.getElementById('maintFormView');
        if (listView) listView.style.display = 'none';
        if (formView) formView.style.display = 'block';

        // Set minimum date to tomorrow
        const dateInput = document.getElementById('maintDateInput');
        if (dateInput && !dateInput.value) {
            const tmrw = new Date();
            tmrw.setDate(tmrw.getDate() + 1);
            dateInput.min = tmrw.toISOString().split('T')[0];
            dateInput.value = tmrw.toISOString().split('T')[0];
        }

        if (preselectedSpaceId) {
            const spaceSelect = document.getElementById('maintSpaceSelect');
            if (spaceSelect) spaceSelect.value = String(preselectedSpaceId);
        }
    };

    if (tabList) tabList.addEventListener('click', showListView);
    if (tabNew) tabNew.addEventListener('click', () => showFormView());
    if (btnOpenCreateTop) btnOpenCreateTop.addEventListener('click', () => showFormView());
    if (btnSwitchToNewForm) btnSwitchToNewForm.addEventListener('click', () => showFormView());
    if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => showFormView());
    if (btnBackToList) btnBackToList.addEventListener('click', showListView);
    if (btnCancelForm) btnCancelForm.addEventListener('click', showListView);

    // Filter & Search
    if (searchInput) {
        searchInput.addEventListener('input', () => filterAndRenderMaintenance());
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', () => filterAndRenderMaintenance());
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const spaceId = document.getElementById('maintSpaceSelect')?.value;
            const visitType = document.getElementById('maintTypeSelect')?.value;
            const schedDate = document.getElementById('maintDateInput')?.value;
            const notes = document.getElementById('maintNotesInput')?.value.trim();
            const submitBtn = document.getElementById('btnSubmitMaintForm');

            if (!spaceId || !visitType || !schedDate) {
                alert('Please select a reserved plot, service type, and preferred date.');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
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
                    window.showSuccessModal('Work Order Submitted', `Your ${visitType} request for ${schedDate} has been scheduled. Cemetery staff will inspect and tend to your plot.`);
                } else {
                    alert(`Your ${visitType} request has been scheduled for ${schedDate}.`);
                }

                form.reset();
                await loadMaintenancePageData();
                showListView();

            } catch (err) {
                console.error('Maintenance request error:', err);
                alert('Failed to submit request: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Work Order';
                }
            }
        });
    }

    // Proof Modal close handlers
    const proofModal = document.getElementById('maintProofModal');
    const closeProofBtn = document.getElementById('btnCloseMaintProofModal');
    const dismissProofBtn = document.getElementById('btnDismissMaintProofModal');
    if (closeProofBtn) closeProofBtn.addEventListener('click', () => window.closeMaintenanceProofModal());
    if (dismissProofBtn) dismissProofBtn.addEventListener('click', () => window.closeMaintenanceProofModal());
    if (proofModal) {
        proofModal.addEventListener('click', (e) => {
            if (e.target === proofModal) window.closeMaintenanceProofModal();
        });
    }

    // Tab activation observer
    if (maintenancePage) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && maintenancePage.classList.contains('active')) {
                    loadMaintenancePageData();
                }
            });
        });
        observer.observe(maintenancePage, { attributes: true });
        if (maintenancePage.classList.contains('active')) {
            loadMaintenancePageData();
        }
    }
}

async function loadMaintenancePageData(preselectedSpaceId = null) {
    const loadingEl = document.getElementById('maintLoading');
    const emptyEl = document.getElementById('maintEmpty');
    const tableContainerEl = document.getElementById('maintTableContainer');

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (tableContainerEl) tableContainerEl.style.display = 'none';

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // Sync Avatar
        const avatarImg = document.getElementById('maintenanceUserAvatar');
        if (avatarImg) {
            const savedPic = localStorage.getItem('userProfilePicture');
            if (savedPic) avatarImg.src = savedPic;
        }

        // 1. Fetch user's reserved spaces for dropdown and KPI
        const { data: reservations } = await supabaseClient
            .from('reservations')
            .select('space_id, memorial_spaces (id, plot_identifier, section_name, category)')
            .eq('user_id', user.id)
            .not('status', 'in', '("CANCELLED","REJECTED")');

        maintenanceReservedSpacesCache = (reservations || []).map(r => r.memorial_spaces).filter(Boolean);
        
        const spaceSelect = document.getElementById('maintSpaceSelect');
        if (spaceSelect) {
            if (maintenanceReservedSpacesCache.length === 0) {
                spaceSelect.innerHTML = '<option value="">-- No Reserved Plots Found --</option>';
            } else {
                spaceSelect.innerHTML = '<option value="">-- Choose Reserved Plot --</option>' +
                    maintenanceReservedSpacesCache.map(s => `
                        <option value="${s.id}" ${preselectedSpaceId && Number(preselectedSpaceId) === Number(s.id) ? 'selected' : ''}>
                            ${s.plot_identifier} - ${s.section_name} (${s.category})
                        </option>
                    `).join('');
            }
        }

        const elPlotsKpi = document.getElementById('maintKpiPlots');
        if (elPlotsKpi) elPlotsKpi.textContent = `${maintenanceReservedSpacesCache.length} Plots`;

        // 2. Fetch maintenance visits
        const { data: visits, error } = await supabaseClient
            .from('maintenance_visits')
            .select(`
                id,
                visit_type,
                scheduled_date,
                status,
                notes,
                proof_image_url,
                completed_at,
                space_id,
                memorial_spaces (id, plot_identifier, section_name, category)
            `)
            .eq('requested_by', user.id)
            .order('scheduled_date', { ascending: false });

        if (loadingEl) loadingEl.style.display = 'none';

        if (error || !visits || visits.length === 0) {
            maintenanceVisitsCache = [];
            updateMaintenanceKpis(0, 0, 0);
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
            return;
        }

        maintenanceVisitsCache = visits;

        const total = maintenanceVisitsCache.length;
        const active = maintenanceVisitsCache.filter(v => ['scheduled', 'in-progress'].includes((v.status || '').toLowerCase())).length;
        const completed = maintenanceVisitsCache.filter(v => (v.status || '').toLowerCase() === 'completed').length;
        updateMaintenanceKpis(total, active, completed);

        renderMaintenanceTable();

    } catch (err) {
        console.error('Failed to load maintenance records:', err);
    }
}

function updateMaintenanceKpis(total, active, completed) {
    const elTotal = document.getElementById('maintKpiTotal');
    if (elTotal) elTotal.textContent = String(total);

    const elActive = document.getElementById('maintKpiActive');
    if (elActive) elActive.textContent = String(active);

    const elCompleted = document.getElementById('maintKpiCompleted');
    if (elCompleted) elCompleted.textContent = String(completed);

    const elBadge = document.getElementById('maintListCountBadge');
    if (elBadge) elBadge.textContent = `${total} Orders`;
}

function filterAndRenderMaintenance() {
    const search = (document.getElementById('maintSearchInput')?.value || '').trim().toLowerCase();
    const status = (document.getElementById('maintStatusFilter')?.value || 'all').toLowerCase();

    let filtered = maintenanceVisitsCache;

    if (status !== 'all') {
        filtered = filtered.filter(v => (v.status || '').toLowerCase() === status);
    }

    if (search) {
        filtered = filtered.filter(v => {
            const plot = (v.memorial_spaces?.plot_identifier || '').toLowerCase();
            const sec = (v.memorial_spaces?.section_name || '').toLowerCase();
            const type = (v.visit_type || '').toLowerCase();
            const notes = (v.notes || '').toLowerCase();
            return plot.includes(search) || sec.includes(search) || type.includes(search) || notes.includes(search);
        });
    }

    renderMaintenanceTable(filtered, search || status !== 'all');
}

function renderMaintenanceTable(records = maintenanceVisitsCache, isFiltered = false) {
    const emptyEl = document.getElementById('maintEmpty');
    const tableContainerEl = document.getElementById('maintTableContainer');
    const tbody = document.getElementById('maintTableBody');
    if (!tbody) return;

    if (records.length === 0) {
        if (!isFiltered && maintenanceVisitsCache.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (tableContainerEl) tableContainerEl.style.display = 'block';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                        No maintenance requests match the current search or status filter.
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (tableContainerEl) tableContainerEl.style.display = 'block';

    tbody.innerHTML = records.map(v => {
        const space = v.memorial_spaces || {};
        const plotCode = space.plot_identifier || 'Assigned Plot';
        const section = space.section_name || 'Garden Section';
        const status = (v.status || 'scheduled').toLowerCase();

        let badgeClass = 'badge-warning';
        let badgeLabel = 'SCHEDULED';

        if (status === 'completed') {
            badgeClass = 'badge-success';
            badgeLabel = 'COMPLETED';
        } else if (status === 'in-progress') {
            badgeClass = 'badge-info';
            badgeLabel = 'IN-PROGRESS';
        } else if (status === 'cancelled') {
            badgeClass = 'badge-danger';
            badgeLabel = 'CANCELLED';
        }

        const dateStr = v.scheduled_date ? new Date(v.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending';

        return `
            <tr>
                <td>
                    <span style="font-family: monospace; font-weight: 700; color: #475569;">#MNT-${v.id}</span>
                </td>
                <td>
                    <span class="subpage-badge" style="font-family: monospace; font-weight: 700;">${escapeHtml(plotCode)}</span>
                </td>
                <td>${escapeHtml(section)}</td>
                <td>
                    <strong style="color: #1e3a29;">${escapeHtml(v.visit_type)}</strong>
                </td>
                <td>${dateStr}</td>
                <td style="font-size: 0.82rem; color: #475569; max-width: 250px;">
                    ${v.notes ? escapeHtml(v.notes) : '<span style="color: #94a3b8;">--</span>'}
                </td>
                <td>
                    <span class="subpage-badge ${badgeClass}">${badgeLabel}</span>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: center;">
                        ${v.proof_image_url ? `
                            <button type="button" class="btn-subpage-outline" style="font-size: 0.74rem; padding: 3px 8px; border-color: #16a34a; color: #166534; font-weight: 700; background: #f0fdf4; cursor: pointer;" onclick="openMaintenanceProofModal(${v.id})" title="View completion proof photo">
                                📷 View Proof
                            </button>
                        ` : ''}
                        ${status === 'scheduled' ? `
                            <button type="button" class="btn-subpage-danger" onclick="cancelClientMaintenanceVisit(${v.id})">Cancel</button>
                        ` : (!v.proof_image_url ? `
                            <span style="color: #94a3b8; font-size: 0.78rem;">--</span>
                        ` : '')}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openMaintenanceProofModal = function(visitId) {
    const v = maintenanceVisitsCache.find(x => x.id === visitId);
    if (!v) return;

    const modal = document.getElementById('maintProofModal');
    if (!modal) return;

    const space = v.memorial_spaces || {};
    const plotEl = document.getElementById('maintProofPlot');
    const typeEl = document.getElementById('maintProofType');
    const dateEl = document.getElementById('maintProofDate');
    const notesEl = document.getElementById('maintProofNotes');
    const imgEl = document.getElementById('maintProofImg');
    const downloadBtn = document.getElementById('btnDownloadMaintProof');

    if (plotEl) plotEl.textContent = `${space.plot_identifier || 'Plot'} (${space.section_name || 'Grounds'})`;
    if (typeEl) typeEl.textContent = v.visit_type || 'Grounds Care';
    if (dateEl) {
        const dt = v.completed_at || v.scheduled_date;
        dateEl.textContent = dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Completed';
    }
    if (notesEl) notesEl.textContent = v.notes || 'Task completed and inspected by cemetery grounds staff.';
    if (imgEl) imgEl.src = v.proof_image_url || '';
    if (downloadBtn) {
        downloadBtn.href = v.proof_image_url || '#';
        downloadBtn.style.display = v.proof_image_url ? 'inline-block' : 'none';
    }

    modal.style.display = 'flex';
};

window.closeMaintenanceProofModal = function() {
    const modal = document.getElementById('maintProofModal');
    if (modal) modal.style.display = 'none';
};

window.cancelClientMaintenanceVisit = async function(visitId) {
    if (!await showConfirmModal({ title: "Cancel Service Request", message: "Are you sure you want to cancel this scheduled service request?", confirmText: "Cancel Request", cancelText: "Keep", type: "warning", danger: true })) return;
    try {
        const { error } = await supabaseClient
            .from('maintenance_visits')
            .update({ status: 'cancelled' })
            .eq('id', visitId);

        if (error) throw error;
        alert('Service request cancelled.');
        await loadMaintenancePageData();
    } catch (err) {
        alert('Failed to cancel request: ' + err.message);
    }
};

window.openMaintenancePage = function(preselectedSpaceId = null) {
    const closeAll = window.closeAllSubpages;
    if (typeof closeAll === 'function') closeAll();

    const page = document.getElementById('maintenancePage');
    if (page) {
        page.classList.add('active');
        loadMaintenancePageData(preselectedSpaceId);
        if (preselectedSpaceId) {
            const tabNew = document.getElementById('tabMaintNew');
            if (tabNew) tabNew.click();
        }
    }
    if (typeof window.updateActiveMenuItem === 'function') {
        window.updateActiveMenuItem('maintenance');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

window.initMaintenancePage = initMaintenancePage;
window.loadMaintenancePageData = loadMaintenancePageData;


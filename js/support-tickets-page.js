// ==============================================================================
// SUPPORT TICKETS PAGE CONTROLLER (Dedicated Subpage - Live Supabase)
// Clean enterprise design: NO EMOJIS, NO GRADIENTS, CRISP <= 4PX CORNERS
// ==============================================================================

let supportTicketsCache = [];

function initSupportTicketsPage() {
    const supportTicketsPage = document.getElementById('supportTicketsPage');
    const menuBtn = document.getElementById('supportTicketsMenuBtn');
    const userBtn = document.getElementById('supportTicketsUserBtn');
    const btnContactInfo = document.getElementById('btnTicketContactInfo');
    const btnOpenCreateTop = document.getElementById('btnTicketOpenCreateTop');
    const btnSwitchToNewForm = document.getElementById('btnTicketSwitchToNewForm');
    const btnEmptyCreate = document.getElementById('btnTicketEmptyCreate');
    const btnBackToList = document.getElementById('btnTicketBackToList');
    const btnCancelForm = document.getElementById('btnCancelTicketForm');
    const tabList = document.getElementById('tabTicketList');
    const tabNew = document.getElementById('tabTicketNew');
    const form = document.getElementById('ticketForm');
    const searchInput = document.getElementById('ticketSearchInput');
    const categoryFilter = document.getElementById('ticketCategoryFilter');

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
            if (supportTicketsPage) supportTicketsPage.classList.remove('active');
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    // Park Office Directory Info
    if (btnContactInfo) {
        btnContactInfo.addEventListener('click', () => {
            alert('Zion Memorial Garden Administration Office\nPhone: (049) 501-2345 / +63 917 123 4567\nEmail: support@zionmemorialgarden.com\nOffice Hours: Monday - Saturday, 8:00 AM - 5:00 PM');
        });
    }

    // Tab & View Switching
    const showListView = () => {
        if (tabList) tabList.classList.add('active');
        if (tabNew) tabNew.classList.remove('active');
        const listView = document.getElementById('ticketListView');
        const formView = document.getElementById('ticketFormView');
        if (listView) listView.style.display = 'block';
        if (formView) formView.style.display = 'none';
        renderTicketsTable();
    };

    const showFormView = () => {
        if (tabNew) tabNew.classList.add('active');
        if (tabList) tabList.classList.remove('active');
        const listView = document.getElementById('ticketListView');
        const formView = document.getElementById('ticketFormView');
        if (listView) listView.style.display = 'none';
        if (formView) formView.style.display = 'block';
    };

    if (tabList) tabList.addEventListener('click', showListView);
    if (tabNew) tabNew.addEventListener('click', showFormView);
    if (btnOpenCreateTop) btnOpenCreateTop.addEventListener('click', showFormView);
    if (btnSwitchToNewForm) btnSwitchToNewForm.addEventListener('click', showFormView);
    if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', showFormView);
    if (btnBackToList) btnBackToList.addEventListener('click', showListView);
    if (btnCancelForm) btnCancelForm.addEventListener('click', showListView);

    // Search & Filter
    if (searchInput) {
        searchInput.addEventListener('input', () => filterAndRenderTickets());
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => filterAndRenderTickets());
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subject = document.getElementById('ticketSubjectInput')?.value.trim();
            const category = document.getElementById('ticketCategorySelect')?.value;
            const priority = document.getElementById('ticketPrioritySelect')?.value;
            const message = document.getElementById('ticketMessageInput')?.value.trim();
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
                    window.showSuccessModal('Ticket Submitted', `Your ticket ${ticketNo} has been opened. Our support staff has been notified and will review your inquiry.`);
                } else {
                    alert(`Your ticket ${ticketNo} has been submitted.`);
                }

                form.reset();
                await loadSupportTicketsPageData();
                showListView();

            } catch (err) {
                console.error('Support ticket error:', err);
                alert('Failed to submit ticket: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Support Ticket';
                }
            }
        });
    }

    // Detail Modal Close Handlers
    const detailModal = document.getElementById('ticketDetailModal');
    const closeDetailX = document.getElementById('btnCloseTicketDetailModal');
    const closeDetailBtn = document.getElementById('btnCloseTicketDetailModalBtn');

    const closeDetail = () => {
        if (detailModal) detailModal.style.display = 'none';
    };

    if (closeDetailX) closeDetailX.addEventListener('click', closeDetail);
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetail);
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeDetail();
        });
    }

    // Tab activation observer
    if (supportTicketsPage) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && supportTicketsPage.classList.contains('active')) {
                    loadSupportTicketsPageData();
                }
            });
        });
        observer.observe(supportTicketsPage, { attributes: true });
        if (supportTicketsPage.classList.contains('active')) {
            loadSupportTicketsPageData();
        }
    }
}

async function loadSupportTicketsPageData() {
    const loadingEl = document.getElementById('ticketLoading');
    const emptyEl = document.getElementById('ticketEmpty');
    const tableContainerEl = document.getElementById('ticketTableContainer');

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (tableContainerEl) tableContainerEl.style.display = 'none';

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // Sync Avatar
        const avatarImg = document.getElementById('supportTicketsUserAvatar');
        if (avatarImg) {
            const savedPic = localStorage.getItem('userProfilePicture');
            if (savedPic) avatarImg.src = savedPic;
        }

        const { data: tickets, error } = await supabaseClient
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (loadingEl) loadingEl.style.display = 'none';

        if (error || !tickets || tickets.length === 0) {
            supportTicketsCache = [];
            updateTicketsKpis(0, 0, 0);
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
            return;
        }

        supportTicketsCache = tickets;

        const total = supportTicketsCache.length;
        const active = supportTicketsCache.filter(t => ['open', 'in-progress'].includes((t.status || '').toLowerCase())).length;
        const resolved = supportTicketsCache.filter(t => ['resolved', 'closed'].includes((t.status || '').toLowerCase())).length;
        updateTicketsKpis(total, active, resolved);

        renderTicketsTable();

    } catch (err) {
        console.error('Failed to load support tickets:', err);
    }
}

function updateTicketsKpis(total, active, resolved) {
    const elTotal = document.getElementById('ticketKpiTotal');
    if (elTotal) elTotal.textContent = String(total);

    const elActive = document.getElementById('ticketKpiActive');
    if (elActive) elActive.textContent = String(active);

    const elResolved = document.getElementById('ticketKpiResolved');
    if (elResolved) elResolved.textContent = String(resolved);

    const elBadge = document.getElementById('ticketListCountBadge');
    if (elBadge) elBadge.textContent = `${total} Tickets`;
}

function filterAndRenderTickets() {
    const search = (document.getElementById('ticketSearchInput')?.value || '').trim().toLowerCase();
    const category = (document.getElementById('ticketCategoryFilter')?.value || 'all');

    let filtered = supportTicketsCache;

    if (category !== 'all') {
        filtered = filtered.filter(t => (t.category || '') === category);
    }

    if (search) {
        filtered = filtered.filter(t => {
            const num = (t.ticket_number || '').toLowerCase();
            const subj = (t.subject || '').toLowerCase();
            const msg = (t.message || '').toLowerCase();
            const notes = (t.resolution_notes || '').toLowerCase();
            return num.includes(search) || subj.includes(search) || msg.includes(search) || notes.includes(search);
        });
    }

    renderTicketsTable(filtered, search || category !== 'all');
}

function renderTicketsTable(records = supportTicketsCache, isFiltered = false) {
    const emptyEl = document.getElementById('ticketEmpty');
    const tableContainerEl = document.getElementById('ticketTableContainer');
    const tbody = document.getElementById('ticketTableBody');
    if (!tbody) return;

    if (records.length === 0) {
        if (!isFiltered && supportTicketsCache.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (tableContainerEl) tableContainerEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (tableContainerEl) tableContainerEl.style.display = 'block';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                        No tickets match the current search or category filter.
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (tableContainerEl) tableContainerEl.style.display = 'block';

    tbody.innerHTML = records.map(t => {
        const status = (t.status || 'open').toLowerCase();
        let badgeClass = 'badge-info';
        let badgeLabel = 'OPEN';

        if (status === 'resolved' || status === 'closed') {
            badgeClass = 'badge-success';
            badgeLabel = status.toUpperCase();
        } else if (status === 'in-progress') {
            badgeClass = 'badge-warning';
            badgeLabel = 'IN-PROGRESS';
        }

        const dateStr = t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recorded';

        return `
            <tr>
                <td>
                    <span style="font-family: monospace; font-weight: 700; color: #475569;">${escapeHtml(t.ticket_number)}</span>
                </td>
                <td>${escapeHtml(t.category)}</td>
                <td>
                    <strong style="color: #1e3a29;">${escapeHtml(t.subject)}</strong>
                </td>
                <td>
                    <span style="text-transform: capitalize; font-size: 0.8rem; font-weight: 600; color: ${t.priority === 'urgent' || t.priority === 'high' ? '#b91c1c' : '#475569'};">
                        ${escapeHtml(t.priority || 'Normal')}
                    </span>
                </td>
                <td>${dateStr}</td>
                <td>
                    <span class="subpage-badge ${badgeClass}">${badgeLabel}</span>
                </td>
                <td style="font-size: 0.82rem; color: #475569; max-width: 250px;">
                    ${t.resolution_notes ? `
                        <span style="color: #166534; font-weight: 600;">Staff Replied:</span> ${escapeHtml(t.resolution_notes.length > 50 ? t.resolution_notes.substring(0, 50) + '...' : t.resolution_notes)}
                    ` : '<span style="color: #94a3b8;">Pending Review</span>'}
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <button type="button" class="btn-subpage-outline btn-subpage-sm" onclick="viewTicketDetails('${escapeHtml(t.ticket_number)}')">View Details</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.viewTicketDetails = function(ticketNumber) {
    const ticket = supportTicketsCache.find(t => t.ticket_number === ticketNumber);
    if (!ticket) return;

    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;

    document.getElementById('modalTicketNumber').textContent = ticket.ticket_number;
    document.getElementById('modalTicketSubject').textContent = ticket.subject;
    document.getElementById('modalTicketCategory').textContent = ticket.category;
    document.getElementById('modalTicketPriority').textContent = ticket.priority || 'Normal';
    document.getElementById('modalTicketDate').textContent = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '';
    document.getElementById('modalTicketMessage').textContent = ticket.message || '';

    const statusBadge = document.getElementById('modalTicketStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = (ticket.status || 'open').toUpperCase();
        statusBadge.className = 'subpage-badge ' + (['resolved', 'closed'].includes((ticket.status || '').toLowerCase()) ? 'badge-success' : 'badge-info');
    }

    const replyContainer = document.getElementById('modalTicketReplyContainer');
    const resolutionEl = document.getElementById('modalTicketResolution');
    if (ticket.resolution_notes) {
        if (replyContainer) replyContainer.style.display = 'block';
        if (resolutionEl) resolutionEl.textContent = ticket.resolution_notes;
    } else {
        if (replyContainer) replyContainer.style.display = 'none';
    }

    modal.style.display = 'flex';
};

window.openSupportTicketsPage = function() {
    const closeAll = window.closeAllSubpages;
    if (typeof closeAll === 'function') closeAll();

    const page = document.getElementById('supportTicketsPage');
    if (page) {
        page.classList.add('active');
        loadSupportTicketsPageData();
    }
    if (typeof window.updateActiveMenuItem === 'function') {
        window.updateActiveMenuItem('support');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

window.initSupportTicketsPage = initSupportTicketsPage;
window.loadSupportTicketsPageData = loadSupportTicketsPageData;


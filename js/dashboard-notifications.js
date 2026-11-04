// ==============================================================================
// ZION MEMORIAL GARDEN - CLIENT DASHBOARD NOTIFICATIONS SYSTEM
// Handles Notification Bell across ALL Navbars, Live Badge Counter,
// Floating Notification Dropdown, and Event Routing.
// ==============================================================================

(function() {
    let currentUser = null;
    let notificationsList = [];
    let currentFilter = 'all';
    let pollInterval = null;
    let activeBellBtn = null;
    let isInitialized = false;

    /**
     * Inject self-contained styles so bell buttons and dropdown always render
     * at exact 38x38px across all navbars regardless of stylesheet cache.
     */
    function ensureNotificationStyles() {
        if (document.getElementById('zmgNotifBellStyles')) return;
        const style = document.createElement('style');
        style.id = 'zmgNotifBellStyles';
        style.textContent = `
            .notif-bell-btn {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                width: 38px !important;
                height: 38px !important;
                min-width: 38px !important;
                min-height: 38px !important;
                cursor: pointer;
                padding: 0;
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                position: relative;
                flex-shrink: 0;
                transition: background 0.15s ease, border-color 0.15s ease;
            }
            .notif-bell-btn:hover {
                background: #f8fafc;
                border-color: #2d4a36;
            }
            .notif-bell-btn .bell-icon {
                width: 20px !important;
                height: 20px !important;
                color: #1e293b;
                display: block;
                pointer-events: none;
            }
            .notif-bell-btn:hover .bell-icon {
                color: #2d4a36;
            }
            .notif-badge-count {
                position: absolute;
                top: -5px;
                right: -5px;
                min-width: 18px;
                height: 18px;
                border-radius: 9px;
                background: #dc2626;
                color: #ffffff;
                font-size: 0.68rem;
                font-weight: 800;
                line-height: 1;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .notif-dropdown-panel {
                position: fixed !important;
                top: 60px;
                right: 32px;
                width: 380px;
                max-width: calc(100vw - 24px);
                background: #ffffff;
                border: 1.5px solid #d4dfd2;
                border-radius: 6px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
                z-index: 99999 !important;
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: 'Georgia', serif;
            }
            .notif-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }
            .notif-panel-title-wrap {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .notif-panel-title-wrap h3 {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 700;
                color: #1e3a29;
            }
            .notif-unread-pill {
                background: #e2e8f0;
                color: #475569;
                font-size: 0.7rem;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 12px;
            }
            .notif-unread-pill.has-unread {
                background: #fee2e2;
                color: #dc2626;
            }
            .notif-mark-read-btn {
                background: none;
                border: none;
                color: #2d4a36;
                font-size: 0.74rem;
                font-weight: 700;
                cursor: pointer;
                padding: 4px 6px;
                border-radius: 4px;
            }
            .notif-mark-read-btn:hover {
                background: #edf3ee;
                text-decoration: underline;
            }
            .notif-panel-tabs {
                display: flex;
                gap: 4px;
                padding: 6px 12px;
                background: #ffffff;
                border-bottom: 1px solid #f1f5f9;
            }
            .notif-tab {
                background: transparent;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 0.75rem;
                font-weight: 600;
                color: #64748b;
                cursor: pointer;
            }
            .notif-tab:hover {
                background: #f1f5f9;
                color: #1e293b;
            }
            .notif-tab.active {
                background: #2d4a36;
                color: #ffffff;
                font-weight: 700;
            }
            .notif-panel-list {
                max-height: 360px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            .notif-empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 32px 16px;
                text-align: center;
                color: #94a3b8;
            }
            .notif-empty-state svg {
                width: 34px !important;
                height: 34px !important;
                margin-bottom: 8px;
                stroke: #cbd5e1;
            }
            .notif-empty-state p {
                font-size: 0.82rem;
                margin: 0;
            }
            .notif-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 16px;
                border-bottom: 1px solid #f1f5f9;
                background: #ffffff;
                cursor: pointer;
                text-decoration: none;
                color: inherit;
                position: relative;
            }
            .notif-item:hover {
                background: #f8fafc;
            }
            .notif-item.unread {
                background: #f4fbf5;
            }
            .notif-item.unread::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3.5px;
                background: #16a34a;
            }
            .notif-item-icon {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-top: 2px;
            }
            .notif-item-icon svg {
                width: 17px !important;
                height: 17px !important;
            }
            .notif-item-icon.type-reservation { background: #dcfce7; color: #16a34a; }
            .notif-item-icon.type-reservation-danger { background: #fee2e2; color: #dc2626; }
            .notif-item-icon.type-payment { background: #e0f2fe; color: #0284c7; }
            .notif-item-icon.type-service { background: #fef3c7; color: #d97706; }
            .notif-item-icon.type-support { background: #ede9fe; color: #7c3aed; }
            .notif-item-content { flex: 1; min-width: 0; }
            .notif-item-title {
                font-size: 0.82rem;
                font-weight: 700;
                color: #1e293b;
                margin: 0 0 2px 0;
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 6px;
            }
            .notif-item-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #16a34a;
                display: inline-block;
                flex-shrink: 0;
            }
            .notif-item-desc {
                font-size: 0.77rem;
                color: #475569;
                margin: 0 0 4px 0;
                line-height: 1.35;
                word-break: break-word;
            }
            .notif-item-time {
                font-size: 0.69rem;
                color: #94a3b8;
                margin: 0;
            }
            .notif-panel-footer {
                display: flex;
                justify-content: center;
                padding: 8px 16px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
            }
            .notif-clear-btn {
                background: transparent;
                border: none;
                color: #64748b;
                font-size: 0.72rem;
                font-weight: 600;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .notif-clear-btn:hover {
                color: #dc2626;
                background: #fee2e2;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Ensure the floating #notifDropdownPanel exists on document.body
     */
    function getOrCreateDropdownPanel() {
        let panel = document.getElementById('notifDropdownPanel');
        if (panel && panel.parentElement !== document.body) {
            document.body.appendChild(panel);
        }
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notifDropdownPanel';
            panel.className = 'notif-dropdown-panel';
            panel.style.display = 'none';
            panel.innerHTML = `
                <div class="notif-panel-header">
                    <div class="notif-panel-title-wrap">
                        <h3>Notifications</h3>
                        <span class="notif-unread-pill" id="notifUnreadPill">0 Unread</span>
                    </div>
                    <button type="button" class="notif-mark-read-btn" id="notifMarkAllReadBtn">Mark all as read</button>
                </div>
                <div class="notif-panel-tabs">
                    <button type="button" class="notif-tab active" data-filter="all">All</button>
                    <button type="button" class="notif-tab" data-filter="reservation">Bookings</button>
                    <button type="button" class="notif-tab" data-filter="payment">Payments</button>
                    <button type="button" class="notif-tab" data-filter="service">Care &amp; Support</button>
                </div>
                <div class="notif-panel-list" id="notifPanelList">
                    <div class="notif-empty-state">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <p>Loading notifications...</p>
                    </div>
                </div>
                <div class="notif-panel-footer">
                    <button type="button" id="notifClearHistoryBtn" class="notif-clear-btn">Clear Read Notifications</button>
                </div>
            `;
            document.body.appendChild(panel);
        }
        return panel;
    }

    /**
     * Initialize Dashboard Notifications
     */
    async function initDashboardNotifications() {
        try {
            ensureNotificationStyles();
            getOrCreateDropdownPanel();
            setupNotificationUI();

            if (!window.supabaseClient) {
                return;
            }

            const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
            if (authErr || !user) {
                return;
            }

            currentUser = user;
            isInitialized = true;

            await fetchAndRenderNotifications();

            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(fetchAndRenderNotifications, 35000);
        } catch (err) {
            console.error('Failed to init dashboard notifications:', err);
        }
    }

    /**
     * Wire up bell buttons across ALL navbars (delegated + direct)
     */
    function setupNotificationUI() {
        const dropdown = getOrCreateDropdownPanel();
        const markAllReadBtn = document.getElementById('notifMarkAllReadBtn');
        const clearBtn = document.getElementById('notifClearHistoryBtn');

        // Global event delegation so ANY .notif-bell-btn in ANY navbar works immediately
        if (!window._zmgNotifDelegationBound) {
            window._zmgNotifDelegationBound = true;

            document.addEventListener('click', (e) => {
                const bellBtn = e.target.closest('.notif-bell-btn');
                const panel = document.getElementById('notifDropdownPanel');
                if (!panel) return;

                if (bellBtn) {
                    e.stopPropagation();
                    const isOpen = panel.style.display === 'flex';
                    if (isOpen && activeBellBtn === bellBtn) {
                        panel.style.display = 'none';
                        activeBellBtn = null;
                    } else {
                        activeBellBtn = bellBtn;
                        const rect = bellBtn.getBoundingClientRect();
                        panel.style.top = `${Math.max(48, rect.bottom + 8)}px`;
                        const rightOffset = Math.max(12, window.innerWidth - rect.right);
                        panel.style.right = `${rightOffset}px`;
                        panel.style.display = 'flex';
                    }
                    return;
                }

                if (!panel.contains(e.target)) {
                    panel.style.display = 'none';
                    activeBellBtn = null;
                }
            });
        }

        // Tabs inside dropdown
        const tabs = dropdown.querySelectorAll('.notif-tab');
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.stopPropagation();
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.getAttribute('data-filter') || 'all';
                renderNotificationsList();
            };
        });

        if (markAllReadBtn) {
            markAllReadBtn.onclick = (e) => {
                e.stopPropagation();
                markAllNotificationsAsRead();
            };
        }

        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.stopPropagation();
                clearReadNotifications();
            };
        }
    }

    function getReadIds() {
        if (!currentUser) return [];
        try {
            const raw = localStorage.getItem(`zmg_read_notifs_${currentUser.id}`);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveReadIds(readIds) {
        if (!currentUser) return;
        try {
            localStorage.setItem(`zmg_read_notifs_${currentUser.id}`, JSON.stringify(readIds));
        } catch (e) {}
    }

    function markAsRead(notifId) {
        const readIds = getReadIds();
        if (!readIds.includes(notifId)) {
            readIds.push(notifId);
            saveReadIds(readIds);
        }
        const item = notificationsList.find(n => n.id === notifId);
        if (item) item.unread = false;
        updateBadge();
        renderNotificationsList();
    }

    function markAllNotificationsAsRead() {
        const readIds = getReadIds();
        notificationsList.forEach(n => {
            if (!readIds.includes(n.id)) {
                readIds.push(n.id);
            }
            n.unread = false;
        });
        saveReadIds(readIds);
        updateBadge();
        renderNotificationsList();
    }

    function clearReadNotifications() {
        const readIds = getReadIds();
        notificationsList = notificationsList.filter(n => !readIds.includes(n.id));
        renderNotificationsList();
    }

    async function fetchAndRenderNotifications() {
        if (!currentUser) return;

        try {
            const readIds = getReadIds();
            const compiled = [];

            // 1. Fetch Reservations
            const { data: reservations } = await supabaseClient
                .from('reservations')
                .select(`
                    id,
                    reservation_number,
                    status,
                    plan_type,
                    created_at,
                    updated_at,
                    notes,
                    memorial_spaces (
                        plot_identifier,
                        section_name,
                        category
                    )
                `)
                .eq('user_id', currentUser.id)
                .order('updated_at', { ascending: false });

            const resList = reservations || [];
            const resIds = resList.map(r => r.id);

            resList.forEach(res => {
                const plotCode = res.memorial_spaces?.plot_identifier || 'Memorial Space';
                const section = res.memorial_spaces?.section_name || 'Grounds';
                const status = (res.status || 'PENDING').toUpperCase();

                if (status === 'CONFIRMED' || status === 'APPROVED') {
                    compiled.push({
                        id: `res_conf_${res.id}_${status}`,
                        category: 'reservation',
                        iconType: 'reservation',
                        title: 'Reservation Approved & Confirmed',
                        desc: `Plot ${plotCode} (${section}) has been officially reserved and confirmed.`,
                        time: res.updated_at || res.created_at,
                        unread: !readIds.includes(`res_conf_${res.id}_${status}`),
                        actionType: 'myreservation'
                    });
                } else if (status === 'CANCELLED' || status === 'REJECTED') {
                    compiled.push({
                        id: `res_canc_${res.id}_${status}`,
                        category: 'reservation',
                        iconType: 'reservation-danger',
                        title: 'Reservation Cancelled',
                        desc: `Booking #${res.reservation_number || res.id} for plot ${plotCode} was cancelled. ${res.notes || ''}`,
                        time: res.updated_at || res.created_at,
                        unread: !readIds.includes(`res_canc_${res.id}_${status}`),
                        actionType: 'myreservation'
                    });
                } else if (status === 'OVERDUE') {
                    compiled.push({
                        id: `res_over_${res.id}`,
                        category: 'reservation',
                        iconType: 'reservation-danger',
                        title: 'Payment Schedule Reminder',
                        desc: `Monthly amortization payment for plot ${plotCode} is currently pending.`,
                        time: res.updated_at || res.created_at,
                        unread: !readIds.includes(`res_over_${res.id}`),
                        actionType: 'myreservation'
                    });
                } else {
                    compiled.push({
                        id: `res_pend_${res.id}`,
                        category: 'reservation',
                        iconType: 'reservation',
                        title: 'Reservation Under Review',
                        desc: `Your reservation request for plot ${plotCode} (${section}) was received and is being verified by staff.`,
                        time: res.created_at,
                        unread: !readIds.includes(`res_pend_${res.id}`),
                        actionType: 'myreservation'
                    });
                }
            });

            // 2. Fetch Payments
            if (resIds.length > 0) {
                const { data: payments } = await supabaseClient
                    .from('payments')
                    .select('id, reservation_id, amount, payment_type, payment_method, payment_reference, status, created_at')
                    .in('reservation_id', resIds)
                    .order('created_at', { ascending: false });

                (payments || []).forEach(pay => {
                    const amtStr = Number(pay.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    const payTypeStr = pay.payment_type === 'DOWN_PAYMENT' ? 'Down Payment' : (pay.payment_type === 'FULL_PAYMENT' ? 'Full Settlement' : 'Installment Payment');
                    const refStr = pay.payment_reference ? ` (Ref: ${pay.payment_reference})` : '';

                    compiled.push({
                        id: `pay_${pay.id}`,
                        category: 'payment',
                        iconType: 'payment',
                        title: `Payment Receipt: ₱${amtStr}`,
                        desc: `${payTypeStr} received via ${pay.payment_method || 'Official Channel'}${refStr}. Status: Verified.`,
                        time: pay.created_at,
                        unread: !readIds.includes(`pay_${pay.id}`),
                        actionType: 'payment'
                    });
                });
            }

            // 3. Fetch Maintenance Visits
            const { data: maintVisits } = await supabaseClient
                .from('maintenance_visits')
                .select(`
                    id,
                    visit_type,
                    scheduled_date,
                    status,
                    notes,
                    created_at,
                    memorial_spaces (
                        plot_identifier,
                        section_name
                    )
                `)
                .eq('requested_by', currentUser.id)
                .order('created_at', { ascending: false });

            (maintVisits || []).forEach(mv => {
                const plotCode = mv.memorial_spaces?.plot_identifier || 'Memorial Lot';
                const mStatus = (mv.status || '').toLowerCase();
                const visitTitle = mv.visit_type || 'Grounds Maintenance';

                let title = `Maintenance Service: ${visitTitle}`;
                let desc = `Scheduled service for plot ${plotCode} on ${mv.scheduled_date || 'designated date'}.`;

                if (mStatus === 'completed') {
                    title = `Work Completed: ${visitTitle}`;
                    desc = `Grounds team has completed work on plot ${plotCode}. ${mv.notes || ''}`;
                } else if (mStatus === 'in_progress') {
                    title = `In Progress: ${visitTitle}`;
                    desc = `Cemetery staff is currently servicing plot ${plotCode}.`;
                }

                compiled.push({
                    id: `maint_${mv.id}_${mStatus}`,
                    category: 'service',
                    iconType: 'service',
                    title: title,
                    desc: desc,
                    time: mv.created_at,
                    unread: !readIds.includes(`maint_${mv.id}_${mStatus}`),
                    actionType: 'maintenance'
                });
            });

            // 4. Fetch Support Tickets
            const { data: tickets } = await supabaseClient
                .from('support_tickets')
                .select('id, ticket_number, subject, category, status, resolution_notes, created_at, updated_at')
                .eq('user_id', currentUser.id)
                .order('updated_at', { ascending: false });

            (tickets || []).forEach(tck => {
                const tStatus = (tck.status || '').toLowerCase();
                let title = `Support Ticket: ${tck.ticket_number || '#' + tck.id}`;
                let desc = `${tck.subject || 'Inquiry'}: Status updated to '${tck.status}'.`;

                if (tck.resolution_notes) {
                    desc = `Staff Response: "${tck.resolution_notes.slice(0, 90)}${tck.resolution_notes.length > 90 ? '...' : ''}"`;
                }

                compiled.push({
                    id: `tck_${tck.id}_${tStatus}`,
                    category: 'service',
                    iconType: 'support',
                    title: title,
                    desc: desc,
                    time: tck.updated_at || tck.created_at,
                    unread: !readIds.includes(`tck_${tck.id}_${tStatus}`),
                    actionType: 'support'
                });
            });

            compiled.sort((a, b) => new Date(b.time) - new Date(a.time));

            notificationsList = compiled;
            updateBadge();
            renderNotificationsList();

        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }

    /**
     * Update Unread Badges across ALL navbar bell buttons
     */
    function updateBadge() {
        const unreadCount = notificationsList.filter(n => n.unread).length;
        const badges = document.querySelectorAll('.notif-badge-count');
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });

        const unreadPill = document.getElementById('notifUnreadPill');
        if (unreadPill) {
            unreadPill.textContent = `${unreadCount} Unread`;
            if (unreadCount > 0) {
                unreadPill.classList.add('has-unread');
            } else {
                unreadPill.classList.remove('has-unread');
            }
        }
    }

    function renderNotificationsList() {
        const listEl = document.getElementById('notifPanelList');
        if (!listEl) return;

        let filtered = notificationsList;
        if (currentFilter !== 'all') {
            filtered = notificationsList.filter(n => n.category === currentFilter);
        }

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div class="notif-empty-state">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p style="font-weight: 600; color: #475569; margin-bottom: 2px;">No notifications found</p>
                    <span style="font-size: 0.72rem; color: #94a3b8;">You're completely up to date.</span>
                </div>
            `;
            return;
        }

        listEl.innerHTML = filtered.map(notif => {
            const iconSvg = getIconSvg(notif.iconType);
            const timeAgo = formatTimeAgo(notif.time);
            const unreadClass = notif.unread ? 'unread' : '';
            const unreadDot = notif.unread ? '<span class="notif-item-dot"></span>' : '';

            return `
                <div class="notif-item ${unreadClass}" data-id="${escapeHtml(notif.id)}" data-action="${notif.actionType}">
                    <div class="notif-item-icon type-${notif.iconType}">
                        ${iconSvg}
                    </div>
                    <div class="notif-item-content">
                        <div class="notif-item-title">
                            <span>${escapeHtml(notif.title)}</span>
                            ${unreadDot}
                        </div>
                        <p class="notif-item-desc">${escapeHtml(notif.desc)}</p>
                        <p class="notif-item-time">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');

        listEl.querySelectorAll('.notif-item').forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();
                const notifId = item.getAttribute('data-id');
                const actionType = item.getAttribute('data-action');
                if (notifId) markAsRead(notifId);

                const dropdown = document.getElementById('notifDropdownPanel');
                if (dropdown) dropdown.style.display = 'none';
                activeBellBtn = null;

                handleNotificationAction(actionType);
            };
        });
    }

    function handleNotificationAction(actionType) {
        // If on plot-details.html or plot-locator.html, redirect to dashboard
        if (!document.getElementById('myReservationPage') && !window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'dashboard.html';
            return;
        }

        if (typeof window.closeAllSubpages === 'function') {
            window.closeAllSubpages();
        }
        if (typeof window.closeReservationModal === 'function') {
            window.closeReservationModal();
        }
        if (typeof window.closeProfileModal === 'function') {
            window.closeProfileModal();
        }

        if (actionType === 'myreservation') {
            const page = document.getElementById('myReservationPage');
            if (page) {
                page.classList.add('active');
                if (typeof window.loadMyReservations === 'function') {
                    window.loadMyReservations();
                }
            }
        } else if (actionType === 'payment') {
            if (typeof window.openGcashPaymentsFullPage === 'function') {
                window.openGcashPaymentsFullPage(false);
            } else {
                const page = document.getElementById('myReservationPage');
                if (page) page.classList.add('active');
            }
        } else if (actionType === 'maintenance') {
            if (typeof window.openMaintenancePage === 'function') {
                window.openMaintenancePage();
            } else {
                const page = document.getElementById('maintenancePage');
                if (page) page.classList.add('active');
            }
        } else if (actionType === 'support') {
            if (typeof window.openSupportTicketsPage === 'function') {
                window.openSupportTicketsPage();
            } else {
                const page = document.getElementById('supportTicketsPage');
                if (page) page.classList.add('active');
            }
        }
    }

    function getIconSvg(type) {
        if (type === 'reservation') {
            return `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
        }
        if (type === 'reservation-danger') {
            return `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        }
        if (type === 'payment') {
            return `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
            `;
        }
        if (type === 'service') {
            return `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            `;
        }
        return `
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
    }

    function formatTimeAgo(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffSeconds = Math.floor((now - date) / 1000);

            if (diffSeconds < 60) return 'Just now';
            const diffMinutes = Math.floor(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return '';
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Auto-inject styles immediately on script load
    ensureNotificationStyles();

    // Auto-init on standalone pages (like plot-details.html and plot-locator.html)
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (!isInitialized) {
                initDashboardNotifications();
            }
        }, 400);
    });

    window.initDashboardNotifications = initDashboardNotifications;
    window.refreshDashboardNotifications = fetchAndRenderNotifications;
})();

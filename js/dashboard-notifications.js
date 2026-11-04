// ==============================================================================
// ZION MEMORIAL GARDEN - CLIENT DASHBOARD REAL-TIME NOTIFICATIONS SYSTEM
// Handles Notification Bell across ALL Navbars, Live Badge Counter,
// Floating Notification Dropdown, Real-time Push Listener, Floating Toasts,
// Audio Chimes, and Task Completion Proof Viewer.
// ==============================================================================

(function() {
    let currentUser = null;
    let notificationsList = [];
    let currentFilter = 'all';
    let pollInterval = null;
    let activeBellBtn = null;
    let isInitialized = false;
    let realtimeChannel = null;

    /**
     * Inject self-contained styles so bell buttons, dropdown, and floating toasts
     * always render reliably across all pages regardless of stylesheet caching.
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
                transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
            }
            .notif-bell-btn:hover {
                background: #f8fafc;
                border-color: #2d4a36;
            }
            .notif-bell-btn:active {
                transform: scale(0.96);
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
                animation: zmgPulseBadge 0.3s ease-out;
            }
            @keyframes zmgPulseBadge {
                0% { transform: scale(0.6); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            .notif-dropdown-panel {
                position: fixed !important;
                top: 60px;
                right: 32px;
                width: 390px;
                max-width: calc(100vw - 24px);
                background: #ffffff;
                border: 1.5px solid #d4dfd2;
                border-radius: 8px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
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
                max-height: 380px;
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
                transition: background 0.15s ease;
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

            /* Floating Live Toast Container */
            .zmg-notif-toast-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                max-width: 420px;
                width: calc(100vw - 32px);
                font-family: 'Georgia', serif;
            }
            .zmg-notif-toast {
                background: #ffffff;
                border-radius: 8px;
                border-left: 5px solid #16a34a;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
                padding: 14px 16px;
                pointer-events: auto;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                animation: zmgToastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                transition: transform 0.25s ease, opacity 0.25s ease;
                cursor: pointer;
                border-top: 1px solid #e2e8f0;
                border-right: 1px solid #e2e8f0;
                border-bottom: 1px solid #e2e8f0;
            }
            .zmg-notif-toast.type-danger { border-left-color: #dc2626; }
            .zmg-notif-toast.type-warning { border-left-color: #d97706; }
            .zmg-notif-toast.type-info { border-left-color: #0284c7; }
            @keyframes zmgToastSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(24px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .zmg-notif-toast-closing {
                opacity: 0 !important;
                transform: translateY(12px) scale(0.95) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Synthesize soft pleasant audio chime using Web Audio API
     */
    function playNotificationChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            // AudioContext not yet unlocked by user interaction, fail silently
        }
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
     * Global Proof Viewer Modal for viewing task completion photos from anywhere
     */
    function openGlobalProofViewer(url, title, desc) {
        let modal = document.getElementById('globalProofViewerModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'globalProofViewerModal';
            modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.78); backdrop-filter: blur(4px); z-index: 9999999; align-items: center; justify-content: center; padding: 16px; font-family: Georgia, serif;';
            modal.innerHTML = `
                <div style="background: #ffffff; border-radius: 8px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); border: 1px solid #cbd5e1; display: flex; flex-direction: column;">
                    <div style="background: #1e3a29; color: #ffffff; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 7px; border-top-right-radius: 7px;">
                        <div>
                            <h3 id="globalProofModalTitle" style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #ffffff;">Service Completion Proof</h3>
                            <p style="margin: 0; font-size: 0.75rem; color: #d4dfd2;">Cemetery Grounds Verified Task</p>
                        </div>
                        <button type="button" id="closeGlobalProofBtn" style="background: none; border: none; color: #ffffff; font-size: 1.5rem; line-height: 1; cursor: pointer; padding: 0 4px;">&times;</button>
                    </div>
                    <div style="padding: 16px;">
                        <div style="background: #0f172a; border-radius: 6px; overflow: hidden; text-align: center; margin-bottom: 12px; min-height: 200px; display: flex; align-items: center; justify-content: center;">
                            <img id="globalProofModalImg" src="" alt="Proof Photo" style="max-width: 100%; max-height: 440px; object-fit: contain; display: block; margin: 0 auto;">
                        </div>
                        <div id="globalProofModalDesc" style="background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.82rem; color: #334155; line-height: 1.4;"></div>
                    </div>
                    <div style="padding: 12px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <a id="globalProofDownloadLink" href="#" target="_blank" download="maintenance-proof.jpg" style="color: #1e3a29; font-size: 0.78rem; font-weight: 700; text-decoration: none;">⬇ Download Full Image</a>
                        <button type="button" id="dismissGlobalProofBtn" style="background: #2d4a36; color: #fff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const close = () => { modal.style.display = 'none'; };
            modal.querySelector('#closeGlobalProofBtn').onclick = close;
            modal.querySelector('#dismissGlobalProofBtn').onclick = close;
            modal.onclick = (e) => { if (e.target === modal) close(); };
        }

        modal.querySelector('#globalProofModalTitle').textContent = title || 'Service Completion Proof';
        modal.querySelector('#globalProofModalImg').src = url;
        modal.querySelector('#globalProofModalDesc').textContent = desc || 'Cemetery staff has completed this task and attached this verified photo.';
        modal.querySelector('#globalProofDownloadLink').href = url;
        modal.style.display = 'flex';
    }

    /**
     * Show live floating toast popup banner
     */
    function showNotificationToast(notif) {
        playNotificationChime();

        let container = document.getElementById('zmgNotifToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'zmgNotifToastContainer';
            container.className = 'zmg-notif-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const toastType = notif.type === 'danger' ? 'type-danger' : (notif.type === 'warning' ? 'type-warning' : (notif.type === 'success' ? 'type-success' : 'type-info'));
        toast.className = `zmg-notif-toast ${toastType}`;

        const iconType = notif.iconType || (notif.category === 'maintenance' ? 'service' : (notif.category === 'support' ? 'support' : notif.category || 'reservation'));

        toast.innerHTML = `
            <div class="notif-item-icon type-${iconType}" style="margin-top: 0; width: 34px; height: 34px;">
                ${getIconSvg(iconType)}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <strong style="font-size: 0.86rem; color: #0f172a; line-height: 1.25;">${escapeHtml(notif.title)}</strong>
                    <button type="button" class="btn-toast-close" style="background: none; border: none; font-size: 1.2rem; line-height: 1; color: #94a3b8; cursor: pointer; padding: 0 2px;">&times;</button>
                </div>
                <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: #475569; line-height: 1.35;">${escapeHtml(notif.desc || notif.message)}</p>
                ${notif.proof_image_url ? `
                    <div style="margin-top: 8px;">
                        <button type="button" class="btn-toast-proof" style="background: #166534; color: white; border: none; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            📷 View Proof Photo
                        </button>
                    </div>
                ` : ''}
                <span style="font-size: 0.68rem; color: #94a3b8; display: block; margin-top: 4px;">Just now</span>
            </div>
        `;

        const closeToast = () => {
            toast.classList.add('zmg-notif-toast-closing');
            setTimeout(() => toast.remove(), 260);
        };

        const proofBtn = toast.querySelector('.btn-toast-proof');
        if (proofBtn) {
            proofBtn.onclick = (e) => {
                e.stopPropagation();
                openGlobalProofViewer(notif.proof_image_url, notif.title, notif.desc || notif.message);
                closeToast();
            };
        }

        const closeBtn = toast.querySelector('.btn-toast-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                closeToast();
            };
        }

        toast.onclick = () => {
            closeToast();
            handleNotificationAction(notif.actionType || notif.link_action || 'myreservation');
        };

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) closeToast();
        }, 9000);
    }

    /**
     * Resolve Supabase Client safely across all loading states
     */
    function getSupabaseClient() {
        return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    }

    /**
     * Subscribe to Real-Time Updates via Supabase Realtime Channels
     */
    function subscribeToRealtimeNotifications() {
        const client = getSupabaseClient();
        if (!client || !currentUser) return;

        try {
            if (realtimeChannel) {
                client.removeChannel(realtimeChannel);
                realtimeChannel = null;
            }

            realtimeChannel = client.channel('zmg-notifications-' + currentUser.id);

            // 1. Listen for new inserts into public.notifications
            realtimeChannel.on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUser.id}`
            }, (payload) => {
                const row = payload.new;
                if (!row) return;

                const iconType = row.type === 'danger' ? 'reservation-danger' : 
                                (row.category === 'payment' ? 'payment' : 
                                (row.category === 'maintenance' ? 'service' : 
                                (row.category === 'support' ? 'support' : 'reservation')));

                const cat = (row.category === 'maintenance' || row.category === 'support') ? 'service' : row.category;

                const newNotif = {
                    id: `db_${row.id}`,
                    dbId: row.id,
                    category: cat,
                    iconType: iconType,
                    title: row.title,
                    desc: row.message,
                    time: row.created_at,
                    unread: true,
                    actionType: row.link_action || 'myreservation',
                    referenceId: row.reference_id,
                    proof_image_url: row.proof_image_url || null
                };

                // Prepend to memory list if not already present
                if (!notificationsList.some(n => n.id === newNotif.id)) {
                    notificationsList.unshift(newNotif);
                    updateBadge();
                    renderNotificationsList();
                    showNotificationToast(newNotif);
                }
            });

            // 2. Direct listeners on reservations, maintenance_visits, support_tickets, payments for instant live refresh
            realtimeChannel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'reservations',
                filter: `user_id=eq.${currentUser.id}`
            }, () => {
                fetchAndRenderNotifications();
                if (typeof window.loadMyReservations === 'function') {
                    window.loadMyReservations();
                }
            });

            realtimeChannel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'maintenance_visits',
                filter: `requested_by=eq.${currentUser.id}`
            }, () => {
                fetchAndRenderNotifications();
                if (typeof window.loadMaintenancePageData === 'function') {
                    window.loadMaintenancePageData();
                }
            });

            realtimeChannel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'support_tickets',
                filter: `user_id=eq.${currentUser.id}`
            }, () => {
                fetchAndRenderNotifications();
                if (typeof window.loadSupportTicketsData === 'function') {
                    window.loadSupportTicketsData();
                }
            });

            realtimeChannel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'payments'
            }, () => {
                fetchAndRenderNotifications();
            });

            realtimeChannel.subscribe((status) => {
                console.log('[ZMG Realtime Notifications] Subscription status:', status);
            });

        } catch (subErr) {
            console.error('[ZMG Realtime Notifications] Failed to connect channel:', subErr);
        }
    }

    /**
     * Initialize Dashboard Notifications
     */
    async function initDashboardNotifications(userOpt = null) {
        try {
            ensureNotificationStyles();
            getOrCreateDropdownPanel();
            setupNotificationUI();

            const client = getSupabaseClient();
            if (!client) {
                setTimeout(() => initDashboardNotifications(userOpt), 300);
                return;
            }

            if (userOpt && userOpt.id) {
                currentUser = userOpt;
            } else if (!currentUser) {
                const storedId = sessionStorage.getItem("userId");
                const storedEmail = sessionStorage.getItem("userEmail");
                if (storedId) {
                    currentUser = { id: storedId, email: storedEmail };
                }
                try {
                    const { data: sessionData } = await client.auth.getSession();
                    if (sessionData?.session?.user) {
                        currentUser = sessionData.session.user;
                    } else if (!currentUser) {
                        const { data: userData } = await client.auth.getUser();
                        if (userData?.user) currentUser = userData.user;
                    }
                } catch (authErr) {
                    console.warn('[ZMG Notifications] Auth lookup error:', authErr);
                }
            }

            if (!currentUser) {
                renderEmptyNotificationsList('Sign in to view your notifications.');
                return;
            }

            isInitialized = true;

            await fetchAndRenderNotifications();
            subscribeToRealtimeNotifications();

            // Background fallback sync
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(fetchAndRenderNotifications, 15000);

            // Listen for auth state changes (e.g. login/logout)
            client.auth.onAuthStateChange((event, session) => {
                if (session && session.user) {
                    currentUser = session.user;
                    fetchAndRenderNotifications();
                    subscribeToRealtimeNotifications();
                } else {
                    currentUser = null;
                    notificationsList = [];
                    updateBadge();
                    renderEmptyNotificationsList('Sign in to view your notifications.');
                }
            });

        } catch (err) {
            console.error('Failed to init dashboard notifications:', err);
            renderEmptyNotificationsList('Could not load notifications.');
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
                        fetchAndRenderNotifications();
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
        if (item) {
            item.unread = false;
            const client = getSupabaseClient();
            if (item.dbId && client) {
                client.from('notifications').update({ is_read: true }).eq('id', item.dbId).then();
            }
        }
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
        const client = getSupabaseClient();
        if (currentUser && client) {
            client.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).then();
        }
        updateBadge();
        renderNotificationsList();
    }

    function clearReadNotifications() {
        const readIds = getReadIds();
        notificationsList = notificationsList.filter(n => !readIds.includes(n.id));
        renderNotificationsList();
    }

    function renderEmptyNotificationsList(message = "You're completely up to date.") {
        const listEl = document.getElementById('notifPanelList');
        if (!listEl) return;
        listEl.innerHTML = `
            <div class="notif-empty-state">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p style="font-weight: 600; color: #475569; margin-bottom: 2px;">No notifications found</p>
                <span style="font-size: 0.72rem; color: #94a3b8;">${escapeHtml(message)}</span>
            </div>
        `;
    }

    /**
     * Query notifications table with seamless fallback
     */
    async function fetchAndRenderNotifications() {
        const client = getSupabaseClient();
        if (!client) return;

        if (!currentUser) {
            try {
                const { data } = await client.auth.getSession();
                currentUser = data?.session?.user;
                if (!currentUser) {
                    const { data: userData } = await client.auth.getUser();
                    currentUser = userData?.user;
                }
            } catch (e) {}
        }

        if (!currentUser) {
            renderEmptyNotificationsList('Sign in to view your notifications.');
            return;
        }

        const readIds = getReadIds();
        let compiled = [];
        let usedDbTable = false;

        try {
            // 1. Try querying the dedicated 'notifications' table first
            try {
                const { data: dbNotifs, error: dbErr } = await client
                    .from('notifications')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (!dbErr && Array.isArray(dbNotifs) && dbNotifs.length > 0) {
                    usedDbTable = true;
                    compiled = dbNotifs.map(n => {
                        const iconType = n.type === 'danger' ? 'reservation-danger' : 
                                        (n.category === 'payment' ? 'payment' : 
                                        (n.category === 'maintenance' ? 'service' : 
                                        (n.category === 'support' ? 'support' : 'reservation')));

                        const cat = (n.category === 'maintenance' || n.category === 'support') ? 'service' : n.category;

                        return {
                            id: `db_${n.id}`,
                            dbId: n.id,
                            category: cat,
                            iconType: iconType,
                            title: n.title,
                            desc: n.message,
                            time: n.created_at,
                            unread: !n.is_read && !readIds.includes(`db_${n.id}`),
                            actionType: n.link_action || 'myreservation',
                            referenceId: n.reference_id,
                            proof_image_url: n.proof_image_url || null
                        };
                    });
                }
            } catch (dbErr) {
                console.warn('[ZMG Notifications] Notifications table query fallback:', dbErr);
            }

            // 2. If notifications table is empty or trigger hasn't fired yet, fallback to compiling joins
            if (!usedDbTable || compiled.length === 0) {
                let resIds = [];

                // Fetch Reservations
                try {
                    const { data: reservations } = await client
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
                    resIds = resList.map(r => r.id);

                    resList.forEach(res => {
                        const plotCode = res.memorial_spaces?.plot_identifier || 'Memorial Space';
                        const section = res.memorial_spaces?.section_name || 'Grounds';
                        const status = (res.status || 'PENDING').toUpperCase();

                        if (status === 'CONFIRMED' || status === 'APPROVED') {
                            compiled.push({
                                id: `res_conf_${res.id}_${status}`,
                                category: 'reservation',
                                iconType: 'reservation',
                                title: 'Reservation Approved & Confirmed 🎉',
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
                } catch (resErr) {
                    console.warn('[ZMG Notifications] Reservations query fallback:', resErr);
                }

                // Fetch Payments
                if (resIds.length > 0) {
                    try {
                        const { data: payments } = await client
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
                    } catch (payErr) {
                        console.warn('[ZMG Notifications] Payments query fallback:', payErr);
                    }
                }

                // Fetch Maintenance Visits
                try {
                    let maintVisits = null;
                    const { data: mv1, error: mvErr1 } = await client
                        .from('maintenance_visits')
                        .select(`
                            id,
                            visit_type,
                            scheduled_date,
                            status,
                            notes,
                            proof_image_url,
                            created_at,
                            memorial_spaces (
                                plot_identifier,
                                section_name
                            )
                        `)
                        .eq('requested_by', currentUser.id)
                        .order('created_at', { ascending: false });

                    if (mvErr1) {
                        const { data: mv2 } = await client
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
                        maintVisits = mv2 || [];
                    } else {
                        maintVisits = mv1 || [];
                    }

                    (maintVisits || []).forEach(mv => {
                        const plotCode = mv.memorial_spaces?.plot_identifier || 'Memorial Lot';
                        const mStatus = (mv.status || '').toLowerCase();
                        const visitTitle = mv.visit_type || 'Grounds Maintenance';

                        let title = `Maintenance Service: ${visitTitle}`;
                        let desc = `Scheduled service for plot ${plotCode} on ${mv.scheduled_date || 'designated date'}.`;

                        if (mStatus === 'completed') {
                            title = `Work Completed: ${visitTitle} ✅`;
                            desc = `Grounds team has completed work on plot ${plotCode}. ${mv.notes || ''}` + (mv.proof_image_url ? ' Proof photo attached.' : '');
                        } else if (mStatus === 'in-progress') {
                            title = `In Progress: ${visitTitle} 🛠️`;
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
                            actionType: 'maintenance',
                            proof_image_url: mv.proof_image_url || null
                        });
                    });
                } catch (mvErr) {
                    console.warn('[ZMG Notifications] Maintenance visits fallback:', mvErr);
                }

                // Fetch Support Tickets
                try {
                    const { data: tickets } = await client
                        .from('support_tickets')
                        .select('id, ticket_number, subject, category, status, message, created_at, updated_at')
                        .eq('user_id', currentUser.id)
                        .order('updated_at', { ascending: false });

                    (tickets || []).forEach(tck => {
                        const tStatus = (tck.status || '').toLowerCase();
                        let title = `Support Ticket: ${tck.ticket_number || '#' + tck.id}`;
                        let desc = `${tck.subject || 'Inquiry'}: Status updated to '${tck.status}'.`;

                        if (tck.message) {
                            desc = `${tck.subject || 'Support'}: "${tck.message.slice(0, 90)}${tck.message.length > 90 ? '...' : ''}"`;
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
                } catch (tckErr) {
                    console.warn('[ZMG Notifications] Support tickets fallback:', tckErr);
                }
            }

            compiled.sort((a, b) => new Date(b.time) - new Date(a.time));
            notificationsList = compiled;
        } catch (err) {
            console.error('[ZMG Notifications] Error fetching notifications:', err);
        } finally {
            updateBadge();
            renderNotificationsList();
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

            const proofBtn = notif.proof_image_url ? `
                <div style="margin-top: 6px;">
                    <button type="button" class="btn-notif-proof" data-proof-url="${escapeHtml(notif.proof_image_url)}" data-proof-title="${escapeHtml(notif.title)}" data-proof-desc="${escapeHtml(notif.desc)}" style="background: #f0fdf4; border: 1px solid #86efac; color: #166534; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                        📷 View Proof Photo
                    </button>
                </div>
            ` : '';

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
                        ${proofBtn}
                        <p class="notif-item-time">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Wire proof buttons inside dropdown
        listEl.querySelectorAll('.btn-notif-proof').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const url = btn.getAttribute('data-proof-url');
                const title = btn.getAttribute('data-proof-title');
                const desc = btn.getAttribute('data-proof-desc');
                openGlobalProofViewer(url, title, desc);
            };
        });

        // Wire clicking notification items
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
    window.openGlobalProofViewer = openGlobalProofViewer;
})();

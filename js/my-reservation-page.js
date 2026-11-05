// ==============================================================================
// MY RESERVATION PAGE CONTROLLER (Supabase Integration)
// Implements Figma Frame 120_91 & Frame 213_2
// ==============================================================================

// Deceased capacity per plot category (e.g. Condominium columbarium vault holds up to 4 urns, Mausoleum holds up to 8, Family Estate holds up to 8, Supreme holds up to 2).
const CATEGORY_CAPACITY = {
    'Condominium': 1,
    'Mausoleum': 8,
    'Family Estate Jr.': 8,
    'Family Estate': 8,
    'Special Supreme': 1,
    'Supreme': 1,
    'Single Teired': 1,
    'Single Tiered': 1
};

function getCategoryCapacity(category) {
    if (!category) return 1;
    const trimmed = String(category).trim();
    if (CATEGORY_CAPACITY[trimmed]) return CATEGORY_CAPACITY[trimmed];
    const cat = trimmed.toLowerCase();
    if (cat.includes('family estate') || cat.includes('estate') || cat.includes('mausoleum')) return 8;
    return 1;
}

function parseFullName(fullName) {
    if (!fullName) return { first: '', middle: '', last: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
        return { first: parts[0], middle: '', last: '' };
    } else if (parts.length === 2) {
        return { first: parts[0], middle: '', last: parts[1] };
    } else {
        const first = parts[0];
        const last = parts[parts.length - 1];
        const middle = parts.slice(1, -1).join(' ');
        return { first, middle, last };
    }
}

function combineFullName(first, middle, last) {
    return [first, middle, last].map(s => (s || '').trim()).filter(Boolean).join(' ');
}

let currentReservationsCache = [];
let currentDeceasedCache = {}; // space_id -> array of deceased records

function initMyReservationPage() {
    const myReservationPage = document.getElementById('myReservationPage');
    const myReservationMenuBtn = document.getElementById('myReservationMenuBtn');
    const myReservationUserBtn = document.getElementById('myReservationUserBtn');
    const reservePlotBtn = document.getElementById('reservePlotBtn');
    const headerReservePlotBtn = document.getElementById('headerReservePlotBtn');

    // Toggle sidebar menu
    if (myReservationMenuBtn) {
        myReservationMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sidebar = document.getElementById('sidebarMenu') || document.querySelector('.sidebar-menu');
            const overlay = document.getElementById('overlay');
            if (sidebar) sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    // User profile button
    if (myReservationUserBtn) {
        myReservationUserBtn.addEventListener('click', () => {
            if (myReservationPage) myReservationPage.classList.remove('active');
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    // Reserve Plot action buttons
    const handleReserveClick = () => {
        if (myReservationPage) myReservationPage.classList.remove('active');
        const reservationModal = document.querySelector('.reservation-modal-overlay');
        if (reservationModal) {
            reservationModal.classList.add('active');
        }
    };

    if (reservePlotBtn) reservePlotBtn.addEventListener('click', handleReserveClick);
    if (headerReservePlotBtn) headerReservePlotBtn.addEventListener('click', handleReserveClick);

    // Setup Subpage Tabs: Plots, Payments, and History
    const tabPlots = document.getElementById('tabMyResPlots');
    const tabPayments = document.getElementById('tabMyResPayments');
    const tabHistory = document.getElementById('tabMyResHistory');

    if (tabPlots) tabPlots.addEventListener('click', () => window.switchMyReservationTab('plots'));
    if (tabPayments) tabPayments.addEventListener('click', () => window.switchMyReservationTab('payments'));
    if (tabHistory) tabHistory.addEventListener('click', () => window.switchMyReservationTab('history'));

    // Setup sidebar navigation links from My Reservation page
    setupMyReservationSidebarNavigation();

    // Setup Reservation Details Modal actions
    setupReservationDetailsModal();

    // Setup Client Manage Deceased Modal actions
    setupClientManageDeceasedModal();

    // Listen for tab/page activations
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && myReservationPage.classList.contains('active')) {
                const isPlotsTab = !tabPayments?.classList.contains('active') && !tabHistory?.classList.contains('active');
                if (isPlotsTab) {
                    loadMyReservations();
                }
            }
        });
    });

    if (myReservationPage) {
        observer.observe(myReservationPage, { attributes: true });
        if (myReservationPage.classList.contains('active')) {
            loadMyReservations();
        }
    }
}

// Subpage Tab Switcher for Unified Reservations & Payments
window.switchMyReservationTab = function(tabName = 'plots', showNotice = false) {
    const panePlots = document.getElementById('paneMyResPlots');
    const panePaymentsUnified = document.getElementById('paneMyResPaymentsUnified');
    const tabPlots = document.getElementById('tabMyResPlots');
    const tabPayments = document.getElementById('tabMyResPayments');
    const tabHistory = document.getElementById('tabMyResHistory');
    const headerTitle = document.getElementById('myResHeaderTitle');
    const headerDesc = document.getElementById('myResHeaderDesc');

    if (tabName === 'payments') {
        if (tabPlots) tabPlots.classList.remove('active');
        if (tabPayments) tabPayments.classList.add('active');
        if (tabHistory) tabHistory.classList.remove('active');

        if (panePlots) panePlots.style.display = 'none';
        if (panePaymentsUnified) panePaymentsUnified.style.display = 'block';

        if (headerTitle) headerTitle.textContent = 'Payments, GCash & Bank Settlements';
        if (headerDesc) headerDesc.textContent = 'Scan official QR, link your wallet for auto-debit, settle monthly dues, or pay via partner banks.';

        if (typeof window.renderPaymentsInTabMount === 'function') {
            window.renderPaymentsInTabMount('payments', showNotice);
        }
    } else if (tabName === 'history') {
        if (tabPlots) tabPlots.classList.remove('active');
        if (tabPayments) tabPayments.classList.remove('active');
        if (tabHistory) tabHistory.classList.add('active');

        if (panePlots) panePlots.style.display = 'none';
        if (panePaymentsUnified) panePaymentsUnified.style.display = 'block';

        if (headerTitle) headerTitle.textContent = 'Payment History & Receipts Ledger';
        if (headerDesc) headerDesc.textContent = 'Track all past transactions, verify payment statuses, and view or download official PDF receipts.';

        if (typeof window.renderPaymentsInTabMount === 'function') {
            window.renderPaymentsInTabMount('history', showNotice);
        }
    } else {
        // Default: 'plots'
        if (tabPlots) tabPlots.classList.add('active');
        if (tabPayments) tabPayments.classList.remove('active');
        if (tabHistory) tabHistory.classList.remove('active');

        if (panePlots) panePlots.style.display = 'block';
        if (panePaymentsUnified) panePaymentsUnified.style.display = 'none';

        if (headerTitle) headerTitle.textContent = 'My Reservations & Payments';
        if (headerDesc) headerDesc.textContent = 'View your reserved memorial plots, settle monthly amortization, and manage GCash auto-debit';

        loadMyReservations();
    }
};

// ==============================================================================
// FETCH & RENDER RESERVATIONS FROM SUPABASE
// ==============================================================================
async function loadMyReservations() {
    const tableContainer = document.getElementById('reservationTableContainer');
    const emptyState = document.getElementById('reservationEmptyState');
    const loadingState = document.getElementById('reservationLoadingState');
    const tbody = document.getElementById('reservationTableBody');

    if (!tbody) return;

    // Show loading
    if (loadingState) loadingState.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    try {
        // 1. Get authenticated user
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        // Sync user avatar
        syncUserAvatar(user.id);

        // 2. Query reservations joined with memorial_spaces
        const { data: reservations, error } = await supabaseClient
            .from('reservations')
            .select(`
                id,
                reservation_number,
                space_id,
                plan_type,
                payment_method,
                installment_term_months,
                total_price,
                down_payment_amount,
                monthly_amortization,
                total_paid,
                balance,
                status,
                reservation_date,
                notes,
                created_at,
                memorial_spaces (
                    id,
                    plot_identifier,
                    section_name,
                    category,
                    price,
                    down_payment,
                    row_num,
                    col_num
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (loadingState) loadingState.style.display = 'none';

        if (error) {
            console.error('Error fetching reservations:', error);
            if (emptyState) {
                emptyState.style.display = 'flex';
                const emptyText = emptyState.querySelector('.no-reservation-text');
                if (emptyText) emptyText.textContent = 'Could not load reservations. Please try again.';
            }
            return;
        }

        currentReservationsCache = reservations || [];

        // Load deceased records for all reserved spaces
        const spaceIds = (reservations || []).map(r => r.space_id).filter(Boolean);
        currentDeceasedCache = {};
        if (spaceIds.length > 0) {
            try {
                const { data: decRecords, error: decErr } = await supabaseClient
                    .from('memorial_records')
                    .select('*')
                    .in('space_id', spaceIds)
                    .order('id', { ascending: true });
                if (!decErr && decRecords) {
                    decRecords.forEach(d => {
                        if (!currentDeceasedCache[d.space_id]) currentDeceasedCache[d.space_id] = [];
                        currentDeceasedCache[d.space_id].push(d);
                    });
                }
            } catch (e) {
                console.warn('Could not load deceased records:', e);
            }
        }

        // 3. Render or display empty state
        if (!reservations || reservations.length === 0) {
            if (tableContainer) tableContainer.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        // Has reservations: render table rows
        if (emptyState) emptyState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';

        tbody.innerHTML = reservations.map(res => {
            const space = res.memorial_spaces || {};
            const plotCode = space.plot_identifier || 'N/A';
            const sectionName = space.section_name || 'Area';
            const categoryName = space.category || 'Memorial Plot';
            const formattedDate = formatDisplayDate(res.reservation_date || res.created_at);

            const maxCapacity = getCategoryCapacity(categoryName);
            const assignedDeceased = currentDeceasedCache[res.space_id] || [];
            const assignedCount = assignedDeceased.length;
            const slotsRemaining = Math.max(0, maxCapacity - assignedCount);

            const planBadgeClass = (res.plan_type === 'PRE-NEED') ? 'badge-plan-preneed' : 'badge-plan-atneed';
            const paymentBadgeClass = (res.payment_method === 'INSTALLMENT') ? 'badge-payment-installment' : 'badge-payment-full';
            
            let statusBadgeClass = 'badge-status-pending';
            if (res.status === 'APPROVED' || res.status === 'COMPLETED') statusBadgeClass = 'badge-status-approved';
            else if (res.status === 'CANCELLED' || res.status === 'REJECTED') statusBadgeClass = 'badge-status-cancelled';
            else if (res.status === 'OVERDUE') statusBadgeClass = 'badge-status-overdue';

            const canCancel = res.status === 'PENDING';
            const isInstallment = res.payment_method === 'INSTALLMENT' && res.status !== 'CANCELLED' && Number(res.balance ?? res.total_price ?? 0) > 0;
            const subsMap = typeof window.getGcashSubscriptionsMap === 'function' ? window.getGcashSubscriptionsMap() : {};
            const subInfo = subsMap[res.reservation_number];
            const isGcashLinked = Boolean(subInfo?.gcashAutoDebitLinked || String(res.notes || '').toUpperCase().includes('GCASH'));
            const nextDueStr = subInfo?.nextDueDate || (typeof window.computeNextMonthlyDueDate === 'function' ? window.computeNextMonthlyDueDate(res.reservation_date, 1) : '');

            return `
                <tr data-reservation-id="${res.id}">
                    <td>
                        <span class="res-cell-primary">${escapeHtml(res.reservation_number)}</span>
                        <span class="res-cell-sub">${escapeHtml(categoryName)}</span>
                    </td>
                    <td>
                        <span class="res-cell-primary">${escapeHtml(plotCode)}</span>
                        <span class="res-cell-sub">${escapeHtml(sectionName.toUpperCase())}</span>
                    </td>
                    <td>
                        <span class="badge-pill ${planBadgeClass}">${escapeHtml(res.plan_type)}</span>
                    </td>
                    <td>
                        <span class="badge-pill ${paymentBadgeClass}">${escapeHtml(res.payment_method)}</span>
                        ${isInstallment ? `
                            <span class="res-cell-sub" style="color:${isGcashLinked ? '#0057ff' : '#b45309'}; font-weight:700; margin-top:3px; display:block;">
                                ${isGcashLinked ? 'GCash Auto-Debit Linked' : 'Next Due: ' + escapeHtml(nextDueStr)}
                            </span>
                        ` : ''}
                    </td>
                    <td>
                        ${assignedCount === 0 ? `
                            <span class="badge-pill" style="background: #e2e8f0; color: #475569; font-size: 0.74rem; font-weight: 700; border-radius: 3px;">Not Yet Assigned</span>
                            <span class="res-cell-sub" style="margin-top: 3px;">0 of ${maxCapacity} slot${maxCapacity > 1 ? 's' : ''} assigned</span>
                            <button type="button" class="btn-action-details" style="margin-top: 6px; padding: 4px 10px; font-size: 0.75rem; background: #2d4a36; color: #ffffff; border-color: #2d4a36; border-radius: 3px;" onclick="openManageDeceasedModal(${res.id}, ${res.space_id})">+ Add Deceased</button>
                        ` : `
                            <div style="font-weight: 700; color: #1e3a29; font-size: 0.88rem; max-width: 220px; word-break: break-word;">
                                ${assignedDeceased.map(d => escapeHtml(d.deceased_name)).join('<br>')}
                            </div>
                            <span class="res-cell-sub" style="margin-top: 3px; color: ${assignedCount >= maxCapacity ? '#16a34a' : '#d97706'}; font-weight: 700;">
                                ${assignedCount} of ${maxCapacity} slot${maxCapacity > 1 ? 's' : ''} filled
                            </span>
                            <button type="button" class="btn-action-details" style="margin-top: 6px; padding: 4px 10px; font-size: 0.75rem; border-radius: 3px;" onclick="openManageDeceasedModal(${res.id}, ${res.space_id})">
                                ${slotsRemaining > 0 ? `Manage (+${slotsRemaining} slot${slotsRemaining > 1 ? 's' : ''})` : 'Manage Deceased'}
                            </button>
                        `}
                    </td>
                    <td>
                        <span class="badge-pill ${statusBadgeClass}" style="border-radius: 3px;">${escapeHtml(res.status)}</span>
                    </td>
                    <td>
                        <span class="res-cell-primary" style="font-size: 0.88rem;">${formattedDate}</span>
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                        <div class="res-actions-wrapper" style="flex-wrap: nowrap; gap: 5px; justify-content: center;">
                            <button type="button" class="btn-action-details" style="border-radius: 3px;" onclick="viewReservationDetails(${res.id})">Details</button>
                            ${isInstallment ? `
                                <button type="button" class="btn-action-details" style="background:#0057ff;color:#fff;border-color:#0057ff;border-radius:3px;" onclick="handleRunMonthlyAutoDebit(${res.id})" title="Pay/Auto-Debit 1 Month via Linked GCash">GCash Auto-Pay</button>
                                <button type="button" class="btn-action-details" style="background:#0057ff;color:#fff;border-color:#0057ff;border-radius:3px;" onclick="handleRunMonthlyGcashQrPay(${res.id})" title="Pay via Official GCash QR Code">GCash QR</button>
                                <button type="button" class="btn-action-details" style="background:#047857;color:#fff;border-color:#047857;border-radius:3px;" onclick="handleRunMonthlyBankPay(${res.id})" title="Pay 1 Month via Direct Bank Transfer">Bank Pay</button>
                                <button type="button" class="btn-action-details" style="background:#0f766e;color:#fff;border-color:#0f766e;border-radius:3px;" onclick="handleSend3DayNotice(${res.id})" title="Send 3-Day Pre-Due Email Notice Now">3-Day Notice</button>
                            ` : ''}
                            ${canCancel ? `
                                <button type="button" class="btn-action-delete" style="border-radius: 3px;" onclick="handleCancelReservation(${res.id}, '${escapeHtml(plotCode)}')">Delete</button>
                            ` : `
                                <button type="button" class="btn-action-details" style="opacity: 0.5; cursor: not-allowed; border-radius: 3px;" disabled title="Reservation is ${res.status}">Delete</button>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Failed to load reservations:', err);
        if (loadingState) loadingState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    }
}

// ==============================================================================
// RESERVATION DETAILS MODAL HANDLERS
// ==============================================================================
function setupReservationDetailsModal() {
    const detailsModal = document.getElementById('reservationDetailsModal');
    const closeBtn = document.getElementById('closeReservationDetailsBtn');
    const dismissBtn = document.getElementById('dismissReservationDetailsBtn');
    const printBtn = document.getElementById('printReceiptBtn');

    const closeModal = () => {
        if (detailsModal) detailsModal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) closeModal();
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            document.body.classList.add('is-printing-receipt');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing-receipt');
            }, 1200);
        });
    }
}

window.viewReservationDetails = function(reservationId) {
    const res = currentReservationsCache.find(r => r.id === reservationId);
    if (!res) return;

    const space = res.memorial_spaces || {};
    const detailsModal = document.getElementById('reservationDetailsModal');

    // Header info
    setText('detailResNumberHeader', res.reservation_number);
    setText('detailDateDisplay', formatDisplayDate(res.reservation_date || res.created_at));

    // Badges
    const statusBadge = document.getElementById('detailStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = res.status;
        statusBadge.className = `badge-pill ${res.status === 'APPROVED' ? 'badge-status-approved' : res.status === 'CANCELLED' ? 'badge-status-cancelled' : 'badge-status-pending'}`;
    }

    const planBadge = document.getElementById('detailPlanBadge');
    if (planBadge) {
        planBadge.textContent = res.plan_type;
        planBadge.className = `badge-pill ${res.plan_type === 'PRE-NEED' ? 'badge-plan-preneed' : 'badge-plan-atneed'}`;
    }

    const paymentBadge = document.getElementById('detailPaymentBadge');
    if (paymentBadge) {
        paymentBadge.textContent = res.payment_method;
        paymentBadge.className = `badge-pill ${res.payment_method === 'INSTALLMENT' ? 'badge-payment-installment' : 'badge-payment-full'}`;
    }

    // Plot Information
    setText('detailPlotId', space.plot_identifier || 'N/A');
    setText('detailPlotSection', space.section_name || 'N/A');
    setText('detailPlotCategory', space.category || 'N/A');
    setText('detailPlotGrid', (space.row_num && space.col_num) ? `Row ${space.row_num}, Column ${space.col_num}` : 'Standard Layout');

    // Financial & Amortization
    setText('detailTotalPrice', formatCurrency(res.total_price || space.price || 0));
    setText('detailDownPayment', formatCurrency(res.down_payment_amount || space.down_payment || 0));
    setText('detailTermMonths', `${res.installment_term_months || 60} Months (${(res.installment_term_months || 60) / 12} Years)`);
    setText('detailMonthlyAmortization', `${formatCurrency(res.monthly_amortization || 0)} / mo`);
    setText('detailTotalPaid', formatCurrency(res.total_paid || 0));
    setText('detailBalance', formatCurrency(res.balance || res.total_price || 0));

    // Interred Deceased & Plot Capacity
    const categoryName = space.category || 'Special Supreme';
    const maxCapacity = getCategoryCapacity(categoryName);
    const assignedDeceased = currentDeceasedCache[res.space_id] || [];
    const assignedCount = assignedDeceased.length;

    const capacityBadge = document.getElementById('detailPlotCapacityBadge');
    if (capacityBadge) {
        capacityBadge.textContent = `${assignedCount} / ${maxCapacity} Slots Assigned`;
        capacityBadge.style.background = assignedCount >= maxCapacity ? '#dcfce7' : '#e8eee8';
        capacityBadge.style.color = assignedCount >= maxCapacity ? '#166534' : '#2d4a36';
    }

    const deceasedListEl = document.getElementById('detailDeceasedList');
    if (deceasedListEl) {
        if (assignedCount === 0) {
            deceasedListEl.innerHTML = `
                <div style="padding: 12px; background: #fdfdf9; border: 1px dashed #c2cfc2; border-radius: 6px; text-align: center; color: #666; font-size: 0.88rem;">
                    No deceased assigned to this plot yet (Pre-Need). This plot category supports up to <strong>${maxCapacity}</strong> loved one${maxCapacity > 1 ? 's' : ''}.
                </div>
            `;
        } else {
            deceasedListEl.innerHTML = assignedDeceased.map((d, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #ffffff; border: 1px solid #e0e0dc; border-radius: 6px;">
                    <div>
                        <strong style="color: #1e3a29; font-size: 0.95rem;">Slot #${idx + 1}: ${escapeHtml(d.deceased_name)}</strong>
                        <div style="font-size: 0.78rem; color: #666; margin-top: 2px;">
                            ${d.birth_date ? `Born: ${formatDisplayDate(d.birth_date)} &bull; ` : ''}
                            ${d.death_date ? `Passed: ${formatDisplayDate(d.death_date)} &bull; ` : ''}
                            ${d.burial_date ? `Burial: ${formatDisplayDate(d.burial_date)}` : 'Burial: Not specified'}
                            ${d.epitaph ? `<br><em>&ldquo;${escapeHtml(d.epitaph)}&rdquo;</em>` : ''}
                        </div>
                    </div>
                    <button type="button" class="btn-action-details" style="font-size: 0.78rem; padding: 4px 12px;" onclick="document.getElementById('reservationDetailsModal').classList.remove('active'); openManageDeceasedModal(${res.id}, ${res.space_id}, ${d.id});">Edit</button>
                </div>
            `).join('');
        }
    }

    const addDeceasedBtn = document.getElementById('detailAddDeceasedBtn');
    if (addDeceasedBtn) {
        if (assignedCount >= maxCapacity) {
            addDeceasedBtn.disabled = true;
            addDeceasedBtn.style.opacity = '0.5';
            addDeceasedBtn.style.cursor = 'not-allowed';
            addDeceasedBtn.textContent = `Plot at Full Capacity (${maxCapacity}/${maxCapacity})`;
            addDeceasedBtn.onclick = null;
        } else {
            addDeceasedBtn.disabled = false;
            addDeceasedBtn.style.opacity = '1';
            addDeceasedBtn.style.cursor = 'pointer';
            addDeceasedBtn.textContent = `+ Add Deceased (${assignedCount}/${maxCapacity} Slots)`;
            addDeceasedBtn.onclick = () => {
                if (detailsModal) detailsModal.classList.remove('active');
                openManageDeceasedModal(res.id, res.space_id);
            };
        }
    }

    // Notes
    const notesContainer = document.getElementById('detailNotesContainer');
    const notesText = document.getElementById('detailNotesText');
    if (res.notes && res.notes.trim()) {
        notesContainer.style.display = 'block';
        notesText.textContent = res.notes;
    } else {
        notesContainer.style.display = 'none';
    }

    if (detailsModal) detailsModal.classList.add('active');
};

// ==============================================================================
// CANCEL / DELETE RESERVATION
// ==============================================================================
window.handleCancelReservation = async function(reservationId, plotCode) {
    const confirmed = await showConfirmModal({
        title: "Cancel Reservation",
        message: `Are you sure you want to cancel the reservation for plot ${plotCode}?\n\nThis will release the plot and change the status to CANCELLED.`,
        confirmText: "Cancel Reservation",
        cancelText: "Keep Reservation",
        type: "warning",
        danger: true
    });
    if (!confirmed) return;

    try {
        // Update reservation to CANCELLED in Supabase
        // Database trigger handle_reservation_status_change() automatically releases plot back to 'available'
        const { error } = await supabaseClient
            .from('reservations')
            .update({ 
                status: 'CANCELLED',
                updated_at: new Date().toISOString()
            })
            .eq('id', reservationId);

        if (error) {
            console.error('Cancel reservation error:', error);
            if (typeof showErrorModal === 'function') {
                showErrorModal('Cancellation Error', error.message);
            } else {
                alert('Failed to cancel reservation: ' + error.message);
            }
            return;
        }

        if (typeof showSuccessModal === 'function') {
            showSuccessModal('Reservation Cancelled', `Reservation for plot ${plotCode} has been successfully cancelled and released.`);
        } else {
            alert(`Reservation for plot ${plotCode} has been cancelled.`);
        }

        // Refresh table and dashboard
        await loadMyReservations();
        if (typeof window.refreshDashboardKPIs === 'function') {
            window.refreshDashboardKPIs();
        }

    } catch (err) {
        console.error('Error cancelling reservation:', err);
        alert('An unexpected error occurred while cancelling. Please try again.');
    }
};

// ==============================================================================
// HELPER UTILITIES
// ==============================================================================
function syncUserAvatar(userId) {
    const avatarImg = document.getElementById('myReservationUserAvatar');
    if (!avatarImg) return;

    const savedPic = localStorage.getItem('userProfilePicture');
    if (savedPic) {
        avatarImg.src = savedPic;
        return;
    }

    supabaseClient
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
            if (data && data.avatar_url) {
                avatarImg.src = data.avatar_url;
                localStorage.setItem('userProfilePicture', data.avatar_url);
            }
        });
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch {
        return dateStr;
    }
}

function formatCurrency(num) {
    const n = Number(num) || 0;
    return '₱ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setText(elementId, val) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = val;
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

function setupMyReservationSidebarNavigation() {
    const myReservationPage = document.getElementById('myReservationPage');
    const sidebar = document.getElementById('sidebarMenu') || document.querySelector('.sidebar-menu');
    const overlay = document.getElementById('overlay');

    const closeMyReservation = () => {
        if (myReservationPage) myReservationPage.classList.remove('active');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (typeof window.clearDashboardMapHighlights === 'function') {
            window.clearDashboardMapHighlights();
        }
    };

    const profileMenuItem = document.getElementById('profileMenuItem');
    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeMyReservation();
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    const dashboardMenuItem = document.getElementById('dashboardMenuItem');
    if (dashboardMenuItem) {
        dashboardMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeMyReservation();
        });
    }

    const reservePlotMenuItem = document.getElementById('reservePlotMenuItem');
    if (reservePlotMenuItem) {
        reservePlotMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            closeMyReservation();
            const reservationModal = document.querySelector('.reservation-modal-overlay');
            if (reservationModal) reservationModal.classList.add('active');
        });
    }
}

// Global export
window.loadMyReservations = loadMyReservations;


// ==============================================================================
// MANUAL / DEMO TRIGGERS FOR 3-DAY PRE-DUE EMAIL NOTICE & GCASH MONTHLY AUTO-DEBIT
// ==============================================================================
window.handleSend3DayNotice = async function(reservationId) {
    const res = currentReservationsCache.find(r => r.id === reservationId);
    if (!res) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .maybeSingle();

        const clientName = profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client';
        const clientEmail = user.email || '';

        const subsMap = typeof window.getGcashSubscriptionsMap === 'function' ? window.getGcashSubscriptionsMap() : {};
        const sub = subsMap[res.reservation_number] || {
            gcashAutoDebitLinked: true,
            linkedGcashNumber: window.ZMG_PAYMENT_CONFIG?.gcash?.MERCHANT_NUMBER || '09451876774',
            nextDueDate: typeof window.computeNextMonthlyDueDate === 'function' ? window.computeNextMonthlyDueDate(res.reservation_date, 1) : 'Next Month'
        };

        if (typeof window.sendAutomated3DayNoticeForReservation === 'function') {
            const result = await window.sendAutomated3DayNoticeForReservation(res, sub, clientName, clientEmail, 3);
            if (result && result.sent) {
                if (typeof showSuccessModal === 'function') {
                    showSuccessModal(
                        '3-Day Pre-Due Email Sent!',
                        `A 3-day before-due monthly installment notice and statement receipt for ${res.reservation_number} has been sent to ${clientEmail}.`
                    );
                } else {
                    alert(`3-Day Pre-Due Email Notice sent to ${clientEmail}!`);
                }
            } else {
                alert('Could not send 3-Day Notice email. Please check your EmailJS connection.');
            }
        }
    } catch (err) {
        console.error('Error sending 3-day notice:', err);
        alert('Error sending 3-day notice: ' + err.message);
    }
};

window.handleRunMonthlyAutoDebit = async function(reservationId) {
    const res = currentReservationsCache.find(r => r.id === reservationId);
    if (!res) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .maybeSingle();

        const clientName = profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client';
        const clientEmail = user.email || '';

        const subsMap = typeof window.getGcashSubscriptionsMap === 'function' ? window.getGcashSubscriptionsMap() : {};
        let sub = subsMap[res.reservation_number];
        if (!sub) {
            sub = {
                reservationNumber: res.reservation_number,
                gcashAutoDebitLinked: true,
                linkedGcashNumber: window.ZMG_PAYMENT_CONFIG?.gcash?.MERCHANT_NUMBER || '09451876774',
                nextDueDate: typeof window.computeNextMonthlyDueDate === 'function' ? window.computeNextMonthlyDueDate(res.reservation_date, 1) : ''
            };
        } else {
            sub.gcashAutoDebitLinked = true;
        }
        subsMap[res.reservation_number] = sub;
        if (typeof window.saveGcashSubscriptionsMap === 'function') {
            window.saveGcashSubscriptionsMap(subsMap);
        }

        if (typeof window.executeAutomatedGcashMonthlyInstallment === 'function') {
            await window.executeAutomatedGcashMonthlyInstallment(res, sub, clientName, clientEmail, true);
            await loadMyReservations();
            if (typeof window.refreshDashboardKPIs === 'function') {
                window.refreshDashboardKPIs(user.id);
            }
        }
    } catch (err) {
        console.error('Error running monthly GCash auto-debit:', err);
        alert('Failed to run monthly GCash auto-debit: ' + err.message);
    }
};

window.handleRunMonthlyGcashQrPay = async function(reservationId) {
    const res = currentReservationsCache.find(r => r.id === reservationId);
    if (!res) {
        alert('Reservation not found.');
        return;
    }

    try {
        let nextSched = null;
        if (typeof supabaseClient !== 'undefined') {
            const { data } = await supabaseClient
                .from('payment_schedules')
                .select('*')
                .eq('reservation_id', res.id)
                .in('status', ['PENDING', 'FAILED'])
                .order('installment_no', { ascending: true })
                .limit(1)
                .maybeSingle();
            nextSched = data;
        }

        const amountToPay = Number(nextSched?.amount || res.monthly_amortization || (Number(res.balance || 0) > 0 ? Math.min(Number(res.balance), 1191.44) : 0));

        if (typeof window.openGcashQrPaymentModal === 'function') {
            window.openGcashQrPaymentModal({
                res,
                schedule: nextSched,
                amount: amountToPay,
                action: nextSched ? 'pay_schedule' : (Number(res.total_paid || 0) === 0 ? 'charge_initial' : 'pay_balance'),
                onSuccess: async () => {
                    await loadMyReservations();
                    if (typeof window.refreshDashboardKPIs === 'function') {
                        const { data: { user } } = await supabaseClient.auth.getUser();
                        if (user) window.refreshDashboardKPIs(user.id);
                    }
                }
            });
        } else {
            alert('GCash QR payment modal is initializing, please try again.');
        }
    } catch (err) {
        console.error('Error starting GCash QR payment:', err);
        alert('Could not start GCash QR payment: ' + err.message);
    }
};

window.handleRunMonthlyBankPay = async function(reservationId) {
    const res = currentReservationsCache.find(r => r.id === reservationId);
    if (!res) {
        alert('Reservation not found.');
        return;
    }

    try {
        let nextSched = null;
        if (typeof supabaseClient !== 'undefined') {
            const { data } = await supabaseClient
                .from('payment_schedules')
                .select('*')
                .eq('reservation_id', res.id)
                .in('status', ['PENDING', 'FAILED'])
                .order('installment_no', { ascending: true })
                .limit(1)
                .maybeSingle();
            nextSched = data;
        }

        const amountToPay = Number(nextSched?.amount || res.monthly_amortization || (Number(res.balance || 0) > 0 ? Math.min(Number(res.balance), 1191.44) : 0));

        if (typeof window.openTestBankPaymentModal === 'function') {
            window.openTestBankPaymentModal({
                res,
                schedule: nextSched,
                amount: amountToPay,
                action: nextSched ? 'pay_schedule' : (Number(res.total_paid || 0) === 0 ? 'charge_initial' : 'pay_balance'),
                onSuccess: async () => {
                    await loadMyReservations();
                    if (typeof window.refreshDashboardKPIs === 'function') {
                        const { data: { user } } = await supabaseClient.auth.getUser();
                        if (user) window.refreshDashboardKPIs(user.id);
                    }
                }
            });
        } else {
            alert('Bank payment simulator is initializing, please try again.');
        }
    } catch (err) {
        console.error('Error starting bank payment:', err);
        alert('Could not start bank payment: ' + err.message);
    }
};

// ==============================================================================
// CLIENT MANAGE INTERRED DECEASED MODAL
// ==============================================================================
function setupClientManageDeceasedModal() {
    const modal = document.getElementById('clientManageDeceasedModal');
    const closeBtn = document.getElementById('closeCmdModalBtn');
    const dismissBtn = document.getElementById('dismissCmdModalBtn');
    const form = document.getElementById('clientManageDeceasedForm');
    const cancelEditBtn = document.getElementById('cmdCancelEditBtn');
    const addNewBtn = document.getElementById('cmdAddNewBtn');

    const closeModal = () => {
        if (modal) modal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            const spaceId = Number(document.getElementById('cmdSpaceId')?.value || 0);
            const resId = Number(document.getElementById('cmdReservationId')?.value || 0);
            openManageDeceasedModal(resId, spaceId);
        });
    }

    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            const spaceId = Number(document.getElementById('cmdSpaceId')?.value || 0);
            const resId = Number(document.getElementById('cmdReservationId')?.value || 0);
            openManageDeceasedModal(resId, spaceId);
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('cmdSubmitBtn');
            const recordId = document.getElementById('cmdRecordId')?.value || '';
            const spaceId = Number(document.getElementById('cmdSpaceId')?.value || 0);
            const reservationId = Number(document.getElementById('cmdReservationId')?.value || 0);

            const firstName = document.getElementById('cmdFirstName')?.value?.trim() || '';
            const middleName = document.getElementById('cmdMiddleName')?.value?.trim() || '';
            const lastName = document.getElementById('cmdLastName')?.value?.trim() || '';
            const gender = document.getElementById('cmdGender')?.value || null;
            const deathDate = document.getElementById('cmdDeathDate')?.value || null;
            const burialDate = document.getElementById('cmdBurialDate')?.value || null;
            const epitaph = document.getElementById('cmdEpitaph')?.value?.trim() || null;

            if (!firstName || !lastName) {
                alert('Please enter both First Name and Last Name of the deceased.');
                return;
            }

            const fullName = combineFullName(firstName, middleName, lastName);

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Saving...';
                }

                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error('Please log in to manage deceased records.');

                if (recordId) {
                    // Update existing record
                    const { error: updErr } = await supabaseClient
                        .from('memorial_records')
                        .update({
                            deceased_name: fullName,
                            gender: gender,
                            death_date: deathDate,
                            burial_date: burialDate,
                            epitaph: epitaph,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', Number(recordId));

                    if (updErr) throw updErr;
                } else {
                    // Check capacity before inserting
                    const res = currentReservationsCache.find(r => r.id === reservationId);
                    const category = res?.memorial_spaces?.category || 'Special Supreme';
                    const maxCapacity = getCategoryCapacity(category);
                    const currentRecords = currentDeceasedCache[spaceId] || [];

                    if (currentRecords.length >= maxCapacity) {
                        alert(`Cannot add another deceased: This plot category (${category}) allows a maximum of ${maxCapacity} interred deceased. All slots are currently filled.`);
                        return;
                    }

                    const { error: insErr } = await supabaseClient
                        .from('memorial_records')
                        .insert([{
                            space_id: spaceId,
                            family_contact_id: user.id,
                            deceased_name: fullName,
                            gender: gender,
                            death_date: deathDate,
                            burial_date: burialDate,
                            epitaph: epitaph
                        }]);

                    if (insErr) throw insErr;
                }

                // If burialDate is set, ensure space is marked occupied
                if (burialDate) {
                    await supabaseClient
                        .from('memorial_spaces')
                        .update({ status: 'occupied', updated_at: new Date().toISOString() })
                        .eq('id', spaceId);
                }

                // Refresh table and modal
                await loadMyReservations();
                await openManageDeceasedModal(reservationId, spaceId);

                if (typeof showSuccessModal === 'function') {
                    showSuccessModal('Deceased Record Saved', `Successfully ${recordId ? 'updated' : 'assigned'} ${fullName} to this memorial plot.`);
                } else {
                    alert(`Deceased record for ${fullName} saved successfully.`);
                }

            } catch (err) {
                console.error('Error saving deceased record:', err);
                alert('Failed to save deceased record: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Deceased Record';
                }
            }
        });
    }
}

window.openManageDeceasedModal = async function(reservationId, spaceId, editRecordId = null) {
    const modal = document.getElementById('clientManageDeceasedModal');
    if (!modal) return;

    const res = currentReservationsCache.find(r => r.id === reservationId);
    const space = res?.memorial_spaces || {};
    const category = space.category || 'Special Supreme';
    const plotCode = space.plot_identifier || 'Plot';
    const maxCapacity = getCategoryCapacity(category);

    // Set hidden keys
    document.getElementById('cmdSpaceId').value = spaceId;
    document.getElementById('cmdReservationId').value = reservationId;
    document.getElementById('cmdRecordId').value = editRecordId || '';

    // Set headers
    setText('cmdModalPlotCode', plotCode);
    setText('cmdModalCategory', `${category} (${maxCapacity} Slot${maxCapacity > 1 ? 's' : ''})`);

    // Fetch fresh deceased records for this space
    let records = [];
    try {
        const { data, error } = await supabaseClient
            .from('memorial_records')
            .select('*')
            .eq('space_id', spaceId)
            .order('id', { ascending: true });
        if (!error && data) {
            records = data;
            currentDeceasedCache[spaceId] = data;
        }
    } catch (_) {
        records = currentDeceasedCache[spaceId] || [];
    }

    const assignedCount = records.length;
    const slotsRemaining = Math.max(0, maxCapacity - assignedCount);

    // Capacity banner
    const capText = document.getElementById('cmdCapacityText');
    const capPill = document.getElementById('cmdCapacityPill');
    if (capText) {
        if (assignedCount === 0) {
            capText.textContent = `0 of ${maxCapacity} slots assigned (${slotsRemaining} slot${slotsRemaining > 1 ? 's' : ''} available - Pre-Need)`;
        } else if (slotsRemaining > 0) {
            capText.textContent = `${assignedCount} of ${maxCapacity} slots assigned (${slotsRemaining} additional slot${slotsRemaining > 1 ? 's' : ''} available)`;
        } else {
            capText.textContent = `All ${maxCapacity} of ${maxCapacity} slots assigned (Full Plot Capacity)`;
        }
    }
    if (capPill) {
        capPill.textContent = `${assignedCount} / ${maxCapacity} Slots`;
        capPill.style.background = assignedCount >= maxCapacity ? '#dcfce7' : '#e8eee8';
        capPill.style.color = assignedCount >= maxCapacity ? '#166534' : '#2d4a36';
    }

    // Render list of assigned deceased
    const listContainer = document.getElementById('cmdDeceasedListContainer');
    const addNewBtn = document.getElementById('cmdAddNewBtn');

    if (listContainer) {
        if (assignedCount === 0) {
            listContainer.innerHTML = `
                <div style="padding: 12px 14px; background: #ffffff; border: 1px dashed #c2cfc2; border-radius: 4px; color: #666; font-size: 0.86rem; text-align: center;">
                    No deceased have been assigned to this plot yet. Use the form below to assign your loved one.
                </div>
            `;
        } else {
            listContainer.innerHTML = records.map((d, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #ffffff; border: 1.5px solid ${editRecordId === d.id ? '#2d4a36' : '#e0e0dc'}; border-radius: 4px;">
                    <div>
                        <strong style="color: #1e3a29; font-size: 0.92rem;">Slot #${idx + 1}: ${escapeHtml(d.deceased_name)}</strong>
                        <div style="font-size: 0.78rem; color: #666; margin-top: 2px;">
                            ${d.birth_date ? `Born: ${formatDisplayDate(d.birth_date)} &bull; ` : ''}
                            ${d.death_date ? `Passed: ${formatDisplayDate(d.death_date)} &bull; ` : ''}
                            ${d.burial_date ? `Burial: ${formatDisplayDate(d.burial_date)}` : 'Burial: Not specified'}
                            ${d.epitaph ? `<br><em>&ldquo;${escapeHtml(d.epitaph)}&rdquo;</em>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button type="button" class="btn-action-details" style="font-size: 0.78rem; padding: 4px 12px; ${editRecordId === d.id ? 'background: #2d4a36; color: #fff;' : ''}" onclick="openManageDeceasedModal(${reservationId}, ${spaceId}, ${d.id})">
                            ${editRecordId === d.id ? 'Editing' : 'Edit'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Form logic
    const formContainer = document.getElementById('cmdFormContainer');
    const fullNotice = document.getElementById('cmdCapacityFullNotice');
    const formTitle = document.getElementById('cmdFormTitle');
    const cancelEditBtn = document.getElementById('cmdCancelEditBtn');
    const submitBtn = document.getElementById('cmdSubmitBtn');

    if (editRecordId) {
        // Editing specific record
        const rec = records.find(r => r.id === editRecordId);
        if (rec) {
            const parsed = parseFullName(rec.deceased_name);
            document.getElementById('cmdFirstName').value = parsed.first || '';
            document.getElementById('cmdMiddleName').value = parsed.middle || '';
            document.getElementById('cmdLastName').value = parsed.last || '';
            document.getElementById('cmdGender').value = rec.gender || '';
            document.getElementById('cmdDeathDate').value = rec.death_date || '';
            document.getElementById('cmdBurialDate').value = rec.burial_date || '';
            document.getElementById('cmdEpitaph').value = rec.epitaph || '';

            if (formTitle) formTitle.textContent = `Edit Deceased Record: ${rec.deceased_name}`;
            if (submitBtn) submitBtn.textContent = 'Update Deceased Record';
            if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';
            if (formContainer) formContainer.style.display = 'block';
            if (fullNotice) fullNotice.style.display = 'none';
            if (addNewBtn) addNewBtn.style.display = slotsRemaining > 0 ? 'inline-block' : 'none';
        }
    } else {
        // Adding new
        document.getElementById('cmdFirstName').value = '';
        document.getElementById('cmdMiddleName').value = '';
        document.getElementById('cmdLastName').value = '';
        document.getElementById('cmdGender').value = '';
        document.getElementById('cmdDeathDate').value = '';
        document.getElementById('cmdBurialDate').value = '';
        document.getElementById('cmdEpitaph').value = '';

        if (cancelEditBtn) cancelEditBtn.style.display = 'none';
        if (submitBtn) submitBtn.textContent = 'Save Deceased Record';
        if (formTitle) formTitle.textContent = `Add Deceased to this Plot (Slot #${assignedCount + 1} of ${maxCapacity})`;

        if (assignedCount >= maxCapacity) {
            // Full capacity!
            if (formContainer) formContainer.style.display = 'none';
            if (fullNotice) fullNotice.style.display = 'block';
            if (addNewBtn) addNewBtn.style.display = 'none';
        } else {
            if (formContainer) formContainer.style.display = 'block';
            if (fullNotice) fullNotice.style.display = 'none';
            if (addNewBtn) addNewBtn.style.display = 'none';
        }
    }

    modal.classList.add('active');
};

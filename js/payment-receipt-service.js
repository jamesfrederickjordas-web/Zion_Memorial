// ==============================================================================
// ZION MEMORIAL GARDEN - GCASH SETUP TAB, PAYMENT CHECKS, PDF & EMAILJS SERVICE
// ==============================================================================

const ZMG_PAYMENT_CONFIG = {
    emailjs: {
        PUBLIC_KEY: 'siuCT77XCPFo0C3Pl',
        SERVICE_ID: 'service_xvwt6qa',
        TEMPLATE_ID: 'template_56p30ne'
    },
    gcash: {
        MERCHANT_NAME: 'Zion Memorial Garden Inc.',
        MERCHANT_NUMBER: '09451876774',
        QR_IMAGE_PATH: 'assets/images/gcash-qr-default.svg',
        COUNTER_LOCATION: 'Zion Memorial Garden Main Office - Cashier Counter 1 & 2'
    },
    bank: {
        TEST_MODE: true,
        BENEFICIARY_NAME: 'Zion Memorial Garden Inc.',
        COUNTER_LOCATION: 'Zion Memorial Garden Main Office - Cashier Counter 1 & 2',
        PARTNER_BANKS: [
            { id: 'bdo', name: 'BDO Unibank', code: 'BDO', accountNo: '0045-8012-9921', branch: 'Laguna Technopark Branch', type: 'Xendit Virtual Account' },
            { id: 'bpi', name: 'BPI (Bank of the Philippine Islands)', code: 'BPI', accountNo: '1092-4481-23', branch: 'Sta. Rosa Commercial Center', type: 'Xendit Virtual Account' },
            { id: 'ubp', name: 'UnionBank of the Philippines', code: 'UNIONBANK', accountNo: '1094-8273-6152', branch: 'Cabuyao Main Branch', type: 'Xendit Virtual Account' },
            { id: 'mbt', name: 'Metrobank (Metropolitan Bank & Trust)', code: 'METROBANK', accountNo: '209-3-20918234-1', branch: 'Biñan Central Branch', type: 'Xendit Virtual Account' },
            { id: 'rcbc', name: 'RCBC (Rizal Commercial Banking Corp)', code: 'RCBC', accountNo: '9023-8419-20', branch: 'Calamba National Highway', type: 'Xendit Virtual Account' },
            { id: 'lbp', name: 'LandBank of the Philippines', code: 'LANDBANK', accountNo: '0142-9981-55', branch: 'Laguna Provincial Capitol', type: 'InstaPay / PESONet Depository' }
        ]
    }
};

// ==============================================================================
// GCASH QR CODE & MERCHANT SETTINGS MANAGER (Admin Uploadable & Client Scannable)
// ==============================================================================
const ZMG_GCASH_QR_STORAGE_KEY = 'zmg_gcash_qr_config_v1';
let stagedGcashReceiptProofUrl = null;

const zmgGcashQr = {
    DEFAULT_CONFIG: {
        merchantName: 'Zion Memorial Garden Inc.',
        accountNumber: '0945 187 6774',
        qrImageUrl: 'assets/images/gcash-qr-default.svg',
        instructions: 'Scan this QR code with your GCash app, pay the exact amount, and input your GCash Reference Number in the payment form.',
        updatedAt: null,
        isCustom: false
    },

    getConfig() {
        try {
            const raw = localStorage.getItem(ZMG_GCASH_QR_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && (parsed.qrImageUrl || parsed.merchantName)) {
                    const isCustom = Boolean(parsed.isCustom || (parsed.qrImageUrl && !parsed.qrImageUrl.includes('gcash-qr-default.svg')));
                    const merged = { ...this.DEFAULT_CONFIG, ...parsed, isCustom };
                    this.syncToZmgConfig(merged);
                    return merged;
                }
            }
        } catch (_) {}
        const def = { ...this.DEFAULT_CONFIG };
        this.syncToZmgConfig(def);
        return def;
    },

    syncToZmgConfig(cfg) {
        if (!cfg) return;
        if (typeof ZMG_PAYMENT_CONFIG !== 'undefined' && ZMG_PAYMENT_CONFIG.gcash) {
            if (cfg.merchantName) ZMG_PAYMENT_CONFIG.gcash.MERCHANT_NAME = cfg.merchantName;
            if (cfg.accountNumber) ZMG_PAYMENT_CONFIG.gcash.MERCHANT_NUMBER = cfg.accountNumber;
            if (cfg.qrImageUrl) ZMG_PAYMENT_CONFIG.gcash.QR_IMAGE_PATH = cfg.qrImageUrl;
        }
    },

    async loadConfigFromCloud() {
        const current = this.getConfig();
        if (typeof supabaseClient === 'undefined') return current;

        try {
            const { data, error } = await supabaseClient
                .from('system_settings')
                .select('value, updated_at')
                .eq('key', 'gcash_qr_config')
                .maybeSingle();

            if (!error && data?.value) {
                const cloudVal = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                const isCustom = Boolean(cloudVal.isCustom || (cloudVal.qrImageUrl && !cloudVal.qrImageUrl.includes('gcash-qr-default.svg')));
                const cloudConfig = {
                    ...this.DEFAULT_CONFIG,
                    ...cloudVal,
                    updatedAt: data.updated_at || cloudVal.updatedAt,
                    isCustom
                };
                try {
                    localStorage.setItem(ZMG_GCASH_QR_STORAGE_KEY, JSON.stringify(cloudConfig));
                } catch (_) {}
                this.syncToZmgConfig(cloudConfig);
                return cloudConfig;
            }
        } catch (e) {
            // Table might not exist yet; gracefully fallback to local
        }
        return current;
    },

    async saveConfig(cfg) {
        const current = this.getConfig();
        const full = {
            ...current,
            ...cfg,
            updatedAt: new Date().toISOString()
        };

        if (full.qrImageUrl && !full.qrImageUrl.includes('gcash-qr-default.svg')) {
            full.isCustom = true;
        }

        // 1. Save locally
        try {
            localStorage.setItem(ZMG_GCASH_QR_STORAGE_KEY, JSON.stringify(full));
        } catch (err) {
            console.warn('LocalStorage save warning:', err);
        }
        this.syncToZmgConfig(full);

        // 2. Dispatch custom event for real-time reactivity across active tabs
        window.dispatchEvent(new CustomEvent('zmg-gcash-qr-updated', { detail: full }));

        // 3. Persist to Supabase system_settings if available
        if (typeof supabaseClient !== 'undefined') {
            try {
                let userId = null;
                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    userId = user?.id || null;
                } catch (_) {}

                await supabaseClient
                    .from('system_settings')
                    .upsert({
                        key: 'gcash_qr_config',
                        value: full,
                        description: 'Active GCash Payment QR Code and merchant details',
                        updated_at: new Date().toISOString(),
                        updated_by: userId
                    });
            } catch (cloudErr) {
                console.warn('Supabase system_settings upsert notice (local saved):', cloudErr.message);
            }
        }
        return full;
    },

    async resetToDefault() {
        const def = {
            ...this.DEFAULT_CONFIG,
            updatedAt: new Date().toISOString(),
            isCustom: false
        };
        return await this.saveConfig(def);
    },

    readAndCompressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.88) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file selected.'));
            if (!file.type || !file.type.startsWith('image/')) {
                return reject(new Error('Please select a valid image file (PNG, JPG, JPEG, WEBP).'));
            }
            if (file.size > 10 * 1024 * 1024) {
                return reject(new Error('Image file is too large. Please select an image under 10MB.'));
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        } else {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    const dataUrl = canvas.toDataURL(outType, quality);
                    resolve({
                        dataUrl,
                        width,
                        height,
                        fileName: file.name,
                        fileSize: file.size
                    });
                };
                img.onerror = () => reject(new Error('Failed to parse image file.'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read image file.'));
            reader.readAsDataURL(file);
        });
    },

    openQrZoomModal(imgSrc, title, subtitle) {
        injectPaymentAndReceiptUI();
        const modal = document.getElementById('zmgGcashQrZoomModal');
        if (!modal) return;
        const imgEl = document.getElementById('zmgGcashZoomModalImg');
        const titleEl = document.getElementById('zmgGcashZoomModalTitle');
        const subEl = document.getElementById('zmgGcashZoomModalSub');
        const cfg = this.getConfig();

        if (imgEl) imgEl.src = imgSrc || cfg.qrImageUrl;
        if (titleEl) titleEl.textContent = title || cfg.merchantName;
        if (subEl) subEl.textContent = subtitle || `GCash Mobile: ${cfg.accountNumber}`;
        modal.classList.add('active');
    }
};

window.zmgGcashQr = zmgGcashQr;
zmgGcashQr.getConfig();
// Background cloud sync
setTimeout(() => { zmgGcashQr.loadConfigFromCloud().catch(() => {}); }, 1500);

const ZMG_LINKED_GCASH_STORAGE_KEY = 'zmg_linked_gcash_account_v1';
const ZMG_SUBSCRIPTIONS_STORAGE_KEY = 'zmg_gcash_subscriptions_v1';
const ZMG_ROLE_OVERRIDE_KEY = 'zmg_account_role_override';

let zmgDetectedDbRole = 'client';

function isCurrentUserStaffOrAdmin() {
    return zmgDetectedDbRole === 'staff' || zmgDetectedDbRole === 'admin';
}

async function detectCurrentUserStaffRole() {
    try {
        localStorage.removeItem(ZMG_ROLE_OVERRIDE_KEY);
    } catch (_) {}
    if (typeof supabaseClient === 'undefined') return false;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const metaRole = String(user.user_metadata?.role || '').toLowerCase();
        const dbRole = String(profile?.role || '').toLowerCase();
        const emailLower = String(user.email || '').toLowerCase();

        if (dbRole === 'staff' || dbRole === 'admin') {
            zmgDetectedDbRole = dbRole;
        } else if (metaRole === 'staff' || metaRole === 'admin') {
            zmgDetectedDbRole = metaRole;
        } else if (emailLower.startsWith('admin') || emailLower.startsWith('staff')) {
            zmgDetectedDbRole = 'staff';
        } else {
            zmgDetectedDbRole = 'client';
        }
        updateRoleTogglePillUI();
        return isCurrentUserStaffOrAdmin();
    } catch (_) {
        return isCurrentUserStaffOrAdmin();
    }
}

function updateRoleTogglePillUI() {
    const isStaff = isCurrentUserStaffOrAdmin();
    const adminSidebarSection = document.getElementById('adminSidebarSection');
    if (adminSidebarSection) {
        adminSidebarSection.style.display = isStaff ? 'block' : 'none';
    }
    const adminPortalMenuItem = document.getElementById('adminPortalMenuItem');
    if (adminPortalMenuItem) {
        adminPortalMenuItem.style.display = isStaff ? 'flex' : 'none';
    }

    // Clean top navigation - ensure no header buttons are present
    ['zmgHeaderOpenPaymentsTabBtn', 'zmgMyResOpenPaymentsTabBtn', 'zmgPlotDetailsOpenPaymentsTabBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    ['gcashSetupMenuItem', 'sidebarPaymentHistory'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = isStaff ? 'none' : 'flex';
    });

    const btn = document.getElementById('zmgAccountRoleToggleBtn');
    if (!btn) return;
    if (isStaff) {
        btn.style.display = 'inline-flex';
        btn.style.background = '#0f172a';
        btn.style.color = '#f8fafc';
        btn.innerHTML = '&#128737;&#65039; Staff / Admin Counter';
    } else {
        btn.style.display = 'none';
    }
}

// Linked GCash account state (server-backed, Xendit tokenized - NO MPIN is ever stored)
const ZMG_GCASH_CACHE_KEY = 'zmg_gcash_link_cache_v2';
let zmgGcashState = { method: null, server_email: false, mode: 'TEST', loaded: false };

try {
    // Remove the old simulated (MPIN-based) link record from earlier versions
    localStorage.removeItem(ZMG_LINKED_GCASH_STORAGE_KEY);
    localStorage.removeItem(ZMG_SUBSCRIPTIONS_STORAGE_KEY);
    const cachedState = JSON.parse(localStorage.getItem(ZMG_GCASH_CACHE_KEY) || 'null');
    if (cachedState && typeof cachedState === 'object') {
        zmgGcashState = { ...zmgGcashState, ...cachedState, loaded: false };
    }
} catch (_) {}

// Call the gcash-api Supabase Edge Function
async function zmgGcashApi(action, payload = {}) {
    if (typeof supabaseClient === 'undefined') throw new Error('Supabase is not loaded.');
    const { data, error } = await supabaseClient.functions.invoke('gcash-api', {
        body: { action, ...payload }
    });
    if (error) {
        let message = error.message || 'GCash service error';
        try {
            const errBody = await error.context.json();
            message = errBody?.error || message;
        } catch (_) {}
        throw new Error(message);
    }
    return data;
}

// Retrieve linked GCash account (returns null if no ACTIVE GCash link)
function getLinkedGcashAccount() {
    const m = zmgGcashState.method;
    if (!m || m.status !== 'ACTIVE') return null;
    return {
        linked: true,
        id: m.id,
        mobileNumber: m.account_label || 'Linked GCash',
        accountName: m.account_label || 'GCash Wallet',
        autoDebit: m.auto_debit_enabled !== false,
        status: m.status
    };
}

function saveLinkedGcashAccount(state) {
    zmgGcashState = { ...zmgGcashState, ...state };
    try {
        localStorage.setItem(ZMG_GCASH_CACHE_KEY, JSON.stringify({
            method: zmgGcashState.method,
            server_email: zmgGcashState.server_email,
            mode: zmgGcashState.mode
        }));
    } catch (_) {}
}

async function refreshGcashLinkStatus() {
    try {
        const data = await zmgGcashApi('status');
        saveLinkedGcashAccount({
            method: data?.method || null,
            server_email: Boolean(data?.server_email),
            mode: data?.mode || 'TEST',
            loaded: true
        });
    } catch (err) {
        console.warn('GCash status check failed:', err.message);
        zmgGcashState.loaded = true;
    }
    if (typeof updateTabStatusBadge === 'function') updateTabStatusBadge();
    if (typeof renderReservationChecksPanel === 'function') renderReservationChecksPanel();
    return getLinkedGcashAccount();
}

// Start Google Play-style linking: redirect to GCash to approve auto-debit ONCE
async function startGcashLinking(autoDebit = true) {
    const data = await zmgGcashApi('link', {
        return_url: window.location.origin + window.location.pathname,
        auto_debit: autoDebit
    });
    if (data?.already_linked) {
        await refreshGcashLinkStatus();
        return;
    }
    if (zmgCameFromBookingModal) {
        try { sessionStorage.setItem('zmg_return_to_booking', '1'); } catch (_) {}
    }
    if (data?.auth_url) {
        window.location.href = data.auth_url;
    } else {
        await refreshGcashLinkStatus();
    }
}

async function unlinkGcashAccount() {
    await zmgGcashApi('unlink');
    saveLinkedGcashAccount({ method: null });
    await refreshGcashLinkStatus();
}

// Poll a GCash charge until it succeeds / fails (webhook or direct sync)
async function zmgWaitForGcashPayment(reference, attempts = 12, delayMs = 2500) {
    let last = { status: 'PENDING', reference };
    for (let i = 0; i < attempts; i++) {
        try {
            last = await zmgGcashApi('sync_payment', { reference });
            if (last.status === 'SUCCEEDED' || last.status === 'FAILED') return last;
        } catch (err) {
            console.warn('Payment sync warning:', err.message);
        }
        await new Promise(r => setTimeout(r, delayMs));
    }
    return last;
}

// Run a charge action and wait for its final result
async function zmgRunGcashCharge(action, payload) {
    const started = await zmgGcashApi(action, payload);
    if (started.action_url) {
        // Rare: GCash asks the user to re-confirm. Open it in a new tab and keep polling.
        window.open(started.action_url, '_blank', 'noopener');
    }
    if (started.status === 'SUCCEEDED' || started.status === 'FAILED') {
        return { ...started, server_email: started.server_email };
    }
    const final = await zmgWaitForGcashPayment(started.reference);
    return { ...started, ...final };
}

// Charge the down payment (installment) or full price for a newly created reservation
async function zmgPayReservationWithGcash(reservationId) {
    try {
        return await zmgRunGcashCharge('charge_initial', { reservation_id: reservationId });
    } catch (err) {
        return { status: 'FAILED', failure: err.message, reference: '', server_email: zmgGcashState.server_email };
    }
}

// Handle the redirect back from GCash after linking
async function handleGcashReturnFromRedirect() {
    const params = new URLSearchParams(window.location.search);
    const linkResult = params.get('gcash_link');
    if (!linkResult) {
        refreshGcashLinkStatus();
        return;
    }

    params.delete('gcash_link');
    const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '') + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    let acct = null;
    if (linkResult === 'success') {
        for (let i = 0; i < 6 && !acct; i++) {
            acct = await refreshGcashLinkStatus();
            if (!acct) await new Promise(r => setTimeout(r, 2000));
        }
    } else {
        await refreshGcashLinkStatus();
    }

    openGcashPaymentsFullPage(false);
    if (acct) {
        alert('GCash linked successfully! Your due payments will now be deducted automatically on each due date.');
    } else if (linkResult === 'success') {
        alert('GCash approval received. Linking is still being confirmed — refresh this page in a few seconds.');
    } else {
        alert('GCash linking was cancelled or failed. No money was deducted. You can try again anytime.');
    }

    try {
        if (acct && sessionStorage.getItem('zmg_return_to_booking') === '1') {
            sessionStorage.removeItem('zmg_return_to_booking');
            alert('Please reopen your plot reservation to continue — GCash is now selected and linked.');
        }
    } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(handleGcashReturnFromRedirect, 1200);
});

// Initialize EmailJS when loaded
function initEmailJSService() {
    if (typeof emailjs !== 'undefined' &&
        ZMG_PAYMENT_CONFIG.emailjs.PUBLIC_KEY &&
        ZMG_PAYMENT_CONFIG.emailjs.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        try {
            emailjs.init({
                publicKey: ZMG_PAYMENT_CONFIG.emailjs.PUBLIC_KEY
            });
        } catch (err) {
            console.warn('EmailJS init warning:', err);
        }
    }
}

// Inject Professional Font, Larger Booking Form Styles, Separate GCash Setup Tab & Receipt Modal
function injectPaymentAndReceiptUI() {
    // Load Plus Jakarta Sans & Inter fonts for clean, professional readability
    if (!document.getElementById('zmgProfessionalFontLink')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'zmgProfessionalFontLink';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';
        document.head.appendChild(fontLink);
    }

    if (!document.getElementById('zmgPaymentReceiptStyles')) {
        const style = document.createElement('style');
        style.id = 'zmgPaymentReceiptStyles';
        style.textContent = `
            /* Balanced, Clean & Readable Booking Form (Fits Viewport Comfortably) */
            #reservationBookingModal,
            #reservationBookingModal * {
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                -webkit-font-smoothing: antialiased;
            }

            #reservationBookingModal {
                padding: 24px 16px !important;
                box-sizing: border-box !important;
            }

            #reservationBookingModal .booking-modal-card {
                max-width: 700px !important;
                width: 92% !important;
                max-height: 86vh !important;
                display: flex !important;
                flex-direction: column !important;
                border-radius: 16px !important;
                box-shadow: 0 22px 50px rgba(15, 23, 42, 0.38) !important;
            }

            #reservationBookingModal #plotReservationForm {
                display: flex !important;
                flex-direction: column !important;
                flex: 1 1 auto !important;
                min-height: 0 !important;
                overflow: hidden !important;
            }

            #reservationBookingModal .booking-modal-header {
                padding: 16px 24px !important;
                flex-shrink: 0 !important;
            }

            #reservationBookingModal .booking-modal-header h2 {
                font-size: 1.3rem !important;
                font-weight: 800 !important;
                letter-spacing: -0.01em !important;
            }

            #reservationBookingModal .booking-subtitle {
                font-size: 0.84rem !important;
                font-weight: 500 !important;
            }

            #reservationBookingModal .booking-form-body {
                padding: 18px 24px !important;
                max-height: 58vh !important;
                overflow-y: auto !important;
                flex: 1 1 auto !important;
            }

            #reservationBookingModal .chosen-plot-banner {
                padding: 14px 18px !important;
                border-radius: 12px !important;
                margin-bottom: 16px !important;
            }

            #reservationBookingModal .chosen-plot-info h3 {
                font-size: 1.3rem !important;
                font-weight: 800 !important;
            }

            #reservationBookingModal .chosen-plot-info p {
                font-size: 0.86rem !important;
                font-weight: 500 !important;
                color: #334155 !important;
            }

            #reservationBookingModal .chosen-plot-price h3 {
                font-size: 1.35rem !important;
                font-weight: 800 !important;
            }

            #reservationBookingModal .form-section {
                margin-bottom: 14px !important;
            }

            #reservationBookingModal .section-label {
                font-size: 0.9rem !important;
                font-weight: 700 !important;
                color: #0f172a !important;
                margin-bottom: 6px !important;
            }

            #reservationBookingModal .radio-card {
                padding: 11px 14px !important;
                border-radius: 10px !important;
                border-width: 1.5px !important;
            }

            #reservationBookingModal .radio-content strong {
                font-size: 0.92rem !important;
                font-weight: 700 !important;
                color: #0f172a !important;
                margin-bottom: 2px !important;
            }

            #reservationBookingModal .radio-content span {
                font-size: 0.8rem !important;
                color: #475569 !important;
                line-height: 1.35 !important;
            }

            #reservationBookingModal .amortization-panel {
                padding: 14px 16px !important;
                border-radius: 10px !important;
                margin-bottom: 14px !important;
            }

            #reservationBookingModal .amort-field label {
                font-size: 0.82rem !important;
                font-weight: 700 !important;
                color: #1e293b !important;
                margin-bottom: 5px !important;
            }

            #reservationBookingModal .form-select,
            #reservationBookingModal .form-input,
            #reservationBookingModal .form-textarea {
                padding: 9px 12px !important;
                font-size: 0.9rem !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
                color: #0f172a !important;
            }

            #reservationBookingModal .calc-row {
                font-size: 0.88rem !important;
                padding: 2px 0 !important;
            }

            #reservationBookingModal .monthly-figure {
                font-size: 1.02rem !important;
                font-weight: 800 !important;
            }

            #reservationBookingModal .channel-pill {
                padding: 8px 16px !important;
                font-size: 0.88rem !important;
                font-weight: 700 !important;
                border-radius: 10px !important;
            }

            #reservationBookingModal .booking-modal-footer {
                padding: 14px 24px !important;
                flex-shrink: 0 !important;
            }

            #reservationBookingModal .btn-cancel-booking,
            #reservationBookingModal .btn-submit-booking {
                padding: 10px 20px !important;
                font-size: 0.92rem !important;
                font-weight: 700 !important;
                border-radius: 8px !important;
            }

            /* Full-Screen Payments & GCash Setup Page (Matches My Reservation Full Page) */
            .zmg-payments-fullpage {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background-color: #f5f1e8;
                background-image: url('assets/images/backgrounds/Background.png');
                background-size: cover;
                background-position: center;
                background-attachment: fixed;
                background-repeat: no-repeat;
                z-index: 3550;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            .zmg-payments-fullpage.active {
                display: block;
            }

            .zmg-payments-page-header {
                background-color: #f5f1e8;
                padding: 8px 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #2d4a36;
                position: sticky;
                top: 0;
                z-index: 3600;
            }

            .zmg-payments-page-logo img {
                height: 52px;
                width: auto;
                display: block;
                cursor: pointer;
            }

            .zmg-payments-header-actions {
                display: flex;
                gap: 16px;
                align-items: center;
            }

            .zmg-payments-menu-btn {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                width: 38px;
                height: 38px;
                padding: 8px;
                transition: background 0.15s ease, border-color 0.15s ease;
            }

            .zmg-payments-menu-btn:hover {
                background: #e2e8f0;
                border-color: #94a3b8;
            }

            .zmg-payments-menu-btn span {
                width: 100%;
                height: 2px;
                background-color: #1e293b;
                display: block;
            }

            .zmg-payments-user-btn {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                width: 38px;
                height: 38px;
                cursor: pointer;
                padding: 2px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.15s ease;
            }

            .zmg-payments-user-btn:hover {
                border-color: #2d4a36;
            }

            .zmg-payments-user-btn img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 2px;
            }

            .zmg-top-page-tabs {
                display: none !important;
            }

            .zmg-payments-main-container {
                max-width: 1280px;
                margin: 0 auto;
                padding: 38px 48px 70px 48px;
            }

            @media (max-width: 768px) {
                .zmg-payments-main-container {
                    padding: 24px 18px 50px 18px;
                }
                .zmg-top-page-tabs {
                    display: none;
                }
            }

            .zmg-tab-status-dot {
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.72rem;
                font-weight: 800;
                text-transform: uppercase;
            }

            .zmg-tab-status-dot.linked {
                background: #dcfce7;
                color: #15803d;
            }

            .zmg-tab-status-dot.unlinked {
                background: #fef3c7;
                color: #b45309;
            }

            /* Clean Checks Box in Reservation Form */
            .zmg-checks-only-box {
                margin-top: 10px;
                padding: 13px 16px;
                border-radius: 10px;
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .zmg-check-row {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                cursor: pointer;
                font-size: 0.88rem;
                color: #1e293b;
                line-height: 1.38;
            }

            .zmg-check-row input[type="checkbox"] {
                width: 17px;
                height: 17px;
                margin-top: 2px;
                accent-color: #3f593f;
                cursor: pointer;
                flex-shrink: 0;
            }

            .zmg-check-row strong {
                display: block;
                font-size: 0.9rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 1px;
            }

            .zmg-check-row span {
                font-size: 0.8rem;
                color: #475569;
            }

            .zmg-gcash-status-strip {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 9px 12px;
                border-radius: 8px;
                font-size: 0.84rem;
                font-weight: 600;
                flex-wrap: wrap;
                gap: 8px;
            }

            .zmg-gcash-status-strip.linked {
                background: #eff6ff;
                border: 1.5px solid #93c5fd;
                color: #1e3a8a;
            }

            .zmg-gcash-status-strip.unlinked {
                background: #fffbeb;
                border: 1.5px solid #fcd34d;
                color: #92400e;
            }

            .zmg-btn-goto-setup {
                background: #0057ff;
                color: #ffffff;
                border: none;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                transition: background 0.2s;
            }

            .zmg-btn-goto-setup:hover {
                background: #0041c2;
            }

            /* Separate GCash Setup Tab View */
            .zmg-gcash-setup-view {
                display: none;
                padding: 30px 36px;
                max-height: 74vh;
                overflow-y: auto;
            }

            .zmg-gcash-setup-view.active {
                display: block;
            }

            .zmg-gcash-setup-banner {
                background: linear-gradient(135deg, #0057ff 0%, #0039a6 100%);
                color: #ffffff;
                padding: 22px 26px;
                border-radius: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 16px;
            }

            .zmg-gcash-setup-grid {
                display: grid;
                grid-template-columns: 1.3fr 1fr;
                gap: 24px;
                align-items: start;
            }

            @media (max-width: 768px) {
                .zmg-gcash-setup-grid {
                    grid-template-columns: 1fr;
                }
            }

            .zmg-setup-field {
                margin-bottom: 16px;
            }

            .zmg-setup-field label {
                display: block;
                font-size: 0.94rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 6px;
            }

            .zmg-setup-field input {
                width: 100%;
                padding: 13px 16px;
                border: 1.5px solid #cbd5e1;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 600;
                color: #0f172a;
                box-sizing: border-box;
            }

            .zmg-setup-field input:focus {
                border-color: #0057ff;
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 87, 255, 0.12);
            }

            .zmg-tag-badge {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 999px;
                font-size: 0.78rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            .zmg-tag-paid {
                background: #16a34a;
                color: #ffffff;
            }
            .zmg-tag-unpaid {
                background: #dc2626;
                color: #ffffff;
            }

            /* Official Receipt Modal */
            .zmg-receipt-modal-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(5px);
                z-index: 9500;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
                font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
            }
            .zmg-receipt-modal-overlay.active {
                display: flex;
            }
            .zmg-receipt-card {
                background: #ffffff;
                width: 100%;
                max-width: 640px;
                border-radius: 18px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                overflow: hidden;
                animation: modalBounceIn 0.25s ease-out;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
            }
            .zmg-receipt-header {
                background: linear-gradient(135deg, #2e472e 0%, #1e311e 100%);
                color: #ffffff;
                padding: 20px 28px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zmg-receipt-body {
                padding: 24px 28px;
                overflow-y: auto;
            }
            .zmg-receipt-status-banner {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-radius: 12px;
                margin-bottom: 18px;
            }
            .zmg-receipt-status-banner.paid {
                background: #dcfce7;
                border: 1.5px solid #22c55e;
                color: #14532d;
            }
            .zmg-receipt-status-banner.unpaid {
                background: #fee2e2;
                border: 1.5px solid #ef4444;
                color: #7f1d1d;
            }
            .zmg-receipt-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 18px;
                font-size: 0.94rem;
            }
            .zmg-receipt-table td {
                padding: 9px 4px;
                border-bottom: 1px dashed #e2e8f0;
            }
            .zmg-receipt-table td:first-child {
                color: #64748b;
                font-weight: 600;
            }
            .zmg-receipt-table td:last-child {
                text-align: right;
                font-weight: 700;
                color: #0f172a;
            }
            .zmg-counter-callout {
                background: #f8fafc;
                border: 2px dashed #3f593f;
                border-radius: 12px;
                padding: 16px 18px;
                margin-bottom: 14px;
            }
            .zmg-counter-callout h4 {
                margin: 0 0 6px 0;
                color: #2e472e;
                font-size: 1rem;
            }
            .zmg-counter-callout p {
                margin: 0;
                font-size: 0.92rem;
                color: #334155;
                line-height: 1.5;
            }
            .zmg-receipt-footer {
                padding: 16px 28px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                flex-wrap: wrap;
            }
            .zmg-btn-receipt {
                padding: 11px 20px;
                border-radius: 10px;
                font-size: 0.94rem;
                font-weight: 700;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
            }
            .zmg-btn-receipt.primary {
                background: #3f593f;
                color: #ffffff;
            }
            .zmg-btn-receipt.secondary {
                background: #e2e8f0;
                color: #1e293b;
            }
        `;
        document.head.appendChild(style);
    }

    // Inject Receipt Modal into body if not present
    if (!document.getElementById('zmgOfficialReceiptModal')) {
        const modal = document.createElement('div');
        modal.id = 'zmgOfficialReceiptModal';
        modal.className = 'zmg-receipt-modal-overlay';
        modal.innerHTML = `
            <div class="zmg-receipt-card" role="dialog" aria-modal="true">
                <div class="zmg-receipt-header">
                    <div>
                        <h3 style="margin:0; font-size:1.25rem; font-weight:800;">Zion Memorial Garden - Official Receipt</h3>
                        <span id="zmgReceiptEmailNotice" style="font-size:0.84rem; opacity:0.9;">PDF saved &amp; emailed</span>
                    </div>
                    <button type="button" id="zmgCloseReceiptModalBtn" style="background:transparent;border:none;color:#fff;font-size:1.8rem;cursor:pointer;">&times;</button>
                </div>
                <div class="zmg-receipt-body">
                    <div id="zmgReceiptStatusBanner" class="zmg-receipt-status-banner paid">
                        <div>
                            <div style="font-size:0.78rem; font-weight:700; text-transform:uppercase;">Receipt Payment Status</div>
                            <div id="zmgReceiptStatusTitle" style="font-size:1.18rem; font-weight:800;">PAID VIA GCASH</div>
                        </div>
                        <span id="zmgReceiptTagBadge" class="zmg-tag-badge zmg-tag-paid">PAID</span>
                    </div>

                    <table class="zmg-receipt-table">
                        <tr><td>Reservation Reference</td><td id="zmgRecResNum">-</td></tr>
                        <tr><td>Receipt / Payment Ref</td><td id="zmgRecPayRef">-</td></tr>
                        <tr><td>Date Issued</td><td id="zmgRecDate">-</td></tr>
                        <tr><td>Client Name &amp; Email</td><td id="zmgRecClient">-</td></tr>
                        <tr><td>Memorial Space / Plot</td><td id="zmgRecPlot">-</td></tr>
                        <tr><td>Plan &amp; Payment Option</td><td id="zmgRecPlan">-</td></tr>
                        <tr><td>Payment Channel</td><td id="zmgRecChannel">-</td></tr>
                        <tr><td>Total Contract Price</td><td id="zmgRecTotal">-</td></tr>
                        <tr><td id="zmgRecAmountLabel">Amount Paid Now</td><td id="zmgRecAmount" style="color:#15803d;font-size:1.05rem;">-</td></tr>
                        <tr><td>Remaining Balance</td><td id="zmgRecBalance">-</td></tr>
                    </table>

                    <div class="zmg-counter-callout">
                        <h4>&#128203; Counter Verification Instructions</h4>
                        <p id="zmgRecCounterInstructions">
                            Please present this receipt (digital PDF or printed copy) once your name or queue number is called onto the counter at Zion Memorial Garden.
                        </p>
                    </div>
                </div>
                <div class="zmg-receipt-footer">
                    <button type="button" class="zmg-btn-receipt secondary" id="zmgDownloadPdfAgainBtn">&#128196; Download PDF Receipt</button>
                    <button type="button" class="zmg-btn-receipt primary" id="zmgDoneReceiptBtn">Done</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeReceipt = () => modal.classList.remove('active');
        document.getElementById('zmgCloseReceiptModalBtn')?.addEventListener('click', closeReceipt);
        document.getElementById('zmgDoneReceiptBtn')?.addEventListener('click', closeReceipt);
    }

    // Inject Bank Payment Modal (Test Mode Simulator)
    if (!document.getElementById('zmgBankPaymentModal')) {
        const bankModal = document.createElement('div');
        bankModal.id = 'zmgBankPaymentModal';
        bankModal.className = 'zmg-receipt-modal-overlay';
        bankModal.innerHTML = `
            <div class="zmg-receipt-card" style="max-width: 540px;" role="dialog" aria-modal="true">
                <div class="zmg-receipt-header" style="background: linear-gradient(135deg, #065f46 0%, #047857 100%);">
                    <div>
                        <h3 style="margin:0; font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:8px;">
                            &#127974; Bank Payment Simulator <span style="font-size:0.7rem; background:#10b981; color:#fff; padding:2px 8px; border-radius:999px;">TEST MODE</span>
                        </h3>
                        <span style="font-size:0.84rem; opacity:0.9;">Direct Online Banking &amp; Bank Transfer</span>
                    </div>
                    <button type="button" id="zmgCloseBankModalBtn" style="background:transparent;border:none;color:#fff;font-size:1.8rem;cursor:pointer;">&times;</button>
                </div>
                <div class="zmg-receipt-body">
                    <!-- Payment Target Info -->
                    <div style="padding: 12px 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; margin-bottom: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span id="zmgBpmPurpose" style="font-size:0.84rem; font-weight:700; color:#166534; text-transform:uppercase;">Monthly Installment</span>
                            <strong id="zmgBpmAmount" style="font-size:1.25rem; color:#15803d;">₱ 0.00</strong>
                        </div>
                        <div id="zmgBpmPlotInfo" style="font-size:0.85rem; color:#374151; margin-top:4px;">Plot SPB54 • Area 2</div>
                    </div>

                    <!-- Bank Selection -->
                    <div class="zmg-setup-field" style="margin-bottom: 12px;">
                        <label for="zmgBpmBankSelect" style="font-weight: 700; color: #0f172a;">Select Bank Account *</label>
                        <select id="zmgBpmBankSelect" class="form-select" style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 9px 12px; font-weight: 600; width: 100%;">
                            ${ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS.map(b => `<option value="${b.id}" data-code="${b.code}" data-acc="${b.accountNo}" data-branch="${b.branch}" data-type="${b.type}">${b.name}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Account Details Box -->
                    <div id="zmgBpmAccountBox" style="padding: 12px 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 14px; font-size: 0.86rem; color: #334155;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-weight:700; color:#0f172a;">Beneficiary: ${ZMG_PAYMENT_CONFIG.bank.BENEFICIARY_NAME}</span>
                            <button type="button" id="zmgBpmCopyBtn" style="background:#e0f2fe; border:1px solid #bae6fd; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer;">&#128203; Copy Acc</button>
                        </div>
                        <div>Account No: <strong id="zmgBpmAccNum" style="font-family:monospace; color:#0369a1; font-size:0.95rem;">${ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS[0].accountNo}</strong></div>
                        <div style="font-size:0.8rem; color:#64748b;" id="zmgBpmBranch">${ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS[0].branch} &bull; ${ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS[0].type}</div>
                    </div>

                    <!-- Test Reference -->
                    <div class="zmg-setup-field" style="margin-bottom: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label for="zmgBpmRefNumber" style="font-weight: 700; color: #0f172a; margin:0;">Generated Test Reference Number</label>
                            <button type="button" id="zmgBpmRegenRefBtn" style="background:transparent; border:none; color:#0284c7; font-size:0.78rem; font-weight:700; cursor:pointer;">&#8635; Regenerate</button>
                        </div>
                        <input type="text" id="zmgBpmRefNumber" readonly style="background: #f1f5f9; font-family: monospace; font-weight: 700; color: #0369a1; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; width: 100%;">
                    </div>

                    <div style="padding: 10px 12px; background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 8px; font-size: 0.82rem; color: #1e40af; margin-bottom: 14px; line-height: 1.45;">
                        &#129514; <strong>Sandbox Simulation:</strong> No actual money is debited from your bank account. Authorizing this payment will mark the installment/balance as PAID in the database, update your ledger, and issue an official PAID receipt.
                    </div>
                </div>
                <div class="zmg-receipt-footer" style="display:flex; gap:10px;">
                    <button type="button" class="zmg-btn-receipt secondary" id="zmgCancelBankModalBtn">Cancel</button>
                    <button type="button" class="zmg-btn-receipt primary" id="zmgAuthorizeBankModalBtn" style="background: #047857; color: #ffffff;">Authorize &amp; Pay (Test Mode)</button>
                </div>
            </div>
        `;
        document.body.appendChild(bankModal);

        const closeBankModal = () => bankModal.classList.remove('active');
        document.getElementById('zmgCloseBankModalBtn')?.addEventListener('click', closeBankModal);
        document.getElementById('zmgCancelBankModalBtn')?.addEventListener('click', closeBankModal);

        const bSelect = document.getElementById('zmgBpmBankSelect');
        const bAcc = document.getElementById('zmgBpmAccNum');
        const bBranch = document.getElementById('zmgBpmBranch');
        const bRef = document.getElementById('zmgBpmRefNumber');
        const bCopy = document.getElementById('zmgBpmCopyBtn');
        const bRegen = document.getElementById('zmgBpmRegenRefBtn');

        const updateBpmInfo = () => {
            const opt = bSelect?.options[bSelect.selectedIndex];
            if (!opt) return;
            const code = opt.getAttribute('data-code') || 'BNK';
            const acc = opt.getAttribute('data-acc') || '';
            const branch = opt.getAttribute('data-branch') || '';
            const type = opt.getAttribute('data-type') || '';
            if (bAcc) bAcc.textContent = acc;
            if (bBranch) bBranch.textContent = `${branch} • ${type}`;
            if (bRef) bRef.value = 'BNK-TEST-' + code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        };

    }

    // Inject GCash QR Zoom / Lightbox Modal
    if (!document.getElementById('zmgGcashQrZoomModal')) {
        const zoomModal = document.createElement('div');
        zoomModal.id = 'zmgGcashQrZoomModal';
        zoomModal.className = 'zmg-receipt-modal-overlay';
        zoomModal.innerHTML = `
            <div class="zmg-receipt-card" style="max-width: 440px;" role="dialog" aria-modal="true">
                <div class="zmg-receipt-header" style="background: linear-gradient(135deg, #0057ff 0%, #003bb5 100%);">
                    <div>
                        <h3 id="zmgGcashZoomModalTitle" style="margin:0; font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px;">
                            📱 Official GCash QR Code
                        </h3>
                        <span id="zmgGcashZoomModalSub" style="font-size:0.84rem; opacity:0.9;">Scan to Pay</span>
                    </div>
                    <button type="button" id="zmgCloseGcashZoomModalBtn" style="background:transparent;border:none;color:#fff;font-size:1.8rem;cursor:pointer;">&times;</button>
                </div>
                <div class="zmg-receipt-body" style="text-align: center; padding: 20px;">
                    <div style="background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; padding: 12px; display: inline-block; box-shadow: 0 4px 20px rgba(0,87,255,0.12); margin-bottom: 14px;">
                        <img id="zmgGcashZoomModalImg" src="assets/images/gcash-qr-default.svg" alt="GCash QR Code" style="max-width: 280px; width: 100%; height: auto; border-radius: 8px;">
                    </div>
                    <p style="margin: 0; font-size: 0.88rem; color: #475569; font-weight: 500;">
                        Open your GCash app &rarr; Tap <strong>Scan QR</strong> &rarr; Point camera at this screen.
                    </p>
                </div>
                <div class="zmg-receipt-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <button type="button" class="zmg-btn-receipt secondary" id="zmgGcashZoomDownloadBtn">&#11015;&#65039; Download QR Image</button>
                    <button type="button" class="zmg-btn-receipt primary" id="zmgCloseGcashZoomDoneBtn" style="background: #0057ff; color: #fff;">Done</button>
                </div>
            </div>
        `;
        document.body.appendChild(zoomModal);

        const closeZoom = () => zoomModal.classList.remove('active');
        document.getElementById('zmgCloseGcashZoomModalBtn')?.addEventListener('click', closeZoom);
        document.getElementById('zmgCloseGcashZoomDoneBtn')?.addEventListener('click', closeZoom);
        document.getElementById('zmgGcashZoomDownloadBtn')?.addEventListener('click', () => {
            const img = document.getElementById('zmgGcashZoomModalImg');
            if (!img || !img.src) return;
            const a = document.createElement('a');
            a.href = img.src;
            a.download = 'zion-memorial-gcash-qr.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // Inject Installment / Balance GCash QR Payment Modal
    if (!document.getElementById('zmgGcashQrPaymentModal')) {
        const qrPayModal = document.createElement('div');
        qrPayModal.id = 'zmgGcashQrPaymentModal';
        qrPayModal.className = 'zmg-receipt-modal-overlay';
        qrPayModal.innerHTML = `
            <div class="zmg-receipt-card" style="max-width: 520px;" role="dialog" aria-modal="true">
                <div class="zmg-receipt-header" style="background: linear-gradient(135deg, #0057ff 0%, #003bb5 100%);">
                    <div>
                        <h3 style="margin:0; font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:8px;">
                            📱 Pay via GCash QR Code
                        </h3>
                        <span style="font-size:0.84rem; opacity:0.9;">Instant E-Wallet Settlement</span>
                    </div>
                    <button type="button" id="zmgCloseGcashQrPayModalBtn" style="background:transparent;border:none;color:#fff;font-size:1.8rem;cursor:pointer;">&times;</button>
                </div>
                <div class="zmg-receipt-body">
                    <!-- Payment Target Details -->
                    <div style="padding: 12px 14px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; margin-bottom: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span id="zmgQpmPurpose" style="font-size:0.82rem; font-weight:700; color:#1e40af; text-transform:uppercase;">Monthly Installment</span>
                            <strong id="zmgQpmAmount" style="font-size:1.3rem; color:#0057ff;">₱ 0.00</strong>
                        </div>
                        <div id="zmgQpmPlotInfo" style="font-size:0.85rem; color:#374151; margin-top:4px;">Plot SPB54 • Area 2</div>
                    </div>

                    <!-- QR Display Box -->
                    <div style="display: grid; grid-template-columns: 120px 1fr; gap: 14px; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; margin-bottom: 14px;">
                        <div style="text-align: center;">
                            <img id="zmgQpmQrImg" src="assets/images/gcash-qr-default.svg" alt="GCash QR" style="width: 110px; height: 135px; object-fit: contain; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px; cursor: pointer;" title="Click to enlarge">
                            <span style="display: block; font-size: 0.68rem; color: #0057ff; font-weight: 700; margin-top: 2px;">🔍 Tap to Enlarge</span>
                        </div>
                        <div>
                            <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #0057ff;">Official GCash Merchant</div>
                            <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;" id="zmgQpmMerchantName">Zion Memorial Garden Inc.</div>
                            <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0 6px 0;">
                                <span style="font-family: monospace; font-size: 0.92rem; font-weight: 700; color: #0057ff;" id="zmgQpmAccNum">0945 187 6774</span>
                                <button type="button" id="zmgQpmCopyBtn" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 700; background: #e0e7ff; color: #0057ff; border: 1px solid #bfdbfe; border-radius: 4px; cursor: pointer;">📋 Copy</button>
                            </div>
                            <div style="font-size: 0.78rem; color: #475569; line-height: 1.4;">
                                Scan QR code with your GCash app and send exact amount.
                            </div>
                        </div>
                    </div>

                    <!-- Reference Number Input -->
                    <div class="zmg-setup-field" style="margin-bottom: 12px;">
                        <label for="zmgQpmRefNumber" style="font-weight: 700; color: #0f172a; font-size: 0.85rem;">
                            GCash Transaction Reference Number <span style="color: #dc2626;">*</span>
                        </label>
                        <input type="text" id="zmgQpmRefNumber" placeholder="e.g. 1002 9845 2819" style="width: 100%; font-family: monospace; font-weight: 700; color: #0057ff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 9px 12px; background: #fff;">
                    </div>

                    <!-- Proof Screenshot Upload -->
                    <div class="zmg-setup-field" style="margin-bottom: 12px;">
                        <label for="zmgQpmProofInput" style="font-weight: 700; color: #0f172a; font-size: 0.85rem;">
                            Attach GCash Payment Screenshot (Optional)
                        </label>
                        <input type="file" id="zmgQpmProofInput" accept="image/*" class="form-input" style="width: 100%; font-size: 0.82rem; padding: 6px 8px; background: #fff;">
                        <div id="zmgQpmProofPreviewBox" style="display: none; margin-top: 6px; align-items: center; gap: 8px;">
                            <img id="zmgQpmProofThumb" src="" alt="Proof" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">
                            <span id="zmgQpmProofFileName" style="font-size: 0.8rem; color: #065f46; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                            <button type="button" id="zmgQpmRemoveProofBtn" style="background: transparent; border: none; color: #dc2626; font-size: 0.78rem; font-weight: 700; cursor: pointer;">Remove</button>
                        </div>
                    </div>

                    <div style="padding: 10px 12px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; font-size: 0.82rem; color: #065f46; line-height: 1.45;">
                        &#10003; <strong>Official Verification:</strong> Submitting will record your payment with reference number, mark the installment as PAID in your ledger, and issue an official PAID PDF receipt.
                    </div>
                </div>
                <div class="zmg-receipt-footer" style="display:flex; gap:10px;">
                    <button type="button" class="zmg-btn-receipt secondary" id="zmgQpmCancelBtn">Cancel</button>
                    <button type="button" class="zmg-btn-receipt primary" id="zmgQpmSubmitBtn" style="background: #0057ff; color: #ffffff;">Confirm GCash Payment</button>
                </div>
            </div>
        `;
        document.body.appendChild(qrPayModal);

        const closeQrPayModal = () => qrPayModal.classList.remove('active');
        document.getElementById('zmgCloseGcashQrPayModalBtn')?.addEventListener('click', closeQrPayModal);
        document.getElementById('zmgQpmCancelBtn')?.addEventListener('click', closeQrPayModal);

        document.getElementById('zmgQpmCopyBtn')?.addEventListener('click', () => {
            const num = document.getElementById('zmgQpmAccNum')?.textContent || '0945 187 6774';
            navigator.clipboard?.writeText(num.replace(/[^0-9]/g, ''))
                .then(() => {
                    const btn = document.getElementById('zmgQpmCopyBtn');
                    if (btn) {
                        btn.textContent = '✓ Copied!';
                        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
                    }
                })
                .catch(() => alert('GCash Mobile: ' + num));
        });

        document.getElementById('zmgQpmQrImg')?.addEventListener('click', () => {
            const cfg = zmgGcashQr.getConfig();
            zmgGcashQr.openQrZoomModal(cfg.qrImageUrl, cfg.merchantName, cfg.accountNumber);
        });

        document.getElementById('zmgQpmRemoveProofBtn')?.addEventListener('click', () => {
            const input = document.getElementById('zmgQpmProofInput');
            if (input) input.value = '';
            const box = document.getElementById('zmgQpmProofPreviewBox');
            if (box) box.style.display = 'none';
        });
    }

    // Inject the Full-Screen Payments & GCash Setup Page (NOT a modal)
    if (!document.getElementById('zmgPaymentsFullPage')) {
        const fullPage = document.createElement('div');
        fullPage.id = 'zmgPaymentsFullPage';
        fullPage.className = 'zmg-payments-fullpage';
        fullPage.innerHTML = `
            <header class="zmg-payments-page-header">
                <div class="zmg-payments-page-logo" id="zmgPaymentsHeaderLogo" title="Return to Dashboard">
                    <img src="assets/dashboard/logo half.png" onerror="this.onerror=null;this.src='assets/images/logos/assetslogo.png';" alt="Zion Memorial Garden Logo">
                </div>

                <div class="zmg-payments-header-actions">
                    <button type="button" class="notif-bell-btn" aria-label="Notifications" title="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bell-icon">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span class="notif-badge-count" style="display: none;">0</span>
                    </button>
                    <button type="button" class="zmg-payments-menu-btn" id="zmgPaymentsMenuBtn" title="Toggle Navigation Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <button type="button" class="zmg-payments-user-btn" id="zmgPaymentsUserBtn" title="View Profile">
                        <img src="assets/images/default-avatar.png" alt="User Avatar" id="zmgPaymentsUserAvatar">
                    </button>
                </div>
            </header>

            <main class="zmg-payments-main-container">
                <div id="zmgPaymentsFullPageBody"></div>
            </main>
        `;
        document.body.appendChild(fullPage);

        document.getElementById('zmgPaymentsHeaderLogo')?.addEventListener('click', () => {
            closeGcashPaymentsFullPage(false);
        });
        document.getElementById('zmgPaymentsUserBtn')?.addEventListener('click', () => {
            closeGcashPaymentsFullPage(false);
            const profileModal = document.querySelector('.profile-modal-overlay');
            if (profileModal) profileModal.classList.add('active');
        });
        document.getElementById('zmgPaymentsMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const sidebar = document.getElementById('sidebarMenu') || document.querySelector('.sidebar-menu');
            const overlay = document.getElementById('overlay');
            if (sidebar) {
                sidebar.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    injectTopPageNavigationButtons();
}

let zmgCameFromBookingModal = false;

// Keep top navigation bar clean and consistent - no GCash button injected on top nav
function injectTopPageNavigationButtons() {
    ['zmgHeaderOpenPaymentsTabBtn', 'zmgMyResOpenPaymentsTabBtn', 'zmgPlotDetailsOpenPaymentsTabBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

let zmgActivePaymentsTab = 'payments'; // 'payments' or 'history'

// Open the Full-Screen Payments & GCash Setup Page (routes into unified My Reservations & Payments page)
function openGcashPaymentsFullPage(showRedirectNotice = false, targetTab = 'payments') {
    zmgActivePaymentsTab = targetTab || 'payments';

    const bookingModal = document.getElementById('reservationBookingModal');
    if (bookingModal && bookingModal.classList.contains('active')) {
        zmgCameFromBookingModal = true;
        bookingModal.classList.remove('active');
    } else if (!showRedirectNotice) {
        zmgCameFromBookingModal = false;
    }

    const myResPage = document.getElementById('myReservationPage');
    if (myResPage) {
        if (typeof closeAllSubpages === 'function') closeAllSubpages();
        if (typeof closeReservationModal === 'function') closeReservationModal();
        if (typeof closeProfileModal === 'function') closeProfileModal();
        document.getElementById('sidebarMenu')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
        document.getElementById('zmgPaymentsFullPage')?.classList.remove('active');

        myResPage.classList.add('active');
        if (typeof window.switchMyReservationTab === 'function') {
            window.switchMyReservationTab(zmgActivePaymentsTab === 'history' ? 'history' : 'payments', showRedirectNotice);
        }
        if (typeof window.updateActiveMenuItem === 'function') {
            window.updateActiveMenuItem('myreservation');
        }
        return;
    }

    injectPaymentAndReceiptUI();
    const fullPage = document.getElementById('zmgPaymentsFullPage');

    // Sync avatar from local storage
    const avatarImg = document.getElementById('zmgPaymentsUserAvatar');
    if (avatarImg) {
        const savedPic = localStorage.getItem('userProfilePicture');
        if (savedPic) {
            avatarImg.src = savedPic;
        }
    }

    // Close other dashboard subpages/modals if open
    document.querySelector('.reservation-modal-overlay')?.classList.remove('active');
    document.querySelector('.profile-modal-overlay')?.classList.remove('active');
    document.getElementById('myReservationPage')?.classList.remove('active');
    document.getElementById('deceasedFamilyPage')?.classList.remove('active');
    document.getElementById('sidebarMenu')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');

    if (fullPage) {
        fullPage.classList.add('active');
        renderGcashSetupTabContent(showRedirectNotice, zmgActivePaymentsTab);
    }
}

// Global Mount Helper for Embedding Inside Tabs
window.renderPaymentsInTabMount = function(targetTab = 'payments', showRedirectNotice = false) {
    injectPaymentAndReceiptUI();
    renderGcashSetupTabContent(showRedirectNotice, targetTab, 'paneMyResPaymentsMount');
};

function closeGcashPaymentsFullPage(reopenBookingModal = false) {
    const fullPage = document.getElementById('zmgPaymentsFullPage');
    if (fullPage) {
        fullPage.classList.remove('active');
    }

    if (reopenBookingModal) {
        const bookingModal = document.getElementById('reservationBookingModal');
        if (bookingModal) {
            bookingModal.classList.add('active');
            renderReservationChecksPanel();
        }
    }
    zmgCameFromBookingModal = false;
}

// Backwards-compatible alias
function switchBookingModalTab(tabName, showRedirectNotice = false) {
    if (tabName === 'gcash-setup') {
        openGcashPaymentsFullPage(showRedirectNotice);
    } else {
        closeGcashPaymentsFullPage(true);
    }
}

function updateTabStatusBadge() {
    const dot = document.getElementById('zmgGcashTabStatusBadge');
    if (!dot) return;
    const acct = getLinkedGcashAccount();
    if (acct) {
        dot.className = 'zmg-tab-status-dot linked';
        dot.textContent = 'Linked';
    } else {
        dot.className = 'zmg-tab-status-dot unlinked';
        dot.textContent = 'Setup Required';
    }
}

// Render the Full-Screen Payments & GCash Setup Page Content with Separate Tabs
function renderGcashSetupTabContent(showRedirectNotice = false, targetTab = null, containerId = null) {
    if (targetTab) {
        zmgActivePaymentsTab = targetTab;
    }
    const mount = containerId ? document.getElementById(containerId) : null;
    const setupView = mount || document.getElementById('paneMyResPaymentsMount') || document.getElementById('zmgPaymentsFullPageBody');
    if (!setupView) return;

    const acct = getLinkedGcashAccount();
    const pendingLink = zmgGcashState.method && zmgGcashState.method.status === 'PENDING';
    const isTestMode = zmgGcashState.mode !== 'LIVE';
    const qrConfig = (typeof zmgGcashQr !== 'undefined' ? zmgGcashQr.getConfig() : null) || ZMG_PAYMENT_CONFIG.gcash;

    const isHistory = zmgActivePaymentsTab === 'history';

    setupView.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
            <div>
                <h1 id="zmgPaymentsPageHeaderTitle" style="margin: 0 0 6px 0; font-size: 2.1rem; font-weight: 800; color: #1a1a1a;">
                    ${isHistory ? 'Payment History &amp; Receipts Ledger' : 'Payments, GCash &amp; Bank Settlements'}
                </h1>
                <p id="zmgPaymentsPageHeaderDesc" style="margin: 0; font-size: 1rem; color: #475569; font-weight: 500;">
                    ${isHistory ? 'Track all past transactions, verify payment statuses, and view or download official PDF receipts.' : 'Scan official QR, link your wallet for auto-debit, settle monthly dues, or pay via partner banks.'}
                </p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                ${zmgCameFromBookingModal ? `
                    <button type="button" id="zmgReturnToPlotReservationBtn" style="padding: 10px 20px; background: #2e472e; color: #ffffff; border: none; border-radius: 4px; font-size: 0.92rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(46,71,46,0.25);">
                        &larr; Return to Plot Reservation
                    </button>
                ` : `
                    <button type="button" id="zmgReturnToDashboardBtn" style="padding: 9px 18px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e3a29; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        &larr; Back to Dashboard
                    </button>
                `}
            </div>
        </div>

        <!-- SEPARATE TABS HEADER -->
        <div class="zmg-payments-tab-nav" style="display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; padding-bottom: 2px;">
            <button type="button" id="zmgTabBtnPayments" class="zmg-sub-tab-btn ${!isHistory ? 'active' : ''}" style="padding: 11px 22px; font-size: 0.96rem; font-weight: 800; border: none; border-bottom: 3.5px solid ${!isHistory ? '#2d4a36' : 'transparent'}; background: transparent; color: ${!isHistory ? '#2d4a36' : '#64748b'}; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;">
                <span>💳</span> Payments &amp; Auto-Debit
            </button>
            <button type="button" id="zmgTabBtnHistory" class="zmg-sub-tab-btn ${isHistory ? 'active' : ''}" style="padding: 11px 22px; font-size: 0.96rem; font-weight: 800; border: none; border-bottom: 3.5px solid ${isHistory ? '#2d4a36' : 'transparent'}; background: transparent; color: ${isHistory ? '#2d4a36' : '#64748b'}; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;">
                <span>🕒</span> Payment History &amp; Receipts
            </button>
        </div>

        <!-- ==========================================
             PANE 1: PAYMENTS & AUTO-DEBIT CONTENT
             ========================================== -->
        <div id="zmgTabPanePayments" style="display: ${!isHistory ? 'block' : 'none'};">
            <div id="zmgGcashRedirectNotice" style="display: ${showRedirectNotice ? 'block' : 'none'}; margin-bottom: 22px; padding: 16px 22px; background: #fffbeb; border: 2px solid #f59e0b; border-radius: 14px; color: #92400e; font-size: 1rem; font-weight: 600;">
                &#9888;&#65039; <strong>GCash Link Required:</strong> You selected GCash for your reservation. Link your GCash below (you will approve it inside GCash), or return to your reservation to pay directly via GCash QR.
            </div>

            <!-- 1. OFFICIAL GCASH QR CODE CARD -->
            <div style="background: #ffffff; border: 1.5px solid #93c5fd; border-radius: 16px; padding: 22px 26px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,87,255,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <div style="position: relative; width: 110px; height: 140px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; overflow: hidden; cursor: pointer; text-align: center; box-shadow: 0 4px 12px rgba(15,23,42,0.08);" id="zmgMainPageQrWrapper" title="Click to enlarge GCash QR Code">
                            <img src="${qrConfig.qrImageUrl || 'assets/images/gcash-qr-default.svg'}" alt="Official GCash QR" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,87,255,0.9); color: #fff; font-size: 0.65rem; font-weight: 700; padding: 2px 0;">🔍 Enlarge</div>
                        </div>
                        <div>
                            <span style="font-size: 0.74rem; text-transform: uppercase; font-weight: 800; color: #0057ff; letter-spacing: 0.5px;">Direct QR Settlement</span>
                            <h3 style="margin: 3px 0 4px 0; font-size: 1.32rem; font-weight: 800; color: #0f172a;">Official GCash QR Code (Scan to Pay)</h3>
                            <div style="font-size: 0.92rem; color: #334155; margin-bottom: 4px;">
                                Receiver: <strong>${qrConfig.merchantName || 'Zion Memorial Garden Inc.'}</strong> &bull;
                                GCash Number: <strong style="font-family: monospace; color: #0057ff;">${qrConfig.accountNumber || '0945 187 6774'}</strong>
                                <button type="button" id="zmgMainPageCopyGcashBtn" style="margin-left: 6px; padding: 2px 8px; font-size: 0.72rem; font-weight: 700; background: #e0e7ff; color: #0057ff; border: 1px solid #bfdbfe; border-radius: 4px; cursor: pointer;">📋 Copy</button>
                            </div>
                            <p style="margin: 0; font-size: 0.86rem; color: #64748b; line-height: 1.45;">
                                ${qrConfig.instructions || 'Scan with your GCash mobile app to pay plot reservation or installment dues.'}
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <button type="button" id="zmgMainPageEnlargeQrBtn" style="padding: 9px 16px; background: #eff6ff; color: #0057ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 0.86rem; font-weight: 700; cursor: pointer;">🔍 Enlarge QR</button>
                        <button type="button" id="zmgMainPageDownloadQrBtn" style="padding: 9px 16px; background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.86rem; font-weight: 700; cursor: pointer;">⬇️ Download QR</button>
                    </div>
                </div>
            </div>

            <!-- GCASH AUTO-DEBIT BANNER -->
            <div class="zmg-gcash-setup-banner">
                <div>
                    <span style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.6px; opacity: 0.9;">GCash Auto-Debit (Secured by Xendit)</span>
                    <h3 style="margin: 4px 0 4px 0; font-size: 1.45rem; font-weight: 800;">${acct ? 'Your GCash is Linked' : 'Link Your GCash Account'}</h3>
                    <p style="margin: 0; font-size: 0.92rem; opacity: 0.92;">
                        We never see or store your MPIN. You approve the link inside GCash itself.
                    </p>
                </div>
                <div>
                    <span class="zmg-tag-badge" style="background: ${acct ? '#22c55e' : (pendingLink ? '#3b82f6' : '#f59e0b')}; color: #fff; font-size: 0.85rem; padding: 7px 14px;">
                        ${acct ? '&#10003; Linked' + (acct.mobileNumber && acct.mobileNumber !== 'Linked GCash' ? ': ' + acct.mobileNumber : '') : (pendingLink ? 'Waiting for GCash approval' : 'Not Linked Yet')}
                    </span>
                </div>
            </div>

            <div class="zmg-gcash-setup-grid">
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 26px 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.05);">
                    <h4 style="margin: 0 0 16px 0; font-size: 1.15rem; color: #0f172a; font-weight: 800;">1. GCash Link</h4>

                    ${acct ? `
                        <div class="zmg-checks-only-box" style="margin-bottom: 18px;">
                            <label class="zmg-check-row">
                                <input type="checkbox" id="zmgAutoDebitToggle" ${acct.autoDebit ? 'checked' : ''}>
                                <div>
                                    <strong>Automatic deduction of monthly dues</strong>
                                    <span>On each due date we charge your linked GCash automatically. Turn off to pay manually with "Pay Now".</span>
                                </div>
                            </label>
                        </div>
                        <div style="font-size: 0.9rem; color: #475569; margin-bottom: 18px;">
                            Linked since: <strong>${acct && zmgGcashState.method?.linked_at ? new Date(zmgGcashState.method.linked_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}</strong>
                        </div>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <button type="button" id="zmgRefreshGcashBtn" style="flex: 1; padding: 13px 18px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.92rem; font-weight: 700; cursor: pointer;">&#8635; Refresh</button>
                            <button type="button" id="zmgUnlinkGcashBtn" style="flex: 1; padding: 13px 18px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 10px; font-size: 0.92rem; font-weight: 700; cursor: pointer;">Unlink GCash</button>
                        </div>
                    ` : `
                        <ol style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; font-size: 0.95rem; line-height: 1.7;">
                            <li>Click <strong>Link GCash</strong> below.</li>
                            <li>You are sent to GCash — log in and <strong>approve auto-debit</strong> (OTP/MPIN is entered inside GCash only).</li>
                            <li>You return here automatically. Done — dues are deducted on their due dates.</li>
                        </ol>
                        <div class="zmg-checks-only-box" style="margin-bottom: 18px;">
                            <label class="zmg-check-row">
                                <input type="checkbox" id="zmgLinkAutoDebitCheck" checked>
                                <div>
                                    <strong>Enable automatic deduction of monthly dues</strong>
                                    <span>You can turn this off anytime.</span>
                                </div>
                            </label>
                        </div>
                        <button type="button" id="zmgStartGcashLinkBtn" style="width: 100%; padding: 15px 24px; background: #0057ff; color: #fff; border: none; border-radius: 10px; font-size: 1.02rem; font-weight: 800; cursor: pointer;">
                            &#128279; ${pendingLink ? 'Retry GCash Linking' : 'Link GCash'}
                        </button>
                        ${pendingLink ? `<button type="button" id="zmgRefreshGcashBtn" style="width: 100%; margin-top: 10px; padding: 12px 18px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.92rem; font-weight: 700; cursor: pointer;">&#8635; I already approved — refresh status</button>` : ''}
                    `}
                </div>

                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 26px 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.05);">
                    <h4 style="margin: 0 0 12px 0; font-size: 1.1rem; color: #0f172a; font-weight: 800;">How auto-debit works</h4>
                    <div style="font-size: 0.9rem; color: #334155; line-height: 1.65;">
                        &#9989; <strong>Reservation:</strong> your down payment (installment) or full price is charged right away.<br>
                        &#128197; <strong>3 days before</strong> each due date you get an email reminder.<br>
                        &#9889; <strong>On the due date</strong> the monthly due is deducted automatically (retried up to 3 days if your balance is low).<br>
                        &#129534; A <strong>PAID</strong> receipt is emailed after every successful deduction.
                    </div>
                    <div style="margin-top: 16px; padding: 14px 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.88rem; color: #334155; line-height: 1.5;">
                        <strong>Where does the money go?</strong><br>
                        Payments go to <strong>${ZMG_PAYMENT_CONFIG.gcash.MERCHANT_NAME}</strong>'s merchant account via Xendit (a BSP-licensed payment gateway), then are settled to the company's bank account. Every payment is recorded in your ledger.
                    </div>
                </div>
            </div>

            <!-- 1B. BANK TRANSFER & ONLINE BANKING -->
            <div style="margin-top: 24px; background: #ffffff; border: 1.5px solid #7dd3fc; border-radius: 16px; padding: 24px 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 42px; height: 42px; border-radius: 10px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">&#127974;</div>
                        <div>
                            <h4 style="margin: 0; font-size: 1.22rem; color: #0f172a; font-weight: 800;">Bank Transfer &amp; Online Banking</h4>
                            <span style="font-size: 0.88rem; color: #475569;">Official corporate bank accounts with instant test mode simulation</span>
                        </div>
                    </div>
                    <span style="background: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.5px;">
                        &#129514; TEST MODE ACTIVE
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 16px;">
                    ${ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS.map(b => `
                        <div style="padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <strong style="color: #0f172a; font-size: 0.92rem;">${b.name}</strong>
                                <button type="button" class="zmg-copy-bank-card-btn" data-acc="${b.accountNo}" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; cursor: pointer;">&#128203; Copy</button>
                            </div>
                            <div style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: #0369a1;">${b.accountNo}</div>
                            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">${b.branch} &bull; ${b.type}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="padding: 12px 16px; background: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
                    &#128161; <strong>How Test Bank Payments Work:</strong> Select any reservation in <strong>Dues &amp; Payment Center</strong> below or in <strong>My Reservations</strong> and click <strong>Bank Pay (Test)</strong>. You can simulate direct online banking or bank deposits with valid sandbox reference codes, immediate PAID ledger logging, and official PDF &amp; EmailJS receipt generation.
                </div>
            </div>

            <!-- 2. MONTHLY INSTALLMENT DUES & PAYMENT SECTION -->
            <div style="margin-top: 28px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 26px 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 1.25rem; color: #0f172a; font-weight: 800;">2. Dues &amp; Payment Center</h4>
                        <p style="margin: 0; font-size: 0.92rem; color: #475569;">Upcoming deductions, payment status, and manual "Pay Now" / full balance payoff.</p>
                    </div>
                    <span class="zmg-tag-badge" style="background: ${acct?.autoDebit ? '#ecfdf5' : '#f8fafc'}; color: ${acct?.autoDebit ? '#047857' : '#475569'}; border: 1px solid ${acct?.autoDebit ? '#6ee7b7' : '#cbd5e1'};">
                        ${acct?.autoDebit ? 'Auto-Debit ON' : 'Auto-Debit OFF'}
                    </span>
                </div>
                <div id="zmgGcashMonthlyDuesList" style="min-height: 60px;">
                    <div style="padding: 18px; text-align: center; color: #64748b; font-size: 0.95rem;">Loading your dues...</div>
                </div>
            </div>
        </div>

        <!-- ==========================================
             PANE 2: PAYMENT HISTORY & RECEIPTS CONTENT
             ========================================== -->
        <div id="zmgTabPaneHistory" style="display: ${isHistory ? 'block' : 'none'};">
            <div id="zmgPaymentHistoryContainer">
                <div style="padding: 30px; text-align: center; color: #64748b;">Loading payment history...</div>
            </div>
        </div>
    `;

    // Tab Switcher Functions
    const switchTab = (tabName) => {
        zmgActivePaymentsTab = tabName;
        const btnPayments = document.getElementById('zmgTabBtnPayments');
        const btnHistory = document.getElementById('zmgTabBtnHistory');
        const panePayments = document.getElementById('zmgTabPanePayments');
        const paneHistory = document.getElementById('zmgTabPaneHistory');
        const headerTitle = document.getElementById('zmgPaymentsPageHeaderTitle');
        const headerDesc = document.getElementById('zmgPaymentsPageHeaderDesc');

        if (tabName === 'history') {
            if (btnPayments) {
                btnPayments.style.color = '#64748b';
                btnPayments.style.borderBottomColor = 'transparent';
                btnPayments.classList.remove('active');
            }
            if (btnHistory) {
                btnHistory.style.color = '#2d4a36';
                btnHistory.style.borderBottomColor = '#2d4a36';
                btnHistory.classList.add('active');
            }
            if (panePayments) panePayments.style.display = 'none';
            if (paneHistory) paneHistory.style.display = 'block';
            if (headerTitle) headerTitle.innerHTML = 'Payment History &amp; Receipts Ledger';
            if (headerDesc) headerDesc.textContent = 'Track all past transactions, verify payment statuses, and view or download official PDF receipts.';
            loadPaymentHistoryIntoTab();
        } else {
            if (btnPayments) {
                btnPayments.style.color = '#2d4a36';
                btnPayments.style.borderBottomColor = '#2d4a36';
                btnPayments.classList.add('active');
            }
            if (btnHistory) {
                btnHistory.style.color = '#64748b';
                btnHistory.style.borderBottomColor = 'transparent';
                btnHistory.classList.remove('active');
            }
            if (panePayments) panePayments.style.display = 'block';
            if (paneHistory) paneHistory.style.display = 'none';
            if (headerTitle) headerTitle.innerHTML = 'Payments, GCash &amp; Bank Settlements';
            if (headerDesc) headerDesc.textContent = 'Scan official QR, link your wallet for auto-debit, settle monthly dues, or pay via partner banks.';
            loadMonthlyDuesIntoGcashTab();
        }
    };

    document.getElementById('zmgReturnToDashboardBtn')?.addEventListener('click', () => {
        document.getElementById('myReservationPage')?.classList.remove('active');
        document.getElementById('zmgPaymentsFullPage')?.classList.remove('active');
        if (typeof window.updateActiveMenuItem === 'function') {
            window.updateActiveMenuItem('dashboard');
        }
    });

    document.getElementById('zmgTabBtnPayments')?.addEventListener('click', () => {
        if (typeof window.switchMyReservationTab === 'function') {
            window.switchMyReservationTab('payments');
        } else {
            switchTab('payments');
        }
    });
    document.getElementById('zmgTabBtnHistory')?.addEventListener('click', () => {
        if (typeof window.switchMyReservationTab === 'function') {
            window.switchMyReservationTab('history');
        } else {
            switchTab('history');
        }
    });

    if (isHistory) {
        loadPaymentHistoryIntoTab();
    } else {
        loadMonthlyDuesIntoGcashTab();
    }

    // Top QR Card actions
    const openTopQrZoom = () => {
        zmgGcashQr.openQrZoomModal(qrConfig.qrImageUrl, qrConfig.merchantName, qrConfig.accountNumber);
    };
    document.getElementById('zmgMainPageQrWrapper')?.addEventListener('click', openTopQrZoom);
    document.getElementById('zmgMainPageEnlargeQrBtn')?.addEventListener('click', openTopQrZoom);

    document.getElementById('zmgMainPageCopyGcashBtn')?.addEventListener('click', () => {
        const num = qrConfig.accountNumber || '0945 187 6774';
        navigator.clipboard?.writeText(num.replace(/[^0-9]/g, ''))
            .then(() => {
                const btn = document.getElementById('zmgMainPageCopyGcashBtn');
                if (btn) {
                    btn.textContent = '✓ Copied!';
                    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
                }
            })
            .catch(() => alert('GCash Mobile: ' + num));
    });

    document.getElementById('zmgMainPageDownloadQrBtn')?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = qrConfig.qrImageUrl || 'assets/images/gcash-qr-default.svg';
        a.download = 'zion-memorial-gcash-qr.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    setupView.querySelectorAll('.zmg-copy-bank-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.getAttribute('data-acc') || '';
            navigator.clipboard?.writeText(acc.replace(/[^0-9]/g, ''))
                .then(() => {
                    const original = btn.textContent;
                    btn.textContent = '✓ Copied!';
                    setTimeout(() => { btn.textContent = original; }, 2000);
                })
                .catch(() => alert('Account: ' + acc));
        });
    });

    document.getElementById('zmgReturnToPlotReservationBtn')?.addEventListener('click', () => {
        closeGcashPaymentsFullPage(true);
    });
    document.getElementById('zmgReturnToDashboardBtn')?.addEventListener('click', () => {
        closeGcashPaymentsFullPage(false);
    });

    document.getElementById('zmgStartGcashLinkBtn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Opening GCash...';
        try {
            await startGcashLinking(document.getElementById('zmgLinkAutoDebitCheck')?.checked !== false);
        } catch (err) {
            alert('Could not start GCash linking: ' + err.message);
            btn.disabled = false;
            btn.innerHTML = '&#128279; Link GCash';
        }
    });

    document.getElementById('zmgRefreshGcashBtn')?.addEventListener('click', async () => {
        await refreshGcashLinkStatus();
        renderGcashSetupTabContent(false, 'payments');
    });

    document.getElementById('zmgAutoDebitToggle')?.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        try {
            await zmgGcashApi('set_auto_debit', { enabled });
            await refreshGcashLinkStatus();
            renderGcashSetupTabContent(false, 'payments');
        } catch (err) {
            e.target.checked = !enabled;
            alert('Could not update auto-debit: ' + err.message);
        }
    });

    document.getElementById('zmgUnlinkGcashBtn')?.addEventListener('click', async () => {
        if (!await showConfirmModal({
            title: "Unlink GCash Account",
            message: "Unlink your GCash? Automatic deductions will stop and you will need to pay dues manually.",
            confirmText: "Unlink GCash",
            cancelText: "Cancel",
            type: "warning",
            danger: true
        })) return;
        try {
            await unlinkGcashAccount();
            updateTabStatusBadge();
            renderGcashSetupTabContent(false, 'payments');
        } catch (err) {
            alert('Could not unlink GCash: ' + err.message);
        }
    });
}

// ==============================================================================
// DEDICATED PAYMENT HISTORY & TRANSACTION LEDGER CONTROLLER
// ==============================================================================
async function loadPaymentHistoryIntoTab() {
    const container = document.getElementById('zmgPaymentHistoryContainer');
    if (!container || typeof supabaseClient === 'undefined') return;

    container.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #64748b; font-size: 1rem;">
            Loading transaction ledger and receipts...
        </div>
    `;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            container.innerHTML = `<div style="padding: 24px; color: #64748b;">Please log in to view your payment history.</div>`;
            return;
        }

        // 1. Fetch user reservations
        const { data: reservations, error: resError } = await supabaseClient
            .from('reservations')
            .select(`
                id, reservation_number, plan_type, payment_method, installment_term_months,
                total_price, down_payment_amount, monthly_amortization, total_paid, balance,
                status, memorial_spaces ( plot_identifier, section_name, category )
            `)
            .eq('user_id', user.id);

        if (resError) throw resError;

        const resMap = new Map();
        (reservations || []).forEach(r => resMap.set(r.id, r));

        const resIds = (reservations || []).map(r => r.id);

        let payments = [];
        if (resIds.length > 0) {
            const { data: payData, error: payError } = await supabaseClient
                .from('payments')
                .select('*')
                .in('reservation_id', resIds)
                .order('created_at', { ascending: false });

            if (payError) throw payError;
            payments = payData || [];
        }

        if (payments.length === 0) {
            container.innerHTML = `
                <div style="background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 14px; padding: 48px 24px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                    <div style="font-size: 2.8rem; margin-bottom: 12px;">🧾</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 1.25rem; color: #0f172a; font-weight: 800;">No Payment Records Found</h3>
                    <p style="margin: 0 0 18px 0; color: #64748b; font-size: 0.94rem; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                        You have not made any payments yet. When you settle an initial down payment, full contract price, or monthly installment, all official payment receipts will be recorded here.
                    </p>
                    <button type="button" id="zmgEmptySwitchToPaymentsBtn" style="padding: 10px 20px; background: #2d4a36; color: #ffffff; border: none; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                        Make a Payment or Setup GCash &rarr;
                    </button>
                </div>
            `;
            document.getElementById('zmgEmptySwitchToPaymentsBtn')?.addEventListener('click', () => {
                document.getElementById('zmgTabBtnPayments')?.click();
            });
            return;
        }

        // Summary Calculations
        const isCompleted = (status) => ['COMPLETED', 'PAID'].includes(String(status || 'COMPLETED').toUpperCase());
        const totalPaidAmount = payments
            .filter(p => isCompleted(p.status))
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const completedCount = payments.filter(p => isCompleted(p.status)).length;

        const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

        container.innerHTML = `
            <!-- Summary Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 22px;">
                <div style="background: #ffffff; border: 1.5px solid #d1fae5; border-radius: 14px; padding: 18px 20px; box-shadow: 0 4px 12px rgba(16,185,129,0.06);">
                    <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 0.5px;">Total Paid to Date</div>
                    <div style="font-size: 1.7rem; font-weight: 800; color: #065f46; margin: 4px 0;">${peso(totalPaidAmount)}</div>
                    <div style="font-size: 0.82rem; color: #64748b;">Verified client settlements</div>
                </div>
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; box-shadow: 0 4px 12px rgba(15,23,42,0.04);">
                    <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: #475569; letter-spacing: 0.5px;">Total Transactions</div>
                    <div style="font-size: 1.7rem; font-weight: 800; color: #0f172a; margin: 4px 0;">${payments.length}</div>
                    <div style="font-size: 0.82rem; color: #64748b;">${completedCount} completed successfully</div>
                </div>
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; box-shadow: 0 4px 12px rgba(15,23,42,0.04);">
                    <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: #475569; letter-spacing: 0.5px;">Latest Payment</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">
                        ${payments[0]?.paid_at ? new Date(payments[0].paid_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : (payments[0]?.created_at ? new Date(payments[0].created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—')}
                    </div>
                    <div style="font-size: 0.82rem; color: #0284c7; font-family: monospace;">${esc(payments[0]?.payment_reference || 'Ref N/A')}</div>
                </div>
            </div>

            <!-- Ledger Table Container -->
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.05);">
                <div style="padding: 18px 22px; background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h4 style="margin: 0 0 2px 0; font-size: 1.2rem; font-weight: 800; color: #0f172a;">Official Transaction Ledger</h4>
                        <span style="font-size: 0.86rem; color: #64748b;">All payments are cryptographically referenced and viewable as official digital receipts</span>
                    </div>
                    <div>
                        <input type="text" id="zmgHistorySearchInput" placeholder="Filter by reference, plot, or type..." style="padding: 9px 14px; font-size: 0.86rem; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 240px; outline: none;">
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;" id="zmgHistoryTable">
                        <thead>
                            <tr style="background: #f1f5f9; color: #475569; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                <th style="padding: 13px 18px;">Date &amp; Time</th>
                                <th style="padding: 13px 18px;">Reference</th>
                                <th style="padding: 13px 18px;">Reservation / Plot</th>
                                <th style="padding: 13px 18px;">Payment Type</th>
                                <th style="padding: 13px 18px;">Channel</th>
                                <th style="padding: 13px 18px; text-align: right;">Amount</th>
                                <th style="padding: 13px 18px; text-align: center;">Status</th>
                                <th style="padding: 13px 18px; text-align: right;">Receipt</th>
                            </tr>
                        </thead>
                        <tbody id="zmgHistoryTableBody">
                            ${payments.map(p => {
                                const res = resMap.get(p.reservation_id) || {};
                                const space = res.memorial_spaces || {};
                                const isPaid = isCompleted(p.status);
                                const isPending = String(p.status || '').toUpperCase() === 'PENDING';
                                const method = p.payment_method || 'GCash';
                                const dateFormatted = new Date(p.paid_at || p.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                                const typeLabel = ZMG_PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type || 'Installment';

                                return `
                                    <tr class="zmg-history-row" data-search="${esc(p.payment_reference)} ${esc(res.reservation_number)} ${esc(space.plot_identifier)} ${esc(typeLabel)} ${esc(method)}" style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;">
                                        <td style="padding: 14px 18px; color: #334155; font-weight: 600; white-space: nowrap;">
                                            ${dateFormatted}
                                        </td>
                                        <td style="padding: 14px 18px;">
                                            <span style="font-family: monospace; font-weight: 700; color: #0284c7; background: #f0f9ff; padding: 4px 8px; border-radius: 4px; border: 1px solid #bae6fd;">
                                                ${esc(p.payment_reference || 'REF-N/A')}
                                            </span>
                                        </td>
                                        <td style="padding: 14px 18px;">
                                            <strong style="color: #0f172a;">${esc(space.plot_identifier || 'Plot')}</strong>
                                            <div style="font-size: 0.78rem; color: #64748b;">${esc(res.reservation_number || '—')}</div>
                                        </td>
                                        <td style="padding: 14px 18px; color: #334155;">
                                            <span style="font-weight: 700;">${esc(typeLabel)}</span>
                                        </td>
                                        <td style="padding: 14px 18px;">
                                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 4px; font-size: 0.78rem; font-weight: 700; background: ${method.toLowerCase().includes('gcash') ? '#eff6ff' : (method.toLowerCase().includes('bank') ? '#ecfdf5' : '#f8fafc')}; color: ${method.toLowerCase().includes('gcash') ? '#1d4ed8' : (method.toLowerCase().includes('bank') ? '#047857' : '#334155')};">
                                                ${esc(method)}
                                            </span>
                                        </td>
                                        <td style="padding: 14px 18px; text-align: right; font-weight: 800; color: #0f172a;">
                                            ${peso(p.amount)}
                                        </td>
                                        <td style="padding: 14px 18px; text-align: center;">
                                            <span style="display: inline-block; padding: 4px 11px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; background: ${isPaid ? '#dcfce7' : (isPending ? '#fef9c3' : '#fee2e2')}; color: ${isPaid ? '#15803d' : (isPending ? '#a16207' : '#b91c1c')};">
                                                ${isPaid ? '✓ Paid' : (isPending ? '⏳ Pending' : '✕ Failed')}
                                            </span>
                                        </td>
                                        <td style="padding: 14px 18px; text-align: right;">
                                            <button type="button" class="zmg-view-receipt-row-btn" data-pay-id="${p.id}" style="padding: 6px 13px; background: #ffffff; color: #2d4a36; border: 1.5px solid #2d4a36; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                                                📄 Receipt
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Wire search filter
        const searchInput = document.getElementById('zmgHistorySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                container.querySelectorAll('.zmg-history-row').forEach(row => {
                    const searchData = (row.getAttribute('data-search') || '').toLowerCase();
                    row.style.display = searchData.includes(term) ? '' : 'none';
                });
            });
        }

        // Wire receipt button clicks
        container.querySelectorAll('.zmg-view-receipt-row-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const payId = Number(btn.getAttribute('data-pay-id'));
                const payment = payments.find(p => p.id === payId);
                if (!payment) return;
                const res = resMap.get(payment.reservation_id) || {};
                const space = res.memorial_spaces || {};
                const contact = await zmgCurrentClientContact();
                const isPaid = isCompleted(payment.status);

                const receiptData = {
                    paymentTag: isPaid ? 'PAID' : (payment.status || 'PENDING').toUpperCase(),
                    reservationNumber: res.reservation_number || 'N/A',
                    paymentReference: payment.payment_reference || 'REF-N/A',
                    paymentChannel: `${payment.payment_method || 'Payment'} • ${ZMG_PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type || 'Installment'}`,
                    gcashReference: payment.payment_reference || '',
                    dateIssued: new Date(payment.paid_at || payment.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                    clientName: contact.name,
                    clientEmail: contact.email,
                    plotIdentifier: space.plot_identifier || 'Plot',
                    sectionName: space.section_name || 'Zion Memorial Garden',
                    category: space.category || 'Memorial Space',
                    planType: res.plan_type || 'PRE-NEED',
                    paymentOption: res.payment_method || 'INSTALLMENT',
                    termMonths: res.installment_term_months || 0,
                    totalPrice: Number(res.total_price || 0),
                    amountNow: Number(payment.amount || 0),
                    remainingBalance: Number(res.balance ?? 0),
                    monthlyAmortization: Number(res.monthly_amortization || 0),
                    counterInstructions: isPaid
                        ? `Official PAID receipt for reference ${payment.payment_reference}. Retain this digital receipt or PDF for your cemetery records.`
                        : `Payment status: ${payment.status}. Please present your reference at the Zion Memorial Garden counter if needed.`
                };

                showOfficialReceiptModal(receiptData, { sent: true });
            });
        });

    } catch (err) {
        console.error('Failed to load payment history:', err);
        container.innerHTML = `<div style="padding: 24px; color: #b91c1c;">Could not load payment history: ${err.message}</div>`;
    }
}

// Render ONLY the clean checkboxes inside the Reservation Form
function renderReservationChecksPanel() {
    const panelContainer = document.getElementById('zmgDynamicPaymentPanel');
    if (!panelContainer) return;

    const selectedChannel = document.querySelector('input[name="paymentChannel"]:checked')?.value || 'GCash';
    const paymentOption = document.querySelector('input[name="paymentOption"]:checked')?.value || 'INSTALLMENT';
    const totalPrice = Number(document.getElementById('bookPlotPrice')?.value || 0);
    const downPayment = Number(document.getElementById('customDownPayment')?.value || 0);
    const amountNow = paymentOption === 'INSTALLMENT' ? downPayment : totalPrice;
    const formattedAmt = '₱ ' + amountNow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const linkedAcct = getLinkedGcashAccount();

    if (selectedChannel === 'GCash') {
        const qrConfig = (typeof zmgGcashQr !== 'undefined' ? zmgGcashQr.getConfig() : null) || ZMG_PAYMENT_CONFIG.gcash;

        panelContainer.innerHTML = `
            <div class="zmg-checks-only-box" style="padding: 16px;">
                <!-- Dual GCash Sub-Method Selector -->
                <div style="display: flex; gap: 8px; margin-bottom: 14px; background: #f1f5f9; padding: 4px; border-radius: 10px;">
                    <label id="zmgGcashTabQrBtn" class="zmg-sub-pill" style="flex: 1; text-align: center; padding: 8px 12px; font-weight: 700; font-size: 0.85rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #0057ff; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <input type="radio" name="zmgGcashSubMethod" id="zmgGcashSubMethodQr" value="QR" checked style="display: none;">
                        <span>📱 Scan GCash QR (Instant Pay)</span>
                    </label>
                    <label id="zmgGcashTabAutoBtn" class="zmg-sub-pill" style="flex: 1; text-align: center; padding: 8px 12px; font-weight: 700; font-size: 0.85rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: transparent; color: #475569; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <input type="radio" name="zmgGcashSubMethod" id="zmgGcashSubMethodAutoDebit" value="AUTODEBIT" style="display: none;">
                        <span>💳 GCash Auto-Debit (${linkedAcct ? 'Linked' : 'Setup'})</span>
                    </label>
                </div>

                <!-- SUB-PANE 1: INSTANT PAY VIA GCASH QR -->
                <div id="zmgGcashQrPane" style="display: block;">
                    <div style="display: grid; grid-template-columns: 130px 1fr; gap: 14px; align-items: center; background: #ffffff; border: 1.5px solid #93c5fd; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px;">
                        <div style="text-align: center;">
                            <div style="position: relative; width: 120px; height: 155px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin: 0 auto; cursor: pointer;" id="zmgBookingQrThumbWrapper" title="Click to enlarge GCash QR Code">
                                <img src="${qrConfig.qrImageUrl || 'assets/images/gcash-qr-default.svg'}" alt="Official GCash QR" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" id="zmgBookingQrImg">
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,87,255,0.9); color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 0;">🔍 Tap to Enlarge</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #0057ff; letter-spacing: 0.5px; margin-bottom: 2px;">Official Merchant Receiver</div>
                            <div style="font-size: 0.98rem; font-weight: 800; color: #0f172a;" id="zmgBookingMerchantName">${qrConfig.merchantName || 'Zion Memorial Garden Inc.'}</div>
                            <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0 6px 0;">
                                <span style="font-family: monospace; font-size: 0.92rem; font-weight: 700; color: #0057ff;" id="zmgBookingMerchantNumber">${qrConfig.accountNumber || '0945 187 6774'}</span>
                                <button type="button" id="zmgCopyBookingGcashBtn" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 700; background: #e0e7ff; color: #0057ff; border: 1px solid #bfdbfe; border-radius: 4px; cursor: pointer;">📋 Copy</button>
                            </div>
                            <div style="padding: 5px 10px; background: #eff6ff; border-radius: 6px; font-size: 0.8rem; color: #1e40af; line-height: 1.4;">
                                Amount to Pay: <strong style="font-size: 0.92rem; color: #0057ff;">${formattedAmt}</strong>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label for="zmgGcashQrRefNumber" style="display: block; font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                            GCash Transaction Reference Number <span style="color: #dc2626;">*</span>
                        </label>
                        <input type="text" id="zmgGcashQrRefNumber" class="form-input" placeholder="e.g. 1002 9845 2819 (from GCash SMS/Receipt)" style="width: 100%; font-family: monospace; font-size: 0.9rem; font-weight: 700; color: #0057ff; background: #ffffff;">
                        <span style="display: block; font-size: 0.74rem; color: #64748b; margin-top: 2px;">Enter reference number from GCash to verify payment and issue your official PAID receipt.</span>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label for="zmgGcashReceiptUpload" style="display: block; font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                            Attach GCash Payment Screenshot <span style="color: #64748b; font-weight: 500;">(Optional)</span>
                        </label>
                        <input type="file" id="zmgGcashReceiptUpload" accept="image/*" class="form-input" style="width: 100%; font-size: 0.8rem; padding: 6px 8px; background: #ffffff;">
                        <div id="zmgGcashReceiptThumbBox" style="display: none; margin-top: 6px; align-items: center; gap: 8px;">
                            <img id="zmgGcashReceiptThumb" src="" alt="Proof Thumbnail" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">
                            <span id="zmgGcashReceiptFileName" style="font-size: 0.78rem; color: #065f46; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                            <button type="button" id="zmgRemoveReceiptProofBtn" style="background: transparent; border: none; color: #dc2626; font-size: 0.76rem; font-weight: 700; cursor: pointer;">Remove</button>
                        </div>
                    </div>

                    <label class="zmg-check-row">
                        <input type="checkbox" id="zmgCheckConfirmGcashQrPay" checked required>
                        <div>
                            <strong>Confirm GCash Payment of ${formattedAmt} — Tag: PAID</strong>
                            <span>Deduct/send via QR, logs payment with your reference number, and emails your official receipt.</span>
                        </div>
                    </label>
                </div>

                <!-- SUB-PANE 2: RECURRING AUTO-DEBIT (XENDIT) -->
                <div id="zmgGcashAutoDebitPane" style="display: none;">
                    <div class="zmg-gcash-status-strip ${linkedAcct ? 'linked' : 'unlinked'}">
                        <div>
                            ${linkedAcct
                                ? `&#10003; <strong>GCash Auto-Debit Linked:</strong> ${linkedAcct.mobileNumber} • Auto-charge now: <strong>${formattedAmt}</strong>`
                                : `&#9888;&#65039; <strong>GCash Not Linked Yet:</strong> Submitting will open the <strong>Payments &amp; GCash Auto-Debit</strong> tab so you can approve the link in GCash.`
                            }
                        </div>
                        <button type="button" class="zmg-btn-goto-setup" id="zmgQuickGotoSetupBtn">
                            ${linkedAcct ? '&#128179; Manage GCash Auto-Debit' : '&#128279; Link GCash Now &rarr;'}
                        </button>
                    </div>

                    <label class="zmg-check-row">
                        <input type="checkbox" id="zmgCheckConfirmGcashPay" ${linkedAcct ? 'checked' : ''}>
                        <div>
                            <strong>Deduct ${formattedAmt} Automatically via Linked GCash — Receipt Tag: PAID</strong>
                            <span>Charges tokenized GCash wallet immediately via Xendit and downloads your official receipt.</span>
                        </div>
                    </label>

                    <label class="zmg-check-row">
                        <input type="checkbox" id="zmgLinkGcashAutoDebit" ${linkedAcct?.autoDebit !== false ? 'checked' : ''}>
                        <div>
                            <strong>Enable Automatic Deduction of Monthly Dues &amp; 3-Day Pre-Due Notices</strong>
                            <span>Automatically deducts monthly amortization on each due date and emails pre-due reminders.</span>
                        </div>
                    </label>

                    <input type="hidden" id="zmgGcashSenderNumber" value="${linkedAcct?.mobileNumber || ''}">
                </div>
            </div>
        `;

        // Switch between GCash QR and GCash Auto-Debit
        const qrTabBtn = document.getElementById('zmgGcashTabQrBtn');
        const autoTabBtn = document.getElementById('zmgGcashTabAutoBtn');
        const qrPane = document.getElementById('zmgGcashQrPane');
        const autoPane = document.getElementById('zmgGcashAutoDebitPane');
        const qrRadio = document.getElementById('zmgGcashSubMethodQr');
        const autoRadio = document.getElementById('zmgGcashSubMethodAutoDebit');

        const selectSubMethod = (method) => {
            if (method === 'QR') {
                if (qrRadio) qrRadio.checked = true;
                if (qrPane) qrPane.style.display = 'block';
                if (autoPane) autoPane.style.display = 'none';
                if (qrTabBtn) {
                    qrTabBtn.style.background = '#0057ff';
                    qrTabBtn.style.color = '#ffffff';
                }
                if (autoTabBtn) {
                    autoTabBtn.style.background = 'transparent';
                    autoTabBtn.style.color = '#475569';
                }
            } else {
                if (autoRadio) autoRadio.checked = true;
                if (qrPane) qrPane.style.display = 'none';
                if (autoPane) autoPane.style.display = 'block';
                if (autoTabBtn) {
                    autoTabBtn.style.background = '#0057ff';
                    autoTabBtn.style.color = '#ffffff';
                }
                if (qrTabBtn) {
                    qrTabBtn.style.background = 'transparent';
                    qrTabBtn.style.color = '#475569';
                }
            }
        };

        qrTabBtn?.addEventListener('click', () => selectSubMethod('QR'));
        autoTabBtn?.addEventListener('click', () => selectSubMethod('AUTODEBIT'));

        // Enlarge QR
        document.getElementById('zmgBookingQrThumbWrapper')?.addEventListener('click', () => {
            zmgGcashQr.openQrZoomModal(qrConfig.qrImageUrl, qrConfig.merchantName, qrConfig.accountNumber);
        });

        // Copy mobile number
        document.getElementById('zmgCopyBookingGcashBtn')?.addEventListener('click', () => {
            const num = qrConfig.accountNumber || '0945 187 6774';
            navigator.clipboard?.writeText(num.replace(/[^0-9]/g, ''))
                .then(() => {
                    const btn = document.getElementById('zmgCopyBookingGcashBtn');
                    if (btn) {
                        btn.textContent = '✓ Copied!';
                        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
                    }
                })
                .catch(() => alert('GCash Mobile: ' + num));
        });

        // Proof upload thumbnail
        const proofInput = document.getElementById('zmgGcashReceiptUpload');
        const thumbBox = document.getElementById('zmgGcashReceiptThumbBox');
        const thumbImg = document.getElementById('zmgGcashReceiptThumb');
        const fileNameEl = document.getElementById('zmgGcashReceiptFileName');
        const removeProofBtn = document.getElementById('zmgRemoveReceiptProofBtn');

        proofInput?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const res = await zmgGcashQr.readAndCompressImageFile(file, 800, 800, 0.85);
                stagedGcashReceiptProofUrl = res.dataUrl;
                window.stagedGcashReceiptProofUrl = res.dataUrl;
                if (thumbImg) thumbImg.src = res.dataUrl;
                if (fileNameEl) fileNameEl.textContent = file.name;
                if (thumbBox) thumbBox.style.display = 'flex';
            } catch (err) {
                alert('Could not attach receipt screenshot: ' + err.message);
            }
        });

        removeProofBtn?.addEventListener('click', () => {
            stagedGcashReceiptProofUrl = null;
            window.stagedGcashReceiptProofUrl = null;
            if (proofInput) proofInput.value = '';
            if (thumbBox) thumbBox.style.display = 'none';
        });

        document.getElementById('zmgQuickGotoSetupBtn')?.addEventListener('click', () => {
            openGcashPaymentsFullPage(false);
        });
    } else if (selectedChannel === 'Maya') {
        panelContainer.innerHTML = `
            <div class="zmg-checks-only-box">
                <div style="padding: 12px 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #166534;">
                    <strong>&#128179; Maya (E-Wallet Payment):</strong> Pay <strong>${formattedAmt}</strong> to Zion Memorial Garden Maya Merchant (<strong>${ZMG_PAYMENT_CONFIG.gcash.MERCHANT_NUMBER}</strong>) or via Maya POS terminal at the counter.
                </div>
                <div class="zmg-setup-field" style="margin-bottom: 12px;">
                    <label for="zmgMayaReferenceNumber">Maya Transaction Reference / Mobile No. (Optional)</label>
                    <input type="text" id="zmgMayaReferenceNumber" placeholder="e.g. 09171234567 or Ref #918237123" style="background:#fff;">
                </div>
                <label class="zmg-check-row">
                    <input type="checkbox" id="zmgCheckConfirmMaya" checked required>
                    <div>
                        <strong>Confirm Maya Payment Request (${formattedAmt})</strong>
                        <span>Generates your official reservation receipt and records Maya transaction in the cloud database.</span>
                    </div>
                </label>
            </div>
        `;
    } else if (selectedChannel === 'Bank') {
        const banks = ZMG_PAYMENT_CONFIG.bank.PARTNER_BANKS;
        const initialBank = banks[0];
        const randomRef = 'BNK-TEST-' + initialBank.code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        panelContainer.innerHTML = `
            <div class="zmg-checks-only-box" style="background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border-color: #38bdf8;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1.5px solid #bae6fd;">
                    <div>
                        <strong style="color: #0369a1; font-size: 1.05rem; display: block;">&#127974; Online Banking &amp; Bank Transfer</strong>
                        <span style="color: #0284c7; font-size: 0.84rem;">Pay via Philippine Partner Banks</span>
                    </div>
                    <span style="background: #0284c7; color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px;">
                        &#129514; TEST MODE SANDBOX
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div class="zmg-setup-field" style="margin-bottom: 0;">
                        <label for="zmgBankSelect" style="font-weight: 700; color: #0f172a;">Select Bank *</label>
                        <select id="zmgBankSelect" class="form-select" style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-weight: 600; width: 100%;">
                            ${banks.map(b => `<option value="${b.id}" data-code="${b.code}" data-acc="${b.accountNo}" data-branch="${b.branch}" data-type="${b.type}">${b.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="zmg-setup-field" style="margin-bottom: 0;">
                        <label for="zmgBankTestRefNumber" style="font-weight: 700; color: #0f172a;">Test Reference No.</label>
                        <div style="display: flex; gap: 6px;">
                            <input type="text" id="zmgBankTestRefNumber" value="${randomRef}" readonly style="background: #f8fafc; font-family: monospace; font-weight: 700; color: #0369a1; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; flex: 1;">
                            <button type="button" id="zmgRegenBankRefBtn" title="Regenerate Test Reference" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-size: 0.85rem;">&#8635;</button>
                        </div>
                    </div>
                </div>

                <!-- Zion Corporate Bank Account Details Box -->
                <div id="zmgBankAccountInfoBox" style="padding: 12px 14px; background: #ffffff; border: 1.5px solid #7dd3fc; border-radius: 10px; margin-bottom: 14px; font-size: 0.88rem; color: #0f172a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: #0284c7;">Beneficiary Account Details</span>
                        <button type="button" id="zmgCopyBankAccBtn" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; cursor: pointer;">&#128203; Copy Acc No.</button>
                    </div>
                    <div>Account Name: <strong>${ZMG_PAYMENT_CONFIG.bank.BENEFICIARY_NAME}</strong></div>
                    <div>Account Number: <strong id="zmgBankAccNumberDisplay" style="letter-spacing: 0.5px; font-family: monospace; font-size: 0.95rem; color: #0369a1;">${initialBank.accountNo}</strong></div>
                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                        Branch: <span id="zmgBankBranchDisplay">${initialBank.branch}</span> &bull; <span id="zmgBankTypeDisplay">${initialBank.type}</span>
                    </div>
                </div>

                <label class="zmg-check-row" style="margin-bottom: 10px;">
                    <input type="checkbox" id="zmgCheckConfirmBankTest" checked required>
                    <div>
                        <strong>Simulate Instant Online Bank Transfer (${formattedAmt}) — Receipt Tag: PAID</strong>
                        <span>Authorizes simulated bank payment in sandbox mode. Immediately records payment in cloud database, completes reservation down payment, and issues official PAID PDF &amp; EmailJS receipt.</span>
                    </div>
                </label>

                <label class="zmg-check-row">
                    <input type="checkbox" id="zmgBank3DayNotice" checked>
                    <div>
                        <strong>Automated 3-Day Pre-Due Installment Reminders</strong>
                        <span>Emails upcoming installment notices 3 days before monthly schedule due dates.</span>
                    </div>
                </label>
            </div>
        `;

        const bankSelect = document.getElementById('zmgBankSelect');
        const accDisplay = document.getElementById('zmgBankAccNumberDisplay');
        const branchDisplay = document.getElementById('zmgBankBranchDisplay');
        const typeDisplay = document.getElementById('zmgBankTypeDisplay');
        const refInput = document.getElementById('zmgBankTestRefNumber');
        const copyBtn = document.getElementById('zmgCopyBankAccBtn');
        const regenBtn = document.getElementById('zmgRegenBankRefBtn');

        const updateBankDetails = () => {
            const opt = bankSelect?.options[bankSelect.selectedIndex];
            if (!opt) return;
            const code = opt.getAttribute('data-code') || 'BNK';
            const acc = opt.getAttribute('data-acc') || '';
            const branch = opt.getAttribute('data-branch') || '';
            const type = opt.getAttribute('data-type') || '';
            if (accDisplay) accDisplay.textContent = acc;
            if (branchDisplay) branchDisplay.textContent = branch;
            if (typeDisplay) typeDisplay.textContent = type;
            if (refInput) {
                refInput.value = 'BNK-TEST-' + code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            }
        };

        bankSelect?.addEventListener('change', updateBankDetails);

        regenBtn?.addEventListener('click', () => {
            const opt = bankSelect?.options[bankSelect.selectedIndex];
            const code = opt?.getAttribute('data-code') || 'BNK';
            if (refInput) {
                refInput.value = 'BNK-TEST-' + code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            }
        });

        copyBtn?.addEventListener('click', () => {
            const accText = accDisplay?.textContent || '';
            navigator.clipboard?.writeText(accText.replace(/[^0-9]/g, ''))
                .then(() => {
                    copyBtn.textContent = '✓ Copied!';
                    setTimeout(() => { copyBtn.textContent = '📋 Copy Acc No.'; }, 2000);
                })
                .catch(() => alert('Account number: ' + accText));
        });
    } else if (selectedChannel === 'Card') {
        panelContainer.innerHTML = `
            <div class="zmg-checks-only-box">
                <div style="padding: 12px 14px; background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1e40af;">
                    <strong>&#128179; Credit / Debit Card (Visa / Mastercard):</strong> Settle <strong>${formattedAmt}</strong> via the Zion Memorial Garden counter POS terminal upon contract signing.
                </div>
                <div class="zmg-setup-field" style="margin-bottom: 12px;">
                    <label for="zmgCardLast4Digits">Cardholder Name / Last 4 Digits (Optional)</label>
                    <input type="text" id="zmgCardLast4Digits" placeholder="e.g. Maria Clara Santos (Visa •••• 4242)" style="background:#fff;">
                </div>
                <label class="zmg-check-row">
                    <input type="checkbox" id="zmgCheckConfirmCard" checked required>
                    <div>
                        <strong>Confirm Card Payment Option (${formattedAmt})</strong>
                        <span>Issues your official reservation receipt ready for counter card swipe or tap.</span>
                    </div>
                </label>
            </div>
        `;
    } else {
        const isStaff = isCurrentUserStaffOrAdmin();
        if (isStaff) {
            panelContainer.innerHTML = `
                <div class="zmg-checks-only-box" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #22c55e;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-bottom: 10px; border-bottom: 1.5px solid #bbf7d0;">
                        <div>
                            <strong style="font-size: 1.04rem; color: #14532d; display: block;">&#128737;&#65039; Staff / Admin In-Office Counter Payment</strong>
                            <span style="font-size: 0.86rem; color: #166534;">Client is paying cash in the office. Enter payment received &amp; client's Gmail to issue an official <strong>PAID</strong> receipt.</span>
                        </div>
                        <span class="zmg-tag-badge zmg-tag-paid">Receipt Tag: PAID</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px;">
                        <div class="zmg-setup-field" style="margin-bottom: 0;">
                            <label for="zmgStaffClientName">Client Full Name *</label>
                            <input type="text" id="zmgStaffClientName" placeholder="e.g. Maria Clara Santos" required style="background: #ffffff;">
                        </div>
                        <div class="zmg-setup-field" style="margin-bottom: 0;">
                            <label for="zmgStaffClientEmail">Client Gmail / Email Address (For PAID Receipt) *</label>
                            <input type="email" id="zmgStaffClientEmail" placeholder="client@gmail.com" required style="background: #ffffff;">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: end;">
                        <div class="zmg-setup-field" style="margin-bottom: 0;">
                            <label for="zmgStaffCashAmountReceived">Payment Amount Received (₱) *</label>
                            <input type="number" id="zmgStaffCashAmountReceived" min="1" step="0.01" value="${amountNow.toFixed(2)}" required style="background: #ffffff; border-color: #16a34a; font-size: 1.1rem; color: #15803d;">
                        </div>
                        <div style="padding: 12px 14px; background: #ffffff; border: 1.5px solid #bbf7d0; border-radius: 10px; font-size: 0.88rem; color: #14532d;">
                            <div>Required Now: <strong>${formattedAmt}</strong></div>
                            <div>Receipt Status: <strong style="color: #15803d;">PAID (In-Office Counter)</strong></div>
                        </div>
                    </div>

                    <label class="zmg-check-row" style="margin-top: 4px;">
                        <input type="checkbox" id="zmgStaffConfirmPaidReceipt" checked required>
                        <div>
                            <strong>Confirm Cash Received &amp; Send PAID Receipt to Client's Gmail</strong>
                            <span>Saves the PAID PDF receipt and emails the official PAID receipt directly to the client's Gmail address above.</span>
                        </div>
                    </label>
                </div>
            `;
        } else {
            panelContainer.innerHTML = `
                <div class="zmg-checks-only-box">
                    <label class="zmg-check-row">
                        <input type="checkbox" id="zmgCheckConfirmCashCounter" checked required>
                        <div>
                            <strong>Pay Cash Over the Counter (${formattedAmt}) — Receipt Tag: UNPAID</strong>
                            <span>Client Online Reservation: Saves a PDF receipt with an <strong>UNPAID</strong> tag to your email. Present the receipt once called onto the counter to pay in cash.</span>
                        </div>
                    </label>

                    <label class="zmg-check-row">
                        <input type="checkbox" id="zmgCheckCash3DayNotice" checked>
                        <div>
                            <strong>Receive Automated Email Notices 3 Days Before Monthly Due Dates</strong>
                            <span>Automatically email a monthly installment reminder 3 days before each scheduled due date.</span>
                        </div>
                    </label>
                </div>
            `;
        }
    }
}

// Setup Checks Panel inside #reservationBookingModal & wire Full-Screen Payments Tab
function setupDynamicPaymentChannelPanel() {
    injectPaymentAndReceiptUI();
    initEmailJSService();

    const bookingModal = document.getElementById('reservationBookingModal');
    const headerEl = bookingModal?.querySelector('.booking-modal-header');

    if (headerEl && !document.getElementById('zmgAccountRoleToggleBtn')) {
        const roleBtn = document.createElement('span');
        roleBtn.id = 'zmgAccountRoleToggleBtn';
        roleBtn.style.cssText = 'display: none; margin-left: auto; margin-right: 14px; align-self: center; padding: 6px 14px; border-radius: 999px; border: 1px solid #cbd5e1; font-size: 0.78rem; font-weight: 800;';
        roleBtn.innerHTML = '&#128737;&#65039; Staff / Admin Counter';

        const closeBtn = headerEl.querySelector('.booking-close-btn');
        if (closeBtn) {
            headerEl.insertBefore(roleBtn, closeBtn);
        } else {
            headerEl.appendChild(roleBtn);
        }
    }

    detectCurrentUserStaffRole().then(() => {
        updateRoleTogglePillUI();
        renderReservationChecksPanel();
    });

    // Wire up Sidebar "My Reservations & Payments" -> Opens Plots Tab
    const myResMenuItem = document.getElementById('myReservationMenuItem');
    if (myResMenuItem && !myResMenuItem.dataset.boundGcashFullPage) {
        myResMenuItem.dataset.boundGcashFullPage = 'true';
        myResMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            const myReservationPage = document.getElementById('myReservationPage');
            if (myReservationPage) {
                if (typeof closeAllSubpages === 'function') closeAllSubpages();
                if (typeof closeReservationModal === 'function') closeReservationModal();
                if (typeof closeProfileModal === 'function') closeProfileModal();
                document.getElementById('sidebarMenu')?.classList.remove('active');
                document.getElementById('overlay')?.classList.remove('active');
                myReservationPage.classList.add('active');
                if (typeof window.switchMyReservationTab === 'function') {
                    window.switchMyReservationTab('plots');
                }
                if (typeof window.updateActiveMenuItem === 'function') {
                    window.updateActiveMenuItem('myreservation');
                }
            }
        });
    }

    // Wire up Sidebar "Payments & Auto-Debit" -> Opens Payments Pane
    const gcashMenuItem = document.getElementById('gcashSetupMenuItem');
    if (gcashMenuItem && !gcashMenuItem.dataset.boundGcashFullPage) {
        gcashMenuItem.dataset.boundGcashFullPage = 'true';
        gcashMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            openGcashPaymentsFullPage(false, 'payments');
        });
    }

    // Wire up Sidebar "Payment History" -> Opens History & Receipts Pane
    const historyMenuItem = document.getElementById('sidebarPaymentHistory');
    if (historyMenuItem && !historyMenuItem.dataset.boundGcashFullPage) {
        historyMenuItem.dataset.boundGcashFullPage = 'true';
        historyMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            openGcashPaymentsFullPage(false, 'history');
        });
    }

    // Wire up Dashboard "View Payment History ->" link
    const dashHistoryLink = document.getElementById('dashboardPaymentHistoryLink');
    if (dashHistoryLink && !dashHistoryLink.dataset.boundGcashFullPage) {
        dashHistoryLink.dataset.boundGcashFullPage = 'true';
        dashHistoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            openGcashPaymentsFullPage(false, 'history');
        });
    }

    const channelsGrid = document.querySelector('.payment-channels-grid');
    if (!channelsGrid) return;

    let panelContainer = document.getElementById('zmgDynamicPaymentPanel');
    if (!panelContainer) {
        panelContainer = document.createElement('div');
        panelContainer.id = 'zmgDynamicPaymentPanel';
        channelsGrid.parentElement.appendChild(panelContainer);
    }

    document.querySelectorAll('input[name="paymentChannel"]').forEach(radio => {
        if (!radio.dataset.boundCheckPanel) {
            radio.dataset.boundCheckPanel = 'true';
            radio.addEventListener('change', () => {
                renderReservationChecksPanel();
                // If selecting GCash and no GCash is linked yet, redirect to the Full-Screen GCash Setup Page
                if (radio.value === 'GCash' && radio.checked && !getLinkedGcashAccount()) {
                    openGcashPaymentsFullPage(true);
                }
            });
        }
    });

    document.querySelectorAll('input[name="paymentOption"]').forEach(radio => {
        if (!radio.dataset.boundCheckOpt) {
            radio.dataset.boundCheckOpt = 'true';
            radio.addEventListener('change', renderReservationChecksPanel);
        }
    });

    const downInput = document.getElementById('customDownPayment');
    if (downInput && !downInput.dataset.boundCheckAmt) {
        downInput.dataset.boundCheckAmt = 'true';
        downInput.addEventListener('input', renderReservationChecksPanel);
    }

    updateTabStatusBadge();
    renderReservationChecksPanel();
}

// Validate GCash setup before submitting reservation
function validateGcashSetupOrRedirect(paymentChannel) {
    if (paymentChannel !== 'GCash') return true;

    // Check if the user selected recurring Auto-Debit
    const isAutoDebit = document.getElementById('zmgGcashSubMethodAutoDebit')?.checked;
    if (isAutoDebit) {
        const acct = getLinkedGcashAccount();
        if (!acct) {
            openGcashPaymentsFullPage(true);
            return false;
        }
        return true;
    }

    // Default flow: QR Code payment validation
    const refInput = document.getElementById('zmgGcashQrRefNumber');
    const refVal = refInput?.value?.trim() || '';
    if (!refVal) {
        alert('Please enter your GCash Transaction Reference Number after scanning the QR code to verify your reservation payment.');
        refInput?.focus();
        return false;
    }
    if (refVal.length < 6) {
        alert('Please enter a valid GCash Reference Number (at least 6 digits/characters from your GCash confirmation SMS or receipt).');
        refInput?.focus();
        return false;
    }
    return true;
}

// Generate & Download PDF Receipt with PAID / UNPAID tag using jsPDF
function generateAndDownloadReceiptPDF(receiptData) {
    const isPaid = receiptData.paymentTag === 'PAID';
    const fileName = `ZMG-Receipt-${receiptData.reservationNumber}-${receiptData.paymentTag}.pdf`;

    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.warn('jsPDF library not loaded; skipping direct PDF download.');
        return null;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Header Banner
    doc.setFillColor(46, 71, 46);
    doc.rect(0, 0, 595, 95, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ZION MEMORIAL GARDEN', 40, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Official Plot Reservation & Payment Receipt', 40, 60);
    doc.text(ZMG_PAYMENT_CONFIG.gcash.COUNTER_LOCATION, 40, 75);

    // Status Stamp Badge (PAID vs UNPAID)
    const isCashChannel = String(receiptData.paymentChannel || '').toLowerCase().includes('cash');
    const isBankChannel = String(receiptData.paymentChannel || '').toLowerCase().includes('bank');
    if (isPaid) {
        doc.setFillColor(22, 163, 74);
        doc.roundedRect(425, 26, 130, 42, 6, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('TAG: PAID', 490, 48, { align: 'center' });
        doc.setFontSize(8);
        doc.text(isBankChannel ? 'PAID VIA BANK (TEST)' : (isCashChannel ? 'PAID IN CASH (COUNTER)' : 'PAID VIA GCASH'), 490, 60, { align: 'center' });
    } else {
        doc.setFillColor(220, 38, 38);
        doc.roundedRect(420, 26, 135, 42, 6, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text('TAG: UNPAID', 487.5, 48, { align: 'center' });
        doc.setFontSize(8);
        doc.text(isBankChannel ? 'BANK TRANSFER PENDING' : 'CASH OVER COUNTER', 487.5, 60, { align: 'center' });
    }

    let y = 130;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('RESERVATION & PAYMENT SUMMARY', 40, y);

    y += 12;
    doc.setDrawColor(203, 213, 225);
    doc.line(40, y, 555, y);

    const amountRowLabel = isPaid
        ? (isBankChannel ? 'Amount Paid (Bank Transfer):' : (isCashChannel ? 'Amount Paid (Cash at Counter):' : 'Amount Paid (GCash):'))
        : 'Amount Due at Counter:';

    const rows = [
        ['Payment Status Tag:', `${receiptData.paymentTag} (${receiptData.paymentChannel})`],
        ['Reservation Reference:', receiptData.reservationNumber],
        ['Payment Reference:', receiptData.paymentReference],
        [isBankChannel ? 'Bank Reference No.:' : (isCashChannel ? 'Counter Reference No.:' : 'GCash Reference No.:'), receiptData.gcashReference || receiptData.paymentReference || 'N/A'],
        ['Date & Time Issued:', receiptData.dateIssued],
        ['Client Name:', receiptData.clientName],
        ['Client Email:', receiptData.clientEmail],
        ['Memorial Plot Code:', receiptData.plotIdentifier],
        ['Cemetery Area / Section:', `${receiptData.sectionName} (${receiptData.category})`],
        ['Plan Type:', receiptData.planType],
        ['Payment Option:', receiptData.paymentOption === 'INSTALLMENT' ? `Installment (${receiptData.termMonths} Months)` : 'Full Payment'],
        ['Total Contract Price:', `PHP ${Number(receiptData.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        [amountRowLabel, `PHP ${Number(receiptData.amountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Remaining Balance:', `PHP ${Number(receiptData.remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Monthly Amortization:', `PHP ${Number(receiptData.monthlyAmortization).toLocaleString('en-US', { minimumFractionDigits: 2 })} / month`]
    ];

    y += 22;
    rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(100, 116, 139);
        doc.text(label, 40, y);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(String(value), 555, y, { align: 'right' });

        y += 20;
    });

    // Counter Instruction Box
    y += 15;
    doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 242, isPaid ? 244 : 242);
    doc.setDrawColor(isPaid ? 22 : 220, isPaid ? 163 : 38, isPaid ? 74 : 38);
    doc.setLineWidth(1.5);
    doc.roundedRect(40, y, 515, 95, 8, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(isPaid ? 20 : 153, isPaid ? 83 : 27, isPaid ? 45 : 27);
    doc.text('IMPORTANT: INSTRUCTIONS WHEN CALLED ONTO THE COUNTER', 56, y + 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const wrappedInstructions = doc.splitTextToSize(receiptData.counterInstructions, 480);
    doc.text(wrappedInstructions, 56, y + 44);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Zion Memorial Garden Cloud Reservation System • Present this receipt at the counter when called.', 297.5, 790, { align: 'center' });

    doc.save(fileName);
    return doc;
}

// Send Receipt Email via EmailJS
async function sendReceiptViaEmailJS(receiptData) {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS SDK not loaded.');
        return { sent: false, reason: 'sdk_not_loaded' };
    }

    const { PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID } = ZMG_PAYMENT_CONFIG.emailjs;
    const formattedTotal = `₱ ${Number(receiptData.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedAmountNow = `₱ ${Number(receiptData.amountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedBalance = `₱ ${Number(receiptData.remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const fullMessageSummary = [
        `RECEIPT STATUS TAG: ${receiptData.paymentTag}`,
        `Reservation Reference: ${receiptData.reservationNumber}`,
        `Payment Reference: ${receiptData.paymentReference}`,
        `Payment Method: ${receiptData.paymentChannel}`,
        `GCash Reference No.: ${receiptData.gcashReference || 'N/A (Cash Over the Counter)'}`,
        `Date Issued: ${receiptData.dateIssued}`,
        `Memorial Space / Plot: ${receiptData.plotIdentifier} — ${receiptData.sectionName} (${receiptData.category})`,
        `Plan & Option: ${receiptData.planType} (${receiptData.paymentOption})`,
        `Total Contract Price: ${formattedTotal}`,
        `Amount ${receiptData.paymentTag === 'PAID' ? 'Paid' : 'Due at Counter'}: ${formattedAmountNow}`,
        `Remaining Balance: ${formattedBalance}`,
        ``,
        `IMPORTANT COUNTER INSTRUCTIONS:`,
        receiptData.counterInstructions
    ].join('\n');

    const templateParams = {
        to_email: receiptData.clientEmail,
        email: receiptData.clientEmail,
        user_email: receiptData.clientEmail,
        recipient_email: receiptData.clientEmail,
        to_name: receiptData.clientName,
        client_name: receiptData.clientName,
        user_name: receiptData.clientName,
        name: 'Zion Memorial Garden',
        from_name: 'Zion Memorial Garden',
        payment_status_tag: receiptData.paymentTag,
        status: receiptData.paymentTag,
        tag: receiptData.paymentTag,
        reservation_number: receiptData.reservationNumber,
        payment_reference: receiptData.paymentReference,
        payment_method: receiptData.paymentChannel,
        gcash_reference: receiptData.gcashReference || 'N/A (Cash Over the Counter)',
        plot_code: receiptData.plotIdentifier,
        section_name: `${receiptData.sectionName} (${receiptData.category})`,
        plan_type: receiptData.planType,
        payment_option: receiptData.paymentOption,
        total_price: formattedTotal,
        amount_paid_or_due: formattedAmountNow,
        amount: formattedAmountNow,
        remaining_balance: formattedBalance,
        counter_instructions: receiptData.counterInstructions,
        receipt_date: receiptData.dateIssued,
        message: fullMessageSummary
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
            publicKey: PUBLIC_KEY
        });
        return { sent: true };
    } catch (err) {
        console.error('EmailJS send error:', err);
        return { sent: false, reason: err?.text || err?.message || 'send_failed' };
    }
}

// Show Official Receipt Modal with Counter Instructions & Download PDF button
function showOfficialReceiptModal(receiptData, emailResult) {
    injectPaymentAndReceiptUI();
    const modal = document.getElementById('zmgOfficialReceiptModal');
    if (!modal) return;

    const isPaid = receiptData.paymentTag === 'PAID';
    const isCashChannel = String(receiptData.paymentChannel || '').toLowerCase().includes('cash');
    const isBankChannel = String(receiptData.paymentChannel || '').toLowerCase().includes('bank');
    const banner = document.getElementById('zmgReceiptStatusBanner');
    const statusTitle = document.getElementById('zmgReceiptStatusTitle');
    const tagBadge = document.getElementById('zmgReceiptTagBadge');
    const emailNotice = document.getElementById('zmgReceiptEmailNotice');

    if (banner) {
        banner.className = `zmg-receipt-status-banner ${isPaid ? 'paid' : 'unpaid'}`;
    }
    if (statusTitle) {
        statusTitle.textContent = isPaid
            ? (isBankChannel ? 'PAID VIA BANK TRANSFER (TEST MODE)' : (isCashChannel ? 'PAID IN CASH (AT COUNTER)' : 'PAID VIA GCASH'))
            : (isBankChannel ? 'UNPAID — BANK TRANSFER PENDING' : 'UNPAID — PAY CASH OVER THE COUNTER');
    }
    if (tagBadge) {
        tagBadge.textContent = receiptData.paymentTag;
        tagBadge.className = `zmg-tag-badge ${isPaid ? 'zmg-tag-paid' : 'zmg-tag-unpaid'}`;
    }
    if (emailNotice) {
        emailNotice.textContent = emailResult?.sent
            ? `PDF Receipt saved & emailed to ${receiptData.clientEmail}`
            : `PDF Receipt downloaded (${receiptData.paymentTag}) • Ready for counter presentation`;
    }

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt('zmgRecResNum', receiptData.reservationNumber);
    setTxt('zmgRecPayRef', receiptData.gcashReference
        ? `${receiptData.paymentReference} (GCash Ref: ${receiptData.gcashReference})`
        : receiptData.paymentReference);
    setTxt('zmgRecDate', receiptData.dateIssued);
    setTxt('zmgRecClient', `${receiptData.clientName} (${receiptData.clientEmail})`);
    setTxt('zmgRecPlot', `${receiptData.plotIdentifier} • ${receiptData.sectionName}`);
    setTxt('zmgRecPlan', `${receiptData.planType} • ${receiptData.paymentOption}`);
    setTxt('zmgRecChannel', `${receiptData.paymentChannel} [${receiptData.paymentTag}]`);
    setTxt('zmgRecTotal', `₱ ${Number(receiptData.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setTxt('zmgRecAmountLabel', isPaid
        ? (isBankChannel ? 'Amount Paid (Bank Transfer - Test Mode)' : (isCashChannel ? 'Amount Paid (Cash at Counter)' : 'Amount Paid (GCash)'))
        : 'Amount Due at Counter');
    setTxt('zmgRecAmount', `₱ ${Number(receiptData.amountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setTxt('zmgRecBalance', `₱ ${Number(receiptData.remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    setTxt('zmgRecCounterInstructions', receiptData.counterInstructions);

    const downloadBtn = document.getElementById('zmgDownloadPdfAgainBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => generateAndDownloadReceiptPDF(receiptData);
    }

    modal.classList.add('active');
}

// High-level orchestrator called after a reservation is recorded
async function processReservationReceiptAndEmail(receiptData) {
    const linkCheckbox = document.getElementById('zmgLinkGcashAutoDebit');
    const isAutoLinked = receiptData.paymentChannel.includes('GCash') && (!linkCheckbox || linkCheckbox.checked);
    receiptData.gcashAutoDebitLinked = isAutoLinked;
    saveGcashInstallmentSubscription(receiptData);

    // 1. Generate and auto-save PDF Receipt with PAID / UNPAID tag
    generateAndDownloadReceiptPDF(receiptData);

    // 2. Send Email via EmailJS with PAID / UNPAID tag & counter instructions (skip if server already sent it)
    const emailResult = receiptData.skipClientEmail
        ? { sent: true }
        : await sendReceiptViaEmailJS(receiptData);

    // 3. Open the Official Receipt & Counter Instructions Modal
    showOfficialReceiptModal(receiptData, emailResult);
}

// ==============================================================================
// GCASH AUTO-DEBIT RECEIPT HELPERS (SERVER-DRIVEN XENDIT TOKENIZATION)
// Scheduling & automatic deductions run on the SERVER (gcash-autodebit-run + pg_cron)
// ==============================================================================
const ZMG_PAYMENT_TYPE_LABELS = {
    charge_initial: 'Down / Full Payment',
    pay_schedule: 'Monthly Installment',
    pay_balance: 'Full Balance Payoff'
};

async function zmgCurrentClientContact() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return { name: 'Valued Client', email: '' };
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();
    return {
        name: profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client',
        email: user.email || ''
    };
}

async function zmgShowGcashPaymentReceipt(res, action, result) {
    const contact = await zmgCurrentClientContact();
    const space = res.memorial_spaces || {};
    const isPaid = result.status === 'SUCCEEDED';
    const newBalance = Number(result.reservation?.balance ?? res.balance ?? 0);
    const receiptData = {
        paymentTag: isPaid ? 'PAID' : 'PROCESSING',
        reservationNumber: res.reservation_number,
        paymentReference: result.reference,
        paymentChannel: `GCash Auto-Debit • ${ZMG_PAYMENT_TYPE_LABELS[action] || 'Payment'}`,
        gcashReference: result.reference,
        dateIssued: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        clientName: contact.name,
        clientEmail: contact.email,
        plotIdentifier: space.plot_identifier || 'Plot',
        sectionName: space.section_name || 'Zion Memorial Garden',
        category: space.category || 'Memorial Space',
        planType: res.plan_type || 'PRE-NEED',
        paymentOption: res.payment_method,
        termMonths: res.installment_term_months || 0,
        totalPrice: Number(res.total_price || 0),
        amountNow: Number(result.amount || 0),
        remainingBalance: newBalance,
        monthlyAmortization: Number(res.monthly_amortization || 0),
        counterInstructions: isPaid
            ? `PAID VIA GCASH AUTO-DEBIT (Ref ${result.reference}). Present this receipt at the Zion Memorial Garden counter when called.`
            : `GCASH PAYMENT PROCESSING (Ref ${result.reference}). You will receive the PAID receipt by email once GCash confirms the deduction.`
    };

    generateAndDownloadReceiptPDF(receiptData);
    let emailResult = { sent: Boolean(result.receipt_emailed) };
    if (isPaid && !result.server_email) {
        emailResult = await sendReceiptViaEmailJS(receiptData);
    } else if (isPaid && result.server_email) {
        emailResult = { sent: true };
    }
    showOfficialReceiptModal(receiptData, emailResult);
}

// Backwards-compatible helpers used by my-reservation-page.js
function getGcashSubscriptionsMap() {
    const acct = getLinkedGcashAccount();
    return acct ? { __linked: acct } : {};
}

function saveGcashSubscriptionsMap() {
    // Schedules are now generated and stored in public.payment_schedules on the server
}

function computeNextMonthlyDueDate(baseDateStr, monthsAhead = 1) {
    const base = baseDateStr ? new Date(baseDateStr) : new Date();
    if (isNaN(base.getTime())) return new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const next = new Date(base);
    next.setMonth(next.getMonth() + monthsAhead);
    return next.toISOString().split('T')[0];
}

function saveGcashInstallmentSubscription() {
    // Handled automatically by DB trigger trg_zmg_generate_schedule on public.reservations
}

async function checkAndRunAutomatedInstallmentNotices() {
    // Handled automatically on the server by pg_cron -> gcash-autodebit-run Edge Function
}

async function sendAutomated3DayNoticeForReservation(res, sub, clientName, clientEmail, daysRemaining = 3) {
    const space = res.memorial_spaces || {};
    const monthlyAmt = Number(res.monthly_amortization || sub?.monthlyAmortization || 0);
    const balance = Number(res.balance ?? sub?.remainingBalance ?? 0);
    const dueStr = sub?.nextDueDate || computeNextMonthlyDueDate(res.reservation_date, 1);
    const acct = getLinkedGcashAccount();
    const isLinked = Boolean(acct?.autoDebit);
    const linkedLabel = acct?.mobileNumber || 'Linked GCash';

    const noticeData = {
        paymentTag: isLinked ? `3-DAY DUE NOTICE (GCASH AUTO-DEBIT ON ${dueStr})` : `UNPAID - 3-DAY DUE NOTICE (DUE ${dueStr})`,
        reservationNumber: res.reservation_number,
        paymentReference: `NOTICE-3DAY-${Date.now().toString(36).toUpperCase()}`,
        paymentChannel: isLinked ? `Linked GCash Auto-Debit (${linkedLabel})` : 'Manual / Counter Installment',
        gcashReference: isLinked ? `AUTO-DEBIT-TOKEN` : 'N/A',
        dateIssued: `${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })} • Due in ${daysRemaining} day(s) (${dueStr})`,
        clientName,
        clientEmail,
        plotIdentifier: space.plot_identifier || sub?.plotIdentifier || 'Plot',
        sectionName: space.section_name || sub?.sectionName || 'Zion Memorial Garden',
        category: space.category || sub?.category || 'Memorial Space',
        planType: res.plan_type || 'PRE-NEED',
        paymentOption: `INSTALLMENT (${res.installment_term_months || 60} Mos)`,
        termMonths: res.installment_term_months || 60,
        totalPrice: Number(res.total_price || 0),
        amountNow: monthlyAmt,
        remainingBalance: balance,
        monthlyAmortization: monthlyAmt,
        counterInstructions: isLinked
            ? `3-DAY INSTALLMENT REMINDER: Your monthly amortization of ₱${monthlyAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} is due on ${dueStr} and will be automatically debited from your linked GCash via Xendit.`
            : `3-DAY INSTALLMENT REMINDER (TAG: UNPAID): Your monthly amortization of ₱${monthlyAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} is due on ${dueStr}. Pay via the Payments & GCash Tab or at the counter.`
    };

    return await sendReceiptViaEmailJS(noticeData);
}

// Trigger real server-side Xendit charge for the next due installment from My Reservations
async function executeAutomatedGcashMonthlyInstallment(res, _sub, _clientName, _clientEmail, showModal = true) {
    if (!getLinkedGcashAccount()) {
        alert('No linked GCash account found. Redirecting you to the Payments & GCash Auto-Debit tab to link your GCash.');
        openGcashPaymentsFullPage(true);
        return { success: false, message: 'No linked GCash' };
    }

    const { data: nextSched } = await supabaseClient
        .from('payment_schedules')
        .select('id')
        .eq('reservation_id', res.id)
        .in('status', ['PENDING', 'FAILED'])
        .order('installment_no', { ascending: true })
        .limit(1)
        .maybeSingle();

    const action = nextSched?.id ? 'pay_schedule' : 'charge_initial';
    const payload = nextSched?.id ? { schedule_id: nextSched.id } : { reservation_id: res.id };
    const result = await zmgRunGcashCharge(action, payload);

    if (result.status === 'FAILED') {
        alert('GCash auto-debit failed: ' + (result.failure || 'Declined'));
        return { success: false, message: result.failure };
    }
    if (showModal) {
        await zmgShowGcashPaymentReceipt(res, action, result);
    }
    return {
        success: result.status === 'SUCCEEDED',
        newBalance: result.reservation?.balance,
        newTotalPaid: result.reservation?.total_paid
    };
}

window.zmgGcashApi = zmgGcashApi;
window.refreshGcashLinkStatus = refreshGcashLinkStatus;
window.startGcashLinking = startGcashLinking;
window.zmgPayReservationWithGcash = zmgPayReservationWithGcash;
window.zmgRunGcashCharge = zmgRunGcashCharge;

window.ZMG_PAYMENT_CONFIG = ZMG_PAYMENT_CONFIG;
window.getLinkedGcashAccount = getLinkedGcashAccount;
window.saveLinkedGcashAccount = saveLinkedGcashAccount;
window.unlinkGcashAccount = unlinkGcashAccount;
window.switchBookingModalTab = switchBookingModalTab;
window.validateGcashSetupOrRedirect = validateGcashSetupOrRedirect;
window.setupDynamicPaymentChannelPanel = setupDynamicPaymentChannelPanel;
window.processReservationReceiptAndEmail = processReservationReceiptAndEmail;
window.generateAndDownloadReceiptPDF = generateAndDownloadReceiptPDF;
window.getGcashSubscriptionsMap = getGcashSubscriptionsMap;
window.saveGcashSubscriptionsMap = saveGcashSubscriptionsMap;
window.computeNextMonthlyDueDate = computeNextMonthlyDueDate;
window.sendAutomated3DayNoticeForReservation = sendAutomated3DayNoticeForReservation;
window.executeAutomatedGcashMonthlyInstallment = executeAutomatedGcashMonthlyInstallment;
window.checkAndRunAutomatedInstallmentNotices = checkAndRunAutomatedInstallmentNotices;


// ==============================================================================
// GCASH QR CODE PAYMENT MODAL & TRANSACTIONS
// ==============================================================================
function openGcashQrPaymentModal({ res, schedule, amount, action, onSuccess }) {
    injectPaymentAndReceiptUI();
    const modal = document.getElementById('zmgGcashQrPaymentModal');
    if (!modal) return;

    const space = res.memorial_spaces || {};
    const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const cfg = (typeof zmgGcashQr !== 'undefined' ? zmgGcashQr.getConfig() : null) || ZMG_PAYMENT_CONFIG.gcash;

    const purposeMap = {
        charge_initial: (res.payment_method === 'INSTALLMENT' ? 'Down Payment (Initial Reservation)' : 'Full Payment (Initial Reservation)'),
        pay_schedule: `Monthly Installment #${schedule?.installment_no || ''}`,
        pay_balance: 'Full Balance Payoff'
    };
    const purposeText = purposeMap[action] || 'Memorial Space Payment';

    const pEl = document.getElementById('zmgQpmPurpose');
    const aEl = document.getElementById('zmgQpmAmount');
    const plotEl = document.getElementById('zmgQpmPlotInfo');
    const mNameEl = document.getElementById('zmgQpmMerchantName');
    const mNumEl = document.getElementById('zmgQpmAccNum');
    const qrImgEl = document.getElementById('zmgQpmQrImg');
    const refInput = document.getElementById('zmgQpmRefNumber');
    const proofInput = document.getElementById('zmgQpmProofInput');
    const proofBox = document.getElementById('zmgQpmProofPreviewBox');
    const proofThumb = document.getElementById('zmgQpmProofThumb');
    const proofName = document.getElementById('zmgQpmProofFileName');
    const submitBtn = document.getElementById('zmgQpmSubmitBtn');

    if (pEl) pEl.textContent = purposeText;
    if (aEl) aEl.textContent = peso(amount);
    if (plotEl) plotEl.textContent = `${space.plot_identifier || 'Plot'} • ${space.section_name || 'Zion Memorial Garden'} (${res.reservation_number || ''})`;
    if (mNameEl) mNameEl.textContent = cfg.merchantName || 'Zion Memorial Garden Inc.';
    if (mNumEl) mNumEl.textContent = cfg.accountNumber || '0945 187 6774';
    if (qrImgEl) qrImgEl.src = cfg.qrImageUrl || 'assets/images/gcash-qr-default.svg';
    if (refInput) refInput.value = '';
    if (proofInput) proofInput.value = '';
    if (proofBox) proofBox.style.display = 'none';

    let localProofDataUrl = null;
    if (proofInput) {
        proofInput.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const resImg = await zmgGcashQr.readAndCompressImageFile(file, 800, 800, 0.85);
                localProofDataUrl = resImg.dataUrl;
                if (proofThumb) proofThumb.src = resImg.dataUrl;
                if (proofName) proofName.textContent = file.name;
                if (proofBox) proofBox.style.display = 'flex';
            } catch (_) {}
        };
    }

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm GCash Payment';
        submitBtn.onclick = async () => {
            const refVal = refInput?.value?.trim() || '';
            if (!refVal || refVal.length < 6) {
                alert('Please enter a valid GCash Transaction Reference Number (at least 6 digits/characters from your GCash confirmation SMS or receipt).');
                refInput?.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Recording Payment...';

            const payAmt = Number(amount);
            const paymentType = action === 'charge_initial'
                ? (res.payment_method === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT')
                : (action === 'pay_balance' ? 'FULL_PAYMENT' : 'INSTALLMENT');

            const newTotalPaid = Number((Number(res.total_paid || 0) + payAmt).toFixed(2));
            const newBalance = Number(Math.max(0, Number(res.total_price || 0) - newTotalPaid).toFixed(2));
            const newStatus = newBalance <= 0 ? 'COMPLETED' : res.status;

            try {
                if (typeof supabaseClient !== 'undefined') {
                    // 1. Insert into public.payments
                    await supabaseClient.from('payments').insert([{
                        reservation_id: res.id,
                        payment_reference: refVal,
                        amount: payAmt,
                        payment_type: paymentType,
                        payment_method: 'GCash',
                        status: 'COMPLETED',
                        due_date: schedule?.due_date || new Date().toISOString().split('T')[0],
                        paid_at: new Date().toISOString(),
                        receipt_url: localProofDataUrl || null
                    }]);

                    // 2. Update payment_schedules if applicable
                    if (schedule?.id) {
                        await supabaseClient.from('payment_schedules').update({
                            status: 'PAID',
                            payment_reference: refVal,
                            paid_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }).eq('id', schedule.id);
                    }

                    // 3. Update reservation balance & total_paid
                    await supabaseClient.from('reservations').update({
                        total_paid: newTotalPaid,
                        balance: newBalance,
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    }).eq('id', res.id);
                }

                modal.classList.remove('active');

                // 4. Fetch User Profile & Issue Receipt
                let clientName = 'Valued Client';
                let clientEmail = '';
                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (user) {
                        clientEmail = user.email || '';
                        const { data: prof } = await supabaseClient.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
                        clientName = prof?.full_name || user.email?.split('@')[0] || 'Valued Client';
                    }
                } catch (_) {}

                const receiptData = {
                    paymentTag: 'PAID',
                    reservationNumber: res.reservation_number || `ZMG-${res.id}`,
                    paymentReference: refVal,
                    paymentChannel: 'GCash (Official QR Payment)',
                    gcashReference: refVal,
                    dateIssued: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                    clientName,
                    clientEmail,
                    plotIdentifier: space.plot_identifier || 'Plot',
                    sectionName: space.section_name || 'Zion Memorial Garden',
                    category: space.category || 'Memorial Space',
                    planType: res.plan_type || 'PRE-NEED',
                    paymentOption: res.payment_method || 'INSTALLMENT',
                    termMonths: res.installment_term_months || 60,
                    totalPrice: Number(res.total_price || 0),
                    amountNow: payAmt,
                    remainingBalance: newBalance,
                    monthlyAmortization: Number(res.monthly_amortization || 0),
                    counterInstructions: `OFFICIAL GCASH QR PAYMENT VERIFIED (TAG: PAID • Ref: ${refVal}). Certified by Zion Memorial Garden.`
                };

                if (typeof generateAndDownloadReceiptPDF === 'function') {
                    generateAndDownloadReceiptPDF(receiptData);
                }
                if (typeof sendReceiptViaEmailJS === 'function') {
                    sendReceiptViaEmailJS(receiptData);
                }
                if (typeof showOfficialReceiptModal === 'function') {
                    showOfficialReceiptModal(receiptData);
                }

                if (typeof onSuccess === 'function') await onSuccess();
            } catch (err) {
                console.error('GCash QR payment error:', err);
                alert('Could not record GCash payment: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm GCash Payment';
            }
        };
    }

    modal.classList.add('active');
}
window.openGcashQrPaymentModal = openGcashQrPaymentModal;
window.zmgOpenGcashQrPaymentModal = openGcashQrPaymentModal;

// ==============================================================================
// TEST MODE BANK PAYMENT MODAL & TRANSACTIONS
// ==============================================================================
function openTestBankPaymentModal({ res, schedule, amount, action, onSuccess }) {
    injectPaymentAndReceiptUI();
    const modal = document.getElementById('zmgBankPaymentModal');
    if (!modal) return;

    const space = res.memorial_spaces || {};
    const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const purposeMap = {
        charge_initial: (res.payment_method === 'INSTALLMENT' ? 'Down Payment (Initial Reservation)' : 'Full Payment (Initial Reservation)'),
        pay_schedule: `Monthly Installment #${schedule?.installment_no || ''}`,
        pay_balance: 'Full Balance Payoff'
    };
    const purposeText = purposeMap[action] || 'Memorial Space Payment';

    const pEl = document.getElementById('zmgBpmPurpose');
    const aEl = document.getElementById('zmgBpmAmount');
    const plotEl = document.getElementById('zmgBpmPlotInfo');
    const bSelect = document.getElementById('zmgBpmBankSelect');
    const bAcc = document.getElementById('zmgBpmAccNum');
    const bBranch = document.getElementById('zmgBpmBranch');
    const bRef = document.getElementById('zmgBpmRefNumber');
    const authBtn = document.getElementById('zmgAuthorizeBankModalBtn');

    if (pEl) pEl.textContent = purposeText;
    if (aEl) aEl.textContent = peso(amount);
    if (plotEl) plotEl.textContent = `${space.plot_identifier || 'Plot'} • ${space.section_name || 'Zion Memorial Garden'} (${res.reservation_number || ''})`;

    if (bSelect && bSelect.options.length > 0) {
        bSelect.selectedIndex = 0;
        const opt = bSelect.options[0];
        const code = opt.getAttribute('data-code') || 'BNK';
        const acc = opt.getAttribute('data-acc') || '';
        const branch = opt.getAttribute('data-branch') || '';
        const type = opt.getAttribute('data-type') || '';
        if (bAcc) bAcc.textContent = acc;
        if (bBranch) bBranch.textContent = `${branch} • ${type}`;
        if (bRef) bRef.value = 'BNK-TEST-' + code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (authBtn) {
        authBtn.disabled = false;
        authBtn.innerHTML = `Authorize &amp; Pay ${peso(amount)} (Test Mode)`;
        authBtn.onclick = async () => {
            authBtn.disabled = true;
            authBtn.innerHTML = 'Authorizing Test Transfer...';

            const opt = bSelect?.options[bSelect.selectedIndex];
            const bankName = opt?.text || 'BDO Unibank';
            const refNumber = bRef?.value || `BNK-TEST-${Date.now().toString(36).toUpperCase()}`;

            const paymentType = action === 'charge_initial'
                ? (res.payment_method === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT')
                : (action === 'pay_balance' ? 'FULL_PAYMENT' : 'INSTALLMENT');

            const payAmt = Number(amount);
            let newTotalPaid = Number((Number(res.total_paid || 0) + payAmt).toFixed(2));
            let newBalance = Number(Math.max(0, Number(res.total_price || 0) - newTotalPaid).toFixed(2));
            let newStatus = newBalance <= 0 ? 'COMPLETED' : res.status;

            let handled = false;

            // 1. Try Edge Function bank_test_pay
            try {
                const edgeRes = await zmgGcashApi('bank_test_pay', {
                    reservation_id: res.id,
                    schedule_id: schedule?.id || null,
                    amount: payAmt,
                    bank_name: bankName,
                    reference: refNumber,
                    payment_type: paymentType
                });
                if (edgeRes?.status === 'SUCCEEDED') {
                    handled = true;
                    newTotalPaid = Number(edgeRes.reservation?.total_paid ?? newTotalPaid);
                    newBalance = Number(edgeRes.reservation?.balance ?? newBalance);
                    newStatus = edgeRes.reservation?.status ?? newStatus;
                }
            } catch (edgeErr) {
                console.warn('Edge Function bank_test_pay fallback:', edgeErr.message);
            }

            // 2. Try Supabase RPC
            if (!handled && typeof supabaseClient !== 'undefined') {
                try {
                    const { data: rpcRes, error: rpcErr } = await supabaseClient.rpc('zmg_record_bank_payment_test', {
                        p_reservation_id: res.id,
                        p_schedule_id: schedule?.id || null,
                        p_amount: payAmt,
                        p_bank_name: bankName,
                        p_payment_ref: refNumber,
                        p_payment_type: paymentType
                    });
                    if (!rpcErr && rpcRes?.success) {
                        handled = true;
                        newTotalPaid = Number(rpcRes.total_paid ?? newTotalPaid);
                        newBalance = Number(rpcRes.balance ?? newBalance);
                        newStatus = rpcRes.status ?? newStatus;
                    }
                } catch (rpcEx) {
                    console.warn('RPC bank payment fallback:', rpcEx.message);
                }
            }

            // 3. Direct DB fallback
            if (!handled && typeof supabaseClient !== 'undefined') {
                try {
                    await supabaseClient.from('payments').insert([{
                        reservation_id: res.id,
                        schedule_id: schedule?.id || null,
                        payment_reference: refNumber,
                        amount: payAmt,
                        payment_type: paymentType,
                        payment_method: 'Bank Transfer',
                        status: 'COMPLETED',
                        paid_at: new Date().toISOString()
                    }]);

                    if (schedule?.id) {
                        await supabaseClient.from('payment_schedules').update({
                            status: 'PAID',
                            payment_reference: refNumber,
                            paid_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }).eq('id', schedule.id);
                    }

                    await supabaseClient.from('reservations').update({
                        total_paid: newTotalPaid,
                        balance: newBalance,
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    }).eq('id', res.id);
                } catch (dbErr) {
                    console.error('Direct DB fallback failed:', dbErr);
                }
            }

            modal.classList.remove('active');

            // Fetch user profile info for receipt
            let clientName = 'Valued Client';
            let clientEmail = '';
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) {
                    clientEmail = user.email || '';
                    const { data: prof } = await supabaseClient.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
                    clientName = prof?.full_name || prof?.username || user.user_metadata?.full_name || clientEmail.split('@')[0] || 'Valued Client';
                }
            } catch (_) {}

            const receiptData = {
                paymentTag: 'PAID',
                reservationNumber: res.reservation_number || 'ZMG-RES',
                paymentReference: refNumber,
                paymentChannel: `Bank Transfer (${bankName} - Test Mode)`,
                gcashReference: refNumber,
                dateIssued: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                clientName,
                clientEmail,
                plotIdentifier: space.plot_identifier || 'Plot',
                sectionName: space.section_name || 'Zion Memorial Garden',
                category: space.category || 'Memorial Space',
                planType: res.plan_type || 'PRE-NEED',
                paymentOption: res.payment_method || 'INSTALLMENT',
                termMonths: res.installment_term_months || 0,
                totalPrice: Number(res.total_price || 0),
                amountNow: payAmt,
                remainingBalance: newBalance,
                monthlyAmortization: Number(res.monthly_amortization || 0),
                counterInstructions: `ONLINE BANK PAYMENT AUTHORIZED IN TEST MODE (TAG: PAID • ${bankName} • Ref: ${refNumber}). Verified via Zion Memorial Garden test sandbox. Please retain this receipt for Zion Memorial Garden contract signing.`
            };

            generateAndDownloadReceiptPDF(receiptData);
            const emailResult = await sendReceiptViaEmailJS(receiptData);
            showOfficialReceiptModal(receiptData, emailResult);

            if (typeof onSuccess === 'function') {
                await onSuccess();
            }
        };
    }

    modal.classList.add('active');
}

// Load reservations, installment schedules and GCash auto-debit status into the Payments Tab
async function loadMonthlyDuesIntoGcashTab() {
    const listContainer = document.getElementById('zmgGcashMonthlyDuesList');
    if (!listContainer || typeof supabaseClient === 'undefined') return;

    const peso = (n) => '₱ ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            listContainer.innerHTML = `<div style="padding:14px; color:#64748b;">Please log in to view your dues.</div>`;
            return;
        }

        const { data: reservations, error } = await supabaseClient
            .from('reservations')
            .select(`
                id, reservation_number, plan_type, payment_method, installment_term_months,
                total_price, down_payment_amount, monthly_amortization, total_paid, balance,
                status, reservation_date,
                memorial_spaces ( plot_identifier, section_name, category )
            `)
            .eq('user_id', user.id)
            .not('status', 'in', '(CANCELLED,REJECTED)')
            .order('created_at', { ascending: false });
        if (error) throw error;

        const active = (reservations || []).filter(r => Number(r.balance ?? r.total_price ?? 0) > 0);
        if (active.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 18px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; text-align: center; color: #475569; font-size: 0.94rem;">
                    You have no outstanding dues. Reserved plots with a remaining balance will appear here.
                </div>`;
            return;
        }

        const ids = active.map(r => r.id);
        const [{ data: schedules }, { data: payments }] = await Promise.all([
            supabaseClient.from('payment_schedules').select('*').in('reservation_id', ids).order('installment_no', { ascending: true }),
            supabaseClient.from('payments').select('reservation_id, payment_type, status, amount, payment_reference, failure_reason, created_at').in('reservation_id', ids).order('created_at', { ascending: false })
        ]);

        const acct = getLinkedGcashAccount();
        const autoOn = Boolean(acct?.autoDebit);

        listContainer.innerHTML = active.map(res => {
            const space = res.memorial_spaces || {};
            const resSchedules = (schedules || []).filter(s => s.reservation_id === res.id);
            const resPayments = (payments || []).filter(p => p.reservation_id === res.id);
            const paidCount = resSchedules.filter(s => s.status === 'PAID').length;
            const next = resSchedules.find(s => ['PENDING', 'FAILED', 'PROCESSING'].includes(s.status));
            const initialPaid = resPayments.some(p => ['DOWN_PAYMENT', 'FULL_PAYMENT'].includes(p.payment_type) && p.status === 'COMPLETED')
                || Number(res.total_paid || 0) >= (res.payment_method === 'INSTALLMENT' ? Number(res.down_payment_amount || 0) : Number(res.total_price || 0));
            const initialProcessing = resPayments.some(p => ['DOWN_PAYMENT', 'FULL_PAYMENT'].includes(p.payment_type) && p.status === 'PENDING');
            const initialAmount = res.payment_method === 'INSTALLMENT'
                ? Math.max(Number(res.down_payment_amount || 0) - Number(res.total_paid || 0), 0)
                : Number(res.balance || 0);
            const lastFailed = resPayments.find(p => p.status === 'FAILED');

            const statusBadge = (s) => {
                const map = {
                    PENDING: ['#eff6ff', '#1d4ed8', autoOn ? 'Auto-debit scheduled' : 'Due'],
                    PROCESSING: ['#fef9c3', '#a16207', 'Processing'],
                    FAILED: ['#fee2e2', '#b91c1c', `Failed (${s.attempts}/3) — retrying`],
                    PAID: ['#dcfce7', '#15803d', 'Paid']
                };
                const [bg, fg, label] = map[s.status] || ['#f1f5f9', '#334155', s.status];
                return `<span style="font-size: 0.76rem; padding: 3px 9px; border-radius: 999px; background: ${bg}; color: ${fg}; font-weight: 800;">${label}</span>`;
            };

            const upcomingRows = resSchedules
                .filter(s => s.status !== 'CANCELLED')
                .slice(Math.max(paidCount - 1, 0), Math.max(paidCount - 1, 0) + 5)
                .map(s => `
                    <tr>
                        <td style="padding: 7px 8px;">#${s.installment_no}</td>
                        <td style="padding: 7px 8px;">${esc(s.due_date)}</td>
                        <td style="padding: 7px 8px; text-align: right; font-weight: 700;">${peso(s.amount)}</td>
                        <td style="padding: 7px 8px; text-align: right;">${statusBadge(s)}</td>
                    </tr>`).join('');

            return `
                <div style="padding: 18px 20px; margin-bottom: 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                                <strong style="font-size: 1.04rem; color: #0f172a;">${esc(space.plot_identifier || 'Plot')} — ${esc(space.section_name || 'Zion Memorial Garden')}</strong>
                                <span style="font-size: 0.78rem; padding: 2px 8px; border-radius: 6px; background: #dbeafe; color: #1e40af; font-weight: 700;">${esc(res.reservation_number)}</span>
                                <span style="font-size: 0.78rem; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #334155; font-weight: 700;">${res.payment_method === 'INSTALLMENT' ? `Installment • ${paidCount}/${res.installment_term_months} paid` : 'Full Payment'}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #475569;">
                                Paid: <strong>${peso(res.total_paid)}</strong> &bull;
                                Remaining Balance: <strong style="color: #b45309;">${peso(res.balance)}</strong>
                                ${next ? ` &bull; Next due: <strong style="color: #0f172a;">${esc(next.due_date)}</strong> (${peso(next.amount)})` : ''}
                            </div>
                            ${lastFailed && !initialPaid ? `<div style="margin-top: 6px; font-size: 0.84rem; color: #b91c1c;">Last GCash attempt failed: ${esc(lastFailed.failure_reason || 'Declined')}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${!initialPaid ? `
                                <button type="button" class="zmg-qr-pay-btn" data-action="charge_initial" data-res-id="${res.id}" data-amount="${initialAmount}"
                                    style="padding: 10px 14px; background: #0284c7; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    📱 GCash QR (${peso(initialAmount)})
                                </button>
                                <button type="button" class="zmg-gcash-action-btn" data-action="charge_initial" data-res-id="${res.id}" ${initialProcessing ? 'disabled' : ''}
                                    style="padding: 10px 14px; background: #0057ff; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    ${initialProcessing ? 'Processing...' : `💳 Auto-Debit (${peso(initialAmount)})`}
                                </button>
                                <button type="button" class="zmg-bank-pay-btn" data-action="charge_initial" data-res-id="${res.id}" data-amount="${initialAmount}"
                                    style="padding: 10px 14px; background: #047857; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    &#127974; Bank Pay (Test) (${peso(initialAmount)})
                                </button>` : ''}
                            ${initialPaid && next && next.status !== 'PROCESSING' ? `
                                <button type="button" class="zmg-qr-pay-btn" data-action="pay_schedule" data-schedule-id="${next.id}" data-res-id="${res.id}" data-amount="${next.amount}"
                                    style="padding: 10px 14px; background: #0284c7; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    📱 GCash QR (${peso(next.amount)})
                                </button>
                                <button type="button" class="zmg-gcash-action-btn" data-action="pay_schedule" data-schedule-id="${next.id}" data-res-id="${res.id}"
                                    style="padding: 10px 14px; background: #0057ff; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    💳 Auto-Debit (${peso(next.amount)})
                                </button>
                                <button type="button" class="zmg-bank-pay-btn" data-action="pay_schedule" data-schedule-id="${next.id}" data-res-id="${res.id}" data-amount="${next.amount}"
                                    style="padding: 10px 14px; background: #047857; color: #fff; border: none; border-radius: 9px; font-size: 0.88rem; font-weight: 800; cursor: pointer;">
                                    &#127974; Bank Pay (Test) (${peso(next.amount)})
                                </button>` : ''}
                            ${initialPaid ? `
                                <button type="button" class="zmg-qr-pay-btn" data-action="pay_balance" data-res-id="${res.id}" data-amount="${res.balance}"
                                    style="padding: 10px 14px; background: #f0fdf4; color: #0284c7; border: 1.5px solid #0284c7; border-radius: 9px; font-size: 0.86rem; font-weight: 800; cursor: pointer;">
                                    📱 GCash QR Full (${peso(res.balance)})
                                </button>
                                <button type="button" class="zmg-gcash-action-btn" data-action="pay_balance" data-res-id="${res.id}"
                                    style="padding: 10px 14px; background: #ffffff; color: #0f172a; border: 1.5px solid #0f172a; border-radius: 9px; font-size: 0.86rem; font-weight: 800; cursor: pointer;">
                                    Pay Full (GCash) (${peso(res.balance)})
                                </button>
                                <button type="button" class="zmg-bank-pay-btn" data-action="pay_balance" data-res-id="${res.id}" data-amount="${res.balance}"
                                    style="padding: 10px 14px; background: #ffffff; color: #047857; border: 1.5px solid #047857; border-radius: 9px; font-size: 0.86rem; font-weight: 800; cursor: pointer;">
                                    &#127974; Bank Pay Full (Test) (${peso(res.balance)})
                                </button>` : ''}
                        </div>
                    </div>
                    ${upcomingRows ? `
                        <table style="width: 100%; margin-top: 12px; border-collapse: collapse; font-size: 0.86rem; color: #334155; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <thead><tr style="background: #f1f5f9; text-align: left;">
                                <th style="padding: 7px 8px;">Installment</th><th style="padding: 7px 8px;">Due Date</th>
                                <th style="padding: 7px 8px; text-align: right;">Amount</th><th style="padding: 7px 8px; text-align: right;">Status</th>
                            </tr></thead>
                            <tbody>${upcomingRows}</tbody>
                        </table>` : ''}
                </div>`;
        }).join('');

        listContainer.querySelectorAll('.zmg-qr-pay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const resId = Number(btn.getAttribute('data-res-id'));
                const scheduleId = Number(btn.getAttribute('data-schedule-id') || 0);
                const amount = Number(btn.getAttribute('data-amount') || 0);
                const res = active.find(r => r.id === resId);
                if (!res) return;
                const sched = (schedules || []).find(s => s.id === scheduleId);

                openGcashQrPaymentModal({
                    res,
                    schedule: sched,
                    amount,
                    action,
                    onSuccess: async () => {
                        await loadMonthlyDuesIntoGcashTab();
                        if (typeof window.loadMyReservations === 'function') window.loadMyReservations();
                        if (typeof window.refreshDashboardKPIs === 'function') {
                            const { data: { user } } = await supabaseClient.auth.getUser();
                            if (user) window.refreshDashboardKPIs(user.id);
                        }
                    }
                });
            });
        });

        listContainer.querySelectorAll('.zmg-gcash-action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!getLinkedGcashAccount()) {
                    alert('Please link your GCash first (Step 1 above).');
                    return;
                }
                const action = btn.getAttribute('data-action');
                const resId = Number(btn.getAttribute('data-res-id'));
                const scheduleId = Number(btn.getAttribute('data-schedule-id') || 0);
                const res = active.find(r => r.id === resId);
                if (!res) return;

                const confirmMsg = action === 'pay_balance'
                    ? `Deduct the FULL remaining balance (₱${Number(res.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}) from your linked GCash now?`
                    : 'Deduct this payment from your linked GCash now?';
                if (!await showConfirmModal({
                    title: "Confirm GCash Payment",
                    message: confirmMsg,
                    confirmText: "Pay with GCash",
                    cancelText: "Cancel",
                    type: "question"
                })) return;

                btn.disabled = true;
                const originalHtml = btn.innerHTML;
                btn.textContent = 'Charging GCash...';
                try {
                    const payload = action === 'pay_schedule' ? { schedule_id: scheduleId } : { reservation_id: resId };
                    const result = await zmgRunGcashCharge(action, payload);
                    if (result.status === 'FAILED') {
                        alert('GCash payment failed: ' + (result.failure || 'Declined') + '\nNo money was deducted.');
                    } else {
                        await zmgShowGcashPaymentReceipt(res, action, result);
                    }
                } catch (err) {
                    alert('GCash payment error: ' + err.message);
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                    await loadMonthlyDuesIntoGcashTab();
                    if (typeof window.loadMyReservations === 'function') window.loadMyReservations();
                }
            });
        });

        listContainer.querySelectorAll('.zmg-bank-pay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const resId = Number(btn.getAttribute('data-res-id'));
                const scheduleId = Number(btn.getAttribute('data-schedule-id') || 0);
                const amount = Number(btn.getAttribute('data-amount') || 0);
                const res = active.find(r => r.id === resId);
                if (!res) return;
                const sched = (schedules || []).find(s => s.id === scheduleId);

                openTestBankPaymentModal({
                    res,
                    schedule: sched,
                    amount,
                    action,
                    onSuccess: async () => {
                        await loadMonthlyDuesIntoGcashTab();
                        if (typeof window.loadMyReservations === 'function') window.loadMyReservations();
                        if (typeof window.refreshDashboardKPIs === 'function') {
                            const { data: { user } } = await supabaseClient.auth.getUser();
                            if (user) window.refreshDashboardKPIs(user.id);
                        }
                    }
                });
            });
        });
    } catch (err) {
        console.error('Error loading dues into Payments tab:', err);
        listContainer.innerHTML = `<div style="padding:14px; color:#dc2626;">Could not load dues: ${esc(err.message)}. Make sure sql/06_gcash_autodebit.sql has been run.</div>`;
    }
}

window.openTestBankPaymentModal = openTestBankPaymentModal;
window.loadMonthlyDuesIntoGcashTab = loadMonthlyDuesIntoGcashTab;
window.isCurrentUserStaffOrAdmin = isCurrentUserStaffOrAdmin;
window.detectCurrentUserStaffRole = detectCurrentUserStaffRole;
window.openGcashPaymentsFullPage = openGcashPaymentsFullPage;
window.closeGcashPaymentsFullPage = closeGcashPaymentsFullPage;

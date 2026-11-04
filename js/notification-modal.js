// ==============================================================================
// ZION MEMORIAL GARDEN - COMPREHENSIVE MODAL & DIALOG SYSTEM
// Replaces native browser alert(), confirm(), prompt() with modern Afacad UI
// Supports: Success, Error, Warning, Info, Confirm Dialogs, Input Prompts
// ==============================================================================

(function() {
    'use strict';

    // Auto-inject CSS stylesheet if not already present
    function ensureStylesheet() {
        if (!document.querySelector('link[href*="notification-modal.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/notification-modal.css';
            document.head.appendChild(link);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureStylesheet);
    } else {
        ensureStylesheet();
    }

    // High quality vector icons
    const ICONS = {
        'email-verification': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
                <circle cx="18" cy="18" r="3" fill="#2B9348" stroke="#F9F4EE" stroke-width="2"></circle>
                <polyline points="17,18 17.8,19 19.2,17" stroke="#FFFFFF" stroke-width="1.5"></polyline>
            </svg>
        `,
        'success': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `,
        'error': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `,
        'danger': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `,
        'warning': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `,
        'info': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `,
        'question': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `,
        'confirm': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `,
        'prompt': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
        `
    };

    let activeConfirmHandler = null;
    let activeCancelHandler = null;
    let activeResolve = null;
    let activeReject = null;
    let isPromptActive = false;
    let isModalOpen = false;
    const modalQueue = [];

    // Ensure DOM structure exists
    function getOrCreateModal() {
        let overlay = document.getElementById('notifModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'notifModalOverlay';
            overlay.className = 'notif-modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML = `
                <div class="notif-modal-card" id="notifModalCard">
                    <button type="button" class="notif-modal-close" id="notifModalClose" aria-label="Close dialog">&times;</button>
                    <div class="notif-icon-wrapper" id="notifIconWrapper"></div>
                    <h3 class="notif-modal-title" id="notifModalTitle">Notification</h3>
                    <div class="notif-modal-desc" id="notifModalDesc"></div>
                    <div class="notif-prompt-wrapper" id="notifPromptWrapper" style="display: none;">
                        <input type="text" id="notifPromptInput" class="notif-input" autocomplete="off" />
                    </div>
                    <div id="notifCustomContent"></div>
                    <div class="notif-actions" id="notifActions">
                        <button type="button" class="notif-btn notif-btn-secondary" id="notifCancelBtn" style="display: none;">Cancel</button>
                        <button type="button" class="notif-btn notif-btn-primary" id="notifConfirmBtn">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const closeBtn = overlay.querySelector('#notifModalClose');
            const confirmBtn = overlay.querySelector('#notifConfirmBtn');
            const cancelBtn = overlay.querySelector('#notifCancelBtn');
            const promptInput = overlay.querySelector('#notifPromptInput');

            closeBtn.addEventListener('click', () => {
                triggerCancel();
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    triggerCancel();
                }
            });

            confirmBtn.addEventListener('click', () => {
                triggerConfirm();
            });

            cancelBtn.addEventListener('click', () => {
                triggerCancel();
            });

            promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    triggerConfirm();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (!isModalOpen) return;
                if (e.key === 'Escape') {
                    e.preventDefault();
                    triggerCancel();
                } else if (e.key === 'Enter' && !isPromptActive && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    triggerConfirm();
                }
            });
        }
        return overlay;
    }

    function triggerConfirm() {
        const overlay = document.getElementById('notifModalOverlay');
        const promptInput = overlay?.querySelector('#notifPromptInput');
        const val = isPromptActive ? (promptInput ? promptInput.value : '') : true;

        const handler = activeConfirmHandler;
        const resolve = activeResolve;

        closeModal();

        if (typeof handler === 'function') handler(val);
        if (typeof resolve === 'function') resolve(val);
    }

    function triggerCancel() {
        const handler = activeCancelHandler;
        const resolve = activeResolve;

        closeModal();

        const cancelVal = isPromptActive ? null : false;
        if (typeof handler === 'function') handler(cancelVal);
        if (typeof resolve === 'function') resolve(cancelVal);
    }

    function closeModal() {
        const overlay = document.getElementById('notifModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                isModalOpen = false;

                // Process next modal in queue if any
                if (modalQueue.length > 0) {
                    const nextModal = modalQueue.shift();
                    nextModal();
                }
            }, 220);
        }
        activeConfirmHandler = null;
        activeCancelHandler = null;
        activeResolve = null;
        activeReject = null;
        isPromptActive = false;
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

    /**
     * Checks if message contains structured key: value pairs and formats them neatly
     */
    function formatMessageContent(message) {
        if (!message) return '';
        const lines = String(message).split('\n');
        
        // Check if there are key-value formatted lines like "Role: ADMIN"
        const hasKv = lines.some(l => /^[A-Za-z\s]{3,18}:\s*.+$/.test(l.trim()));
        
        if (!hasKv) {
            return escapeHtml(message);
        }

        let intro = [];
        let kvItems = [];
        let outro = [];
        let stage = 'intro';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const isKv = /^[A-Za-z\s]{3,18}:\s*.+$/.test(trimmed);
            if (isKv) {
                stage = 'kv';
                const colonIdx = trimmed.indexOf(':');
                const key = trimmed.substring(0, colonIdx).trim();
                const val = trimmed.substring(colonIdx + 1).trim();
                kvItems.push(`<div><strong>${escapeHtml(key)}:</strong> <span>${escapeHtml(val)}</span></div>`);
            } else if (stage === 'kv') {
                stage = 'outro';
                outro.push(escapeHtml(trimmed));
            } else {
                intro.push(escapeHtml(trimmed));
            }
        }

        let html = '';
        if (intro.length > 0) {
            html += `<p style="margin: 0 0 10px 0;">${intro.join('<br>')}</p>`;
        }
        if (kvItems.length > 0) {
            html += `<div class="notif-details-box">${kvItems.join('')}</div>`;
        }
        if (outro.length > 0) {
            html += `<p style="margin: 10px 0 0 0; color: #4B5563;">${outro.join('<br>')}</p>`;
        }

        return html;
    }

    /**
     * Main Show Notification Modal
     * Returns a Promise resolving when the user confirms or cancels
     */
    function showNotificationModal({
        type = 'info',
        title = 'Notification',
        message = '',
        email = '',
        hint = '',
        confirmText = 'OK',
        cancelText = 'Cancel',
        showCancel = false,
        danger = false,
        isPrompt = false,
        defaultValue = '',
        placeholder = '',
        inputType = 'text',
        onConfirm = null,
        onCancel = null
    }) {
        // If modal already open, enqueue
        if (isModalOpen) {
            return new Promise((resolve, reject) => {
                modalQueue.push(() => {
                    showNotificationModal({
                        type, title, message, email, hint, confirmText, cancelText,
                        showCancel, danger, isPrompt, defaultValue, placeholder,
                        inputType, onConfirm, onCancel
                    }).then(resolve).catch(reject);
                });
            });
        }

        return new Promise((resolve, reject) => {
            isModalOpen = true;
            const overlay = getOrCreateModal();
            const card = overlay.querySelector('#notifModalCard');
            const iconWrapper = overlay.querySelector('#notifIconWrapper');
            const titleEl = overlay.querySelector('#notifModalTitle');
            const descEl = overlay.querySelector('#notifModalDesc');
            const customEl = overlay.querySelector('#notifCustomContent');
            const confirmBtn = overlay.querySelector('#notifConfirmBtn');
            const cancelBtn = overlay.querySelector('#notifCancelBtn');
            const promptWrapper = overlay.querySelector('#notifPromptWrapper');
            const promptInput = overlay.querySelector('#notifPromptInput');

            // Set Card Classes
            card.className = `notif-modal-card notif-type-${type}`;

            // Set Icon
            iconWrapper.innerHTML = ICONS[type] || ICONS['info'];

            // Set Title & Message
            titleEl.textContent = title;
            descEl.innerHTML = formatMessageContent(message);

            // Handle Prompt Input
            isPromptActive = !!isPrompt;
            if (isPrompt) {
                promptWrapper.style.display = 'block';
                promptInput.type = inputType || 'text';
                promptInput.placeholder = placeholder || '';
                promptInput.value = defaultValue || '';
            } else {
                promptWrapper.style.display = 'none';
            }

            // Custom HTML content for email / tips
            let customHtml = '';
            if (email) {
                customHtml += `
                    <div class="notif-email-badge">
                        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <span>${escapeHtml(email)}</span>
                    </div>
                `;
            }
            if (hint) {
                customHtml += `
                    <div class="notif-hint-box">
                        <strong>Tip:</strong> ${hint}
                    </div>
                `;
            }
            customEl.innerHTML = customHtml;

            // Configure Action Buttons
            confirmBtn.textContent = confirmText;
            confirmBtn.className = 'notif-btn notif-btn-primary' + (danger ? ' notif-btn-danger' : '');

            if (showCancel) {
                cancelBtn.textContent = cancelText;
                cancelBtn.style.display = 'inline-flex';
            } else {
                cancelBtn.style.display = 'none';
            }

            activeConfirmHandler = onConfirm;
            activeCancelHandler = onCancel;
            activeResolve = resolve;
            activeReject = reject;

            // Display modal
            overlay.style.display = 'flex';
            void overlay.offsetWidth; // Force layout reflow
            overlay.classList.add('active');

            // Focus management
            setTimeout(() => {
                if (isPrompt && promptInput) {
                    promptInput.focus();
                    promptInput.select();
                } else if (confirmBtn) {
                    confirmBtn.focus();
                }
            }, 50);
        });
    }

    // Convenience Dialog Helpers
    function showSuccessModal(title, message, onConfirm) {
        return showNotificationModal({
            type: 'success',
            title: title || 'Success',
            message: message,
            confirmText: 'Continue',
            onConfirm: onConfirm
        });
    }

    function showErrorModal(title, message, onConfirm) {
        return showNotificationModal({
            type: 'error',
            title: title || 'Action Failed',
            message: message,
            confirmText: 'Understood',
            onConfirm: onConfirm
        });
    }

    function showWarningModal(title, message, onConfirm) {
        return showNotificationModal({
            type: 'warning',
            title: title || 'Notice',
            message: message,
            confirmText: 'Understood',
            onConfirm: onConfirm
        });
    }

    function showInfoModal(title, message, onConfirm) {
        return showNotificationModal({
            type: 'info',
            title: title || 'Information',
            message: message,
            confirmText: 'OK',
            onConfirm: onConfirm
        });
    }

    function showConfirmModal({
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'question',
        danger = false,
        onConfirm = null,
        onCancel = null
    } = {}) {
        return showNotificationModal({
            type: type || (danger ? 'danger' : 'question'),
            title: title,
            message: message,
            confirmText: confirmText,
            cancelText: cancelText,
            showCancel: true,
            danger: danger,
            onConfirm: onConfirm,
            onCancel: onCancel
        });
    }

    function customConfirm(message, title = 'Confirm Action', options = {}) {
        return showConfirmModal({
            message,
            title,
            ...options
        });
    }

    function showPromptModal({
        title = 'Input Required',
        message = 'Please enter a value:',
        defaultValue = '',
        placeholder = '',
        inputType = 'text',
        confirmText = 'OK',
        cancelText = 'Cancel',
        onConfirm = null,
        onCancel = null
    } = {}) {
        return showNotificationModal({
            type: 'prompt',
            title: title,
            message: message,
            isPrompt: true,
            defaultValue: defaultValue,
            placeholder: placeholder,
            inputType: inputType,
            confirmText: confirmText,
            cancelText: cancelText,
            showCancel: true,
            onConfirm: onConfirm,
            onCancel: onCancel
        });
    }

    function customPrompt(message, defaultValue = '', title = 'Input Required', options = {}) {
        return showPromptModal({
            message,
            defaultValue,
            title,
            ...options
        });
    }

    function showEmailVerificationModal(email, onProceedToLogin) {
        return showNotificationModal({
            type: 'email-verification',
            title: 'Verify Your Email Address',
            message: 'Your registration was submitted successfully! We sent a confirmation link to activate your account:',
            email: email,
            hint: 'Please open your email inbox and click the verification link. If you do not see it within a couple of minutes, please check your Spam or Junk folder.',
            confirmText: 'Go to Sign In',
            showCancel: true,
            cancelText: 'Close',
            onConfirm: () => {
                if (typeof onProceedToLogin === 'function') onProceedToLogin();
            }
        });
    }

    /**
     * Smart Alert Override:
     * Intercepts native alert() and presents our polished Afacad modal dialog
     */
    function showSmartAlert(message, title, type) {
        const msgStr = message !== undefined && message !== null ? String(message) : '';
        const lower = msgStr.toLowerCase();

        // Smart type classification
        let computedType = type;
        let computedTitle = title;

        if (!computedType) {
            if (/error|failed|fail|cannot|could not|invalid|denied|denies|rejected|wrong|exception/i.test(lower)) {
                computedType = 'error';
                computedTitle = computedTitle || 'Error';
            } else if (/suspended/i.test(lower)) {
                computedType = 'warning';
                computedTitle = computedTitle || 'Account Suspended';
            } else if (/suspend|caution|warning|cancel|cancelled|canceled|attention|required/i.test(lower)) {
                computedType = 'warning';
                computedTitle = computedTitle || 'Notice';
            } else if (/success|successfully|saved|created|updated|approved|completed|confirmed|activated|verified/i.test(lower)) {
                computedType = 'success';
                computedTitle = computedTitle || 'Success';
            } else {
                computedType = 'info';
                computedTitle = computedTitle || 'Notification';
            }
        }

        // Custom contextual titles
        if (!title) {
            if (msgStr.includes('User account has been set to')) {
                computedTitle = 'Account Status Updated';
            } else if (msgStr.includes('Permission Denied') || msgStr.includes('Access Denied')) {
                computedTitle = 'Access Restricted';
            } else if (msgStr.includes('Account Created Successfully')) {
                computedTitle = 'Account Created';
            } else if (msgStr.includes('Account Updated Successfully')) {
                computedTitle = 'Account Updated';
            }
        }

        return showNotificationModal({
            type: computedType,
            title: computedTitle || 'Notice',
            message: msgStr,
            confirmText: 'OK',
            showCancel: false
        });
    }

    // Preserve native alert and install smart modal override
    if (typeof window !== 'undefined') {
        window._nativeAlert = window.alert;
        window.alert = showSmartAlert;

        // Preserve native confirm & prompt as fallback
        window._nativeConfirm = window.confirm;
        window._nativePrompt = window.prompt;

        // Expose public API
        window.showNotificationModal = showNotificationModal;
        window.showSuccessModal = showSuccessModal;
        window.showErrorModal = showErrorModal;
        window.showWarningModal = showWarningModal;
        window.showInfoModal = showInfoModal;
        window.showConfirmModal = showConfirmModal;
        window.customConfirm = customConfirm;
        window.showPromptModal = showPromptModal;
        window.customPrompt = customPrompt;
        window.showEmailVerificationModal = showEmailVerificationModal;
        window.closeNotificationModal = closeModal;
    }
})();

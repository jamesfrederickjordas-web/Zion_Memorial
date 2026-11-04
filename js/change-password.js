// ==============================================================================
// CHANGE PASSWORD CONTROLLER (Profile Password Management)
// ==============================================================================

function initChangePasswordModule() {
    setupChangePasswordEventListeners();
}

function setupChangePasswordEventListeners() {
    const overlayComponent = document.getElementById("change-password-modal-component");
    const closeBtn = document.getElementById("closeChangePasswordBtn");
    const cancelBtn = document.getElementById("cancelChangePasswordBtn");
    const form = document.getElementById("changePasswordForm");

    // Close Modal on Close button
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            closeChangePasswordModal();
        });
    }

    // Close Modal on Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            closeChangePasswordModal();
        });
    }

    // Close on backdrop click
    if (overlayComponent) {
        overlayComponent.addEventListener("click", (e) => {
            if (e.target === overlayComponent) {
                closeChangePasswordModal();
            }
        });
    }

    // Toggle password visibility buttons
    document.querySelectorAll(".toggle-pwd-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                btn.textContent = "Hide";
            } else {
                input.type = "password";
                btn.textContent = "Show";
            }
        });
    });

    // Wire up Password Change form submission
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const errorMsg = document.getElementById("changePasswordErrorMsg");
            const submitBtn = document.getElementById("saveChangePasswordBtn");

            const showError = (msg) => {
                if (errorMsg) {
                    errorMsg.textContent = msg;
                    errorMsg.style.display = "block";
                } else {
                    alert(msg);
                }
            };

            const clearError = () => {
                if (errorMsg) {
                    errorMsg.textContent = "";
                    errorMsg.style.display = "none";
                }
            };

            clearError();

            const currentPassword = document.getElementById("currentPasswordInput")?.value || "";
            const newPassword = document.getElementById("newPasswordInput")?.value || "";
            const confirmPassword = document.getElementById("confirmPasswordInput")?.value || "";

            // 1. Client-side input validations
            if (!currentPassword) {
                showError("Please enter your current (past) password.");
                return;
            }

            if (!newPassword) {
                showError("Please enter your new password.");
                return;
            }

            if (newPassword.length < 6) {
                showError("New password must be at least 6 characters long.");
                return;
            }

            if (newPassword !== confirmPassword) {
                showError("New password and confirmation do not match.");
                return;
            }

            if (newPassword === currentPassword) {
                showError("New password must be different from your current password.");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Verifying & Updating...";
            }

            try {
                // 2. Fetch authenticated user session
                const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
                if (userErr || !user || !user.email) {
                    throw new Error("Your session has expired. Please log in again.");
                }

                // 3. Re-authenticate to verify past / current password
                const { error: verifyErr } = await supabaseClient.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });

                if (verifyErr) {
                    throw new Error("Incorrect current / past password. Please double-check and try again.");
                }

                // 4. Update to the new password
                const { error: updateErr } = await supabaseClient.auth.updateUser({
                    password: newPassword
                });

                if (updateErr) throw updateErr;

                // 5. Success cleanup
                form.reset();
                clearError();
                closeChangePasswordModal();

                // Reset visibility buttons to "Show"
                document.querySelectorAll(".toggle-pwd-btn").forEach((btn) => {
                    btn.textContent = "Show";
                    const targetId = btn.getAttribute("data-target");
                    const input = document.getElementById(targetId);
                    if (input) input.type = "password";
                });

                if (typeof showSuccessModal === "function") {
                    showSuccessModal("Password Updated", "Your password has been changed successfully. You can now use your new password next time you sign in.");
                } else {
                    alert("Password updated successfully! Your account is now secured with your new password.");
                }

            } catch (err) {
                console.error("Change password error:", err);
                showError(err.message || "Failed to update password. Please try again.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Update Password";
                }
            }
        });
    }
}

function openChangePasswordModal() {
    const modal = document.getElementById("change-password-modal-component");
    if (!modal) return;

    // Reset error & form
    const form = document.getElementById("changePasswordForm");
    if (form) form.reset();

    const errorMsg = document.getElementById("changePasswordErrorMsg");
    if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
    }

    // Reset show/hide toggles
    document.querySelectorAll(".toggle-pwd-btn").forEach((btn) => {
        btn.textContent = "Show";
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (input) input.type = "password";
    });

    modal.style.display = "flex";
    modal.classList.add("active");

    setTimeout(() => {
        document.getElementById("currentPasswordInput")?.focus();
    }, 100);
}

function closeChangePasswordModal() {
    const modal = document.getElementById("change-password-modal-component");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.initChangePasswordModule = initChangePasswordModule;


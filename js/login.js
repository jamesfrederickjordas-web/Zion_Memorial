// =========================================
// LOGIN FUNCTIONALITY (Supabase)
// =========================================

function initLogin() {
    const loginModal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const loginClose = document.querySelector(".login-close");
    const showRegisterLink = document.getElementById("showRegisterLink");

    // Helper: determine if user is staff or admin and redirect accordingly
    async function redirectByUserRole(user, fallbackEmail = '') {
        if (!user && !fallbackEmail) return false;

        const userId = user?.id || '';
        let dbRole = '';

        if (userId && typeof supabaseClient !== 'undefined') {
            try {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .maybeSingle();

                if (profile && profile.role) {
                    dbRole = String(profile.role).toLowerCase().trim();
                }
            } catch (err) {
                console.warn('Could not query role from profiles table:', err);
            }
        }

        const metaRole = String(user?.user_metadata?.role || user?.app_metadata?.role || '').toLowerCase().trim();
        const emailLower = String(user?.email || fallbackEmail || '').toLowerCase().trim();

        const isStaffOrAdmin =
            dbRole === 'admin' ||
            dbRole === 'staff' ||
            metaRole === 'admin' ||
            metaRole === 'staff' ||
            emailLower.startsWith('admin') ||
            emailLower.startsWith('staff');

        const resolvedRole = isStaffOrAdmin ? (dbRole || metaRole || (emailLower.startsWith('admin') ? 'admin' : 'staff')) : 'client';
        sessionStorage.setItem("userRole", resolvedRole);

        if (isStaffOrAdmin) {
            // Staff/Admin goes directly to admin.html
            window.location.href = "admin.html";
        } else {
            // Clients go to client portal dashboard.html
            window.location.href = "dashboard.html";
        }
        return true;
    }

    // Position the login dropdown
    function positionModal(modal, button) {
        const rect = button.getBoundingClientRect();
        modal.style.top = (rect.bottom + window.scrollY + 10) + "px";
        modal.style.left = (rect.right + window.scrollX - 320) + "px";
    }

    // Open Login from main header button
    if (loginBtn) {
        loginBtn.onclick = async (e) => {
            e.stopPropagation();
            if (typeof supabaseClient !== 'undefined') {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session && session.user) {
                        await redirectByUserRole(session.user);
                        return;
                    }
                } catch (err) {
                    console.warn('Session check warning:', err);
                }
            }
            positionModal(loginModal, loginBtn);
            loginModal.style.display = "block";
            const registerModal = document.getElementById("registerModal");
            if (registerModal) registerModal.style.display = "none";
        };
    }

    // Open Login from popup page buttons
    const popupLoginBtns = document.querySelectorAll('.popup-login-btn');
    popupLoginBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (typeof supabaseClient !== 'undefined') {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session && session.user) {
                        await redirectByUserRole(session.user);
                        return;
                    }
                } catch (err) {
                    console.warn('Session check warning:', err);
                }
            }
            positionModal(loginModal, btn);
            loginModal.style.display = "block";
            const registerModal = document.getElementById("registerModal");
            if (registerModal) registerModal.style.display = "none";
        });
    });

    // Close login
    if (loginClose) {
        loginClose.onclick = () => loginModal.style.display = "none";
    }

    // Switch to register
    if (showRegisterLink) {
        showRegisterLink.onclick = (e) => {
            e.preventDefault();
            loginModal.style.display = "none";
            const registerModal = document.getElementById("registerModal");
            if (registerModal) registerModal.style.display = "flex";
        };
    }

    // Close when clicking outside
    window.addEventListener('click', (event) => {
        if (loginModal && loginModal.style.display === "block" && 
            !loginModal.contains(event.target) && 
            event.target !== loginBtn) {
            loginModal.style.display = "none";
        }
    });

    // Handle login form submission with Supabase
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            const rememberMe = document.getElementById("rememberMe").checked;
            
            if (!email || !password) {
                alert("Please fill in all fields");
                return;
            }

            try {
                // Sign in with Supabase
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    alert("Login failed: " + error.message);
                    return;
                }

                // Save session info
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("userEmail", email);
                sessionStorage.setItem("userId", data.user.id);

                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                }

                // Redirect directly to Staff/Admin (admin.html) or Client (dashboard.html) based on role
                await redirectByUserRole(data.user, email);

            } catch (err) {
                console.error(err);
                alert("Something went wrong. Please try again.");
            }
        });
    }

    // Load remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        const emailInput = document.getElementById("loginEmail");
        const rememberCheckbox = document.getElementById("rememberMe");
        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    // Toggle password visibility
    const loginEyeIcon = document.querySelector(".login-eye-icon");
    if (loginEyeIcon) {
        loginEyeIcon.addEventListener('click', function() {
            const passwordInput = document.getElementById("loginPassword");
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initLogin };
}

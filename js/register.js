// =========================================
// REGISTRATION FUNCTIONALITY (Supabase)
// =========================================

function initRegister() {
    const registerModal = document.getElementById("registerModal");
    const registerBtn = document.getElementById("registerBtn");
    const registerClose = document.querySelector(".register-close");
    const switchToLogin = document.getElementById("switchToLogin");

    // Open Register
    if (registerBtn) {
        registerBtn.onclick = (e) => {
            e.preventDefault();
            registerModal.style.display = "flex";
            const loginModal = document.getElementById("loginModal");
            if (loginModal) loginModal.style.display = "none";
        };
    }

    // Close register
    if (registerClose) {
        registerClose.onclick = () => registerModal.style.display = "none";
    }

    // Switch to login
    if (switchToLogin) {
        switchToLogin.onclick = (e) => {
            e.preventDefault();
            registerModal.style.display = "none";
            
            const loginModal = document.getElementById("loginModal");
            if (loginModal) {
                loginModal.style.display = "block";
            }
        };
    }

    // Close when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === registerModal) {
            registerModal.style.display = "none";
        }
    });

    // Phone number validation - only numbers, max 11 digits
    const phoneInput = document.getElementById("regPhone");
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            e.target.value = value;
        });

        phoneInput.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
                alert("Numbers only! Please enter digits 0-9");
            }
        });
    }

    // Handle registration form submission with Supabase
    const registerForm = document.getElementById("newRegisterForm");
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById("regFullName").value.trim();
            const username = document.getElementById("regUsername").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const phone = document.getElementById("regPhone").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;

            // Validate phone number
            if (phone && !/^\d{11}$/.test(phone)) {
                if (typeof showErrorModal === 'function') {
                    showErrorModal("Invalid Phone Number", "Phone number must be exactly 11 digits (e.g. 09123456789).");
                } else {
                    alert("Phone number must be exactly 11 digits!");
                }
                return;
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                if (typeof showErrorModal === 'function') {
                    showErrorModal("Password Mismatch", "Passwords do not match. Please verify and re-enter.");
                } else {
                    alert("Passwords do not match!");
                }
                return;
            }

            if (password.length < 6) {
                if (typeof showErrorModal === 'function') {
                    showErrorModal("Password Too Short", "Password must be at least 6 characters long.");
                } else {
                    alert("Password must be at least 6 characters!");
                }
                return;
            }

            try {
                // Create account + send metadata for the trigger
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName,
                            username: username,
                            phone: phone || null
                        }
                    }
                });

                if (error) {
                    if (typeof showErrorModal === 'function') {
                        showErrorModal("Registration Failed", error.message);
                    } else {
                        alert("Registration failed: " + error.message);
                    }
                    return;
                }

                // Hide register modal
                registerModal.style.display = "none";
                
                // Reset form
                registerForm.reset();

                // Show modern email verification notification modal
                if (typeof showEmailVerificationModal === 'function') {
                    showEmailVerificationModal(email, () => {
                        // On confirm, switch to login modal
                        const loginModal = document.getElementById("loginModal");
                        if (loginModal) {
                            loginModal.style.display = "block";
                        }
                    });
                } else {
                    alert("Registration successful!\n\nPlease check your email and click the verification link.\nAfter verifying, you can log in.");
                }

            } catch (err) {
                console.error(err);
                if (typeof showErrorModal === 'function') {
                    showErrorModal("Unexpected Error", "Something went wrong while connecting. Please try again.");
                } else {
                    alert("Something went wrong. Please try again.");
                }
            }
        });
    }

    // Toggle password visibility for both password fields
    const toggleIcons = document.querySelectorAll('.toggle-password');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const inputWrapper = this.closest('.input-wrapper');
            const input = inputWrapper.querySelector('input[type="password"], input[type="text"]');
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                } else {
                    input.type = 'password';
                }
            }
        });
    });
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initRegister };
}

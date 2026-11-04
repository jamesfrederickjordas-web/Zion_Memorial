// ==============================================================================
// EDIT PROFILE CONTROLLER (Personal Information & Avatar Management)
// ==============================================================================

let stagedAvatarDataUrl = null;

async function initEditProfilePage() {
    setupEditProfileEventListeners();
}

function setupEditProfileEventListeners() {
    const editProfileBtn = document.getElementById("editProfileBtn");
    const closeBtn = document.getElementById("closeEditProfileBtn");
    const overlayComponent = document.getElementById("edit-profile-page-component");
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const form = document.getElementById("editProfileForm");

    // Open Modal
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openEditProfileModal();
        });
    }

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            closeEditProfileModal();
        });
    }

    // Close on overlay backdrop click
    if (overlayComponent) {
        overlayComponent.addEventListener("click", (e) => {
            if (e.target === overlayComponent) {
                closeEditProfileModal();
            }
        });
    }

    // Avatar upload trigger
    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener("click", () => {
            avatarInput.click();
        });
    }

    // Avatar file selection with client-side canvas scaling to clean base64 data URL
    if (avatarInput) {
        avatarInput.addEventListener("change", (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file (JPG, PNG, WEBP).");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxDim = 320;
                    let w = img.width;
                    let h = img.height;

                    if (w > h) {
                        if (w > maxDim) {
                            h = Math.round((h * maxDim) / w);
                            w = maxDim;
                        }
                    } else {
                        if (h > maxDim) {
                            w = Math.round((w * maxDim) / h);
                            h = maxDim;
                        }
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);

                    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                    stagedAvatarDataUrl = dataUrl;

                    if (avatarPreview) {
                        avatarPreview.src = dataUrl;
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Save Profile Form Submission
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (typeof supabaseClient === "undefined") {
                alert("Database connection is not initialized.");
                return;
            }

            const submitBtn = document.getElementById("saveProfileBtn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Saving Profile...";
            }

            try {
                const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
                if (userErr || !user) {
                    alert("Your session has expired. Please log in again.");
                    window.location.href = "index.html";
                    return;
                }

                const fullName = (document.getElementById("editFullName")?.value || "").trim();
                const username = (document.getElementById("editUsername")?.value || "").trim();
                const phone = (document.getElementById("editPhone")?.value || "").trim();

                if (!fullName || !username) {
                    alert("Please provide both full name and username.");
                    return;
                }

                const updatePayload = {
                    full_name: fullName,
                    username: username,
                    phone: phone || null,
                    updated_at: new Date().toISOString()
                };

                if (stagedAvatarDataUrl) {
                    updatePayload.avatar_url = stagedAvatarDataUrl;
                    localStorage.setItem("userProfilePicture", stagedAvatarDataUrl);
                }

                // 1. Update profiles table
                const { error: profileUpdateError } = await supabaseClient
                    .from("profiles")
                    .update(updatePayload)
                    .eq("id", user.id);

                if (profileUpdateError) throw profileUpdateError;

                // 2. Sync Supabase auth user_metadata
                try {
                    await supabaseClient.auth.updateUser({
                        data: {
                            full_name: fullName,
                            username: username,
                            phone: phone || null
                        }
                    });
                } catch (metaErr) {
                    console.warn("Auth metadata sync notice:", metaErr);
                }

                // 3. Update DOM in Profile Modal instantly
                const nameDisplay = document.getElementById("profileDisplayName");
                if (nameDisplay) nameDisplay.textContent = fullName.toUpperCase();

                const usernameDisplay = document.getElementById("profileUsernameDisplay");
                if (usernameDisplay) usernameDisplay.textContent = username;

                const fullNameEl = document.getElementById("profileFullName");
                if (fullNameEl) fullNameEl.textContent = fullName;

                const usernameEl = document.getElementById("profileUsername");
                if (usernameEl) usernameEl.textContent = username;

                const phoneEl = document.getElementById("profilePhone");
                if (phoneEl) phoneEl.textContent = phone || "Not set";

                if (stagedAvatarDataUrl) {
                    const profilePic = document.getElementById("profilePicture");
                    if (profilePic) profilePic.src = stagedAvatarDataUrl;

                    document.querySelectorAll(".profile-user-btn img, .user-btn img").forEach((img) => {
                        img.src = stagedAvatarDataUrl;
                    });
                }

                // 4. Close modal & alert
                closeEditProfileModal();

                if (typeof showSuccessModal === "function") {
                    showSuccessModal("Profile Updated", "Your profile details have been saved successfully.");
                } else {
                    alert("Profile updated successfully!");
                }

            } catch (err) {
                console.error("Profile save error:", err);
                alert("Failed to update profile: " + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Save Changes";
                }
            }
        });
    }
}

async function openEditProfileModal() {
    const editProfilePage = document.getElementById("edit-profile-page-component");
    if (!editProfilePage) return;

    editProfilePage.style.display = "flex";
    editProfilePage.classList.add("active");

    stagedAvatarDataUrl = null;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        const fullName = profile?.full_name || user.user_metadata?.full_name || "";
        const username = profile?.username || user.user_metadata?.username || user.email.split("@")[0];
        const phone = profile?.phone || user.user_metadata?.phone || "";
        const email = user.email || "";
        const avatarUrl = profile?.avatar_url || localStorage.getItem("userProfilePicture") || "assets/images/icons/image 6.png";

        const fullNameInput = document.getElementById("editFullName");
        const usernameInput = document.getElementById("editUsername");
        const emailInput = document.getElementById("editEmail");
        const phoneInput = document.getElementById("editPhone");
        const avatarPreview = document.getElementById("avatarPreview");

        if (fullNameInput) fullNameInput.value = fullName;
        if (usernameInput) usernameInput.value = username;
        if (emailInput) emailInput.value = email;
        if (phoneInput) phoneInput.value = phone;
        if (avatarPreview) avatarPreview.src = avatarUrl;

    } catch (err) {
        console.warn("Notice loading profile details:", err);
    }
}

function closeEditProfileModal() {
    const editProfilePage = document.getElementById("edit-profile-page-component");
    if (editProfilePage) {
        editProfilePage.style.display = "none";
        editProfilePage.classList.remove("active");
    }
}

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.initEditProfilePage = initEditProfilePage;

// =========================================
// MAIN APPLICATION ENTRY POINT
// =========================================

document.addEventListener("DOMContentLoaded", async function() {
    // Handle Supabase email verification redirect if user lands on index.html
    if (typeof supabaseClient !== 'undefined') {
        const hasAuthCallback = window.location.hash.includes('access_token') || window.location.search.includes('code=');
        if (hasAuthCallback) {
            const urlParams = new URLSearchParams(window.location.search);
            const authCode = urlParams.get('code');
            if (authCode) {
                await supabaseClient.auth.exchangeCodeForSession(authCode);
            }
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("userEmail", session.user.email || "");
                sessionStorage.setItem("userId", session.user.id);
                window.location.href = "dashboard.html";
                return;
            }
        }
    }

    // Initialize login functionality
    if (typeof initLogin === 'function') {
        initLogin();
    }

    // Initialize register functionality
    if (typeof initRegister === 'function') {
        initRegister();
    }

    // Add any other global initialization here
    console.log("Zion Memorial Garden - Application Loaded");
});

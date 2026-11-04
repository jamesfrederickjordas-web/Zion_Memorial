// =========================================
// MAIN APPLICATION ENTRY POINT
// =========================================

document.addEventListener("DOMContentLoaded", function() {
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

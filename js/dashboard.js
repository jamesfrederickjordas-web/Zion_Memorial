// =========================================
// SESSION CHECK - Redirect if not logged in
// =========================================
function checkSession() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn) {
        // User is not logged in, redirect to landing page
        alert("Please login first");
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// Check session on page load
if (!checkSession()) {
    // Stop script execution if not logged in
    throw new Error("Not authenticated");
}

// =========================================
// LOGOUT FUNCTIONALITY
// =========================================
const signoutBtn = document.querySelector('.signout-btn');

signoutBtn.addEventListener('click', async () => {
    if (await showConfirmModal({ title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", cancelText: "Cancel", type: "warning" })) {
        // Clear session
        sessionStorage.clear();
        localStorage.removeItem("rememberedEmail"); // Optional: clear remembered email
        
        // Redirect to landing page
        window.location.href = "index.html";
    }
});

// =========================================
// MENU TOGGLE FUNCTIONALITY
// =========================================
const menuBtn = document.querySelector('.menu-btn');
const userBtn = document.querySelector('.user-btn');
const sidebarMenu = document.getElementById('sidebarMenu');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');

// Open sidebar
menuBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
    overlay.classList.add('active');
});

// Close sidebar
closeBtn.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    overlay.classList.remove('active');
});

// Close sidebar when clicking overlay
overlay.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    overlay.classList.remove('active');
});

userBtn.addEventListener('click', () => {
    const userEmail = sessionStorage.getItem("userEmail");
    alert(`User profile: ${userEmail}\n\nAdd your profile menu here`);
});

// =========================================
// PLOT INTERACTION
// =========================================
const plots = document.querySelectorAll('.plot');

plots.forEach(plot => {
    plot.addEventListener('click', function() {
        const plotNumber = this.getAttribute('data-plot');
        const isAvailable = this.classList.contains('available');
        
        if (isAvailable) {
            alert(`Plot ${plotNumber} is available. Would you like to make a reservation?`);
        } else {
            alert(`Plot ${plotNumber} is occupied.`);
        }
    });
});

// Reservation button
const reservationBtn = document.querySelector('.reservation-btn');

if (reservationBtn) {
    reservationBtn.addEventListener('click', () => {
        // Open reservation modal
        const reservationModal = document.querySelector('.reservation-modal-overlay');
        if (reservationModal) {
            reservationModal.classList.add('active');
        }
    });
}

// Payment history link
const paymentHistoryLink = document.querySelector('.payment-history');

paymentHistoryLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Opening payment history...');
});

// Add hover effect information
plots.forEach(plot => {
    plot.addEventListener('mouseenter', function() {
        const plotNumber = this.getAttribute('data-plot');
        const isAvailable = this.classList.contains('available');
        const status = isAvailable ? 'Available' : 'Occupied';
        
        // You can add a tooltip here if needed
        console.log(`Plot ${plotNumber}: ${status}`);
    });
});

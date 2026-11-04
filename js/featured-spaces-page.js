// ==============================================================================
// ZION MEMORIAL GARDEN - FEATURED SPACES & GALLERY SHOWCASE
// Manages the 6 Lawn Categories Showcase, Specifications, and Lightbox Gallery.
// ==============================================================================

(function() {
    const GALLERY_IMAGES = [
        { src: 'assets/images/backgrounds/imageone.png', caption: 'Supreme Garden - Manicured green lawn with shade trees' },
        { src: 'assets/images/backgrounds/imagetwo.png', caption: 'Special Supreme Estate - Raised marble markers and contoured borders' },
        { src: 'assets/images/backgrounds/imagetree.png', caption: 'Single Tiered Lawn - Classic peaceful lawns for pre-need security' },
        { src: 'assets/images/backgrounds/imagefour.png', caption: 'Family Estate - Clustered private lots for multi-generational rest' },
        { src: 'assets/images/backgrounds/imagefive.png', caption: 'Mausoleum Court - Private architectural crypts and memorial chapels' },
        { src: 'assets/images/backgrounds/imagesix.png', caption: 'Condominium Block A - Covered columbarium niches with granite tablets' },
        { src: 'assets/images/backgrounds/imageseven.png', caption: 'Memorial Park Walkway - Scenic tree-lined pedestrian avenue' },
        { src: 'assets/images/backgrounds/imageeight.png', caption: 'Sanctuary Gardens - Peaceful water fountain and meditation park' },
        { src: 'assets/images/backgrounds/image 9 (2).png', caption: 'Perpetual Care Grounds - Clean, manicured grounds maintained year-round' }
    ];

    let currentLightboxIdx = 0;

    function initFeaturedSpacesPage() {
        const page = document.getElementById('featuredSpacesPage');
        if (!page) return;

        // Wire Header Menu Button
        const menuBtn = document.getElementById('featuredSpacesMenuBtn');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('overlay');
        if (menuBtn && sidebarMenu && overlay) {
            menuBtn.onclick = () => {
                sidebarMenu.classList.add('active');
                overlay.classList.add('active');
            };
        }

        // Wire Header User Profile Button
        const userBtn = document.getElementById('featuredSpacesUserBtn');
        if (userBtn && typeof window.openProfileModal === 'function') {
            userBtn.onclick = () => {
                window.openProfileModal();
            };
        }

        // Wire Back to Dashboard
        const backBtn = document.getElementById('btnFeaturedBackToDashboard');
        if (backBtn) {
            backBtn.onclick = () => {
                page.classList.remove('active');
            };
        }

        // Wire Top "Make a Reservation" Button
        const makeResBtn = document.getElementById('btnFeaturedMakeReservation');
        if (makeResBtn) {
            makeResBtn.onclick = () => {
                if (typeof window.closeAllSubpages === 'function') window.closeAllSubpages();
                if (typeof window.openReservationModal === 'function') window.openReservationModal();
            };
        }

        // Wire Category Filter Tabs
        const tabBtns = page.querySelectorAll('.subpage-tab-btn');
        const cards = page.querySelectorAll('.featured-space-card');

        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-spaces-filter') || 'ALL';
                cards.forEach(card => {
                    const cardType = card.getAttribute('data-space-type');
                    if (filter === 'ALL' || cardType === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            };
        });

        // Wire Lightbox Close Button & Click Outside
        const lightbox = document.getElementById('featuredPhotoLightboxModal');
        const closeLightboxBtn = document.getElementById('closeFeaturedLightboxBtn');

        if (closeLightboxBtn && lightbox) {
            closeLightboxBtn.onclick = () => {
                lightbox.classList.remove('active');
            };
            lightbox.onclick = (e) => {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                }
            };
        }

        // Populate Lightbox Thumbnails
        const thumbContainer = document.getElementById('featuredLightboxThumbnails');
        if (thumbContainer) {
            thumbContainer.innerHTML = GALLERY_IMAGES.map((img, idx) => `
                <button type="button" class="featured-thumb-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" title="${escapeHtml(img.caption)}">
                    <img src="${img.src}" alt="Thumb ${idx + 1}">
                </button>
            `).join('');

            thumbContainer.querySelectorAll('.featured-thumb-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.getAttribute('data-idx'));
                    showLightboxIndex(idx);
                };
            });
        }

        // Keyboard navigation for Lightbox
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('featuredPhotoLightboxModal');
            if (!lb || !lb.classList.contains('active')) return;

            if (e.key === 'Escape') {
                lb.classList.remove('active');
            } else if (e.key === 'ArrowRight') {
                showLightboxIndex((currentLightboxIdx + 1) % GALLERY_IMAGES.length);
            } else if (e.key === 'ArrowLeft') {
                showLightboxIndex((currentLightboxIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
            }
        });

        console.log('Featured spaces page initialized');
    }

    function openFeaturedSpacesPage() {
        if (typeof window.closeAllSubpages === 'function') {
            window.closeAllSubpages();
        }
        if (typeof window.closeReservationModal === 'function') {
            window.closeReservationModal();
        }
        if (typeof window.closeProfileModal === 'function') {
            window.closeProfileModal();
        }

        const page = document.getElementById('featuredSpacesPage');
        if (page) {
            page.classList.add('active');
            page.scrollTop = 0;
        }

        // Sync avatar
        const mainAvatar = document.querySelector('.user-btn img');
        const pageAvatar = document.getElementById('featuredSpacesUserAvatar');
        if (mainAvatar && pageAvatar) {
            pageAvatar.src = mainAvatar.src;
        }
    }

    function openFeaturedLightbox(imgSrc, caption) {
        const lb = document.getElementById('featuredPhotoLightboxModal');
        if (!lb) return;

        const foundIdx = GALLERY_IMAGES.findIndex(img => img.src === imgSrc);
        showLightboxIndex(foundIdx >= 0 ? foundIdx : 0);
        lb.classList.add('active');
    }

    function showLightboxIndex(idx) {
        currentLightboxIdx = idx;
        const img = GALLERY_IMAGES[idx];
        if (!img) return;

        const mainImg = document.getElementById('featuredLightboxImg');
        const captionEl = document.getElementById('featuredLightboxCaption');

        if (mainImg) mainImg.src = img.src;
        if (captionEl) captionEl.textContent = img.caption;

        // Update active thumbnail
        const thumbs = document.querySelectorAll('.featured-thumb-btn');
        thumbs.forEach(t => {
            t.classList.toggle('active', parseInt(t.getAttribute('data-idx')) === idx);
        });
    }

    /**
     * Pre-select category and open reservation modal directly
     */
    function reserveSpecificCategory(catKey) {
        if (typeof window.closeAllSubpages === 'function') {
            window.closeAllSubpages();
        }
        if (typeof window.openReservationModal === 'function') {
            window.openReservationModal();
        }

        // Select the tab in reservation modal
        setTimeout(() => {
            const targetTab = document.querySelector(`.category-tab[data-category="${catKey}"]`);
            if (targetTab) {
                targetTab.click();
            }
        }, 150);
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

    // Expose to window
    window.initFeaturedSpacesPage = initFeaturedSpacesPage;
    window.openFeaturedSpacesPage = openFeaturedSpacesPage;
    window.openFeaturedLightbox = openFeaturedLightbox;
    window.reserveSpecificCategory = reserveSpecificCategory;
})();


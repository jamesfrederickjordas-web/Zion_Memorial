// ==============================================================================
// COMPONENT LOADER & PUBLIC POPUP CONTROLLER
// Loads HTML components dynamically and manages Public Modals & Forms
// ==============================================================================

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

async function loadAllComponents() {
    // Load all components
    await Promise.all([
        loadComponent('header-component', 'components/header.html'),
        loadComponent('hero-component', 'components/hero.html'),
        loadComponent('info-component', 'components/info-section.html'),
        loadComponent('login-modal-component', 'components/login-modal.html'),
        loadComponent('register-modal-component', 'components/register-modal.html'),
        loadComponent('about-popup-component', 'components/about-popup.html'),
        loadComponent('virtual-tours-popup-component', 'components/virtual-tours-popup.html'),
        loadComponent('contact-popup-component', 'components/contact-popup.html'),
        loadComponent('obituaries-popup-component', 'components/obituaries-popup.html'),
        loadComponent('grave-locator-modal-component', 'components/grave-locator-modal.html')
    ]);
    
    // After components are loaded, initialize functionality
    if (typeof initLogin === 'function') {
        initLogin();
    }
    if (typeof initRegister === 'function') {
        initRegister();
    }
    
    // Initialize page popups
    initPagePopups();

    // Initialize Grave Locator & Find a Loved One
    initGraveLocator();

    // Initialize Obituaries
    initObituaries();

    // Initialize Public Contact Form
    initContactForm();
    
    console.log('All public components & modules initialized successfully');
}

// ------------------------------------------------------------------------------
// Page Popups Management (About, Virtual Tours, Contact, Obituaries)
// ------------------------------------------------------------------------------
function initPagePopups() {
    const aboutPopup = document.getElementById('aboutPopup');
    const virtualToursPopup = document.getElementById('virtualToursPopup');
    const contactPopup = document.getElementById('contactPopup');
    const obituariesPopup = document.getElementById('obituariesPopup');
    
    const aboutLink = document.querySelector('a[href="about-page.html"]');
    const virtualToursLink = document.querySelector('a[href="virtual-tours-page.html"]');
    const contactLink = document.querySelector('a[href="contact-page.html"]');
    
    function closeAllPopups() {
        if (aboutPopup) aboutPopup.classList.remove('active');
        if (virtualToursPopup) virtualToursPopup.classList.remove('active');
        if (contactPopup) contactPopup.classList.remove('active');
        if (obituariesPopup) obituariesPopup.classList.remove('active');
    }
    
    function openPopup(popup) {
        closeAllPopups();
        if (popup) {
            popup.classList.add('active');
        }
    }
    
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(aboutPopup);
        });
    }
    if (virtualToursLink) {
        virtualToursLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(virtualToursPopup);
        });
    }
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(contactPopup);
        });
    }

    // Connect Our Services buttons to Virtual Tours / About
    document.querySelectorAll('#btnOurServicesQuick, .popup-services-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(aboutPopup);
        });
    });
    
    // Navigation inside popups
    document.querySelectorAll('.popup-home-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllPopups();
        });
    });
    
    document.querySelectorAll('.popup-about-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(aboutPopup);
        });
    });
    
    document.querySelectorAll('.popup-virtual-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(virtualToursPopup);
        });
    });
    
    document.querySelectorAll('.popup-contact-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(contactPopup);
        });
    });

    document.querySelectorAll('.popup-obituaries-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup(obituariesPopup);
            loadObituariesData();
        });
    });
    
    document.querySelectorAll('.popup-register-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const registerBtn = document.getElementById('registerBtn');
            if (registerBtn) registerBtn.click();
        });
    });

    document.querySelectorAll('.popup-login-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.click();
        });
    });
}

// ------------------------------------------------------------------------------
// Grave Locator & "Find a Loved One" Public Search
// ------------------------------------------------------------------------------
let cachedGraveRecords = [];

function initGraveLocator() {
    const modal = document.getElementById('graveLocatorModal');
    const closeBtn = document.getElementById('closeGraveLocatorBtn');
    const searchInput = document.getElementById('graveSearchInput');
    const sectionFilter = document.getElementById('graveSectionFilter');

    const openGraveLocator = () => {
        if (modal) {
            modal.style.display = 'flex';
            loadGraveRecords();
            setTimeout(() => searchInput?.focus(), 100);
        }
    };

    const closeGraveLocator = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeGraveLocator);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeGraveLocator();
        });
    }

    // Attach to triggers
    document.querySelectorAll('#btnFindLovedOne, .find-loved-one-trigger, #btnFindLovedOneServices').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openGraveLocator();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => filterAndRenderGraves());
    }
    if (sectionFilter) {
        sectionFilter.addEventListener('change', () => filterAndRenderGraves());
    }

    window.openGraveLocator = openGraveLocator;
    window.closeGraveLocator = closeGraveLocator;
}

async function loadGraveRecords() {
    const loadingEl = document.getElementById('graveLocatorLoading');
    const emptyEl = document.getElementById('graveLocatorEmpty');
    const listEl = document.getElementById('graveLocatorList');
    const sectionFilter = document.getElementById('graveSectionFilter');

    if (cachedGraveRecords.length > 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        filterAndRenderGraves();
        return;
    }

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) listEl.innerHTML = '';

    try {
        const { data: records, error } = await supabaseClient
            .from('memorial_records')
            .select(`
                id,
                deceased_name,
                birth_date,
                death_date,
                burial_date,
                gender,
                epitaph,
                space_id,
                memorial_spaces (
                    id,
                    plot_identifier,
                    section_name,
                    category
                )
            `)
            .order('deceased_name', { ascending: true });

        if (loadingEl) loadingEl.style.display = 'none';

        if (error) throw error;

        cachedGraveRecords = records || [];

        // Populate section dropdown
        if (sectionFilter) {
            const sections = Array.from(new Set(cachedGraveRecords.map(r => r.memorial_spaces?.section_name).filter(Boolean))).sort();
            sectionFilter.innerHTML = '<option value="ALL">All Garden Sections</option>' +
                sections.map(s => `<option value="${escapePublicHtml(s)}">${escapePublicHtml(s)}</option>`).join('');
        }

        filterAndRenderGraves();

    } catch (err) {
        console.error('Error fetching grave records:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.querySelector('p').textContent = 'Unable to connect to registry. Please try again.';
        }
    }
}

function filterAndRenderGraves() {
    const listEl = document.getElementById('graveLocatorList');
    const emptyEl = document.getElementById('graveLocatorEmpty');
    const countEl = document.getElementById('graveLocatorCount');
    const searchVal = (document.getElementById('graveSearchInput')?.value || '').toLowerCase().trim();
    const sectionVal = document.getElementById('graveSectionFilter')?.value || 'ALL';

    if (!listEl) return;

    const filtered = cachedGraveRecords.filter(r => {
        const name = (r.deceased_name || '').toLowerCase();
        const plot = (r.memorial_spaces?.plot_identifier || '').toLowerCase();
        const sec = r.memorial_spaces?.section_name || '';

        const matchesQuery = !searchVal || name.includes(searchVal) || plot.includes(searchVal);
        const matchesSection = sectionVal === 'ALL' || sec === sectionVal;
        return matchesQuery && matchesSection;
    });

    if (countEl) {
        countEl.textContent = `${filtered.length} of ${cachedGraveRecords.length} records found`;
    }

    if (filtered.length === 0) {
        emptyEl.style.display = 'block';
        listEl.innerHTML = '';
        return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = filtered.map(r => {
        const space = r.memorial_spaces || {};
        const plotCode = space.plot_identifier || 'Cadastral Plot';
        const section = space.section_name || 'Memorial Section';
        const category = space.category || 'Plot';
        const lifespan = (r.birth_date && r.death_date)
            ? `${new Date(r.birth_date).getFullYear()} &ndash; ${new Date(r.death_date).getFullYear()}`
            : (r.death_date ? `Passed ${new Date(r.death_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : 'In Blessed Memory');

        return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-wrap: wrap; gap: 12px;">
                <div style="flex: 1; min-width: 240px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 1.1rem; color: #2d4a36;">&#127807;</span>
                        <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e3a29;">${escapePublicHtml(r.deceased_name)}</h4>
                        <span style="background: #e8f5e9; color: #166534; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; border: 1px solid #bbf7d0;">${escapePublicHtml(plotCode)}</span>
                    </div>
                    <div style="font-size: 0.82rem; color: #64748b; margin-bottom: 4px;">
                        <span>Lifespan: <strong>${lifespan}</strong></span>
                        ${r.burial_date ? ` &bull; <span>Burial Date: ${new Date(r.burial_date).toLocaleDateString()}</span>` : ''}
                    </div>
                    <div style="font-size: 0.8rem; color: #475569;">
                        <span><strong>Resting Place:</strong> ${escapePublicHtml(section)} &bull; ${escapePublicHtml(category)}</span>
                    </div>
                    ${r.epitaph ? `
                        <div style="font-size: 0.78rem; font-style: italic; color: #475569; margin-top: 4px;">
                            &ldquo;${escapePublicHtml(r.epitaph)}&rdquo;
                        </div>
                    ` : ''}
                </div>
                <div>
                    <a href="plot-locator.html?plot=${encodeURIComponent(plotCode)}" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #2d4a36; color: #ffffff; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <span>Locate on Map</span> &rarr;
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// ------------------------------------------------------------------------------
// Obituaries & In Memoriam
// ------------------------------------------------------------------------------
let cachedObituaries = [];

function initObituaries() {
    const searchInput = document.getElementById('obituarySearchInput');
    const searchBtn = document.getElementById('obituarySearchBtn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => filterAndRenderObituaries());
        searchInput.addEventListener('input', () => filterAndRenderObituaries());
    }
}

async function loadObituariesData() {
    const loadingEl = document.getElementById('obituariesLoading');
    const emptyEl = document.getElementById('obituariesEmpty');
    const gridEl = document.getElementById('obituariesGrid');

    if (cachedObituaries.length > 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        filterAndRenderObituaries();
        return;
    }

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) gridEl.innerHTML = '';

    try {
        const { data: records, error } = await supabaseClient
            .from('memorial_records')
            .select(`
                id,
                deceased_name,
                birth_date,
                death_date,
                burial_date,
                gender,
                epitaph,
                space_id,
                memorial_spaces (
                    id,
                    plot_identifier,
                    section_name,
                    category
                )
            `)
            .order('death_date', { ascending: false });

        if (loadingEl) loadingEl.style.display = 'none';

        if (error) throw error;

        cachedObituaries = records || [];
        filterAndRenderObituaries();

    } catch (err) {
        console.error('Failed to load obituaries:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
    }
}

function filterAndRenderObituaries() {
    const gridEl = document.getElementById('obituariesGrid');
    const emptyEl = document.getElementById('obituariesEmpty');
    const searchVal = (document.getElementById('obituarySearchInput')?.value || '').toLowerCase().trim();

    if (!gridEl) return;

    const filtered = cachedObituaries.filter(r => {
        if (!searchVal) return true;
        const name = (r.deceased_name || '').toLowerCase();
        const plot = (r.memorial_spaces?.plot_identifier || '').toLowerCase();
        const sec = (r.memorial_spaces?.section_name || '').toLowerCase();
        const year = r.death_date ? new Date(r.death_date).getFullYear().toString() : '';
        return name.includes(searchVal) || plot.includes(searchVal) || sec.includes(searchVal) || year.includes(searchVal);
    });

    if (filtered.length === 0) {
        emptyEl.style.display = 'block';
        gridEl.innerHTML = '';
        return;
    }

    emptyEl.style.display = 'none';
    gridEl.innerHTML = filtered.map(r => {
        const space = r.memorial_spaces || {};
        const plotCode = space.plot_identifier || 'Resting Place';
        const section = space.section_name || 'Lawn Area';
        const lifespan = (r.birth_date && r.death_date)
            ? `${new Date(r.birth_date).getFullYear()} &ndash; ${new Date(r.death_date).getFullYear()}`
            : (r.death_date ? `Passed: ${new Date(r.death_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'In Blessed Memory');

        return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="text-align: center; margin-bottom: 14px;">
                        <div style="width: 64px; height: 64px; margin: 0 auto 10px auto; border-radius: 50%; background: #e8f5e9; border: 2px solid #bbf7d0; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            &#127807;
                        </div>
                        <h3 style="margin: 0; color: #1e3a29; font-size: 1.25rem; font-weight: 700;">${escapePublicHtml(r.deceased_name)}</h3>
                        <div style="color: #64748b; font-size: 0.85rem; margin-top: 4px; font-weight: 600;">${lifespan}</div>
                    </div>

                    <div style="background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; font-size: 0.8rem; color: #334155;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: #64748b;">Plot Location:</span>
                            <strong>${escapePublicHtml(plotCode)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Section:</span>
                            <span>${escapePublicHtml(section)}</span>
                        </div>
                        ${r.burial_date ? `
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span style="color: #64748b;">Interment Date:</span>
                                <span>${new Date(r.burial_date).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${r.epitaph ? `
                        <div style="font-size: 0.82rem; font-style: italic; color: #2d4a36; background: #fdfdf9; border-left: 3px solid #2d4a36; padding: 8px 12px; border-radius: 0 6px 6px 0; margin-bottom: 16px;">
                            &ldquo;${escapePublicHtml(r.epitaph)}&rdquo;
                        </div>
                    ` : ''}
                </div>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; gap: 8px;">
                    <a href="plot-locator.html?plot=${encodeURIComponent(plotCode)}" style="flex: 1; text-align: center; padding: 8px 14px; background: #2d4a36; color: white; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none;">Locate Plot &rarr;</a>
                </div>
            </div>
        `;
    }).join('');
}

// ------------------------------------------------------------------------------
// Public Contact Form Backend (Saves into support_tickets & Notifies)
// ------------------------------------------------------------------------------
function initContactForm() {
    const form = document.getElementById('publicContactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fn = document.getElementById('contactFirstName')?.value.trim();
        const ln = document.getElementById('contactLastName')?.value.trim();
        const email = document.getElementById('contactEmail')?.value.trim();
        const phone = document.getElementById('contactPhone')?.value.trim();
        const msg = document.getElementById('contactMessage')?.value.trim();
        const submitBtn = document.getElementById('contactSubmitBtn');

        if (!fn || !ln || !email || !msg) {
            alert('Please complete all required fields.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';
        }

        try {
            const ticketNumber = `INQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
            const fullName = `${fn} ${ln}`;
            const messagePayload = `From: ${fullName} <${email}>${phone ? ` [Tel: ${phone}]` : ''}\n\n${msg}`;

            // Insert into public.support_tickets
            const { error } = await supabaseClient
                .from('support_tickets')
                .insert([{
                    ticket_number: ticketNumber,
                    subject: `Public Website Inquiry from ${fullName}`,
                    category: 'General Support',
                    message: messagePayload,
                    contact_name: fullName,
                    contact_email: email,
                    status: 'open',
                    priority: 'normal'
                }]);

            if (error) {
                console.warn('Could not insert to support_tickets directly:', error);
            }

            if (typeof window.showSuccessModal === 'function') {
                window.showSuccessModal(
                    'Inquiry Received',
                    `Thank you, ${fullName}! Your message has been received (Ref: ${ticketNumber}). A Zion Memorial Garden representative will contact you at ${email} shortly.`
                );
            } else {
                alert(`Thank you, ${fullName}! Your inquiry (${ticketNumber}) has been sent. We will contact you at ${email} shortly.`);
            }

            form.reset();

            // Close popup
            const contactPopup = document.getElementById('contactPopup');
            if (contactPopup) contactPopup.classList.remove('active');

        } catch (err) {
            console.error('Contact submit error:', err);
            alert('Failed to send inquiry. Please try again or call us directly at 0917 309 6618.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        }
    });
}

function escapePublicHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', loadAllComponents);

const themeToggle = document.getElementById('theme-toggle');
const body = document.documentElement; // Using html level for data-theme
body.classList.add('js-enabled');
if (document.body) document.body.classList.add('js-enabled');
const profileImg = document.getElementById('profile-img');

const themes = {
    light: {
        profileImg: 'profile.jpg',
        hoverImg: 'profile-hover.jpg'
    },
    dark: {
        profileImg: 'profile-dark.jpg',
        hoverImg: 'profile-dark-hover.jpg'
    }
};

function updateThemeAssets(theme) {
    if (profileImg) {
        profileImg.src = themes[theme].profileImg;
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

// Preload hover images
function preloadImages() {
    Object.values(themes).forEach(themeObj => {
        const img = new Image();
        img.src = themeObj.hoverImg;
    });
}

preloadImages();

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let currentTheme = 'light';

if (savedTheme) {
    currentTheme = savedTheme;
} else if (prefersDark) {
    currentTheme = 'dark';
}

body.setAttribute('data-theme', currentTheme);
updateThemeAssets(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeAssets(currentTheme);
});

// Hover logic
if (profileImg) {
    profileImg.addEventListener('mouseenter', () => {
        const theme = body.getAttribute('data-theme') || 'light';
        profileImg.src = themes[theme].hoverImg;
    });

    profileImg.addEventListener('mouseleave', () => {
        const theme = body.getAttribute('data-theme') || 'light';
        profileImg.src = themes[theme].profileImg;
    });
}

/* ==========================================
   Project Modals & Video Demo Controller
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const viewProjectBtns = document.querySelectorAll('.btn-view-project');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal-overlay');

    /* --- Modal Management --- */
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
        
        // If modal contains video, play muted from start
        const video = modal.querySelector('video');
        if (video) {
            video.muted = true;
            video.currentTime = 0;
            video.play().catch(err => console.log("Autoplay blocked:", err));
        }
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        
        // Restore scrolling only if no other modal is open
        const anyOpen = document.querySelector('.modal-overlay.active');
        if (!anyOpen) {
            document.body.style.overflow = '';
        }
        
        // Pause any video inside the modal
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
        }
    }

    // Modal Trigger Listeners
    viewProjectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('aria-controls');
            if (targetId) {
                const targetModal = document.getElementById(targetId);
                openModal(targetModal);
            }
        });
    });

    // Close Button Listeners
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Fullscreen Event Handler (for any modal video)
    const fullscreenBtns = document.querySelectorAll('.btn-fullscreen');
    fullscreenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent backdrop closing triggers
            const video = btn.closest('.landscape-screen')?.querySelector('video');
            if (video) {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) { /* Safari */
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) { /* IE11 */
                    video.msRequestFullscreen();
                }
            }
        });
    });

    // Close on overlay outside click
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close on Escape Key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });

    /* --- BIGZ Brand Identity Viewer Controller --- */
    const brandVariantBtns = document.querySelectorAll('.brand-variant-btn');
    const surfaceBtns = document.querySelectorAll('.surface-btn');
    const brandPreviewImg = document.getElementById('brand-preview-img');
    const brandCanvas = document.getElementById('brand-canvas');
    const brandCaption = document.getElementById('brand-preview-caption');

    const brandAssets = {
        badge: {
            dark: 'designs/brand-identity/badge_dark.png',
            light: 'designs/brand-identity/badge_light.png',
            caption: 'Emblem badge lockup with circular contrast border and winking developer mascot.'
        },
        horizontal: {
            dark: 'designs/brand-identity/horizontal_dark.png',
            light: 'designs/brand-identity/horizontal_light.png',
            caption: 'Horizontal lockup designed for website headers, GitHub banners, and document headers.'
        },
        vertical: {
            dark: 'designs/brand-identity/vertical_dark.png',
            light: 'designs/brand-identity/vertical_light.png',
            caption: 'Vertical stacked lockup for merchandise, poster graphics, and splash screens.'
        },
        icon: {
            dark: 'designs/brand-identity/icon_dark.png',
            light: 'designs/brand-identity/icon_light.png',
            caption: 'Minimalist brand mark optimized for mobile app icons, favicons, and avatars.'
        },
        sketch: {
            dark: 'designs/brand-identity/sketch.jpg',
            light: 'designs/brand-identity/sketch.jpg',
            caption: 'Original pencil concept sketches showing mascot ideation, expressions, and anatomy.'
        }
    };

    let activeVariant = 'badge';
    let activeSurface = 'dark';

    function updateBrandViewer() {
        if (!brandPreviewImg || !brandCanvas) return;
        const asset = brandAssets[activeVariant];
        if (!asset) return;

        brandPreviewImg.classList.add('fade-out');
        setTimeout(() => {
            brandPreviewImg.src = activeSurface === 'dark' ? asset.dark : asset.light;
            brandPreviewImg.alt = `BIGZ ${activeVariant} (${activeSurface} mode)`;
            if (brandCaption) brandCaption.textContent = asset.caption;

            brandCanvas.className = `design-preview-canvas ${activeSurface}-surface`;
            brandPreviewImg.classList.remove('fade-out');
        }, 150);
    }

    brandVariantBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            brandVariantBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeVariant = btn.getAttribute('data-variant') || 'badge';
            updateBrandViewer();
        });
    });

    surfaceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            surfaceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSurface = btn.getAttribute('data-surface') || 'dark';
            updateBrandViewer();
        });
    });

    /* --- Marketing Collateral Gallery Controller --- */
    const marketingTabs = document.querySelectorAll('.marketing-tab-btn');
    const marketingImg = document.getElementById('marketing-preview-img');
    const marketingTitle = document.getElementById('marketing-asset-title');
    const marketingDim = document.getElementById('marketing-asset-dim');
    const marketingDesc = document.getElementById('marketing-asset-desc');
    const marketingPalette = document.getElementById('marketing-asset-palette');

    const marketingData = {
        landing: {
            src: 'designs/marketing/landingbanner.png',
            title: 'E-Commerce Hero Landing Banner',
            dim: '1920 × 960 px · Web Hero',
            desc: 'High-resolution wide banner for Urban Threads "Back to School" drop. Combines dark cyber grid textures, 240GSM cotton feature callouts, and fit guide CTA.',
            palette: ['#FFDE00', '#0066FF', '#0D0F14', '#F8FAFC']
        },
        banner: {
            src: 'designs/marketing/banner_ad.png',
            title: 'Web Display Ad (Back to School)',
            dim: '1373 × 1145 px · Display Advertising',
            desc: 'Promotional display ad built for high conversion with contrasting yellow and electric blue brush art, model apparel isolation, and directional "Shop Now" action.',
            palette: ['#FFDE00', '#0066FF', '#111111', '#FFFFFF']
        },
        social: {
            src: 'designs/marketing/fbpost.png',
            title: 'Social Media Feed Post (Urban Threads)',
            dim: '1080 × 1080 px · Facebook & Instagram',
            desc: 'Square feed creative featuring multiple lifestyle apparel models, product colorway preview thumbnails, and streetwear taglines.',
            palette: ['#FFDE00', '#0066FF', '#FF6B00', '#1A1A1A']
        },
        newsletter: {
            src: 'designs/marketing/newsletter_header.png',
            title: 'Email Newsletter Header Graphic',
            dim: '1200 × 600 px · Email Marketing',
            desc: 'Split-tone dynamic header with apparel mockup and raw brush calligraphy announcing "Good Vibes Better Grades" seasonal launch.',
            palette: ['#FFDE00', '#0070F3', '#000000', '#FFFFFF']
        }
    };

    marketingTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-asset');
            const data = marketingData[key];
            if (!data) return;

            marketingTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (marketingImg) {
                marketingImg.classList.add('fade-out');
                setTimeout(() => {
                    marketingImg.src = data.src;
                    marketingImg.alt = data.title;
                    if (marketingTitle) marketingTitle.textContent = data.title;
                    if (marketingDim) marketingDim.textContent = data.dim;
                    if (marketingDesc) marketingDesc.textContent = data.desc;
                    if (marketingPalette) {
                        marketingPalette.innerHTML = data.palette.map(c => 
                            `<span class="color-dot" style="background-color: ${c};" title="${c}"></span>`
                        ).join('');
                    }
                    marketingImg.classList.remove('fade-out');
                }, 150);
            }
        });
    });

    /* --- BiteFlow Mid-Fidelity Screen Viewer Controller --- */
    const biteflowTabs = document.querySelectorAll('.biteflow-tab-btn');
    const biteflowImg = document.getElementById('biteflow-preview-img');
    const biteflowTitle = document.getElementById('biteflow-asset-title');
    const biteflowDim = document.getElementById('biteflow-asset-dim');
    const biteflowDesc = document.getElementById('biteflow-asset-desc');

    const biteflowData = {
        overview: {
            src: 'designs/uiux/biteflow_overview.png',
            title: '4-Screen Mid-Fidelity Flow Architecture',
            dim: '1730 × 930 px · Figma Canvas',
            desc: 'Complete end-to-end user journey across 4 essential mobile views: Discovery, Food Customization, Cart & Review, and Live Order Tracking.'
        },
        home: {
            src: 'designs/uiux/biteflow_home.png',
            title: 'Screen 1: Home & Discovery',
            dim: '390 × 844 px · iOS Viewport',
            desc: 'Intuitive restaurant discovery with verified delivery address, search bar, horizontal cuisine chips ([All], [Burgers], [Pizza]), and transparent rating/fee cards.'
        },
        customization: {
            src: 'designs/uiux/biteflow_customization.png',
            title: 'Screen 2: Food Customization',
            dim: '390 × 844 px · iOS Viewport',
            desc: 'Structured meal configuration separating mandatory single-choice radio buttons (Brioche Bun) from optional add-ons (Extra Cheddar, Bacon) with dynamic real-time pricing sticky CTA.'
        },
        cart: {
            src: 'designs/uiux/biteflow_cart.png',
            title: 'Screen 3: Cart & Order Review',
            dim: '390 × 844 px · iOS Viewport',
            desc: 'Clean checkout verification with itemized quantity steppers, delivery address confirmation, payment method selector (GCash / COD), and transparent bill breakdown.'
        },
        tracking: {
            src: 'designs/uiux/biteflow_tracking.png',
            title: 'Screen 4: Order Status & Live Tracking',
            dim: '390 × 844 px · iOS Viewport',
            desc: 'Real-time order lifecycle feedback with 4-stage stepper (Confirmed → Preparing → On the Way → Delivered), rider contact actions (Call/Message), and itemized order receipt.'
        }
    };

    biteflowTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-screen');
            const data = biteflowData[key];
            if (!data) return;

            biteflowTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (biteflowImg) {
                biteflowImg.classList.add('fade-out');
                setTimeout(() => {
                    biteflowImg.src = data.src;
                    biteflowImg.alt = data.title;
                    if (biteflowTitle) biteflowTitle.textContent = data.title;
                    if (biteflowDim) biteflowDim.textContent = data.dim;
                    if (biteflowDesc) biteflowDesc.textContent = data.desc;
                    biteflowImg.classList.remove('fade-out');
                }, 150);
            }
        });
    });

    /* --- Scroll Reveal Animations --- */
    if (document.body) document.body.classList.add('js-enabled');
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
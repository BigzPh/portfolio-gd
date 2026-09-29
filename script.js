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
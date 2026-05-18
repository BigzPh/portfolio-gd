const themeToggle = document.getElementById('theme-toggle');
const body = document.documentElement; // Using html level for data-theme
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
   glot Modal & Live Video Demo Controller
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const viewProjectBtn = document.querySelector('.btn-view-project');
    const glotModal = document.getElementById('glot-modal');
    const modalClose = document.getElementById('modal-close');
    const glotVideo = document.getElementById('glot-demo-video');

    if (!glotModal || !viewProjectBtn || !modalClose) return;

    /* --- Modal Management --- */
    function openModal() {
        glotModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
        
        // Explicitly play the video on modal open
        if (glotVideo) {
            glotVideo.currentTime = 0;
            glotVideo.play().catch(err => console.log("Autoplay blocked:", err));
        }
    }

    function closeModal() {
        glotModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore main page scrolling
        
        // Pause the video to optimize CPU/RAM when the drawer is hidden
        if (glotVideo) {
            glotVideo.pause();
        }
    }

    // Modal Listeners
    viewProjectBtn.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);

    // Fullscreen Event Handler
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen && glotVideo) {
        btnFullscreen.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent backdrop closing triggers
            if (glotVideo.requestFullscreen) {
                glotVideo.requestFullscreen();
            } else if (glotVideo.webkitRequestFullscreen) { /* Safari */
                glotVideo.webkitRequestFullscreen();
            } else if (glotVideo.msRequestFullscreen) { /* IE11 */
                glotVideo.msRequestFullscreen();
            }
        });
    }

    // Close on overlay outside click
    glotModal.addEventListener('click', (e) => {
        if (e.target === glotModal) {
            closeModal();
        }
    });

    // Close on Escape Key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && glotModal.classList.contains('active')) {
            closeModal();
        }
    });
});
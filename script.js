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
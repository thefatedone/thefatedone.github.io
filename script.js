const themeToggle = document.getElementById('theme-toggle');

function applyTheme(isLight) {
    document.documentElement.classList.toggle('light-mode', isLight);
    themeToggle.setAttribute('aria-pressed', String(isLight));
}

try {
    applyTheme(localStorage.getItem('theme') === 'light');
} catch {
    applyTheme(false);
}

themeToggle.hidden = false;
themeToggle.addEventListener('click', () => {
    const isLight = themeToggle.getAttribute('aria-pressed') !== 'true';
    applyTheme(isLight);

    try {
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    } catch {
        // The toggle still works when storage is unavailable.
    }
});

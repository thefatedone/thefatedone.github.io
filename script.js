/* ============================
   smooth-scrollbar initialization
   - Owns all scrolling on #scroll-viewport (NOT <body>).
   - The library wraps the children of #scroll-viewport in its
     internal .scroll-content div. The header and the scroll-to-top
     button are siblings of #scroll-viewport and stay fixed in the
     viewport — independent of the library's transforms.
   - Initialized FIRST so other handlers (anchor links, header
     shadow, scroll-to-top button) can subscribe to it.
   ============================ */
function initScrollbar() {
    if (typeof window.Scrollbar !== 'function') {
        console.warn('smooth-scrollbar not loaded — using native scroll.');
        return null;
    }
    const viewport = document.getElementById('scroll-viewport');
    if (!viewport) {
        console.warn('scroll-viewport not found — using native scroll.');
        return null;
    }
    try {
        const sb = window.Scrollbar.init(viewport, {
            damping: 0.08,
            thumbMinSize: 24,
            renderByPixels: true,
            alwaysShowTracks: false,
            continuousScrolling: true,
            delegateTo: null,
        });
        /* Expose for other handlers (anchor links, debug) */
        window.__bodyScrollbar = sb;
        return sb;
    } catch (err) {
        console.warn('smooth-scrollbar init failed:', err);
        return null;
    }
}

const bodyScrollbar = initScrollbar();

/* Helper to read the current scroll position, regardless of whether
   smooth-scrollbar is active. */
function getScrollTop() {
    return bodyScrollbar ? bodyScrollbar.scrollTop : window.pageYOffset;
}

/* Helper to scroll to an absolute Y position, regardless of whether
   smooth-scrollbar is active. */
function scrollToTop(top, durationMs) {
    if (bodyScrollbar && typeof bodyScrollbar.scrollTo === 'function') {
        bodyScrollbar.scrollTo(0, top, durationMs);
    } else {
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

/* ============================
   Mobile Navigation Toggle
   ============================ */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li a');

function closeMobileMenu() {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navLinksItems.forEach((item) => {
    item.addEventListener('click', closeMobileMenu);
});

/* Close mobile menu when clicking outside the panel */
document.addEventListener('click', (e) => {
    if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
    ) {
        closeMobileMenu();
    }
});

/* ============================
   Smooth Scroll for anchor links
   - Routes through smooth-scrollbar's scrollTo() when the library
     is active so nav clicks get the same buttery momentum as the
     scroll-to-top button.
   - Falls back to native smooth scroll otherwise.
   ============================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const headerOffset = 70;
        const rect = target.getBoundingClientRect();
        const top = rect.top + getScrollTop() - headerOffset;
        scrollToTop(top, 800);
    });
});

/* ============================
   Header scroll shadow refinement
   - Native scroll event doesn't fire because smooth-scrollbar owns
     the scroll on #scroll-viewport. Subscribe to the library's
     scroll listener instead, with a native fallback for the rare
     case where the library isn't available.
   ============================ */
const header = document.querySelector('.header');
function updateHeaderShadow(scrollTop) {
    if (!header) return;
    if (scrollTop > 50) {
        header.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.25)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    }
}

if (bodyScrollbar) {
    updateHeaderShadow(bodyScrollbar.scrollTop);
    bodyScrollbar.addListener((status) => {
        updateHeaderShadow(status.offset.y);
    });
} else {
    updateHeaderShadow(window.pageYOffset);
    window.addEventListener('scroll', () => {
        updateHeaderShadow(window.pageYOffset);
    });
}

/* ============================
   Fade-in Animation on Scroll
   ============================ */
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section, .project-card, .skill-category, .edu-card').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
});

/* ============================
   Dark / Light Mode Toggle
   ============================ */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

function setThemeIcon(isLight) {
    icon.classList.remove('fa-sun', 'fa-moon');
    icon.classList.add(isLight ? 'fa-moon' : 'fa-sun');
}

/* Apply saved theme on load */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    setThemeIcon(true);
}

themeToggle.addEventListener('click', () => {
    const isLight = body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setThemeIcon(isLight);
});

/* ============================
   Navbar resume buttons — subtle press feedback
   ============================ */
document.querySelectorAll('.resume-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    });
});

/* ============================
   Scroll-to-Top Button
   - Always visible from anywhere on the page.
   - Sits as a sibling of #scroll-viewport so smooth-scrollbar's
     transforms never move it.
   - Uses the library's scrollTo() with a 1200ms duration for a
     slow, silky-smooth glide to the top.
   ============================ */
const scrollTopBtn = document.getElementById('scroll-to-top');

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTop(0, 1200);
    });
}

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

        /* When smooth-scrollbar is active it owns the scroll position,
           so we read the current top from the library instance if
           available, otherwise from window.pageYOffset. */
        const currentTop = window.__bodyScrollbar
            ? window.__bodyScrollbar.scrollTop
            : window.pageYOffset;

        const top = rect.top + currentTop - headerOffset;

        if (window.__bodyScrollbar && typeof window.__bodyScrollbar.scrollTo === 'function') {
            window.__bodyScrollbar.scrollTo(0, top, 800);
        } else {
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ============================
   Header scroll shadow refinement
   ============================ */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.25)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    }
});

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
   Scroll-to-Top Button (smooth-scrollbar powered)
   - smooth-scrollbar library (loaded from /vendor/smooth-scrollbar.js)
     takes over native scrolling on <body>. The library handles all
     mouse wheel, trackpad, touch, and keyboard scrolling natively
     with built-in momentum — no custom rAF needed.
   - The scroll-to-top button uses the library's scrollTo() with a
     1200ms duration for a slow, silky-smooth glide to the top.
   - Visibility is wired through the library's scroll listener so the
     button shows/hides in sync with the actual scroll position.
   - Anchors also use the library so nav clicks get the same smooth
     momentum as the scroll-to-top button.
   ============================ */
const SCROLL_THRESHOLD = 300;

/* Initialize smooth-scrollbar on the body element.
   Returns the Scrollbar instance, or null if the library didn't load. */
function initScrollbar() {
    if (typeof window.Scrollbar !== 'function') {
        console.warn('smooth-scrollbar not loaded — using native scroll.');
        return null;
    }
    try {
        const sb = window.Scrollbar.init(document.body, {
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

/* === Scroll-to-Top Button === */
const scrollTopBtn = document.getElementById('scroll-to-top');

function updateScrollTopVisibility() {
    if (!scrollTopBtn) return;
    const y = bodyScrollbar ? bodyScrollbar.scrollTop : window.scrollY;
    if (y > SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('is-visible');
    } else {
        scrollTopBtn.classList.remove('is-visible');
    }
}

/* Wire visibility through the library if available, otherwise native scroll. */
if (bodyScrollbar) {
    bodyScrollbar.addListener(updateScrollTopVisibility);
} else {
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });
}

updateScrollTopVisibility();

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (bodyScrollbar && typeof bodyScrollbar.scrollTo === 'function') {
            bodyScrollbar.scrollTo(0, 0, 1200);
        } else {
            /* Native fallback if the library didn't initialize */
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}
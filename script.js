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
   ============================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const headerOffset = 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        /* Use smooth-scrollbar's API when available; fall back to native
           smooth-scroll if the library didn't initialize. */
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
   Scroll-to-Top Button
   - Uses the smooth-scrollbar library (loaded via CDN) for buttery,
     momentum-based scrolling across the entire page.
   - The library takes over native scrolling on <body> so all
     scroll-based animations (including scroll-to-top) go through
     its queue — no fighting native vs custom rAF.
   - Falls back to a custom rAF easeInOutCubic animation if the
     library fails to load (e.g. CDN blocked).
   ============================ */
const scrollTopBtn = document.getElementById('scroll-to-top');
const SCROLL_THRESHOLD = 300;

/* Active animation handle (used only by the rAF fallback) */
let scrollAnimationId = null;

/* easeInOutCubic for the rAF fallback */
const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* rAF fallback scroll-to-top — used only when smooth-scrollbar
   didn't initialize (CDN blocked, JS error, etc.). */
function rAFScrollToTop(duration = 1400) {
    const start = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (start <= 0) return;

    if (scrollAnimationId !== null) {
        cancelAnimationFrame(scrollAnimationId);
    }

    let startTime = null;

    function step(currentTime) {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, start * (1 - eased));

        if (progress < 1) {
            scrollAnimationId = requestAnimationFrame(step);
        } else {
            scrollAnimationId = null;
        }
    }

    scrollAnimationId = requestAnimationFrame(step);
}

/* Initialize smooth-scrollbar when the library is available.
   Exposes the instance on window so other code (anchor links,
   visibility tracking) can use it. */
function initSmoothScrollbar() {
    if (typeof window.Scrollbar !== 'function') {
        console.warn('smooth-scrollbar not loaded — falling back to native rAF scroll.');
        return null;
    }
    try {
        const sb = window.Scrollbar.init(document.body, {
            damping: 0.05,
            thumbMinSize: 20,
            renderByPixels: true,
            alwaysShowTracks: false,
            continuousScrolling: true,
        });
        window.__bodyScrollbar = sb;
        return sb;
    } catch (err) {
        console.warn('smooth-scrollbar init failed — falling back to native rAF scroll.', err);
        return null;
    }
}

const bodyScrollbar = initSmoothScrollbar();

/* Visibility toggle: read scrollTop from whichever source is active. */
function updateScrollTopVisibility() {
    const y = bodyScrollbar
        ? bodyScrollbar.scrollTop
        : window.pageYOffset || document.documentElement.scrollTop || 0;
    if (!scrollTopBtn) return;
    if (y > SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('is-visible');
    } else {
        scrollTopBtn.classList.remove('is-visible');
    }
}

/* Subscribe to scroll events through the library if available,
   otherwise listen to native window scroll. */
if (bodyScrollbar) {
    bodyScrollbar.addListener(updateScrollTopVisibility);
} else {
    let ticking = false;
    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollTopVisibility);
                ticking = true;
            }
        },
        { passive: true }
    );
}

/* Initial state on load (handles refreshes while scrolled) */
updateScrollTopVisibility();

/* Click triggers the slow, silky-smooth scroll.
   Uses the library's scrollTo with explicit 1200ms duration;
   falls back to the rAF helper if the library is unavailable. */
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (bodyScrollbar && typeof bodyScrollbar.scrollTo === 'function') {
            bodyScrollbar.scrollTo(0, 0, 1200);
        } else {
            rAFScrollToTop(1400);
        }
    });
}
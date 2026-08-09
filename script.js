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
        window.scrollTo({ top, behavior: 'smooth' });
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
   - Smooth fade-in once the user scrolls past 300px.
   - Universal scroll container detection: the button works whether
     the page scrolls on `window` or on an internal overflow container
     (e.g. <main>, <section>, .wrapper). This handles sites that use
     a SPA-style fixed-height app shell.
   - requestAnimationFrame loop with easeInOutCubic produces a slow,
     silky-smooth glide from bottom to top.
   - The animation is cancelled the moment the user manually scrolls
     or touches the screen, so the page never fights them.
   - CSS scroll-behavior is intentionally NOT set — it intercepts
     rAF-driven window.scrollTo() frames and produces jerky motion.
   ============================ */
const scrollTopBtn = document.getElementById('scroll-to-top');
const SCROLL_THRESHOLD = 300;

/* Active animation handle (null when no animation is running) */
let scrollAnimationId = null;

/* Cached scroll container — detected once on load, re-detected
   on demand if the page layout changes (e.g. resize/orientation). */
let cachedScrollContainer = null;

/* Cancel any in-flight scroll-to-top animation */
function cancelScrollToTop() {
    if (scrollAnimationId !== null) {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
    }
}

/* Smooth ease-in-out cubic — slow start, gentle settle. */
const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* Read current scroll offset from a container (window or element) */
function getScrollTop(container) {
    if (container === window) {
        return (
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0
        );
    }
    return container.scrollTop || 0;
}

/* Write scroll offset to a container */
function setScrollTop(container, value) {
    if (container === window) {
        window.scrollTo(0, value);
        /* Belt-and-braces: also assign directly in case some browsers
           require it for rAF-driven frames. */
        document.documentElement.scrollTop = value;
        document.body.scrollTop = value;
    } else {
        container.scrollTop = value;
    }
}

/* Detect which element is actually scrolling on the page.
   Returns either `window` or the internal overflow container. */
function getScrollContainer() {
    /* Fast path: if any of the standard viewport-level readouts is
       non-zero, the document itself is scrolling. */
    if (
        (window.pageYOffset || 0) > 0 ||
        (document.documentElement.scrollTop || 0) > 0 ||
        (document.body.scrollTop || 0) > 0
    ) {
        return window;
    }

    /* Otherwise, hunt for an internal element that's actually scrolled.
       Limit to candidates with vertical overflow capability to keep
       this cheap. */
    const candidates = document.querySelectorAll(
        'main, section, .wrapper, .app, .app-shell, .scroll-container, div'
    );
    for (const el of candidates) {
        const style = window.getComputedStyle(el);
        const oy = style.overflowY;
        const isScrollable =
            oy === 'auto' ||
            oy === 'scroll' ||
            oy === 'overlay';

        if (isScrollable && el.scrollHeight > el.clientHeight && el.scrollTop > 0) {
            return el;
        }
    }

    /* Fallback: window — most common case. */
    return window;
}

/* Self-contained ultra-smooth scroll to top with easeInOutCubic.
   Auto-detects the scrolling container at call time so it always
   targets the right element even if the page layout changes. */
function executeUltraSmoothScroll(duration = 1400) {
    const container = getScrollContainer();
    const start = getScrollTop(container);

    if (start <= 0) return;

    /* Respect users who prefer reduced motion — instant jump instead */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setScrollTop(container, 0);
        return;
    }

    /* Cancel any previous in-flight animation before starting a new one */
    cancelScrollToTop();

    let startTime = null;

    function step(currentTime) {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        const currentPos = start * (1 - easedProgress);
        setScrollTop(container, currentPos);

        if (progress < 1) {
            scrollAnimationId = requestAnimationFrame(step);
        } else {
            scrollAnimationId = null;
        }
    }

    scrollAnimationId = requestAnimationFrame(step);
}

/* Smooth visibility toggle based on scroll distance (rAF-throttled).
   Reads from whichever container is actually scrolling. */
let ticking = false;

function updateScrollTopVisibility() {
    const y = getScrollTop(getScrollContainer());
    if (y > SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('is-visible');
    } else {
        scrollTopBtn.classList.remove('is-visible');
    }
    ticking = false;
}

/* Listen on window + capture phase on any container, so the visibility
   update fires regardless of which element is doing the scrolling. */
function handleScrollEvent() {
    cancelScrollToTop();

    if (!ticking) {
        requestAnimationFrame(updateScrollTopVisibility);
        ticking = true;
    }
}

window.addEventListener('scroll', handleScrollEvent, { passive: true });
document.addEventListener(
    'scroll',
    handleScrollEvent,
    { passive: true, capture: true }
);

/* Touch / wheel / keyboard input cancels the in-flight animation
   regardless of which container is scrolling. */
window.addEventListener('wheel', cancelScrollToTop, { passive: true });
window.addEventListener('touchstart', cancelScrollToTop, { passive: true });
window.addEventListener('keydown', (e) => {
    const navKeys = [
        'PageUp', 'PageDown', 'Home', 'End',
        'ArrowUp', 'ArrowDown', 'Space',
    ];
    if (navKeys.includes(e.code)) cancelScrollToTop();
});

/* Re-detect scroll container on resize (layout may have changed) */
window.addEventListener('resize', () => {
    cachedScrollContainer = null;
});

/* Initial state on load (handles refreshes while scrolled) */
updateScrollTopVisibility();

/* Click triggers the slow, silky-smooth scroll */
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeUltraSmoothScroll(1400);
    });
}
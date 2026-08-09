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
   - Custom requestAnimationFrame loop with easeInOutCubic produces
     a slow, silky-smooth glide from bottom to top.
   - CSS scroll-behavior is intentionally NOT used — it intercepts
     rAF-driven window.scrollTo() frames and produces jerky motion.
   - The animation is cancelled the moment the user manually scrolls
     or touches the screen, so the page never fights them.
   ============================ */
const scrollTopBtn = document.getElementById('scroll-to-top');
const SCROLL_THRESHOLD = 300;

/* Active animation handle (null when no animation is running) */
let scrollAnimationId = null;

/* Cancel any in-flight scroll-to-top animation */
function cancelScrollToTop() {
    if (scrollAnimationId !== null) {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
    }
}

/* Smooth ease-in-out cubic — slow start, gentle settle.
   Produces a premium, unhurried feel for long scrolls. */
const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* Animated scroll to the top of the page. */
function scrollToTop(duration = 1200) {
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (startPosition === 0) return;

    /* Respect users who prefer reduced motion — instant jump instead */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, 0);
        return;
    }

    /* Cancel any previous in-flight animation before starting a new one */
    cancelScrollToTop();

    /* Distance-aware duration: scale gently with scroll length so a
       very long page still feels deliberate but a short scroll is
       never sluggish. Clamped 1100ms – 2400ms. */
    const adjustedDuration = Math.min(
        2400,
        Math.max(1100, startPosition * 1.6)
    );

    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / adjustedDuration, 1);
        const easeProgress = easeInOutCubic(progress);

        window.scrollTo(0, startPosition * (1 - easeProgress));

        if (timeElapsed < adjustedDuration) {
            scrollAnimationId = requestAnimationFrame(animation);
        } else {
            scrollAnimationId = null;
        }
    }

    scrollAnimationId = requestAnimationFrame(animation);
}

/* Smooth visibility toggle based on scroll distance (rAF-throttled) */
let ticking = false;

function updateScrollTopVisibility() {
    const y = window.scrollY;
    if (y > SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('is-visible');
    } else {
        scrollTopBtn.classList.remove('is-visible');
    }
    ticking = false;
}

window.addEventListener(
    'scroll',
    () => {
        /* If the user scrolls manually mid-animation, abort it so
           the page never fights their input. */
        cancelScrollToTop();

        if (!ticking) {
            requestAnimationFrame(updateScrollTopVisibility);
            ticking = true;
        }
    },
    { passive: true }
);

/* Touch / wheel / keyboard input also cancels the in-flight animation */
window.addEventListener('wheel', cancelScrollToTop, { passive: true });
window.addEventListener('touchstart', cancelScrollToTop, { passive: true });
window.addEventListener('keydown', (e) => {
    const navKeys = [
        'PageUp', 'PageDown', 'Home', 'End',
        'ArrowUp', 'ArrowDown', 'Space',
    ];
    if (navKeys.includes(e.code)) cancelScrollToTop();
});

/* Initial state on load (handles refreshes while scrolled) */
updateScrollTopVisibility();

/* Click triggers the slow, silky-smooth scroll */
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTop(1200);
    });
}
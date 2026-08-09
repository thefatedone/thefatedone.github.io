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
   - Wrapped in DOMContentLoaded so the script is safe regardless of
     where the <script> tag sits in index.html.
   - Standard native page scrolling is preserved (no overflow:hidden,
     no smooth-scrollbar takeover, no touch-action: none).
   - The click handler updates BOTH window.scrollTo AND the active
     target container's scrollTop on every frame — belt-and-braces
     so it works across browsers that move the scroll container.
   - 1200ms duration with easeInOutCubic for a slow, silky-smooth
     glide from bottom to top.
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (!scrollTopBtn) return;

    const SCROLL_THRESHOLD = 300;

    /* Show/hide the button as the user scrolls past the threshold */
    window.addEventListener('scroll', () => {
        if (window.scrollY > SCROLL_THRESHOLD) {
            scrollTopBtn.classList.add('is-visible');
        } else {
            scrollTopBtn.classList.remove('is-visible');
        }
    });

    /* Smooth ease-in-out cubic — slow start, gentle settle. */
    const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    /* Smooth scroll to top — writes to BOTH window and the active
       container so it works regardless of which element is scrolling. */
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const targetContainer =
            document.documentElement.scrollTop > 0
                ? document.documentElement
                : document.body;
        const startPosition =
            window.pageYOffset || targetContainer.scrollTop;

        if (startPosition <= 0) return;

        /* Respect users who prefer reduced motion */
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, 0);
            targetContainer.scrollTop = 0;
            return;
        }

        const duration = 1200; // 1.2s smooth glide
        let startTime = null;

        function step(currentTime) {
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            const position = startPosition * (1 - easedProgress);

            /* Belt-and-braces: write to BOTH the window and the
               detected target container on every frame. Some browsers
               keep the scroll position on documentElement, others on
               body — covering both guarantees smooth motion across
               browsers and layouts. */
            window.scrollTo(0, position);
            targetContainer.scrollTop = position;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    });

    /* Sync initial visibility in case the page is loaded mid-scroll */
    if (window.scrollY > SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('is-visible');
    }
});
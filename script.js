/* ============================================================
   IRONFORGE GYM — script.js
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   CONSTANTS & DOM REFERENCES
   ------------------------------------------------------------ */
const header       = document.getElementById('header');
const hamburger    = document.getElementById('hamburger');
const nav          = document.getElementById('nav');
const backToTop    = document.getElementById('backToTop');
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');
const billingToggle = document.getElementById('billingToggle');
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

/* ------------------------------------------------------------
   1. STICKY HEADER — scroll state
   ------------------------------------------------------------ */
function onScroll() {
  const scrollY = window.scrollY;

  // Scrolled class for header background
  header.classList.toggle('scrolled', scrollY > 50);

  // Back to top visibility
  backToTop.classList.toggle('visible', scrollY > 400);

  // Active nav link highlighting
  highlightActiveNav();
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ------------------------------------------------------------
   2. MOBILE MENU TOGGLE
   ------------------------------------------------------------ */
hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

function closeMenu() {
  nav.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

// Close menu on outside click
document.addEventListener('click', e => {
  if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
    closeMenu();
  }
});

/* ------------------------------------------------------------
   3. ACTIVE NAV HIGHLIGHT — Intersection Observer
   ------------------------------------------------------------ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(sec => sectionObserver.observe(sec));

function highlightActiveNav() {
  // Fallback for fast scrollers (handled by observer above)
}

/* ------------------------------------------------------------
   4. SCROLL REVEAL ANIMATION
   ------------------------------------------------------------ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for siblings
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400); // cap at 400ms

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------
   5. ANIMATED STAT COUNTERS (Hero section)
   ------------------------------------------------------------ */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(update);
}

const heroStatNums = document.querySelectorAll('.hero__stat-number');
let countersStarted = false;

const counterObserver = new IntersectionObserver(
  entries => {
    if (entries.some(e => e.isIntersecting) && !countersStarted) {
      countersStarted = true;
      heroStatNums.forEach(el => animateCounter(el));
    }
  },
  { threshold: 0.3 }
);

const heroStatsRow = document.querySelector('.hero__stats-row');
if (heroStatsRow) counterObserver.observe(heroStatsRow);

/* ------------------------------------------------------------
   5b. CYCLING WORD ANIMATION
   ------------------------------------------------------------ */
(function initWordCycle() {
  const words = document.querySelectorAll('.hero__word');
  if (!words.length) return;

  let current = 0;

  setInterval(() => {
    words[current].classList.remove('active');
    words[current].classList.add('exit');

    const exiting = words[current];
    setTimeout(() => exiting.classList.remove('exit'), 450);

    current = (current + 1) % words.length;
    words[current].classList.add('active');
  }, 2200);
})();

/* ------------------------------------------------------------
   6. CLASS SCHEDULE TABS
   ------------------------------------------------------------ */
const scheduleTabs   = document.querySelectorAll('.schedule__tab');
const schedulePanels = document.querySelectorAll('.schedule__panel');

scheduleTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const day = tab.getAttribute('data-day');

    // Update tab states
    scheduleTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show matching panel
    schedulePanels.forEach(panel => {
      panel.classList.remove('active');
    });
    const target = document.getElementById(`schedule-${day}`);
    if (target) {
      target.classList.add('active');
      // Re-trigger reveal animations inside the panel
      target.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        void el.offsetWidth; // reflow
        el.classList.add('visible');
      });
    }
  });
});

// Auto-activate today's tab
function activateTodayTab() {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const today = days[new Date().getDay()];
  const todayTab = document.querySelector(`.schedule__tab[data-day="${today}"]`);
  if (todayTab) todayTab.click();
}
activateTodayTab();

/* ------------------------------------------------------------
   7. PRICING — ANNUAL / MONTHLY TOGGLE
   ------------------------------------------------------------ */
if (billingToggle) {
  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;
    document.querySelectorAll('.price-amount').forEach(el => {
      const monthly = el.getAttribute('data-monthly');
      const annual  = el.getAttribute('data-annual');
      animatePrice(el, parseInt(isAnnual ? annual : monthly, 10));
    });
  });
}

function animatePrice(el, target) {
  const start   = parseInt(el.textContent, 10);
  const diff    = target - start;
  const duration = 400;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    el.textContent = Math.round(start + diff * eased);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* ------------------------------------------------------------
   8. GALLERY LIGHTBOX
   ------------------------------------------------------------ */
const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
let currentLightboxIndex = 0;

galleryItems.forEach((item, idx) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (!img) return;
    currentLightboxIndex = idx;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showLightboxImage(idx) {
  const total = galleryItems.length;
  currentLightboxIndex = (idx + total) % total;
  const img = galleryItems[currentLightboxIndex].querySelector('img');
  if (img) {
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';
    setTimeout(() => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  }
}

// Lightbox transitions
lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev)  lightboxPrev.addEventListener('click', () => showLightboxImage(currentLightboxIndex - 1));
if (lightboxNext)  lightboxNext.addEventListener('click', () => showLightboxImage(currentLightboxIndex + 1));

// Close on background click
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard support
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showLightboxImage(currentLightboxIndex - 1);
  if (e.key === 'ArrowRight')  showLightboxImage(currentLightboxIndex + 1);
});

// Swipe support for touch devices
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    showLightboxImage(currentLightboxIndex + (diff > 0 ? 1 : -1));
  }
}, { passive: true });

/* ------------------------------------------------------------
   9. CONTACT FORM SUBMISSION
   ------------------------------------------------------------ */
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const inputs = contactForm.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'var(--accent)';
        input.addEventListener('input', () => {
          input.style.borderColor = '';
        }, { once: true });
      }
    });
    if (!valid) return;

    // Simulate form submission
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      contactForm.reset();
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1500);
  });
}

/* ------------------------------------------------------------
   10. SMOOTH SCROLL — for all anchor links
   ------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 76;
    window.scrollTo({
      top: target.offsetTop - offset,
      behavior: 'smooth',
    });
  });
});

/* ------------------------------------------------------------
   11. BACK TO TOP BUTTON
   ------------------------------------------------------------ */
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ------------------------------------------------------------
   12. PARALLAX — Hero floating cards on mouse move (desktop only)
   ------------------------------------------------------------ */
const heroCards = document.querySelectorAll('.hero__card');

if (heroCards.length && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    heroCards.forEach((card, i) => {
      const depth = (i + 1) * 5;
      card.style.transform = `translateY(var(--float-offset, 0px)) translate(${x * depth}px, ${y * depth}px)`;
    });
  }, { passive: true });
}

/* ------------------------------------------------------------
   13. PROGRAM CARDS — tilt effect on mouse move
   ------------------------------------------------------------ */
document.querySelectorAll('.program-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
    card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
    card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'var(--transition)';
  });
});

/* ------------------------------------------------------------
   14. SCROLL PROGRESS BAR (top of page)
   ------------------------------------------------------------ */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: linear-gradient(90deg, #e63946, #f77f00);
  z-index: 9999;
  width: 0%;
  transition: width 0.1s linear;
  pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop  = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}, { passive: true });

/* ------------------------------------------------------------
   15. LOADING — Remove preload class after fonts load
   ------------------------------------------------------------ */
document.fonts.ready.then(() => {
  document.body.classList.add('fonts-loaded');
});

/* ------------------------------------------------------------
   16. NEWSLETTER — footer form
   ------------------------------------------------------------ */
document.querySelectorAll('.footer__newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value.trim()) return;
    const btn = form.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = '#22c55e';
    input.value = '';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
    }, 3000);
  });
});

/* ------------------------------------------------------------
   17. SCHEDULE — Reveal items on tab switch
   ------------------------------------------------------------ */
// Activate initial day's items
document.querySelectorAll('.schedule__panel.active .reveal').forEach(el => {
  el.classList.add('visible');
});

console.log('%cIRONFORGE GYM — Template loaded successfully.', 'color: #e63946; font-family: sans-serif; font-size: 14px; font-weight: bold;');

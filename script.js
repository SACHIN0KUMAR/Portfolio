// ============================================
// MOBILE NAV TOGGLE
// ============================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

// ============================================
// SKILL BAR FILL (animate width on reveal)
// ============================================
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.getAttribute('data-level');
        entry.target.style.width = level + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

skillFills.forEach((el) => skillObserver.observe(el));

// ============================================
// SCROLL PROGRESS — trail fill + nav active state
// ============================================
const trailFill = document.getElementById('trailFill');
const trailDots = document.querySelectorAll('.trail-dot');
const mobileProgress = document.getElementById('mobileProgress');
const navLinkEls = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('backToTop');

const sectionIds = ['hero', 'about', 'skills', 'roadmap', 'projects', 'contact'];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  // Fill trail + mobile bar
  trailFill.style.height = progress + '%';
  mobileProgress.style.width = progress + '%';

  // Find current section (closest to top of viewport, with offset)
  let currentSection = sections[0];
  const scanPoint = scrollTop + window.innerHeight * 0.35;

  sections.forEach((section) => {
    if (section.offsetTop <= scanPoint) {
      currentSection = section;
    }
  });

  // Update trail dots
  trailDots.forEach((dot) => {
    dot.classList.toggle('is-active', dot.dataset.section === currentSection.id);
  });

  // Update nav active link
  navLinkEls.forEach((link) => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('is-active', href === currentSection.id);
  });

  // Back to top button visibility
  backToTop.classList.toggle('is-visible', scrollTop > window.innerHeight * 0.8);

  // Nav background intensity on scroll
  const nav = document.getElementById('nav');
  nav.style.boxShadow = scrollTop > 20 ? '0 4px 20px rgba(0,0,0,0.25)' : 'none';
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress();
      ticking = false;
    });
    ticking = true;
  }
});

updateScrollProgress();

// ============================================
// BACK TO TOP
// ============================================
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// COPY EMAIL TO CLIPBOARD
// ============================================
const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyEmailText = document.getElementById('copyEmailText');

if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.getAttribute('data-email');
    try {
      await navigator.clipboard.writeText(email);
      copyEmailText.textContent = 'Copied! ' + email;
    } catch (err) {
      // Fallback for browsers without Clipboard API support
      copyEmailText.textContent = email;
    }
    setTimeout(() => {
      copyEmailText.textContent = 'Copy my email';
    }, 2500);
  });
}

// ============================================
// FOOTER YEAR
// ============================================
document.getElementById('footerYear').textContent = new Date().getFullYear();
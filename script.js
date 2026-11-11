/**
 * script.js · Sachin Kumar Portfolio
 * Features:
 *  - Animated starfield (canvas)
 *  - Scroll-progress bar
 *  - Custom cursor glow
 *  - Typewriter effect (cycling)
 *  - IntersectionObserver scroll-reveal
 *  - Active nav highlighting on scroll
 *  - Navbar background on scroll
 *  - Mobile hamburger menu
 *  - Back-to-top button
 *  - Copy-email to clipboard with toast
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   1. STARFIELD CANVAS
   ═══════════════════════════════════════════════════════════════════ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  let animId;

  /** Resize canvas to match window */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  /** Create a fresh array of star objects */
  function buildStars() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 6000), 220);
    stars = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.3 + 0.3,          // radius
      alpha:   Math.random() * 0.6 + 0.1,           // base opacity
      speed:   Math.random() * 0.4 + 0.05,          // drift speed
      drift:   (Math.random() - 0.5) * 0.15,        // horizontal wander
      twinkle: Math.random() * Math.PI * 2,          // phase offset
      twinkleSpeed: Math.random() * 0.025 + 0.008,  // twinkle frequency
    }));
  }

  /** Draw one animation frame */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      // Advance twinkle phase
      s.twinkle += s.twinkleSpeed;
      const opacity = s.alpha * (0.55 + 0.45 * Math.sin(s.twinkle));

      // Slow downward drift
      s.y += s.speed;
      s.x += s.drift;

      // Wrap around edges
      if (s.y > canvas.height + 2) { s.y = -2; s.x = Math.random() * canvas.width; }
      if (s.x < -2)                { s.x = canvas.width + 2; }
      if (s.x > canvas.width + 2)  { s.x = -2; }

      // Soft glow effect via two overlapping circles
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
      grd.addColorStop(0,   `rgba(200, 230, 255, ${opacity})`);
      grd.addColorStop(0.4, `rgba(160, 200, 255, ${opacity * 0.5})`);
      grd.addColorStop(1,   'transparent');

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Bright core dot
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 240, 255, ${opacity})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  // Handle visibility change — pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  draw();
})();


/* ═══════════════════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ═══════════════════════════════════════════════════════════════════
   3. CUSTOM CURSOR GLOW
   ═══════════════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = document.getElementById('cursor-glow');
  if (!cursor) return;

  // Don't activate on touch devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let raf;
  let mouseX = -100, mouseY = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
        raf = null;
      });
    }
  });

  // Enlarge on interactive elements
  const interactables = 'a, button, [role="button"], .skill-chip, .project-btn, .contact-btn';

  document.addEventListener('mouseover', e => {
    if (e.target.matches(interactables) || e.target.closest(interactables)) {
      cursor.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.matches(interactables) || e.target.closest(interactables)) {
      cursor.classList.remove('cursor-hover');
    }
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   4. TYPEWRITER EFFECT
   ═══════════════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const strings = [
    'Building AI-powered tools',
    'Exploring full-stack dev',
    'Turning curiosity into code',
  ];

  let strIdx  = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseMs = 0;

  const TYPE_SPEED   = 70;   // ms per character while typing
  const DELETE_SPEED = 35;   // ms per character while deleting
  const PAUSE_END    = 1800; // ms pause at end of string
  const PAUSE_START  = 400;  // ms pause before next string

  function tick() {
    const current = strings[strIdx];

    if (deleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    el.textContent = current.substring(0, charIdx);

    let delay = deleting ? DELETE_SPEED : TYPE_SPEED;

    if (!deleting && charIdx === current.length) {
      // Finished typing — pause then start deleting
      delay = PAUSE_END;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      // Finished deleting — move to next string
      deleting = false;
      strIdx = (strIdx + 1) % strings.length;
      delay = PAUSE_START;
    }

    setTimeout(tick, delay);
  }

  // Start after a brief initial delay
  setTimeout(tick, 800);
})();


/* ═══════════════════════════════════════════════════════════════════
   5. SCROLL-REVEAL (IntersectionObserver)
   ═══════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  // Skip animations if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════════
   6. NAVBAR — scroll state + active link highlighting
   ═══════════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  if (!navbar) return;

  const sections = Array.from(navLinks)
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);

  function update() {
    const scrollY = window.scrollY;

    // Scrolled state
    if (scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section detection — find the section whose top is closest
    // to 30% down the viewport
    const viewportMid = scrollY + window.innerHeight * 0.3;
    let activeId = '';

    sections.forEach(section => {
      if (section.offsetTop <= viewportMid) {
        activeId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === activeId);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ═══════════════════════════════════════════════════════════════════
   7. MOBILE HAMBURGER MENU
   ═══════════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn        = document.getElementById('hamburger');
  const menu       = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!btn || !menu) return;

  function openMenu() {
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   8. BACK-TO-TOP BUTTON
   ═══════════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   9. COPY EMAIL TO CLIPBOARD
   ═══════════════════════════════════════════════════════════════════ */
(function initCopyEmail() {
  const btn   = document.getElementById('copy-email-btn');
  const toast = document.getElementById('copy-toast');
  if (!btn || !toast) return;

  let toastTimer;

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email || 'sac2k21batch@gmail.com';

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for older browsers / non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Show toast
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);

    // Brief button feedback
    const label = btn.querySelector('.contact-btn-label');
    if (label) {
      const orig = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => { label.textContent = orig; }, 2000);
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   10. SMOOTH SCROLL FOR ANCHOR LINKS
   ═══════════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
        10
      );
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

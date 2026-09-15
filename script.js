// ===================================================================
// Footer year
// ===================================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ===================================================================
// Mobile nav toggle
// ===================================================================
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ===================================================================
// Scroll reveal for sections (IntersectionObserver)
// ===================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-io').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal-io').forEach(el => el.classList.add('in-view'));
}

// ===================================================================
// Hero 3D parallax — mouse-driven tilt on the panel stack
// ===================================================================
const stage = document.getElementById('heroStage');
const perspective = document.getElementById('heroPerspective');

if (stage && perspective && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = px * 16;   // max rotation in deg
    targetY = py * -16;
  });

  stage.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function animateStage() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    perspective.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
    requestAnimationFrame(animateStage);
  }
  animateStage();
}

// ===================================================================
// Work card tilt-on-hover (subtle, per-card, pointer-driven)
// ===================================================================
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * 8;
      const rotateX = py * -8;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ===================================================================
// Scroll buddy — travels down through the middle of the content
// column as the page scrolls: starting centred, sweeping out to
// the right edge of the container, back across to the left edge,
// and so on, from just under the hero to just above the footer.
// ===================================================================
const buddy = document.getElementById('buddy');
const heroEl = document.querySelector('.hero');
const footerEl = document.querySelector('.footer');
const ZIGZAGS = 6;              // how many left-right sweeps down the page
const CONTAINER_MAX = 1120;     // matches .section__inner's max width
const CONTAINER_RATIO = 0.92;   // matches .section__inner's min(..., 92%)

if (buddy && heroEl && footerEl && !prefersReducedMotion) {
  let trackTop = 0;
  let trackBottom = 0;
  let containerLeft = 0;
  let containerWidth = 0;
  let ticking = false;
  let ready = false;

  function recalcLane() {
    const buddyHeight = buddy.offsetHeight || 200;
    const viewportWidth = window.innerWidth;

    trackTop = heroEl.offsetTop + heroEl.offsetHeight + 10;
    trackBottom = footerEl.offsetTop - buddyHeight - 30;

    containerWidth = Math.min(CONTAINER_MAX, viewportWidth * CONTAINER_RATIO);
    containerLeft = (viewportWidth - containerWidth) / 2;
  }

  function updateBuddy() {
    ticking = false;

    const buddyWidth = buddy.offsetWidth || 200;
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollable = Math.max(docHeight - viewportHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

    const top = trackTop + progress * (trackBottom - trackTop);

    // 0 at start (centre), sweeps to 1 (right edge), back through
    // 0.5 (centre) to -1 (left edge), and repeats — middle-to-right,
    // right-to-left, and back again.
    const wave = Math.sin(progress * Math.PI * ZIGZAGS); // -1 .. 1
    const centerX = containerLeft + containerWidth / 2;
    const swing = (containerWidth - buddyWidth) / 2;
    const centerPos = centerX + wave * swing;
    const left = centerPos - buddyWidth / 2;

    const bob = Math.sin(progress * Math.PI * ZIGZAGS * 2) * 6;
    const tilt = wave * -10;

    buddy.style.transform = `translate3d(${left}px, ${top + bob}px, 0) rotate(${tilt}deg)`;

    if (!ready) {
      ready = true;
      buddy.classList.add('is-ready');
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateBuddy);
    }
  }

  function onResize() {
    recalcLane();
    updateBuddy();
  }

  function init() {
    recalcLane();
    updateBuddy();
  }

  if (buddy.complete) {
    init();
  } else {
    buddy.addEventListener('load', init);
    // fallback in case the load event was missed (cached image, etc.)
    setTimeout(init, 300);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
}

// ===================================================================
// Nav background intensifies after scrolling past hero
// ===================================================================
const navEl = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navEl.style.borderBottomColor = 'var(--border)';
  } else {
    navEl.style.borderBottomColor = 'var(--border-soft)';
  }
}, { passive: true });
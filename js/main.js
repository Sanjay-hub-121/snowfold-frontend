const API_BASE = 'https://snowfold-backend.onrender.com/api';

// ===== AOS =====
AOS.init({ once: true, offset: 60, easing: 'ease-out-cubic' });

// ===== Navbar scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

// ===== Smooth anchor scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ===== Enhancement 2: Counter animation =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-number[data-target]').forEach(el => counterObserver.observe(el));

// ===== Dynamic testimonials from backend =====
async function loadTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error('No reviews');
    const reviews = await res.json();

    if (!reviews || reviews.length === 0) {
      grid.innerHTML = `<div class="testimonials-empty">Reviews coming soon — check back later!</div>`;
      return;
    }

    grid.innerHTML = reviews.map((r, i) => `
      <div class="testimonial-card ${i === 1 ? 'featured' : ''}" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="testimonial-stars">
          ${'<i class="fa-solid fa-star"></i>'.repeat(r.rating || 5)}
        </div>
        <p class="testimonial-text">${r.review}</p>
        <div class="testimonial-author">
          <div class="author-avatar">${r.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
          <div>
            <div class="author-name">${r.name}</div>
            <div class="author-title">${r.businessTitle || ''}</div>
          </div>
        </div>
      </div>`).join('');

    // Re-init AOS for dynamically added elements
    AOS.refresh();
  } catch (err) {
    // Backend not reachable or no reviews yet — show nothing rather than broken UI
    grid.innerHTML = `<div class="testimonials-empty">Reviews coming soon!</div>`;
  }
}

loadTestimonials();



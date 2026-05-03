/* ============================================================
   NEUDANII — script.js
   Shared across all pages.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ─────────────────────────────────────────
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    const tickFollower = () => {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(tickFollower);
    };
    tickFollower();
  }

  // ── Navbar scroll state ───────────────────────────────────
  const navbar = document.getElementById('navbar');

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Mobile hamburger ──────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      const [s1, s2, s3] = navToggle.querySelectorAll('span');
      s1.style.transform = open ? 'translateY(7px) rotate(45deg)'  : '';
      s2.style.opacity   = open ? '0' : '';
      s3.style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity   = '';
        });
      });
    });
  }

  // ── Scroll reveal ─────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings slightly
      const parent   = entry.target.parentElement;
      const siblings = [...parent.querySelectorAll('.reveal')];
      const idx      = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 75) + 'ms';
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObs.observe(el));

  // ── Marquee: duplicate spans to fill ─────────────────────
  const track = document.querySelector('.marquee-track');
  if (track) {
    const original = track.querySelector('span');
    if (original) {
      for (let i = 0; i < 4; i++) {
        track.appendChild(original.cloneNode(true));
      }
    }
  }

  // ── Gallery filter (gallery page only) ───────────────────
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !show);
          if (show) item.style.animation = 'fadeItem .4s ease forwards';
        });
      });
    });
  }

  // Gallery tilt on hover
  galleryItems.forEach(item => {
    item.addEventListener('mousemove', e => {
      const r = item.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 5;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 5;
      item.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  // ── Hero parallax (home page only) ───────────────────────
  const heroBg = document.querySelector('.hero-bg-text');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform =
        `translate(-50%, calc(-50% + ${window.scrollY * 0.22}px))`;
    }, { passive: true });
  }

  // ── Contact form ──────────────────────────────────────────
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('.btn-submit');
      const originalText = btn.textContent;
      
      // Update button state
      btn.textContent = 'Sending…';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      // Collect form data
      const formData = {
        name:      document.getElementById('name').value.trim(),
        email:     document.getElementById('email').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        piece:     document.getElementById('piece').value,
        budget:    document.getElementById('budget').value,
        message:   document.getElementById('message').value.trim(),
        timeline:  document.getElementById('timeline').value.trim(),
      };

      try {
        // Send to Cloudflare Worker - NO TRAILING SLASH!
        const response = await fetch('https://emailworkerneudanii.lethabomabilo53.workers.dev', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success!
          form.reset();
          
          if (formSuccess) {
            formSuccess.style.display = 'block';
            formSuccess.style.opacity = '0';
            
            // Fade in success message
            setTimeout(() => {
              formSuccess.style.transition = 'opacity 0.4s ease';
              formSuccess.style.opacity = '1';
            }, 10);
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
              formSuccess.style.opacity = '0';
              setTimeout(() => {
                formSuccess.style.display = 'none';
              }, 400);
            }, 8000);
          }
          
          // Reset button
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.opacity = '1';
          
        } else {
          throw new Error(result.error || 'Failed to send');
        }
        
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error state
        btn.textContent = 'Error — Please Try Again';
        btn.style.opacity = '1';
        
        // Reset button after 4 seconds
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 4000);
      }
    });

    // Basic email validation on blur
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (email && !isValid) {
          emailInput.style.borderColor = '#d4af37';
        } else {
          emailInput.style.borderColor = '';
        }
      });
    }
  }

});

// Inject gallery fade keyframe
const s = document.createElement('style');
s.textContent = `
  @keyframes fadeItem {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(s);
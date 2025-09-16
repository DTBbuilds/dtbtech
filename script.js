// Contact Form
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = e.target[0].value || 'choomba';
  alert(
    `Message sent, ${name}! We’ll get back to you faster than a quantum bit!`
  );
  e.target.reset();
});

// Scroll Animations
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('section > div, section > form').forEach(el => {
  el.classList.add('fade-out');
  observer.observe(el);
});

// Button Feedback - Removed alert to allow natural action

// Function declarations at module level
function updateSlides(slides, slideButtons, currentSlide) {
  slides.style.transform = `translateX(-${currentSlide * 100}%)`;
  // Update indicators
  slideButtons.forEach((btn, idx) => {
    btn.classList.toggle('bg-blue-400', idx === currentSlide);
    btn.classList.toggle('bg-gray-400', idx !== currentSlide);
  });
}

function handleSwipe(touchStartX, touchEndX, currentSlide, slides, slideButtons) {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && currentSlide < 2) {
      currentSlide++;
    } else if (diff < 0 && currentSlide > 0) {
      currentSlide--;
    }
    updateSlides(slides, slideButtons, currentSlide);
  }
  return currentSlide;
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  // Carousel functionality
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const slides = carousel.querySelector('.flex');
    const slideButtons = document.querySelectorAll('[data-slide]');
    let currentSlide = 0;

    // Touch swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener(
      'touchstart',
      e => {
        touchStartX = e.changedTouches[0].screenX;
      },
      false
    );

    carousel.addEventListener(
      'touchend',
      e => {
        touchEndX = e.changedTouches[0].screenX;
        currentSlide = handleSwipe(touchStartX, touchEndX, currentSlide, slides, slideButtons);
      },
      false
    );

    // Click handlers for slide indicators
    slideButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        currentSlide = idx;
        updateSlides(slides, slideButtons, currentSlide);
      });
    });

    // Auto-advance slides
    setInterval(() => {
      if (!document.hidden) {
        currentSlide = (currentSlide + 1) % 3;
        updateSlides(slides, slideButtons, currentSlide);
      }
    }, 5000);
  }

  // Stats Counter Animation
  const counters = document.querySelectorAll('.counter');
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
  };

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const steps = 50;
        const stepValue = target / steps;
        let current = 0;

        const updateCounter = () => {
          current += stepValue;
          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach(counter => counterObserver.observe(counter));

  // Contact Orb Position
  const contactOrb = document.getElementById('contact-orb');
  if (contactOrb) {
    const updateOrbPosition = () => {
      if (window.innerWidth < 768) {
        contactOrb.classList.remove('top-20', 'left-4');
        contactOrb.classList.add('bottom-4', 'right-4');
      } else {
        contactOrb.classList.remove('bottom-4', 'right-4');
        contactOrb.classList.add('top-20', 'left-4');
      }
    };

    // Initial position
    updateOrbPosition();
    // Update on resize
    window.addEventListener('resize', updateOrbPosition);
  }

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Lazy Loading Images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Easter Egg
  const logo = document.getElementById('easter-egg');
  const easterEgg = document.getElementById('easter-egg-modal');
  let clickCount = 0;

  if (logo && easterEgg) {
    logo.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 5) {
        easterEgg.classList.remove('hidden');
        clickCount = 0;
      }
    });

    document.getElementById('close-egg')?.addEventListener('click', () => {
      easterEgg.classList.add('hidden');
    });
  }

  // Performance Optimization
  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced resize handler
  const debouncedResize = debounce(() => {
    // Update any size-dependent features
    // updateOrbPosition(); // Commented out - function definition not found
  }, 250);

  window.addEventListener('resize', debouncedResize);

  // Handle reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document
      .querySelectorAll('.animate-float, .animate-glitch, .animate-bounce')
      .forEach(el => {
        el.style.animation = 'none';
      });
  }
});

// Stats Counter
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const speed = 2000 / target; // Adjusts animation speed
    const updateCount = () => {
      if (count < target) {
        count += Math.ceil(target / 100);
        counter.textContent = count > target ? target : count;
        setTimeout(updateCount, speed);
      } else {
        counter.textContent = target;
      }
    };
    updateCount();
  });
}

const statsSection = document.querySelector('.p-10.bg-slate-900');
const statsObserver = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      statsObserver.unobserve(statsSection);
    }
  },
  { threshold: 0.5 }
);
statsSection && statsObserver.observe(statsSection);

// Easter Egg
let clickCount = 0;
const logo = document.querySelector('header img');
const egg = document.getElementById('easter-egg');
const closeEgg = document.getElementById('close-egg');

logo?.addEventListener('click', () => {
  clickCount++;
  if (clickCount === 5) {
    egg.classList.remove('hidden');
    // Visual feedback instead of audio (more reliable)
    egg.style.animation = 'pulse 0.5s ease-in-out';
    clickCount = 0;
  }
});

closeEgg?.addEventListener('click', () => {
  egg.classList.add('hidden');
});

// Footer Button Effects - Fixed autoplay policy violation
document.querySelectorAll('footer a').forEach(btn => {
  btn.addEventListener('click', e => {
    // Visual feedback instead of audio
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 150);

    // Only prevent default for external social links and contact methods
    if (btn.href.includes('tel')) {
      e.preventDefault();
      alert(`Calling ${btn.title.split(' ')[2]}—connect with DTB now!`);
    } else if (btn.href.includes('wa.me')) {
      e.preventDefault();
      alert(
        `WhatsApping ${btn.href.includes('729983567') ? '+254-729983567' : '+254-104160502'}—chat with us!`
      );
    } else if (
      btn.href.includes('facebook.com') ||
      btn.href.includes('twitter.com') ||
      btn.href.includes('linkedin.com') ||
      btn.href.includes('instagram.com') ||
      btn.href.includes('youtube.com') ||
      btn.href.includes('tiktok.com')
    ) {
      // Let external social links work normally (don't prevent default)
      // They will open in new tab due to target="_blank"
    }
    // Allow internal navigation links (Quick Links) to work normally
    // Don't call e.preventDefault() for .html links
  });
});

// Tech Lab Card Effects - Fixed autoplay policy violation
document.querySelectorAll('.tech-lab.html .animate-float').forEach(card => {
  card.addEventListener('click', () => {
    // Visual feedback instead of audio
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 150);

    const title = card.querySelector('h4').textContent;
    alert(`Exploring ${title}—dive into DTB's innovation!`);
  });
});

// Social Links Click Sound - Fixed autoplay policy violation
document
  .querySelectorAll('.p-6 a:not([href*="tel"]):not([href*="mailto"])')
  .forEach(link => {
    link.addEventListener('click', () => {
      // Visual feedback instead of audio
      link.style.transform = 'scale(0.95)';
      setTimeout(() => {
        link.style.transform = 'scale(1)';
      }, 150);
    });
  });

// Unified Button Effects - Fixed autoplay policy violation
document.querySelectorAll('.p-6 a, footer a').forEach(btn => {
  btn.addEventListener('click', e => {
    // Visual feedback instead of audio
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 150);

    if (btn.href.includes('tel') || btn.href.includes('wa.me')) {
      e.preventDefault();
      alert(
        `Connecting via ${btn.href.includes('tel') ? 'phone' : 'WhatsApp'}!`
      );
    }
  });
});

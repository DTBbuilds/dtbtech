// Contact Form
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target[0].value || 'choomba';
    alert(`Message sent, ${name}! We’ll get back to you faster than a quantum bit!`);
    e.target.reset();
});

// Scroll Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section > div, section > form').forEach(el => {
    el.classList.add('fade-out');
    observer.observe(el);
});

// Button Feedback
document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(btn => {
    btn.addEventListener('click', () => {
        alert(`Connecting you now, choomba!`);
    });
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    // Carousel functionality
    const carousel = document.getElementById('carousel');
    if (carousel) {
        const slides = carousel.querySelector('.flex');
        const slideButtons = document.querySelectorAll('[data-slide]');
        let currentSlide = 0;

        function updateSlides() {
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
            // Update indicators
            slideButtons.forEach((btn, idx) => {
                btn.classList.toggle('bg-blue-400', idx === currentSlide);
                btn.classList.toggle('bg-gray-400', idx !== currentSlide);
            });
        }

        // Touch swipe functionality
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0 && currentSlide < 2) {
                    // Swipe left
                    currentSlide++;
                } else if (diff < 0 && currentSlide > 0) {
                    // Swipe right
                    currentSlide--;
                }
                updateSlides();
            }
        }

        // Click handlers for slide indicators
        slideButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                currentSlide = index;
                updateSlides();
            });
        });

        // Auto-advance slides
        setInterval(() => {
            if (!document.hidden) {
                currentSlide = (currentSlide + 1) % 3;
                updateSlides();
            }
        }, 5000);
    }

    // Stats Counter Animation
    const counters = document.querySelectorAll('.counter');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
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
                    block: 'start'
                });
            }
        });
    });

    // Lazy Loading Images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
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
        document.querySelectorAll('.animate-float, .animate-glitch, .animate-bounce').forEach(el => {
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
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.unobserve(statsSection);
    }
}, { threshold: 0.5 });
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
        new Audio('assets/ping.mp3').play(); // Reuse ping sound
        clickCount = 0;
    }
});

closeEgg?.addEventListener('click', () => {
    egg.classList.add('hidden');
});

// Footer Button Effects
document.querySelectorAll('footer a').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        new Audio('assets/ping.mp3').play();
    });
    btn.addEventListener('click', (e) => {
        if (!btn.href.includes('tiktok') && !btn.href.includes('mailto')) {
            e.preventDefault();
            alert(`Connecting you via ${btn.title.split(' ')[0]}!`);
        }
    });
});

// Footer Button Effects
document.querySelectorAll('footer a').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        new Audio('assets/ping.mp3').play();
    });
    btn.addEventListener('click', (e) => {
        if (btn.href.includes('tel')) {
            e.preventDefault();
            alert(`Calling ${btn.title.split(' ')[2]}—connect with DTB now!`);
        } else if (btn.href.includes('wa.me')) {
            e.preventDefault();
            alert(`WhatsApping ${btn.href.includes('729983567') ? '+254-729983567' : '+254-104160502'}—chat with us!`);
        }
    });
});

// Tech Lab Card Effects
document.querySelectorAll('.tech-lab.html .animate-float').forEach(card => {
    card.addEventListener('mouseenter', () => {
        new Audio('assets/ping.mp3').play();
    });
    card.addEventListener('click', () => {
        const title = card.querySelector('h4').textContent;
        alert(`DTB’s ${title}: Ready to brew some tech magic for you! Contact us to get started.`);
    });
});

// Social Links Hover Sound
document.querySelectorAll('.p-6 a:not([href*="tel"]):not([href*="mailto"])').forEach(link => {
    link.addEventListener('mouseenter', () => {
        new Audio('assets/ping.mp3').play();
    });
});

// Unified Button Effects
document.querySelectorAll('.p-6 a, footer a').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        new Audio('assets/ping.mp3').play();
    });
    btn.addEventListener('click', (e) => {
        if (btn.href.includes('tel') || btn.href.includes('wa.me')) {
            e.preventDefault();
            const num = btn.href.includes('729983567') ? '+254-729983567' : '+254-104160502';
            alert(`${btn.href.includes('tel') ? 'Calling' : 'WhatsApping'} ${num}—reach DTB now!`);
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: stop observing after animation
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with fade-up class
document.addEventListener('DOMContentLoaded', () => {
    // Help button pulse animation
    const helpButton = document.querySelector('.fixed.bottom-8.right-8 a');
    if (helpButton) {
        // Add subtle pulse animation after 3 seconds
        setTimeout(() => {
            helpButton.classList.add('animate-pulse');
            setTimeout(() => {
                helpButton.classList.remove('animate-pulse');
            }, 2000);
        }, 3000);

        // Add pulse animation on scroll if user reaches bottom
        let lastScrollPosition = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            
            // If user is near bottom and scrolling down
            if (currentScroll > lastScrollPosition && currentScroll > maxScroll - 200) {
                helpButton.classList.add('animate-pulse');
                setTimeout(() => {
                    helpButton.classList.remove('animate-pulse');
                }, 2000);
            }
            
            lastScrollPosition = currentScroll;
        });
    }

    // Add fade-up class to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.classList.add('fade-up');
        // Add staggered delay
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });

    // Add fade-up to section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('fade-up');
        observer.observe(title);
    });

    // Add smooth scroll behavior for anchor links
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
});

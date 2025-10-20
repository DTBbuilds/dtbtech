document.addEventListener('DOMContentLoaded', () => {
    // Enhanced header functionality
    const header = document.querySelector('site-header header'); // Target the actual header element inside the custom element
    const navLinks = document.querySelectorAll('site-header nav a[href]'); // Refined selector for nav links
    const currentPath = window.location.pathname;

    if (!header) {
        console.error('Header element not found!');
        return; // Exit if header isn't found
    }

    // Scroll effects
    let lastScroll = 0;
    const scrollThreshold = 50;

    // Initial state classes
    header.classList.add('header-default', 'header-visible');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove classes for background/blur effect based on scroll position
        if (currentScroll > scrollThreshold) {
            header.classList.add('header-scrolled');
            header.classList.remove('header-default');
        } else {
            header.classList.remove('header-scrolled');
            header.classList.add('header-default');
        }

        // Add/remove classes to hide/show header on scroll direction
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down past 100px
            header.classList.add('header-hidden');
            header.classList.remove('header-visible');
        } else {
            // Scrolling up or near the top
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }

        lastScroll = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    });

    // Active nav item highlight
    navLinks.forEach(item => {
        const href = item.getAttribute('href');
        // Improved logic for matching paths, including index
        if (href && (href === currentPath || 
            (currentPath.endsWith('/') && href === currentPath.slice(0, -1)) || // Handles trailing slash
            (currentPath === '/' && href === '/'))) { // Handles root path explicitly
            item.classList.add('active'); // Ensure an 'active' class CSS rule exists
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // Ensure targetId is a valid selector (starts with #, not just #)
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else if (targetId === '#') {
                // Scroll to top if href="#"
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Add hover effect to nav items
    navLinks.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('active')) {
                item.style.transform = 'translateY(-2px)';
            }
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });
    });
});

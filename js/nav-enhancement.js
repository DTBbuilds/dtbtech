document.addEventListener('DOMContentLoaded', () => {
    // Enhanced header functionality
    const header = document.querySelector('.site-header, nav.fixed');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;

    // Scroll effects
    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add glass effect and shadow on scroll
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled', 'backdrop-blur-md');
            header.style.setProperty('--header-bg', 'rgba(15, 23, 42, 0.95)');
            header.style.setProperty('--header-border', 'rgba(148, 163, 184, 0.2)');
        } else {
            header.classList.remove('scrolled', 'backdrop-blur-md');
            header.style.setProperty('--header-bg', 'rgba(15, 23, 42, 0.8)');
            header.style.setProperty('--header-border', 'rgba(148, 163, 184, 0.1)');
        }

        // Hide/show header on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle with animation
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle mobile menu with animation
            if (!isExpanded) {
                mobileMenu.classList.add('active');
                mobileMenu.style.transform = 'translateY(0)';
                mobileMenu.style.opacity = '1';
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileMenu.style.opacity = '0';
                setTimeout(() => {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }, 300);
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') &&
                !mobileMenu.contains(e.target) &&
                !mobileMenuButton.contains(e.target)) {
                mobileMenuButton.click();
            }
        });
    }

    // Active nav item highlight
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || 
            (currentPath.endsWith('/') && href === currentPath.slice(0, -1)) ||
            (currentPath === '/' && href === 'index.html')) {
            item.classList.add('active');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenuButton.click();
                }
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenuButton.click();
        }
    });

    // Add hover effect to nav items
    navItems.forEach(item => {
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

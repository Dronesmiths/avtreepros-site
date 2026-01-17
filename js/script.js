// Basic interactions scripts
document.addEventListener('DOMContentLoaded', () => {
    console.log('AV Tree Pros site loaded');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const icon = mobileBtn ? mobileBtn.querySelector('i') : null;

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            navMenu.classList.toggle('active');

            // Toggle icon
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }


    // Dynamic Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Comparison Slider Logic (New Range Input Method)
    document.querySelectorAll('.av-yard-ba-slider').forEach(slider => {
        const range = slider.querySelector('.av-yard-range');
        const after = slider.querySelector('.av-yard-after');
        const divider = slider.querySelector('.av-yard-divider');
        const handle = slider.querySelector('.av-yard-handle');

        function update(val) {
            after.style.clipPath = `inset(0 0 0 ${val}%)`;
            divider.style.left = val + '%';
            handle.style.left = val + '%';
        }

        if (range && after && divider && handle) {
            update(range.value);
            range.addEventListener('input', e => update(e.target.value));
        }
    });
});

// Cookie Consent Banner
function initCookieConsent() {
    // Check if user has already consented
    if (localStorage.getItem('cookieConsent')) {
        return;
    }

    // Create cookie banner
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <p>
                <strong>🍪 We use cookies</strong><br>
                We use cookies to improve your experience. By continuing, you agree to our use of cookies. 
                <a href="/privacy/" style="color: var(--primary-gold); text-decoration: underline;">Learn more</a>
            </p>
            <div class="cookie-buttons">
                <button id="cookie-accept" class="btn btn-primary">Accept</button>
                <button id="cookie-decline" class="btn btn-secondary">Decline</button>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #cookie-consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        }
        .cookie-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }
        .cookie-content p {
            margin: 0;
            flex: 1;
            line-height: 1.6;
        }
        .cookie-buttons {
            display: flex;
            gap: 10px;
        }
        @media (max-width: 768px) {
            .cookie-content { flex-direction: column; text-align: center; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    // Handle accept/decline
    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();
    });
    
    document.getElementById('cookie-decline').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        banner.remove();
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
    initCookieConsent();
}

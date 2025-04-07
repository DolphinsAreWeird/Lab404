/**
 * LAB404 Website JavaScript v2.2 - FINAL & VERIFIED
 * Description: Main JS functionality including header, menu, theme toggle,
 *              smooth scroll, active nav, form validation, visible colored particles,
 *              scroll animations.
 * Last Updated: March 28, 2025
 */

document.addEventListener('DOMContentLoaded', function() {

    // Add 'loaded' class for initial fade-in
    document.body.classList.add('loaded');

    // --- Header Scroll Behavior ---
    const header = document.querySelector('.header');
    function handleHeaderScroll() {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll(); // Initial check

    // --- Mobile Menu - UPDATED VERSION ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    const overlay = document.querySelector('.mobile-menu-overlay');

    function closeMenu() {
        if (menuToggle?.classList.contains('active')) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            mainNav?.classList.remove('show');
            overlay?.classList.remove('active');
            body.classList.remove('menu-open');
        }
    }

    if (menuToggle && mainNav && overlay) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded.toString());
            mainNav.classList.toggle('show');
            overlay.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        overlay.addEventListener('click', closeMenu);
        
        // Ensure links in the menu are clickable by stopping propagation
        mainNav.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                closeMenu();
            });
        });
        
        document.addEventListener('keydown', e => (e.key === 'Escape' && mainNav.classList.contains('show')) && closeMenu());
    } else {
        console.warn("Mobile menu elements not found. Menu functionality might be limited.");
    }

    // --- Theme Toggle ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = themeToggleButton?.querySelector('.sun-icon');
    const moonIcon = themeToggleButton?.querySelector('.moon-icon');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const lightThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-light').trim() || '#f8f9fa';
    const darkThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim() || '#1c1c21';

    const applyTheme = (theme) => {
        const isDarkMode = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (sunIcon) sunIcon.style.display = isDarkMode ? 'none' : 'inline-block';
        if (moonIcon) moonIcon.style.display = isDarkMode ? 'inline-block' : 'none';
        if (themeToggleButton) themeToggleButton.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
        if (metaThemeColor) metaThemeColor.setAttribute('content', isDarkMode ? darkThemeColor : lightThemeColor);
    };

    let currentTheme = localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Particle listener handles color update
        });
    }

    try {
        window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (!localStorage.getItem('theme')) {
                const newColorScheme = event.matches ? 'dark' : 'light';
                applyTheme(newColorScheme);
                // Particle listener handles color update
            }
        });
    } catch (e) { console.warn("matchMedia listener error."); }


    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = header ? header.offsetHeight : 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = window.pageYOffset + elementPosition - headerOffset - 20;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        closeMenu();
                    }
                } catch (error) { console.error(`Scroll error (selector: ${targetId}):`, error); }
            }
        });
    });

    // --- Active Navigation Link ---
    try {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.header .nav-links a');

        const setActiveLink = (links) => {
             let isHomeActive = (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || currentPath === '');
             links.forEach(link => {
                 const linkHref = link.getAttribute('href');
                 if (!linkHref) return;
                 const linkPath = linkHref.split('/').pop() || 'index.html';
                 link.classList.remove('active');
                 if ((linkPath === currentPath && currentPath !== 'index.html' && !isHomeActive) ||
                     (isHomeActive && (linkPath === 'index.html' || linkHref === 'index.html'))) {
                     link.classList.add('active');
                 }
             });
        }
        setActiveLink(navLinks);

    } catch(error) { console.error("Error setting active navigation link:", error); }

    // --- Scroll Indicator - NEW ---
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        // Check if scroll indicator should be visible
        function checkScrollIndicator() {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        }
        
        // Scroll to content when clicked
        scrollIndicator.addEventListener('click', function() {
            window.scrollBy({
                top: window.innerHeight / 2,
                behavior: 'smooth'
            });
        });
        
        // Check on scroll
        window.addEventListener('scroll', checkScrollIndicator, { passive: true });
        
        // Check on load and resize
        window.addEventListener('resize', checkScrollIndicator, { passive: true });
        checkScrollIndicator();
    }

    // --- Form Validation Helpers ---
    function isValidEmail(email) { if (!email) return false; const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(String(email).toLowerCase()); }
    function showFieldError(field, message) { if (!field) return; const formGroup = field.closest('.form-group'); if (!formGroup) return; field.classList.add('error'); field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', field.id + '-error'); let errorContainer = formGroup.querySelector('.error-message'); if (errorContainer) { errorContainer.id = field.id + '-error'; errorContainer.textContent = message; errorContainer.style.display = 'block'; } }
    function clearFieldError(field) { if (!field) return; const formGroup = field.closest('.form-group'); if (!formGroup) return; field.classList.remove('error'); field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); const errorContainer = formGroup.querySelector('.error-message'); if (errorContainer) { errorContainer.textContent = ''; errorContainer.style.display = 'none'; } }
    function setFormStatus(form, message, type = 'error') { const statusDiv = form.querySelector('.form-status'); if (statusDiv) { statusDiv.textContent = message; statusDiv.classList.remove('success', 'error'); statusDiv.classList.add(type); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite'); } }

    // --- Contact Form ---
    const contactForm = document.getElementById('lab404-contact-form');
    if (contactForm) {
        contactForm.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        const contactFormStatusDiv = contactForm.querySelector('.form-status');
        if (contactFormStatusDiv) contactFormStatusDiv.style.display = 'none';
        contactForm.querySelectorAll('.form-control').forEach(input => { input.addEventListener('input', () => clearFieldError(input)); });
        contactForm.addEventListener('submit', function(e) {
             e.preventDefault();
             let isValid = true;
             const name = document.getElementById('name');
             const email = contactForm.querySelector('#email');
             const message = document.getElementById('message');
             const formStatus = document.getElementById('form-status');
             const submitButton = contactForm.querySelector('button[type="submit"]');
             const originalButtonText = submitButton ? submitButton.textContent : 'Submit Message';

             [name, email, message].forEach(field => field && clearFieldError(field));
             if (formStatus) { formStatus.style.display = 'none'; formStatus.textContent = ''; formStatus.className = 'form-status'; }
             if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('success', 'loading'); submitButton.innerHTML = originalButtonText; }

             if (!name || !name.value.trim()) { showFieldError(name, 'Name is required.'); isValid = false; }
             if (!email || !email.value.trim()) { showFieldError(email, 'Email is required.'); isValid = false; }
             else if (!isValidEmail(email.value)) { showFieldError(email, 'Please enter a valid email address.'); isValid = false; }
             if (!message || !message.value.trim()) { showFieldError(message, 'Message is required.'); isValid = false; }
             else if (message.value.trim().length < 10) { showFieldError(message, 'Message should be at least 10 characters.'); isValid = false; }

             if (isValid) {
                 if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; submitButton.classList.add('loading'); }
                 fetch(contactForm.action, { method: contactForm.method, body: new FormData(contactForm), headers: {'Accept': 'application/json'} })
                 .then(response => {
                     if (response.ok) {
                         setFormStatus(contactForm, 'Thank you! Your message has been sent.', 'success'); contactForm.reset();
                         if (submitButton) { submitButton.innerHTML = '<i class="fas fa-check"></i> Sent!'; submitButton.classList.add('success'); setTimeout(() => { if (submitButton.classList.contains('success')) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('success', 'loading'); } }, 4000); }
                     } else {
                         response.json().then(data => { const errMsg = data.errors ? data.errors.map(err => err.message).join(', ') : 'Sorry, there was an error.'; setFormStatus(contactForm, errMsg, 'error'); }).catch(() => { setFormStatus(contactForm, 'Sorry, there was an error sending your message.', 'error'); });
                         if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('loading'); }
                     }
                 })
                 .catch(error => { console.error('Form submission error:', error); setFormStatus(contactForm, 'Network error. Please try again.', 'error'); if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('loading'); } });
             } else {
                 setFormStatus(contactForm, 'Please correct the errors highlighted below.', 'error');
                 contactForm.querySelector('.form-control.error')?.focus();
             }
        });
    }

    // --- Newsletter Form (Mailchimp POST Simulation) ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const newsletterStatusDiv = document.getElementById('newsletter-status');
        if (newsletterStatusDiv) newsletterStatusDiv.style.display = 'none';
        const nlEmailInput = document.getElementById('newsletter-email');
        if (nlEmailInput) { nlEmailInput.addEventListener('input', () => { nlEmailInput.classList.remove('error'); if (newsletterStatusDiv?.classList.contains('error')) { newsletterStatusDiv.style.display = 'none'; newsletterStatusDiv.textContent = ''; newsletterStatusDiv.classList.remove('error'); } }); }

        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const statusDiv = document.getElementById('newsletter-status');
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : 'Subscribe';

            const mailchimpFormActionUrl = 'https://YOUR_ACCOUNT.usXX.list-manage.com/subscribe/post?u=YOUR_USER_ID&id=YOUR_LIST_ID&f_id=YOUR_FORM_ID'; // EXAMPLE URL - REPLACE
            const mailchimpEmailFieldName = 'EMAIL';

            if (!statusDiv || !emailInput) return;

            statusDiv.textContent = ''; statusDiv.style.display = 'none'; statusDiv.classList.remove('success', 'error');
            emailInput.classList.remove('error');
            if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('success', 'loading'); submitButton.innerHTML = originalButtonText; }

            if (isValidEmail(emailInput.value)) {
                if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...'; submitButton.classList.add('loading'); }
                const formData = new FormData();
                formData.append(mailchimpEmailFieldName, emailInput.value);
                // formData.append('b_YOUR_USER_ID_YOUR_LIST_ID', ''); // Add honeypot if needed

                fetch(mailchimpFormActionUrl, { method: 'POST', body: formData, mode: 'no-cors' })
                .then(() => {
                    statusDiv.textContent = 'Thanks! Please check your email to confirm subscription.'; statusDiv.classList.add('success'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'polite'); emailInput.value = '';
                    if (submitButton) { submitButton.innerHTML = '<i class="fas fa-check"></i> Check Email!'; submitButton.classList.remove('loading'); submitButton.classList.add('success'); setTimeout(() => { if(submitButton.classList.contains('success')) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('success'); } }, 5000); }
                })
                .catch(error => { console.error('Newsletter fetch error:', error); statusDiv.textContent = 'Subscription failed due to a network issue. Please try again later.'; statusDiv.classList.add('error'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'assertive'); if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('loading'); } });
            } else {
                statusDiv.textContent = 'Please enter a valid email address.'; statusDiv.classList.add('error'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'assertive'); emailInput.classList.add('error'); emailInput.focus();
            }
        });
    }


    // --- Initialize TSparticles with Theme Adaptation ---
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("tsparticles", { // Target the div#tsparticles
            fpsLimit: 60,
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: "#ff0000" }, // Placeholder, overridden dynamically
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.15, sync: false } },
                size: { value: 2.5, random: true },
                links: { enable: true, distance: 130, color: "#ff0000", opacity: 0.3, width: 1 }, // Placeholder color
                move: { enable: true, speed: 0.6, direction: "none", random: true, straight: false, outModes: { default: "out" }, bounce: false },
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: false }, resize: true },
                modes: { bubble: { distance: 150, size: 4, duration: 2, opacity: 0.8 } }
            },
            detectRetina: true
        }).then(container => {
            const particleContainer = container; // Store container instance

            // Function to update particle colors based on theme
            const updateParticleColors = () => {
                 // Use setTimeout to ensure CSS variables reflect the new theme
                setTimeout(() => {
                    const styles = getComputedStyle(document.documentElement);
                    const isDarkMode = document.body.classList.contains('dark-mode');

                    // Get colors from CSS variables
                    const particleColor = styles.getPropertyValue('--current-accent-secondary').trim();
                    const baseLineColor = isDarkMode ? styles.getPropertyValue('--text-dark-secondary').trim() : styles.getPropertyValue('--text-light-secondary').trim();
                    const lineColor = `${baseLineColor}4D`; // Add alpha hex (e.g., 4D for ~30%)

                    if (particleContainer?.options) {
                        particleContainer.options.particles.color.value = particleColor;
                        if (particleContainer.options.particles.links) {
                           particleContainer.options.particles.links.color = lineColor;
                        }
                        if(particleContainer.options.interactivity.modes.bubble) {
                            particleContainer.options.interactivity.modes.bubble.color = particleColor;
                        }
                        particleContainer.refresh(); // Apply changes
                    }
                }, 50); // 50ms delay
            }

            // Set initial colors based on current theme
            updateParticleColors();

            // Add listeners to update particle colors on theme change events
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', updateParticleColors);
            }
            try {
                window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
                    if (!localStorage.getItem('theme')) { // Only if no user preference
                        updateParticleColors();
                    }
                });
            } catch (e) { console.warn("matchMedia listener error for particles."); }

        }).catch(error => {
            console.error("Error loading particles:", error);
        });
    } else {
        console.warn("tsParticles library not found. Skipping particle initialization.");
    }


    // --- Updated Scroll Fade-in Animations ---
    const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
    if ('IntersectionObserver' in window) {
        // More generous threshold to start animations sooner
        const observerOptions = { threshold: 0.05, rootMargin: '0px 0px -30px 0px' };
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        animatedElements.forEach((el) => animationObserver.observe(el));
    } else { // Fallback
        console.warn("IntersectionObserver not supported, scroll animations disabled.");
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

}); // End DOMContentLoaded
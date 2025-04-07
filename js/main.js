/**
 * LAB404 Website JavaScript v2.6 - Mobile Nav Fix Attempt 2
 * Description: Main JS functionality including header, menu, theme toggle,
 * smooth scroll, active nav, form validation, visible colored particles,
 * scroll animations, and simplified scroll-down-only indicator.
 * FIX: Added stopPropagation to menu container clicks.
 * Restored nav link listener, only closes menu for non-hash links.
 * Last Updated: April 8, 2025
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

    // --- Mobile Menu - FINALIZED EVENT HANDLING ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = mainNav ? mainNav.querySelectorAll('ul.nav-links a') : [];

    // --- Check if essential elements exist ---
    if (!menuToggle || !mainNav || !overlay || !body) {
        console.error('Mobile navigation elements not found. Check selectors: .menu-toggle, .main-nav, .mobile-menu-overlay');
    } else {

        // --- Function to toggle all relevant classes ---
        const toggleMenu = (forceClose = false) => {
            const isCurrentlyShown = mainNav.classList.contains('show');
            if (forceClose && !isCurrentlyShown) return;
            const action = (forceClose || isCurrentlyShown) ? 'remove' : 'add';
            const isOpening = action === 'add';
            menuToggle.classList[action]('active');
            mainNav.classList[action]('show');
            overlay.classList[action]('active');
            body.classList[action]('menu-open');
            menuToggle.setAttribute('aria-expanded', isOpening);
        };

        // --- Event Listener for the Menu Toggle Button ---
        menuToggle.addEventListener('click', (e) => {
            toggleMenu();
        });

        // --- Event Listener for the Overlay ---
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { // Only close if click is *directly* on overlay
                 toggleMenu(true);
            }
        });

        // --- NEW: Stop clicks *inside* the menu from bubbling up ---
        mainNav.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent clicks inside menu from reaching overlay/document
        });

        // --- RESTORED & MODIFIED: Event Listener for Nav Links ---
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // This listener now ONLY closes the menu for *external/non-hash* links.
                // Hash link closing is handled by the smooth scroll function.
                if (mainNav.classList.contains('show')) {
                    const isSamePageLink = (link.pathname === window.location.pathname || link.pathname === '') && link.hostname === window.location.hostname;
                    const isHashLink = link.hash && link.hash.length > 1;

                    // Close menu immediately ONLY if it's NOT a same-page hash link
                    if (!(isSamePageLink && isHashLink)) {
                         toggleMenu(true); // Force close for external links
                    }
                    // For same-page hash links, do nothing here - smooth scroll handles closing.
                }
                // Do NOT stop propagation here, allow link navigation/smooth scroll default actions.
            });
        });

        // --- Close menu if Escape key is pressed ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('show')) {
                toggleMenu(true);
            }
        });

    } // End if elements exist check
    // --- End Mobile Menu ---


    // --- Theme Toggle ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = themeToggleButton?.querySelector('.sun-icon');
    const moonIcon = themeToggleButton?.querySelector('.moon-icon');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let lightThemeColor = '#f8f9fa';
    let darkThemeColor = '#1c1c21';
    try {
        lightThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-light').trim() || lightThemeColor;
        darkThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim() || darkThemeColor;
    } catch(e) { console.warn("Could not read theme colors from CSS initially."); }

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
            if (typeof updateParticleColors === 'function') {
               updateParticleColors();
            }
        });
    }

    try {
        window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (!localStorage.getItem('theme')) {
                const newColorScheme = event.matches ? 'dark' : 'light';
                applyTheme(newColorScheme);
                if (typeof updateParticleColors === 'function') {
                    updateParticleColors();
                }
            }
        });
    } catch (e) { console.warn("matchMedia listener error."); }


    // --- Smooth Scrolling ---
    function closeMenuIfExists() {
        if (typeof toggleMenu === 'function' && mainNav && mainNav.classList.contains('show')) {
            toggleMenu(true);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const isSamePage = (this.pathname === window.location.pathname || this.pathname === '') && this.hostname === window.location.hostname;

            if (targetId && targetId.length > 1 && targetId.startsWith('#') && isSamePage) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault(); // Stop default jump
                        const headerOffset = header ? header.offsetHeight : 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = window.pageYOffset + elementPosition - headerOffset - 20;

                        // Close menu *before* scrolling (if it's open)
                        closeMenuIfExists(); // <<<< Handles closing for HASH links

                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                } catch (error) {
                    console.error(`Scroll error (selector: ${targetId}):`, error);
                    closeMenuIfExists();
                 }
            } else if (targetId === '#') {
                 e.preventDefault();
                 closeMenuIfExists();
            }
            // External links are handled by the restored nav link listener above or default browser action
        });
    });

    // --- Active Navigation Link ---
    try {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const headerNavLinks = document.querySelectorAll('.header .nav-links a');

        const setActiveLink = (links) => {
             let isHomeActive = (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || currentPath === '');
             links.forEach(link => {
                 const linkHref = link.getAttribute('href');
                 if (!linkHref) return;
                 let linkPath = 'index.html';
                 try { const url = new URL(linkHref, window.location.origin); linkPath = url.pathname.split('/').pop() || 'index.html'; }
                 catch (e) { if (linkHref.startsWith('#') || linkHref === '') { linkPath = null; } else { linkPath = linkHref.split('/').pop() || 'index.html'; } }
                 link.classList.remove('active');
                 if (linkPath === null) return;
                 if (isHomeActive && (linkPath === 'index.html' || linkHref === 'index.html' || linkHref === './')) { link.classList.add('active'); }
                 else if (!isHomeActive && linkPath === currentPath) { link.classList.add('active'); }
             });
        }
        if (headerNavLinks.length > 0) setActiveLink(headerNavLinks);
        const mobileNav = document.querySelector('.main-nav');
        if (mobileNav && mobileNav !== headerNavLinks[0]?.closest('.header .main-nav')) {
             const mobileNavLinks = mobileNav.querySelectorAll('ul.nav-links a');
             if (mobileNavLinks.length > 0) setActiveLink(mobileNavLinks);
        }
    } catch(error) { console.error("Error setting active navigation link:", error); }

    // --- Simplified Scroll Down Indicator ---
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        function checkScrollIndicator() {
            const isScrollable = document.body.scrollHeight > window.innerHeight + 100;
            if (!isScrollable) { scrollIndicator.classList.add('hidden'); return; }
            const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);
            scrollIndicator.classList.toggle('hidden', isAtBottom);
        }
        scrollIndicator.addEventListener('click', function() { window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' }); });
        window.addEventListener('scroll', checkScrollIndicator, { passive: true });
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
             e.preventDefault(); let isValid = true;
             const name = document.getElementById('name'); const email = contactForm.querySelector('#email'); const message = document.getElementById('message');
             const formStatus = contactForm.querySelector('.form-status'); const submitButton = contactForm.querySelector('button[type="submit"]');
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

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const newsletterStatusDiv = document.getElementById('newsletter-status');
        if (newsletterStatusDiv) newsletterStatusDiv.style.display = 'none';
        const nlEmailInput = document.getElementById('newsletter-email');
        if (nlEmailInput) { nlEmailInput.addEventListener('input', () => { nlEmailInput.classList.remove('error'); if (newsletterStatusDiv?.classList.contains('error')) { newsletterStatusDiv.style.display = 'none'; newsletterStatusDiv.textContent = ''; newsletterStatusDiv.classList.remove('error'); } }); }
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email'); const statusDiv = document.getElementById('newsletter-status');
            const submitButton = newsletterForm.querySelector('button[type="submit"]'); const originalButtonText = submitButton ? submitButton.textContent : 'Subscribe';
            const mailchimpFormActionUrl = 'YOUR_MAILCHIMP_FORM_ACTION_URL_HERE'; // <<< REPLACE THIS
            const mailchimpEmailFieldName = 'EMAIL';
            const mailchimpHoneypotFieldName = 'YOUR_MAILCHIMP_HONEYPOT_FIELD_NAME_HERE'; // <<< REPLACE or remove
            if (!statusDiv || !emailInput) return;
             if (mailchimpFormActionUrl === 'YOUR_MAILCHIMP_FORM_ACTION_URL_HERE') { console.error("Mailchimp URL not configured in main.js"); setFormStatus(newsletterForm, 'Newsletter form not configured.', 'error'); return; }
            statusDiv.textContent = ''; statusDiv.style.display = 'none'; statusDiv.classList.remove('success', 'error'); emailInput.classList.remove('error');
            if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('success', 'loading'); submitButton.innerHTML = originalButtonText; }
            if (isValidEmail(emailInput.value)) {
                if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...'; submitButton.classList.add('loading'); }
                const formData = new FormData(); formData.append(mailchimpEmailFieldName, emailInput.value);
                 if (mailchimpHoneypotFieldName && mailchimpHoneypotFieldName !== 'YOUR_MAILCHIMP_HONEYPOT_FIELD_NAME_HERE') { formData.append(mailchimpHoneypotFieldName, ''); }
                fetch(mailchimpFormActionUrl, { method: 'POST', body: formData, mode: 'no-cors' })
                .then(() => {
                    statusDiv.textContent = 'Thanks! Please check your email to confirm subscription.'; statusDiv.classList.add('success'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'polite'); emailInput.value = '';
                    if (submitButton) { submitButton.innerHTML = '<i class="fas fa-check"></i> Check Email!'; submitButton.classList.remove('loading'); submitButton.classList.add('success'); setTimeout(() => { if(submitButton.classList.contains('success')) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('success'); } }, 5000); }
                })
                .catch(error => {
                    console.error('Newsletter fetch error:', error); statusDiv.textContent = 'Subscription failed due to a network issue. Please try again later.'; statusDiv.classList.add('error'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'assertive');
                    if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonText; submitButton.classList.remove('loading'); }
                 });
            } else {
                statusDiv.textContent = 'Please enter a valid email address.'; statusDiv.classList.add('error'); statusDiv.style.display = 'block'; statusDiv.setAttribute('role', 'alert'); statusDiv.setAttribute('aria-live', 'assertive'); emailInput.classList.add('error'); emailInput.focus();
            }
        });
    }

    // --- Particle Function Placeholder ---
    let updateParticleColors = () => {};

    // --- Initialize TSparticles with Theme Adaptation ---
    if (typeof tsParticles !== 'undefined') {
        let particleContainerInstance = null;
        updateParticleColors = () => { // Actual implementation
             setTimeout(() => {
                 if (!particleContainerInstance?.options) { return; }
                const styles = getComputedStyle(document.documentElement); const isDarkMode = document.body.classList.contains('dark-mode');
                try {
                    const particleColor = styles.getPropertyValue('--current-accent-secondary').trim() || '#ef5350';
                    const baseLineColor = isDarkMode ? (styles.getPropertyValue('--text-dark-secondary').trim() || '#aeb8c7') : (styles.getPropertyValue('--text-light-secondary').trim() || '#495057');
                    const lineColorHex = `${baseLineColor}4D`;
                    particleContainerInstance.options.particles.color.value = particleColor;
                    if (particleContainerInstance.options.particles.links) { particleContainerInstance.options.particles.links.color = lineColorHex; }
                    particleContainerInstance.refresh().catch(error => { console.error("Error refreshing particles:", error); });
                } catch (e) { console.error("Error getting CSS variables for particle colors:", e); }
            }, 100);
        }
        tsParticles.load("tsparticles", { fpsLimit: 60, particles: { number: { value: 60, density: { enable: true, value_area: 800 } }, color: { value: "#E53935" }, shape: { type: "circle" }, opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.15, sync: false } }, size: { value: 2.5, random: true }, links: { enable: true, distance: 130, color: "#4950574D", opacity: 0.3, width: 1 }, move: { enable: true, speed: 0.6, direction: "none", random: true, straight: false, outModes: { default: "out" }, bounce: false }, }, interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: false }, resize: true }, modes: { bubble: { distance: 150, size: 4, duration: 2, opacity: 0.8 } } }, detectRetina: true })
        .then(container => { console.log("Particles loaded successfully."); particleContainerInstance = container; updateParticleColors(); })
        .catch(error => { console.error("Error loading particles:", error); });
    } else { console.warn("tsParticles library not found. Skipping particle initialization."); }

    // --- Updated Scroll Fade-in Animations ---
    const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        const observerOptions = { threshold: 0.05, rootMargin: '0px 0px -30px 0px' };
        const animationObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, observerOptions);
        animatedElements.forEach((el) => animationObserver.observe(el));
    } else { if (animatedElements.length > 0) { console.warn("IntersectionObserver not supported, scroll animations disabled."); animatedElements.forEach(el => el.classList.add('is-visible')); } }

}); // End DOMContentLoaded
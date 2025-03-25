/**
 * LAB404 Website JavaScript
 * Created: March 2025
 * Description: Main JavaScript functionality for LAB404 website
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
    }
    
    // Close mobile menu when a link is clicked
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('show');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add active class to nav links based on current page
    const currentPage = window.location.pathname;
    const navLinks2 = document.querySelectorAll('.nav-links a');
    
    navLinks2.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // Handle home page special case
        if (currentPage === '/' && linkPath.includes('/lab404')) {
            link.classList.add('active');
        } 
        // For other pages, check if the current path includes the link path
        else if (currentPage.includes(linkPath) && linkPath !== '/') {
            link.classList.add('active');
        }
    });
    
    // Form validation for contact form
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            // Reset error states
            [name, email, message].forEach(field => {
                field.classList.remove('error');
            });
            
            // Simple validation
            if (!name.value.trim()) {
                name.classList.add('error');
                isValid = false;
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                email.classList.add('error');
                isValid = false;
            }
            
            if (!message.value.trim()) {
                message.classList.add('error');
                isValid = false;
            }
            
            if (isValid) {
                // For demo purposes, show a success message
                // In production, this would submit to a server
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields correctly.');
            }
        });
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Scroll to top button functionality
    const scrollButton = document.getElementById('scroll-top');
    
    if (scrollButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('show');
            } else {
                scrollButton.classList.remove('show');
            }
        });
        
        // Scroll to top when button is clicked
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('language-toggle');
    const languageModal = document.getElementById('language-modal');
    const closeBtn = document.querySelector('.close-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');

    // Function to show the modal
    function showModal() {
        languageModal.style.display = 'flex';
        // Close the mobile menu if it's open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }

    // Function to hide the modal
    function hideModal() {
        languageModal.style.display = 'none';
    }

    // Event listeners
    languageToggle.addEventListener('click', showModal);

    closeBtn.addEventListener('click', hideModal);

    // Close modal if user clicks outside of the modal content
    languageModal.addEventListener('click', function(event) {
        if (event.target === languageModal) {
            hideModal();
        }
    });

    // Handle keyboard accessibility (Escape key)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && languageModal.style.display === 'flex') {
            hideModal();
        }
    });
});
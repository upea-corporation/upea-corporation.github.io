document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('language-toggle');
    const languageModal = document.getElementById('language-modal');
    const closeBtn = languageModal.querySelector('.close-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');

    // Mostrar modal añadiendo la clase 'active'
    function showModal() {
        languageModal.classList.add('active');
        // Cierra el menú móvil si está abierto
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }

    // Ocultar modal quitando la clase 'active'
    function hideModal() {
        languageModal.classList.remove('active');
    }

    // Event listeners
    languageToggle.addEventListener('click', showModal);

    closeBtn.addEventListener('click', hideModal);

    // Cerrar al hacer clic fuera del contenido
    languageModal.addEventListener('click', function(event) {
        if (event.target === languageModal) {
            hideModal();
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && languageModal.classList.contains('active')) {
            hideModal();
        }
    });
});
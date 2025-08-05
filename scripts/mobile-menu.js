/**
 * Script para manejar el menú desplegable en dispositivos móviles
 */

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.navbar ul');

    if (menuToggle && navLinks) {
        // Toggle del menú al hacer clic en el botón hamburguesa
        menuToggle.addEventListener('click', function (event) {
            event.stopPropagation(); // Evita que el clic se propague al documento
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Cierra el menú cuando se hace clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });
        
        // Cierra el menú cuando se hace clic fuera de él
        document.addEventListener('click', function(event) {
            const isClickInsideNavbar = navLinks.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInsideNavbar && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
});
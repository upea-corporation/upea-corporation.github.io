/**
 * accordion.js — Maneja el acordeón clásico (.accordion-header)
 * y el nuevo sistema de observaciones (.obs-trigger) en páginas de entidades.
 */
document.addEventListener('DOMContentLoaded', function () {

    /* ── Acordeón clásico ── */
    const classicHeaders = document.querySelectorAll('.accordion-header');
    classicHeaders.forEach(function (header) {
        header.addEventListener('click', function () {
            const item    = this.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            this.classList.toggle('active');
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                content.style.maxHeight = null;
            } else {
                content.classList.add('show');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
            classicHeaders.forEach(function (other) {
                if (other !== header) {
                    other.classList.remove('active');
                    var oc = other.closest('.accordion-item').querySelector('.accordion-content');
                    oc.classList.remove('show');
                    oc.style.maxHeight = null;
                }
            });
        });
    });

    /* ── Nuevo sistema de observaciones (.obs-trigger) ── */
    const obsTriggers = document.querySelectorAll('.obs-trigger');
    obsTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            const item    = this.closest('.obs-item');
            const content = item.querySelector('.obs-content');
            const isOpen  = item.classList.contains('open');

            // Cerrar todos los demás
            document.querySelectorAll('.obs-item.open').forEach(function (openItem) {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.obs-content').style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove('open');
                content.style.maxHeight = null;
            } else {
                item.classList.add('open');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

});

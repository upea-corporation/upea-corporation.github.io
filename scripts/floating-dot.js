document.addEventListener('DOMContentLoaded', () => {
    const floatingDot = document.createElement('div');
    floatingDot.classList.add('floating-dot');
    document.body.appendChild(floatingDot);

    const messageBubble = document.createElement('div');
    messageBubble.innerHTML = `
        <p style="margin-bottom: 5px; font-weight: bold;">¡AVISO!</p>
        <p>Cambio en la jerarquía de UPEA Corporation: Algunos entrevistadores no estarán disponibles pronto.</p>

    `;
    messageBubble.classList.add('message-bubble');
    document.body.appendChild(messageBubble);

    let messageTimeout;

    const showMessageBubble = () => {
        messageBubble.classList.add('show');
        messageTimeout = setTimeout(() => {
            messageBubble.classList.remove('show');
        }, 6000);
    };

    const hideMessageBubble = () => {
        clearTimeout(messageTimeout);
        messageBubble.classList.remove('show');
    };

    // Referencia al footer
    const footer = document.querySelector('footer');

    // Función para ajustar la posición en base al footer
    const adjustPositionBasedOnFooter = () => {
        const dotHeight = floatingDot.offsetHeight; // Get the actual height of the dot
        const bubbleHeight = messageBubble.offsetHeight; // Get the actual height of the bubble

        if (footer) {
            const footerTop = footer.getBoundingClientRect().top + window.scrollY;
            const windowBottom = window.scrollY + window.innerHeight;

            if (windowBottom > footerTop) {
                const overlap = windowBottom - footerTop;
                const bottomOffsetForDot = overlap + 20; // 20px de margen sobre el footer para el punto

                floatingDot.style.bottom = `${bottomOffsetForDot}px`;
                // Position bubble above the dot + a small margin
                messageBubble.style.bottom = `${bottomOffsetForDot + dotHeight + 10}px`; // 10px margin between dot and bubble
            } else {
                // Default position when footer is not in view
                floatingDot.style.bottom = '20px';
                // Position bubble above the dot + a small margin
                messageBubble.style.bottom = `${20 + dotHeight + 10}px`; // 20px from bottom + dot height + 10px margin
            }
        } else {
            // If no footer, maintain default fixed position
            floatingDot.style.bottom = '20px';
            // Position bubble above the dot + a small margin
            messageBubble.style.bottom = `${20 + dotHeight + 10}px`; // 20px from bottom + dot height + 10px margin
        }
    };

    // Call the function initially and on scroll/resize
    adjustPositionBasedOnFooter();
    window.addEventListener('scroll', adjustPositionBasedOnFooter);
    window.addEventListener('resize', adjustPositionBasedOnFooter);

    // Evento de clic para el punto rojo
    floatingDot.addEventListener('click', () => {
        if (messageBubble.classList.contains('show')) {
            hideMessageBubble();
        } else {
            showMessageBubble();
        }
    });

    // Initial check in case content loads dynamically and changes bubble height
    setTimeout(adjustPositionBasedOnFooter, 100);
});

document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM del formulario de un solo campo
    const valueLoginForm = document.getElementById('valueLoginForm');
    const valueLoginMessage = document.getElementById('valueLoginMessage');

    // Verificar si el formulario existe en la página
    if (valueLoginForm) {
        // Añadir un event listener para el evento 'submit'
        valueLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el envío tradicional del formulario

            // Obtener el valor del campo de entrada
            const idInput = document.getElementById('valueIdentification').value;

            try {
                // Realizar una petición POST a la Netlify Function de verificación
                const response = await fetch('/.netlify/functions/verifyCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: idInput }) 
                });

                const contentType = response.headers.get('content-type');

                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;
                } else {
                    const errorData = await response.json();
                    valueLoginMessage.textContent = errorData.message || "Credenciales incorrectas o error desconocido.";
                    valueLoginMessage.className = "message error";
                }

            } catch (error) {
                console.error('Error al enviar la petición:', error);
                valueLoginMessage.textContent = "Error de conexión o respuesta inválida.";
                valueLoginMessage.className = "message error";
            }
        });
    }
});
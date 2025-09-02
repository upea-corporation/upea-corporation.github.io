document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM específicos para el formulario de códigos
    const valueLoginForm = document.getElementById('valueLoginForm');
    const valueLoginMessage = document.getElementById('valueLoginMessage');

    // Verificar si el formulario de login de códigos existe en la página
    if (valueLoginForm) {
        // Añadir un event listener para cuando se envíe el formulario de códigos
        valueLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Obtener el valor del campo de entrada
            const idInput = document.getElementById('valueIdentification').value;

            try {
                // Realizar una petición POST a la Netlify Function de verificación de códigos
                const response = await fetch('/.netlify/functions/verifyCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: idInput }) // ✅ CORREGIDO: Cambiado de 'code' a 'value'
                });

                const contentType = response.headers.get('content-type');

                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;
                } else {
                    const errorData = await response.json();
                    // Usar la variable correcta para mostrar el mensaje de error
                    valueLoginMessage.textContent = errorData.message || "Credenciales incorrectas o error desconocido.";
                    valueLoginMessage.className = "message error";
                }

            } catch (error) {
                console.error('Error al enviar la petición o al procesar la respuesta:', error);
                valueLoginMessage.textContent = "Error de conexión o respuesta inválida. Intente de nuevo.";
                valueLoginMessage.className = "message error";
            }
        });
    }
});
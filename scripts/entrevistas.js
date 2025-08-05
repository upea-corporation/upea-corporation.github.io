document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM específicos para el formulario de entrevistas
    const interviewLoginForm = document.getElementById('interviewLoginForm'); // Nuevo ID para el formulario de entrevistas
    const interviewLoginMessage = document.getElementById('interviewLoginMessage'); // Nuevo ID para el mensaje de entrevistas

    // Verificar si el formulario de login de entrevistas existe en la página
    if (interviewLoginForm) {
        // Añadir un event listener para cuando se envíe el formulario de entrevistas
        interviewLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recargar la página)

            // Obtener los valores de identificación y código de los campos de entrada
            const idInput = document.getElementById('entityIdentification').value; // Nuevo ID para el campo de identificación de entidad
            const codeInput = document.getElementById('entityPassword').value; // Nuevo ID para el campo de código de entidad

            try {
                // Realizar una petición POST a la Netlify Function de verificación de entrevistas
                const response = await fetch('/.netlify/functions/verifyEntidad', { // Apunta a la nueva función
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entidad: idInput, code: codeInput })
                });

                const contentType = response.headers.get('content-type');

                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;

                } else if (response.ok && contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    interviewLoginMessage.textContent = data.message || "Respuesta inesperada de la función (JSON de éxito inesperado).";
                    interviewLoginMessage.className = "message error";
                }
                else {
                    const errorData = await response.json();
                    interviewLoginMessage.textContent = errorData.message || "Credenciales incorrectas o error desconocido.";
                    interviewLoginMessage.className = "message error";
                }

            } catch (error) {
                console.error('Error al enviar la petición o al procesar la respuesta:', error);
                interviewLoginMessage.textContent = "Error de conexión o respuesta inválida. Intente de nuevo.";
                interviewLoginMessage.className = "message error";
            }
        });
    }
});

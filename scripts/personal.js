document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM específicos para el formulario de personal
    const personalLoginForm = document.getElementById('personalLoginForm'); // Nuevo ID para el formulario de personal
    const personalLoginMessage = document.getElementById('personalLoginMessage'); // Nuevo ID para el mensaje de personal

    // Verificar si el formulario de login de personal existe en la página
    if (personalLoginForm) {
        // Añadir un event listener para cuando se envíe el formulario de personal
        personalLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recargar la página)

            // Obtener los valores de identificación y contraseña de los campos de entrada
            // CORRECCIÓN: Los IDs de los inputs en el HTML son 'personalIdentification' y 'personalPassword'
            const idInput = document.getElementById('personalIdentification').value;
            const passwordInput = document.getElementById('personalPassword').value;

            try {
                // Realizar una petición POST a la Netlify Function de verificación de personal
                const response = await fetch('/.netlify/functions/verifyPersonal', { // Apunta a la nueva función
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador: idInput, password: passwordInput })
                });

                const contentType = response.headers.get('content-type');

                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;

                } else if (response.ok && contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    personalLoginMessage.textContent = data.message || "Respuesta inesperada de la función (JSON de éxito inesperado).";
                    personalLoginMessage.className = "message error";
                }
                else {
                    const errorData = await response.json();
                    personalLoginMessage.textContent = errorData.message || "Credenciales incorrectas o error desconocido.";
                    personalLoginMessage.className = "message error";
                }

            } catch (error) {
                console.error('Error al enviar la petición o al procesar la respuesta:', error);
                personalLoginMessage.textContent = "Error de conexión o respuesta inválida. Intente de nuevo.";
                personalLoginMessage.className = "message error";
            }
        });
    }
});
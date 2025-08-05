document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('personalLoginForm');
    const message = document.getElementById('personalLoginMessage');

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // CORRECCIÓN: Usar los IDs correctos de los inputs del HTML
            const identificador = document.getElementById('personalIdentification').value;
            const password = document.getElementById('personalPassword').value;

            try {
                const response = await fetch('/.netlify/functions/verifyPersonal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador, password })
                });

                const contentType = response.headers.get('content-type');

                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;
                } else {
                    const data = await response.json();
                    message.textContent = data.message || "Credenciales incorrectas o error desconocido.";
                    message.className = "message error";
                }
            } catch (error) {
                console.error('Error al enviar la petición:', error);
                message.textContent = "Error de conexión. Por favor, inténtelo de nuevo más tarde.";
                message.className = "message error";
            }
        });
    }
});
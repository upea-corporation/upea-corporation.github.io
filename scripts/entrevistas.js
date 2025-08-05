document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('interviewLoginForm');
    const message = document.getElementById('interviewLoginMessage');

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // CORRECCIÓN: Usar los IDs correctos de los inputs del HTML
            const entidad = document.getElementById('entityIdentification').value;
            const code = document.getElementById('entityPassword').value;

            try {
                const response = await fetch('/.netlify/functions/verifyEntidad', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entidad, code })
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
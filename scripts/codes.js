document.addEventListener('DOMContentLoaded', function() {
    const codeLoginForm = document.getElementById('codeLoginForm');
    const codeLoginMessage = document.getElementById('codeLoginMessage');
    if (codeLoginForm) {
        codeLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const idInput = document.getElementById('codeIdentification').value;
            try {
                const response = await fetch('/.netlify/functions/verifyCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: idInput })
                });
                const contentType = response.headers.get('content-type');
                if (response.ok && contentType && contentType.includes('text/html')) {
                    const htmlContent = await response.text();
                    document.documentElement.innerHTML = htmlContent;
                } else {
                    const errorData = await response.json();
                    codeLoginMessage.textContent = errorData.message || "Credenciales incorrectas o error desconocido.";
                    codeLoginMessage.className = "message error";
                }
            } catch (error) {
                console.error('Error al enviar la petición:', error);
                codeLoginMessage.textContent = "Error de conexión o respuesta inválida.";
                codeLoginMessage.className = "message error";
            }
        });
    }
});
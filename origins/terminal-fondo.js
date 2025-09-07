// scripts/background-effect.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '0123456789ABCDEF!@#$%^&*()_+{}[]:;<>,.?/~`|';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // *** CAMBIA ESTA LÍNEA ***
        ctx.fillStyle = '#0F0'; // Verde brillante, como el de las terminales
        // O un verde un poco más suave si el 0F0 es demasiado intenso:
        // ctx.fillStyle = '#00FF00'; 

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let animationFrameId;
    function animate() {
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drops.length = 0;
        const newColumns = Math.floor(canvas.width / fontSize);
        for (let i = 0; i < newColumns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
        }
        animate();
    });

    animate();
});
// scripts/main.js

document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const terminalContainer = document.querySelector('.terminal-container'); // Obtener el contenedor principal
    const body = document.body; // Referencia al body para cambiar el fondo

    // Mensaje inicial de la terminal (incluyendo el copyright)
    const initialMessageContent = `UPEA Corporation - Terminal
Versión 0.30920.25 (Build 135744)
(c) 2025 UPEA Corp. Todos los derechos reservados.

Escribe 'help' para ver los comandos disponibles del acceso a la información de las instalaciones disponibles.
`;

    let charIndex = 0;
    let typingSpeed = 30;
    let terminalLocked = false; // Nueva variable para controlar el estado de bloqueo general

    function typeWriterEffect(message, callback) {
        if (charIndex < message.length) {
            terminalOutput.textContent += message.charAt(charIndex);
            charIndex++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(() => typeWriterEffect(message, callback), typingSpeed);
        } else if (callback) {
            callback();
        }
    }

    function addLineToTerminal(text) {
        if (terminalLocked) return; // No añadir líneas si el sistema está comprometido
        terminalOutput.textContent += "\n" + text;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    const commands = {
        'help': () => {
            addLineToTerminal("Comandos disponibles:");
            addLineToTerminal("  help                   - Muestra esta ayuda.");
            addLineToTerminal("  clear                  - Limpia la consola.");
            addLineToTerminal("  country                - Muestra las instalaciones actuales de UPEA Corporation.");
            addLineToTerminal("  access [country]       - Accede a la información de una instalación.");
            addLineToTerminal("\n");
        },
        'country': () => {
            addLineToTerminal("Instalaciones de UPEA Corporation Registradas:");
            addLineToTerminal("  spain          ");
            addLineToTerminal("  germany        ");
            addLineToTerminal("  russia         ");
            addLineToTerminal("  southKorea     ");
            addLineToTerminal("  japan          ");
            addLineToTerminal("  unitedStates   ");
            addLineToTerminal("  antarctica     ");
            addLineToTerminal("  canada                 - No Disponible");
            addLineToTerminal("  australia              - No Disponible");
            addLineToTerminal("  greenland              - No Disponible");
            addLineToTerminal("  rdc                    - No Disponible");
            addLineToTerminal("  brazil                 - No Disponible");
            addLineToTerminal("\n");
        },
        'clear': () => {
            terminalOutput.textContent = initialMessageContent.trim() + '\n';
            charIndex = initialMessageContent.length;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        },
        'access': (args) => {
            const country = args[0] ? args[0].toLowerCase() : '';
            let targetUrl = '';

            switch (country) {
                case 'spain':
                    targetUrl = 'country/upea-corp-spain.html';
                    break;
                case 'germany':
                    targetUrl = 'country/upea-corp-germany.html';
                    break;
                case 'russia':
                    targetUrl = 'country/upea-corp-russia.html';
                    break;
                case 'southKorea':
                    targetUrl = 'country/upea-corp-southKorea.html';
                    break;
                case 'japan':
                    targetUrl = 'country/upea-corp-japan.html';
                    break;
                case 'unitedStates':
                    targetUrl = 'country/upea-corp-unitedStates.html';
                    break;
                case 'antarctica':
                    targetUrl = 'country/upea-corp-antarctica.html';
                    break;
                default:
                    addLineToTerminal(`Error: Protocolo '${country}' no reconocido. Use 'country' para ver las instalaciones disponibles.
                        `);
                    return;
            }

            if (targetUrl) {
                addLineToTerminal(`Accediendo a ${country.toUpperCase()}...`);
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 1000);
            }
        },
    };

    // Deshabilitar la entrada de la terminal al inicio
    terminalInput.disabled = true;
    terminalInput.style.pointerEvents = 'none'; // También deshabilita clics para mayor seguridad visual
    terminalInput.style.opacity = '0.5'; // Visualmente indica que está deshabilitado

    terminalInput.addEventListener('keydown', (event) => {
        // Si el sistema está bloqueado (por el comando exit), ignorar todos los eventos de teclado
        if (terminalLocked) {
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            const input = terminalInput.value.trim();
            addLineToTerminal(`upea@root:omega-prime:~$ ${input}`);
            terminalInput.value = '';

            if (input === '') {
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                return;
            }

            const parts = input.split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (commands[command]) {
                commands[command](args);
            } else {
                addLineToTerminal(`Comando '${command}' no encontrado. Escriba 'help' para asistencia.`);
            }
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });

    // Iniciar el efecto de escritura al cargar la página
    typeWriterEffect(initialMessageContent, () => {
        // Habilitar la entrada de la terminal una vez que el mensaje ha terminado
        terminalInput.disabled = false;
        terminalInput.style.pointerEvents = 'auto'; // Habilitar clics
        terminalInput.style.opacity = '1'; // Volver a la opacidad normal
        terminalInput.focus(); // Enfocar el input después del mensaje de bienvenida
    });
});

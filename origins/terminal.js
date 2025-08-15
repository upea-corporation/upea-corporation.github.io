document.addEventListener('DOMContentLoaded', () => {
    const terminalScreen = document.getElementById('terminalScreen');
    const terminalInput = document.getElementById('terminalInput');
    const promptElement = document.querySelector('.prompt'); // Get the prompt element

    // Terminal state variables
    let isBooting = true;
    let classifiedAccessGranted = false; // Controls if access code has been entered
    let helpAttemptCount = 0;
    const maxHelpAttempts = 5;
    const redirectUrl = "upea-corp.netlify.app"; // URL to redirect to after 'help' attempts

    // Typing effect variables
    const initialTypingSpeed = 30; // Normal typing speed
    const fastTypingSpeed = 1;    // Very fast typing speed for background tab
    let currentTypingSpeed = initialTypingSpeed;

    // Simulates text typing effect
    const typeWriter = (text, element, callback = () => {}) => {
        let i = 0;
        const type = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                // Use currentTypingSpeed for dynamic adjustment
                setTimeout(type, currentTypingSpeed);
            } else {
                callback();
            }
        };
        type();
    };

    // Clears the terminal screen
    const clearTerminal = () => {
        terminalScreen.innerHTML = '';
    };

    // Prints a message to the terminal
    const printMessage = (message, className = '') => {
        const p = document.createElement('p');
        p.className = className;
        p.innerHTML = message;
        terminalScreen.appendChild(p);
        terminalScreen.scrollTop = terminalScreen.scrollHeight; // Scroll to the bottom
    };

    // Function to update the command prompt based on access level
    const updatePrompt = () => {
        if (classifiedAccessGranted) {
            promptElement.textContent = '>upea@console:~# '; // Root/Elevated access prompt
        } else {
            promptElement.textContent = '>upea@console:~$ '; // Default user prompt
        }
    };

    // Terminal boot sequence messages
    const bootSequence = [
        "UPEA Corp. - Terminal de Acceso Clasificado",
        "Versión 3.10720.25 (Build 132056)",
        "(c) 2025 UPEA Corp. Todos los derechos reservados.",
        "   ", // Blank line for spacing
        "Cargando módulos de seguridad...",
        "Verificando integridad del sistema de archivos...",
        "Conexión con servidor central establecida.",
        "Acceso a base de datos: [ACCESO DENEGADO]",
        "   ", // Blank line for spacing
        "Por favor, introduzca la clave de acceso autorizado para acceder a la información clasificada de UPEA Corporation.",
        "   ", // Blank line for spacing
        "¡CLAVE DE ACCESO REQUERIDA!"
    ];

    // Command to access classified information
    const accessCodeCommand = "access code:gamma upea@corporation:8443";
    const accessCodeCommand2 = "access code:omega-prime upea@corporation:3307"; // New command for redirection

    // List of countries to display after access is granted (English, hyphenated)
    const countries = [
        "Spain (Headquarters)", "Germany (Support)", "Russia (Anomalous Research)", "United-States (Primary Containment)", "South-Korea (Primary Research)", "Japan (Maritime Research)", "Antarctica (Research and Studies Headquarters)"
    ];

    // Map of countries to HTML file names (lowercase and hyphenated)
    const countryFileMap = {
        'spain': 'country/upea-corp-spain.html',
        'germany': 'country/upea-corp-germany.html',
        'russia': 'country/upea-corp-russia.html',
        'united-states': 'country/upea-corp-unitedStates.html',
        'south-korea': 'country/upea-corp-southKorea.html',
        'japan': 'country/upea-corp-japan.html',
        'antarctica': 'country/upea-corp-antarctica.html'
    };

    // Initiates the boot sequence
    const startBoot = () => {
        terminalInput.disabled = true; // Disable input during boot
        terminalInput.style.pointerEvents = 'none'; // Also disable clicks for visual security
        terminalInput.style.opacity = '0.6'; // Visually indicate it's disabled

        let delay = 0;
        bootSequence.forEach((line, index) => {
            setTimeout(() => {
                const p = document.createElement('p');
                terminalScreen.appendChild(p);
                // Pass currentTypingSpeed to typeWriter
                typeWriter(line, p, () => {
                    if (index === bootSequence.length - 1) {
                        isBooting = false;
                        terminalInput.disabled = false; // Enable input after boot
                        terminalInput.style.pointerEvents = 'auto'; // Enable clicks
                        terminalInput.style.opacity = '1'; // Restore normal opacity
                        terminalInput.focus();
                        updatePrompt(); // Update prompt after boot sequence ends
                    }
                });
            }, delay);
            // Adjust delay based on line length for typing effect + a small pause
            delay += line.length * initialTypingSpeed + 100; // Always use initialTypingSpeed for delay calculation
        });
    };

    // Processes user commands
    const processCommand = (command) => {
        // Display the command entered by the user using the current prompt text
        printMessage(`${promptElement.textContent}${command}`);
        terminalInput.value = ''; // Clear the input bar immediately

        if (isBooting) {
            printMessage("El sistema aún se está inicializando. Por favor, espere.");
            return;
        }

        const lowerCommand = command.toLowerCase().trim();

        // Handle 'help' command (available at any level)
        if (lowerCommand === 'help') {
            helpAttemptCount++;
            if (helpAttemptCount < maxHelpAttempts) {
                printMessage(`ADVERTENCIA: El comando 'help' no está disponible. Si intenta usar comandos no autorizados ${maxHelpAttempts - helpAttemptCount} veces más, su acceso será revocado.`, 'warning-message');
            } else {
                printMessage(`ACCESO REVOCADO. Demasiados intentos de comandos no autorizados. Redirigiendo a la página principal...`, 'warning-message');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 3000); // Redirect after 3 seconds
            }
            return;
        }

        // Commands for initial state (before access)
        if (!classifiedAccessGranted) {
            if (lowerCommand === accessCodeCommand) {
                clearTerminal();
                printMessage("AUTORIZACIÓN DE NIVEL ALPHA CONCEDIDA.", 'system-message');
                printMessage("Permiso de acceso clasificado las instalaciones de UPEA Corporation concedido.", 'system-message');
                printMessage("  "); // Blank line
                printMessage("Lista de ubicaciones de las instalaciones de UPEA Corporation:");
                countries.forEach(country => {
                    printMessage(`- ${country}`);
                });
                printMessage("  "); // Blank line
                printMessage("Para acceder a la información, use el formato: access db/[country]");
                printMessage("  "); // Blank line
                printMessage("Para acceder a los datos clasificados de los orígenes, introduzca el código de acceso correspondiente.");
                printMessage("  "); // Blank line
                classifiedAccessGranted = true;
                updatePrompt(); // Update prompt after classified access is granted
            } else if (lowerCommand === accessCodeCommand2) { // Added functionality for accessCodeCommand2
                clearTerminal();
                printMessage("AUTORIZACIÓN DE NIVEL OMEGA-PRIME CONCEDIDA.", 'system-message');
                printMessage("Accediendo a la base de datos clasificada...", 'system-message');
                setTimeout(() => {
                    window.location.href = 'classified/origenes.html'; // Redirect to the specific HTML page
                }, 1500); // Small delay for message visibility
                return; // Exit function after redirection
            } else {
                printMessage("CLAVE DE ACCESO INCORRECTA. Inténtelo de nuevo.");
            }
            return;
        }

        // Commands available AFTER classified access is granted
        if (classifiedAccessGranted) {
            if (lowerCommand.startsWith('access db/')) {
                const countryPart = lowerCommand.substring('access db/'.length);
                const fileName = countryFileMap[countryPart];

                if (fileName) {
                    printMessage(`Accediendo a información de ${countryPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}...`, 'system-message');
                    setTimeout(() => {
                        window.location.href = fileName; // Redirect to the country's HTML page
                    }, 1500); // Small delay for message visibility
                } else {
                    printMessage(`Ubicación de origen desconocida: '${countryPart}'.`);
                    printMessage("Por favor, use uno de los países listados.");
                }
                return; // Important to return after processing a valid command
            }
        }

        // Default response for unknown commands if nothing else matched
        printMessage(`Comando desconocido: '${command}'.`);
    };

    // Event listener for terminal input
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value;
            processCommand(command);
        }
    });

    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // When tab is hidden, speed up typing if still booting
            if (isBooting) {
                currentTypingSpeed = fastTypingSpeed;
            }
        } else {
            // When tab becomes visible, revert to normal typing speed
            currentTypingSpeed = initialTypingSpeed;
        }
    });

    // Start the boot sequence when the page loads
    startBoot();

    // Ensure the input is focused when the page loads
    terminalInput.focus();

    // Initial prompt update (will show default user prompt before boot sequence starts)
    updatePrompt();
});

document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const upeaCorpBaseURL = "upea-corp.netlify.app";
    const upeaCodexBaseURL = "upea-corporation.github.io/upea-codex.github.io";
    const MAX_LINES = 70;
    const INITIAL_DELAY_SECONDS = 7; // Retraso inicial antes de que comience la actividad (en segundos)

    // Variable para controlar la velocidad de la simulación (en milisegundos)
    // Un valor más bajo hará la simulación más rápida.
    let simulationSpeed = 20; // Velocidad inicial: 50ms (más rápido que los 70ms anteriores)

    // --- Lógica de Probabilidad Variable (Añadido) ---
    // Probabilidad para una redirección en aproximadamente 1 hora (1/180,000)
    const PROBABILITY_1_HOUR = 1 / (180000); 
    // Probabilidad para una redirección en aproximadamente 3 horas (1/540,000)
    const PROBABILITY_3_HOURS = 1 / (180000 * 3); 

    // Elegir aleatoriamente una de las dos probabilidades al inicio del script
    const redirectionProbability = Math.random() < 0.5 ? PROBABILITY_1_HOUR : PROBABILITY_3_HOURS;
    console.log(`Probabilidad de redirección elegida: ${redirectionProbability}`);
    //-----------------------------------------------------

    // Función para obtener la hora actual en formato HH:MM:SS
    const getTimeStamp = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // Mensajes de actividad de servidor realistas
    const serverActivityMessages = [
        // Pruebas de seguridad
        `[SECURITY] Iniciando escaneo de vulnerabilidades en ${upeaCorpBaseURL}...`,
        `[SECURITY] Escaneo completado: 0 vulnerabilidades críticas encontradas.`,
        `[SECURITY] Verificando permisos de archivo en /var/www/${upeaCorpBaseURL}/htdocs.`,
        `[SECURITY] Alerta: Intento de inyección SQL detectado y bloqueado en /api/auth.`,
        `[SECURITY] Actualizando definiciones de seguridad de firewall... [DONE]`,
        `[SECURITY] Realizando auditoría de logs de acceso.`,
        `[SECURITY] Comprobando integridad de hashes de binarios críticos.`,
        `[SECURITY] Reporte de seguridad generado: /logs/security/daily_scan.log`,
        `[SECURITY] Detección de intrusiones (IDS) activa y monitorizando.`,

        // Cargas y descargas de paquetes/actualizaciones
        `[PACKAGE] Descargando actualización 'core-libs-v2.1.3.tar.gz' (5.2MB)...`,
        `[PACKAGE] Instalando 'nginx-http2-module' v1.1.2...`,
        `[PACKAGE] Verificando dependencias para 'php-fpm-7.4'...`,
        `[PACKAGE] Extrayendo 'database-patch-20250602.zip' a /tmp/updates.`,
        `[PACKAGE] Subiendo log de despliegue a repositorio de control de versiones.`,
        `[PACKAGE] Configurando 'nodejs-runtime' para ${upeaCorpBaseURL}.`,
        `[PACKAGE] Limpiando paquetes huérfanos del sistema.`,
        `[PACKAGE] Sincronizando repositorios de paquetes remotos.`,
        `[PACKAGE] Actualización de sistema operativo pendiente: Ubuntu 22.04 LTS.`,

        // Operaciones de servidor generales
        `[INFO] Conexión establecida con ${upeaCorpBaseURL}`,
        `[DEBUG] Cargando módulos de rendimiento para ${upeaCorpBaseURL}.`,
        `[SUCCESS] Despliegue de ${upeaCorpBaseURL} verificado y en línea.`,
        `[WARN] Posible intento de acceso desde una dirección IP externa no autorizada.`,
        `[ERROR] Fallo en la autenticación de usuario en ${upeaCorpBaseURL}. Reintentando...`,
        `[INFO] Monitorizando tráfico en ${upeaCorpBaseURL}/dashboard.`,
        `[DEBUG] Limpiando caché de CDN para ${upeaCorpBaseURL}.`,
        `[SUCCESS] Actualización de seguridad aplicada a ${upeaCorpBaseURL}. Reinicio necesario.`,
        `[INFO] Recibiendo datos de usuarios de ${upeaCorpBaseURL}/api/data.`,
        `[WARN] Alto uso de CPU (85%) en el servidor de ${upeaCorpBaseURL}.`,
        `[INFO] Servidor de ${upeaCorpBaseURL} operando al 95% de capacidad.`,
        `[DEBUG] Iniciando proceso de backup incremental para ${upeaCorpBaseURL}.`,
        `[SUCCESS] Backup de base de datos completado para ${upeaCorpBaseURL}.`,
        `[ERROR] Base de datos desconectada de ${upeaCorpBaseURL}. Intentando reconexión.`,
        `[INFO] Reanudando servicios de red para ${upeaCorpBaseURL}.`,
        `[DEBUG] Optimizando consultas SQL en ${upeaCorpBaseURL}/database.`,
        `[SUCCESS] Auditoría de logs de sistema completada para ${upeaCorpBaseURL}.`,
        `[WARN] Certificado SSL para ${upeaCorpBaseURL} expirará en 7 días.`,
        `[INFO] Renovando certificado SSL para ${upeaCorpBaseURL} vía Let's Encrypt.`,
        `[ERROR] Problema de red detectado: Latencia elevada a gateway.`,
        `[INFO] Restableciendo conexión de red para ${upeaCorpBaseURL}.`,
        `[DEBUG] Verificando integridad de archivos críticos del sistema.`,
        `[SUCCESS] Reconfiguración de firewall para ${upeaCorpBaseURL} aplicada.`,
        `[WARN] Posible ataque DDoS detectado en ${upeaCorpBaseURL}. Desviando tráfico.`,
        `[INFO] Activando modo de contingencia para ${upeaCorpBaseURL}.`,
        `[INFO] Reindexando base de datos de productos para ${upeaCorpBaseURL}/store.`,
        `[DEBUG] Chequeando espacio en disco: /dev/sda1 (92% usado).`,
        `[SUCCESS] Sincronización de réplicas de base de datos completada.`,
        `[WARN] Proceso 'cron.daily' falló. Revisar logs.`,
        `[INFO] Iniciando monitoreo de estado de servicios críticos.`,
        `[DEBUG] Generando informe de métricas de rendimiento.`,
        `[SUCCESS] Conexión a la red de contenedores establecida.`,
        `[ERROR] Fallo en la conexión con el servicio de caché Redis.`,
        `[INFO] Reiniciando servicio Apache2.`,
        `[DEBUG] Limpiando registros antiguos del sistema.`,
        `[SUCCESS] Tareas programadas ejecutadas correctamente.`
    ];

    // Mensajes para el easter egg de upea-codex.github.io (muy raros)
    const easterEggMessages = [
        `[SYSTEM] Contactando con fuente de conocimiento externa: ${upeaCodexBaseURL}...`,
        `[ACCESS] Acceso al "Codex Upea" verificado en ${upeaCodexBaseURL}/data_archive.`,
        `[LOG] Recuperando fragmentos de información de ${upeaCodexBaseURL}/old_logs.txt.`,
        `[EASTER_EGG] ¿Buscas el conocimiento? Prueba ${upeaCodexBaseURL}`,
        `[INFO] Sincronizando metadatos con el repositorio: ${upeaCodexBaseURL}.`,
        `[DEBUG] Analizando patrones de navegación en ${upeaCodexBaseURL}/history.`,
        `[SUCCESS] Conexión segura establecida con ${upeaCodexBaseURL}.`
    ];

    // Nuevos mensajes aleatorios (normales)
    const randomNormalMessages = [
        // Entrevistas
        "51E96C436E67",
        "546A72776E784678756F",
        "50756A6C726E77",
        "4378676E61",
        // Personal
        "UPEA#313930363230323531333032-DIPC[III]",
        "UPEA#333030353230323531363437-DSPC[I]",
        "UPEA#323930353230323531373535-FIAT[III]",
        "UPEA#333030353230323530323034-DIPC[IV]",
        "admin@UPEA#323230343139393630303030-DEG", // ADMIN
        // Contraseña Personal
        "4A50564D52594C525252",
        "4241424D42594C52",
        "5648554F524A43525252",
        "4A594D52594C52452D525252",
        "426E61656E6155787062", // ADMIN
        //
        `Detección de acceso no autorizado a los servidores con fecha 19 de julio de 2025, entre las 14:10 y las 14:21 horas.`
    ];

    // Mensajes de backup automático (muy raros)
    const backupMessages = [
        `[BACKUP] Iniciando proceso de backup completo para todos los archivos de Upea-Corp.`,
        `[BACKUP] Comprobando espacio disponible en disco remoto para backup.`,
        `[BACKUP] Sincronizando archivos de configuración críticos con el repositorio de backup.`,
        `[BACKUP] Verificando integridad de los datos en el último backup.`,
        `[BACKUP] Backup incremental de la base de datos de usuarios en progreso... (50%)`,
        `[BACKUP] Backup de logs de sistema completado. Enviando a almacenamiento seguro.`,
        `[BACKUP] Proceso de backup automatizado finalizado con éxito. Último backup: ${getTimeStamp()}`,
        `[BACKUP] Alerta: Fallo en la conexión con el servidor de backup secundario. Reintentando...`
    ];

    let isPaused = false;
    let currentInterval;
    let lineCount = 0; // Contador de líneas actuales

    // Función para añadir una línea a la terminal
    const addLine = (text, className = '') => {
        const line = document.createElement('span');
        line.textContent = `${getTimeStamp()} ${text}`; // Añadimos el timestamp aquí
        line.classList.add('line');
        if (className) {
            line.classList.add(className);
        }
        terminal.appendChild(line);
        lineCount++;

        // Eliminar la línea más antigua si se excede el límite
        if (lineCount > MAX_LINES) {
            terminal.firstChild.remove(); // Elimina el primer elemento hijo
            lineCount--;
        }

        terminal.scrollTop = terminal.scrollHeight; // Auto-scroll al final
    };

    // Función para iniciar o reiniciar la simulación con la velocidad actual
    const startSimulation = () => {
        if (currentInterval) {
            clearInterval(currentInterval);
        }
        currentInterval = setInterval(simulateActivity, simulationSpeed);
    };

    // Función para simular la actividad
    const simulateActivity = () => {
        if (isPaused) return;

        // Probabilidad de redirección. Ahora es variable.
        if (Math.random() < redirectionProbability) {
            isPaused = true;
            clearInterval(currentInterval);
            addLine(`[CRÍTICO] MÓDULO CLASUFICADO ACTIVADO. INICIANDO PROTOCOLO DE DESVÍO.`, 'error-message');
            addLine(`[SISTEMA] Redireccionando a ubicación segura en 3 segundos...`, 'special-message');
            
            setTimeout(() => {
                // Modifica esta URL con la página a la que quieres redirigir
                window.location.href = '../origins/terminal.html'; 

            }, 3000); // 3 segundos de pausa antes de la redirección
            
            return;
        }

        // Probabilidad para mensajes de backup (0.05% - aparece 1 de cada 2000 líneas)
        if (Math.random() < 0.005) {
            const randomIndex = Math.floor(Math.random() * backupMessages.length);
            addLine(backupMessages[randomIndex], 'info-message');
            return;
        }

        // Probabilidad para el easter egg (0.001% - aparece 1 de cada 100,000 líneas)
        if (Math.random() < 0.00001) {
            const randomIndex = Math.floor(Math.random() * easterEggMessages.length);
            addLine(easterEggMessages[randomIndex], 'special-message');
            return;
        }

        // Probabilidad de que aparezca un mensaje aleatorio normal
        if (Math.random() < 0.001) {
            const randomIndex = Math.floor(Math.random() * randomNormalMessages.length);
            const selectedMessage = randomNormalMessages[randomIndex];

            // Detener el efecto del servidor
            isPaused = true;
            clearInterval(currentInterval);

            // Mostrar el mensaje de error y el mensaje aleatorio
            addLine(`[WARNING] ERROR: Actividad externa detectada <"${selectedMessage}">`, 'error-message');
            addLine(`[CRITICAL] Actividad de servidor detenida. Investigando causa raíz...`, 'error-message');

            // Reanudar la actividad después de 1 segundo
            setTimeout(() => {
                isPaused = false;
                addLine("[INFO] Actividad de servidor reanudada.", 'success-message');
                startSimulation();
            }, 1000);
            return;
        }

        // Siempre elige un mensaje de actividad de servidor si no se activa nada más
        addLine(serverActivityMessages[Math.floor(Math.random() * serverActivityMessages.length)]);
    };

    // --- Lógica de Inicialización ---
    // Mensaje inicial de carga
    addLine("Inicializando servidor...", 'special-message');
    addLine("Por favor espere mientras se cargan los módulos del sistema...", 'special-message');

    // Después del retraso, iniciar la simulación real
    setTimeout(() => {
        addLine("[INFO] Servidor inicializado. Iniciando monitoreo de actividad...", 'success-message');
        startSimulation(); // Iniciar la simulación de actividad con la velocidad actual
    }, INITIAL_DELAY_SECONDS * 1000); // Convertir segundos a milisegundos

    // --- Función para modificar la velocidad (para uso futuro) ---
    // Puedes llamar a esta función desde la consola del navegador o con un elemento UI.
    window.setSimulationSpeed = (newSpeed) => {
        if (typeof newSpeed === 'number' && newSpeed > 0) {
            simulationSpeed = newSpeed;
            addLine(`[INFO] Velocidad de simulación ajustada a ${newSpeed}ms.`, 'info-message');
            // Si la simulación no está pausada, reiníciala con la nueva velocidad
            if (!isPaused) {
                startSimulation();
            }
        } else {
            console.warn("Velocidad de simulación inválida. Debe ser un número positivo.");
        }
    };
});
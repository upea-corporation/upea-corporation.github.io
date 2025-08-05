// netlify/functions/verifyPersonal.js
// Este script maneja la verificación de credenciales de acceso para el personal.

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let identificador, password;
    try {
        ({ identificador, password } = JSON.parse(event.body));
    } catch (parseError) {
        console.error('Error al parsear el cuerpo de la petición:', parseError);
        return { statusCode: 400, body: JSON.stringify({ message: 'Formato de petición inválido.' }) };
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER_DATA;
    const repo = 'administracion-upea'; // Tu repositorio privado

    // La ruta EXACTA a tu archivo personal.json dentro del repositorio 'administracion-upea'.
    const credentialsPath = 'data/personal.json'; // Apunta a personal.json

    console.log("DEBUG -- Estado de process.env.GITHUB_TOKEN:", githubToken ? "DEFINIDO" : "NO DEFINIDO");
    console.log("DEBUG -- Estado de process.env.GITHUB_REPO_OWNER_DATA:", owner ? "DEFINIDO" : "NO DEFINIDO");
    console.log("DEBUG -- Nombre de repositorio configurado (const repo):", repo);
    console.log("DEBUG -- Ruta de credenciales configurada (const credentialsPath):", credentialsPath);

    if (!githubToken || !owner || !repo) {
        console.error('CRÍTICO: GITHUB_TOKEN, GITHUB_REPO_OWNER_DATA o el nombre del repositorio (const repo) no están definidos o accesibles. No se puede proceder.');
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de configuración interna. Contacta al administrador.' }) };
    }

    let OctokitClass;
    try {
        const octokitModule = await import("@octokit/rest");
        OctokitClass = octokitModule.Octokit;
        if (!OctokitClass) {
            console.warn("Octokit.Octokit no encontrado, intentando con el export por defecto (octokitModule.default).");
            OctokitClass = octokitModule.default;
        }
        if (!OctokitClass) {
             throw new Error("No se pudo cargar la clase Octokit del módulo @octokit/rest.");
        }
    } catch (importError) {
        console.error('Error al importar @octokit/rest de forma dinámica:', importError);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error interno del servidor al cargar dependencias de GitHub.' }) };
    }

    const octokit = new OctokitClass({ auth: githubToken });

    try {
        const credentialsResponse = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: credentialsPath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const credentialsContent = Buffer.from(credentialsResponse.data.content, 'base64').toString('utf-8');

        let usersArray;
        try {
            usersArray = JSON.parse(credentialsContent);

            console.log("LOG: Credenciales de personal.json cargadas exitosamente.");
            console.log("LOG: Identificador recibido en función:", identificador);
            console.log("LOG: Contraseña recibida en función (solo para depuración, cuidado en prod):", password);
            // **NUEVO LOG PARA DEPURACIÓN**
            console.log("LOG: Contenido COMPLETO de personal.json parseado:", JSON.stringify(usersArray, null, 2));
            console.log("LOG: Estructura de personal.json (solo identificadores y pageNames para seguridad):", usersArray.map(u => ({ identificador: u.identificador, pageName: u.pageName })));

        } catch (jsonError) {
            console.error('Error al parsear el JSON de credenciales de personal.json:', jsonError);
            return { statusCode: 500, body: JSON.stringify({ message: 'Error en el formato del archivo de credenciales de personal.' }) };
        }

        const foundUser = usersArray.find(user => user.identificador === identificador);

        if (foundUser && foundUser.password === password) {
            const pageName = foundUser.pageName;

            if (!pageName) {
                console.error(`Error crítico: No se definió la pagina para el identificador '${identificador}'.`);
                return { statusCode: 500, body: JSON.stringify({ message: 'Error: Página de destino no configurada para el personal autenticado.' }) };
            }

            const htmlPageResponse = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: pageName,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            const htmlContent = Buffer.from(htmlPageResponse.data.content, 'base64').toString('utf-8');

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: htmlContent,
            };

        } else {
            return { statusCode: 401, body: JSON.stringify({ message: 'Credenciales incorrectas para el personal.' }) };
        }

    } catch (error) {
        console.error('Error general en la verificación de personal:', error);

        if (error.status === 404) {
             console.error(`DEBUG -- La URL de GitHub que causó el 404 fue: ${error.request.url}`);
             return { statusCode: 500, body: JSON.stringify({ message: 'Error interno: Archivo de credenciales de personal o página HTML no encontrada.' }) };
        }
        if (error.status === 401 || error.status === 403) {
             return { statusCode: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifique su GITHUB_TOKEN y sus permisos.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error inesperado del servidor en la verificación de personal. Contacte al administrador.' }) };
    }
};

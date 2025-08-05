// netlify/functions/verifyEntidad.js
// Este script maneja la verificación de credenciales de acceso para las entrevistas.

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let entidad, code;
    try {
        ({ entidad, code } = JSON.parse(event.body));
    } catch (parseError) {
        console.error('Error al parsear el cuerpo de la petición:', parseError);
        return { statusCode: 400, body: JSON.stringify({ message: 'Formato de petición inválido.' }) };
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER_DATA;
    const repo = 'data-base'; // Tu repositorio privado

    // La ruta EXACTA a tu archivo entrevista.json dentro del repositorio 'data-base'.
    const credentialsPath = 'data/entrevista.json'; // Apunta a entrevista.json

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

            console.log("LOG: Credenciales de entrevista.json cargadas exitosamente.");
            console.log("LOG: Identificación recibido en función:", entidad);
            console.log("LOG: Código recibido en función (solo para depuración, cuidado en prod):", code);
            console.log("LOG: Estructura de entrevista.json (solo identificaciones y pageNames para seguridad):", usersArray.map(u => ({ entidad: u.entidad, pageName: u.pageName })));

        } catch (jsonError) {
            console.error('Error al parsear el JSON de credenciales de entrevista.json:', jsonError);
            return { statusCode: 500, body: JSON.stringify({ message: 'Error en el formato del archivo de credenciales de entrevista.' }) };
        }

        const foundUser = usersArray.find(user => user.entidad === entidad);

        if (foundUser && foundUser.code === code) {
            const pageName = foundUser.pageName;

            if (!pageName) {
                console.error(`Error crítico: No se definió la pagina para la entidad '${entidad}'.`);
                return { statusCode: 500, body: JSON.stringify({ message: 'Error: Página de destino no configurada para la entidad autenticada.' }) };
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
            return { statusCode: 401, body: JSON.stringify({ message: 'Credenciales incorrectas para la entidad.' }) };
        }

    } catch (error) {
        console.error('Error general en la verificación de entidad:', error);

        if (error.status === 404) {
             console.error(`DEBUG -- La URL de GitHub que causó el 404 fue: ${error.request.url}`);
             return { statusCode: 500, body: JSON.stringify({ message: 'Error interno: Archivo de credenciales de entidad o página HTML no encontrada.' }) };
        }
        if (error.status === 401 || error.status === 403) {
             return { statusCode: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifique su GITHUB_TOKEN y sus permisos.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error inesperado del servidor en la verificación de entidad. Contacte al administrador.' }) };
    }
};

// netlify/functions/verifyEntidad.js
exports.handler = async (event) => {
    // Importación dinámica para Octokit.rest y auth-app
    const { Octokit } = await import("@octokit/rest");
    const { createAppAuth } = await import("@octokit/auth-app");

    // AÑADE ESTO PARA DEPURAR (opcional)
    console.log("DEBUG: GITHUB_APP_ID:", process.env.GITHUB_APP_ID);
    console.log("DEBUG: GITHUB_PRIVATE_KEY:", process.env.GITHUB_PRIVATE_KEY ? "CONFIGURADO" : "NO CONFIGURADO");
    console.log("DEBUG: GITHUB_INSTALLATION_ID:", process.env.GITHUB_INSTALLATION_ID);
    console.log("DEBUG: GITHUB_REPO_OWNER_DATA:", process.env.GITHUB_REPO_OWNER_DATA);
    console.log("DEBUG: GITHUB_REPO_NAME:", process.env.GITHUB_REPO_NAME);


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

    const { GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_INSTALLATION_ID, GITHUB_REPO_OWNER_DATA, GITHUB_REPO_NAME } = process.env;
    const owner = GITHUB_REPO_OWNER_DATA;
    const repo = GITHUB_REPO_NAME;
    const credentialsPath = 'data/entrevista.json';

    if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY || !GITHUB_INSTALLATION_ID || !owner || !repo) {
        console.error('CRÍTICO: Las credenciales de GitHub App o el propietario/nombre del repositorio no están definidos.');
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de configuración interna. Contacta al administrador.' }) };
    }

    let octokit;
    try {
        const auth = createAppAuth({
            appId: GITHUB_APP_ID,
            privateKey: GITHUB_PRIVATE_KEY,
            installationId: GITHUB_INSTALLATION_ID,
        });

        const { token } = await auth({ type: "installation" });

        octokit = new Octokit({
            auth: token,
        });
    } catch (authError) {
        console.error('Error al autenticar con la GitHub App:', authError);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifica las credenciales de la App.' }) };
    }

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
             return { statusCode: 500, body: JSON.stringify({ message: 'Error interno: Archivo de credenciales o página HTML no encontrada.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error inesperado del servidor en la verificación de entidad. Contacte al administrador.' }) };
    }
};
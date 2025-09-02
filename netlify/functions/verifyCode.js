// netlify/functions/verifyCode.js
exports.handler = async (event) => {
    const { Octokit } = await import("@octokit/rest");
    const { createAppAuth } = await import("@octokit/auth-app");
    if (event.httpMethod !== 'POST') {
        return { statusValue: 405, body: 'Method Not Allowed' };
    }
    let code;
    try {
        ({ code } = JSON.parse(event.body));
    } catch (parseError) {
        console.error('Error al parsear el cuerpo de la petición:', parseError);
        return { statusValue: 400, body: JSON.stringify({ message: 'Formato de petición inválido.' }) };
    }
    const { GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_INSTALLATION_ID, GITHUB_REPO_OWNER_DATA, GITHUB_REPO_NAME } = process.env;
    const owner = GITHUB_REPO_OWNER_DATA;
    const repo = GITHUB_REPO_NAME;
    const credentialsPath = 'access/data.json';
    if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY || !GITHUB_INSTALLATION_ID || !owner || !repo) {
        console.error('CRÍTICO: Las credenciales de GitHub App o el propietario/nombre del repositorio no están definidos.');
        return { statusValue: 500, body: JSON.stringify({ message: 'Error de configuración interna. Contacta al administrador.' }) };
    }
    let octokit;
    try {
        const privateKey = Buffer.from(GITHUB_PRIVATE_KEY, 'base64').toString('utf8');
        const auth = createAppAuth({
            appId: GITHUB_APP_ID,
            privateKey: privateKey,
            installationId: GITHUB_INSTALLATION_ID,
        });
        const { token } = await auth({ type: "installation" });
        octokit = new Octokit({
            auth: token,
        });
    } catch (authError) {
        console.error('Error al autenticar con la GitHub App:', authError);
        return { statusValue: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifica las credenciales de la App.' }) };
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
            console.error('Error al parsear el JSON de credenciales de data.json:', jsonError);
            return { statusValue: 500, body: JSON.stringify({ message: 'Error en el formato del archivo de credenciales de data.' }) };
        }
        const foundUser = usersArray.find(user => user.code === code);
        if (foundUser && foundUser.code === code) {
            const pageName = foundUser.pageName;
            if (!pageName) {
                console.error(`Error crítico: No se definió el código '${code}'.`);
                return { statusValue: 500, body: JSON.stringify({ message: 'Error: Página de destino no configurada para el código autenticado.' }) };
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
                statusValue: 200,
                headers: { 'Content-Type': 'text/html' },
                body: htmlContent,
            };
        } else {
            return { statusValue: 401, body: JSON.stringify({ message: 'Credenciales incorrectas para el código.' }) };
        }
    } catch (error) {
        console.error('Error general en la verificación del código:', error);
        if (error.status === 404) {
             return { statusValue: 500, body: JSON.stringify({ message: 'Error interno: Archivo de credenciales o página HTML no encontrada.' }) };
        }
        return { statusValue: 500, body: JSON.stringify({ message: 'Error inesperado del servidor en la verificación de código. Contacte al administrador.' }) };
    }
};
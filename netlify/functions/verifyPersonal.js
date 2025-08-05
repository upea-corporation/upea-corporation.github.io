// netlify/functions/verifyPersonal.js

const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");
const { Buffer } = require('buffer');

export const handler = async (event) => {
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

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
    const owner = process.env.GITHUB_REPO_OWNER_DATA;
    const repo = 'data-base';
    const credentialsPath = 'data/personal.json';

    if (!appId || !privateKey || !installationId || !owner) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de configuración: Credenciales de GitHub App o propietario del repositorio no definidos.' }) };
    }

    const auth = createAppAuth({
        appId: appId,
        privateKey: privateKey,
        installationId: installationId
    });
    
    const { token } = await auth({ type: 'installation' });
    const octokit = new Octokit({ auth: token });

    try {
        const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: credentialsPath,
            headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        });

        const credentialsBase64 = fileData.content;
        const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
        const personalData = JSON.parse(credentialsJson);
        
        const userCredentials = personalData.find(user => user.identificador === identificador);

        if (userCredentials && userCredentials.password === password) {
            const pagePath = userCredentials.pageName;
            const htmlPageResponse = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: pagePath,
                headers: { 'X-GitHub-Api-Version': '2022-11-28' }
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
             return { statusCode: 401, body: JSON.stringify({ message: 'Credenciales incorrectas para el personal.' }) };
        }
        if (error.status === 401 || error.status === 403) {
             return { statusCode: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifique las credenciales de su GitHub App y los permisos.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error interno en el servidor.' }) };
    }
};
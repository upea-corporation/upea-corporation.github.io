// netlify/functions/verifyCode.js
exports.handler = async (event) => {
    console.log('--- Iniciando la ejecución de la función verifyCode ---');
    const { Octokit } = await import("@octokit/rest");
    const { createAppAuth } = await import("@octokit/auth-app");
    
    if (event.httpMethod !== 'POST') {
        console.error('Error: Método de petición no permitido. Se esperaba POST.');
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    let code;
    try {
        ({ code } = JSON.parse(event.body));
        console.log(`Paso 1: Se recibió el código en la petición. Valor recibido: ${code}`);
    } catch (parseError) {
        console.error('Paso 1: Error al parsear el cuerpo de la petición:', parseError);
        return { statusCode: 400, body: JSON.stringify({ message: 'Formato de petición inválido.' }) };
    }
    
    const { GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_INSTALLATION_ID, GITHUB_REPO_OWNER_DATA, GITHUB_REPO_NAME } = process.env;
    const owner = GITHUB_REPO_OWNER_DATA;
    const repo = GITHUB_REPO_NAME;
    const credentialsPath = 'access/data.json';
    
    console.log('Paso 2: Verificando variables de entorno...');
    if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY || !GITHUB_INSTALLATION_ID || !owner || !repo) {
        console.error('Paso 2: CRÍTICO: Una o más variables de entorno no están definidas.');
        console.error(`Estado de las variables: GITHUB_APP_ID: ${!!GITHUB_APP_ID}, GITHUB_PRIVATE_KEY: ${!!GITHUB_PRIVATE_KEY}, GITHUB_INSTALLATION_ID: ${!!GITHUB_INSTALLATION_ID}, GITHUB_REPO_OWNER_DATA: ${!!owner}, GITHUB_REPO_NAME: ${!!repo}`);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de configuración interna. Contacta al administrador.' }) };
    }
    console.log('Paso 2: Todas las variables de entorno están presentes.');
    
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
        console.log('Paso 3: Autenticación con GitHub App exitosa.');
    } catch (authError) {
        console.error('Paso 3: Error al autenticar con la GitHub App:', authError);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error de autenticación con GitHub. Verifica las credenciales de la App.' }) };
    }
    
    try {
        console.log(`Paso 4: Intentando obtener el archivo de credenciales de GitHub: ${credentialsPath}`);
        const credentialsResponse = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: credentialsPath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.log('Paso 4: Archivo de credenciales obtenido con éxito.');
        const credentialsContent = Buffer.from(credentialsResponse.data.content, 'base64').toString('utf-8');
        let usersArray;
        try {
            usersArray = JSON.parse(credentialsContent);
            console.log('Paso 4: Archivo JSON parseado con éxito.');
        } catch (jsonError) {
            console.error('Paso 4: Error al parsear el JSON de credenciales de data.json:', jsonError);
            return { statusCode: 500, body: JSON.stringify({ message: 'Error en el formato del archivo de credenciales de data.' }) };
        }
        
        console.log(`Paso 5: Buscando el código '${code}' en el array de usuarios.`);
        const foundUser = usersArray.find(user => user.code === code);
        
        if (foundUser) {
            console.log('Paso 5: Código encontrado en la base de datos.');
            const pageName = foundUser.pageName;
            
            if (!pageName) {
                console.error(`Paso 6: Error crítico: No se definió el 'pageName' para el código '${code}'.`);
                return { statusCode: 500, body: JSON.stringify({ message: 'Error: Página de destino no configurada para el código autenticado.' }) };
            }
            console.log(`Paso 6: Página de destino identificada: ${pageName}.`);
            
            console.log(`Paso 7: Obteniendo el contenido de la página: ${pageName}.`);
            const htmlPageResponse = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: pageName,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            console.log('Paso 7: Contenido de la página HTML obtenido con éxito.');
            const htmlContent = Buffer.from(htmlPageResponse.data.content, 'base64').toString('utf-8');
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: htmlContent,
            };
        } else {
            console.error('Paso 5: Credenciales incorrectas para el código.');
            return { statusCode: 401, body: JSON.stringify({ message: 'Credenciales incorrectas para el código.' }) };
        }
    } catch (error) {
        console.error('Error general en la verificación del código:', error);
        if (error.status === 404) {
             return { statusCode: 500, body: JSON.stringify({ message: 'Error interno: Archivo de credenciales o página HTML no encontrada.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error inesperado del servidor en la verificación de código. Contacte al administrador.' }) };
    }
};
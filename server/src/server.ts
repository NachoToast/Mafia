import { createServer } from 'http';
import { loadConfig, loadMongo, loadExpress } from './loaders';

async function main(): Promise<void> {
    const config = loadConfig();

    const { userModel } = await loadMongo(config);

    const app = loadExpress(config, userModel);

    const httpServer = createServer(app);

    const port = config.port;

    httpServer.listen(port, () => {
        console.log(`Server is listening on port http://localhost:${port}`);
    });
}

void main();

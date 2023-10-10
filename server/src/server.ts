import { loadConfig, loadMongo, loadExpress } from './loaders';

async function main(): Promise<void> {
    const config = loadConfig();

    const { userModel } = await loadMongo(config);

    const app = loadExpress(config, userModel);

    const port = config.port;

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}

void main();

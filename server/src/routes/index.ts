import { RouteProvider } from '../types/Express';
import { applyEndpointHandler } from './applyEndpointHandler';
import { login } from './auth';
import { getIp, getRoot, postRoot } from './miscellaneous';

export const applyRoutes: RouteProvider = (app, config, userModel) => {
    // Miscellaneous
    app.get('/', applyEndpointHandler(getRoot, config, userModel));
    app.post('/', applyEndpointHandler(postRoot, config, userModel));
    app.get('/ip', applyEndpointHandler(getIp, config, userModel));

    // Auth
    app.get('/login', applyEndpointHandler(login, config, userModel));
    app.get('/logout', applyEndpointHandler(login, config, userModel));
    app.get('/refresh', applyEndpointHandler(login, config, userModel));
};

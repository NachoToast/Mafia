import { RouteProvider } from '../types/Express';
import { applyEndpointHandler } from './applyEndpointHandler';
import { refresh, login, logout } from './auth';
import { getIp, getRoot, postRoot } from './miscellaneous';

export const applyRoutes: RouteProvider = (app, config, userModel) => {
    // Miscellaneous
    app.get('/', applyEndpointHandler(getRoot, config, userModel));
    app.post('/', applyEndpointHandler(postRoot, config, userModel));
    app.get('/ip', applyEndpointHandler(getIp, config, userModel));

    // Auth
    app.post('/login', applyEndpointHandler(login, config, userModel));
    app.post('/logout', applyEndpointHandler(logout, config, userModel));
    app.post('/refresh', applyEndpointHandler(refresh, config, userModel));
};

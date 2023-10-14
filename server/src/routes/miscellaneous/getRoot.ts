import { EndpointProvider, AuthScope } from '../../types/Express';

export const getRoot: EndpointProvider = {
    authScope: AuthScope.None,
    handler({ res }) {
        res.status(200).sendFile('index.html', { root: 'static' });
    },
};

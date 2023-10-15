import { AuthScope, EndpointProvider } from '../../types/Express';

export const getIp: EndpointProvider<AuthScope.None, unknown, string> = {
    authScope: AuthScope.None,
    handler({ req, res }) {
        res.status(200).send(req.ip);
    },
};

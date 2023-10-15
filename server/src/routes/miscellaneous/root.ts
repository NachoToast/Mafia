import { PostRootResponse } from '@shared';
import { UserService } from '../../services';
import { EndpointProvider, AuthScope } from '../../types/Express';

export const getRoot: EndpointProvider = {
    authScope: AuthScope.None,
    handler({ res }) {
        res.status(200).sendFile('index.html', { root: 'static' });
    },
};

export const postRoot: EndpointProvider<
    AuthScope.None,
    void,
    PostRootResponse
> = {
    authScope: AuthScope.None,
    async handler({ config, userModel, res }) {
        const receivedRequest = new Date().toISOString();

        const numUsersTotal = await UserService.countUsers(userModel);

        const numUsersActive = 0;
        const numGames = 0;

        const { startedAt, commit } = config;

        res.status(200).json({
            commit,
            startedAt,
            receivedRequest,
            sentResponse: new Date().toISOString(),
            numUsersTotal,
            numUsersActive,
            numGames,
        });
    },
};

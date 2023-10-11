import { PostRootResponse } from '../../../../shared/responseTypes';
import { UserService } from '../../services';
import { AuthScope, EndpointProvider } from '../../types/Express';

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

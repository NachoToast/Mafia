import { DiscordService, UserService } from '../../services';
import { EndpointProvider, AuthScope } from '../../types/Express';

export const logout: EndpointProvider<AuthScope.TokenOnly> = {
    authScope: AuthScope.TokenOnly,
    async handler({ config, userModel, req, res, auth }) {
        await DiscordService.revokeAccessToken(auth.access_token, config);

        UserService.updateUserMeta(auth.id, userModel, req);

        res.sendStatus(200);
    },
};

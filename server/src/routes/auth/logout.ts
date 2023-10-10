import { DiscordService, UserService } from '../../services';
import { AuthScope, EndpointProvider } from '../../types/Express';

export const logout: EndpointProvider<AuthScope.User> = {
    authScope: AuthScope.User,
    async handler({ config, userModel, req, res, auth, user }) {
        await Promise.all([
            DiscordService.revokeAccessToken(auth.access_token, config),
            UserService.updateUser(user._id, userModel, {
                ip: req.ip,
                lastActivity: new Date().toISOString(),
            }),
        ]);
        res.sendStatus(200);
    },
};

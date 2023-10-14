import { LoginOrSignupResponse } from '@shared';
import {
    DiscordService,
    UserService,
    AuthenticationService,
} from '../../services';
import { EndpointProvider, AuthScope } from '../../types/Express';

export const Refresh: EndpointProvider<
    AuthScope.User,
    void,
    LoginOrSignupResponse
> = {
    authScope: AuthScope.User,
    async handler({ config, userModel, req, res, auth, user }) {
        const [discordAuth, updatedUser] = await Promise.all([
            DiscordService.refreshAccessToken(auth.refresh_token, config),
            UserService.updateUser(user._id, userModel, {
                ip: req.ip,
                lastActivity: new Date().toISOString(),
            }),
        ]);

        const siteAuth = AuthenticationService.makeSiteToken(
            discordAuth,
            updatedUser._id,
            config,
        );

        res.status(200).json({
            discordAuth,
            user: updatedUser,
            siteAuth,
        });
    },
};

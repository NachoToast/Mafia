import { NotFoundError } from '../../errors';
import {
    DiscordService,
    UserService,
    AuthenticationService,
} from '../../services';
import { LoginOrSignupResponse } from '../../types/Auth';
import { AuthScope, EndpointProvider } from '../../types/Express';
import { User } from '../../types/User';

interface LoginRequest {
    code: string;

    redirect_uri: string;
}

export const login: EndpointProvider<
    AuthScope.None,
    LoginRequest,
    LoginOrSignupResponse
> = {
    authScope: AuthScope.None,
    async handler({ config, userModel, req, res }) {
        const { code, redirect_uri } = req.body;

        const discordAuth = await DiscordService.requestAccessToken(
            code,
            redirect_uri,
            config,
        );

        const discordUser = await DiscordService.getDiscordUser(
            discordAuth.access_token,
        );

        let user: User;

        try {
            user = await UserService.getUserById(discordUser.id, userModel);

            // User does exist, so update their information.
            await UserService.updateUser(user._id, userModel, {
                ip: req.ip,
                lastActivity: new Date().toISOString(),
            });
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                throw error;
            }

            // User does not exist, so create a new user.
            user = await UserService.createNewUser(
                discordUser.id,
                discordUser.username,
                req.ip,
                userModel,
            );
        }

        const siteAuth = AuthenticationService.makeSiteToken(
            discordAuth,
            discordUser.id,
            config,
        );

        res.status(200).json({ discordAuth, user, siteAuth });
    },
};

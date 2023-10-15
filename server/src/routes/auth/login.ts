import { LoginOrSignupResponse, LoginRequest, User } from '@shared';
import { NotFoundError } from '../../errors';
import {
    DiscordService,
    UserService,
    AuthenticationService,
} from '../../services';
import { EndpointProvider, AuthScope } from '../../types/Express';

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
            UserService.updateUserMeta(discordUser.id, userModel, req);
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

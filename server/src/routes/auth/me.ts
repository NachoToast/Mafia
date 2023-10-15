import { PatchMeRequest, User } from '@shared';
import { DiscordService, UserService } from '../../services';
import { AuthScope, EndpointProvider } from '../../types/Express';

export const getMe: EndpointProvider<AuthScope.User, void, User> = {
    authScope: AuthScope.User,
    handler({ res, user }) {
        res.status(200).json(user);
    },
};

export const patchMe: EndpointProvider<
    AuthScope.TokenOnly,
    PatchMeRequest,
    User
> = {
    authScope: AuthScope.TokenOnly,
    async handler({ userModel, req, res, auth }) {
        const { username } = req.body;

        if (username === undefined) {
            res.sendStatus(204);
            return;
        }

        const updatedUser = await UserService.updateUser(auth.id, userModel, {
            username,
            lastActivity: new Date().toISOString(),
            ip: req.ip,
        });

        res.status(200).json(updatedUser);
    },
};

export const deleteMe: EndpointProvider<AuthScope.TokenOnly, void, User> = {
    authScope: AuthScope.TokenOnly,
    async handler({ config, userModel, res, auth }) {
        const [deletedUser] = await Promise.all([
            UserService.deleteUser(auth.id, userModel),
            DiscordService.revokeAccessToken(auth.access_token, config),
        ]);

        res.status(200).json(deletedUser);
    },
};

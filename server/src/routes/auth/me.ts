import { User } from '../../../../shared/User';
import { AuthScope, EndpointProvider } from '../../types/Express';

export const me: EndpointProvider<AuthScope.User, void, User> = {
    authScope: AuthScope.User,
    handler({ res, user }) {
        res.status(200).json(user);
    },
};

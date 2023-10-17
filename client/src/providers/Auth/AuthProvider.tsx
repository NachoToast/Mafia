import { FC, ReactNode, useContext, useMemo } from 'react';
import { AuthContext, IAuthContext } from '../../contexts/Auth';
import { SettingsContext } from '../../contexts/Settings';
import { generateSessionState } from './AuthHelpers';

export const AuthContextProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { settings } = useContext(SettingsContext);

    const authData = useMemo<IAuthContext>(
        () =>
            generateSessionState(
                settings.discordApplicationId,
                settings.redirectUri,
            ),
        [settings.discordApplicationId, settings.redirectUri],
    );

    return (
        <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
    );
};

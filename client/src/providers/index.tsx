import { FC, ReactNode } from 'react';
import { AuthContextProvider } from './Auth/AuthProvider';
import ServerContextProvider from './Server/ServerProvider';
import SettingsContextProvider from './Settings/SettingsProvider';

const ContextProviders: FC<{ children: ReactNode }> = ({ children }) => (
    <SettingsContextProvider>
        <ServerContextProvider>
            <AuthContextProvider>{children}</AuthContextProvider>
        </ServerContextProvider>
    </SettingsContextProvider>
);

export default ContextProviders;

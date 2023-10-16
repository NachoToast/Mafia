import { FC, ReactNode } from 'react';
import ServerContextProvider from './Server/ServerProvider';
import SettingsContextProvider from './Settings/SettingsProvider';

const ContextProviders: FC<{ children: ReactNode }> = ({ children }) => (
    <SettingsContextProvider>
        <ServerContextProvider>{children}</ServerContextProvider>
    </SettingsContextProvider>
);

export default ContextProviders;

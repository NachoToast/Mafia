import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainMenu, SettingsPage } from './pages';
import ContextProviders from './providers';

const App: FC = () => (
    <BrowserRouter>
        <ContextProviders>
            <Routes>
                <Route index element={<MainMenu />} />
                <Route path="settings" element={<SettingsPage />} />
            </Routes>
        </ContextProviders>
    </BrowserRouter>
);

export default App;

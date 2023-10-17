import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Title from './components/Title';
import { useIsMobile } from './hooks/useIsMobile';
import { MainMenu, SettingsPage } from './pages';
import ContextProviders from './providers';

const App: FC = () => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <BrowserRouter>
                <main id="main-menu" className="flex-centered">
                    <Title />
                    <div className="flex-centered">
                        <h2>Not Supported</h2>
                        <p>Sorry, mobile devices aren't able to play mafia.</p>
                    </div>
                </main>
                <Footer />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <ContextProviders>
                <Routes>
                    <Route index element={<MainMenu />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Routes>
            </ContextProviders>
        </BrowserRouter>
    );
};

export default App;

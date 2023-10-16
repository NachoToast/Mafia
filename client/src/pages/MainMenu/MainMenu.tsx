import { FC, useContext } from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ServerStatus from '../../components/ServerStatus';
import Title from '../../components/Title';
import { ServerConnectionStatus, ServerContext } from '../../contexts/Server';
import './MainMenu.css';

const MainMenuWrapper: FC = () => (
    <>
        <Header />
        <main id="main-menu" className="flex-centered">
            <Title />
            <MainMenu />
        </main>
        <Footer />
    </>
);

const MainMenu: FC = () => {
    const { serverState } = useContext(ServerContext);

    if (serverState.connectionStatus === ServerConnectionStatus.Connected) {
        return (
            <div id="button-area">
                <button>Join Game</button>
                <button>Create Game</button>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <ServerStatus />
        </div>
    );
};

export default MainMenuWrapper;

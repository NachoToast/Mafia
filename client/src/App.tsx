import './App.css';
import MenuScreen from './components/Home/MenuScreen';
import Game from './components/Game/Game';
import { useSelector } from 'react-redux';
import { getGameCode, getToken, getTokenExpired, getUsername } from './redux/slices/basicInfoSlice';

const App = () => {
    const username = useSelector(getUsername);
    const token = useSelector(getToken);
    const tokenExpired = useSelector(getTokenExpired);
    const gameCode = useSelector(getGameCode);

    if (!token || tokenExpired) return <MenuScreen />;

    return <Game token={token} returnCallback={() => {}} gameCode={gameCode} username={username} />;
};

export default App;

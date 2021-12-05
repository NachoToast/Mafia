import './App.css';
import MenuScreen from './components/Home/MenuScreen';
import Game from './components/Game/Game';
import { useSelector } from 'react-redux';
import { getToken, getTokenExpired } from './redux/slices/basicInfoSlice';

const App = () => {
    const token = useSelector(getToken);
    const tokenExpired = useSelector(getTokenExpired);

    if (!token || tokenExpired) return <MenuScreen />;

    return <Game />;
};

export default App;

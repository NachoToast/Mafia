import React from 'react';
import logo from './logo.svg';
import './App.css';
import JoinGame from './components/JoinGame/JoinGame';

const App = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <JoinGame />;
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
};

export default App;

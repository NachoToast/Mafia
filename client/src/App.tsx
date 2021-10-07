import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import JoinGame from './components/Home/JoinGame';
import { STORAGE } from './constants/localStorageVariables';
import { decode, JwtPayload } from 'jsonwebtoken';
import Game from './components/Game/Game';

class App extends Component {
    private token = this.getToken(localStorage.getItem(STORAGE.tokenKeyName));

    public constructor(props: object) {
        super(props);

        this.updateToken = this.updateToken.bind(this);
    }

    private getToken(storedToken: string | null) {
        try {
            if (!storedToken) return null;

            const decodedToken = decode(storedToken) as JwtPayload;

            if (!!decodedToken?.exp) {
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.setItem(STORAGE.hadExpiredTokenKeyName, 'yes');
                    localStorage.removeItem(STORAGE.tokenKeyName);
                    return null;
                }
            }

            return storedToken;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public updateToken(newToken: string) {
        localStorage.setItem(STORAGE.tokenKeyName, newToken);
        this.token = newToken;
        this.forceUpdate();
    }

    public render() {
        console.log('Main App Render');
        if (!this.token) return <JoinGame render={this.updateToken} />;

        return <Game />;

        // return (
        //     <div className="App">
        //         <header className="App-header">
        //             <img src={logo} className="App-logo" alt="logo" />
        //             <p>
        //                 Edit <code>src/App.tsx</code> and save to reload.
        //             </p>
        //             <a
        //                 className="App-link"
        //                 href="https://reactjs.org"
        //                 target="_blank"
        //                 rel="noopener noreferrer"
        //             >
        //                 Learn React
        //             </a>
        //         </header>
        //     </div>
        // );
    }
}

export default App;

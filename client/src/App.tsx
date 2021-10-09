import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import JoinGame from './components/Home/JoinGame';
import { STORAGE } from './constants/localStorageVariables';
import { decode, JwtPayload } from 'jsonwebtoken';
import Game from './components/Game/Game';

class App extends Component {
    private token = this.getToken(localStorage.getItem(STORAGE.tokenKeyName));
    private gameCode: string = '';
    private username: string = '';

    public constructor(props: object) {
        super(props);

        this.updateToken = this.updateToken.bind(this);
        this.reRender = this.reRender.bind(this);
    }

    private reRender() {
        this.setState(this.state);
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
        this.gameCode = localStorage.getItem(STORAGE.gameCodeKeyName) ?? '';
        this.username = localStorage.getItem(STORAGE.usernameKeyName) ?? '';
        this.forceUpdate();
    }

    public render() {
        console.log('Main App Render');
        if (!this.token) return <JoinGame render={this.updateToken} />;

        return (
            <Game
                token={this.token}
                render={this.reRender}
                gameCode={this.gameCode}
                username={this.username}
            />
        );
    }
}

export default App;

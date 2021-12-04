import { createSlice } from '@reduxjs/toolkit';
import { STORAGE } from '../../constants/localStorageVariables';
import StoreState from '../state';

export type SubTitleColour = 'lightcoral' | 'aquamarine' | 'white';

export interface State {
    userInfo: {
        username: string;
        gameCode: string;
        token: string;
        tokenExpired: boolean;
    };
    joinScreenData: {
        subtitle?: string;
        subtitleColour?: string;
        loading: boolean;
        usernameLabel?: string;
        gameCodeLabel?: string;
    };
    numGames?: number;
}

export const initialState: State = {
    userInfo: {
        username: localStorage.getItem(STORAGE.usernameKeyName) ?? '',
        gameCode: localStorage.getItem(STORAGE.gameCodeKeyName) ?? '',
        token: localStorage.getItem(STORAGE.tokenKeyName) ?? '',
        tokenExpired: !!localStorage.getItem(STORAGE.hadExpiredTokenKeyName),
    },
    joinScreenData: { loading: false },
};

const basicInfoSlice = createSlice({
    name: 'basicInfo',
    initialState,
    reducers: {
        setUsername(state, action) {
            localStorage.setItem(STORAGE.usernameKeyName, action.payload);
            state.userInfo.username = action.payload;
        },
        setGameCode(state, action) {
            localStorage.setItem(STORAGE.gameCodeKeyName, action.payload);
            state.userInfo.gameCode = action.payload;
        },
        setToken(state, action) {
            localStorage.setItem(STORAGE.tokenKeyName, action.payload);
            state.userInfo.token = action.payload;
        },
        setUsernameLabel(state, action) {
            state.joinScreenData.usernameLabel = action.payload;
        },
        setGameCodeLabel(state, action) {
            state.joinScreenData.gameCodeLabel = action.payload;
        },
        setLoading(state, action) {
            state.joinScreenData.loading = action.payload;
        },
        setSubtitle(
            state,
            action: {
                type: string;
                payload: { subtitle?: string; subtitleColour?: SubTitleColour };
            },
        ) {
            state.joinScreenData.subtitle = action.payload.subtitle;
            state.joinScreenData.subtitleColour = action.payload.subtitleColour;
        },
    },
});

export const {
    setUsername,
    setGameCode,
    setToken,
    setUsernameLabel,
    setGameCodeLabel,
    setLoading,
    setSubtitle,
} = basicInfoSlice.actions;

export default basicInfoSlice.reducer;

// reducers
// https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#selectors

export const getUsername = (state: StoreState): string => state.basicInfo.userInfo.username;

export const getToken = (state: StoreState): string => state.basicInfo.userInfo.token;

export const getGameCode = (state: StoreState): string => state.basicInfo.userInfo.gameCode;

export const getTokenExpired = (state: StoreState): boolean =>
    state.basicInfo.userInfo.tokenExpired;

export const getJoinScreenData = (state: StoreState): State['joinScreenData'] =>
    state.basicInfo.joinScreenData;

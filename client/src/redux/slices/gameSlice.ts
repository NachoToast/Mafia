import { createSlice } from '@reduxjs/toolkit';
import ChatMessage from '../../types/ChatMessage';
import Player from '../../types/Player';
import TimePeriod from '../../types/TimePeriod';
import StoreState from '../state';

export interface State {
    connected: boolean;
    wasConnected: boolean;
    timePeriod: TimePeriod;
    timeRemaining: number;
    messages: ChatMessage[];
    playerList: { [username: string]: Player };
    wantsToLeave: boolean;
}

export const initialState: State = {
    connected: false,
    wasConnected: false,
    timePeriod: {
        name: 'Connecting',
        toolTip: 'Connecting To The Server',
        maxDuration: 1,
        day: -1,
    },
    timeRemaining: -1,
    messages: [],
    playerList: {},
    wantsToLeave: false,
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setConnected(state, action: { type: string; payload: boolean }) {
            if (state.connected || action.payload) {
                state.wasConnected = true;
            }
            state.connected = action.payload;
        },
        setWasConnected(state, action: { type: string; payload: boolean }) {
            state.wasConnected = action.payload;
        },
        setTimePeriod(state, action: { type: string; payload: TimePeriod }) {
            state.timePeriod = action.payload;
        },
        setTimeRemaining(state, action: { type: string; payload: number }) {
            state.timeRemaining = action.payload;
        },
        addChatMessage(state, action: { type: string; payload: ChatMessage }) {
            state.messages = [action.payload, ...state.messages.slice(0, 99)];
        },
        addOrUpdatePlayer(state, action: { type: string; payload: Player }) {
            state.playerList[action.payload.username] = action.payload;
        },
        removePlayer(state, action: { type: string; payload: string }) {
            delete state.playerList[action.payload];
        },
        clearGameData(state, action) {
            state.playerList = {};
            state.messages = [];
        },
        setWantsToLeave(state, action: { type: string; payload: boolean }) {
            state.wantsToLeave = action.payload;
        },
    },
});

export const {
    setConnected,
    setWasConnected,
    setTimePeriod,
    setTimeRemaining,
    addChatMessage,
    addOrUpdatePlayer,
    removePlayer,
    clearGameData,
    setWantsToLeave,
} = gameSlice.actions;

export default gameSlice.reducer;

export const getConnected = (state: StoreState): boolean => state.game.connected;
export const getWasConnected = (state: StoreState): boolean => state.game.wasConnected;
export const getTimePeriod = (state: StoreState): TimePeriod => state.game.timePeriod;
export const getTimeRemaining = (state: StoreState): number => state.game.timeRemaining;
export const getChatMessages = (state: StoreState): ChatMessage[] => state.game.messages;
export const getPlayers = (state: StoreState): { [username: string]: Player } =>
    state.game.playerList;
export const getWantsToLeave = (state: StoreState): boolean => state.game.wantsToLeave;

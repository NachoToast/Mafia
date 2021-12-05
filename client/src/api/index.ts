import axios from 'axios';

import { serverName, serverPort, serverEndpoint } from '../config/endPoints.json';

export interface FindGameRequestBody {
    gameCode: string;
    username: string;
}

const baseURL = `${serverEndpoint}:${serverPort}/${serverName}`;
const API = axios.create({ baseURL });

/* Adds web token to all requests if present, probably don't need so leaving commented out for now */
// API.interceptors.request.use((req: any) => {
//     const storedUserToken = localStorage.getItem(STORAGE.tokenKeyName);
//     if (!!storedUserToken) {
//         req.headers.authorization = `Bearer ${storedUserToken}`
//     }

//     return req;
// })

export const findGameByCode = async (
    payload: FindGameRequestBody,
): Promise<{ data: string; status: number }> => API.post('/gameFinder', payload);

export const countGames = async (): Promise<{ data: number; status: number }> =>
    API.get('/gameCounter');

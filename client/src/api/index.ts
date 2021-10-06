import axios from 'axios';

export interface FindGameRequestBody {
    gameCode: string;
    username: string;
    token?: string;
}

const API = axios.create({ baseURL: `http://ntgc.ddns.net:3001/mafia` });

/* Adds web token to all requests if present, probably don't need so leaving commented out for now */
// API.interceptors.request.use((req: any) => {
//     const storedUserToken = localStorage.getItem(STORAGE.tokenKeyName);
//     if (!!storedUserToken) {
//         req.headers.authorization = `Bearer ${storedUserToken}`
//     }

//     return req;
// })

export const findGame = async (
    payload: FindGameRequestBody,
): Promise<{ data: string; status: Number }> => API.post('/gameFinder', payload);

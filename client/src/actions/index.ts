import { AxiosError } from 'axios';
import * as api from '../api';

export async function findGame(username: string, gameCode: string) {
    try {
        const payload: api.FindGameRequestBody = { username, gameCode };
        const { data, status } = await api.findGameByCode(payload);
        return { data, status };
    } catch (error) {
        const axiosError = error as AxiosError;
        return {
            data: axiosError.response?.data || 'Unknown Error Occured',
            status: axiosError.response?.status || 444,
        };
    }
}

export async function countGames() {
    try {
        const { data, status } = await api.countGames();
        if (status !== 200) console.log(`Got status code ${status} when getting game count`);
        return data;
    } catch (error) {
        const axiosError = error as AxiosError;
        return {
            data: axiosError.response?.data || 'Unknown Error Occured',
            status: axiosError.response?.status || 444,
        };
    }
}

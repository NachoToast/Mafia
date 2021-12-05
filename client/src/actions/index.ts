import { AxiosError } from 'axios';
import * as api from '../api';

export async function findGame(
    username: string,
    gameCode: string,
): Promise<{ data: string; status: number }> {
    try {
        const payload: api.FindGameRequestBody = { username, gameCode };
        const { data, status } = await api.findGameByCode(payload);
        return { data, status };
    } catch (error) {
        const axiosError = error as AxiosError;
        return {
            data: axiosError.response?.data || 'Unknown Error Occured',
            status: axiosError.response?.status || 404,
        };
    }
}

export async function countGames(): Promise<{ data: number | string; status: number }> {
    try {
        return await api.countGames();
    } catch (error) {
        const axiosError = error as AxiosError;
        return {
            data: axiosError.response?.data || 'Unknown Error Occured',
            status: axiosError.response?.status || 404,
        };
    }
}

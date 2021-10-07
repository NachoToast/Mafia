import * as api from '../api';

export async function findGame(username: string, gameCode: string) {
    try {
        const payload: api.FindGameRequestBody = { username, gameCode };
        const { data, status } = await api.findGameByCode(payload);
        return { data, status };
    } catch (error) {
        console.log(error);
        return { data: 'Failed to Connect to the Mafia Servers', status: 200 };
    }
}

export async function countGames() {
    try {
        const { data, status } = await api.countGames();
        if (status !== 200) console.log(`Got status code ${status} when getting game count`);
        return data;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

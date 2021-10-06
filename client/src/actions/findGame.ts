import * as api from '../api';

export default async function findGame(payload: api.FindGameRequestBody) {
    try {
        const { data, status } = await api.findGame(payload);
        return { data, status };
    } catch (error) {
        console.log(error);
    }
}

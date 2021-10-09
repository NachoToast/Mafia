import { globalLogger } from './models/logger';
import ServerHub from './models/serverHub';

export const serverHub = new ServerHub(3001);

serverHub.createGame({ ip: '127.0.0.1', username: 'Server', token: '' }, 'lord');

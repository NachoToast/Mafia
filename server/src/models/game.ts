import { Player } from './player';

export class Game {
    public playerList: Player[] = [];
    public running = false;
    public usernamesList = [];

    constructor() {
        console.log('making new game!');
    }
}

import { Player } from './player';

export class Game {
    public playerList: Player[] = [];
    public running = false;
    public usernamesList: string[] = [];

    constructor() {
        console.log('making new game!');
    }
}

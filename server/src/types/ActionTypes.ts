import Player from '../classes/Player';

export interface ActionObject {
    origin: Player;
    target: Player[];
}

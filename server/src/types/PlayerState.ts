import Player from '../classes/Player';

export default interface PlayerState {
    isJailedby?: Player;
    isPooledby?: Player;
    transported?: {
        by: Player;
        with: Player;
    };
    armouredBy?: Player;
}

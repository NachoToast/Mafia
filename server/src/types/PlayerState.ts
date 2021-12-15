import Player from '../classes/Player';
import { RolePriorities } from './RoleTypes';

export default interface PlayerState {
    isJailedby?: Player;
    isPooledby?: Player;
    transported?: {
        by: Player;
        with: Player;
    };
    armouredBy?: Player;
}

interface BetterPlayerState {
    [keyin RolePriorities]: string
}
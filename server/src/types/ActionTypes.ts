import Player from '../classes/Player';

export type NightAction = 'attack' | 'defend' | 'visit';

export type DayAction = 'jail' | 'abduct';

export interface NightActionObject {
    origin: Player;
    verb: NightAction;
    target: Player[];
}

export interface DayActionObject {
    origin: Player;
    verb: DayAction;
    target: Player[];
}

// not sure if we want to do ToS alignments or make our own up

import Player from '../classes/Player';
import { DayAction, NightAction } from './ActionTypes';

// export type TownAlignment = 'investigative' | 'protective' | 'killing' | 'support'
// export type MafiaAlignment = 'deception' | 'killing' | 'support'
// export type NeutralAlignment = 'benign' | 'evil' | 'killing' | 'chaos'

export type PrimaryAlignments = 'town' | 'mafia' | 'neutral';

export const AlignmentColours: { [key in PrimaryAlignments]: string } = {
    town: 'lime',
    mafia: 'lightcoral',
    neutral: 'gray',
};

export enum DefencePowerLevels {
    /** no protection whatsoever */
    none,

    /** protected from weak attacks */
    basic,

    /** protected from strong attacks */
    high,

    /** protected against everything */
    invincible,

    // just for Tony, we will use if/else statements because Tony fits between high and invincible
}

export enum AttackPowerLevels {
    /** no attack power */
    none,

    /** can kill people with no defence */
    weak,

    /** can kill people with basic defence  */
    strong,

    /** can kill people with high defence  */
    ultimate,
}

export default interface BaseRole {
    name: string;
    description: string;
    primaryAlignment: PrimaryAlignments | null;

    defencePower: DefencePowerLevels;
    attackPower: AttackPowerLevels;

    nightActionType?: NightAction;
    dayActionType?: DayAction;

    priority: RolePriorities;

    /** @default string colour associated with primary alignment */
    color?: string;

    /** @default number 1 */
    abilityCooldown?: number;

    /** @default boolean false */
    canSeeWhispers?: boolean;

    /** @default number 1 */
    voteMultiplier?: number;

    /** @default boolean false */
    immuneToRoleblocks?: boolean;
}

export enum RolePriorities {
    jail,
    pool,
    transport,
    roleblock,
    other,
    bodyguard,
    doctor,
    armoured,
}

/* 
action precedence


jailed
pooled

transported
roleblocked


anything

bodyguards
doctor
armourer

*/

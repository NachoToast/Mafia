// not sure if we want to do ToS alignments or make our own up

import Player from '../classes/Player';

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
    primaryAlignment: PrimaryAlignments;
    defencePower: DefencePowerLevels;
    attackPower: AttackPowerLevels;
    priority: RolePriorities;

    /** @default string `Primary Alignment Colour` */
    color?: string;

    /** @default number 1 */
    abilityCooldown?: number;

    /** @default boolean false */
    canSeeWhispers?: boolean;

    /** @default number 1 */
    voteMultiplier?: number;

    /** @default boolean false */
    immuneToRoleblocks?: boolean;

    nightAction?: (playerA: Player, playerB: Player) => void;
    dayAction?: (playerA: Player, playerB: Player) => void;
}

export enum RolePriorities {
    /** e.g. Jail, pool; actions that keep a player there for the whole night. */
    abduct,
    transport,
    roleblock,
    other,
    bodyguard,
    doctor,
    armoured,
}

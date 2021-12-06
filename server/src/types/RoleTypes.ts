// not sure if we want to do ToS alignments or make our own up

// export type TownAlignment = 'investigative' | 'protective' | 'killing' | 'support'
// export type MafiaAlignment = 'deception' | 'killing' | 'support'
// export type NeutralAlignment = 'benign' | 'evil' | 'killing' | 'chaos'

export type PrimaryAlignments = 'town' | 'mafia' | 'neutral';

export const AlignmentColours: { [key in PrimaryAlignments]: string } = {
    town: 'lime',
    mafia: 'lightcoral',
    neutral: 'gray',
};

export enum NightImmunities {
    /** no protection whatsoever */
    none,

    /** protected against most attacks */
    most,

    /** protected against everything */
    all,
}

export enum AttackPowerLevels {
    /** no attack */
    none,

    /** can kill people with no night immunity */
    basic,

    /** can kill people with immunity from most things */
    most,
}

export default interface BaseRole {
    name: string;
    description: string;
    primaryAlignment: PrimaryAlignments;
    nightImmunity: NightImmunities;
    attackPower: AttackPowerLevels;

    /** @default string colour associated with primary alignment */
    color?: string;

    /** @default boolean false */
    canSeeWhispers?: boolean;

    /** @default number 1 */
    voteMultiplier?: number;
}

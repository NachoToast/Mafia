import BaseRole, {
    AttackPowerLevels,
    NightImmunities,
    PrimaryAlignments,
} from '../../../types/RoleTypes';

export default class Mafioso implements BaseRole {
    public name = 'Mafioso';
    public description = 'Standard member of the mafia.';
    public primaryAlignment: PrimaryAlignments = 'mafia';
    public nightImmunity = NightImmunities.none;
    public attackPower = AttackPowerLevels.basic;
}

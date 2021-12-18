import BaseRole, { PrimaryAlignments } from '../../../types/RoleTypes';

export default class BaseTown implements BaseRole {
    public readonly name: string = 'Normal Town Member';
    public readonly description: string =
        'You are a normal member of the town, with no special abilities.';
    public primaryAlignment: PrimaryAlignments = 'town';
}

import BaseRole from '../../types/RoleTypes';

export default class Spectator implements BaseRole {
    public readonly name = 'Spectator';
    public readonly description = 'You are a spectator';
    public readonly primaryAlignment = null;

    public readonly defencePower;
}

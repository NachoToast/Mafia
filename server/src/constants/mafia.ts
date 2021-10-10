export type MafiaRoles = 'None';

export type PlayerStatuses = 'spectator' | 'alive' | 'dead' | 'lobby' | 'loading' | 'removed';

export type TimePeriods =
    | 'discussion'
    | 'night'
    | 'voting'
    | 'trial'
    | 'postDiscussion'
    | 'pregame';

export const timePeriodName: { [index in TimePeriods]: string } = {
    discussion: 'discussion',
    postDiscussion: 'discussion',
    night: 'night',
    voting: 'voting',
    trial: 'a trial',
    pregame: 'pre-game',
};

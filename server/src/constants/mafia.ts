export enum PlayerStatuses {
    spectator,
    alive,
    dead,
}

/** In chronological order. */
export type TimePeriodNames =
    | 'pregame'
    | 'gameStarting'
    | 'night'
    | 'morningReport'
    | 'discussion'
    | 'voting'
    | 'trial'
    | 'dayEnd';

export type TimePeriod = {
    name: string;
    description: string;
    durationSeconds: number;
};

export type TimePeriodLibrary = {
    [key in TimePeriodNames]: TimePeriod;
};

export const defaultTimePeriods: TimePeriodLibrary = {
    pregame: {
        name: 'Pre-Game',
        description: 'Waiting for host to start',
        durationSeconds: -1,
    },
    gameStarting: {
        name: 'Game Starting',
        description: 'The game is now starting',
        durationSeconds: 10,
    },
    night: {
        name: 'Night',
        description: '😳',
        durationSeconds: 180,
    },
    morningReport: {
        name: 'Morning',
        description: "Report of the night's events",
        durationSeconds: -1,
    },
    discussion: {
        name: 'Discussion',
        description: 'Discussion Time!',
        durationSeconds: 60,
    },
    voting: {
        name: 'Voting',
        description: 'Time to put players on trial',
        durationSeconds: 30,
    },
    trial: {
        name: 'Trial',
        description: 'A player is on trial',
        durationSeconds: 30,
    },
    dayEnd: {
        name: 'Evening',
        description: 'Go home for the night',
        durationSeconds: 10,
    },
};

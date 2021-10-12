// import { ChatMessage } from '../models/chatMessage';
import { TimePeriods } from './mafia';

export const INTERNAL_ERRORS = {
    BASIC: (error: unknown) =>
        error instanceof Error ? error.message : `Unknown Error Occured`,
};

// export const MESSAGE_DENIED_REASONS = {
//     INVALID_TIME: (timePeriod: TimePeriods) =>
//         `Can't send messages during ${timePeriodName[timePeriod]}!`,
//     SOMEONE_ELSE_ON_TRIAL: () =>
//         `Can't send messages while someone is on trial!`,
// };

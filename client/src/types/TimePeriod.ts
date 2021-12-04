/** TimePeriod stored by client */
export default interface TimePeriod {
    name: string;
    toolTip: string;
    maxDuration: number;
    day: number;
}

/** ServerTimePeriod sent by socket from the server */
export interface STP {
    name: string;
    description: string;
    durationSeconds: number;
}

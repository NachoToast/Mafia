import { ConnectionSettings, LoggingSettings } from '../types/settings';

/*
Present options mean that the default value will always override the player-chosen value.
*/

export const connectionOverrides: [keyof ConnectionSettings] | [] = [];

export const loggingOverrides: [keyof LoggingSettings] | [] = [];

export const maxPlayerOverride: boolean = true;

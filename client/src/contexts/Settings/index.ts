import { createContext } from 'react';
import { defaultSettingsContext } from './Defaults';

export * from './Types';
export * from './Defaults';

export const SettingsContext = createContext(defaultSettingsContext);

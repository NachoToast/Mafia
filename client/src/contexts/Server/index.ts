import { createContext } from 'react';
import { defaultServerContext } from './Defaults';

export * from './Types';
export * from './Defaults';

export const ServerContext = createContext(defaultServerContext);

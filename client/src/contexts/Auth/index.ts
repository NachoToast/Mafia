import { createContext } from 'react';
import { defaultAuthContext } from './Defaults';

export * from './Types';
export * from './Defaults';

export const AuthContext = createContext(defaultAuthContext);

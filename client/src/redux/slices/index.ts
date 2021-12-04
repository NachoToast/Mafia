// https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#reducers

import { combineReducers } from 'redux';
import basicInfoSlice from './basicInfoSlice';

const rootReducer = combineReducers({ basicInfoSlice });

export default rootReducer;

import { State as BasicInfoState } from './slices/basicInfoSlice';
import { State as GameSlice } from './slices/gameSlice';

export default interface StoreState {
    basicInfo: BasicInfoState;
    game: GameSlice;
}

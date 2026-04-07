import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants';
import { storage } from '../../utils/storage';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: storage.get(STORAGE_KEYS.theme, 'dark'),
    toast: null
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      storage.set(STORAGE_KEYS.theme, action.payload);
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    }
  }
});

export const { setTheme, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

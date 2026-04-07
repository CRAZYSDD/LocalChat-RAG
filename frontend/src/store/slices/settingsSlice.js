import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { settingsApi } from '../../api/settings';

export const fetchSettings = createAsyncThunk('settings/fetch', settingsApi.getSettings);
export const saveSettings = createAsyncThunk('settings/save', async (payload) => settingsApi.updateSettings(payload));
export const loadSettingsResources = createAsyncThunk('settings/loadResources', settingsApi.loadResources);
export const fetchDashboard = createAsyncThunk('settings/dashboard', settingsApi.getDashboard);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    config: null,
    dashboard: null,
    loading: false,
    saving: false,
    reloading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.config = action.payload;
      })
      .addCase(saveSettings.rejected, (state) => {
        state.saving = false;
      })
      .addCase(loadSettingsResources.pending, (state) => {
        state.reloading = true;
      })
      .addCase(loadSettingsResources.fulfilled, (state, action) => {
        state.reloading = false;
        state.config = action.payload;
      })
      .addCase(loadSettingsResources.rejected, (state) => {
        state.reloading = false;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      });
  }
});

export default settingsSlice.reducer;

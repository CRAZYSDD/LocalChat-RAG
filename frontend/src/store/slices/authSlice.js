import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import { STORAGE_KEYS } from '../../constants';
import { storage } from '../../utils/storage';

function normalizeUser(user) {
  if (!user) return null;
  if (user.username === 'demo' || user.username === 'Demo User') {
    return { ...user, username: 'SDD' };
  }
  return user;
}

export const login = createAsyncThunk('auth/login', async (payload) => authApi.login(payload));

const initialState = {
  token: storage.get(STORAGE_KEYS.token, ''),
  user: normalizeUser(storage.get(STORAGE_KEYS.user, null)),
  loading: false,
  error: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = '';
      state.user = null;
      storage.remove(STORAGE_KEYS.token);
      storage.remove(STORAGE_KEYS.user);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = normalizeUser(action.payload.user);
        state.loading = false;
        state.token = action.payload.token;
        state.user = user;
        storage.set(STORAGE_KEYS.token, action.payload.token);
        storage.set(STORAGE_KEYS.user, user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export default authSlice.reducer;

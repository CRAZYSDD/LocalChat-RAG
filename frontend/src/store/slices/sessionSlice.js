import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chat';
import { parseDateValue } from '../../utils/format';

export const fetchSessions = createAsyncThunk('sessions/fetch', chatApi.getSessions);
export const createSession = createAsyncThunk('sessions/create', async (payload) => chatApi.createSession(payload));
export const updateSession = createAsyncThunk('sessions/update', async ({ id, ...payload }) => {
  return chatApi.updateSession(id, payload);
});
export const removeSession = createAsyncThunk('sessions/remove', async (id) => {
  await chatApi.deleteSession(id);
  return id;
});

function sortSessions(items) {
  return [...items].sort(
    (left, right) =>
      (parseDateValue(right.updated_at)?.getTime() || 0) - (parseDateValue(left.updated_at)?.getTime() || 0),
  );
}

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    items: [],
    activeSessionId: '',
    loading: false,
  },
  reducers: {
    setActiveSession(state, action) {
      state.activeSessionId = action.payload;
    },
    renameSessionLocal(state, action) {
      const { id, title } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index >= 0) {
        state.items[index] = {
          ...state.items[index],
          title,
          updated_at: new Date().toISOString(),
        };
        state.items = sortSessions(state.items);
      }
    },
    removeSessionLocal(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      if (state.activeSessionId === id) {
        state.activeSessionId = state.items[0]?.id || '';
      }
    },
    upsertSessionPreview(state, action) {
      const nextSession = action.payload;
      const index = state.items.findIndex((item) => item.id === nextSession.id);
      if (index >= 0) {
        state.items[index] = { ...state.items[index], ...nextSession };
      } else {
        state.items.unshift(nextSession);
      }
      state.items = sortSessions(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = sortSessions(action.payload);
        if (!state.activeSessionId && action.payload.length) {
          state.activeSessionId = action.payload[0].id;
        }
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.items = sortSessions(state.items);
        state.activeSessionId = action.payload.id;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = { ...state.items[index], ...action.payload };
          state.items = sortSessions(state.items);
        }
      })
      .addCase(removeSession.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.activeSessionId === action.payload) {
          state.activeSessionId = state.items[0]?.id || '';
        }
      });
  },
});

export const { setActiveSession, renameSessionLocal, removeSessionLocal, upsertSessionPreview } = sessionSlice.actions;
export default sessionSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import sessionReducer from './slices/sessionSlice';
import knowledgeReducer from './slices/knowledgeSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    sessions: sessionReducer,
    knowledge: knowledgeReducer,
    settings: settingsReducer,
    ui: uiReducer
  }
});

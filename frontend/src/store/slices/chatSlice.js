import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chat';
import { knowledgeApi } from '../../api/knowledge';
import { CHAT_MODE } from '../../constants';

export const sendMessage = createAsyncThunk('chat/sendMessage', async (payload) => {
  if (payload.mode === CHAT_MODE.RAG) {
    return knowledgeApi.query(payload);
  }
  return chatApi.sendMessage(payload);
});

export const fetchSessionDetail = createAsyncThunk('chat/fetchSessionDetail', async (sessionId) => {
  return chatApi.getSessionDetail(sessionId);
});

const ensureMessages = (state, sessionId) => {
  if (!state.messagesBySession[sessionId]) {
    state.messagesBySession[sessionId] = [];
  }
};

const mapSessionMessages = (session) =>
  (session.messages || []).map((message, index) => ({
    id: `${session.id}-${index}-${message.created_at || Date.now()}`,
    role: message.role,
    content: message.content,
    createdAt: message.created_at || new Date().toISOString(),
    sources: message.sources || [],
  }));

const findLastUserIndex = (messages) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') {
      return index;
    }
  }
  return -1;
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messagesBySession: {},
    sessionModeById: {},
    deletedSessionIds: {},
    currentRequestSessionId: '',
    currentRequestId: '',
    generating: false,
    streaming: false,
    error: '',
    mode: CHAT_MODE.NORMAL,
    abortController: null,
  },
  reducers: {
    setMode(state, action) {
      state.mode = action.payload;
    },
    setSessionMode(state, action) {
      const { sessionId, mode } = action.payload;
      state.sessionModeById[sessionId] = mode;
    },
    appendUserMessage(state, action) {
      const { sessionId, message } = action.payload;
      delete state.deletedSessionIds[sessionId];
      ensureMessages(state, sessionId);
      state.messagesBySession[sessionId].push(message);
    },
    prepareRegeneration(state, action) {
      const sessionId = action.payload;
      const messages = state.messagesBySession[sessionId] || [];
      const lastUserIndex = findLastUserIndex(messages);
      if (lastUserIndex === -1) return;
      state.messagesBySession[sessionId] = messages.slice(0, lastUserIndex + 1);
      delete state.deletedSessionIds[sessionId];
    },
    startStreamingMessage(state, action) {
      const { sessionId, message, requestId } = action.payload;
      delete state.deletedSessionIds[sessionId];
      ensureMessages(state, sessionId);
      state.generating = true;
      state.streaming = true;
      state.error = '';
      state.currentRequestSessionId = sessionId;
      state.currentRequestId = requestId;
      state.messagesBySession[sessionId].push(message);
    },
    updateStreamingMessage(state, action) {
      const { sessionId, content, requestId } = action.payload;
      if (state.deletedSessionIds[sessionId]) return;
      if (state.currentRequestSessionId !== sessionId || state.currentRequestId !== requestId) return;

      const messages = state.messagesBySession[sessionId] || [];
      const target = messages[messages.length - 1];
      if (target) {
        target.content += content;
      }
    },
    finishStreamingMessage(state, action) {
      const { sessionId, sources = [], requestId } = action.payload;
      if (state.currentRequestSessionId !== sessionId || state.currentRequestId !== requestId) return;

      if (!state.deletedSessionIds[sessionId]) {
        const messages = state.messagesBySession[sessionId] || [];
        const target = messages[messages.length - 1];
        if (target) {
          target.sources = sources;
        }
      }

      state.generating = false;
      state.streaming = false;
      state.abortController = null;
      state.currentRequestSessionId = '';
      state.currentRequestId = '';
    },
    setAbortController(state, action) {
      state.abortController = action.payload;
    },
    stopStreaming(state) {
      state.generating = false;
      state.streaming = false;
      state.abortController = null;
      state.currentRequestSessionId = '';
      state.currentRequestId = '';
    },
    removeSessionMessages(state, action) {
      const sessionId = action.payload;
      delete state.messagesBySession[sessionId];
      delete state.sessionModeById[sessionId];
      state.deletedSessionIds[sessionId] = true;
      if (state.currentRequestSessionId === sessionId) {
        state.generating = false;
        state.streaming = false;
        state.abortController = null;
        state.currentRequestSessionId = '';
        state.currentRequestId = '';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        state.generating = true;
        state.error = '';
        state.currentRequestSessionId = action.meta.arg.sessionId;
        state.currentRequestId = action.meta.requestId;
        delete state.deletedSessionIds[action.meta.arg.sessionId];
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { sessionId, answer, sources = [] } = action.payload;
        if (state.currentRequestSessionId !== sessionId || state.currentRequestId !== action.meta.requestId) {
          return;
        }

        if (!state.deletedSessionIds[sessionId]) {
          ensureMessages(state, sessionId);
          state.messagesBySession[sessionId].push({
            id: `${sessionId}-${Date.now()}`,
            role: 'assistant',
            content: answer,
            sources,
            createdAt: new Date().toISOString(),
          });
        }

        state.generating = false;
        state.currentRequestSessionId = '';
        state.currentRequestId = '';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        state.generating = false;
        state.currentRequestSessionId = '';
        state.currentRequestId = '';
        state.error = action.error.message;
      })
      .addCase(fetchSessionDetail.fulfilled, (state, action) => {
        const session = action.payload;
        if (state.deletedSessionIds[session.id]) return;

        const incomingMessages = mapSessionMessages(session);
        const existingMessages = state.messagesBySession[session.id] || [];
        const isCurrentSessionGenerating =
          state.currentRequestSessionId === session.id && (state.generating || state.streaming);
        const shouldPreserveLocalMessages =
          isCurrentSessionGenerating ||
          existingMessages.length > incomingMessages.length &&
          (state.generating || state.streaming || incomingMessages.length === 0);

        if (!shouldPreserveLocalMessages) {
          state.messagesBySession[session.id] = incomingMessages;
        }
        state.sessionModeById[session.id] = session.mode || CHAT_MODE.NORMAL;
      });
  },
});

export const {
  setMode,
  setSessionMode,
  appendUserMessage,
  prepareRegeneration,
  startStreamingMessage,
  updateStreamingMessage,
  finishStreamingMessage,
  setAbortController,
  stopStreaming,
  removeSessionMessages,
} = chatSlice.actions;

export default chatSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { knowledgeApi } from '../../api/knowledge';

export const fetchKnowledgeFiles = createAsyncThunk('knowledge/fetchFiles', knowledgeApi.getFiles);
export const uploadKnowledgeFile = createAsyncThunk('knowledge/upload', async (formData) => knowledgeApi.upload(formData));
export const deleteKnowledgeFile = createAsyncThunk('knowledge/delete', async (id) => {
  await knowledgeApi.deleteFile(id);
  return id;
});
export const reindexKnowledge = createAsyncThunk('knowledge/reindex', knowledgeApi.reindex);

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState: {
    files: [],
    loadingFiles: false,
    uploading: false,
    reindexing: false,
    error: ''
  },
  reducers: {
    clearKnowledgeError(state) {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeFiles.pending, (state) => {
        state.loadingFiles = true;
        state.error = '';
      })
      .addCase(fetchKnowledgeFiles.fulfilled, (state, action) => {
        state.loadingFiles = false;
        state.files = action.payload;
      })
      .addCase(fetchKnowledgeFiles.rejected, (state, action) => {
        state.loadingFiles = false;
        state.error = action.error.message;
      })
      .addCase(uploadKnowledgeFile.pending, (state) => {
        state.uploading = true;
        state.error = '';
      })
      .addCase(uploadKnowledgeFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.files.unshift(action.payload);
      })
      .addCase(uploadKnowledgeFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message;
      })
      .addCase(deleteKnowledgeFile.fulfilled, (state, action) => {
        state.files = state.files.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteKnowledgeFile.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(reindexKnowledge.pending, (state) => {
        state.reindexing = true;
        state.error = '';
      })
      .addCase(reindexKnowledge.fulfilled, (state) => {
        state.reindexing = false;
      })
      .addCase(reindexKnowledge.rejected, (state, action) => {
        state.reindexing = false;
        state.error = action.error.message;
      });
  }
});

export const { clearKnowledgeError } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearKnowledgeError,
  deleteKnowledgeFile,
  fetchKnowledgeFiles,
  reindexKnowledge,
  uploadKnowledgeFile
} from '../store/slices/knowledgeSlice';

export function useKnowledgeBase() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.knowledge);

  return {
    ...state,
    fetchFiles: useCallback(() => dispatch(fetchKnowledgeFiles()), [dispatch]),
    uploadFile: useCallback((formData) => dispatch(uploadKnowledgeFile(formData)), [dispatch]),
    deleteFile: useCallback((id) => dispatch(deleteKnowledgeFile(id)), [dispatch]),
    reindex: useCallback(() => dispatch(reindexKnowledge()), [dispatch]),
    clearError: useCallback(() => dispatch(clearKnowledgeError()), [dispatch]),
  };
}

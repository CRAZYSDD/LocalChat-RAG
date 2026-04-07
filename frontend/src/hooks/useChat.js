import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSessionDetail, sendMessage, setMode } from '../store/slices/chatSlice';

export function useChat() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.chat);

  return {
    ...state,
    sendMessage: useCallback((payload) => dispatch(sendMessage(payload)), [dispatch]),
    fetchSessionDetail: useCallback((sessionId) => dispatch(fetchSessionDetail(sessionId)), [dispatch]),
    setMode: useCallback((mode) => dispatch(setMode(mode)), [dispatch]),
  };
}

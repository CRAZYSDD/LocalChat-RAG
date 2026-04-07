import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSession, fetchSessions, removeSession, setActiveSession, updateSession } from '../store/slices/sessionSlice';

export function useSession() {
  const dispatch = useDispatch();
  const { items, activeSessionId, loading } = useSelector((state) => state.sessions);

  return {
    sessions: items,
    activeSessionId,
    loading,
    fetchSessions: useCallback(() => dispatch(fetchSessions()), [dispatch]),
    createSession: useCallback((payload) => dispatch(createSession(payload)), [dispatch]),
    updateSession: useCallback((payload) => dispatch(updateSession(payload)), [dispatch]),
    removeSession: useCallback((id) => dispatch(removeSession(id)), [dispatch]),
    setActiveSession: useCallback((id) => dispatch(setActiveSession(id)), [dispatch]),
  };
}

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appendUserMessage,
  finishStreamingMessage,
  setAbortController,
  setSessionMode,
  startStreamingMessage,
  stopStreaming,
  updateStreamingMessage,
} from '../store/slices/chatSlice';

function createRequestId() {
  return `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useStreamChat() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.config);

  const stream = useCallback(
    async ({ sessionId, question, history, mode, regenerate = false }) => {
      const abortController = new AbortController();
      const requestId = createRequestId();
      let completed = false;

      dispatch(setAbortController(abortController));

      if (!regenerate) {
        dispatch(
          appendUserMessage({
            sessionId,
            message: {
              id: `user-${Date.now()}`,
              role: 'user',
              content: question,
              createdAt: new Date().toISOString(),
            },
          }),
        );
      }

      dispatch(
        startStreamingMessage({
          sessionId,
          requestId,
          message: {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            sources: [],
          },
        }),
      );

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            question,
            history,
            mode,
            stream: settings?.streaming_enabled ?? true,
            regenerate,
          }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('流式请求失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';
        let finalSources = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          pending += decoder.decode(value, { stream: true });
          const lines = pending.split('\n');
          pending = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = JSON.parse(line.replace('data:', '').trim());

            if (payload.type === 'delta') {
              dispatch(updateStreamingMessage({ sessionId, requestId, content: payload.content }));
            }
            if (payload.type === 'sources') {
              finalSources = payload.sources || [];
            }
            if (payload.type === 'done') {
              finalSources = payload.sources || finalSources;
              dispatch(finishStreamingMessage({ sessionId, requestId, sources: finalSources }));
              dispatch(setSessionMode({ sessionId, mode }));
              completed = true;
              await reader.cancel();
              break;
            }
            if (payload.type === 'error') {
              throw new Error(payload.message || '流式生成失败');
            }
          }

          if (completed) break;
        }

        if (!completed) {
          dispatch(finishStreamingMessage({ sessionId, requestId, sources: finalSources }));
          dispatch(setSessionMode({ sessionId, mode }));
        }
      } catch (error) {
        dispatch(stopStreaming());
        if (error.name !== 'AbortError') {
          throw error;
        }
      }
    },
    [dispatch, settings?.streaming_enabled],
  );

  const stop = useCallback(
    (controller) => {
      controller?.abort();
      dispatch(stopStreaming());
    },
    [dispatch],
  );

  return { stream, stop };
}

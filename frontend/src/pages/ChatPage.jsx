import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatInput from '../components/chat/ChatInput';
import ChatMessage from '../components/chat/ChatMessage';
import SessionList from '../components/chat/SessionList';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MessageEditDialog from '../components/common/MessageEditDialog';
import ModelStatusBadge from '../components/common/ModelStatusBadge';
import SessionNameDialog from '../components/common/SessionNameDialog';
import { CHAT_MODE } from '../constants';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useChat } from '../hooks/useChat';
import { useSession } from '../hooks/useSession';
import { useStreamChat } from '../hooks/useStreamChat';
import {
  appendUserMessage,
  prepareRegeneration,
  removeSessionMessages,
  setSessionMode,
} from '../store/slices/chatSlice';
import { fetchSettings } from '../store/slices/settingsSlice';
import {
  fetchSessions as fetchSessionsAction,
  removeSessionLocal,
  renameSessionLocal,
  upsertSessionPreview,
} from '../store/slices/sessionSlice';

const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_CHARS_PER_MESSAGE = 600;
const QUICK_PROMPTS = ['介绍一下当前模型能力', '如何使用知识库问答？', '帮我总结这个项目亮点'];

function modelBadgeLabel(status) {
  if (status === 'loaded') return '模型已加载';
  if (status === 'error') return '模型加载失败';
  return '模型未加载';
}

function modeButtonClass(active) {
  const base = 'rounded-full px-4 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-50';
  return active
    ? `${base} bg-slate-900 text-white dark:bg-white dark:text-slate-900`
    : `${base} border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300`;
}

function trimHistory(messages) {
  return messages.slice(-MAX_HISTORY_MESSAGES).map((item) => ({
    role: item.role,
    content:
      item.content.length > MAX_HISTORY_CHARS_PER_MESSAGE
        ? `${item.content.slice(0, MAX_HISTORY_CHARS_PER_MESSAGE)}\n...[truncated]`
        : item.content,
  }));
}

function sessionTitleForMode(mode, index) {
  return mode === CHAT_MODE.RAG ? `RAG 会话 ${index}` : `普通会话 ${index}`;
}

function nextSessionIndex(sessions, mode) {
  const prefix = mode === CHAT_MODE.RAG ? 'RAG 会话 ' : '普通会话 ';
  const matchedIndexes = sessions
    .filter((session) => session.mode === mode)
    .map((session) => {
      if (!session.title?.startsWith(prefix)) return 0;
      const suffix = session.title.slice(prefix.length).trim();
      const parsed = Number.parseInt(suffix, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });

  return (matchedIndexes.length ? Math.max(...matchedIndexes) : 0) + 1;
}

function exportConversation(session, messages) {
  const lines = [
    `# ${session?.title || '未命名会话'}`,
    '',
    `模式：${session?.mode === 'rag' ? 'RAG 问答' : '普通对话'}`,
    '',
  ];

  messages.forEach((message) => {
    lines.push(`## ${message.role === 'user' ? '用户' : '助手'}`);
    lines.push(message.content || '');
    if (message.sources?.length) {
      lines.push('');
      lines.push('参考资料：');
      message.sources.forEach((source, index) => {
        lines.push(`${index + 1}. ${source.file_name || '未知文档'}（score: ${source.score ?? '--'}）`);
      });
    }
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(session?.title || 'conversation').replace(/[\\/:*?"<>|]/g, '_')}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildRegenerationContext(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') {
      return {
        question: messages[index].content,
        history: trimHistory(messages.slice(0, index)),
      };
    }
  }
  return null;
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const { sessions, activeSessionId, fetchSessions, createSession, updateSession, removeSession, setActiveSession } = useSession();
  const {
    mode,
    generating,
    currentRequestSessionId,
    abortController,
    sendMessage,
    fetchSessionDetail,
    setMode,
  } = useChat();
  const settings = useSelector((state) => state.settings.config);
  const messages = useSelector((state) => state.chat.messagesBySession[activeSessionId] || []);
  const { stream, stop } = useStreamChat();
  const scrollRef = useAutoScroll(messages.length);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const modelReady = settings?.model_status === 'loaded';
  const isCurrentSessionGenerating = generating && currentRequestSessionId === activeSessionId;
  const otherSessionGenerating = generating && Boolean(currentRequestSessionId) && currentRequestSessionId !== activeSessionId;

  useEffect(() => {
    fetchSessions();
    dispatch(fetchSettings());
  }, [dispatch, fetchSessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    fetchSessionDetail(activeSessionId);
  }, [activeSessionId, fetchSessionDetail]);

  const currentSession = useMemo(
    () => sessions.find((item) => item.id === activeSessionId),
    [sessions, activeSessionId],
  );

  useEffect(() => {
    if (currentSession?.mode) {
      setMode(currentSession.mode);
    }
  }, [currentSession?.mode, setMode]);

  const handleCreateSession = async (targetMode = mode) => {
    const result = await createSession({
      title: sessionTitleForMode(targetMode, nextSessionIndex(sessions, targetMode)),
      mode: targetMode,
    }).unwrap();
    setActiveSession(result.id);
    dispatch(setSessionMode({ sessionId: result.id, mode: targetMode }));
    return result.id;
  };

  const handleRenameSession = async (title) => {
    if (!renameTarget) return;
    const target = renameTarget;
    const normalizedTitle = title.trim();
    setRenameTarget(null);
    if (!normalizedTitle || normalizedTitle === target.title) return;

    dispatch(renameSessionLocal({ id: target.id, title: normalizedTitle }));
    try {
      await updateSession({ id: target.id, title: normalizedTitle }).unwrap();
    } catch (error) {
      dispatch(fetchSessionsAction());
      throw error;
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    if (abortController && target.id === currentRequestSessionId) {
      stop(abortController);
    }

    dispatch(removeSessionMessages(target.id));
    dispatch(removeSessionLocal(target.id));

    try {
      await removeSession(target.id).unwrap();
    } catch (error) {
      dispatch(fetchSessionsAction());
      throw error;
    }
  };

  const handleModeSwitch = async (nextMode) => {
    if (nextMode === mode || generating) return;
    setMode(nextMode);
    await handleCreateSession(nextMode);
  };

  const handleSend = async (question) => {
    if (!modelReady || generating) {
      if (!modelReady) {
        dispatch(fetchSettings());
      }
      return;
    }

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = await handleCreateSession(mode);
    }

    const history = trimHistory(messages);

    dispatch(
      upsertSessionPreview({
        id: sessionId,
        title: currentSession?.title || question.slice(0, 20),
        mode,
        last_message: question,
        updated_at: new Date().toISOString(),
      }),
    );

    if (settings?.streaming_enabled) {
      await stream({ sessionId, question, history, mode, regenerate: false });
      dispatch(fetchSettings());
      return;
    }

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

    await sendMessage({ sessionId, question, history, mode, regenerate: false }).unwrap();
    dispatch(setSessionMode({ sessionId, mode }));
    dispatch(fetchSettings());
  };

  const handleRegenerate = async () => {
    if (!modelReady || generating || !activeSessionId) {
      if (!modelReady) {
        dispatch(fetchSettings());
      }
      return;
    }

    const regeneration = buildRegenerationContext(messages);
    if (!regeneration) return;

    dispatch(prepareRegeneration(activeSessionId));
    dispatch(
      upsertSessionPreview({
        id: activeSessionId,
        title: currentSession?.title || regeneration.question.slice(0, 20),
        mode,
        last_message: regeneration.question,
        updated_at: new Date().toISOString(),
      }),
    );

    if (settings?.streaming_enabled) {
      await stream({
        sessionId: activeSessionId,
        question: regeneration.question,
        history: regeneration.history,
        mode,
        regenerate: true,
      });
      dispatch(fetchSettings());
      return;
    }

    await sendMessage({
      sessionId: activeSessionId,
      question: regeneration.question,
      history: regeneration.history,
      mode,
      regenerate: true,
    }).unwrap();
    dispatch(setSessionMode({ sessionId: activeSessionId, mode }));
    dispatch(fetchSettings());
  };

  const handleEditResend = async (content) => {
    if (!modelReady || generating) {
      if (!modelReady) {
        dispatch(fetchSettings());
      }
      return;
    }

    setEditTarget(null);
    await handleSend(content);
  };

  return (
    <>
      <div className="grid h-[calc(100vh-3rem)] gap-4 xl:grid-cols-[320px_1fr]">
        <SessionList
          sessions={sessions}
          activeId={activeSessionId}
          onSelect={setActiveSession}
          onCreate={() => handleCreateSession(mode)}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
        />
        <section className="flex min-h-0 flex-col rounded-[2rem] border border-slate-200 bg-slate-50/70 p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold">{currentSession?.title || '开始新的对话'}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">支持本地模型流式输出与本地知识库问答</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ModelStatusBadge
                status={settings?.model_status}
                label={modelBadgeLabel(settings?.model_status)}
                title={settings?.model_error || ''}
              />
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
                onClick={() => exportConversation(currentSession, messages)}
                disabled={!messages.length}
              >
                导出会话
              </button>
              <button
                className={modeButtonClass(mode === CHAT_MODE.NORMAL)}
                onClick={() => handleModeSwitch(CHAT_MODE.NORMAL)}
                disabled={generating}
              >
                普通对话
              </button>
              <button
                className={
                  mode === CHAT_MODE.RAG
                    ? 'rounded-full bg-brand-600 px-4 py-2 text-xs text-white transition disabled:cursor-not-allowed disabled:opacity-50'
                    : modeButtonClass(false)
                }
                onClick={() => handleModeSwitch(CHAT_MODE.RAG)}
                disabled={generating}
              >
                RAG 问答
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4 scrollbar-thin">
            {!messages.length ? (
              <EmptyState
                title="还没有聊天记录"
                description="可以直接输入问题开始对话，也可以先用下面的快捷问题体验本地模型和 RAG 流程。"
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
                        disabled={!modelReady || generating}
                        onClick={() => handleSend(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                }
              />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onEditResend={message.role === 'user' ? setEditTarget : undefined}
                />
              ))
            )}
            {isCurrentSessionGenerating ? <LoadingSpinner text="模型正在生成回答..." /> : null}
          </div>
          <ChatInput
            onSubmit={handleSend}
            onStop={() => stop(abortController)}
            onRegenerate={handleRegenerate}
            generating={isCurrentSessionGenerating}
            busy={generating}
            ragMode={mode === CHAT_MODE.RAG}
            modelReady={modelReady}
            busyHint={
              isCurrentSessionGenerating
                ? '有对话正在生成回答，你可以先在输入框里输入问题，等模型回答完后继续提问。'
                : otherSessionGenerating
                  ? '另一条会话正在生成回答，你可以先输入问题，等模型回答完后继续提问。'
                  : ''
            }
          />
        </section>
      </div>
      <SessionNameDialog
        open={Boolean(renameTarget)}
        title="重命名会话"
        description="给这个会话换一个更容易识别的名字。"
        initialValue={renameTarget?.title || ''}
        confirmText="保存名称"
        onCancel={() => setRenameTarget(null)}
        onConfirm={handleRenameSession}
      />
      <MessageEditDialog
        open={Boolean(editTarget)}
        title="编辑后重发"
        description="修改这条用户消息后重新发送，原会话记录会保留。"
        initialValue={editTarget?.content || ''}
        confirmText="重新发送"
        onCancel={() => setEditTarget(null)}
        onConfirm={handleEditResend}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除会话"
        description={`确定删除“${deleteTarget?.title || '未命名会话'}”吗？删除后无法恢复。`}
        cancelText="保留会话"
        confirmText="确认删除"
        confirmTone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSession}
      />
    </>
  );
}

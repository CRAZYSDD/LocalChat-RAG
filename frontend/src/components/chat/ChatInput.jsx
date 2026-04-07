import { useForm } from 'react-hook-form';

export default function ChatInput({
  onSubmit,
  onStop,
  onRegenerate,
  generating = false,
  busy = false,
  ragMode,
  modelReady = true,
  busyHint = '',
}) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { question: '' },
  });

  const question = watch('question');

  const submitHandler = handleSubmit((values) => {
    if (!modelReady || busy) return;
    onSubmit(values.question);
    reset();
  });

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent?.isComposing) {
      return;
    }

    event.preventDefault();
    if (!question.trim() || busy || !modelReady) return;
    submitHandler();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <form onSubmit={submitHandler} className="space-y-3">
        {modelReady && busy && busyHint ? (
          <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2 text-xs text-brand-700 dark:border-brand-900/50 dark:bg-brand-950/20 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            <span>{busyHint}</span>
          </div>
        ) : null}
        <textarea
          rows="4"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950 dark:disabled:bg-slate-900"
          placeholder={
            !modelReady
              ? '模型加载后即可开始提问...'
              : ragMode
                ? '输入问题，将结合本地知识库检索后再回答...'
                : '输入你的问题，支持多轮上下文...'
          }
          onKeyDown={handleKeyDown}
          disabled={!modelReady}
          {...register('question', { required: true, minLength: 2 })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {busy ? '当前回答生成结束后，可发送已输入的问题。' : ragMode ? '当前为 RAG 问答模式' : '当前为普通对话模式'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:border-slate-800 dark:disabled:text-slate-600"
              onClick={onRegenerate}
              disabled={busy || !modelReady}
            >
              重新生成
            </button>
            {generating ? (
              <button
                type="button"
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400"
                onClick={onStop}
              >
                停止生成
              </button>
            ) : (
              <button
                type="submit"
                disabled={!question.trim() || !modelReady || busy}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              >
                发送
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

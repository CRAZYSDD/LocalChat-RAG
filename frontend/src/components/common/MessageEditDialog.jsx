import { useEffect, useState } from 'react';

export default function MessageEditDialog({
  open,
  title,
  description,
  initialValue = '',
  confirmText = '重新发送',
  onCancel,
  onConfirm,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [initialValue, open]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue) return;
    onConfirm(nextValue);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent?.isComposing) {
      return;
    }

    event.preventDefault();
    if (!value.trim()) return;
    onConfirm(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-panel dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <textarea
            autoFocus
            className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="编辑消息内容"
            value={value}
          />
          <div className="flex justify-end gap-3">
            <button
              className="rounded-xl border px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={onCancel}
              type="button"
            >
              取消
            </button>
            <button
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!value.trim()}
              type="submit"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

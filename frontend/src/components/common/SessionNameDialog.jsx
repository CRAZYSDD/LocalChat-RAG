import { useEffect, useState } from 'react';

export default function SessionNameDialog({
  open,
  title,
  description,
  initialValue = '',
  confirmText = '保存',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-panel dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            autoFocus
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            maxLength={40}
            onChange={(event) => setValue(event.target.value)}
            placeholder="输入会话名称"
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

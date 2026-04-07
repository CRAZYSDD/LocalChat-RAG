export default function ConfirmDialog({
  open,
  title,
  description,
  cancelText = '取消',
  confirmText = '确认',
  confirmTone = 'danger',
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const confirmClass = confirmTone === 'danger'
    ? 'bg-rose-500 hover:bg-rose-400'
    : 'bg-brand-600 hover:bg-brand-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-panel dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm text-white transition ${confirmClass}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoadingSpinner({ text = '加载中...' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
      </span>
      <span>{text}</span>
    </div>
  );
}

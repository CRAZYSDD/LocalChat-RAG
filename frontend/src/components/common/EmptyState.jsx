export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-panel dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
        AI
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

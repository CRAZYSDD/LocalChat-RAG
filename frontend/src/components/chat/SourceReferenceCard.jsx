export default function SourceReferenceCard({ source, index }) {
  const scoreText = typeof source.score === 'number' ? `${Math.round(source.score * 100)}%` : '--';

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-xs shadow-sm dark:border-slate-700 dark:from-slate-800/70 dark:to-slate-900/70">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-100">{source.file_name || '未知文档'}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Chunk {source.chunk_index ?? '--'}</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100 dark:bg-slate-900 dark:text-brand-300 dark:ring-brand-900/50">
          相关度 {scoreText}
        </span>
      </div>
      <p className="rounded-xl bg-white/70 p-3 leading-6 text-slate-500 dark:bg-slate-950/40 dark:text-slate-300">
        {source.content}
      </p>
    </div>
  );
}

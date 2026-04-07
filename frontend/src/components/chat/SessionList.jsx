import { useMemo, useState } from 'react';
import { formatTime, truncate } from '../../utils/format';

function modeLabel(mode) {
  return mode === 'rag' ? 'RAG' : '普通';
}

function modeClass(mode) {
  return mode === 'rag'
    ? 'bg-brand-500/20 text-brand-200 border-brand-400/30'
    : 'bg-white/10 text-slate-200 border-white/10';
}

export default function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, onRename }) {
  const [keyword, setKeyword] = useState('');

  const filteredSessions = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return sessions;
    return sessions.filter((item) =>
      [item.title, item.last_message, item.mode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(trimmed)),
    );
  }, [keyword, sessions]);

  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-slate-950 p-4 text-white">
      <button className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-medium" onClick={onCreate} type="button">
        + 新建会话
      </button>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="搜索会话"
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
      />
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto scrollbar-thin">
        {!filteredSessions.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
            没有匹配的会话
          </div>
        ) : null}
        {filteredSessions.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-3 transition ${
              activeId === item.id ? 'border-brand-500 bg-white/10' : 'border-white/10 hover:bg-white/5'
            }`}
            onClick={() => onSelect(item.id)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{truncate(item.title || '未命名会话', 18)}</h4>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${modeClass(item.mode)}`}>
                    {modeLabel(item.mode)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-slate-300 transition hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRename(item);
                  }}
                  type="button"
                >
                  重命名
                </button>
                <button
                  className="text-xs text-rose-300 transition hover:text-rose-200"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(item);
                  }}
                  type="button"
                >
                  删除
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{truncate(item.last_message || '开始新的提问吧', 42)}</p>
            <p className="mt-2 text-[11px] text-slate-500">{formatTime(item.updated_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

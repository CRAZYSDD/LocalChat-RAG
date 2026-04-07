import { useState } from 'react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import SourceReferenceCard from './SourceReferenceCard';

async function copyText(content) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function ChatMessage({ message, onEditResend }) {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(message.content || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-3xl rounded-3xl px-4 py-4 shadow-sm ${
          isAssistant
            ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100'
            : 'bg-brand-600 text-white'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`text-xs font-medium ${isAssistant ? 'text-slate-500 dark:text-slate-400' : 'text-white/80'}`}>
            {isAssistant ? '助手' : '用户'}
          </span>
          <div className="flex items-center gap-2">
            {!isAssistant && onEditResend ? (
              <button
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/90 transition hover:bg-white/10"
                onClick={() => onEditResend(message)}
                type="button"
              >
                编辑重发
              </button>
            ) : null}
            <button
              className={`rounded-full border px-3 py-1 text-xs transition ${
                isAssistant
                  ? 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  : 'border-white/20 text-white/90 hover:bg-white/10'
              }`}
              onClick={handleCopy}
              type="button"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        {isAssistant ? <MarkdownRenderer content={message.content || '思考中...'} /> : <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
        {isAssistant && message.sources?.length ? (
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">参考资料</p>
            {message.sources.map((source, index) => (
              <SourceReferenceCard key={`${source.file_id}-${index}`} source={source} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

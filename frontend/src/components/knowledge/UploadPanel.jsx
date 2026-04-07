import { useRef } from 'react';

export default function UploadPanel({ onUpload, uploading }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    onUpload(formData);
    event.target.value = '';
  };

  return (
    <div className="rounded-3xl border border-dashed border-brand-300 bg-brand-50/70 p-6 dark:border-brand-700 dark:bg-brand-950/20">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{'\u4e0a\u4f20\u77e5\u8bc6\u5e93\u6587\u6863'}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {'\u652f\u6301 txt / md / pdf\uff0c\u4e0a\u4f20\u540e\u53ef\u91cd\u65b0\u7d22\u5f15\u751f\u6210\u5411\u91cf\u3002'}
      </p>
      <input ref={inputRef} type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleChange} />
      <button
        className="mt-4 rounded-2xl bg-brand-600 px-4 py-2 text-sm text-white"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? '\u4e0a\u4f20\u4e2d...' : '\u9009\u62e9\u6587\u4ef6'}
      </button>
    </div>
  );
}

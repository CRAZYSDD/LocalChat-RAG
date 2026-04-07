import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function SettingForm({ config, onSubmit, saving }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">{'\u6a21\u578b\u8def\u5f84'}</span>
        <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('model_path')} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">{'Embedding \u6a21\u578b\u8def\u5f84'}</span>
        <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('embedding_model_path')} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">{'\u6700\u5927\u751f\u6210\u957f\u5ea6'}</span>
        <input type="number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('max_new_tokens')} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">Temperature</span>
        <input type="number" step="0.1" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('temperature')} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">Top P</span>
        <input type="number" step="0.1" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('top_p')} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">重复惩罚</span>
        <input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950" {...register('repetition_penalty')} />
      </label>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
        <input type="checkbox" {...register('streaming_enabled')} />
        <span className="text-sm text-slate-600 dark:text-slate-300">{'\u542f\u7528\u6d41\u5f0f\u8f93\u51fa'}</span>
      </label>
      <div className="md:col-span-2">
        <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500" disabled={saving}>
          {saving ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58\u8bbe\u7f6e'}
        </button>
      </div>
    </form>
  );
}

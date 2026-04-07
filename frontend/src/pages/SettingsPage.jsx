import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModelStatusBadge from '../components/common/ModelStatusBadge';
import SettingForm from '../components/settings/SettingForm';
import { fetchSettings, loadSettingsResources, saveSettings } from '../store/slices/settingsSlice';

function statusLabel(status, loadedText, notLoadedText, errorText) {
  if (status === 'loaded') return loadedText;
  if (status === 'error') return errorText;
  return notLoadedText;
}

function ErrorDiagnosticCard({ title, error, suggestions }) {
  if (!error) return null;

  return (
    <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/80 p-5 text-sm shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-rose-700 dark:text-rose-300">{title}</p>
          <p className="mt-1 text-rose-600/80 dark:text-rose-200/80">后端加载本地资源时遇到问题，可以按下面顺序排查。</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-600 ring-1 ring-rose-100 dark:bg-slate-950 dark:text-rose-300 dark:ring-rose-900/50">
          需要处理
        </span>
      </div>
      <div className="mt-4 rounded-2xl bg-white/80 p-4 font-mono text-xs leading-6 text-rose-700 ring-1 ring-rose-100 dark:bg-slate-950/60 dark:text-rose-200 dark:ring-rose-900/50">
        {error}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {suggestions.map((item) => (
          <div key={item} className="rounded-2xl bg-white/70 px-3 py-2 text-slate-600 ring-1 ring-rose-100 dark:bg-slate-950/40 dark:text-slate-300 dark:ring-rose-900/40">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { config, loading, saving, reloading } = useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  if (loading && !config) {
    return <LoadingSpinner text="\u6b63\u5728\u52a0\u8f7d\u6a21\u578b\u914d\u7f6e..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{'\u6a21\u578b\u8bbe\u7f6e'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {'\u8bfb\u53d6\u5e76\u66f4\u65b0\u540e\u7aef\u8fd0\u884c\u53c2\u6570\uff0c\u4e0d\u76f4\u63a5\u4fee\u6539\u672c\u5730\u6a21\u578b\u6587\u4ef6\u3002'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModelStatusBadge
            status={config?.model_status}
            label={statusLabel(config?.model_status, '\u5927\u6a21\u578b\u5df2\u52a0\u8f7d', '\u5927\u6a21\u578b\u672a\u52a0\u8f7d', '\u5927\u6a21\u578b\u52a0\u8f7d\u5931\u8d25')}
            title={config?.model_error || ''}
          />
          <ModelStatusBadge
            status={config?.embedding_model_status}
            label={statusLabel(config?.embedding_model_status, 'Embedding \u5df2\u52a0\u8f7d', 'Embedding \u672a\u52a0\u8f7d', 'Embedding \u52a0\u8f7d\u5931\u8d25')}
            title={config?.embedding_model_error || ''}
          />
          <button
            className="rounded-2xl border px-4 py-2 text-sm dark:border-slate-700"
            disabled={reloading}
            onClick={() => dispatch(loadSettingsResources())}
          >
            {reloading ? '\u52a0\u8f7d\u4e2d...' : '\u7acb\u5373\u52a0\u8f7d'}
          </button>
        </div>
      </div>
      <ErrorDiagnosticCard
        title="大模型加载失败"
        error={config?.model_error}
        suggestions={[
          '确认 MODEL_PATH 指向 snapshots 或完整模型目录',
          '确认目录中包含 config.json、tokenizer 和 model.safetensors',
          '建议使用 Python 3.10 / 3.11 运行后端',
          '显存不足时调小 MAX_NEW_TOKENS 或换更小模型',
        ]}
      />
      <ErrorDiagnosticCard
        title="Embedding 模型加载失败"
        error={config?.embedding_model_error}
        suggestions={[
          '确认 EMBEDDING_MODEL_PATH 是完整下载目录',
          '确认目录中包含 sentence-transformers 所需配置文件',
          '上传文档前先点击“立即加载”检查模型状态',
          '如果路径来自 HuggingFace 缓存，不要填写 refs/main 文件路径',
        ]}
      />
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <SettingForm config={config} saving={saving} onSubmit={(values) => dispatch(saveSettings(values))} />
      </div>
    </div>
  );
}

import { useRouteError } from 'react-router-dom';

export default function ExceptionPage() {
  const error = useRouteError();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-panel dark:border-rose-900 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-rose-500">页面异常</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{error?.message || '发生了未预期的错误，请稍后重试。'}</p>
      </div>
    </div>
  );
}

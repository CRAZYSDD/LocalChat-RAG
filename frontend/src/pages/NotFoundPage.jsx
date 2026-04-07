import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold text-brand-500">404</p>
      <h2 className="mt-4 text-2xl font-semibold">页面不存在</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">你访问的页面已经离开当前路由上下文。</p>
      <Link className="mt-6 rounded-2xl bg-brand-600 px-4 py-3 text-white" to="/dashboard">
        返回首页
      </Link>
    </div>
  );
}

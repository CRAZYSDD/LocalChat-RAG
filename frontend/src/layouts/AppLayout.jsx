import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

const menus = [
  { to: '/dashboard', label: '数据看板' },
  { to: '/chat', label: '智能对话' },
  { to: '/knowledge', label: '知识库' },
  { to: '/settings', label: '模型设置' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-r border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600">LocalChat RAG</p>
            <h1 className="mt-2 text-2xl font-semibold">本地智能对话平台</h1>
          </div>
          <nav className="mt-8 space-y-2">
            {menus.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm ${
                    isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-10">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-medium">{user?.username || 'SDD'}</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-xl border px-3 py-2 text-xs dark:border-slate-700" onClick={toggleTheme}>
                  {theme === 'dark' ? '浅色模式' : '深色模式'}
                </button>
                <button
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white dark:bg-white dark:text-slate-900"
                  onClick={() => {
                    dispatch(logout());
                    navigate('/login');
                  }}
                >
                  退出
                </button>
              </div>
            </div>
          </div>
        </aside>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

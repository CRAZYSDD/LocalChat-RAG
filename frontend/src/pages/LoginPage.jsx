import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, selectIsAuthenticated } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      username: 'SDD',
      password: '123456',
    },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#10b98120,_transparent_50%),linear-gradient(135deg,#020617,#0f172a,#111827)] p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">AI Frontend Project</p>
        <h1 className="mt-4 text-3xl font-semibold">登录 LocalChat RAG</h1>
        <p className="mt-2 text-sm text-slate-300">演示账号默认已填充，可直接登录体验本地模型对话与 RAG。</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => dispatch(login(values)))}>
          <div>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="用户名"
              {...register('username', { required: '请输入用户名' })}
            />
            <p className="mt-1 text-xs text-rose-300">{formState.errors.username?.message}</p>
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="密码"
              {...register('password', {
                required: '请输入密码',
                minLength: { value: 6, message: '至少 6 位密码' },
              })}
            />
            <p className="mt-1 text-xs text-rose-300">{formState.errors.password?.message}</p>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-medium text-white" disabled={loading}>
            {loading ? '登录中...' : '登录系统'}
          </button>
        </form>
      </div>
    </div>
  );
}

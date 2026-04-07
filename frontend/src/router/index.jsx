import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { store } from '../store';
import AppLayout from '../layouts/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const KnowledgePage = lazy(() => import('../pages/KnowledgePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ExceptionPage = lazy(() => import('../pages/ExceptionPage'));

function withSuspense(element) {
  return <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>{element}</Suspense>;
}

function ProtectedRoute({ children }) {
  const state = store.getState();
  if (!state.auth.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
    errorElement: withSuspense(<ExceptionPage />)
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: withSuspense(<ExceptionPage />),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'chat', element: withSuspense(<ChatPage />) },
      { path: 'knowledge', element: withSuspense(<KnowledgePage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) }
    ]
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />)
  }
]);

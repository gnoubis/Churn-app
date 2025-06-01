import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ChurnDetails from './components/analytics/ChurnDetails';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'analytics/churn-details', element: <ChurnDetails /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    {
      path: 'login',
      element: <Login />
    }
  ]);
} 
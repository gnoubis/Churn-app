import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles } from './mui-exports';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ClientList from './components/clients/ClientList';
import Login from './components/auth/Login';
import Profile from './components/user/Profile';
import UserManagement from './components/admin/UserManagement';
import SentimentAnalysis from './components/sentiment/SentimentAnalysis';
import Analytics from './components/analytics/Analytics';
import Communications from './components/communications/Communications';
import DataImport from './components/data-import/DataImport';
import ClientPredictions from './components/predictions/ClientPredictions';
import ClientRecommendations from './components/recommendations/ClientRecommendations';
import authService from './services/authService';
import theme from './theme/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fr from 'date-fns/locale/fr';

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  'html, body': {
    height: '100%',
    width: '100%',
  },
  '#root': {
    height: '100%',
    width: '100%',
  },
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    background: '#f1f5f9',
    borderRadius: '4px',
  },
  '::-webkit-scrollbar-thumb': {
    background: '#94a3b8',
    borderRadius: '4px',
    '&:hover': {
      background: '#64748b',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '.fadeIn': {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  '.MuiCard-root': {
    transition: 'all 0.3s ease-in-out',
  },
};

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const hasRequiredRole = requiredRole
    ? authService.hasRole(requiredRole)
    : true;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles} />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="predictions" element={<ClientPredictions />} />
              <Route path="sentiments" element={<SentimentAnalysis />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="communications" element={<Communications />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="data-import" element={<DataImport />} />
              <Route path="recommendations" element={<ClientRecommendations />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;

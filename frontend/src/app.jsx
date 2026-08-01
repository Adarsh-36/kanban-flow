import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

const MainContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
        Initializing App...
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
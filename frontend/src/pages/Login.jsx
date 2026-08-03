import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from 'lucide-react';
import api from '../api/axiosInstance';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // 1. Register new user
        await api.post('/auth/register', { name, email, password });
        // 2. Automatically log in after registration
        await login(email, password);
      } else {
        // Sign in existing user
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-xl">
          <Layout size={24} />
          <span>KanbanFlow</span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-1">
          {isRegistering ? 'Create an Account' : 'Sign In'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          {isRegistering
            ? 'Enter your details to register'
            : 'Enter your credentials to access your board'}
        </p>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Alex Dev"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : isRegistering
              ? 'Sign Up & Continue'
              : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Create One
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
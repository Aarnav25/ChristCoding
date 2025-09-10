import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      const effectiveRole = res.email?.toLowerCase() === 'admin@gmail.com' ? 'admin' : (res.role || 'student');
      loginStore(res.email, effectiveRole as any);
      if (effectiveRole === 'admin') navigate('/questions');
      else navigate('/dashboard');
    } catch (e: any) {
      console.error('login failed', e);
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* floating gradient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-pink-300 to-purple-400 opacity-20 blur-3xl" />

      <div className="relative grid min-h-screen place-items-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left feature/branding panel */}
          <div className="hidden md:block card-glass p-8 shadow-sm">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 animate-pulse mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Daily Challenges
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-3"><span className="text-blue-600">Daily</span> Coding Challenge</h2>
                <p className="text-gray-600">Sharpen your skills with curated questions, mock tests, and instant scoring. Track progress and compete with your peers.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-xl border bg-white hover:shadow-sm transition text-gray-700">MCQ Assessments</div>
                <div className="p-4 rounded-xl border bg-white hover:shadow-sm transition text-gray-700">Daily Streaks</div>
                <div className="p-4 rounded-xl border bg-white hover:shadow-sm transition text-gray-700">Admin Insights</div>
                <div className="p-4 rounded-xl border bg-white hover:shadow-sm transition text-gray-700">PDF Uploads</div>
              </div>
            </div>
          </div>

          {/* Right auth card */}
          <div className="bg-white/95 rounded-2xl p-8 w-full shadow-xl border border-gray-100">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Sign in to continue
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-gray-900">Welcome back</h1>
              <p className="text-gray-500">Access your dashboard and keep the streak alive.</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 shadow-md"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-xs text-gray-500">No account? <Link className="text-blue-600 hover:underline" to="/signup">Sign up</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

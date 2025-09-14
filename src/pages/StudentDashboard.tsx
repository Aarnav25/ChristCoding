import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { progressService } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';
import { config } from '../config';

export default function StudentDashboard() {
  const email = useAuthStore((s) => s.email) ?? '';
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    if (!email) return;
    progressService.getByStudent(email).then(setAttempts).catch(() => setAttempts([]));
  }, [email]);

  const lastScore = useMemo(() => {
    if (attempts.length === 0) return null;
    const a = attempts[0];
    return Math.round((a.score / a.total) * 100);
  }, [attempts]);

  const avgScore = useMemo(() => {
    if (attempts.length === 0) return null;
    const pct = attempts.reduce((acc, a) => acc + a.score / a.total, 0) / attempts.length;
    return Math.round(pct * 100);
  }, [attempts]);

  const streak = useMemo(() => {
    // naive daily streak based on unique date count until a gap
    const dates = Array.from(
      new Set(attempts.map((a) => new Date(a.taken_at || a.takenAt).toDateString()))
    );
    return dates.length;
  }, [attempts]);

  const recent = attempts.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome{email ? `, ${email.split('@')[0]}` : ''}</h2>
          <p className="text-gray-600 dark:text-gray-400">Kick off your learning with today's {config.DAILY_CHALLENGE_NAME}.</p>
        </div>
        <Link to="/daily" className="rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700 transition-all">Start {config.DAILY_CHALLENGE_NAME}</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-2 border-blue-200 dark:border-blue-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Last Score</div>
          <div className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{lastScore !== null ? `${lastScore}%` : '—'}</div>
        </Card>
        <Card className="border-2 border-pink-200 dark:border-pink-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          <div className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{avgScore !== null ? `${avgScore}%` : '—'}</div>
        </Card>
        <Card className="border-2 border-violet-200 dark:border-violet-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Daily Streak</div>
          <div className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">{streak}</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-900 dark:text-white">Recent Attempts</div>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline text-sm" to="/progress">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-2 py-1">When</th>
                <th className="px-2 py-1">Test</th>
                <th className="px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{new Date(r.taken_at || r.takenAt).toLocaleString()}</td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{r.test_id || r.testId}</td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td className="px-2 py-6 text-gray-500 dark:text-gray-400" colSpan={3}>No attempts yet. Take your first {config.DAILY_CHALLENGE_NAME}!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

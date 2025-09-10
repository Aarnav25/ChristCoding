import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { progressService } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StudentProgressPage() {
  const email = useAuthStore((s) => s.email);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!email) return;
    progressService.getByStudent(email).then(setRows);
  }, [email]);

  const chartData = useMemo(() => {
    const labels = rows.map((r) => new Date(r.taken_at || r.takenAt).toLocaleDateString());
    const scores = rows.map((r) => (r.score / r.total) * 100);
    return {
      labels,
      datasets: [
        {
          label: 'Score %',
          data: scores,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [rows]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Your Progress Over Time' },
    },
    scales: {
      y: { suggestedMin: 0, suggestedMax: 100, ticks: { callback: (v: any) => v + '%' } },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Progress</h2>
      <Card>
        <div className="mb-6">
          <Line data={chartData} options={options} />
        </div>
        <div className="overflow-x-auto table-soft">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Test</th>
                <th className="px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{new Date(r.taken_at || r.takenAt).toLocaleString()}</td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{r.test_id || r.testId}</td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-2 py-6 text-gray-500 dark:text-gray-400" colSpan={3}>No attempts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

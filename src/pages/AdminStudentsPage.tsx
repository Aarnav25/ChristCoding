import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { progressService } from '../services/progressService';

type StudentPerformance = {
  email: string;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  accuracy: number;
  lastAttempt: string;
  attempts: any[];
};

export default function AdminStudentsPage() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length === 0) {
      setRows([]);
      setStudentPerformance(null);
      return;
    }
    const id = setTimeout(() => {
      setLoading(true);
      progressService.searchByStudentNameOrEmail(q).then((data) => {
        setRows(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const calculatePerformance = (attempts: any[]) => {
    if (attempts.length === 0) return null;

    const totalAttempts = attempts.length;
    
    // Calculate average percentage score (not raw score)
    const averagePercentage = attempts.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.total) * 100;
    }, 0) / totalAttempts;
    
    // Calculate best percentage score
    const bestPercentage = Math.max(...attempts.map(a => (a.score / a.total) * 100));
    
    // Calculate overall accuracy (total correct / total possible)
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalPossible = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
    const accuracy = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    
    const lastAttempt = attempts[0]?.taken_at || '';

    return {
      email: attempts[0]?.student_email || '',
      totalAttempts,
      averageScore: Math.round(averagePercentage * 10) / 10,
      bestScore: Math.round(bestPercentage * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      lastAttempt,
      attempts
    };
  };

  const handleStudentClick = (email: string) => {
    const studentAttempts = rows.filter(r => r.student_email === email);
    const performance = calculatePerformance(studentAttempts);
    setStudentPerformance(performance);
  };

  // Group attempts by student email
  const studentGroups = rows.reduce((acc, attempt) => {
    const email = attempt.student_email;
    if (!acc[email]) acc[email] = [];
    acc[email].push(attempt);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Students Performance</h2>
      
      <Card>
        <input
          placeholder="Search by student email or name"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        
        {loading && <div className="text-center py-4 text-gray-500 dark:text-gray-400">Searching...</div>}
        
        {!loading && Object.keys(studentGroups).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Students Found:</h3>
            {Object.entries(studentGroups).map(([email, attempts]) => {
              const performance = calculatePerformance(attempts);
              return (
                <div key={email} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => handleStudentClick(email)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-blue-600 dark:text-blue-400">{email}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{attempts.length} attempt(s)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{performance?.accuracy}%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Avg Score:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{performance?.averageScore}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Best Score:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{performance?.bestScore}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Last Attempt:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{performance?.lastAttempt ? new Date(performance.lastAttempt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && Object.keys(studentGroups).length === 0 && q.length > 0 && (
          <div className="text-center py-6 text-gray-500">No students found</div>
        )}
      </Card>

      {studentPerformance && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Detailed Performance: {studentPerformance.email}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{studentPerformance.totalAttempts}</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{studentPerformance.accuracy}%</div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{studentPerformance.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{studentPerformance.bestScore}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Accuracy</th>
                  <th className="px-3 py-2">Test</th>
                </tr>
              </thead>
              <tbody>
                {studentPerformance.attempts.map((attempt) => {
                  const accuracy = (attempt.score / attempt.total) * 100;
                  return (
                    <tr key={attempt.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{new Date(attempt.taken_at).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {attempt.score}/{attempt.total}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(accuracy)}%
                        </span>
                      </td>
                      <td className="px-3 py-2">{attempt.test_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export type Attempt = {
  id: string;
  studentEmail: string;
  testId: string;
  score: number;
  total: number;
  takenAt: number;
};

import { config } from '../config';

export const progressService = {
  async recordAttempt(a: { studentEmail: string; testId: string; score: number; total: number }) {
    const res = await fetch(`${config.API_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (!res.ok) throw new Error('record attempt failed');
    return res.json();
  },
  async getByStudent(email: string) {
    const res = await fetch(`${config.API_URL}/attempts/by-student?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('get attempts failed');
    return res.json();
  },
  async searchByStudentNameOrEmail(query: string): Promise<Attempt[]> {
    const res = await fetch(`${config.API_URL}/attempts/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('search attempts failed');
    return res.json();
  },
};

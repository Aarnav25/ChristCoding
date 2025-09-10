export type Attempt = {
  id: string;
  studentEmail: string;
  testId: string;
  score: number;
  total: number;
  takenAt: number;
};

let attempts: Attempt[] = [];

const API = 'http://localhost:4000';

export const progressService = {
  async recordAttempt(a: { studentEmail: string; testId: string; score: number; total: number }) {
    const res = await fetch(`${API}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (!res.ok) throw new Error('record attempt failed');
    return res.json();
  },
  async getByStudent(email: string) {
    const res = await fetch(`${API}/attempts/by-student?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('get attempts failed');
    return res.json();
  },
  async searchByStudentNameOrEmail(query: string): Promise<Attempt[]> {
    const res = await fetch(`${API}/attempts/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('search attempts failed');
    return res.json();
  },
};

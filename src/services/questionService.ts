import { config } from '../config';

export type Question = {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
};

export const questionService = {
  async getQuestions(): Promise<Question[]> {
    const res = await fetch(`${config.API_URL}/questions`);
    if (!res.ok) throw new Error('Failed to load questions');
    return res.json();
  },
  async addQuestion(q: Omit<Question, 'id'>): Promise<Question> {
    const res = await fetch(`${config.API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });
    if (!res.ok) throw new Error('Failed to add question');
    return res.json();
  },
  async updateQuestion(updated: Question): Promise<Question> {
    const res = await fetch(`${config.API_URL}/questions/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update question');
    return res.json();
  },
  async deleteQuestion(id: string): Promise<void> {
    const res = await fetch(`${config.API_URL}/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete question');
  },
  async getRandomQuestions(n: number): Promise<Question[]> {
    const all = await this.getQuestions();
    const copy = [...all];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  },
};

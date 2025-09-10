import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { questionService } from '../services/questionService';
import type { Question } from '../services/questionService';
import { Modal } from '../components/Modal';
import { progressService } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';

export default function DailyChallengePage() {
  const email = useAuthStore((s) => s.email) ?? 'student@example.com';
  const [qs, setQs] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function load() {
      const two = await questionService.getRandomQuestions(2);
      setQs(two);
      const initial: Record<string, number | null> = {};
      two.forEach((q) => (initial[q.id] = null));
      setAnswers(initial);
    }
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let s = 0;
    for (const q of qs) if (answers[q.id] === q.answerIndex) s++;
    setScore(s);
    setOpen(true);
    await progressService.recordAttempt({ studentEmail: email, testId: 'daily', score: s, total: qs.length });
    try {
      await fetch('http://localhost:4000/send-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, testName: 'Daily Challenge', score: s, total: qs.length }),
      });
    } catch (err) {
      console.error('Email send failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-fuchsia-600">Daily Challenge</h2>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {qs.map((q, idx) => (
          <Card key={q.id} className="space-y-3">
            <div className="font-semibold text-gray-900 dark:text-white">{idx + 1}. {q.text}</div>
            <div className="grid gap-2">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer transition-colors ${answers[q.id] === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <input
                    type="radio"
                    className="accent-blue-600"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  />
                  <span className="text-gray-900 dark:text-white">{opt}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
      <Modal open={open} title="Daily Result" onClose={() => setOpen(false)}>
        <p className="mb-4">Your score: <span className="font-semibold">{score}</span> / {qs.length}</p>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </Modal>
    </div>
  );
}

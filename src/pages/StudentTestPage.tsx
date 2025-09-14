import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { questionService } from '../services/questionService';
import type { Question } from '../services/questionService';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { testService } from '../services/testService';
import { progressService } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';

export default function StudentTestPage() {
  const { testId } = useParams();
  const email = useAuthStore((s) => s.email) ?? 'student@example.com';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [title, setTitle] = useState('Test');

  useEffect(() => {
    async function load() {
      const tests = await testService.getTests();
      const t = tests.find((x) => x.id === testId);
      setTitle(t ? t.title : 'Test');
      const qs = await questionService.getRandomQuestions(t ? t.numQuestions : 5);
      setQuestions(qs);
      const initial: Record<string, number | null> = {};
      qs.forEach((q) => (initial[q.id] = null));
      setAnswers(initial);
    }
    load();
  }, [testId]);

  const numAnswered = useMemo(
    () => Object.values(answers).filter((v) => v !== null).length,
    [answers]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let s = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answerIndex) s++;
    }
    setScore(s);
    setOpen(true);
    await progressService.recordAttempt({ studentEmail: email, testId: testId ?? 'unknown', score: s, total: questions.length });
    // Send score email via local server
    try {
      await fetch('http://localhost:4000/send-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, testName: title, score: s, total: questions.length }),
      });
    } catch (err) {
      // Non-blocking if email fails
      console.error('Email send failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-fuchsia-600">{title}</h2>
        <div className="text-sm text-gray-600">Answered {numAnswered}/{questions.length}</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="space-y-3">
            <div className="font-semibold text-gray-900">{idx + 1}. {q.text}</div>
            <div className="grid gap-2">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer transition ${answers[q.id] === i ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-gray-200 hover:bg-blue-50/40'}`}>
                  <input
                    className="accent-fuchsia-600"
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        <div className="flex items-center justify-end">
          <button type="submit" className="rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700">Submit</button>
        </div>
      </form>

      <Modal open={open} title="Result" onClose={() => setOpen(false)}>
        <p className="mb-4">Your score: <span className="font-semibold">{score}</span> / {questions.length}</p>
        <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-fuchsia-600">Close</button>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { questionService } from '../services/questionService';
import type { Question } from '../services/questionService';
import { testService } from '../services/testService';
import type { Test } from '../services/testService';

export default function AdminDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  const [form, setForm] = useState<Omit<Question, 'id'>>({ text: '', options: ['', '', '', ''], answerIndex: 0 });
  const [testTitle, setTestTitle] = useState('New Test');
  const [num, setNum] = useState(5);

  useEffect(() => {
    questionService.getQuestions().then(setQuestions);
    testService.getTests().then(setTests);
  }, []);

  const onUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:4000/upload-pdf', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || 'Upload failed');
        return;
      }
      alert(`Parsed and added ${json.created} questions`);
      if (Array.isArray(json.questions) && json.questions.length > 0) {
        setQuestions((prev) => [...json.questions, ...prev]);
      } else {
        const refreshed = await questionService.getQuestions();
        setQuestions(refreshed);
      }
    } catch (e: any) {
      console.error('upload failed', e);
      alert(e?.message || 'Upload failed');
    }
  };

  const addQuestion = async () => {
    const created = await questionService.addQuestion(form);
    setQuestions((q) => [created, ...q]);
    setForm({ text: '', options: ['', '', '', ''], answerIndex: 0 });
  };

  const deleteQuestion = async (id: string) => {
    await questionService.deleteQuestion(id);
    setQuestions((q) => q.filter((x) => x.id !== id));
  };

  const createTest = async () => {
    const t = await testService.createTest(testTitle, num);
    setTests((ts) => [t, ...ts]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-fuchsia-600">Admin Portal</h2>
        <p className="text-gray-600">Manage content and tests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="font-semibold mb-3">Upload PDF</div>
          <input type="file" accept="application/pdf" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} />
        </Card>

        <Card className="lg:col-span-2">
          <div className="font-semibold mb-3">Add Question</div>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              placeholder="Question text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="ans" checked={form.answerIndex === i} onChange={() => setForm({ ...form, answerIndex: i })} />
                <input
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...form.options];
                    next[i] = e.target.value;
                    setForm({ ...form, options: next });
                  }}
                />
              </div>
            ))}
            <button className="rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-fuchsia-600" onClick={addQuestion}>Add Question</button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="font-semibold mb-3">Questions</div>
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="border rounded-xl p-3 flex items-start justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-fuchsia-50">
              <div>
                <div className="font-medium">{q.text}</div>
                <div className="text-sm text-gray-500">Ans: {q.options[q.answerIndex]}</div>
              </div>
              <button className="rounded-xl px-3 py-1.5 font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500" onClick={() => deleteQuestion(q.id)}>Delete</button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-3">Create Test</div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
          />
          <input
            type="number"
            className="rounded-xl border border-gray-300 px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="# Questions"
            value={num}
            min={1}
            onChange={(e) => setNum(parseInt(e.target.value || '1', 10))}
          />
          <button className="rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-fuchsia-600" onClick={createTest}>Create</button>
        </div>
        <div className="mt-4">
          <div className="font-medium mb-2">All Tests</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-2 py-1">Title</th>
                  <th className="px-2 py-1">Questions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gradient-to-r hover:from-blue-50 hover:to-fuchsia-50">
                    <td className="px-2 py-2">{t.title}</td>
                    <td className="px-2 py-2">{t.numQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

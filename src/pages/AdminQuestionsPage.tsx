import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { questionService } from '../services/questionService';
import type { Question } from '../services/questionService';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Question, 'id'>>({ 
    text: '', 
    options: ['', '', '', ''], 
    answerIndex: 0 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionService.getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!form.text.trim() || form.options.some(opt => !opt.trim())) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const newQuestion = await questionService.addQuestion(form);
      setQuestions(prev => [newQuestion, ...prev]);
      setForm({ text: '', options: ['', '', '', ''], answerIndex: 0 });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add question:', error);
      alert('Failed to add question');
    }
  };

  const handleEditQuestion = async (id: string) => {
    if (!form.text.trim() || form.options.some(opt => !opt.trim())) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const updatedQuestion = await questionService.updateQuestion(id, form);
      setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
      setEditingId(null);
      setForm({ text: '', options: ['', '', '', ''], answerIndex: 0 });
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const startEdit = (question: Question) => {
    setEditingId(question.id);
    setForm({
      text: question.text,
      options: [...question.options],
      answerIndex: question.answerIndex
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ text: '', options: ['', '', '', ''], answerIndex: 0 });
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Questions Management</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:from-blue-600 hover:to-fuchsia-600"
        >
          {showAddForm ? 'Cancel' : 'Add New Question'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? 'Edit Question' : 'Add New Question'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Text
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm(prev => ({ ...prev, text: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter the question..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.options.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option {String.fromCharCode(65 + index)}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="answer"
                      checked={form.answerIndex === index}
                      onChange={() => setForm(prev => ({ ...prev, answerIndex: index }))}
                      className="text-blue-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...form.options];
                        newOptions[index] = e.target.value;
                        setForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={editingId ? () => handleEditQuestion(editingId) : handleAddQuestion}
                className="bg-green-500 hover:bg-green-600"
              >
                {editingId ? 'Update Question' : 'Add Question'}
              </Button>
              <Button
                onClick={editingId ? cancelEdit : () => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{filteredQuestions.length}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {questions.filter(q => q.options.length === 4).length}
            </div>
            <div className="text-sm text-gray-600">Complete Questions</div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <input
          type="text"
          placeholder="Search questions by text or options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No questions match your search' : 'No questions found'}
            </div>
          </Card>
        ) : (
          filteredQuestions.map((question, index) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Q{index + 1}
                    </span>
                    <span className="text-sm text-gray-500">ID: {question.id}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {question.text}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => startEdit(question)}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      optIndex === question.answerIndex
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        optIndex === question.answerIndex ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + optIndex)})
                      </span>
                      <span className={optIndex === question.answerIndex ? 'text-green-800' : 'text-gray-800'}>
                        {option}
                      </span>
                      {optIndex === question.answerIndex && (
                        <span className="ml-auto text-green-600 font-bold">✓ Correct</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

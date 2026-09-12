'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Quiz {
  id: number;
  title: string;
  description: string;
  creator_name: string;
  category: string;
  time_limit: number;
  attempts_allowed: number;
  is_published: boolean;
  question_count: number;
  total_points: number;
  created_at: string;
}

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchQuizzes = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await fetch('/api/quizzes/', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuizzes(data.results ?? data);
    } catch {
      setError('فشل في جلب الاختبارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const togglePublish = async (quiz: Quiz) => {
    const token = localStorage.getItem('access_token');
    setTogglingId(quiz.id);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ is_published: !quiz.is_published }),
      });
      if (!res.ok) throw new Error();
      setQuizzes((prev) =>
        prev.map((q) => q.id === quiz.id ? { ...q, is_published: !q.is_published } : q)
      );
    } catch {
      alert('فشل تغيير حالة النشر');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-xl text-gray-600 font-semibold">جاري تحميل الاختبارات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">إدارة الاختبارات</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/quizzes/create')}
            className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition text-sm"
          >
            + إنشاء اختبار جديد
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition text-sm"
          >
            الرئيسية
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>
        )}

        {quizzes.length === 0 ? (
          <p className="text-gray-500 text-center py-16">لا توجد اختبارات بعد.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">الاختبار</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">التصنيف</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">الأسئلة</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{quiz.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {quiz.creator_name} · {quiz.time_limit} دقيقة · {quiz.attempts_allowed} محاولات
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{quiz.category}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-medium ${quiz.question_count === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {quiz.question_count}
                      </span>
                      <span className="text-gray-400 text-xs"> / {quiz.total_points}ن</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => togglePublish(quiz)}
                        disabled={togglingId === quiz.id}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                          quiz.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        } ${togglingId === quiz.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {togglingId === quiz.id ? '...' : quiz.is_published ? '✓ منشور' : 'غير منشور'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => router.push(`/admin/quizzes/${quiz.id}/add-question`)}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium px-3 py-1.5 rounded transition"
                        >
                          + سؤال
                        </button>
                        <button
                          onClick={() => router.push(`/admin/quizzes/${quiz.id}/results`)}
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-medium px-3 py-1.5 rounded transition"
                        >
                          النتائج
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

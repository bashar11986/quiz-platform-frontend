'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface QuizInfo {
  id: number;
  title: string;
  description: string;
  category: string;
  total_questions: number;
  total_points: number;
  created_at: string;
}

interface Statistics {
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  passed: number;
  failed: number;
  passing_percentage: number;
}

interface AttemptRow {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  score: number;
  status: string;
  start_time: string;
  end_time: string | null;
  time_taken_minutes: number | null;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
}

interface ResultsResponse {
  quiz: QuizInfo;
  statistics: Statistics;
  attempts: AttemptRow[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quiz_id as string;

  const [data, setData] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    fetch(`/api/instructor/quizzes/${quizId}/results/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(() => setError('فشل في جلب نتائج الاختبار'))
      .finally(() => setLoading(false));
  }, [quizId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-xl text-gray-600 font-semibold">جاري تحميل النتائج...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-red-600 text-lg mb-6">{error ?? 'لا توجد بيانات'}</p>
          <button onClick={() => router.back()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            العودة
          </button>
        </div>
      </div>
    );
  }

  const { quiz, statistics, attempts } = data;

  const filtered = attempts.filter((a) =>
    a.student_name.toLowerCase().includes(search.toLowerCase()) ||
    a.student_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">نتائج الاختبار</h1>
          <p className="text-sm text-gray-500">{quiz.title} · {quiz.category}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition"
        >
          الرئيسية
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="إجمالي المحاولات" value={attempts.length} color="blue" />
          <StatCard label="عدد الطلاب" value={statistics.total_students} color="purple" />
          <StatCard label="متوسط الدرجات" value={`${Math.round(statistics.average_score)}%`} color="yellow" />
          <StatCard label="نسبة النجاح" value={`${Math.round(statistics.passing_percentage)}%`} color="green" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{Math.round(statistics.highest_score)}%</p>
            <p className="text-xs text-gray-500 mt-1">أعلى درجة</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{Math.round(statistics.lowest_score)}%</p>
            <p className="text-xs text-gray-500 mt-1">أدنى درجة</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{quiz.total_questions} س / {quiz.total_points} ن</p>
            <p className="text-xs text-gray-500 mt-1">أسئلة / نقاط</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ابحث باسم الطالب أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Attempts table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">#</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">الطالب</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">النسبة</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">النقاط</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">صحيح / خاطئ</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">الوقت (د)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">تاريخ البدء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">لا توجد نتائج</td>
                  </tr>
                ) : (
                  filtered.map((attempt, i) => {
                    const pct = Math.round((attempt.correct_answers / attempt.total_questions) * 100);
                    const passed = pct >= 50;
                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{attempt.student_name}</p>
                          <p className="text-xs text-gray-400">{attempt.student_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-base ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{Math.round(attempt.score)}</td>
                        <td className="px-4 py-3">
                          <span className="text-green-600 font-medium">{attempt.correct_answers}✓</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-red-500 font-medium">{attempt.incorrect_answers}✗</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {attempt.time_taken_minutes !== null ? attempt.time_taken_minutes.toFixed(1) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(attempt.start_time)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: 'blue' | 'green' | 'purple' | 'yellow' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <div className={`rounded-lg p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}

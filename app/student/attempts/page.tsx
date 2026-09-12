'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TimeTaken {
  minutes: number;
  seconds: number;
  total_seconds: number;
}

interface Attempt {
  id: number;
  quiz: number;
  quiz_title: string;
  quiz_description: string;
  quiz_category: string;
  instructor_name: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score: number;
  score_percentage: number;
  total_questions: number;
  total_points: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  start_time: string;
  end_time: string | null;
  time_taken: TimeTaken | null;
  attempt_number: number;
}

interface Statistics {
  total: number;
  completed: number;
  in_progress: number;
  abandoned: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: Attempt['status'] }) {
  const map = {
    completed: { label: 'مكتمل', className: 'bg-green-100 text-green-800' },
    in_progress: { label: 'جارٍ', className: 'bg-yellow-100 text-yellow-800' },
    abandoned: { label: 'متروك', className: 'bg-gray-100 text-gray-600' },
  };
  const { label, className } = map[status] ?? map.abandoned;
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}

export default function StudentAttemptsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/student/attempts/', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAttempts(data.results?.attempts ?? []);
        setStatistics(data.results?.statistics ?? null);
      })
      .catch(() => setError('حدث خطأ أثناء جلب البيانات. تأكد من اتصالك بالخادم.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-xl text-gray-600 font-semibold">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">سجل محاولاتي</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition"
        >
          العودة للرئيسية
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>
        ) : (
          <>
            {/* Statistics */}
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="إجمالي المحاولات" value={statistics.total} color="blue" />
                <StatCard label="المكتملة" value={statistics.completed} color="green" />
                <StatCard label="متوسط الدرجات" value={`${Math.round(statistics.average_score)}%`} color="purple" />
                <StatCard label="أعلى درجة" value={`${Math.round(statistics.highest_score)}%`} color="yellow" />
              </div>
            )}

            {/* Attempts list */}
            {attempts.length === 0 ? (
              <p className="text-gray-500 text-center py-16 text-lg">لا توجد محاولات سابقة.</p>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      {/* Left: quiz info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-base">{attempt.quiz_title}</h3>
                          <StatusBadge status={attempt.status} />
                          <span className="text-xs text-gray-400">محاولة #{attempt.attempt_number}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{attempt.quiz_category} · المحاضر: {attempt.instructor_name}</p>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          <span>
                            <span className="font-medium">البدء:</span>{' '}
                            {formatDate(attempt.start_time)} {formatTime(attempt.start_time)}
                          </span>
                          {attempt.end_time && (
                            <span>
                              <span className="font-medium">الانتهاء:</span>{' '}
                              {formatDate(attempt.end_time)} {formatTime(attempt.end_time)}
                            </span>
                          )}
                          {attempt.time_taken && (
                            <span>
                              <span className="font-medium">المدة:</span>{' '}
                              {attempt.time_taken.minutes} د {attempt.time_taken.seconds} ث
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: score + action */}
                      <div className="flex items-center gap-4">
                        {attempt.status === 'completed' && (
                          <div className="text-center">
                            <p
                              className={`text-3xl font-bold ${
                                attempt.correct_answers / attempt.total_questions >= 0.5
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {attempt.correct_answers}/{attempt.total_questions} صحيح
                            </p>
                            <p className="text-xs text-gray-400">
                              النقاط: {Math.round(attempt.score)}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          {attempt.status === 'completed' && (
                            <button
                              onClick={() => router.push(`/quiz/result/${attempt.id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition"
                            >
                              عرض النتيجة
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/student/attempts/${attempt.id}`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded transition"
                          >
                            مراجعة الأسئلة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
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

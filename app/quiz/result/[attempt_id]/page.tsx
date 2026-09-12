'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ResultData {
  score?: number;
  percentage?: number;
  total_questions?: number;
  correct_answers?: number;
  passed?: boolean;
  quiz?: { title?: string };
  [key: string]: any;
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attempt_id as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    const stored = localStorage.getItem('current_quiz');
    if (stored) setQuizTitle(JSON.parse(stored).title ?? '');

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/result/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (!res.ok) throw new Error();
        setResult(await res.json());
      } catch {
        setError('فشل في جلب نتيجة الاختبار');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل النتيجة...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-red-600 text-lg mb-6">{error ?? 'لا توجد بيانات'}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const correct = result.correct_answers;
  const total = result.total_questions;
  const wrong = total !== undefined && correct !== undefined ? total - correct : null;
  const percentage =
    correct !== undefined && total !== undefined && total > 0
      ? Math.round((correct / total) * 100)
      : null;
  const passed = percentage !== null ? percentage >= 50 : (result.passed ?? false);
  const backendScore = result.score ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12" dir="rtl">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Colored header */}
          <div className={`px-8 py-10 text-center ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="text-6xl mb-4">{passed ? '🎉' : '😔'}</div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {passed ? 'أحسنت! لقد اجتزت الاختبار' : 'لم تجتز الاختبار هذه المرة'}
            </h1>
            {quizTitle && <p className="text-white/80 text-sm mt-1">{quizTitle}</p>}
          </div>

          {/* Result */}
          <div className="px-8 py-8 text-center">
            {percentage !== null && (
              <div className="mb-2">
                <div className={`text-7xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  النسبة: {percentage}% &nbsp;|&nbsp; النقاط: {backendScore !== null ? Math.round(backendScore) : '—'}
                </p>
              </div>
            )}

            {/* Statistics */}
            {(correct !== undefined || wrong !== null) && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {correct !== undefined && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-3xl font-bold text-green-700">{correct}</p>
                    <p className="text-sm text-green-600 mt-1">إجابة صحيحة</p>
                  </div>
                )}
                {wrong !== null && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-3xl font-bold text-red-700">{wrong}</p>
                    <p className="text-sm text-red-600 mt-1">إجابة خاطئة</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

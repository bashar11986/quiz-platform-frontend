'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Choice {
  id: number;
  choice_text: string;
}

interface Question {
  id: number;
  question_text: string;
  choices: Choice[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = params.quiz_id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const completeQuiz = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const token = localStorage.getItem('access_token');
    const attemptId = localStorage.getItem('current_attempt_id');

    try {
      await fetch(`/api/attempts/${attemptId}/complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      router.push(`/quiz/result/${attemptId}`);
    } catch {
      setError('حدث خطأ أثناء إنهاء الاختبار');
      setSubmitting(false);
      submittedRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const attemptId = localStorage.getItem('current_attempt_id');

    if (!token) { router.push('/login'); return; }
    if (!attemptId) { router.push('/dashboard'); return; }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/questions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const qs: Question[] = Array.isArray(data) ? data : (data.questions ?? data.results ?? []);
        setQuestions(qs);

        const quizInfo = localStorage.getItem('current_quiz');
        if (quizInfo) {
          const quiz = JSON.parse(quizInfo);
          if (quiz.time_limit) setTimeLeft(quiz.time_limit * 60);
        }
      } catch {
        setError('فشل في تحميل الأسئلة. تحقق من اتصالك وحاول مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, router]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) completeQuiz();
      return;
    }
    const id = setInterval(() => setTimeLeft(t => (t !== null && t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timeLeft, completeQuiz]);

  const handleSelectAnswer = async (questionId: number, choiceId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));

    const token = localStorage.getItem('access_token');
    const attemptId = localStorage.getItem('current_attempt_id');

    try {
      await fetch('/api/attempts/submit-answer/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          attempt_id: parseInt(attemptId!),
          question_id: questionId,
          selected_choice_ids: [choiceId],
        }),
      });
    } catch {
      // Answer is saved locally
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل الأسئلة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-gray-500 text-lg mb-6">لا توجد أسئلة في هذا الاختبار حالياً.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const questionText = currentQuestion.question_text;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Fixed header */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <span className="font-semibold text-gray-700">
              السؤال {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-gray-400 text-sm mr-3">({answeredCount} أجبت)</span>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-lg ${
              timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-700'
            }`}>
              <span>⏱</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <p className="text-xl font-bold text-gray-800 leading-relaxed mb-8">
            {currentIndex + 1}. {questionText}
          </p>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => {
              const selected = answers[currentQuestion.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, choice.id)}
                  className={`w-full text-right px-5 py-4 rounded-xl border-2 font-medium transition-all duration-150 ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {choice.choice_text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← السابق
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                title={`السؤال ${i + 1}`}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i === currentIndex
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : answers[q.id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition"
            >
              التالي →
            </button>
          ) : (
            <button
              onClick={completeQuiz}
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow-sm hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? 'جاري الإرسال...' : 'إنهاء الاختبار ✓'}
            </button>
          )}
        </div>

        {/* Unanswered questions warning */}
        {currentIndex === questions.length - 1 && answeredCount < questions.length && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3 text-sm">
            تنبيه: لم تجب على {questions.length - answeredCount} سؤال بعد.
          </div>
        )}
      </main>
    </div>
  );
}

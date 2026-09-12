'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
}

interface Answer {
  question: number;
  question_text: string;
  question_type: 'mcq' | 'short_answer';
  points: number;
  selected_choice: number | null;
  selected_choice_ids: number[] | null;
  selected_choice_text: string | string[] | null;
  text_answer: string | null;
  is_correct: boolean | null;
  answered_at: string | null;
  all_choices: Choice[];
  correct_choices: Choice[];
  correct_answer_text: string | null;
  status?: 'unanswered' | 'correct' | 'incorrect';
}

interface TimeTaken {
  minutes: number;
  seconds: number;
  total_seconds: number;
}

interface AttemptDetail {
  id: number;
  quiz_title: string;
  quiz_category: string;
  instructor_name: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score: number;
  total_questions: number;
  total_points: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  start_time: string;
  end_time: string | null;
  time_taken: TimeTaken | null;
  attempt_number: number;
  answers: Answer[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AnswerStatusIcon({ status }: { status: 'correct' | 'incorrect' | 'unanswered' }) {
  if (status === 'correct') return <span className="text-green-600 font-bold text-lg">✓</span>;
  if (status === 'incorrect') return <span className="text-red-600 font-bold text-lg">✗</span>;
  return <span className="text-gray-400 text-lg">—</span>;
}

function QuestionCard({ answer, index, showCorrect }: { answer: Answer; index: number; showCorrect: boolean }) {
  // Backend omits per-answer status for completed attempts — derive it from is_correct + answered_at
  const derivedStatus: 'correct' | 'incorrect' | 'unanswered' =
    answer.status ??
    (answer.answered_at !== null
      ? answer.is_correct === true ? 'correct' : 'incorrect'
      : 'unanswered');

  const statusColors = {
    correct: 'border-green-300 bg-green-50',
    incorrect: 'border-red-300 bg-red-50',
    unanswered: 'border-gray-200 bg-white',
  };

  return (
    <div className={`rounded-lg border-2 p-5 ${statusColors[derivedStatus]}`}>
      {/* Question header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <p className="font-semibold text-gray-800 leading-relaxed">{answer.question_text}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <AnswerStatusIcon status={derivedStatus} />
          <span className="text-xs text-gray-500 bg-white border rounded px-2 py-0.5">
            {answer.points} {answer.points === 1 ? 'نقطة' : 'نقاط'}
          </span>
        </div>
      </div>

      {/* MCQ choices */}
      {answer.question_type === 'mcq' && (
        <div className="space-y-2 mr-10">
          {answer.all_choices.map((choice) => {
            const isSelected =
              choice.id === answer.selected_choice ||
              (Array.isArray(answer.selected_choice_ids) && answer.selected_choice_ids.includes(choice.id));
            const isCorrect = choice.is_correct;

            let choiceClass = 'border border-gray-200 bg-white text-gray-700';
            if (isSelected && derivedStatus === 'correct') {
              choiceClass = 'border-2 border-green-500 bg-green-100 text-green-800 font-medium';
            } else if (isSelected && derivedStatus === 'incorrect') {
              choiceClass = 'border-2 border-red-500 bg-red-100 text-red-800 font-medium';
            } else if (!isSelected && isCorrect && showCorrect && derivedStatus !== 'unanswered') {
              choiceClass = 'border-2 border-green-400 bg-green-50 text-green-700';
            }

            return (
              <div key={choice.id} className={`rounded-lg px-4 py-2.5 text-sm flex items-center justify-between ${choiceClass}`}>
                <span>{choice.choice_text}</span>
                <span className="text-xs flex-shrink-0 mr-2">
                  {isSelected && derivedStatus === 'correct' && '✓ إجابتك'}
                  {isSelected && derivedStatus === 'incorrect' && '✗ إجابتك'}
                  {!isSelected && isCorrect && showCorrect && derivedStatus !== 'unanswered' && '← الصحيحة'}
                </span>
              </div>
            );
          })}

          {derivedStatus === 'unanswered' && (
            <p className="text-sm text-gray-400 italic mt-2">لم تجب على هذا السؤال</p>
          )}
        </div>
      )}

      {/* Short answer */}
      {answer.question_type === 'short_answer' && (
        <div className="mr-10 space-y-2">
          {answer.text_answer ? (
            <div className="bg-white border rounded-lg px-4 py-2.5 text-sm">
              <span className="text-gray-500 text-xs block mb-1">إجابتك:</span>
              <span className="text-gray-800">{answer.text_answer}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">لم تجب على هذا السؤال</p>
          )}
          {showCorrect && answer.correct_answer_text && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
              <span className="text-green-600 text-xs block mb-1">الإجابة الصحيحة:</span>
              <span className="text-green-800">{answer.correct_answer_text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AttemptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.id as string;

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    fetch(`/api/student/attempts/${attemptId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setAttempt)
      .catch(() => setError('فشل في جلب تفاصيل المحاولة'))
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-xl text-gray-600 font-semibold">جاري تحميل التفاصيل...</p>
      </div>
    );
  }

  if (error || !attempt) {
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

  const percentage =
    attempt.total_questions > 0
      ? Math.round((attempt.correct_answers / attempt.total_questions) * 100)
      : 0;

  const isCompleted = attempt.status === 'completed';
  const statusLabel = { completed: 'مكتمل', in_progress: 'جارٍ', abandoned: 'متروك' }[attempt.status];
  const statusColor = { completed: 'bg-green-100 text-green-800', in_progress: 'bg-yellow-100 text-yellow-800', abandoned: 'bg-gray-100 text-gray-600' }[attempt.status];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">تفاصيل المحاولة #{attempt.attempt_number}</h1>
          <p className="text-sm text-gray-500">{attempt.quiz_title}</p>
        </div>
        <button
          onClick={() => router.push('/student/attempts')}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition"
        >
          سجل المحاولات
        </button>
      </nav>

      <main className="max-w-3xl mx-auto p-6">
        {/* Summary card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
              <span className="text-xs text-gray-400 mr-2">التصنيف: {attempt.quiz_category}</span>
            </div>
            <span className="text-xs text-gray-400">المحاضر: {attempt.instructor_name}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {isCompleted && (
              <div className={`rounded-lg p-3 ${percentage >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-2xl font-bold ${percentage >= 50 ? 'text-green-700' : 'text-red-700'}`}>{percentage}%</p>
                <p className="text-xs text-gray-500 mt-1">النسبة</p>
                <p className="text-xs text-gray-400 mt-0.5">النقاط: {Math.round(attempt.score)}</p>
              </div>
            )}
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{attempt.correct_answers}</p>
              <p className="text-xs text-gray-500 mt-1">صحيح</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">{attempt.incorrect_answers}</p>
              <p className="text-xs text-gray-500 mt-1">خاطئ</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-600">{attempt.unanswered_questions}</p>
              <p className="text-xs text-gray-500 mt-1">لم يُجَب</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mt-4 pt-4 border-t">
            <span><span className="font-medium">البدء:</span> {formatDate(attempt.start_time)}</span>
            {attempt.end_time && <span><span className="font-medium">الانتهاء:</span> {formatDate(attempt.end_time)}</span>}
            {attempt.time_taken && (
              <span><span className="font-medium">المدة:</span> {attempt.time_taken.minutes} د {attempt.time_taken.seconds} ث</span>
            )}
          </div>
        </div>

        {/* Questions */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          الأسئلة ({attempt.answers.length})
        </h2>
        <div className="space-y-4">
          {attempt.answers.map((answer, i) => (
            <QuestionCard
              key={answer.question}
              answer={answer}
              index={i}
              showCorrect={isCompleted}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

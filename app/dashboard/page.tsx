'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  // حالات لتخزين البيانات
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ en: string; ar: string } | null>(null);

  const errorTranslations: Record<string, string> = {
    'Maximum attempts reached': 'لقد استنفدت جميع محاولاتك لهذا الاختبار',
    'No Quiz matches the given query.': 'الاختبار غير موجود أو غير متاح',
    'Authentication credentials were not provided.': 'يرجى تسجيل الدخول أولاً',
    'Quiz is not published': 'هذا الاختبار غير منشور بعد',
  };

  const showToast = (msg: string) => {
    const ar = errorTranslations[msg] ?? msg;
    const en = errorTranslations[msg] ? msg : '';
    setToast({ en, ar });
    setTimeout(() => setToast(null), 3000);
  };

  // دالة لجلب البيانات من السيرفر
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      // إذا لم يكن هناك توكن، قم بتوجيه المستخدم لتسجيل الدخول
      router.push('/login');
      return;
    }

    try {
      // جلب بيانات الملف الشخصي والاختبارات معاً
      const [profileRes, quizzesRes] = await Promise.all([
        fetch('/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }),
        fetch('/api/quizzes/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        })
      ]);

      if (!profileRes.ok || !quizzesRes.ok) {
        throw new Error('فشل في جلب البيانات، قد يكون التوكن منتهي الصلاحية.');
      }

      const profileData = await profileRes.json();
      const quizzesData = await quizzesRes.json();

      setProfile(profileData);
      setQuizzes(quizzesData.results); // نأخذ مصفوفة results لأن السيرفر يستخدم Pagination
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء جلب البيانات. (قد تكون مشكلة CORS التي تحدثنا عنها سابقاً)');
    } finally {
      setLoading(false);
    }
  };

  // تنفيذ جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartQuiz = async (quiz: any) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ quiz: quiz.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.error || data.detail || Object.values(data).flat().join(' ');
        showToast(msg || 'فشل في بدء الاختبار');
        return;
      }
      localStorage.setItem('current_quiz', JSON.stringify(quiz));
      localStorage.setItem('current_attempt_id', String(data.id ?? data.attempt_id ?? ''));
      router.push(`/quiz/${quiz.id}`);
    } catch {
      showToast('حدث خطأ في الاتصال بالخادم');
    }
  };

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-xl text-gray-600 font-semibold">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* شريط التنقل (Navbar) */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">منصة الاختبارات</h1>
          {profile && profile.specialization && (
            <p className="text-sm text-gray-500">التخصص: {profile.specialization}</p>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium transition"
        >
          تسجيل الخروج
        </button>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto p-6">
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">الاختبارات المتاحة</h2>
            
            {quizzes.length === 0 ? (
              <p className="text-gray-500 text-center py-10">لا يوجد اختبارات متاحة حالياً.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {quiz.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <p className="flex items-center">
                        <span className="font-medium ml-2">الوقت المسموح:</span> {quiz.time_limit} دقيقة
                      </p>
                      <p className="flex items-center">
                        <span className="font-medium ml-2">المحاولات المسموحة:</span> {quiz.attempts_allowed}
                      </p>
                      <p className="flex items-center">
                        <span className="font-medium ml-2">الأسئلة:</span> {quiz.question_count}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                      بدء الاختبار
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
          <div className="bg-red-600 text-white text-center px-8 py-4 rounded-xl shadow-2xl w-full max-w-2xl">
            {toast.en && <p className="text-sm opacity-80">{toast.en}</p>}
            <p className="font-bold text-base">{toast.ar}</p>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
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

  const fetchDashboardData = async () => {
    let token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No access token found. Redirecting to login.');
      router.push('/login');
      return;
    }

    try {
      const fetchOptions = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      };

      // Fetch from local proxy to bypass CORS
      let [profileRes, quizzesRes] = await Promise.all([
        fetch('/api/auth/profile/', fetchOptions),
        fetch('/api/quizzes/', fetchOptions)
      ]);

      if (profileRes.status === 401 || quizzesRes.status === 401) {
        console.warn('Access token expired. Attempting silent refresh...');
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available in local storage.');
        }

        const refreshRes = await fetch('/api/auth/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          console.log('Session refreshed successfully. Retrying previous requests...');
          
          localStorage.setItem('access_token', data.access);
          token = data.access;
          fetchOptions.headers['Authorization'] = `Bearer ${token}`;

          [profileRes, quizzesRes] = await Promise.all([
            fetch('/api/auth/profile/', fetchOptions),
            fetch('/api/quizzes/', fetchOptions)
          ]);
        } else {
          console.warn('Refresh token is invalid or expired. Terminating session.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
      }

      if (!profileRes.ok || !quizzesRes.ok) {
        throw new Error(`Data fetch failed. Profile status: ${profileRes.status}, Quizzes status: ${quizzesRes.status}`);
      }

      const profileData = await profileRes.json();
      const quizzesData = await quizzesRes.json();

      setProfile(profileData);
      setQuizzes(quizzesData.results || quizzesData); 
    } catch (err: any) {
      console.error('Error in fetchDashboardData:', err);
      setError('حدث خطأ أثناء جلب البيانات. تأكد من اتصالك بالخادم.');
    } finally {
      setLoading(false);
    }
  };

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
        console.warn(`Failed to start quiz ID: ${quiz.id}`);
        const msg = data.error || data.detail || Object.values(data).flat().join(' ');
        showToast(msg || 'فشل في بدء الاختبار');
        return;
      }
      
      console.log(`Quiz ID: ${quiz.id} started successfully.`);
      localStorage.setItem('current_quiz', JSON.stringify(quiz));
      localStorage.setItem('current_attempt_id', String(data.id ?? data.attempt_id ?? ''));
      router.push(`/quiz/${quiz.id}`);
    } catch (error) {
      console.error('Network error while starting the quiz:', error);
      showToast('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    // Clear the accessToken cookie used by middleware
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.location.href = '/login';
  };

  const handleAdminNavigation = () => {
      router.push('/admin/quizzes/create');
  };

  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : '';
  const userRole = rawRole?.toLowerCase();

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
        <div>
          <h1 className="text-2xl font-bold text-blue-600">منصة الاختبارات</h1>
          {profile && profile.specialization && (
            <p className="text-sm text-gray-500">التخصص: {profile.specialization}</p>
          )}
        </div>
        <div className="flex gap-4 items-center">
          {(userRole === 'admin' || userRole === 'instructor') && (
            <>
              <button
                onClick={() => router.push('/admin/quizzes')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
              >
                إدارة الاختبارات
              </button>
              <button
                onClick={handleAdminNavigation}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition"
              >
                إضافة اختبار جديد
              </button>
            </>
          )}
          <button
            onClick={() => router.push('/files')}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-md font-medium transition"
          >
            رفع الملفات
          </button>
          <button
            onClick={() => router.push('/student/attempts')}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition"
          >
            سجل محاولاتي
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </nav>

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
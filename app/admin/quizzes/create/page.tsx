'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../../components/ToastProvider';

export default function CreateQuizPage() {
    const [title, setTitle] = useState('');
    const [allowedTime, setAllowedTime] = useState(45);
    const [maxAttempts, setMaxAttempts] = useState(3);
    const router = useRouter();
    const { showToast } = useToast();

    // Base URL for the Django backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting to create a new quiz...");

        // Retrieve token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirecting to login.");
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            router.push('/login');
            return;
        }

        // Prepare payload matching Django's expected schema
        const quizData = {
            title: title,
            description: title, // Fallback to title if description input is missing
            category: "عام", // Fallback category
            time_limit: allowedTime,
            attempts_allowed: maxAttempts,
            is_published: false
        };

        try {
            // Direct request to Django backend with Authorization header
            // const response = await fetch(`${API_BASE_URL}/api/quizzes/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(quizData),
            // });

            const response = await fetch('/api/quizzes/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(quizData),
});

            if (response.ok) {
                const data = await response.json();
                console.log("Quiz created successfully:", data);
                showToast('تم إنشاء الاختبار بنجاح', 'success');
                // Redirect to add questions page using the new quiz ID
                router.push(`/admin/quizzes/${data.id}/add-question`);
            } else {
                const errorData = await response.json();
                console.error("Failed to create quiz. Backend response:", errorData);
                showToast('حدث خطأ أثناء إنشاء الاختبار', 'error');
            }
        } catch (error) {
            console.error("Network error while creating quiz:", error);
            showToast('خطأ في الاتصال بالخادم', 'error');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto" dir="rtl">
            <h1 className="text-3xl font-bold mb-6">إضافة اختبار جديد</h1>
            <form onSubmit={handleCreateQuiz} className="bg-white p-6 rounded shadow-md space-y-4">
                <div>
                    <label className="block mb-1 font-semibold">اسم الاختبار</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                        required 
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold">الوقت المسموح (بالدقائق)</label>
                    <input 
                        type="number" 
                        value={allowedTime}
                        onChange={(e) => setAllowedTime(Number(e.target.value))}
                        className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required 
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold">عدد المحاولات المسموحة</label>
                    <input 
                        type="number" 
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                        className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded mt-4 hover:bg-blue-700 transition">
                    حفظ ومتابعة لإضافة الأسئلة
                </button>
            </form>
        </div>
    );
}
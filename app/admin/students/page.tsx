'use client';

import { useState } from 'react';
import { useToast } from '../../../components/ToastProvider';

export default function ResetAttemptsPage() {
    const [studentId, setStudentId] = useState('');
    const [quizId, setQuizId] = useState('');
    const { showToast } = useToast();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Resetting attempts for Student ID: ${studentId}, Quiz ID: ${quizId}`);

        try {
            // NOTE: Replace this endpoint with the exact URL provided by your Django backend for resetting attempts
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instructor/attempts/reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ student_id: studentId, quiz_id: quizId }),
            });

            if (response.ok) {
                console.log("Attempts reset successfully");
                showToast('تم تصفير المحاولات بنجاح', 'success');
            } else {
                console.error("Failed to reset attempts");
                showToast('حدث خطأ أثناء تصفير المحاولات', 'error');
            }
        } catch (error) {
            console.error("Network error during reset operation:", error);
            showToast('خطأ في الاتصال بالخادم', 'error');
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-red-600">تصفير محاولات طالب</h1>
            <form onSubmit={handleReset} className="bg-white p-6 rounded shadow-md space-y-4">
                <div>
                    <label className="block mb-1">رقم تعريف الطالب (Student ID)</label>
                    <input 
                        type="text" 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full border p-2 rounded"
                        required 
                    />
                </div>
                <div>
                    <label className="block mb-1">رقم تعريف الاختبار (Quiz ID)</label>
                    <input 
                        type="text" 
                        value={quizId}
                        onChange={(e) => setQuizId(e.target.value)}
                        className="w-full border p-2 rounded"
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-4">
                    تأكيد التصفير
                </button>
            </form>
        </div>
    );
}
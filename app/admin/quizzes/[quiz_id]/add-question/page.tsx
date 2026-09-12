'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '../../../../../components/ToastProvider';

export default function AddQuestionPage() {
    const params = useParams();
    const quizId = params.quiz_id as string;
    const router = useRouter();
    const { showToast } = useToast();

    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<'mcq' | 'short_answer'>('mcq');
    const [points, setPoints] = useState(1);
    const [choices, setChoices] = useState(['', '', '', '']);
    const [correctChoiceIndex, setCorrectChoiceIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleAddQuestion = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('access_token');
        const questionData: Record<string, unknown> = {
            question_text: questionText,
            question_type: questionType,
            points,
            quiz: Number(quizId),
            choices: choices
                .filter((c) => c.trim() !== '')
                .map((choice, index) => ({
                    choice_text: choice,
                    is_correct: index === correctChoiceIndex,
                })),
        };

        try {
            const response = await fetch('/api/questions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                showToast('تمت إضافة السؤال بنجاح', 'success');
                setQuestionText('');
                setChoices(['', '', '', '']);
                setCorrectChoiceIndex(0);
            } else {
                const data = await response.json().catch(() => ({}));
                const msg = data.detail || data.error || Object.values(data).flat().join(' ');
                showToast(msg || 'فشل إضافة السؤال', 'error');
            }
        } catch {
            showToast('خطأ في الاتصال بالخادم', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">إضافة سؤال للاختبار</h1>
                <button
                    onClick={() => router.back()}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition"
                >
                    رجوع
                </button>
            </div>

            <form onSubmit={handleAddQuestion} className="bg-white p-6 rounded-lg shadow-md space-y-5">
                <div>
                    <label className="block mb-2 font-semibold text-gray-700">نص السؤال</label>
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">نوع السؤال</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value as 'mcq' | 'short_answer')}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="mcq">اختيار من متعدد</option>
                            <option value="short_answer">إجابة قصيرة</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">النقاط</label>
                        <input
                            type="number"
                            min={1}
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block font-semibold text-gray-700">الخيارات (حدد الإجابة الصحيحة)</label>
                    {choices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="correctChoice"
                                checked={correctChoiceIndex === index}
                                onChange={() => setCorrectChoiceIndex(index)}
                                className="w-5 h-5 accent-green-600"
                            />
                            <input
                                type="text"
                                value={choice}
                                onChange={(e) => {
                                    const updated = [...choices];
                                    updated[index] = e.target.value;
                                    setChoices(updated);
                                }}
                                className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`الخيار ${index + 1}`}
                                required
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 rounded-lg transition ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {loading ? 'جاري الإضافة...' : 'إضافة السؤال'}
                </button>
            </form>
        </div>
    );
}

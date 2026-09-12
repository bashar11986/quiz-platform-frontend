'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadedFile {
  id: number;
  user: number;
  file: string;
  extracted_text: string;
  uploaded_at: string;
}

const EXT_STYLE: Record<string, string> = {
  pdf:  'bg-red-100 text-red-700',
  docx: 'bg-blue-100 text-blue-700',
  doc:  'bg-blue-100 text-blue-700',
  txt:  'bg-gray-100 text-gray-600',
  xlsx: 'bg-green-100 text-green-700',
  pptx: 'bg-orange-100 text-orange-700',
};

function getFileName(url: string) {
  const raw = decodeURIComponent(url.split('/').pop() || url);
  // strip the random suffix added by Django (e.g. f2_uySM0Xu.docx → f2.docx)
  return raw.replace(/_[A-Za-z0-9]{6,10}(\.\w+)$/, '$1');
}
function getExt(url: string) {
  return url.split('.').pop()?.toLowerCase() || '';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function translateUploadError(raw: string): string {
  if (!raw) return '';
  if (raw.includes('PyPDF2') || raw.includes('PdfReader') || raw.includes('extracting PDF'))
    return 'لا يمكن معالجة ملفات PDF حالياً بسبب مشكلة في الخادم. جرب رفع ملف DOCX أو TXT.';
  if (raw.includes('permission') || raw.includes('allowed'))
    return 'نوع الملف غير مدعوم. الأنواع المسموح بها: PDF, DOCX, TXT, XLSX, PPTX.';
  if (raw.includes('size') || raw.includes('too large'))
    return 'حجم الملف كبير جداً.';
  return raw;
}

export default function FilesPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles]           = useState<UploadedFile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadErr, setUploadErr]   = useState<string | null>(null);
  const [fetchErr, setFetchErr]     = useState<string | null>(null);

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { router.push('/login'); return; }
    fetch('/api/files/', {
      headers: { Authorization: `Bearer ${token()}`, Accept: 'application/json' },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setFiles(d.results ?? d))
      .catch(() => setFetchErr('فشل في جلب الملفات'))
      .finally(() => setLoading(false));
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    setUploadErr(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/files/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        // d.file can be a string or an array depending on the error type
        const rawErr = Array.isArray(d.file) ? d.file[0] : (d.file ?? d.detail ?? '');
        const msg = translateUploadError(rawErr);
        throw new Error(msg || 'فشل رفع الملف');
      }
      const created: UploadedFile = await res.json();
      setFiles(prev => [created, ...prev]);
    } catch (e: any) {
      setUploadErr(e.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/files/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok && res.status !== 204) throw new Error();
      setFiles(prev => prev.filter(f => f.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      alert('فشل حذف الملف');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Nav */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">رفع الملفات</h1>
          <p className="text-xs text-gray-400 mt-0.5">رفع وإدارة الملفات واستخراج النصوص تلقائياً</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition text-sm"
        >
          الرئيسية
        </button>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center select-none transition-all duration-150 ${
            uploading
              ? 'opacity-60 cursor-wait border-blue-300 bg-blue-50'
              : dragOver
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-600 font-semibold text-lg">جاري رفع الملف وتحليله...</p>
              <p className="text-gray-400 text-sm">قد يستغرق ذلك بضع ثوانٍ</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">📂</span>
              <p className="text-gray-700 font-bold text-lg">اسحب الملف هنا أو انقر للاختيار</p>
              <p className="text-gray-400 text-sm">PDF · DOCX · TXT · XLSX · PPTX</p>
            </div>
          )}
        </div>

        {/* Errors */}
        {uploadErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {uploadErr}
          </div>
        )}
        {fetchErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {fetchErr}
          </div>
        )}

        {/* Files list */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-3">
            الملفات المرفوعة
            <span className="text-gray-400 font-normal text-sm mr-2">({files.length})</span>
          </h2>

          {files.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-3">📁</span>
              لا توجد ملفات مرفوعة بعد
            </div>
          ) : (
            <div className="space-y-3">
              {files.map(file => {
                const ext       = getExt(file.file);
                const badge     = EXT_STYLE[ext] || 'bg-gray-100 text-gray-600';
                const expanded  = expandedId === file.id;
                const isDeleting = deletingId === file.id;

                return (
                  <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      {/* Extension badge */}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase flex-shrink-0 ${badge}`}>
                        {ext || '?'}
                      </span>

                      {/* Name + date */}
                      <div className="flex-1 min-w-0">
                        <a
                          href={file.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-800 hover:text-blue-600 transition truncate block"
                          title={getFileName(file.file)}
                        >
                          {getFileName(file.file)}
                        </a>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(file.uploaded_at)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {file.extracted_text ? (
                          <button
                            onClick={() => setExpandedId(expanded ? null : file.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition"
                          >
                            {expanded ? 'إخفاء النص ▲' : 'عرض النص ▼'}
                          </button>
                        ) : (
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-400">
                            لا يوجد نص
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'حذف'}
                        </button>
                      </div>
                    </div>

                    {/* Extracted text panel */}
                    {expanded && file.extracted_text && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-semibold text-gray-500">النص المستخرج من الملف:</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(file.extracted_text)}
                            className="text-xs text-blue-500 hover:text-blue-700 transition"
                          >
                            نسخ
                          </button>
                        </div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto bg-white rounded-lg p-3 border border-gray-200">
                          {file.extracted_text}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

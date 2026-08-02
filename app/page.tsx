import { redirect } from 'next/navigation';

export default function Home() {
  // إعادة توجيه المستخدم تلقائياً إلى مسار لوحة التحكم
  redirect('/dashboard');
}
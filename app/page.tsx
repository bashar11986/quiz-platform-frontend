import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect the user to the dashboard route
  redirect('/dashboard');
}
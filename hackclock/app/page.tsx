import { redirect } from 'next/navigation';

export default function Home() {
  // Instantly push any traffic hitting the root domain straight to the dashboard.
  // The AdminLayout will catch them and force a login if they don't have a secure session.
  redirect('/dashboard');
}

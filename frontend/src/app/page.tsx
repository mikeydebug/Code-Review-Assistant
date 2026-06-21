import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function RootPage() {
  // Try to determine auth state from cookies, but Zustand persists in localStorage.
  // We'll redirect to a protected route (dashboard) which has a client-side layout auth guard.
  redirect('/projects');
}

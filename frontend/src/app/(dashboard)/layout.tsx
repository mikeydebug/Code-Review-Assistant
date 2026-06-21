'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(useAuthStore.persist.hasHydrated());
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !token && !pathname.includes('/login') && !pathname.includes('/register')) {
      router.push('/login');
    }
  }, [isHydrated, token, router, pathname]);

  if (!isHydrated) return null;
  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative flex flex-col">{children}</main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit2, Settings, LogOut, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = [
    { name: 'Projects', href: '/projects', icon: FolderGit2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f172a]/40 backdrop-blur-md border-r border-indigo-500/20">
      <div className="p-6">
        <Link href="/projects" className="flex items-center gap-2 text-xl font-bold text-slate-100 hover:text-white transition-colors">
          <span className="font-bold text-lg tracking-tight">AI Code Reviewer</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/30 rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className={cn(
                'relative z-10 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'text-indigo-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              )}>
                <Icon size={18} />
                {link.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-indigo-500/20 bg-[#020617]/30">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <Avatar className="h-9 w-9 bg-slate-800 border border-slate-700">
            <AvatarFallback className="bg-transparent text-indigo-400 font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

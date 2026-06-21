import { ReactNode } from 'react';

export function DashboardShell({ children, header, scrollable = true }: { children: ReactNode; header?: ReactNode; scrollable?: boolean }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
      {header && (
        <header className="h-16 border-b border-indigo-500/20 flex items-center px-8 shrink-0 bg-[#0f172a]/40 backdrop-blur-md z-10">
          {header}
        </header>
      )}
      <main className={`flex-1 p-8 ${scrollable ? 'overflow-auto' : 'overflow-hidden flex flex-col min-h-0'}`}>
        {children}
      </main>
    </div>
  );
}

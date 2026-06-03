'use client';

import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh overflow-hidden" style={{ background: '#070b14' }}>
      <main
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '80px' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

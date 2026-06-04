'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

function IconHome({ size = 23, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/>
    </svg>
  );
}
function IconGuide({ size = 23, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 4v14"/><path d="M12.5 8.5h3M12.5 12h3"/>
    </svg>
  );
}
function IconChart({ size = 23, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l3.5-4 3 2.5L20 8"/>
    </svg>
  );
}
function IconUser({ size = 23, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>
    </svg>
  );
}
function IconPlus({ size = 28, sw = 2.4 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}

const LEFT_TABS = [
  { id: '/', label: 'Home', Icon: IconHome },
  { id: '/exercises', label: 'Guide', Icon: IconGuide },
];
const RIGHT_TABS = [
  { id: '/progress', label: 'Progress', Icon: IconChart },
  { id: '/profile', label: 'Profile', Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setAddOpen } = useApp();

  const isActive = (id: string) =>
    id === '/' ? pathname === '/' : pathname.startsWith(id);

  return (
    <div className="bottom-nav">
      {LEFT_TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item${isActive(id) ? ' active' : ''}`}
          onClick={() => router.push(id)}
        >
          <Icon size={23} sw={isActive(id) ? 2.1 : 1.8} />
          <span>{label}</span>
        </button>
      ))}

      {/* Center FAB */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setAddOpen(true)}
          className="tap"
          style={{
            width: 58, height: 58, borderRadius: 20, marginTop: -24, border: 'none', cursor: 'pointer',
            background: 'var(--ember)', color: '#1a0a06',
            boxShadow: '0 10px 26px -6px var(--ember-glow), 0 0 0 6px var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <IconPlus size={28} sw={2.4} />
        </button>
      </div>

      {RIGHT_TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item${isActive(id) ? ' active' : ''}`}
          onClick={() => router.push(id)}
        >
          <Icon size={23} sw={isActive(id) ? 2.1 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

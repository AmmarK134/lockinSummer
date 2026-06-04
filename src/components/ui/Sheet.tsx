'use client';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Sheet({ open, onClose, children, title }: SheetProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', animation: 'screen-in .2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', background: 'var(--surface)', borderTopLeftRadius: 28, borderTopRightRadius: 28, border: '1px solid var(--line)', borderBottom: 'none', padding: '12px 18px 34px', animation: 'sheet-up .3s cubic-bezier(.22,.61,.36,1)' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--surface-3)', margin: '2px auto 14px' }} />
        {title && <div className="h-display" style={{ fontSize: 24, marginBottom: 14 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

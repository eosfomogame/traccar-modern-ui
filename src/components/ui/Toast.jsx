import { Bell } from 'lucide-react';

export default function Toast({ message }) {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-card animate-slide-up pointer-events-auto min-w-[260px] max-w-[360px]">
      <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-brand-400" />
      </div>
      <p className="text-sm text-white leading-snug">{message}</p>
    </div>
  );
}

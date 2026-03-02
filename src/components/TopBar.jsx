import { useNavigate } from 'react-router-dom';
import { Menu, Satellite, Settings, Bell } from 'lucide-react';

export default function TopBar({ sidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-[60px]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="glass rounded-xl w-10 h-10 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
          <Satellite className="w-4 h-4 text-brand-400" />
          <span className="text-white font-semibold text-sm tracking-tight">Traccar</span>
          <span className="text-surface-400 text-sm font-normal">Modern</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="glass rounded-xl w-10 h-10 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95 relative">
          <Bell className="w-4 h-4 text-white" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-alarm rounded-full animate-pulse" />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="glass rounded-xl w-10 h-10 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

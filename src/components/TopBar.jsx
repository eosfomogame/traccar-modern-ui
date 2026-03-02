import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Satellite, Settings, Bell, LogOut } from 'lucide-react';
import { sessionActions, eventsActions } from '../store';

export default function TopBar({ sidebarOpen, onToggleSidebar, onEventsClick }) {
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const events      = useSelector((s) => s.events.items);
  const socket      = useSelector((s) => s.session.socket);
  const serverName  = useSelector((s) => s.session.server?.name);
  const unreadCount = events.length;

  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    dispatch(sessionActions.updateUser(null));
    dispatch(eventsActions.clear());
    navigate('/login', { replace: true });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 h-[60px] pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <button onClick={onToggleSidebar}
          className="glass rounded-xl w-9 h-9 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95">
          <Menu className="w-4 h-4 text-white" />
        </button>
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-white font-semibold text-sm">{serverName || 'Traccar'}</span>
          <div className={`w-1.5 h-1.5 rounded-full ml-1 ${socket ? 'bg-online animate-pulse' : 'bg-alarm'}`}
            title={socket ? 'Connected' : 'Disconnected'} />
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button onClick={() => { onEventsClick(); dispatch(eventsActions.clear()); }}
          className="glass rounded-xl w-9 h-9 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95 relative">
          <Bell className="w-4 h-4 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-alarm rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => navigate('/settings')}
          className="glass rounded-xl w-9 h-9 flex items-center justify-center hover:bg-surface-700/60 transition-all active:scale-95">
          <Settings className="w-4 h-4 text-white" />
        </button>
        <button onClick={handleLogout}
          className="glass rounded-xl w-9 h-9 flex items-center justify-center hover:bg-alarm/20 transition-all active:scale-95">
          <LogOut className="w-4 h-4 text-surface-400 hover:text-alarm" />
        </button>
      </div>
    </div>
  );
}

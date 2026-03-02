import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  PanelLeftOpen, PanelLeftClose, Bell, Settings,
  LogOut, Satellite, Wifi, WifiOff
} from 'lucide-react';
import { sessionActions, eventsActions } from '../store';

const TopBar = ({ sidebarOpen, onToggleSidebar, onEventsClick }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.session.user);
  const socket    = useSelector((s) => s.session.socket);
  const events    = useSelector((s) => s.events.items);
  const unread    = events.length;

  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    dispatch(sessionActions.updateUser(null));
    dispatch(eventsActions.deleteAll());
    navigate('/login', { replace: true });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center h-14 px-3 gap-2 glass border-b border-white/5">
      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 rounded-xl bg-surface-800/80 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all"
      >
        {sidebarOpen
          ? <PanelLeftClose className="w-4 h-4" />
          : <PanelLeftOpen  className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
          <Satellite className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white hidden sm:block">Traccar</span>
      </div>

      {/* Connection indicator */}
      <div className="flex items-center gap-1.5">
        {socket
          ? <Wifi    className="w-3.5 h-3.5 text-online" />
          : <WifiOff className="w-3.5 h-3.5 text-alarm animate-pulse" />}
        <span className="text-[10px] text-surface-500 hidden sm:block">
          {socket ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      {/* User name */}
      {user && (
        <span className="text-xs text-surface-400 hidden md:block max-w-[120px] truncate">
          {user.name || user.email}
        </span>
      )}

      {/* Events bell */}
      <button
        onClick={onEventsClick}
        className="relative w-9 h-9 rounded-xl bg-surface-800/80 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-alarm text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Settings */}
      <button
        onClick={() => navigate('/settings')}
        className="w-9 h-9 rounded-xl bg-surface-800/80 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-9 h-9 rounded-xl bg-surface-800/80 hover:bg-alarm/20 flex items-center justify-center text-surface-400 hover:text-alarm transition-all"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TopBar;

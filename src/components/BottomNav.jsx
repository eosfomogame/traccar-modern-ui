import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Clock, Bell, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';

const ITEMS = [
  { path: '/',        icon: Map,      label: 'Map' },
  { path: '/replay',  icon: Clock,    label: 'Replay' },
  { path: '/events',  icon: Bell,     label: 'Events' },
  { path: '/settings',icon: Settings, label: 'Settings' },
];

const BottomNav = () => {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const unread    = useSelector((s) => s.events.items.length);

  return (
    <nav className="relative z-40 flex items-center glass border-t border-white/5 h-16 px-2 md:hidden">
      {ITEMS.map(({ path, icon: Icon, label }) => {
        const active = pathname === path || (path !== '/' && pathname.startsWith(path));
        const badge  = label === 'Events' && unread > 0;
        return (
          <button key={path} onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
              active ? 'text-brand-400' : 'text-surface-500 hover:text-surface-300'
            }`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-alarm text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
            {active && <span className="absolute bottom-1 w-1 h-1 bg-brand-400 rounded-full" />}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

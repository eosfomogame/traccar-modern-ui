import { useNavigate, useLocation } from 'react-router-dom';
import { Map, FileText, Settings, Repeat2 } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',        label: 'Map',      icon: Map       },
  { path: '/replay',  label: 'Replay',   icon: Repeat2   },
  { path: '/events',  label: 'Events',   icon: FileText  },
  { path: '/settings',label: 'Settings', icon: Settings  },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  // Only show on mobile
  return (
    <div className="md:hidden flex items-center bg-surface-900 border-t border-white/5" style={{ height: 56 }}>
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path || (path !== '/' && pathname.startsWith(path));
        return (
          <button key={path} onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? 'text-brand-400' : 'text-surface-600 hover:text-surface-300'
            }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Server, Smartphone, Bell,
  ExternalLink, ChevronRight, LogOut, Shield
} from 'lucide-react';
import { sessionActions, eventsActions } from '../store';

const Section = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-4 mb-2">{title}</p>
    <div className="bg-surface-800/60 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const Item = ({ icon: Icon, label, sublabel, onClick, danger, external, value }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
    danger ? 'hover:bg-alarm/10' : 'hover:bg-surface-700/50'
  }`}>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
      danger ? 'bg-alarm/10' : 'bg-surface-700'
    }`}>
      <Icon className={`w-4 h-4 ${danger ? 'text-alarm' : 'text-surface-300'}`} />
    </div>
    <div className="flex-1 text-left">
      <p className={`text-sm font-medium ${danger ? 'text-alarm' : 'text-white'}`}>{label}</p>
      {sublabel && <p className="text-xs text-surface-500 mt-0.5">{sublabel}</p>}
    </div>
    {value && <span className="text-xs text-surface-500">{value}</span>}
    {external ? <ExternalLink className="w-3.5 h-3.5 text-surface-600" /> : <ChevronRight className="w-4 h-4 text-surface-600" />}
  </button>
);

const SettingsPage = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const user       = useSelector((s) => s.session.user);
  const server     = useSelector((s) => s.session.server);

  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    dispatch(sessionActions.updateUser(null));
    dispatch(eventsActions.deleteAll());
    navigate('/login', { replace: true });
  };

  const traccarBase = window.location.origin;

  return (
    <div className="flex flex-col h-full bg-surface-950 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 glass border-b border-white/5 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-white font-semibold text-sm">Settings</p>
          <p className="text-surface-400 text-xs">{server?.name || 'Traccar'}</p>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-4 mt-4 mb-2 glass rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/30 flex items-center justify-center">
            <span className="text-xl font-bold text-brand-400">{(user.name || user.email || '?')[0].toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name || 'User'}</p>
            <p className="text-surface-400 text-xs truncate">{user.email}</p>
            {user.administrator && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded-full mt-1">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-0 pt-4 pb-8">
        <Section title="Account">
          <Item icon={User}   label="My Profile"     sublabel="Edit your account details"
            onClick={() => window.open(`${traccarBase}/modern/settings/user/${user?.id}`, '_blank')} external />
          <Item icon={Bell}   label="Notifications"  sublabel="Manage alerts & alarms"
            onClick={() => window.open(`${traccarBase}/modern/settings/notifications`, '_blank')} external />
        </Section>

        <Section title="Fleet">
          <Item icon={Smartphone} label="Devices"   sublabel={`Manage your GPS devices`}
            onClick={() => window.open(`${traccarBase}/modern/settings/devices`, '_blank')} external />
          <Item icon={Server}     label="Server"    sublabel="Server configuration"
            onClick={() => window.open(`${traccarBase}/modern/settings/server`, '_blank')} external />
        </Section>

        <Section title="Advanced Traccar Settings">
          <Item icon={ExternalLink} label="Open full Traccar UI"
            sublabel="Access all settings, reports, geofences…"
            onClick={() => window.open(traccarBase, '_blank')} external />
        </Section>

        <Section title="Session">
          <Item icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Server, Smartphone, Bell,
  ExternalLink, ChevronRight, LogOut, Shield, Globe
} from 'lucide-react';
import { sessionActions, eventsActions } from '../store';
import { getServerUrl, apiFetch } from '../api';

const Section = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-4 mb-2">{title}</p>
    <div className="bg-surface-800/60 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const Item = ({ icon: Icon, label, sublabel, onClick, danger, external, value }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left ${
      danger ? 'hover:bg-alarm/10' : 'hover:bg-surface-700/50'
    }`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
      danger ? 'bg-alarm/10' : 'bg-surface-700'
    }`}>
      <Icon className={`w-4 h-4 ${danger ? 'text-alarm' : 'text-surface-300'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium ${danger ? 'text-alarm' : 'text-white'}`}>{label}</p>
      {sublabel && <p className="text-xs text-surface-500 mt-0.5 truncate">{sublabel}</p>}
    </div>
    {value && <span className="text-xs text-surface-500 flex-shrink-0">{value}</span>}
    {external
      ? <ExternalLink className="w-3.5 h-3.5 text-surface-600 flex-shrink-0" />
      : <ChevronRight className="w-4 h-4 text-surface-600 flex-shrink-0" />}
  </button>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.session.user);
  const server   = useSelector((s) => s.session.server);

  // ✅ Use the saved Traccar server URL, not window.location.origin
  const traccarBase = getServerUrl();

  const handleLogout = async () => {
    await apiFetch('/api/session', { method: 'DELETE' });
    dispatch(sessionActions.updateUser(null));
    dispatch(eventsActions.deleteAll());
    navigate('/login', { replace: true });
  };

  // Open a path on the actual Traccar server
  const openTraccar = (path = '') => window.open(`${traccarBase}${path}`, '_blank');

  return (
    <div className="flex flex-col h-full bg-surface-950 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 glass border-b border-white/5 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Settings</p>
          <p className="text-surface-400 text-xs truncate">{server?.name || traccarBase}</p>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-4 mt-4 mb-2 glass rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-brand-400">
              {(user.name || user.email || '?')[0].toUpperCase()}
            </span>
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

      <div className="pt-4 pb-8">
        {/* Account */}
        <Section title="Account">
          <Item icon={User} label="My Profile" sublabel="Edit name, email, password"
            onClick={() => openTraccar(`/modern/settings/user/${user?.id}`)} external />
          <Item icon={Bell} label="Notifications" sublabel="Alerts, alarms & push settings"
            onClick={() => openTraccar('/modern/settings/notifications')} external />
        </Section>

        {/* Fleet */}
        <Section title="Fleet">
          <Item icon={Smartphone} label="Devices" sublabel="Add / manage GPS trackers"
            onClick={() => openTraccar('/modern/settings/devices')} external />
          {user?.administrator && (
            <Item icon={Server} label="Server Config" sublabel="Traccar server settings"
              onClick={() => openTraccar('/modern/settings/server')} external />
          )}
        </Section>

        {/* Server URL — change without logging out */}
        <Section title="Connection">
          <Item icon={Globe} label="Server URL"
            sublabel={traccarBase}
            onClick={() => navigate('/login')}
            value="Change" />
        </Section>

        {/* Full UI */}
        <Section title="Advanced">
          <Item icon={ExternalLink} label="Open full Traccar UI"
            sublabel="Reports, geofences, drivers…"
            onClick={() => openTraccar('/')} external />
        </Section>

        {/* Logout */}
        <Section title="Session">
          <Item icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;

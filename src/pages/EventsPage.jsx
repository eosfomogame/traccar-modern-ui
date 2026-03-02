import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, BellOff, AlertTriangle,
  Navigation, MapPin, Zap, Activity, X, Trash2
} from 'lucide-react';
import { eventsActions } from '../store';
import dayjs from 'dayjs';

// ────────────────────────────────────────────────────────────
// Event type config
// ────────────────────────────────────────────────────────────
const EVENT_CONFIG = {
  deviceOnline:     { icon: Activity,       color: 'text-online',  bg: 'bg-online/10',  label: 'Online' },
  deviceOffline:    { icon: BellOff,        color: 'text-offline', bg: 'bg-offline/10', label: 'Offline' },
  deviceMoving:     { icon: Navigation,     color: 'text-moving',  bg: 'bg-moving/10',  label: 'Moving' },
  deviceStopped:    { icon: MapPin,         color: 'text-stopped', bg: 'bg-stopped/10', label: 'Stopped' },
  geofenceEnter:    { icon: MapPin,         color: 'text-brand-400', bg: 'bg-brand-400/10', label: 'Entered Geofence' },
  geofenceExit:     { icon: MapPin,         color: 'text-surface-400', bg: 'bg-surface-400/10', label: 'Exited Geofence' },
  alarm:            { icon: AlertTriangle,  color: 'text-alarm',   bg: 'bg-alarm/10',   label: 'Alarm' },
  ignitionOn:       { icon: Zap,            color: 'text-moving',  bg: 'bg-moving/10',  label: 'Ignition ON' },
  ignitionOff:      { icon: Zap,            color: 'text-stopped', bg: 'bg-stopped/10', label: 'Ignition OFF' },
};

const getConfig = (type) => EVENT_CONFIG[type] || { icon: Bell, color: 'text-surface-400', bg: 'bg-surface-400/10', label: type };

const fmt = (iso) => {
  const d = dayjs(iso);
  const today = dayjs().startOf('day');
  if (d.isAfter(today)) return d.format('HH:mm:ss');
  if (d.isAfter(today.subtract(1, 'day'))) return `Yesterday ${d.format('HH:mm')}`;
  return d.format('DD/MM/YY HH:mm');
};

// ────────────────────────────────────────────────────────────
const EventsPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const events    = useSelector((s) => s.events.items);
  const devices   = useSelector((s) => s.devices.items);

  const [filter, setFilter] = useState('all');

  const typeFilters = ['all', 'alarm', 'deviceOnline', 'deviceOffline', 'deviceMoving', 'deviceStopped', 'geofenceEnter', 'geofenceExit', 'ignitionOn', 'ignitionOff'];

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="flex flex-col h-full bg-surface-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass border-b border-white/5 z-10">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Events</p>
          <p className="text-surface-400 text-xs">{events.length} total</p>
        </div>
        {events.length > 0 && (
          <button onClick={() => dispatch(eventsActions.deleteAll())}
            className="flex items-center gap-1.5 text-xs text-alarm hover:text-alarm/80 bg-alarm/10 hover:bg-alarm/20 px-3 py-1.5 rounded-lg transition-all">
            <Trash2 className="w-3 h-3" />Clear all
          </button>
        )}
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-white/5">
        {typeFilters.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              filter === t
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}>
            {t === 'all' ? `All (${events.length})` : getConfig(t).label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Bell className="w-12 h-12 text-surface-700 mb-4" />
            <p className="text-surface-400 font-medium">No events yet</p>
            <p className="text-surface-600 text-sm mt-1">Events will appear here in real time</p>
          </div>
        ) : (
          filtered.map((ev) => {
            const cfg = getConfig(ev.type);
            const Icon = cfg.icon;
            const device = devices[ev.deviceId];
            return (
              <div key={ev.id}
                className="flex items-start gap-3 glass rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-all group">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {device?.name || `Device #${ev.deviceId}`}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                  </div>
                  {ev.attributes?.message && (
                    <p className="text-xs text-surface-400 truncate">{ev.attributes.message}</p>
                  )}
                  {ev.geofenceId && (
                    <p className="text-xs text-surface-500">Geofence #{ev.geofenceId}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-surface-500 tabular-nums">{fmt(ev.serverTime || ev.eventTime)}</span>
                  <button onClick={() => dispatch(eventsActions.delete(ev))}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-surface-700 hover:bg-alarm/30 flex items-center justify-center text-surface-400 hover:text-alarm transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsPage;

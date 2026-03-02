import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Zap, Wifi, WifiOff, Battery, BatteryLow, AlertTriangle } from 'lucide-react';

dayjs.extend(relativeTime);

const STATUS = {
  online:  { color: 'bg-online',  text: 'text-online',  label: 'Online'  },
  moving:  { color: 'bg-moving',  text: 'text-moving',  label: 'Moving'  },
  stopped: { color: 'bg-stopped', text: 'text-stopped', label: 'Stopped' },
  offline: { color: 'bg-offline', text: 'text-offline', label: 'Offline' },
  unknown: { color: 'bg-offline', text: 'text-offline', label: 'Unknown' },
};

const EMOJI = { car:'🚗', van:'🚐', truck:'🚛', motorcycle:'🏍️', boat:'⛵', bicycle:'🚲', default:'📍' };

export default function DeviceCard({ device, position, selected, onClick }) {
  const cfg   = STATUS[device.status] || STATUS.unknown;
  const emoji = EMOJI[device.category] || EMOJI.default;
  const attrs = position?.attributes || {};
  const isOnline = device.status !== 'offline' && device.status !== 'unknown';
  const lastSeen = device.lastUpdate ? dayjs(device.lastUpdate).fromNow() : '—';
  const isMoving = device.status === 'moving' || (position?.speed > 0);
  const hasAlarm = attrs.hasOwnProperty('alarm');

  return (
    <button onClick={onClick}
      className={`w-full px-3 py-2.5 flex items-center gap-3 transition-all duration-150 text-left border-l-2 ${
        selected ? 'bg-brand-600/15 border-brand-500' : 'border-transparent hover:bg-white/4'
      } ${ hasAlarm ? 'border-alarm bg-alarm/5' : '' }`}
    >
      {/* Avatar */}
      <div className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ring-1 ${
        selected ? 'ring-brand-500/60 bg-brand-600/20' : 'ring-white/10 bg-surface-800'
      }`}>
        {emoji}
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-900 ${cfg.color} ${
          isMoving || device.status === 'online' ? 'animate-pulse' : ''
        }`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm font-medium truncate ${selected ? 'text-brand-300' : 'text-white'}`}>
            {device.name}
          </span>
          {position?.speed > 0 && (
            <span className="text-[11px] text-moving font-mono flex-shrink-0">{Math.round(position.speed)}<span className="text-surface-600">km/h</span></span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[11px] font-medium ${cfg.text}`}>{cfg.label}</span>
          <span className="text-surface-700">·</span>
          <span className="text-[11px] text-surface-500 truncate">{isOnline ? 'Just now' : lastSeen}</span>
        </div>
      </div>

      {/* Indicator icons */}
      <div className="flex flex-col gap-1 flex-shrink-0 items-center">
        {hasAlarm && <AlertTriangle className="w-3.5 h-3.5 text-alarm" />}
        {attrs.ignition !== undefined && (
          <Zap className={`w-3.5 h-3.5 ${attrs.ignition ? 'text-online' : 'text-surface-700'}`} />
        )}
        {attrs.batteryLevel !== undefined && (
          attrs.batteryLevel > 30
            ? <Battery className="w-3.5 h-3.5 text-online" />
            : <BatteryLow className="w-3.5 h-3.5 text-alarm" />
        )}
        {isOnline
          ? <Wifi className="w-3 h-3 text-surface-600" />
          : <WifiOff className="w-3 h-3 text-surface-800" />
        }
      </div>
    </button>
  );
}

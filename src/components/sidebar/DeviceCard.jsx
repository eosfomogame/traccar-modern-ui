import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Zap, Wifi, WifiOff, Navigation, Gauge, Battery } from 'lucide-react';

dayjs.extend(relativeTime);

const STATUS_CONFIG = {
  online:  { color: 'bg-online',  ring: 'ring-online/30',  label: 'Online'  },
  moving:  { color: 'bg-moving',  ring: 'ring-moving/30',  label: 'Moving'  },
  stopped: { color: 'bg-stopped', ring: 'ring-stopped/30', label: 'Stopped' },
  offline: { color: 'bg-offline', ring: 'ring-offline/30', label: 'Offline' },
};

const CATEGORY_EMOJI = {
  car: '🚗', van: '🚐', truck: '🚛', motorcycle: '🏍️', boat: '⛵', default: '📍',
};

export default function DeviceCard({ device, position, selected, onClick }) {
  const cfg = STATUS_CONFIG[device.status] || STATUS_CONFIG.offline;
  const emoji = CATEGORY_EMOJI[device.category] || CATEGORY_EMOJI.default;
  const isOnline = device.status !== 'offline';

  const lastSeen = device.lastUpdate ? dayjs(device.lastUpdate).fromNow() : 'Unknown';

  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left
        hover:bg-white/5 active:bg-white/10 relative
        ${ selected ? 'bg-brand-600/15 border-l-2 border-brand-500' : 'border-l-2 border-transparent' }
      `}
    >
      {/* Avatar */}
      <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ring-2 ${
        selected ? 'ring-brand-500/50' : cfg.ring
      } ${ selected ? 'bg-brand-600/20' : 'bg-surface-800' }`}>
        {emoji}
        {/* Status dot */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-900 ${cfg.color} ${
          device.status === 'moving' || device.status === 'online' ? 'animate-pulse-dot' : ''
        }`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium truncate ${selected ? 'text-brand-300' : 'text-white'}`}>
            {device.name}
          </span>
          {position?.speed > 0 && (
            <span className="text-xs text-moving font-mono flex-shrink-0">
              {Math.round(position.speed)} km/h
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${cfg.color.replace('bg-', 'text-')}`}>
            {cfg.label}
          </span>
          <span className="text-surface-600 text-xs">·</span>
          <span className="text-xs text-surface-500 truncate">
            {isOnline ? 'Just now' : lastSeen}
          </span>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {position?.attributes?.ignition !== undefined && (
          <Zap className={`w-3.5 h-3.5 ${ position.attributes.ignition ? 'text-online' : 'text-surface-600' }`} />
        )}
        {position?.attributes?.batteryLevel !== undefined && (
          <Battery className={`w-3.5 h-3.5 ${ position.attributes.batteryLevel > 30 ? 'text-online' : 'text-alarm' }`} />
        )}
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-surface-500" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-surface-700" />
        )}
      </div>
    </button>
  );
}

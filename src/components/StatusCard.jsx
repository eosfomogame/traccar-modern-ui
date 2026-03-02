import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { X, MapPin, Gauge, Navigation, Zap, Battery, Clock, Wifi } from 'lucide-react';

const CATEGORY_EMOJI = { car: '🚗', van: '🚐', truck: '🚛', motorcycle: '🏍️', default: '📍' };
const STATUS_CONFIG = {
  online:  { label: 'Online',  color: 'text-online',  bg: 'bg-online/10'  },
  moving:  { label: 'Moving',  color: 'text-moving',  bg: 'bg-moving/10'  },
  stopped: { label: 'Stopped', color: 'text-stopped', bg: 'bg-stopped/10' },
  offline: { label: 'Offline', color: 'text-offline', bg: 'bg-offline/10' },
};

export default function StatusCard({ deviceId, onClose, sidebarOpen }) {
  const device   = useSelector((s) => s.devices.items.find((d) => d.id === deviceId));
  const position = useSelector((s) => s.devices.positions[deviceId]);

  if (!device) return null;
  const cfg   = STATUS_CONFIG[device.status] || STATUS_CONFIG.offline;
  const emoji = CATEGORY_EMOJI[device.category] || CATEGORY_EMOJI.default;

  const attrs = position?.attributes || {};

  return (
    <div
      className="absolute bottom-6 z-30 glass rounded-2xl shadow-card animate-slide-up w-80"
      style={{ left: sidebarOpen ? '360px' : '16px', transition: 'left 0.3s ease-out', marginLeft: '16px' }}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <div className="font-semibold text-white text-sm">{device.name}</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics grid */}
      {position && (
        <div className="p-4 grid grid-cols-2 gap-2">
          <Metric icon={Gauge}     label="Speed"   value={`${Math.round(position.speed || 0)} km/h`} />
          <Metric icon={Navigation} label="Course" value={`${position.course || 0}°`} />
          <Metric icon={MapPin}    label="Lat"     value={position.lat?.toFixed(5)} />
          <Metric icon={MapPin}    label="Lng"     value={position.lng?.toFixed(5)} />
          {attrs.ignition !== undefined && (
            <Metric icon={Zap}     label="Ignition" value={attrs.ignition ? 'On' : 'Off'} color={attrs.ignition ? 'text-online' : 'text-surface-500'} />
          )}
          {attrs.batteryLevel !== undefined && (
            <Metric icon={Battery} label="Battery" value={`${attrs.batteryLevel}%`} color={attrs.batteryLevel > 30 ? 'text-online' : 'text-alarm'} />
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-1.5 text-xs text-surface-500">
        <Clock className="w-3 h-3" />
        Last update: {device.lastUpdate ? dayjs(device.lastUpdate).format('HH:mm:ss') : '—'}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="bg-surface-800/50 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-surface-500" />
        <span className="text-[10px] text-surface-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-semibold font-mono ${color}`}>{value ?? '—'}</div>
    </div>
  );
}

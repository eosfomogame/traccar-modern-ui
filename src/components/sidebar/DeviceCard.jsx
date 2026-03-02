import { Wifi, WifiOff, Navigation, Square, AlertTriangle, Battery, Zap } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const fmtSpeed = (knots) => knots != null ? `${(knots * 1.852).toFixed(0)} km/h` : '—';
const fmtTime  = (iso) => iso ? dayjs(iso).fromNow() : '—';

const CATEGORY_EMOJI = {
  default: '🚗', arrow: '🚗', bicycle: '🚲', boat: '⛵',
  bus: '🚌', car: '🚗', crane: '🏗️', helicopter: '🚁',
  motorcycle: '🏍️', offroad: '🚙', person: '🧍',
  pickup: '🛻', plane: '✈️', scooter: '🛵', ship: '🚢',
  tractor: '🚜', train: '🚂', tram: '🚃', trolleybus: '🚎',
  truck: '🚛', van: '🚐',
};

const DeviceCard = ({ device, position, isSelected, onClick }) => {
  const speed    = position?.speed || 0;
  const isMoving = speed > 0.5;
  const ignition = position?.attributes?.ignition;
  const battery  = position?.attributes?.batteryLevel;
  const alarm    = position?.attributes?.alarm;

  const status = alarm ? 'alarm'
    : device.status !== 'online' ? 'offline'
    : isMoving ? 'moving' : 'stopped';

  const statusConfig = {
    alarm:   { dot: 'bg-alarm animate-pulse', text: 'text-alarm',   label: 'ALARM',   Icon: AlertTriangle },
    offline: { dot: 'bg-offline',             text: 'text-offline', label: 'OFFLINE', Icon: WifiOff },
    moving:  { dot: 'bg-moving animate-pulse', text: 'text-moving', label: 'MOVING',  Icon: Navigation },
    stopped: { dot: 'bg-stopped',             text: 'text-stopped', label: 'STOPPED', Icon: Square },
    online:  { dot: 'bg-online',              text: 'text-online',  label: 'ONLINE',  Icon: Wifi },
  };
  const cfg  = statusConfig[status] || statusConfig.online;
  const Icon = cfg.Icon;
  const emoji = CATEGORY_EMOJI[device.category] || CATEGORY_EMOJI.default;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl px-3 py-2.5 transition-all duration-200 group ${
        isSelected
          ? 'bg-brand-600/20 border border-brand-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
          : 'bg-surface-800/50 border border-white/5 hover:bg-surface-800 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Emoji + status dot */}
        <div className="relative flex-shrink-0">
          <span className="text-xl leading-none">{emoji}</span>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-900 ${cfg.dot}`} />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-white truncate">{device.name}</span>
            {alarm && <AlertTriangle className="w-3 h-3 text-alarm flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold tracking-wider ${cfg.text}`}>{cfg.label}</span>
            {isMoving && (
              <span className="text-[10px] text-surface-400 font-mono">{fmtSpeed(speed)}</span>
            )}
            <span className="text-[10px] text-surface-600 ml-auto">{fmtTime(device.lastUpdate)}</span>
          </div>
        </div>

        {/* Right indicators */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {ignition !== undefined && (
            <Zap className={`w-3 h-3 ${ignition ? 'text-moving' : 'text-surface-600'}`} />
          )}
          {battery !== undefined && (
            <div className="flex items-center gap-0.5">
              <Battery className={`w-3 h-3 ${battery < 20 ? 'text-alarm' : 'text-surface-500'}`} />
              <span className="text-[9px] text-surface-500">{battery}%</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default DeviceCard;

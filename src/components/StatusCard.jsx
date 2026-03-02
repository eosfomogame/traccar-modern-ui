import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  X, Navigation, Gauge, MapPin, Clock,
  Battery, Zap, Thermometer, AlertTriangle, Play
} from 'lucide-react';
import dayjs from 'dayjs';

const fmt      = (iso)   => iso   ? dayjs(iso).format('HH:mm:ss DD/MM/YY') : '—';
const fmtSpeed = (knots) => knots != null ? `${(knots * 1.852).toFixed(0)} km/h` : '—';

const Row = ({ icon: Icon, label, value, color = 'text-surface-400' }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-2 text-surface-500">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs">{label}</span>
    </div>
    <span className={`text-xs font-semibold ${color}`}>{value}</span>
  </div>
);

const StatusCard = ({ deviceId, position, onClose, sidebarOpen }) => {
  const navigate = useNavigate();
  const device   = useSelector((s) => s.devices.items[deviceId]);
  if (!device) return null;

  const speed    = position?.speed || 0;
  const isMoving = speed > 0.5;
  const attrs    = position?.attributes || {};
  const left     = sidebarOpen ? 356 : 16;

  // ✅ Pass deviceId via location.state so ReplayPage can read it
  const goReplay = () => navigate('/replay', {
    state: { deviceId, deviceName: device.name },
  });

  return (
    <div
      className="absolute bottom-20 z-30 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ left, width: 300, transition: 'left 0.3s ease' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{device.name}</p>
          <p className="text-[10px] text-surface-400">
            {isMoving ? `Moving · ${fmtSpeed(speed)}` : 'Stopped'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={goReplay}
            className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-brand-600 flex items-center justify-center text-surface-300 hover:text-white transition-all"
            title="Open Replay">
            <Play className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-surface-300 hover:text-white transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-1">
        <Row icon={Gauge}      label="Speed"    value={fmtSpeed(speed)} color={isMoving ? 'text-moving' : 'text-surface-400'} />
        <Row icon={Navigation} label="Course"   value={position?.course != null ? `${position.course}°` : '—'} />
        <Row icon={MapPin}     label="Position" value={position ? `${position.latitude?.toFixed(5)}, ${position.longitude?.toFixed(5)}` : '—'} />
        <Row icon={Clock}      label="Fix Time" value={fmt(position?.fixTime)} />
        {attrs.ignition !== undefined && (
          <Row icon={Zap} label="Ignition" value={attrs.ignition ? 'ON' : 'OFF'} color={attrs.ignition ? 'text-moving' : 'text-stopped'} />
        )}
        {attrs.batteryLevel !== undefined && (
          <Row icon={Battery} label="Battery" value={`${attrs.batteryLevel}%`} color={attrs.batteryLevel < 20 ? 'text-alarm' : 'text-online'} />
        )}
        {attrs.temp1 !== undefined && (
          <Row icon={Thermometer} label="Temp" value={`${attrs.temp1}°C`} />
        )}
        {attrs.alarm && (
          <Row icon={AlertTriangle} label="Alarm" value={attrs.alarm} color="text-alarm" />
        )}
      </div>

      {position?.address && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-surface-500 flex items-start gap-1">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {position.address}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusCard;

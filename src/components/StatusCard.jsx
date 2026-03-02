import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { X, MapPin, Gauge, Navigation, Zap, Battery, Clock, ExternalLink, Map, RotateCcw } from 'lucide-react';

const STATUS = {
  online:  { label: 'Online',  cls: 'text-online  bg-online/10'  },
  moving:  { label: 'Moving',  cls: 'text-moving  bg-moving/10'  },
  stopped: { label: 'Stopped', cls: 'text-stopped bg-stopped/10' },
  offline: { label: 'Offline', cls: 'text-offline bg-offline/10' },
  unknown: { label: 'Unknown', cls: 'text-offline bg-offline/10' },
};
const EMOJI = { car:'🚗', van:'🚐', truck:'🚛', motorcycle:'🏍️', boat:'⛵', default:'📍' };

export default function StatusCard({ deviceId, position, sidebarOpen, onClose }) {
  const navigate = useNavigate();
  const device   = useSelector((s) => s.devices.items[deviceId]);
  const [tab, setTab] = useState('info');

  if (!device) return null;
  const cfg   = STATUS[device.status] || STATUS.unknown;
  const emoji = EMOJI[device.category] || EMOJI.default;
  const attrs = position?.attributes || {};

  const left = sidebarOpen ? 356 : 16;

  return (
    <div
      className="absolute bottom-16 z-30 glass rounded-2xl shadow-card animate-slide-up"
      style={{ left, width: 300, transition: 'left 0.3s ease-out', margin: '0 16px' }}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-white/5 flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{device.name}</div>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-surface-500 hover:text-white hover:bg-surface-700 transition-all flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {['info','attrs'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs capitalize transition-colors ${
              tab === t ? 'text-brand-400 border-b-2 border-brand-500' : 'text-surface-500 hover:text-white'
            }`}>{t === 'info' ? 'Position' : 'Attributes'}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'info' && position ? (
        <div className="p-3 grid grid-cols-2 gap-1.5">
          <Metric icon={Gauge}      label="Speed"   value={`${Math.round(position.speed || 0)} km/h`} />
          <Metric icon={Navigation} label="Course"  value={`${position.course || 0}°`} />
          <Metric icon={MapPin}     label="Lat"     value={position.latitude?.toFixed(5)} />
          <Metric icon={MapPin}     label="Lng"     value={position.longitude?.toFixed(5)} />
          {attrs.ignition !== undefined && (
            <Metric icon={Zap} label="Ignition" value={attrs.ignition ? 'On' : 'Off'}
              color={attrs.ignition ? 'text-online' : 'text-surface-500'} />
          )}
          {attrs.batteryLevel !== undefined && (
            <Metric icon={Battery} label="Battery" value={`${attrs.batteryLevel}%`}
              color={attrs.batteryLevel > 30 ? 'text-online' : 'text-alarm'} />
          )}
        </div>
      ) : tab === 'attrs' ? (
        <div className="p-3 max-h-40 overflow-y-auto space-y-1">
          {Object.entries(attrs).length === 0
            ? <p className="text-xs text-surface-600 text-center py-2">No attributes</p>
            : Object.entries(attrs).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs">
                <span className="text-surface-500 capitalize">{k}</span>
                <span className="text-white font-mono">{String(v)}</span>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="p-3 text-xs text-surface-500 text-center">No position data</div>
      )}

      {/* Footer actions */}
      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-surface-600">
          <Clock className="w-3 h-3" />
          {device.lastUpdate ? dayjs(device.lastUpdate).format('HH:mm:ss') : '—'}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-[10px] text-surface-300 transition-colors">
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
          <button onClick={() => window.open(`https://www.google.com/maps?q=${position?.latitude},${position?.longitude}`, '_blank')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-[10px] text-surface-300 transition-colors">
            <ExternalLink className="w-3 h-3" /> Maps
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="bg-surface-800/60 rounded-xl px-2.5 py-2">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-surface-600" />
        <span className="text-[9px] text-surface-600 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xs font-semibold font-mono ${color}`}>{value ?? '—'}</div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import DeviceCard from './DeviceCard';

const STATUS_FILTERS = ['all', 'online', 'moving', 'stopped', 'offline'];

export default function Sidebar({ onDeviceSelect, selectedDeviceId }) {
  const devices   = useSelector((s) => s.devices.items);
  const positions = useSelector((s) => s.devices.positions);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const matchName   = d.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [devices, search, statusFilter]);

  const counts = useMemo(() => {
    return devices.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
  }, [devices]);

  return (
    <div className="h-full flex flex-col glass animate-slide-in-left" style={{ borderRadius: 0, borderLeft: 0, borderTop: 0, borderBottom: 0 }}>
      {/* Search bar */}
      <div className="p-4 border-b border-white/5">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices…"
            className="w-full bg-surface-800/60 border border-surface-700/50 text-white placeholder-surface-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/70 transition-all"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilter((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
        </button>

        {showFilter && (
          <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-in">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white'
                }`}
              >
                {s}{s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
        <Stat label="Online"  value={counts.online  || 0} color="text-online"  />
        <Stat label="Moving"  value={counts.moving  || 0} color="text-moving"  />
        <Stat label="Offline" value={counts.offline || 0} color="text-offline" />
      </div>

      {/* Device list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-surface-500 text-sm">
            No devices found
          </div>
        ) : (
          filtered.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              position={positions[device.id]}
              selected={selectedDeviceId === device.id}
              onClick={() => onDeviceSelect(device.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-surface-500">{filtered.length} of {devices.length} devices</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-online animate-pulse" />
          <span className="text-xs text-surface-400">Live</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center py-2.5">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-surface-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

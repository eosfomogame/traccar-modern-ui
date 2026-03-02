import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import DeviceCard from './DeviceCard';

const STATUS_OPTS = ['online', 'offline', 'unknown'];
const SORT_OPTS   = [{ v: '', l: 'Default' }, { v: 'name', l: 'Name' }, { v: 'lastUpdate', l: 'Last Update' }];

const Sidebar = ({
  devices,
  selectedDeviceId,
  onDeviceSelect,
  keyword, setKeyword,
  filterStatus, setFilterStatus,
  filterGroups, setFilterGroups,
  filterSort, setFilterSort,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const groups  = useSelector((s) => s.groups.items);
  const groupList = Object.values(groups);
  const positions = useSelector((s) => s.session.positions);

  const totalOnline  = devices.filter((d) => d.status === 'online').length;
  const totalMoving  = devices.filter((d) => {
    const p = positions[d.id];
    return p && p.speed > 0.5;
  }).length;
  const totalStopped = devices.filter((d) => {
    const p = positions[d.id];
    return d.status === 'online' && p && p.speed <= 0.5;
  }).length;
  const totalOffline = devices.filter((d) => d.status !== 'online').length;

  const toggleStatus = (s) =>
    setFilterStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const STATUS_COLORS = {
    online:  'bg-online/20 text-online border-online/30',
    moving:  'bg-moving/20 text-moving border-moving/30',
    stopped: 'bg-stopped/20 text-stopped border-stopped/30',
    offline: 'bg-offline/20 text-offline border-offline/30',
  };

  return (
    <div className="flex flex-col h-full glass border-r border-white/5">
      {/* Stats strip */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
        {[['Online', totalOnline, 'online'], ['Moving', totalMoving, 'moving'], ['Stopped', totalStopped, 'stopped'], ['Offline', totalOffline, 'offline']].map(([label, count, key]) => (
          <button key={key} onClick={() => toggleStatus(key === 'moving' || key === 'stopped' ? 'online' : key)}
            className={`flex-1 rounded-lg px-1 py-1.5 text-center border transition-all ${
              filterStatus.includes(key) ? STATUS_COLORS[key] : 'bg-surface-800/60 border-white/5 text-surface-400 hover:text-white'
            }`}>
            <div className="text-sm font-bold">{count}</div>
            <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2 px-3 pb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search devices…"
            className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {keyword && (
            <button onClick={() => setKeyword('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button onClick={() => setFilterOpen((v) => !v)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            filterOpen ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="px-3 pb-3 space-y-3 border-b border-white/5">
          {/* Status chips */}
          <div>
            <p className="text-[10px] font-semibold text-surface-500 mb-2 uppercase tracking-widest">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTS.map((s) => (
                <button key={s} onClick={() => toggleStatus(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    filterStatus.includes(s) ? STATUS_COLORS[s] : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Group filter */}
          {groupList.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-surface-500 mb-2 uppercase tracking-widest">Group</p>
              <div className="flex flex-wrap gap-1.5">
                {groupList.map((g) => (
                  <button key={g.id}
                    onClick={() => setFilterGroups((prev) => prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id])}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      filterGroups.includes(g.id) ? 'bg-brand-600/20 text-brand-400 border-brand-500/30' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'
                    }`}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Sort */}
          <div>
            <p className="text-[10px] font-semibold text-surface-500 mb-2 uppercase tracking-widest">Sort</p>
            <div className="flex gap-1.5">
              {SORT_OPTS.map((o) => (
                <button key={o.v} onClick={() => setFilterSort(o.v)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    filterSort === o.v ? 'bg-brand-600 text-white border-brand-500' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'
                  }`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Device list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface-700">
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-surface-600">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-sm">No devices found</p>
          </div>
        ) : (
          devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              position={positions[device.id]}
              isSelected={device.id === selectedDeviceId}
              onClick={() => onDeviceSelect(device.id)}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      <div className="px-3 py-2 border-t border-white/5 text-center">
        <span className="text-[10px] text-surface-600">{devices.length} device{devices.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

export default Sidebar;

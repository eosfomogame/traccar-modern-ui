import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import DeviceCard from './DeviceCard';

const STATUS_OPTS = ['online', 'moving', 'stopped', 'offline', 'unknown'];

export default function Sidebar({
  devices, selectedDeviceId, onDeviceSelect,
  keyword, setKeyword,
  filterStatus, setFilterStatus,
  filterGroups, setFilterGroups,
  filterSort, setFilterSort,
}) {
  const positions  = useSelector((s) => s.session.positions);
  const groups     = useSelector((s) => s.groups.items);
  const allDevices = useSelector((s) => s.devices.items);
  const [showFilter, setShowFilter] = useState(false);

  const counts = useMemo(() => {
    const c = { online: 0, moving: 0, stopped: 0, offline: 0, unknown: 0 };
    Object.values(allDevices).forEach((d) => { if (c[d.status] !== undefined) c[d.status]++; });
    return c;
  }, [allDevices]);

  const toggleStatus = (s) =>
    setFilterStatus((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleGroup = (id) =>
    setFilterGroups((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const hasActiveFilters = filterStatus.length > 0 || filterGroups.length > 0 || filterSort;

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search devices…"
            className="w-full bg-surface-800/70 border border-surface-700/50 text-white placeholder-surface-600 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-brand-500/70 transition-all"
          />
          {keyword && (
            <button onClick={() => setKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button onClick={() => setShowFilter((v) => !v)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${hasActiveFilters ? 'text-brand-400' : 'text-surface-500 hover:text-white'}`}>
          <SlidersHorizontal className="w-3 h-3" />
          Filters {hasActiveFilters && <span className="bg-brand-600 text-white text-[9px] rounded-full px-1.5 py-0.5">{filterStatus.length + filterGroups.length + (filterSort ? 1 : 0)}</span>}
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
        </button>

        {showFilter && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Status chips */}
            <div>
              <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1">
                {STATUS_OPTS.map((s) => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] capitalize transition-all ${
                      filterStatus.includes(s) ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
                    }`}>
                    {s} {counts[s] > 0 ? `(${counts[s]})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups */}
            {Object.values(groups).length > 0 && (
              <div>
                <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1.5">Groups</p>
                <div className="flex flex-wrap gap-1">
                  {Object.values(groups).map((g) => (
                    <button key={g.id} onClick={() => toggleGroup(g.id)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                        filterGroups.includes(g.id) ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
                      }`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div>
              <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1.5">Sort by</p>
              <div className="flex gap-1">
                {[['','Default'],['name','Name'],['lastUpdate','Last update']].map(([val, label]) => (
                  <button key={val} onClick={() => setFilterSort(val)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                      filterSort === val ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={() => { setFilterStatus([]); setFilterGroups([]); setFilterSort(''); }}
                className="text-[10px] text-alarm hover:text-alarm/80 transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 border-b border-white/5">
        {[['online','text-online'],['moving','text-moving'],['stopped','text-stopped'],['offline','text-offline']].map(([s, cls]) => (
          <div key={s} className="flex flex-col items-center py-2">
            <span className={`text-base font-bold ${cls}`}>{counts[s]}</span>
            <span className="text-[9px] text-surface-600 uppercase tracking-wider">{s}</span>
          </div>
        ))}
      </div>

      {/* Device list */}
      <div className="flex-1 overflow-y-auto">
        {devices.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-surface-600 text-sm">No devices</div>
        ) : (
          devices.map((d) => (
            <DeviceCard key={d.id} device={d} position={positions[d.id]}
              selected={selectedDeviceId === d.id} onClick={() => onDeviceSelect(d.id)} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-surface-600">{devices.length} / {Object.keys(useSelector((s) => s.devices.items)).length} devices</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-online animate-pulse" />
          <span className="text-[10px] text-surface-500">Live</span>
        </div>
      </div>
    </div>
  );
}

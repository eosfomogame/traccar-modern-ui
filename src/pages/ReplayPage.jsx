import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Play, Pause, SkipBack, SkipForward, ArrowLeft,
  Download, SlidersHorizontal, MapPin, Clock, Gauge
} from 'lucide-react';
import MapView from '../components/map/MapView';
import { apiFetch } from '../api';
import dayjs from 'dayjs';

const fmt      = (iso)   => iso   ? dayjs(iso).format('HH:mm:ss DD/MM/YY') : '—';
const fmtSpeed = (knots) => knots != null ? `${(knots * 1.852).toFixed(0)} km/h` : '—';

const ReplayPage = () => {
  const navigate = useNavigate();
  // ✅ Read deviceId passed via location.state from StatusCard
  const { state: routeState } = useLocation();

  const storeSelectedId = useSelector((s) => s.devices.selectedId);
  const devices         = useSelector((s) => s.devices.items);
  const deviceList      = Object.values(devices);

  const [selectedDeviceId, setSelectedDeviceId] = useState(
    () => routeState?.deviceId || storeSelectedId || ''
  );
  const [from, setFrom] = useState(() => dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [to,   setTo]   = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'));

  const [positions,   setPositions]   = useState([]);
  const [index,       setIndex]       = useState(0);
  const [playing,     setPlaying]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [speed,       setSpeed]       = useState(1);
  const [filterOpen,  setFilterOpen]  = useState(false);

  const timerRef   = useRef(null);
  const loaded     = positions.length > 0 && !loading;
  const current    = positions[index] || null;
  const deviceName = devices[selectedDeviceId]?.name || routeState?.deviceName || 'Device';

  // Auto-open filter if no device pre-selected
  useEffect(() => {
    if (!selectedDeviceId) setFilterOpen(true);
  }, []);

  // Playback timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!playing || !loaded) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => {
        if (i >= positions.length - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, Math.round(500 / speed));
    return () => clearInterval(timerRef.current);
  }, [playing, loaded, speed, positions.length]);

  const fetchPositions = useCallback(async () => {
    if (!selectedDeviceId) return;
    setLoading(true); setError(''); setPlaying(false);
    try {
      const q = new URLSearchParams({
        deviceId: selectedDeviceId,
        from: new Date(from).toISOString(),
        to:   new Date(to).toISOString(),
      });
      const r = await apiFetch(`/api/positions?${q}`);
      if (!r.ok) throw new Error(`Server error ${r.status}`);
      const data = await r.json();
      if (!data.length) throw new Error('No positions for this range');
      setPositions(data);
      setIndex(0);
      setFilterOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId, from, to]);

  const handleDownload = () => {
    if (!selectedDeviceId) return;
    const q = new URLSearchParams({
      deviceId: selectedDeviceId,
      from: new Date(from).toISOString(),
      to:   new Date(to).toISOString(),
    });
    window.location.assign(`/api/positions/kml?${q}`);
  };

  const replayPositions = current ? [current] : [];

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-950">
      <MapView
        filteredPositions={replayPositions}
        selectedPosition={current}
        selectedDeviceId={selectedDeviceId || null}
        onDeviceSelect={() => {}}
        replayPath={positions}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-white/5">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{deviceName}</p>
          <p className="text-surface-400 text-xs">
            {loaded ? `${positions.length} points` : 'Replay'}
          </p>
        </div>
        <button onClick={() => setFilterOpen((v) => !v)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            filterOpen ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-300 hover:text-white'
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        {loaded && (
          <button onClick={handleDownload}
            className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="absolute top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 glass rounded-2xl p-5 space-y-4 border border-white/10 animate-fade-in">
          <p className="text-white font-semibold text-sm">Select Range</p>

          <div>
            <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">Device</label>
            <select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
              <option value="">— select —</option>
              {deviceList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">From</label>
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">To</label>
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
          </div>

          {error && (
            <p className="text-xs text-alarm bg-alarm/10 border border-alarm/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button onClick={fetchPositions} disabled={loading || !selectedDeviceId}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all">
            {loading ? 'Loading…' : 'Show Replay'}
          </button>
        </div>
      )}

      {/* Playback controls */}
      {loaded && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,480px)]">
          <div className="glass rounded-2xl p-4 border border-white/10">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-surface-500 tabular-nums w-8 text-right">{index + 1}</span>
              <div
                className="flex-1 relative h-2 bg-surface-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setIndex(Math.round(((e.clientX - r.left) / r.width) * (positions.length - 1)));
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-brand-500 rounded-full"
                  style={{ width: `${(index / Math.max(positions.length - 1, 1)) * 100}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow"
                  style={{ left: `calc(${(index / Math.max(positions.length - 1, 1)) * 100}% - 6px)` }}
                />
              </div>
              <span className="text-xs text-surface-500 tabular-nums w-8">{positions.length}</span>
            </div>

            {/* Info */}
            {current && (
              <div className="flex items-center justify-between text-[10px] text-surface-400 mb-3 px-1 gap-2">
                <span className="flex items-center gap-1 truncate"><Clock className="w-3 h-3 flex-shrink-0" />{fmt(current.fixTime)}</span>
                <span className="flex items-center gap-1 flex-shrink-0"><Gauge className="w-3 h-3" />{fmtSpeed(current.speed)}</span>
                <span className="flex items-center gap-1 flex-shrink-0"><MapPin className="w-3 h-3" />{current.latitude?.toFixed(4)}, {current.longitude?.toFixed(4)}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Speed */}
              <div className="flex items-center gap-1">
                {[0.5, 1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className={`text-xs px-2 py-1 rounded-lg font-mono transition-all ${
                      speed === s ? 'bg-brand-600 text-white' : 'bg-surface-700 text-surface-400 hover:text-white'
                    }`}>{s}×
                  </button>
                ))}
              </div>
              {/* Play buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={playing || index <= 0}
                  className="w-9 h-9 rounded-xl bg-surface-700 hover:bg-surface-600 disabled:opacity-30 flex items-center justify-center text-white transition-all">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPlaying((v) => !v)}
                  disabled={index >= positions.length - 1}
                  className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 flex items-center justify-center text-white shadow-glow transition-all">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIndex((i) => Math.min(positions.length - 1, i + 1))}
                  disabled={playing || index >= positions.length - 1}
                  className="w-9 h-9 rounded-xl bg-surface-700 hover:bg-surface-600 disabled:opacity-30 flex items-center justify-center text-white transition-all">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="w-20" />
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loaded && !filterOpen && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center border border-white/10">
            <MapPin className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No replay loaded</p>
            <p className="text-surface-400 text-sm mb-4">Select a device and date range</p>
            <button onClick={() => setFilterOpen(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all">
              Open Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplayPage;

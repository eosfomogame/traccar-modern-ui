import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Play, Pause, SkipBack, SkipForward, ArrowLeft,
  Download, SlidersHorizontal, MapPin, Clock, Gauge
} from 'lucide-react';
import MapView from '../components/map/MapView';
import dayjs from 'dayjs';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
const fmt = (iso) => iso ? dayjs(iso).format('HH:mm:ss DD/MM/YY') : '—';
const fmtSpeed = (knots) => knots != null ? `${(knots * 1.852).toFixed(0)} km/h` : '—';

// ────────────────────────────────────────────────────────────
const ReplayPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultDeviceId = useSelector((s) => s.devices.selectedId);
  const devices = useSelector((s) => s.devices.items);
  const deviceList = Object.values(devices);

  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId || '');
  const [from, setFrom] = useState(searchParams.get('from') || dayjs().subtract(1, 'day').format('YYYY-MM-DDTHH:mm'));
  const [to, setTo]   = useState(searchParams.get('to')   || dayjs().format('YYYY-MM-DDTHH:mm'));

  const [positions, setPositions] = useState([]);
  const [index, setIndex]         = useState(0);
  const [playing, setPlaying]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [speed, setSpeed]         = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const timerRef = useRef(null);
  const loaded   = positions.length > 0 && !loading;
  const current  = positions[index] || null;
  const deviceName = devices[selectedDeviceId]?.name || 'Device';

  // ── playback timer
  useEffect(() => {
    if (playing && loaded) {
      timerRef.current = setInterval(() => {
        setIndex((i) => {
          if (i >= positions.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 500 / speed);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, loaded, speed, positions.length]);

  const fetchPositions = useCallback(async () => {
    if (!selectedDeviceId) return;
    setLoading(true); setError('');
    try {
      const q = new URLSearchParams({ deviceId: selectedDeviceId, from: new Date(from).toISOString(), to: new Date(to).toISOString() });
      const r = await fetch(`/api/positions?${q}`);
      if (!r.ok) throw new Error('Server error');
      const data = await r.json();
      if (!data.length) throw new Error('No data for this range');
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
    const q = new URLSearchParams({ deviceId: selectedDeviceId, from: new Date(from).toISOString(), to: new Date(to).toISOString() });
    window.location.assign(`/api/positions/kml?${q}`);
  };

  const replayPositions = loaded ? [current] : [];

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-950">
      {/* Map */}
      <MapView
        filteredPositions={replayPositions}
        selectedPosition={current}
        selectedDeviceId={selectedDeviceId || null}
        onDeviceSelect={() => {}}
        replayPath={positions}
        replayIndex={index}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-white/5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{deviceName}</p>
          <p className="text-surface-400 text-xs">Replay</p>
        </div>
        <button onClick={() => setFilterOpen((v) => !v)}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-300 hover:text-white transition-all">
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
        <div className="absolute top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 glass rounded-2xl p-5 space-y-4 border border-white/10">
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
          {error && <p className="text-xs text-alarm bg-alarm/10 border border-alarm/20 rounded-lg px-3 py-2">{error}</p>}
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
              <span className="text-xs text-surface-400 tabular-nums w-10 text-right">{index + 1}</span>
              <div className="flex-1 relative h-1.5 bg-surface-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setIndex(Math.round(pct * (positions.length - 1)));
                }}>
                <div className="absolute left-0 top-0 h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${(index / Math.max(positions.length - 1, 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-surface-400 tabular-nums w-10">{positions.length}</span>
            </div>

            {/* Info row */}
            {current && (
              <div className="flex items-center justify-between text-xs text-surface-400 mb-3 px-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(current.fixTime)}</span>
                <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{fmtSpeed(current.speed)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{current.latitude?.toFixed(4)}, {current.longitude?.toFixed(4)}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[0.5, 1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all ${
                      speed === s ? 'bg-brand-600 text-white' : 'bg-surface-700 text-surface-400 hover:text-white'
                    }`}>{s}×</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={playing || index <= 0}
                  className="w-9 h-9 rounded-xl bg-surface-700 hover:bg-surface-600 disabled:opacity-30 flex items-center justify-center text-white transition-all">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={() => setPlaying((v) => !v)} disabled={index >= positions.length - 1}
                  className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 flex items-center justify-center text-white transition-all shadow-glow">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => setIndex((i) => Math.min(positions.length - 1, i + 1))} disabled={playing || index >= positions.length - 1}
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass rounded-2xl p-8 text-center border border-white/10 pointer-events-auto">
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

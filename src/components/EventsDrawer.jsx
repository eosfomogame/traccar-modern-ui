import { useNavigate } from 'react-router-dom';
import { X, Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { eventsActions } from '../store';
import dayjs from 'dayjs';

const fmt = (iso) => iso ? dayjs(iso).format('HH:mm:ss') : '—';

const EventsDrawer = ({ open, onClose }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const events    = useSelector((s) => s.events.items);
  const devices   = useSelector((s) => s.devices.items);
  const recent    = events.slice(0, 8);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 glass border-l border-white/10 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-white">Recent Events</span>
            {events.length > 0 && (
              <span className="text-xs bg-alarm/20 text-alarm px-2 py-0.5 rounded-full">{events.length}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-surface-400 hover:text-white transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-600">
              <Bell className="w-10 h-10 mb-3" />
              <p className="text-sm">No events yet</p>
            </div>
          ) : (
            recent.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 bg-surface-800/60 rounded-xl px-3 py-2.5 border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {devices[ev.deviceId]?.name || `Device #${ev.deviceId}`}
                  </p>
                  <p className="text-[10px] text-surface-400 mt-0.5">{ev.type}</p>
                </div>
                <span className="text-[10px] text-surface-500 tabular-nums flex-shrink-0">{fmt(ev.serverTime || ev.eventTime)}</span>
              </div>
            ))
          )}
        </div>

        {events.length > 8 && (
          <div className="px-4 py-3 border-t border-white/5">
            <button onClick={() => { navigate('/events'); onClose(); }}
              className="w-full text-xs text-brand-400 hover:text-brand-300 font-medium py-2 transition-colors">
              View all {events.length} events →
            </button>
          </div>
        )}

        <div className="px-4 py-3 border-t border-white/5">
          <button onClick={() => dispatch(eventsActions.deleteAll())}
            className="w-full text-xs text-surface-500 hover:text-alarm transition-colors py-1">Clear all</button>
        </div>
      </div>
    </>
  );
};

export default EventsDrawer;

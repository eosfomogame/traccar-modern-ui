import { useSelector, useDispatch } from 'react-redux';
import { X, AlertTriangle, Bell, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { eventsActions } from '../store';

dayjs.extend(relativeTime);

const EVENT_ICONS = { alarm: AlertTriangle, default: Bell };

export default function EventsDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const events   = useSelector((s) => s.events.items);

  return (
    <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-out ${
      open ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ width: 320 }}>
      <div className="h-full flex flex-col" style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Events</h2>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <button onClick={() => dispatch(eventsActions.clear())}
                className="text-surface-500 hover:text-alarm transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-surface-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto py-2">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Bell className="w-8 h-8 text-surface-800" />
              <p className="text-surface-600 text-sm">No events</p>
            </div>
          ) : (
            events.map((ev) => {
              const Icon = EVENT_ICONS[ev.type] || EVENT_ICONS.default;
              const isAlarm = ev.type === 'alarm';
              return (
                <div key={ev.id} className={`mx-3 mb-2 rounded-xl p-3 border ${
                  isAlarm ? 'bg-alarm/10 border-alarm/20' : 'bg-surface-800/50 border-white/5'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isAlarm ? 'bg-alarm/20' : 'bg-brand-600/20'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isAlarm ? 'text-alarm' : 'text-brand-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium capitalize">{ev.type}</p>
                      {ev.attributes?.message && (
                        <p className="text-[11px] text-surface-400 mt-0.5 truncate">{ev.attributes.message}</p>
                      )}
                      <p className="text-[10px] text-surface-600 mt-1">{dayjs(ev.eventTime).fromNow()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { devicesActions, eventsActions, sessionActions } from './store';
import Toast from './components/ui/Toast';
import { getServerUrl, apiFetch } from './api';

const LOGOUT_CODE   = 4000;
const RECONNECT_DELAY = 60_000;

const SocketController = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const authenticated = useSelector((s) => Boolean(s.session.user));
  const socketRef     = useRef(null);
  const timerRef      = useRef(null);
  const [toasts, setToasts] = useState([]);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const connect = useCallback(() => {
    clearTimer();
    if (socketRef.current?.readyState !== WebSocket.CLOSED && socketRef.current) {
      socketRef.current.close();
    }
    // Build WebSocket URL from the saved server URL
    const base   = getServerUrl();
    const wsBase = base.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsBase}/api/socket`);
    socketRef.current = socket;

    socket.onopen  = () => dispatch(sessionActions.updateSocket(true));

    socket.onclose = async (e) => {
      dispatch(sessionActions.updateSocket(false));
      if (e.code === LOGOUT_CODE) return;
      try {
        const [dr, pr] = await Promise.all([
          apiFetch('/api/devices'),
          apiFetch('/api/positions'),
        ]);
        if (dr.status === 401) { navigate('/login'); return; }
        if (dr.ok) dispatch(devicesActions.update(await dr.json()));
        if (pr.ok) dispatch(sessionActions.updatePositions(await pr.json()));
      } catch { /* ignore */ }
      timerRef.current = setTimeout(connect, RECONNECT_DELAY);
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.devices)   dispatch(devicesActions.update(data.devices));
      if (data.positions) dispatch(sessionActions.updatePositions(data.positions));
      if (data.events) {
        dispatch(eventsActions.add(data.events));
        data.events.forEach((ev) => {
          if (ev.attributes?.message) addToast(ev.attributes.message);
        });
        const hasAlarm = data.events.some((ev) => ev.type === 'alarm');
        if (hasAlarm) {
          try { new Audio('/alarm.mp3').play(); } catch { /* ignore */ }
        }
      }
    };
  }, [dispatch, navigate, addToast]);

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const r = await apiFetch('/api/devices');
      if (r.ok) dispatch(devicesActions.refresh(await r.json()));
    })();
    connect();
    const reconnectIfNeeded = () => {
      const s = socketRef.current;
      if (!s || s.readyState === WebSocket.CLOSED) connect();
    };
    const onVisibility = () => { if (!document.hidden) reconnectIfNeeded(); };
    window.addEventListener('online', reconnectIfNeeded);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimer();
      socketRef.current?.close(LOGOUT_CODE);
      window.removeEventListener('online', reconnectIfNeeded);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authenticated, connect, dispatch]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => <Toast key={t.id} message={t.message} />)}
    </div>
  );
};

export default SocketController;

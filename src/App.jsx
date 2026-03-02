import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { sessionActions } from './store';
import SocketController from './SocketController';
import Loader from './components/ui/Loader';
import BottomNav from './components/BottomNav';
import { apiFetch } from './api';

const App = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { pathname, search } = useLocation();
  const user       = useSelector((s) => s.session.user);
  const newServer  = useSelector((s) => s.session.server?.newServer);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sr, ur] = await Promise.all([
          apiFetch('/api/server'),
          apiFetch('/api/session'),
        ]);
        if (sr.ok) dispatch(sessionActions.updateServer(await sr.json()));
        if (ur.ok) {
          dispatch(sessionActions.updateUser(await ur.json()));
        } else {
          window.sessionStorage.setItem('postLogin', pathname + search);
          navigate(newServer ? '/register' : '/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !user) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <SocketController />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default App;

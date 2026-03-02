import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Navigation from './Navigation';
import store from './store';

// Fetch server config on startup
fetch('/api/server')
  .then((r) => r.ok ? r.json() : null)
  .then((server) => {
    if (server) {
      store.dispatch({ type: 'session/updateServer', payload: server });
    }
  })
  .catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);

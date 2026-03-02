/**
 * Centralised API helper.
 * Reads the server base URL from localStorage ('serverUrl').
 * Falls back to the current origin (same-host deployment).
 */

export const getServerUrl = () => {
  const raw = localStorage.getItem('serverUrl') || '';
  // Normalise: remove trailing slash
  return raw.replace(/\/+$/, '') || window.location.origin;
};

export const setServerUrl = (url) => {
  const normalised = url.trim().replace(/\/+$/, '');
  localStorage.setItem('serverUrl', normalised);
};

/**
 * Drop-in replacement for fetch() that prepends the server URL.
 * Usage: apiFetch('/api/session')  →  GET http://your-server/api/session
 */
export const apiFetch = (path, options = {}) => {
  const base = getServerUrl();
  const url  = base + path;
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
};

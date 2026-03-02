import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Satellite, KeyRound, Server, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { sessionActions } from '../store';
import { getServerUrl, setServerUrl, apiFetch } from '../api';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const isValidUrl = (s) => {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── server config
  const [serverUrl,     setServerUrlState] = useState(() => getServerUrl());
  const [serverOpen,    setServerOpen]     = useState(false);
  const [serverInput,   setServerInput]    = useState(() => getServerUrl());
  const [serverStatus,  setServerStatus]   = useState(null); // null | 'checking' | 'ok' | 'error'
  const [serverInfo,    setServerInfo]     = useState(null); // { name, version }

  // ── credentials
  const [email,      setEmail]      = useState(() => localStorage.getItem('loginEmail') || '');
  const [password,   setPassword]   = useState('');
  const [code,       setCode]       = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [codeNeeded, setCodeNeeded] = useState(false);
  const [failed,     setFailed]     = useState(false);
  const [errMsg,     setErrMsg]     = useState('');
  const [loading,    setLoading]    = useState(false);

  // ── server capabilities (fetched after URL confirmed)
  const [serverCaps, setServerCaps] = useState(null);

  useEffect(() => { localStorage.setItem('loginEmail', email); }, [email]);

  // Probe the server URL
  const probeServer = async (url) => {
    const normalised = url.trim().replace(/\/+$/, '');
    if (!isValidUrl(normalised)) {
      setServerStatus('error');
      setServerInfo(null);
      return;
    }
    setServerStatus('checking');
    setServerInfo(null);
    try {
      const r = await fetch(`${normalised}/api/server`, { credentials: 'include' });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setServerStatus('ok');
      setServerInfo({ name: data.name || 'Traccar', version: data.version || '' });
      setServerCaps(data);
    } catch {
      setServerStatus('error');
      setServerInfo(null);
    }
  };

  // Probe on first render (with current saved URL)
  useEffect(() => { probeServer(serverUrl); }, []);

  const handleSaveServer = () => {
    const normalised = serverInput.trim().replace(/\/+$/, '');
    setServerUrl(normalised);
    setServerUrlState(normalised);
    probeServer(normalised);
    setServerOpen(false);
  };

  // ── login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFailed(false); setErrMsg('');
    setLoading(true);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const body  = code ? `${query}&code=${code}` : query;
      const r = await apiFetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(body),
      });
      if (r.ok) {
        const user = await r.json();
        dispatch(sessionActions.updateUser(user));
        dispatch(sessionActions.updateServer(serverCaps));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (r.status === 401 && r.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeNeeded(true);
      } else {
        const msg = await r.text();
        setErrMsg(msg || 'Invalid email or password');
        setFailed(true);
        setPassword('');
      }
    } catch {
      setErrMsg('Network error — check server connection');
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenId = () => { document.location = `${serverUrl}/api/session/openid/auth`; };

  const registrationEnabled = serverCaps?.registration;
  const emailEnabled        = serverCaps?.emailEnabled;
  const openIdEnabled       = serverCaps?.openIdEnabled;
  const openIdForced        = serverCaps?.openIdEnabled && serverCaps?.openIdForce;

  // ── hostname label for display
  const hostLabel = (() => {
    try { return new URL(serverUrl).host; } catch { return serverUrl; }
  })();

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center relative overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-glow">
            <Satellite className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {serverInfo?.name || 'Traccar Modern'}
          </h1>
          <p className="text-surface-400 text-sm mt-1">GPS Fleet Management</p>
        </div>

        {/* ── Server selector pill ── */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setServerOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 bg-surface-800/80 border border-surface-700 hover:border-surface-500 rounded-xl px-4 py-2.5 transition-all group"
          >
            <Server className="w-4 h-4 text-surface-500 flex-shrink-0" />
            <span className="flex-1 text-left text-sm text-surface-300 truncate">{hostLabel}</span>
            {serverStatus === 'checking' && (
              <span className="w-2 h-2 rounded-full bg-stopped animate-pulse" />
            )}
            {serverStatus === 'ok' && (
              <CheckCircle2 className="w-4 h-4 text-online flex-shrink-0" />
            )}
            {serverStatus === 'error' && (
              <XCircle className="w-4 h-4 text-alarm flex-shrink-0" />
            )}
            {serverOpen
              ? <ChevronUp   className="w-4 h-4 text-surface-500" />
              : <ChevronDown className="w-4 h-4 text-surface-500" />}
          </button>

          {/* Expanded panel */}
          {serverOpen && (
            <div className="mt-2 glass rounded-xl border border-white/10 p-4 space-y-3 animate-fade-in">
              <div>
                <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">
                  Traccar Server URL
                </label>
                <input
                  type="url"
                  value={serverInput}
                  onChange={(e) => setServerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveServer()}
                  placeholder="https://demo.traccar.org"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all font-mono"
                />
              </div>

              {/* Status feedback */}
              {serverStatus === 'checking' && (
                <p className="text-xs text-stopped flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stopped animate-pulse" />
                  Checking server…
                </p>
              )}
              {serverStatus === 'ok' && serverInfo && (
                <p className="text-xs text-online flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected — <span className="font-semibold">{serverInfo.name}</span>
                  {serverInfo.version && <span className="text-surface-500 ml-1">v{serverInfo.version}</span>}
                </p>
              )}
              {serverStatus === 'error' && (
                <p className="text-xs text-alarm flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Cannot reach server — check URL and CORS
                </p>
              )}

              {/* Quick presets */}
              <div>
                <p className="text-[10px] text-surface-600 mb-1.5 uppercase tracking-widest">Quick presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Demo', url: 'https://demo.traccar.org' },
                    { label: 'localhost', url: 'http://localhost:8082' },
                    { label: 'This origin', url: window.location.origin },
                  ].map((p) => (
                    <button key={p.url} type="button"
                      onClick={() => { setServerInput(p.url); probeServer(p.url); }}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-surface-700 hover:bg-surface-600 text-surface-400 hover:text-white transition-all">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveServer}
                disabled={!isValidUrl(serverInput)}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition-all">
                Save & Connect
              </button>
            </div>
          )}
        </div>

        {/* ── Login card ── */}
        <div className="glass rounded-2xl p-8">
          {/* Block login if server unreachable */}
          {serverStatus === 'error' && (
            <p className="text-xs text-alarm bg-alarm/10 border border-alarm/20 rounded-lg px-3 py-2 mb-4 text-center">
              Server unreachable — configure the URL above ↑
            </p>
          )}

          {!openIdForced && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoFocus={!email}
                  disabled={serverStatus === 'error'}
                  className={`w-full bg-surface-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-1 transition-all disabled:opacity-40 ${
                    failed ? 'border-alarm focus:border-alarm focus:ring-alarm/30' : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/30'
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus={!!email}
                    disabled={serverStatus === 'error'}
                    className={`w-full bg-surface-800 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-1 transition-all disabled:opacity-40 ${
                      failed ? 'border-alarm focus:border-alarm focus:ring-alarm/30' : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/30'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* TOTP */}
              {codeNeeded && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">
                    <KeyRound className="inline w-3 h-3 mr-1" />Authenticator Code
                  </label>
                  <input
                    type="number" required value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all font-mono tracking-widest"
                  />
                </div>
              )}

              {/* Error */}
              {failed && errMsg && (
                <p className="text-xs text-alarm bg-alarm/10 border border-alarm/20 rounded-lg px-3 py-2 animate-fade-in">
                  {errMsg}
                </p>
              )}

              <button type="submit"
                disabled={loading || !email || !password || (codeNeeded && !code) || serverStatus !== 'ok'}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 hover:shadow-glow active:scale-[0.98] mt-1">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {openIdEnabled && (
            <button onClick={handleOpenId}
              className="w-full mt-3 bg-surface-700 hover:bg-surface-600 text-white font-medium rounded-xl py-3 text-sm transition-all">
              Sign in with OpenID
            </button>
          )}

          {!openIdForced && (registrationEnabled || emailEnabled) && (
            <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-white/5">
              {registrationEnabled && (
                <button onClick={() => navigate('/register')}
                  className="text-xs text-surface-400 hover:text-brand-400 transition-colors">
                  Create account
                </button>
              )}
              {emailEnabled && (
                <button onClick={() => navigate('/reset-password')}
                  className="text-xs text-surface-400 hover:text-brand-400 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

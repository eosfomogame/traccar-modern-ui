import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch(`/api/password/reset?email=${encodeURIComponent(email)}`, { method: 'POST' });
      if (r.ok) setSent(true);
      else setError('Email not found or service unavailable');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-online/20 flex items-center justify-center">
                <Mail className="w-7 h-7 text-online" />
              </div>
              <p className="text-white font-medium text-center">Check your inbox</p>
              <p className="text-surface-400 text-sm text-center">Password reset instructions sent to {email}</p>
              <button onClick={() => navigate('/login')}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-white font-semibold text-lg">Reset Password</h2>
              <div>
                <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-all" />
              </div>
              {error && <p className="text-xs text-alarm bg-alarm/10 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-xs text-surface-400 hover:text-white transition-colors mx-auto">
                <ArrowLeft className="w-3 h-3" /> Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

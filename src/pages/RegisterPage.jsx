import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (r.ok) {
        navigate('/login');
      } else {
        setError(await r.text() || 'Registration failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4">
            <Satellite className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Create Account</h1>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {['name','email','password'].map((field) => (
              <div key={field}>
                <label className="block text-[10px] font-semibold text-surface-400 mb-1.5 uppercase tracking-widest">{field}</label>
                <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  required
                  value={field === 'name' ? name : field === 'email' ? email : password}
                  onChange={(e) => field === 'name' ? setName(e.target.value) : field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            ))}
            {error && <p className="text-xs text-alarm bg-alarm/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50">
              {loading ? 'Creating…' : 'Register'}
            </button>
          </form>
          <button onClick={() => navigate('/login')}
            className="mt-4 flex items-center gap-2 text-xs text-surface-400 hover:text-white transition-colors mx-auto">
            <ArrowLeft className="w-3 h-3" /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

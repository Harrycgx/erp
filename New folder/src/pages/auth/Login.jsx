import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, getRoleHomePath } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { profile } = await login({ email, password });
      const destination = getRoleHomePath(profile?.role || 'customer');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),transparent_20%),linear-gradient(180deg,#070b16_0%,#090d16_100%)] px-4 py-20 text-white">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Mayur Packaging</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Sign in to your factory workspace</h1>
          <p className="text-sm text-slate-400">Secure access for admin, staff, customer and vendor roles.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>

          {error ? <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-left text-slate-300 hover:text-white">
            Forgot password?
          </button>
          <button type="button" onClick={() => navigate('/register')} className="text-left text-slate-300 hover:text-white">
            Create an account
          </button>
        </div>
      </div>
    </section>
  );
}

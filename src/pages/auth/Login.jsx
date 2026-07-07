import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[TRACE:1] handleSubmit() ENTERED", { email: email.trim(), passwordLength: password.length });
    setError('');

    if (!email.trim() || !password.trim()) {
      console.log("[TRACE:1a] handleSubmit() ABORTED — empty fields");
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      console.log("[TRACE:2] Calling login({ email, password })...");
      const loginResult = await login({ email, password });
      console.log("[TRACE:7] login() RETURNED successfully", { hasUser: !!loginResult?.user, hasProfile: !!loginResult?.profile });
      navigate(from, { replace: true });
      console.log("[TRACE:8] navigate() called — redirecting to", from);
    } catch (err) {
      console.log("[TRACE:6] login() REJECTED / THREW", { message: err?.message, name: err?.name, stack: err?.stack?.substring(0, 200) });
      setError(err?.message || 'Unable to sign in. Please check your staff credentials.');
    } finally {
      setLoading(false);
      console.log("[TRACE:9] handleSubmit() FINISHED (finally block)");
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),transparent_20%),linear-gradient(180deg,#070b16_0%,#090d16_100%)] px-4 py-20 text-white">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Mayur Packaging</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Factory ERP Workspace</h1>
          <p className="text-sm text-slate-400">Secure staff-only access for manufacturing operations.</p>
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

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-center text-slate-300 hover:text-white">
            Forgot password?
          </button>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setMessage('A password reset link has been sent to your inbox if the email exists.');
    } catch (err) {
      setError(err?.message || 'Unable to process password reset right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),transparent_20%),linear-gradient(180deg,#070b16_0%,#090d16_100%)] px-4 py-20 text-white">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Password reset</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Recover your account</h1>
          <p className="text-sm text-slate-400">Enter your email and follow the reset link sent by Supabase.</p>
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

          {error ? <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {message ? <p className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending reset link…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Remembered your password?{' '}
          <button type="button" onClick={() => navigate('/login')} className="font-semibold text-white hover:text-orange-300">
            Back to login
          </button>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AudioHub from './components/AudioHub.jsx';
import WealthTracker from './components/WealthTracker.jsx';
import LearningDashboard from './components/LearningDashboard.jsx';
import RoutineLog from './components/RoutineLog.jsx';
import api from './services/api.js';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function AppContent() {
  const { user, logout, login, register, loading, error } = useAuth();
  const [mode, setMode] = useState('dashboard');
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, incomes: [], expenses: [], categories: {} });
  const [study, setStudy] = useState({ sessions: [], totalHours: 0 });
  const [habits, setHabits] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const wealth = await api.get('/wealth/summary');
        setSummary(wealth.data);
        const studyRes = await api.get('/study');
        setStudy(studyRes.data);
        const habitRes = await api.get('/habits');
        setHabits(habitRes.data.habits);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [user, refresh]);

  const balance = useMemo(() => summary.totalIncome - summary.totalExpense, [summary]);
  const walletLabel = balance >= 0 ? 'Wallet Balance' : 'Overdrawn';

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-glass rounded-3xl p-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">Trackwise Super App</h1>
            <p className="mt-2 text-slate-400">Log in or register to manage focus, finances, study, and habits.</p>
          </div>

          <div className="flex gap-2 rounded-full bg-slate-800 p-1 text-sm text-slate-300">
            <button className={`flex-1 rounded-full py-2 ${authMode === 'login' ? 'bg-slate-700 text-white' : ''}`} onClick={() => setAuthMode('login')}>Login</button>
            <button className={`flex-1 rounded-full py-2 ${authMode === 'register' ? 'bg-slate-700 text-white' : ''}`} onClick={() => setAuthMode('register')}>Register</button>
          </div>

          <AuthForm mode={authMode} onLogin={login} onRegister={register} loading={loading} error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),#020617] text-slate-100">
      <div className="max-w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Trackwise</p>
            <h1 className="text-3xl font-semibold">Personal Focus & Finance</h1>
            <p className="mt-2 text-slate-400 max-w-2xl">Unified dashboard for audio focus, wealth tracking, study flow, and daily habit analytics.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-4 shadow-glass">
              <p className="text-sm text-slate-400">{walletLabel}</p>
              <p className="text-3xl font-semibold text-emerald-300">${balance.toFixed(2)}</p>
            </div>
            <button className="rounded-3xl bg-cyan-500 px-5 py-3 text-slate-950 font-semibold shadow-glass hover:bg-cyan-400" onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <AudioHub />
          <main className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2">
              <button className={`rounded-3xl p-5 bg-slate-900/80 border border-white/10 shadow-glass text-left ${mode === 'dashboard' ? 'ring-2 ring-cyan-400/60' : ''}`} onClick={() => setMode('dashboard')}>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Dashboard</p>
                <h2 className="mt-2 text-xl font-semibold">Overview</h2>
              </button>
              <button className={`rounded-3xl p-5 bg-slate-900/80 border border-white/10 shadow-glass text-left ${mode === 'wealth' ? 'ring-2 ring-emerald-400/60' : ''}`} onClick={() => setMode('wealth')}>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Wealth</p>
                <h2 className="mt-2 text-xl font-semibold">Expense & Income</h2>
              </button>
            </section>

            {mode === 'dashboard' && (
              <div className="grid gap-6">
                <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass">
                  <h3 className="text-lg font-semibold">Cashflow Overview</h3>
                  <p className="mt-2 text-slate-400">Total Income vs Total Expense.</p>
                  <div className="mt-4 h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: 'Overall', Income: summary.totalIncome, Expense: summary.totalExpense }]}>
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }} />
                        <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass">
                    <h3 className="text-lg font-semibold">Study Flow Progress</h3>
                    <p className="mt-2 text-slate-400">Tracked hours today with dynamic progress.</p>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl bg-slate-950/60 p-4">
                        <p className="text-sm uppercase text-slate-400">Total study hours</p>
                        <p className="mt-2 text-3xl font-semibold text-cyan-300">{study.totalHours.toFixed(1)}h</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/60 p-4">
                        <p className="text-sm uppercase text-slate-400">Tasks completed</p>
                        <p className="mt-2 text-3xl font-semibold text-emerald-300">{study.sessions.filter(item => item.completed).length}/{study.sessions.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass">
                    <h3 className="text-lg font-semibold">Routine Success</h3>
                    <p className="mt-2 text-slate-400">Glass cards show daily habit rate and streaks.</p>
                    <div className="mt-5 grid gap-4">
                      {habits.slice(0, 3).map((habit) => {
                        const done = habit.logs.filter((log) => log.completed).length;
                        const total = habit.logs.length || 1;
                        const percent = Math.round((done / total) * 100);
                        return (
                          <div key={habit.id} className="rounded-3xl bg-slate-950/60 p-4 border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{habit.name}</p>
                              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-100">{percent}%</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-cyan-400" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === 'wealth' && <WealthTracker onDataChange={() => setRefresh((prev) => !prev)} />}
            {mode === 'study' && <LearningDashboard onDataChange={() => setRefresh((prev) => !prev)} />}
            {mode === 'habits' && <RoutineLog onDataChange={() => setRefresh((prev) => !prev)} />}

            <div className="grid gap-4 sm:grid-cols-3">
              <button className={`rounded-3xl p-5 bg-slate-900/80 border border-white/10 shadow-glass ${mode === 'wealth' ? 'ring-2 ring-emerald-400/60' : ''}`} onClick={() => setMode('wealth')}>Wealth Tracker</button>
              <button className={`rounded-3xl p-5 bg-slate-900/80 border border-white/10 shadow-glass ${mode === 'study' ? 'ring-2 ring-cyan-400/60' : ''}`} onClick={() => setMode('study')}>Learning Dashboard</button>
              <button className={`rounded-3xl p-5 bg-slate-900/80 border border-white/10 shadow-glass ${mode === 'habits' ? 'ring-2 ring-violet-400/60' : ''}`} onClick={() => setMode('habits')}>Routine Log</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode, onLogin, onRegister, loading, error }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin({ email: form.email, password: form.password });
    } else {
      onRegister({ username: form.username, email: form.email, password: form.password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
      )}
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
      <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50">
        {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
      </button>
    </form>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

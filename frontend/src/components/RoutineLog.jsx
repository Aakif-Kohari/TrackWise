import { useEffect, useState, useMemo } from 'react';
import api from '../services/api.js';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RoutineLog({ onDataChange }) {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('Meditation');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data.habits);
    } catch (err) {
      console.error(err);
    }
  };

  const createHabit = async () => {
    if (!name) return;
    try {
      await api.post('/habits', { name, targetDays: 7 });
      setName('');
      await loadHabits();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = async (habitId, completed) => {
    try {
      await api.patch(`/habits/${habitId}/toggle`, { completed: !completed });
      await loadHabits();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const completedRate = (habit) => {
    const done = habit.logs.filter((log) => log.completed).length;
    const total = habit.logs.length || 1;
    return Math.round((done / total) * 100);
  };

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      let done = 0;
      habits.forEach(h => {
        const log = h.logs.find(l => new Date(l.date).toISOString().slice(0,10) === dateStr);
        if (log && log.completed) done++;
      });
      data.push({ name: d.toLocaleDateString(undefined, {weekday: 'short'}), completed: done });
    }
    return data;
  }, [habits]);

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300/80">Routine Log</p>
          <h2 className="text-2xl font-semibold">Glassomorphism habit tracker</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
          <p className="text-slate-400">Add your daily habits and track success rate with a glossy app feel.</p>
          <div className="mt-4 flex gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" className="flex-1 rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none" />
            <button onClick={createHabit} className="rounded-3xl bg-violet-500 px-5 py-3 text-slate-950 font-semibold hover:bg-violet-400">Add</button>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
          <h3 className="text-lg font-semibold">Activity (Last 7 Days)</h3>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {habits.map((habit) => (
          <div key={habit.id} className="rounded-3xl bg-slate-950/60 border border-white/10 p-5 shadow-glass backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{habit.name}</p>
                <p className="text-sm text-slate-400">Target {habit.targetDays} days</p>
              </div>
              <button onClick={() => toggle(habit.id, habit.logs.some((log) => log.completed))} className="rounded-3xl bg-cyan-500 px-4 py-3 text-slate-950 font-semibold hover:bg-cyan-400">Toggle today</button>
            </div>
            <div className="mt-4 grid gap-3">
              {habit.logs.slice(-4).map((log) => (
                <div key={log.id} className={`rounded-3xl px-4 py-3 ${log.completed ? 'bg-emerald-500/10 border border-emerald-400/20' : 'bg-slate-900/70 border border-white/10'}`}>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                    <span>{log.completed ? 'Done' : 'Missed'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

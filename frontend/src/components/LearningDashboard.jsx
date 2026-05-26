import { useEffect, useState } from 'react';
import api from '../services/api.js';

const defaultTopics = ['DSC', 'AI Tools', 'React Flow', 'Finance Math'];

export default function LearningDashboard({ onDataChange }) {
  const [sessions, setSessions] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [goal, setGoal] = useState(4);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.get('/study');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addTopic = async (topic) => {
    if (!topic) return;
    try {
      await api.post('/study', { topic, goalHours: goal });
      setNewTopic('');
      await loadSessions();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const updateHours = async (id, amount) => {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;
    const newHours = Math.max(0, session.hours + amount);
    try {
      await api.patch(`/study/${id}`, { hours: newHours, completed: newHours >= session.goalHours });
      await loadSessions();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const progress = (session) => Math.min(100, (session.hours / session.goalHours) * 100);
  const totalHours = sessions.reduce((sum, item) => sum + item.hours, 0);

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Learning Dashboard</p>
          <h2 className="text-2xl font-semibold">Steady Flow study tracker</h2>
        </div>
        <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-slate-300">Total {totalHours.toFixed(1)} hours</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5 space-y-4">
          <p className="text-slate-400">Add a study topic and watch the Steady Flow progress meter grow.</p>
          <div className="flex gap-3">
            <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="New topic" className="flex-1 rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none" />
            <button onClick={() => addTopic(newTopic)} className="rounded-3xl bg-cyan-500 px-5 py-3 text-slate-950 font-semibold hover:bg-cyan-400">Add</button>
          </div>
          <div className="rounded-3xl bg-slate-900/70 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Daily goal hours</p>
            <input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value) || 1)} className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          </div>
        </div>
        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
          <h3 className="text-lg font-semibold">Quick start topics</h3>
          <div className="mt-4 grid gap-3">
            {defaultTopics.map((topic) => (
              <button key={topic} onClick={() => addTopic(topic)} className="rounded-3xl bg-slate-900/80 px-4 py-3 text-left text-slate-200 hover:bg-slate-800">{topic}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{session.topic}</p>
                <p className="text-sm text-slate-400">Goal: {session.goalHours}h</p>
              </div>
              <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200">{progress(session).toFixed(0)}% complete</div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-900/80 overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${progress(session)}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => updateHours(session.id, 0.5)} className="rounded-3xl bg-emerald-500 px-4 py-3 text-slate-950 font-semibold">+0.5h</button>
              <button onClick={() => updateHours(session.id, -0.5)} className="rounded-3xl bg-rose-500 px-4 py-3 text-slate-950 font-semibold">-0.5h</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

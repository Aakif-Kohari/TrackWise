import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#34d399', '#3b82f6', '#fbbf24', '#fb7185', '#a78bfa'];

const categories = ['Food', 'Travel', 'Education', 'Fees'];

export default function WealthTracker({ onDataChange }) {
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: '' });
  const [type, setType] = useState('expense');
  const [summary, setSummary] = useState({ incomes: [], expenses: [], totalIncome: 0, totalExpense: 0, categories: {} });

  const loadSummary = async () => {
    try {
      const res = await api.get('/wealth/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) || 0, date: form.date || new Date().toISOString().slice(0, 10) };
    try {
      if (type === 'income') {
        await api.post('/wealth/income', payload);
      } else {
        await api.post('/wealth/expense', payload);
      }
      setForm({ amount: '', category: 'Food', description: '', date: '' });
      await loadSummary();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id, kind) => {
    try {
      await api.delete(`/wealth/${kind}/${id}`);
      await loadSummary();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const reportData = useMemo(() => {
    const categories = Object.entries(summary.categories || {}).map(([name, amount]) => ({ name, value: amount }));
    return categories;
  }, [summary.categories]);

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Trackwise Financial Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Total income: $${summary.totalIncome.toFixed(2)}`, 14, 36);
    doc.text(`Total expense: $${summary.totalExpense.toFixed(2)}`, 14, 44);
    doc.text(`Balance: $${(summary.totalIncome - summary.totalExpense).toFixed(2)}`, 14, 52);
    doc.text('Category breakdown:', 14, 66);
    reportData.forEach((item, index) => {
      doc.text(`${item.name}: $${item.value.toFixed(2)}`, 14, 76 + index * 8);
    });
    doc.save('trackwise-finance-report.pdf');
  };

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Wealth Tracker</p>
          <h2 className="text-2xl font-semibold">Income and expense manager</h2>
        </div>
        <button onClick={generateReport} className="rounded-3xl bg-emerald-500 px-5 py-3 text-slate-950 font-semibold hover:bg-emerald-400">Generate Report</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] mt-6">
        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <p className="text-sm text-slate-400">Total income</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">${summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <p className="text-sm text-slate-400">Total expense</p>
              <p className="mt-2 text-3xl font-semibold text-rose-300">${summary.totalExpense.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-5">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Cashflow', Income: summary.totalIncome, Expense: summary.totalExpense }]}>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }} />
                  <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none">
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {reportData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                  <span className="text-slate-300">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
          <div className="flex gap-3 rounded-full bg-slate-900/80 p-2">
            <button onClick={() => setType('expense')} className={`flex-1 rounded-3xl px-4 py-3 ${type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-300'}`}>Expense</button>
            <button onClick={() => setType('income')} className={`flex-1 rounded-3xl px-4 py-3 ${type === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'}`}>Income</button>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" type="number" className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none" />
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none" />
            <button className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-slate-950 font-semibold hover:bg-cyan-400">Add {type}</button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ListPanel title="Income entries" items={summary.incomes} onDelete={(id) => removeItem(id, 'income')} />
        <ListPanel title="Expense entries" items={summary.expenses} onDelete={(id) => removeItem(id, 'expense')} />
      </div>
    </section>
  );
}

function ListPanel({ title, items, onDelete }) {
  return (
    <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-slate-400">No records yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl bg-slate-900/80 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">${item.amount.toFixed(2)}</p>
              <p className="text-sm text-slate-400">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
              <p className="text-sm text-slate-300">{item.description}</p>
            </div>
            <button onClick={() => onDelete(item.id)} className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-slate-950">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

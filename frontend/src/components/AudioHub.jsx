import { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';

const defaultTracks = [
  { id: 1, title: 'Steady Focus', artist: 'Trackwise Audio', album: 'Focus Waves', cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.mp3', duration: '3:45' },
  { id: 2, title: 'Productive Pulse', artist: 'Trackwise Audio', album: 'Morning Drive', cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/voice.mp3', duration: '4:04' },
  { id: 3, title: 'Glass Train', artist: 'Trackwise Audio', album: 'Routine Flow', cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/drums.mp3', duration: '2:58' }
];

export default function AudioHub() {
  const [tracks, setTracks] = useState(defaultTracks);
  const [active, setActive] = useState(defaultTracks[0]);
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/audio/tracks');
        setTracks(res.data.tracks || defaultTracks);
        setActive(res.data.tracks?.[0] || defaultTracks[0]);
      } catch (err) {
        setTracks(defaultTracks);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [playing, active]);

  const filtered = tracks.filter((track) => track.title.toLowerCase().includes(search.toLowerCase()) || track.artist.toLowerCase().includes(search.toLowerCase()));

  const selectTrack = (track) => {
    setActive(track);
    setPlaying(true);
  };

  return (
    <aside className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-glass backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Focus Audio Hub</p>
        <h2 className="mt-3 text-2xl font-semibold">Your concentration soundtrack</h2>
      </div>
      <div className="space-y-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracks"
          className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {filtered.map((track) => (
            <button key={track.id} onClick={() => selectTrack(track)} className={`w-full rounded-3xl border p-4 text-left transition ${active?.id === track.id ? 'border-cyan-400/60 bg-slate-800/90' : 'border-white/5 bg-slate-950/70 hover:border-white/20'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{track.title}</p>
                  <p className="text-sm text-slate-400">{track.artist}</p>
                </div>
                <span className="rounded-full bg-slate-800/90 px-3 py-1 text-xs text-slate-300">{track.duration}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now playing</p>
          <p className="mt-2 text-xl font-semibold">{active?.title}</p>
          <p className="text-slate-400">{active?.artist}</p>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => setPlaying((v) => !v)} className="rounded-full bg-cyan-500 px-4 py-3 text-slate-950 font-semibold hover:bg-cyan-400">
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => setActive(tracks[(tracks.findIndex((item) => item.id === active?.id) + 1) % tracks.length])} className="rounded-3xl border border-white/10 px-4 py-3 hover:bg-slate-800">Next</button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={active?.cloudinaryUrl} onEnded={() => setPlaying(false)} />
    </aside>
  );
}

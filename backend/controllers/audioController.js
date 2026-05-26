const trackList = [
  {
    id: 1,
    title: 'Steady Focus',
    artist: 'Trackwise Audio',
    album: 'Focus Waves',
    cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.mp3',
    duration: '3:45'
  },
  {
    id: 2,
    title: 'Productive Pulse',
    artist: 'Trackwise Audio',
    album: 'Morning Drive',
    cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/voice.mp3',
    duration: '4:04'
  },
  {
    id: 3,
    title: 'Glass Train',
    artist: 'Trackwise Audio',
    album: 'Routine Flow',
    cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/drums.mp3',
    duration: '2:58'
  }
];

export const getTracks = async (req, res) => {
  res.json({ tracks: trackList });
};

export const getTrackById = async (req, res) => {
  const track = trackList.find((item) => item.id === Number(req.params.id));
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  res.json({ track });
};

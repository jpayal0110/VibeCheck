// DrumSet.jsx
import React from 'react';
import './DrumSet.css';

const drums = [
  { id: 'snare', label: 'Snare', sound: 'public/drumset/snare.mp3' },
  { id: 's', label: 'Hi-Hat', sound: '/drumset/hihat.mp3' },
  { id: 'tom', label: 'Tom', sound: '/drumset/tom.mp3' },
  { id: 'crash', label: 'Crash', sound: '/drumset/crash.mp3' },
];

const playSound = (url) => {
  const audio = new Audio(url);
  audio.play();
};

const DrumSet = () => {
  return (
    <div className="drum-set">
      <h2 className="drum-heading">🥁 Hit the Vibe Drums</h2>
      <div className="drum-kit">
        {drums.map((drum) => (
          <div
            key={drum.id}
            className={`drum ${drum.id}`}
            onMouseDown={(e) => {
              playSound(drum.sound);
              e.currentTarget.classList.add('hit');
              setTimeout(() => e.currentTarget.classList.remove('hit'), 150);
            }}
          >
            {drum.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrumSet;

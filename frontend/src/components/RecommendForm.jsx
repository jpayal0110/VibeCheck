import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './RecommendForm.css';
import DrumSet from './Drumset';


const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const RecommendForm = () => {
  const [prompt, setPrompt] = useState('');
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const audioRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPlayerError('');

    if (!prompt.trim()) return;
    setShowSuggestions(false);

    try {
      const response = await axios.post('http://localhost:5050/recommend', { prompt });
      setSongs(response.data);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  const playSong = (song) => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.src = `http://localhost:5050/${song.file_url}`;
    audioRef.current.load();
    audioRef.current.play();

    setNowPlaying(song);
    setIsPlaying(true);
    setPlayerError('');
  };

  const togglePlayPause = () => {
    if (!nowPlaying || !audioRef.current?.src) {
      setPlayerError('Please select a song first.');
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && duration) {
      const newProgress = parseFloat(e.target.value);
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (
    <div className="recommend-container">
      {/* Sticky Header */}
      <div className="sticky-header">
        <header className="recommend-header">
          <h1 className="hero-title">🎶 VibeCheck 🎶</h1>
        </header>

        <form className="recommend-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="prompt"
            placeholder="What are you in the mood for?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" disabled={!prompt.trim()}>
            Recommend
          </button>
        </form>

        {showSuggestions && (
          <div className="prompt-suggestions">
            {['Something chill', 'Party songs for my party', 'Coding focus beats', 'Romantic rainy night'].map((text, i) => (
              <button
                key={i}
                className="prompt-box"
                onClick={() => {
                  setPrompt(text);
                  setShowSuggestions(false);
                  setTimeout(() => {
                    document.querySelector('form').requestSubmit();
                  }, 0);
                }}
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="error-msg">{error}</p>}
      
      {/* DrumSet appears when no songs */}
      {/* {songs.length === 0 && <DrumSet />} */}
      {/* Song List */}
      <div className="song-list">
        {songs.map((song, idx) => (
          <div className="song-card" key={idx}>
            <p>
              <strong>{song.song_name}</strong> ({song.genre})
            </p>
            <button className="play-button" onClick={() => playSong(song)}>▶</button>
          </div>
        ))}
      </div>

      {/* Music Player */}
      <div className="now-playing-bar">
        <div className="song-info">
          {nowPlaying ? (
            <p><strong>{nowPlaying.song_name}</strong> – {nowPlaying.genre}</p>
          ) : (
            <p><strong>Select a song</strong></p>
          )}
        </div>

        {playerError && <div className="player-error-msg">{playerError}</div>}

        <div className="audio-controls">
          <button className="control-btn"
            onClick={() => {
              if (!nowPlaying) return;
              const index = songs.findIndex(s => s.song_name === nowPlaying.song_name);
              if (index > 0) {
                playSong(songs[index - 1]);
              }
            }}
          >⏮</button>
          <button className="control-btn" onClick={togglePlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn"
            onClick={() => {
              if (!nowPlaying) return;
              const index = songs.findIndex(s => s.song_name === nowPlaying.song_name);
              if (index < songs.length - 1) {
                playSong(songs[index + 1]);
              }
            }}
          >⏭</button>

          <div className="progress-wrapper">
            <span className="time-label">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
            />
            <span className="time-label">{formatTime(duration)}</span>
          </div>
        </div>

        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default RecommendForm;

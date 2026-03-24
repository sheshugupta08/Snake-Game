import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "Neon Dreams (AI Gen)", artist: "CyberSynth", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Digital Horizon (AI Gen)", artist: "Neural Net", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Quantum Groove (AI Gen)", artist: "AlgoRhythm", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-fuchsia-500/50 p-6 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/50">
            <Music className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h3 className="text-fuchsia-400 font-bold text-lg leading-tight">{currentTrack.title}</h3>
            <p className="text-fuchsia-300/60 text-sm">{currentTrack.artist}</p>
          </div>
        </div>
        {isPlaying && (
          <div className="flex gap-1 h-4 items-end">
            <div className="w-1 bg-fuchsia-400 animate-[bounce_1s_infinite] origin-bottom h-full"></div>
            <div className="w-1 bg-fuchsia-400 animate-[bounce_1.2s_infinite] origin-bottom h-2/3"></div>
            <div className="w-1 bg-fuchsia-400 animate-[bounce_0.8s_infinite] origin-bottom h-4/5"></div>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
        className="hidden"
      />

      <div className="flex items-center justify-center gap-6 mb-6">
        <button onClick={prevTrack} className="text-gray-400 hover:text-fuchsia-400 transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center bg-fuchsia-500 hover:bg-fuchsia-400 text-black rounded-full shadow-[0_0_15px_rgba(217,70,239,0.6)] transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button onClick={nextTrack} className="text-gray-400 hover:text-fuchsia-400 transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-fuchsia-400">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>
    </div>
  );
}

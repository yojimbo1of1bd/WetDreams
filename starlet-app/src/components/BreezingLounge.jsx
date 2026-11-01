import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Play, Pause, Sliders, ChevronDown, ChevronUp, Link as LinkIcon, Radio } from 'lucide-react';

export default function BreezingLounge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [selectedChannel, setSelectedChannel] = useState('midnight'); // midnight, rain, chill, custom
  const [customAudioUrl, setCustomAudioUrl] = useState('');

  // Web Audio Context for zero-dependency ambient sound generation
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const customAudioRef = useRef(null);

  // Initialize or resume AudioContext on user play
  const startSyntheticAudio = (channel) => {
    stopSyntheticAudio();

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const oscs = [];

      if (channel === 'midnight') {
        // Deep warm 432Hz ambient chord (F, A, C, E ethereal cluster)
        const freqs = [108, 162, 216, 270, 324, 432];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Subtle detune for rich celestial chorus
          osc.detune.setValueAtTime((idx - 2) * 4, ctx.currentTime);

          // Low volume per voice
          gain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          oscs.push(osc);
        });
      } else if (channel === 'rain') {
        // Soft brown noise / warm rain filter
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        oscs.push(whiteNoise);
      } else if (channel === 'chill') {
        // Ethereal slow dream drone
        const freqs = [130.81, 196.0, 261.63, 392.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.detune.setValueAtTime(idx * 3, ctx.currentTime);
          gain.gain.setValueAtTime(0.1 / freqs.length, ctx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          oscs.push(osc);
        });
      }

      oscillatorsRef.current = oscs;
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  const stopSyntheticAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    oscillatorsRef.current = [];
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSyntheticAudio();
      if (customAudioRef.current) customAudioRef.current.pause();
    } else {
      setIsPlaying(true);
      if (selectedChannel === 'custom' && customAudioUrl) {
        if (customAudioRef.current) {
          customAudioRef.current.volume = volume;
          customAudioRef.current.play().catch(() => {});
        }
      } else {
        startSyntheticAudio(selectedChannel);
      }
    }
  };

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    if (isPlaying) {
      if (channel === 'custom') {
        stopSyntheticAudio();
        if (customAudioRef.current && customAudioUrl) {
          customAudioRef.current.volume = volume;
          customAudioRef.current.play().catch(() => {});
        }
      } else {
        if (customAudioRef.current) customAudioRef.current.pause();
        startSyntheticAudio(channel);
      }
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = newVol;
    }
  };

  useEffect(() => {
    return () => {
      stopSyntheticAudio();
      if (customAudioRef.current) customAudioRef.current.pause();
    };
  }, []);

  return (
    <div className="relative z-40">
      {/* Hidden custom audio element */}
      {customAudioUrl && (
        <audio
          ref={customAudioRef}
          src={customAudioUrl}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Header Pill Controller */}
      <div className="flex items-center gap-1.5 bg-[#171218]/90 border border-[var(--line)] rounded-full px-2.5 py-1 text-xs text-[var(--muted)] shadow-md backdrop-blur-md">
        <button
          onClick={handleTogglePlay}
          className={`p-1.5 rounded-full transition-all ${
            isPlaying
              ? 'bg-[var(--accent)] text-black shadow-md'
              : 'hover:text-white hover:bg-white/5'
          }`}
          title={isPlaying ? 'Pause Breezing Soundscape' : 'Play Breezing Ambient Music'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        {/* Animated Equalizer Visualizer */}
        <div className="flex items-end gap-0.5 h-3 px-1">
          {[0.6, 1.0, 0.4, 0.8].map((h, i) => (
            <motion.div
              key={i}
              animate={isPlaying ? { height: [3, 12 * h, 4, 10 * h, 3] } : { height: 3 }}
              transition={{ repeat: Infinity, duration: 1.2 + i * 0.2, ease: 'easeInOut' }}
              className={`w-0.5 rounded-full ${isPlaying ? 'bg-[var(--accent)]' : 'bg-zinc-600'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 hover:text-[var(--ink)] text-[11px] font-semibold transition-colors pr-1"
        >
          <span className="capitalize">{selectedChannel === 'custom' ? 'Custom Music' : selectedChannel}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Floating Settings Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-10 right-0 w-72 glass rounded-2xl p-4 border border-[var(--line)] shadow-2xl bg-[#140f15]/95 backdrop-blur-xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" /> Breezing Soundscape
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Looped Audio</span>
            </div>

            {/* Soundscape Channels */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'midnight', label: 'Midnight Drone' },
                { id: 'rain', label: 'Velvet Rain' },
                { id: 'chill', label: 'Celestial Dream' },
                { id: 'custom', label: 'Custom Audio' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelChange(ch.id)}
                  className={`text-[11px] py-1.5 px-2.5 rounded-xl border text-left transition-all ${
                    selectedChannel === ch.id
                      ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-bold'
                      : 'bg-[#1b151d] border-[var(--line)] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Custom URL Input Field if selected */}
            {selectedChannel === 'custom' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[var(--muted)] flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Paste Your Audio/Stream URL:
                </label>
                <input
                  type="text"
                  value={customAudioUrl}
                  onChange={(e) => setCustomAudioUrl(e.target.value)}
                  placeholder="https://.../music.mp3"
                  className="w-full bg-[#110c12] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--line)]/50">
              <button
                onClick={() => handleVolumeChange(volume === 0 ? 0.35 : 0)}
                className="text-[var(--muted)] hover:text-white"
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)] h-1 bg-[#231b26] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-zinc-500 w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


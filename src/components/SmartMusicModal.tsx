import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Sparkles,
  ExternalLink,
  Laptop,
  Flame,
  Moon,
  Brain,
  Sliders,
  Search,
} from 'lucide-react';
import {
  smartMusicEngine,
  SMART_TRACKS,
} from '../services/smartMusicEngine';
import { SmartTrack, MusicMood, SmartMusicState, CompanionStatus } from '../types/jarvis';

interface SmartMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionStatus: CompanionStatus;
  onExecutePrompt: (prompt: string) => void;
  onExecutePcAction?: (action: any) => void;
}

export const SmartMusicModal: React.FC<SmartMusicModalProps> = ({
  isOpen,
  onClose,
  companionStatus,
  onExecutePrompt,
  onExecutePcAction,
}) => {
  const [musicState, setMusicState] = useState<SmartMusicState>(smartMusicEngine.getState());
  const [currentTrack, setCurrentTrack] = useState<SmartTrack>(smartMusicEngine.getCurrentTrack());
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = smartMusicEngine.subscribe((state) => {
      setMusicState(state);
      setCurrentTrack(smartMusicEngine.getCurrentTrack());
    });
    return () => unsub();
  }, []);

  // Visualizer loop on canvas
  useEffect(() => {
    if (!isOpen) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const freqData = smartMusicEngine.getFrequencyData();
      const numBars = 32;
      const barWidth = (width / numBars) - 2;

      // Color based on active mood
      const moodColors: Record<MusicMood, string> = {
        stark_lab: '#00f0ff',
        deep_focus: '#a855f7',
        iron_flight: '#f59e0b',
        night_lounge: '#10b981',
      };
      const themeColor = moodColors[musicState.activeMood] || '#00f0ff';

      for (let i = 0; i < numBars; i++) {
        // Value between 0 and 255
        let val = freqData[i] || 0;
        // If paused, show subtle idling ambient wave
        if (!musicState.isPlaying) {
          val = 15 + Math.sin(Date.now() * 0.003 + i * 0.4) * 8;
        }

        const barHeight = Math.max(3, (val / 255) * (height - 8));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, 'rgba(10, 25, 45, 0.4)');
        grad.addColorStop(0.6, themeColor + 'aa');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y - 2, barWidth, 1.5);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, musicState.isPlaying, musicState.activeMood]);

  const handleMoodSelect = (mood: MusicMood) => {
    smartMusicEngine.setMood(mood);
  };

  const handleTrackClick = (track: SmartTrack) => {
    smartMusicEngine.playTrack(track);
  };

  const handleLaunchExternal = (service: 'spotify' | 'youtube_music' | 'search') => {
    if (service === 'spotify') {
      if (companionStatus.connected && onExecutePcAction) {
        onExecutePcAction({
          type: 'companion',
          title: 'Ouvrir Spotify',
          params: { action: 'open_app', target: 'spotify' },
        });
      } else {
        window.open('https://open.spotify.com', '_blank');
      }
    } else if (service === 'youtube_music') {
      if (companionStatus.connected && onExecutePcAction) {
        onExecutePcAction({
          type: 'companion',
          title: 'Ouvrir YouTube Music',
          params: { action: 'open_app', target: 'https://music.youtube.com' },
        });
      } else {
        window.open('https://music.youtube.com', '_blank');
      }
    } else if (service === 'search' && searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim());
      if (companionStatus.connected && onExecutePcAction) {
        onExecutePcAction({
          type: 'companion',
          title: `Recherche Musique: ${searchQuery}`,
          params: { action: 'open_app', target: `https://music.youtube.com/search?q=${query}` },
        });
      } else {
        window.open(`https://music.youtube.com/search?q=${query}`, '_blank');
      }
    }
  };

  const moodsList: Array<{
    id: MusicMood;
    label: string;
    sub: string;
    icon: any;
    color: string;
    border: string;
    bg: string;
  }> = [
    {
      id: 'stark_lab',
      label: 'STARK LAB',
      sub: 'Synthwave & Énergie 124 BPM',
      icon: Zap,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      bg: 'bg-cyan-950/30 hover:bg-cyan-900/40',
    },
    {
      id: 'deep_focus',
      label: 'DEEP FOCUS',
      sub: 'Ondes Alpha 432Hz & Code',
      icon: Brain,
      color: 'text-purple-400',
      border: 'border-purple-500/40 hover:border-purple-400',
      bg: 'bg-purple-950/30 hover:bg-purple-900/40',
    },
    {
      id: 'iron_flight',
      label: 'IRON FLIGHT',
      sub: 'Adrénaline & Orchestral 136 BPM',
      icon: Flame,
      color: 'text-amber-400',
      border: 'border-amber-500/40 hover:border-amber-400',
      bg: 'bg-amber-950/30 hover:bg-amber-900/40',
    },
    {
      id: 'night_lounge',
      label: 'NIGHT LOUNGE',
      sub: 'Lo-Fi Chill & Détente 72 BPM',
      icon: Moon,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bg: 'bg-emerald-950/30 hover:bg-emerald-900/40',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#070b16] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100">
        {/* Holographic Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/25 bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Music className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] font-bold text-sm sm:text-base tracking-wider text-cyan-300">
                  JARVIS // SMART MUSIQUE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                  {musicState.isPlaying ? 'LECTURE EN COURS' : 'EN VEILLE'}
                </span>
                {musicState.isDucked && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono animate-pulse">
                    ATTÉNUATION VOCALE (JARVIS PARLE)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Synthétiseur audio procédural Web Audio · Flux haute fidélité · Pilote multimédia PC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-200 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          {/* Main Visualizer & Current Player Deck */}
          <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/30 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Spectrum Visualizer Canvas */}
            <div className="w-full h-24 mb-3 rounded-lg bg-black/70 border border-cyan-500/20 overflow-hidden relative flex items-end">
              <canvas
                ref={canvasRef}
                width={700}
                height={96}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-3 flex items-center gap-2 text-[10px] font-mono text-cyan-400/80">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SPECTRE TEMPS-RÉEL (FFT 64 BINS)</span>
              </div>
              <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400">
                {currentTrack.bpm} BPM · {currentTrack.type === 'procedural' ? 'PROCÉDURAL CONTINU' : 'FLUX STREAM'}
              </div>
            </div>

            {/* Track Info & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400">
                  {currentTrack.artist}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-['Rajdhani'] text-slate-100 truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {currentTrack.description}
                </p>
              </div>

              {/* Central Transport Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => smartMusicEngine.prevTrack()}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
                  title="Piste précédente"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => smartMusicEngine.togglePlay()}
                  className={`p-3.5 rounded-full border transition-all flex items-center justify-center ${
                    musicState.isPlaying
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:bg-cyan-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300'
                  }`}
                  title={musicState.isPlaying ? 'Mettre en pause' : 'Lancer la lecture'}
                >
                  {musicState.isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={() => smartMusicEngine.nextTrack()}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
                  title="Piste suivante"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 pl-2 border-l border-cyan-500/20">
                  <button
                    onClick={() => smartMusicEngine.toggleMute()}
                    className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
                    title={musicState.isMuted ? 'Activer le son' : 'Couper le son'}
                  >
                    {musicState.isMuted || musicState.volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicState.isMuted ? 0 : musicState.volume}
                    onChange={(e) => smartMusicEngine.setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    title={`Volume : ${Math.round(musicState.volume * 100)}%`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                    {musicState.isMuted ? '0%' : `${Math.round(musicState.volume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Smart Mood Modes Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-['Orbitron'] text-xs font-semibold text-cyan-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                MODES D'AMBIANCE INTELLIGENTS (SYNTHÈSE INSTANTANÉE)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                CLIQUEZ POUR BASCULER L'ATMOSPHÈRE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {moodsList.map((m) => {
                const Icon = m.icon;
                const isActive = musicState.activeMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMoodSelect(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${m.bg} ${m.border} ${
                      isActive ? 'ring-2 ring-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${m.color}`} />
                        <span className="font-['Rajdhani'] font-bold text-sm tracking-wide text-slate-100">
                          {m.label}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-mono">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {m.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track Library / Playlist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-['Orbitron'] text-xs font-semibold text-cyan-300 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                BIBLIOTHÈQUE DE FLUX & PISTES PROCÉDURALES
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {SMART_TRACKS.length} SOURCES DISPONIBLES
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SMART_TRACKS.map((t) => {
                const isSelected = currentTrack.id === t.id;
                const isPlayingThis = isSelected && musicState.isPlaying;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleTrackClick(t)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isPlayingThis
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {isPlayingThis ? (
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {t.title}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-slate-400 font-mono">
                            {t.type === 'procedural' ? 'PROCÉDURAL' : 'STREAM'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {t.artist} · {t.bpm} BPM
                        </p>
                      </div>
                    </div>

                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                      title={t.mood}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* PC Bridge & External Music Apps Integration */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <h4 className="font-['Orbitron'] text-xs font-semibold text-slate-200 tracking-wider">
                  CONTRÔLE MUSICAL PC WINDOWS & SERVICES EXTERNES
                </h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                companionStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                PONT PC : {companionStatus.connected ? 'CONNECTÉ (PORT 7890)' : 'DÉCONNECTÉ'}
              </span>
            </div>

            {/* Quick PC search bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher un artiste, album ou titre sur YouTube Music / PC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLaunchExternal('search');
                  }}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/50 border border-slate-700 focus:border-cyan-400 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                />
              </div>
              <button
                onClick={() => handleLaunchExternal('search')}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 text-xs font-['Rajdhani'] font-bold transition-colors flex items-center gap-1.5"
              >
                <span>LANCER</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct App Launchers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => handleLaunchExternal('spotify')}
                className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                title="Ouvrir Spotify sur Windows ou dans le navigateur"
              >
                <span>SPOTIFY</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleLaunchExternal('youtube_music')}
                className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 hover:border-red-400 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                title="Ouvrir YouTube Music"
              >
                <span>YT MUSIC</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  if (companionStatus.connected && onExecutePcAction) {
                    onExecutePcAction({
                      type: 'companion',
                      title: 'Windows Média Play/Pause',
                      params: { action: 'media_control', subaction: 'play_pause' },
                    });
                  } else {
                    smartMusicEngine.togglePlay();
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                title="Touche multimédia Windows Play/Pause"
              >
                <span>MÉDIA PC PLAY/PAUSE</span>
              </button>

              <button
                onClick={() => {
                  if (companionStatus.connected && onExecutePcAction) {
                    onExecutePcAction({
                      type: 'companion',
                      title: 'Piste suivante PC',
                      params: { action: 'media_control', subaction: 'next' },
                    });
                  } else {
                    smartMusicEngine.nextTrack();
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                title="Touche multimédia Windows Piste Suivante"
              >
                <span>PC MORCEAU SUIVANT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/20 bg-slate-950/80 text-[11px] text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Audio Ducking actif : JARVIS baisse automatiquement le volume pendant qu'il parle ou qu'il écoute.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onExecutePrompt('Active le mode musique Stark Lab et donne-moi un statut de production');
              }}
              className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
            >
              Demander à JARVIS par la voix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

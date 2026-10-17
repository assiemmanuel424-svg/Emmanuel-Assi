import React from 'react';
import { Brain } from 'lucide-react';
import { JarvisState } from '../types/jarvis';

interface MinimalJarvisCoreProps {
  state: JarvisState;
  soundLevel?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export const MinimalJarvisCore: React.FC<MinimalJarvisCoreProps> = ({
  state,
  soundLevel = 0,
  onClick,
  disabled = false,
}) => {
  const dynamicScale = 1 + soundLevel * 0.12;

  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'idle':
      default:
        return 'Ready';
    }
  };

  const getStateSubColor = () => {
    switch (state) {
      case 'listening':
        return 'text-cyan-400';
      case 'thinking':
        return 'text-amber-400';
      case 'speaking':
        return 'text-sky-300';
      case 'idle':
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Interactive Core */}
      <div
        onClick={!disabled ? onClick : undefined}
        className={`group relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
        }`}
        title={
          state === 'speaking'
            ? 'Cliquer pour interrompre la parole'
            : state === 'listening'
            ? 'Cliquer pour stopper l\'écoute'
            : 'Cliquer pour parler à J.A.R.V.I.S.'
        }
      >
        {/* Ambient Radial Energy Glow */}
        <div
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            state === 'thinking'
              ? 'w-48 h-48 bg-amber-500/15 blur-2xl animate-pulse'
              : state === 'listening'
              ? 'w-56 h-56 bg-cyan-400/25 blur-3xl animate-pulse'
              : state === 'speaking'
              ? 'w-52 h-52 bg-sky-400/20 blur-2xl'
              : 'w-44 h-44 bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20'
          }`}
        />

        {/* Dynamic Acoustic Echo Rings when speaking or listening */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-cyan-500/15 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Concentric Holographic Rings (Pixel-perfect to images.jpg) */}
        <div
          className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center transition-transform"
          style={{ transform: `scale(${dynamicScale})` }}
        >
          {/* Outer Faint Ring with gradient glow */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/25 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/5 shadow-[0_0_20px_rgba(0,240,255,0.15)]" />

          {/* Middle Rotating Ring with Orbit Node Dots (12 o'clock and 6 o'clock) */}
          <div
            className={`absolute inset-2 rounded-full border border-cyan-400/40 transition-all ${
              state === 'thinking'
                ? 'animate-spin'
                : state === 'listening' || state === 'speaking'
                ? 'animate-spin-slow'
                : 'animate-spin-very-slow'
            }`}
          >
            {/* Top Orbit Node Dot (12 o'clock) */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            {/* Bottom Orbit Node Dot (6 o'clock) */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          </div>

          {/* Inner Glowing Core Circle */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#05111d] border border-cyan-400/60 shadow-[inset_0_0_15px_rgba(0,240,255,0.4),0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center group-hover:border-cyan-300 group-hover:shadow-[inset_0_0_20px_rgba(0,240,255,0.6),0_0_30px_rgba(0,240,255,0.5)] transition-all">
            <Brain
              className={`w-9 h-9 sm:w-10 sm:h-10 text-cyan-300 transition-all ${
                state === 'listening'
                  ? 'animate-pulse text-cyan-200 scale-110 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]'
                  : state === 'thinking'
                  ? 'animate-spin-slow text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                  : state === 'speaking'
                  ? 'text-sky-200 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]'
                  : 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] group-hover:drop-shadow-[0_0_14px_rgba(0,240,255,0.9)]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* State Label matching images.jpg ("Ready", "Listening...", etc.) */}
      <div className="mt-4 text-center">
        <span
          className={`font-sans text-xs tracking-wider font-medium transition-colors ${getStateSubColor()}`}
        >
          {getStateLabel()}
        </span>
      </div>
    </div>
  );
};

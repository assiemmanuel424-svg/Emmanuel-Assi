import React from 'react';
import { JarvisState } from '../types/jarvis';

interface ArcReactorProps {
  state: JarvisState;
  onClick?: () => void;
  soundLevel?: number; // 0 to 1
  disabled?: boolean;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  state,
  onClick,
  soundLevel = 0,
  disabled = false,
}) => {
  // State specific colors & animations
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'ÉCOUTE ACTIVE',
          subLabel: 'MICRO OUVERT',
          coreColor: '#00f0ff',
          glowClass: 'glow-cyan',
          textColor: 'text-cyan-400',
          speedClass: 'animate-spin-slow',
        };
      case 'thinking':
        return {
          label: 'ANALYSE NEURONALE',
          subLabel: 'GEMINI 3.8 FLASH',
          coreColor: '#f59e0b',
          glowClass: 'glow-amber-sm',
          textColor: 'text-amber-400',
          speedClass: 'animate-spin-fast',
        };
      case 'speaking':
        return {
          label: 'SYNTHÈSE VOCALE',
          subLabel: 'RÉPONSE EN COURS',
          coreColor: '#38bdf8',
          glowClass: 'glow-cyan',
          textColor: 'text-sky-300',
          speedClass: 'animate-spin-slow',
        };
      case 'idle':
      default:
        return {
          label: 'SYSTÈME EN VEILLE',
          subLabel: 'EN ATTENTE D\'INSTRUCTION',
          coreColor: '#0ea5e9',
          glowClass: 'glow-cyan-sm',
          textColor: 'text-slate-400',
          speedClass: 'animate-spin-slow',
        };
    }
  };

  const config = getStateConfig();
  const dynamicScale = 1 + soundLevel * 0.15;

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Outer Holographic Energy Glow */}
      <div
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
        }`}
        onClick={!disabled ? onClick : undefined}
        title={
          state === 'speaking'
            ? 'Cliquer pour interrompre la parole'
            : state === 'listening'
            ? 'Cliquer pour arrêter l\'écoute'
            : 'Cliquer pour activer le microphone'
        }
      >
        {/* Ambient Halo Ring */}
        <div
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            state === 'thinking'
              ? 'w-64 h-64 bg-amber-500/10 blur-2xl'
              : state === 'listening'
              ? 'w-72 h-72 bg-cyan-400/20 blur-3xl animate-pulse'
              : state === 'speaking'
              ? 'w-64 h-64 bg-sky-400/15 blur-2xl'
              : 'w-56 h-56 bg-cyan-600/10 blur-xl'
          }`}
        />

        {/* Dynamic Acoustic Echo Rings when speaking or listening */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <div className="absolute w-52 h-52 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
            <div className="absolute w-60 h-60 rounded-full border border-cyan-500/15 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Arc Reactor SVG Visualizer */}
        <div
          className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center transition-transform"
          style={{ transform: `scale(${dynamicScale})` }}
        >
          {/* Outer Rotating Ticks Ring */}
          <svg
            className={`absolute inset-0 w-full h-full ${config.speedClass}`}
            viewBox="0 0 200 200"
          >
            {/* Outer calibration border */}
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
            {/* Outer segments */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(0, 240, 255, 0.45)"
              strokeWidth="2"
              strokeDasharray="30 18"
            />
            {/* Secondary technical marks */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={state === 'thinking' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0, 240, 255, 0.2)'}
              strokeWidth="1"
              strokeDasharray="8 4"
            />
          </svg>

          {/* Reverse Rotating Intermediate Ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin-reverse"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="rgba(0, 240, 255, 0.5)"
              strokeWidth="2"
              strokeDasharray="18 10"
            />
            {/* Triangular coils / Power nodes */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <rect
                  x="96"
                  y="26"
                  width="8"
                  height="12"
                  rx="1.5"
                  fill={state === 'thinking' ? '#f59e0b' : '#00f0ff'}
                  opacity={state === 'idle' ? '0.45' : '0.85'}
                />
              </g>
            ))}
          </svg>

          {/* Inner Core Chamber */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#050811]/90 border border-cyan-500/40 shadow-inner flex items-center justify-center">
            {/* Concentric subtle inner ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
            
            {/* Central Glow Core */}
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                state === 'thinking'
                  ? 'bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_20px_#f59e0b]'
                  : state === 'listening'
                  ? 'bg-cyan-400/30 border-2 border-cyan-300 shadow-[0_0_25px_#00f0ff]'
                  : state === 'speaking'
                  ? 'bg-sky-400/25 border-2 border-sky-400 shadow-[0_0_22px_#38bdf8]'
                  : 'bg-cyan-500/10 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
              }`}
            >
              {/* Inner Triangle / Arc Pattern */}
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="12,4 20,18 4,18"
                  stroke={state === 'thinking' ? '#f59e0b' : '#00f0ff'}
                  strokeWidth="2"
                  fill={state === 'thinking' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 240, 255, 0.3)'}
                />
                <circle
                  cx="12"
                  cy="13"
                  r="2.5"
                  fill="#ffffff"
                  className={state === 'thinking' ? 'animate-ping' : ''}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Badge & Telemetry */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'thinking'
                ? 'bg-amber-400 animate-ping'
                : state === 'listening'
                ? 'bg-cyan-400 animate-pulse'
                : state === 'speaking'
                ? 'bg-sky-400 animate-bounce'
                : 'bg-cyan-500/60'
            }`}
          />
          <span
            className={`font-['Orbitron'] text-xs font-semibold tracking-widest uppercase ${config.textColor}`}
          >
            {config.label}
          </span>
        </div>
        <span className="font-['Rajdhani'] text-[11px] text-slate-400 tracking-wider uppercase mt-0.5">
          {config.subLabel}
        </span>
      </div>
    </div>
  );
};

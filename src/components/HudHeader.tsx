import React, { useState, useEffect, useRef } from 'react';
import {
  VolumeX,
  Trash2,
  Settings,
  Brain,
  Music,
  Eye,
  Sparkles,
  Zap,
  Cpu,
  Mail,
  Monitor,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react';
import { UserProfile, CompanionStatus, VoiceSettings } from '../types/jarvis';
import { smartMusicEngine } from '../services/smartMusicEngine';

interface HudHeaderProps {
  userProfile: UserProfile;
  memoriesCount: number;
  companionStatus: CompanionStatus;
  voiceSettings: VoiceSettings;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  onOpenMemory: () => void;
  onOpenWindowsHub: () => void;
  onOpenAutomations: () => void;
  onOpenArsenal: () => void;
  onOpenWorkspace?: () => void;
  workspaceEmail?: string | null;
  onOpenEvolution?: () => void;
  onOpenSmartMusic?: () => void;
  onOpenGpt6?: () => void;
  onOpenVision?: () => void;
  onOpenSettings: () => void;
  onClearHistory: () => void;
  isAutopilotEnabled?: boolean;
  onToggleAutopilot?: () => void;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  userProfile,
  memoriesCount,
  companionStatus,
  voiceSettings,
  isSpeaking,
  onStopSpeech,
  onOpenMemory,
  onOpenWindowsHub,
  onOpenAutomations,
  onOpenArsenal,
  onOpenWorkspace,
  workspaceEmail,
  onOpenEvolution,
  onOpenSmartMusic,
  onOpenGpt6,
  onOpenVision,
  onOpenSettings,
  onClearHistory,
  isAutopilotEnabled = true,
  onToggleAutopilot,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [musicPlaying, setMusicPlaying] = useState<boolean>(smartMusicEngine.getState().isPlaying);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);

  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = smartMusicEngine.subscribe((st) => {
      setMusicPlaying(st.isPlaying);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        }).toUpperCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close tools dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative w-full border-b border-cyan-500/20 bg-[#060a16]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 z-40 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Stark Brand + Name + Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <span className="font-['Orbitron'] font-bold text-xs text-cyan-300">J</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Orbitron'] font-bold text-sm tracking-wider text-slate-100 flex items-center gap-1.5">
                J.A.R.V.I.S.
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Système en ligne" />
            </div>
            <p className="font-['Rajdhani'] text-[11px] text-slate-400">
              Bienvenue, <span className="text-cyan-300 font-semibold">{userProfile.name || 'Monsieur'}</span>
            </p>
          </div>

          {/* Quick Silence Button when speaking */}
          {isSpeaking && (
            <button
              onClick={onStopSpeech}
              className="ml-2 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg transition-colors cursor-pointer animate-pulse"
              title="Interrompre la parole"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="font-['Rajdhani']">SILENCE</span>
            </button>
          )}
        </div>

        {/* Center: Clean & Streamlined Command Dock (Toutes les fonctionnalités à portée de clic) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 1. Vue Écran */}
          <button
            onClick={onOpenVision}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-sky-950/60 border border-slate-700/60 hover:border-sky-400 text-slate-300 hover:text-sky-200 transition-all text-xs font-['Rajdhani'] font-bold cursor-pointer"
            title="Cortex Oculaire : Voir l'écran en direct"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="hidden sm:inline">VUE ÉCRAN</span>
          </button>

          {/* 2. Smart Musique */}
          <button
            onClick={onOpenSmartMusic}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-['Rajdhani'] font-bold cursor-pointer ${
              musicPlaying
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/60 hover:bg-cyan-950/60 border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-200'
            }`}
            title="Smart Musique : Synthétiseur procédural & flux"
          >
            <Music className={`w-3.5 h-3.5 ${musicPlaying ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">MUSIQUE</span>
            {musicPlaying && (
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 bg-cyan-400 h-1 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 bg-cyan-400 h-2.5 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-cyan-400 h-1.5 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </button>

          {/* 3. GPT-6 Omni */}
          <button
            onClick={onOpenGpt6}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/70 hover:to-indigo-900/70 border border-purple-500/40 hover:border-purple-300 text-purple-200 transition-all text-xs font-['Rajdhani'] font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)] cursor-pointer"
            title="Matrice Cognitive Frontier GPT-6"
          >
            <Brain className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden sm:inline">GPT-6</span>
          </button>

          {/* 4. Mémoire Active */}
          <button
            onClick={onOpenMemory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-purple-950/60 border border-slate-700/60 hover:border-purple-400 text-slate-300 hover:text-purple-200 transition-all text-xs font-['Rajdhani'] font-bold cursor-pointer"
            title="Banque de mémoire active"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">MÉMOIRE</span>
            <span className="px-1 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-[10px] text-purple-300 font-mono">
              {memoriesCount}
            </span>
          </button>

          {/* 5. Menu Centre d'Outils (Arsenal, Routines, Évolution, PC Windows, Workspace) */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 transition-all text-xs font-['Rajdhani'] font-bold cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              title="Centre d'outils complets"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>OUTILS</span>
              <ChevronDown className="w-3 h-3 text-cyan-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {isToolsMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#070b16] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.25)] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-cyan-500/20 mb-1">
                  MODULES OPÉRATIONNELS
                </div>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenArsenal();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-cyan-950/40 text-slate-200 hover:text-cyan-200 text-xs font-['Rajdhani'] font-medium transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">Arsenal des Capacités</div>
                    <div className="text-[10px] text-slate-400 font-sans">Tâches, bloc-notes & productivité</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenAutomations();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-950/40 text-slate-200 hover:text-amber-200 text-xs font-['Rajdhani'] font-medium transition-colors text-left"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">Routines & Automatisations</div>
                    <div className="text-[10px] text-slate-400 font-sans">Scénarios multi-étapes programmés</div>
                  </div>
                </button>

                {onOpenEvolution && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenEvolution();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-200 text-xs font-['Rajdhani'] font-medium transition-colors text-left"
                  >
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Auto-Évolution & Code</div>
                      <div className="text-[10px] text-slate-400 font-sans">Méta-programmation & compétences</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenWindowsHub();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sky-950/40 text-slate-200 hover:text-sky-200 text-xs font-['Rajdhani'] font-medium transition-colors text-left"
                >
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-bold">Pont Windows & PC</div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {companionStatus.connected ? 'Connecté (Port 7890)' : 'Contrôle système local'}
                    </div>
                  </div>
                </button>

                {onOpenWorkspace && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenWorkspace();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-blue-950/40 text-slate-200 hover:text-blue-200 text-xs font-['Rajdhani'] font-medium transition-colors text-left"
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">Google Workspace</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {workspaceEmail ? workspaceEmail : 'Gmail, Agenda & Drive'}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clock & Settings */}
        <div className="flex items-center gap-2">
          {/* Clock */}
          <div className="text-right px-2 py-0.5 border-r border-cyan-500/20 mr-1 hidden md:block">
            <div className="font-['Orbitron'] text-xs font-semibold tracking-wider text-cyan-300">
              {currentTime}
            </div>
            <div className="font-['Rajdhani'] text-[10px] text-slate-400">
              {currentDate}
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-slate-700/60 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Paramètres de l'assistant & Voix"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg border border-slate-700/60 hover:border-rose-500/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Réinitialiser la conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

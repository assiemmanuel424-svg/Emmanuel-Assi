import React from 'react';
import {
  X,
  Folder,
  FolderOpen,
  Brain,
  Eye,
  Music,
  Cpu,
  Zap,
  Monitor,
  Mail,
  Sparkles,
  Settings,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  TrendingUp,
  Terminal,
} from 'lucide-react';
import { CompanionStatus, MemoryItem, AutomationRoutine } from '../types/jarvis';

interface SystemFoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemory: () => void;
  onOpenVision: () => void;
  onOpenSmartMusic: () => void;
  onOpenGpt6: () => void;
  onOpenEvolution: () => void;
  onOpenAutomations: () => void;
  onOpenWindowsHub: () => void;
  onOpenWorkspace: () => void;
  onOpenArsenal: () => void;
  onOpenSettings: () => void;
  onOpenForex?: () => void;
  onOpenClaudeCode?: () => void;
  memoriesCount: number;
  companionStatus: CompanionStatus;
  routinesCount: number;
  workspaceEmail?: string;
  musicPlaying: boolean;
}

export const SystemFoldersModal: React.FC<SystemFoldersModalProps> = ({
  isOpen,
  onClose,
  onOpenMemory,
  onOpenVision,
  onOpenSmartMusic,
  onOpenGpt6,
  onOpenEvolution,
  onOpenAutomations,
  onOpenWindowsHub,
  onOpenWorkspace,
  onOpenArsenal,
  onOpenSettings,
  onOpenForex,
  onOpenClaudeCode,
  memoriesCount,
  companionStatus,
  routinesCount,
  workspaceEmail,
  musicPlaying,
}) => {
  if (!isOpen) return null;

  const folders = [
    {
      id: 'memory',
      title: 'Dossier Mémoire',
      subtitle: `${memoriesCount} souvenirs actifs consigés`,
      description: 'Banque de mémoire permanente de JARVIS (faits, préférences, directives)',
      icon: Brain,
      color: 'purple',
      badge: `${memoriesCount} faits`,
      action: () => {
        onClose();
        onOpenMemory();
      },
    },
    {
      id: 'vision',
      title: 'Dossier Cortex Vision',
      subtitle: 'Voir l\'écran en direct 30 FPS',
      description: 'Capture d\'écran navigateur et analyse multimodale Gemini en direct',
      icon: Eye,
      color: 'sky',
      badge: 'En direct',
      action: () => {
        onClose();
        onOpenVision();
      },
    },
    {
      id: 'music',
      title: 'Dossier Smart Musique',
      subtitle: musicPlaying ? 'Lecture en cours...' : 'Synthétiseur procédural Web Audio',
      description: '4 modes d\'ambiance (Stark Lab, Deep Focus, Vol, Lounge) et Spotify',
      icon: Music,
      color: 'cyan',
      badge: musicPlaying ? 'En lecture' : '4 modes',
      action: () => {
        onClose();
        onOpenSmartMusic();
      },
    },
    {
      id: 'gpt6',
      title: 'Dossier Frontier GPT-6',
      subtitle: 'Pensée profonde & Essaim d\'agents',
      description: 'Matrice de raisonnement délibéré, chaîne de pensée & vérification',
      icon: Brain,
      color: 'indigo',
      badge: 'Frontier AI',
      action: () => {
        onClose();
        onOpenGpt6();
      },
    },
    {
      id: 'forex',
      title: 'Dossier Forex Trading',
      subtitle: 'Trading autonome & Devises live',
      description: 'EUR/USD, pips, stop-loss, take-profit et exécution haute fréquence',
      icon: TrendingUp,
      color: 'emerald',
      badge: 'Forex Bot',
      action: () => {
        onClose();
        if (onOpenForex) onOpenForex();
      },
    },
    {
      id: 'claude_code',
      title: 'Dossier Claude Code Studio',
      subtitle: 'Génie logiciel universel & Sandbox',
      description: 'Programmation complète dans tous les langages (Python, Rust, Go, C++, TS...)',
      icon: Terminal,
      color: 'indigo',
      badge: 'Claude Code',
      action: () => {
        onClose();
        if (onOpenClaudeCode) onOpenClaudeCode();
      },
    },
    {
      id: 'evolution',
      title: 'Dossier Auto-Évolution',
      subtitle: 'Méta-programmation & Compétences',
      description: 'Génération et compilation de code autonome (Python, PowerShell, TS)',
      icon: Cpu,
      color: 'emerald',
      badge: 'Auto-Code',
      action: () => {
        onClose();
        onOpenEvolution();
      },
    },
    {
      id: 'automations',
      title: 'Dossier Routines PC',
      subtitle: `${routinesCount} scénarios configurés`,
      description: 'Automatisation multi-étapes et tâches programmées Windows',
      icon: Zap,
      color: 'amber',
      badge: `${routinesCount} routines`,
      action: () => {
        onClose();
        onOpenAutomations();
      },
    },
    {
      id: 'windows',
      title: 'Dossier Pont Windows',
      subtitle: companionStatus.connected ? 'Connecté (Port 7890)' : 'Mode local autonome',
      description: 'Contrôle direct du PC, gestion des processus, captures et corbeille',
      icon: Monitor,
      color: 'cyan',
      badge: companionStatus.connected ? 'Actif' : 'Standby',
      action: () => {
        onClose();
        onOpenWindowsHub();
      },
    },
    {
      id: 'workspace',
      title: 'Dossier Google Workspace',
      subtitle: workspaceEmail || 'Gmail, Agenda & Drive',
      description: 'Accès sécurisé à vos e-mails, événements de calendrier et fichiers Drive',
      icon: Mail,
      color: 'blue',
      badge: workspaceEmail ? 'Connecté' : 'OAuth',
      action: () => {
        onClose();
        onOpenWorkspace();
      },
    },
    {
      id: 'arsenal',
      title: 'Dossier Arsenal',
      subtitle: 'Tâches, bloc-notes & productivité',
      description: 'Gestionnaire de tâches JARVIS et carnet de notes instantané',
      icon: Sparkles,
      color: 'purple',
      badge: 'Outils',
      action: () => {
        onClose();
        onOpenArsenal();
      },
    },
    {
      id: 'settings',
      title: 'Dossier Paramètres',
      subtitle: 'Voix, vitesse & recherche Web',
      description: 'Configuration du moteur vocal JARVIS et du module de recherche Google',
      icon: Settings,
      color: 'slate',
      badge: 'Config',
      action: () => {
        onClose();
        onOpenSettings();
      },
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-950/40 hover:bg-purple-900/50',
          border: 'border-purple-500/30 hover:border-purple-400',
          iconBg: 'bg-purple-950/80 border-purple-400/50 text-purple-300',
          badge: 'bg-purple-950 border-purple-500/40 text-purple-300',
        };
      case 'sky':
        return {
          bg: 'bg-sky-950/40 hover:bg-sky-900/50',
          border: 'border-sky-500/30 hover:border-sky-400',
          iconBg: 'bg-sky-950/80 border-sky-400/50 text-sky-300',
          badge: 'bg-sky-950 border-sky-500/40 text-sky-300',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-950/40 hover:bg-cyan-900/50',
          border: 'border-cyan-500/30 hover:border-cyan-400',
          iconBg: 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300',
          badge: 'bg-cyan-950 border-cyan-500/40 text-cyan-300',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-950/40 hover:bg-indigo-900/50',
          border: 'border-indigo-500/30 hover:border-indigo-400',
          iconBg: 'bg-indigo-950/80 border-indigo-400/50 text-indigo-300',
          badge: 'bg-indigo-950 border-indigo-500/40 text-indigo-300',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
          border: 'border-emerald-500/30 hover:border-emerald-400',
          iconBg: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300',
          badge: 'bg-emerald-950 border-emerald-500/40 text-emerald-300',
        };
      case 'amber':
        return {
          bg: 'bg-amber-950/40 hover:bg-amber-900/50',
          border: 'border-amber-500/30 hover:border-amber-400',
          iconBg: 'bg-amber-950/80 border-amber-400/50 text-amber-300',
          badge: 'bg-amber-950 border-amber-500/40 text-amber-300',
        };
      case 'blue':
        return {
          bg: 'bg-blue-950/40 hover:bg-blue-900/50',
          border: 'border-blue-500/30 hover:border-blue-400',
          iconBg: 'bg-blue-950/80 border-blue-400/50 text-blue-300',
          badge: 'bg-blue-950 border-blue-500/40 text-blue-300',
        };
      default:
        return {
          bg: 'bg-slate-900/40 hover:bg-slate-850',
          border: 'border-slate-700/40 hover:border-slate-500',
          iconBg: 'bg-slate-900 border-slate-700 text-slate-300',
          badge: 'bg-slate-900 border-slate-700 text-slate-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/25 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <FolderOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold tracking-wider text-cyan-100">
                  DOSSIERS DU SYSTÈME J.A.R.V.I.S.
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {folders.length} DOSSIERS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Toutes les fonctionnalités de pointe rangées dans leurs petits dossiers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Folders */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {folders.map((f) => {
              const IconComp = f.icon;
              const clr = getColorClasses(f.color);

              return (
                <div
                  key={f.id}
                  onClick={f.action}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${clr.bg} ${clr.border} shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Folder className="w-8 h-8 text-cyan-400/50 group-hover:text-cyan-300 transition-colors" />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md border flex items-center justify-center ${clr.iconBg}`}
                        >
                          <IconComp className="w-3 h-3" />
                        </div>
                      </div>
                      <div>
                        <div className="font-['Orbitron'] text-xs font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">
                          {f.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {f.subtitle}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border whitespace-nowrap ${clr.badge}`}
                    >
                      {f.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {f.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px] font-['Rajdhani'] font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <span>Ouvrir le dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>J.A.R.V.I.S. PROTOCOL // ARCHIVES SYSTÈME</span>
          <span className="text-cyan-400">Cliquez sur un dossier pour lancer le module</span>
        </div>
      </div>
    </div>
  );
};

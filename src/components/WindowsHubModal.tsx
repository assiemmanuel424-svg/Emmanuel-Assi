import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Settings,
  Calculator,
  Music,
  Code,
  FileCode,
  ShieldCheck,
  Volume2,
  VolumeX,
  SkipForward,
  Camera,
  Lock,
  Moon,
  Trash2,
  Activity,
  Folder,
  Send,
  Copy,
  Check,
  Layers,
  Zap,
} from 'lucide-react';
import { CompanionStatus } from '../types/jarvis';
import {
  sendBridgeCommand,
  launchApp,
  controlMedia,
  captureScreenshot,
  openFolder,
  executeSystemPower,
  getTopProcesses,
  killProcess,
  runPowerShell,
} from '../utils/companionController';

interface WindowsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionStatus: CompanionStatus;
  onCheckStatus: () => Promise<void>;
  onTriggerCompanionApp: (app: string) => Promise<void>;
  isAutopilotEnabled?: boolean;
  onToggleAutopilot?: () => void;
}

export const WindowsHubModal: React.FC<WindowsHubModalProps> = ({
  isOpen,
  onClose,
  companionStatus,
  onCheckStatus,
  onTriggerCompanionApp,
  isAutopilotEnabled = true,
  onToggleAutopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'processes' | 'terminal' | 'install'>('control');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Terminal state
  const [psCommand, setPsCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  
  // Processes state
  const [processes, setProcesses] = useState<Array<{ Id: number; ProcessName: string; RAM_MB: number; CPU_s: number }>>([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false);

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await onCheckStatus();
      showFeedback('Vérification du pont local effectuée.', 'info');
    } finally {
      setIsChecking(false);
    }
  };

  const executeAction = async (label: string, actionFn: () => Promise<any>) => {
    setIsExecuting(true);
    try {
      const res = await actionFn();
      if (res.success) {
        showFeedback(res.message || res.path || `Action "${label}" exécutée avec succès !`, 'success');
      } else {
        showFeedback(`Erreur : ${res.error || 'Échec de commande'}`, 'error');
      }
    } catch (e: any) {
      showFeedback(`Erreur réseau : ${e.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFetchProcesses = async () => {
    setIsLoadingProcesses(true);
    try {
      const res = await getTopProcesses();
      if (res.success && Array.isArray(res.processes)) {
        setProcesses(res.processes);
        showFeedback(`${res.processes.length} processus chargés en direct.`, 'success');
      } else {
        showFeedback(res.error || 'Impossible de lire les processus', 'error');
      }
    } catch (e: any) {
      showFeedback(e.message, 'error');
    } finally {
      setIsLoadingProcesses(false);
    }
  };

  const handleKillSelectedProcess = async (name: string) => {
    setIsExecuting(true);
    try {
      const res = await killProcess(name);
      if (res.success) {
        showFeedback(`Processus "${name}" arrêté avec succès !`, 'success');
        handleFetchProcesses();
      } else {
        showFeedback(res.error || 'Erreur lors de l\'arrêt du processus', 'error');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunPsCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!psCommand.trim()) return;

    setIsExecuting(true);
    setTerminalOutput(`[Exécution en cours...] > ${psCommand}\n`);
    try {
      const res = await runPowerShell(psCommand);
      if (res.success) {
        const out = res.stdout || res.stderr || 'Commande exécutée sans retour texte (code 0).';
        setTerminalOutput(`> ${psCommand}\n----------------------------------------\n${out}`);
        showFeedback('Commande PowerShell exécutée !', 'success');
      } else {
        setTerminalOutput(`> ${psCommand}\n[ERREUR] : ${res.error}`);
        showFeedback('Échec de la commande.', 'error');
      }
    } catch (e: any) {
      setTerminalOutput(`[ERREUR RÉSEAU] : ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const appGrid = [
    { name: 'Google Chrome', target: 'chrome', icon: '🌐' },
    { name: 'VS Code', target: 'code', icon: '💻' },
    { name: 'Spotify Music', target: 'spotify', icon: '🎵' },
    { name: 'Discord', target: 'discord', icon: '💬' },
    { name: 'Steam Games', target: 'steam', icon: '🎮' },
    { name: 'Windows Terminal', target: 'terminal', icon: '⚡' },
    { name: 'VLC Player', target: 'vlc', icon: '🎬' },
    { name: 'Calculatrice', target: 'calc', icon: '🔢' },
    { name: 'Bloc-notes', target: 'notepad', icon: '📝' },
    { name: 'Explorateur', target: 'explorer', icon: '📁' },
    { name: 'Paramètres', target: 'settings', icon: '⚙️' },
    { name: 'Microsoft Word', target: 'word', icon: '📄' },
    { name: 'Microsoft Excel', target: 'excel', icon: '📊' },
    { name: 'Paint', target: 'paint', icon: '🎨' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090e1f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#070c1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] font-bold text-sm text-cyan-100 tracking-wider">
                  CENTRE DE CONTRÔLE PC & AUTOMATISATION TOTALE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  WINDOWS BRIDGE
                </span>
              </div>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Pilotage système direct : lancements, multimédia, capture, processus & commandes locales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Autopilot Banner */}
        <div className="px-6 py-3 border-b border-cyan-500/15 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${companionStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-slate-200">
                {companionStatus.connected
                  ? `PONT CONNECTÉ (Machine : ${companionStatus.info?.machine || 'PC Local'} · ${companionStatus.info?.disk_free_gb || 'N/A'} Go libres)`
                  : 'PONT COMPAGNON HORS-LIGNE (PORT 7890)'}
              </span>
            </div>

            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Vérifier</span>
            </button>
          </div>

          {/* Autopilot toggle */}
          {onToggleAutopilot && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Auto-pilote PC :</span>
              <button
                onClick={onToggleAutopilot}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                  isAutopilotEnabled
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Zap className={`w-3 h-3 ${isAutopilotEnabled ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                <span>{isAutopilotEnabled ? 'ACTIF (EXÉCUTION IMMÉDIATE)' : 'MANUEL'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/15 bg-[#060a17] px-6 text-xs font-['Rajdhani'] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('control')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'control'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Pilotage Express (Apps & Système)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('processes');
              if (companionStatus.connected && processes.length === 0) {
                handleFetchProcesses();
              }
            }}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'processes'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Gestionnaire de Processus</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'terminal'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console PowerShell Directe</span>
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'install'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Lanceur & Script Python</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-mono border-b flex items-center gap-2 animate-in slide-in-from-top-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-red-950/50 border-red-500/40 text-red-300'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{feedback.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: PILOTAGE EXPRESS */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              
              {/* Multimédia & Audio Deck */}
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Contrôle Média & Volume Audio du PC</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">1-Clic Système</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => executeAction('Sourdine', () => controlMedia('mute'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span>Couper le Son (Mute)</span>
                  </button>

                  <button
                    onClick={() => executeAction('Volume +', () => controlMedia('vol_up'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Volume +</span>
                  </button>

                  <button
                    onClick={() => executeAction('Volume -', () => controlMedia('vol_down'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-sky-400" />
                    <span>Volume -</span>
                  </button>

                  <button
                    onClick={() => executeAction('Pause/Play', () => controlMedia('play_pause'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Play className="w-4 h-4 text-cyan-400" />
                    <span>Lecture / Pause</span>
                  </button>

                  <button
                    onClick={() => executeAction('Suivant', () => controlMedia('next'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <SkipForward className="w-4 h-4 text-purple-400" />
                    <span>Piste Suivante</span>
                  </button>
                </div>
              </div>

              {/* Actions Système & Sécurité Rapides */}
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Commandes Système & Maintenance Immédiates</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Automatique</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => executeAction('Capture d\'écran', captureScreenshot)}
                    disabled={isExecuting}
                    className="p-3 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-1.5 transition-colors group"
                  >
                    <Camera className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200">Capture d'Écran</span>
                    <span className="text-[10px] text-slate-500">Sauvegardée dans Images</span>
                  </button>

                  <button
                    onClick={() => executeAction('Verrouillage', () => executeSystemPower('lock'))}
                    disabled={isExecuting}
                    className="p-3 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-1.5 transition-colors group"
                  >
                    <Lock className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200">Verrouiller PC</span>
                    <span className="text-[10px] text-slate-500">Sécurité de session</span>
                  </button>

                  <button
                    onClick={() => executeAction('Vider Corbeille', () => executeSystemPower('empty_recycle_bin'))}
                    disabled={isExecuting}
                    className="p-3 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-1.5 transition-colors group"
                  >
                    <Trash2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200">Vider Corbeille</span>
                    <span className="text-[10px] text-slate-500">Purge sécurisée</span>
                  </button>

                  <button
                    onClick={() => executeAction('Purger Cache DNS', () => executeSystemPower('flush_dns'))}
                    disabled={isExecuting}
                    className="p-3 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-1.5 transition-colors group"
                  >
                    <RefreshCw className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200">Vider Cache DNS</span>
                    <span className="text-[10px] text-slate-500">ipconfig /flushdns</span>
                  </button>
                </div>
              </div>

              {/* Dossiers Rapides */}
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explorateur & Dossiers Rapides</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">shell:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => executeAction('Bureau', () => openFolder('desktop'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-semibold flex items-center gap-2"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bureau (Desktop)</span>
                  </button>

                  <button
                    onClick={() => executeAction('Téléchargements', () => openFolder('downloads'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-semibold flex items-center gap-2"
                  >
                    <Folder className="w-3.5 h-3.5 text-sky-400" />
                    <span>Téléchargements</span>
                  </button>

                  <button
                    onClick={() => executeAction('Documents', () => openFolder('documents'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-semibold flex items-center gap-2"
                  >
                    <Folder className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mes Documents</span>
                  </button>

                  <button
                    onClick={() => executeAction('Images', () => openFolder('pictures'))}
                    disabled={isExecuting}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-semibold flex items-center gap-2"
                  >
                    <Folder className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mes Images</span>
                  </button>
                </div>
              </div>

              {/* Lanceur d'Applications Direct */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    <span>Lancement Direct d'Applications</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {companionStatus.connected ? 'Exécution locale via pont' : 'Protocoles directs'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {appGrid.map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeAction(app.name, () => launchApp(app.target))}
                      disabled={isExecuting}
                      className="p-3 rounded-lg bg-black/40 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
                      <p className="font-['Rajdhani'] font-semibold text-[11px] text-slate-200 group-hover:text-cyan-300 truncate w-full">
                        {app.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTIONNAIRE DE PROCESSUS */}
          {activeTab === 'processes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Rajdhani'] font-bold text-sm text-cyan-300 uppercase tracking-wide">
                    Processus Actifs en Temps Réel
                  </h3>
                  <p className="text-xs text-slate-400">
                    Affiche les processus les plus consommateurs de CPU et RAM sur votre machine Windows
                  </p>
                </div>

                <button
                  onClick={handleFetchProcesses}
                  disabled={isLoadingProcesses}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProcesses ? 'animate-spin' : ''}`} />
                  <span>Actualiser les Processus</span>
                </button>
              </div>

              {processes.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-400 space-y-3">
                  <Activity className="w-8 h-8 text-cyan-400/50 mx-auto" />
                  <p>Aucun processus chargé pour le moment.</p>
                  <button
                    onClick={handleFetchProcesses}
                    disabled={isLoadingProcesses}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                  >
                    Charger les Processus Maintenant
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-black/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#060a17] text-slate-400 font-['Rajdhani'] uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
                      <tr>
                        <th className="py-2.5 px-3">PID</th>
                        <th className="py-2.5 px-3">Nom du Processus</th>
                        <th className="py-2.5 px-3">RAM Utilisée</th>
                        <th className="py-2.5 px-3">Temps CPU</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {processes.map((proc, i) => (
                        <tr key={i} className="hover:bg-cyan-950/20 transition-colors">
                          <td className="py-2 px-3 text-slate-500">{proc.Id}</td>
                          <td className="py-2 px-3 text-cyan-300 font-semibold">{proc.ProcessName}</td>
                          <td className="py-2 px-3 text-emerald-400">{proc.RAM_MB} Mo</td>
                          <td className="py-2 px-3 text-amber-400">{proc.CPU_s} s</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleKillSelectedProcess(proc.ProcessName)}
                              disabled={isExecuting}
                              className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-semibold"
                            >
                              Arrêter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONSOLE POWERSHELL DIRECTE */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Rajdhani'] font-bold text-sm text-cyan-300 uppercase tracking-wide">
                  Console PowerShell Locale
                </h3>
                <p className="text-xs text-slate-400">
                  Exécutez n'importe quelle commande PowerShell directement sur votre machine Windows
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="text-slate-500 text-[11px] self-center mr-1">Exemples :</span>
                {[
                  { label: 'Infos Système', cmd: 'Get-ComputerInfo | Select-Object WindowsProductName, OsArchitecture' },
                  { label: 'Espace Disques', cmd: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free' },
                  { label: 'Test Réseau (Ping)', cmd: 'Test-NetConnection -ComputerName 8.8.8.8 -InformationLevel Detailed' },
                  { label: 'Cartes Réseau', cmd: 'Get-NetAdapter | Select-Object Name, Status, LinkSpeed' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPsCommand(preset.cmd);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Command Form */}
              <form onSubmit={handleRunPsCustom} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={psCommand}
                    onChange={(e) => setPsCommand(e.target.value)}
                    placeholder="Saisissez une commande PowerShell (ex: Get-Process | Select-Object -First 5)"
                    className="w-full bg-black/70 border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 outline-none pr-8"
                  />
                  {psCommand && (
                    <button
                      type="button"
                      onClick={() => setPsCommand('')}
                      className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!psCommand.trim() || isExecuting}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Exécuter</span>
                </button>
              </form>

              {/* Output Window */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-black/80 border border-cyan-500/25 font-mono text-xs text-cyan-300 overflow-x-auto min-h-[160px] max-h-[300px]">
                  {terminalOutput || '> Prêt pour exécution.'}
                </pre>
                {terminalOutput && (
                  <button
                    onClick={() => navigator.clipboard.writeText(terminalOutput)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    title="Copier la sortie"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LANCEUR & SCRIPT PYTHON */}
          {activeTab === 'install' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-4">
                <div>
                  <h3 className="font-['Rajdhani'] font-bold text-sm text-cyan-300 uppercase tracking-wide">
                    Installation 1-Clic du Compagnon JARVIS
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    100% gratuit, sans inscription, sans API payante et ultra-léger (Python natif Windows)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="/api/jarvis/download-companion"
                    download="jarvis_windows_bridge.py"
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-6 h-6 text-amber-400" />
                      <div>
                        <p className="font-semibold text-slate-200">jarvis_windows_bridge.py</p>
                        <p className="text-[11px] text-slate-500">Script serveur local sécurisé (port 7890)</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </a>

                  <a
                    href="/api/jarvis/download-batch-launcher"
                    download="start_jarvis_bridge.bat"
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-6 h-6 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-slate-200">start_jarvis_bridge.bat</p>
                        <p className="text-[11px] text-slate-500">Lanceur automatique Windows (double-clic)</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-black/60 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <p className="text-cyan-400 font-bold">Guide de mise en route en 3 étapes :</p>
                  <p>1. Téléchargez les 2 fichiers ci-dessus dans un dossier de votre PC.</p>
                  <p>2. Double-cliquez sur <span className="text-amber-300 font-bold">start_jarvis_bridge.bat</span>.</p>
                  <p>3. Revenez ici et cliquez sur <span className="text-emerald-400 font-bold">Vérifier</span> : JARVIS aura le contrôle total et instantané de votre machine !</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

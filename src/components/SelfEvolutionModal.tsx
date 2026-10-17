import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Sparkles,
  Zap,
  Code,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Atom,
  TrendingUp,
  Scale,
  Brain,
  HeartPulse,
  Palette,
  ShieldAlert,
  Layers,
  ChevronRight,
  Compass,
  ArrowRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  SelfProgrammedModule,
  AutonomousLoop,
  HumanCompetenceDomain,
  CompanionStatus,
  WindowsAction,
} from '../types/jarvis';

interface SelfEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt: (prompt: string) => void;
  onExecuteAction: (action: WindowsAction) => void;
  companionStatus: CompanionStatus;
}

const DEFAULT_LOOPS: AutonomousLoop[] = [
  {
    id: 'loop-clean',
    title: 'Nettoyage & Optimisation Système Quotidienne',
    description: 'Purge automatique des fichiers temporaires (%TEMP%) et libération de mémoire vive.',
    frequency: 'daily',
    enabled: true,
    actionType: 'maintenance',
  },
  {
    id: 'loop-briefing',
    title: 'Briefing Matinal & Synthèse des Priorités',
    description: 'Analyse des e-mails, de l\'agenda et génération de la liste de tâches prioritaire.',
    frequency: 'daily',
    enabled: true,
    actionType: 'briefing',
  },
  {
    id: 'loop-security',
    title: 'Audit de Sécurité & Processus Anormaux',
    description: 'Vérification proactive des processus en arrière-plan et de l\'intégrité du système.',
    frequency: 'hourly',
    enabled: false,
    actionType: 'security_audit',
  },
  {
    id: 'loop-knowledge',
    title: 'Veille Technologique & Méta-Apprentissage',
    description: 'Actualisation des connaissances sur l\'IA, la cybersécurité et les avancées scientifiques.',
    frequency: 'daily',
    enabled: true,
    actionType: 'knowledge_sync',
  },
];

const PRESET_PROGRAM_PROMPTS = [
  {
    title: '🛡️ Audit des Ports & Processus Suspects',
    prompt: 'Auto-programme un script PowerShell qui liste tous les ports TCP en écoute et vérifie les processus non signés ou suspects.',
    category: 'system',
    lang: 'powershell',
  },
  {
    title: '⚡ Libérateur de RAM & Cache Windows',
    prompt: 'Auto-programme un script d\'optimisation qui force la libération de la mémoire de travail des processus inactifs et purge le cache DNS.',
    category: 'system',
    lang: 'powershell',
  },
  {
    title: '📁 Organisateur de Dossier Téléchargements',
    prompt: 'Auto-programme un script PowerShell qui classe automatiquement les fichiers du dossier Téléchargements par type (Images, Documents, Vidéos, Exécutables).',
    category: 'automation',
    lang: 'powershell',
  },
  {
    title: '🌐 Moniteur de Connexion & Ping Réseau',
    prompt: 'Auto-programme un script de diagnostic réseau qui teste le ping vers les DNS Google et Cloudflare et affiche la latence en temps réel.',
    category: 'system',
    lang: 'powershell',
  },
  {
    title: '📊 Export des Spécifications Matérielles',
    prompt: 'Auto-programme un rapport d\'audit matériel complet (CPU, GPU, RAM totale/disponible, stockage) au format texte lisible.',
    category: 'system',
    lang: 'powershell',
  },
];

export const SelfEvolutionModal: React.FC<SelfEvolutionModalProps> = ({
  isOpen,
  onClose,
  onExecutePrompt,
  onExecuteAction,
  companionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'self-program' | 'competencies' | 'autonomous-loops'>('self-program');
  const [programInput, setProgramInput] = useState('');
  const [targetLang, setTargetLang] = useState<'powershell' | 'python' | 'javascript' | 'routine'>('powershell');
  const [targetCat, setTargetCat] = useState<'system' | 'automation' | 'web' | 'science'>('system');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Self-programmed modules from storage
  const [modules, setModules] = useState<SelfProgrammedModule[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_self_programmed_modules_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Autonomous loops state
  const [loops, setLoops] = useState<AutonomousLoop[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_autonomous_loops_v1');
      return saved ? JSON.parse(saved) : DEFAULT_LOOPS;
    } catch {
      return DEFAULT_LOOPS;
    }
  });

  // Human Competencies
  const [competencies, setCompetencies] = useState<HumanCompetenceDomain[]>([]);
  const [selectedCompetence, setSelectedCompetence] = useState<HumanCompetenceDomain | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/jarvis/human-competencies')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.domains)) {
            setCompetencies(data.domains);
            if (!selectedCompetence && data.domains.length > 0) {
              setSelectedCompetence(data.domains[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const saveModules = (updated: SelfProgrammedModule[]) => {
    setModules(updated);
    localStorage.setItem('jarvis_self_programmed_modules_v1', JSON.stringify(updated));
  };

  const saveLoops = (updated: AutonomousLoop[]) => {
    setLoops(updated);
    localStorage.setItem('jarvis_autonomous_loops_v1', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const handleSelfProgram = async (customPrompt?: string) => {
    const promptToRun = customPrompt || programInput;
    if (!promptToRun.trim() || isCompiling) return;

    setIsCompiling(true);
    setCompileStatus('Analyse de la spécification logicielle...');

    try {
      setTimeout(() => setCompileStatus('Synthèse neuronale du code source...'), 800);
      setTimeout(() => setCompileStatus('Vérification syntaxique & compilation...'), 1800);

      const res = await fetch('/api/jarvis/self-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToRun,
          language: targetLang,
          category: targetCat,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Échec de la compilation');
      }

      setCompileStatus('Module compilé & enregistré avec succès dans la matrice active !');

      const newMod: SelfProgrammedModule = data.module;
      const updated = [newMod, ...modules.filter((m) => m.id !== newMod.id)];
      saveModules(updated);
      setProgramInput('');

      // Auto-trigger if action returned
      if (data.action) {
        // Can be executed immediately by user
      }
    } catch (err: any) {
      setCompileStatus(`Erreur de compilation : ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleExecuteModule = (mod: SelfProgrammedModule) => {
    // Update execution count
    const updated = modules.map((m) =>
      m.id === mod.id
        ? { ...m, executionCount: m.executionCount + 1, lastExecutedAt: new Date().toLocaleTimeString('fr-FR') }
        : m
    );
    saveModules(updated);

    if (mod.language === 'powershell') {
      onExecuteAction({
        type: 'powershell',
        title: mod.title,
        description: mod.description,
        target: mod.code,
        requiresConfirmation: false,
      });
    } else if (mod.language === 'python') {
      onExecuteAction({
        type: 'python',
        title: mod.title,
        description: mod.description,
        target: mod.code,
        requiresConfirmation: false,
      });
    } else {
      onExecutePrompt(`Exécute le module auto-programmé : ${mod.title}`);
    }
  };

  const handleDeleteModule = (id: string) => {
    saveModules(modules.filter((m) => m.id !== id));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleLoop = (id: string) => {
    const updated = loops.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l));
    saveLoops(updated);
  };

  const handleRunLoopNow = (loop: AutonomousLoop) => {
    if (loop.actionType === 'maintenance') {
      onExecutePrompt('Exécute la boucle d\'auto-maintenance : nettoie les fichiers temporaires et libère la mémoire');
    } else if (loop.actionType === 'briefing') {
      onExecutePrompt('Donne-moi mon briefing matinal complet et organise mes priorités du jour');
    } else if (loop.actionType === 'security_audit') {
      onExecutePrompt('Lance un audit de sécurité complet des processus et des ports de mon PC');
    } else {
      onExecutePrompt(`Exécute la boucle autonome : ${loop.title}`);
    }
    onClose();
  };

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-amber-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#070c1a] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Holographic Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-cyan-500/25 bg-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] text-base sm:text-lg font-bold tracking-wider text-cyan-100">
                  MATRICE D'AUTO-ÉVOLUTION COGNITIVE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  OMNISCIENCE ACTIVE
                </span>
              </div>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Auto-programmation dynamique • Auto-automatisation proactive • Maîtrise universelle des compétences humaines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/40 hover:bg-rose-500/20 border border-cyan-500/20 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/20 bg-black/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('self-program')}
            className={`flex items-center gap-2 px-4 py-2.5 font-['Rajdhani'] font-bold text-xs sm:text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'self-program'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>AUTO-PROGRAMMATION ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('competencies')}
            className={`flex items-center gap-2 px-4 py-2.5 font-['Rajdhani'] font-bold text-xs sm:text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'competencies'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>COMPÉTENCES HUMAINES (8 DOMAINES)</span>
          </button>

          <button
            onClick={() => setActiveTab('autonomous-loops')}
            className={`flex items-center gap-2 px-4 py-2.5 font-['Rajdhani'] font-bold text-xs sm:text-sm tracking-wider border-b-2 transition-all ${
              activeTab === 'autonomous-loops'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>AUTO-AUTOMATISATION ({loops.filter((l) => l.enabled).length} ACTIVES)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SELF-PROGRAMMING ENGINE */}
          {activeTab === 'self-program' && (
            <div className="space-y-6">
              {/* Creator Box */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-950/30 to-black/60 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
                    <h3 className="font-['Orbitron'] text-sm font-semibold tracking-wide text-cyan-200">
                      COMPILATEUR NEURAL DE MODULES & SCRIPTS
                    </h3>
                  </div>
                  <span className="text-[11px] font-['Rajdhani'] text-slate-400">
                    Génère du code exécutable instantané et l'intègre à JARVIS
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={programInput}
                    onChange={(e) => setProgramInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelfProgram()}
                    placeholder="Ex: Auto-programme un scan des ports TCP locaux et vérifie l'intégrité mémoire..."
                    className="flex-1 px-4 py-2.5 rounded-lg bg-black/60 border border-cyan-500/30 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={targetLang}
                      onChange={(e: any) => setTargetLang(e.target.value)}
                      className="px-3 py-2.5 rounded-lg bg-black/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono focus:outline-none"
                    >
                      <option value="powershell">PowerShell (.ps1)</option>
                      <option value="python">Python (.py)</option>
                      <option value="javascript">JavaScript (.js)</option>
                      <option value="routine">Routine JSON</option>
                    </select>

                    <button
                      onClick={() => handleSelfProgram()}
                      disabled={isCompiling || !programInput.trim()}
                      className={`px-5 py-2.5 rounded-lg font-['Rajdhani'] font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 transition-all ${
                        isCompiling || !programInput.trim()
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      }`}
                    >
                      {isCompiling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>SYNTHÈSE...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>AUTO-PROGRAMMER</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Compilation feedback banner */}
                {compileStatus && (
                  <div className="p-3 rounded-lg bg-black/50 border border-cyan-400/30 flex items-center gap-2 text-xs font-mono text-cyan-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
                    <span>{compileStatus}</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="space-y-2 pt-2 border-t border-cyan-500/15">
                  <span className="text-[11px] font-['Rajdhani'] uppercase tracking-wider text-slate-400 block font-semibold">
                    Compétences rapides à auto-générer :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROGRAM_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelfProgram(p.prompt)}
                        disabled={isCompiling}
                        className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 text-xs font-['Rajdhani'] transition-colors flex items-center gap-1.5"
                      >
                        <span>{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* List of Self-Programmed Modules */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Orbitron'] text-xs sm:text-sm font-semibold tracking-wide text-cyan-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    MODULES AUTO-PROGRAMMÉS PAR JARVIS ({modules.length})
                  </h3>
                  <span className="text-slate-400 text-[11px]">
                    Ces modules font désormais partie intégrante du cerveau de JARVIS
                  </span>
                </div>

                {modules.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-black/30 border border-cyan-500/15 text-slate-400 space-y-2">
                    <Code className="w-8 h-8 text-cyan-500/40 mx-auto" />
                    <p className="font-['Rajdhani'] text-sm">
                      Aucun module personnalisé n'a encore été auto-généré.
                    </p>
                    <p className="text-xs text-slate-500">
                      Utilisez le compilateur neural ci-dessus pour doter JARVIS de nouveaux programmes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-xl bg-[#080f24] border border-cyan-500/25 hover:border-cyan-400/50 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/30 text-cyan-300 uppercase">
                                {mod.language}
                              </span>
                              <h4 className="font-['Orbitron'] text-sm font-bold text-slate-100">
                                {mod.title}
                              </h4>
                              {mod.executionCount > 0 && (
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  • {mod.executionCount} exécutions
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{mod.description}</p>
                            <p className="text-[11px] font-mono text-cyan-400/80">
                              Déclencheur vocal : « {mod.triggerPhrase} »
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleCopyCode(mod.id, mod.code)}
                              className="p-2 rounded bg-black/40 hover:bg-cyan-950/50 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                              title="Copier le code source"
                            >
                              {copiedId === mod.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleExecuteModule(mod)}
                              className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-['Rajdhani'] font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>EXÉCUTER</span>
                            </button>

                            <button
                              onClick={() => handleDeleteModule(mod.id)}
                              className="p-2 rounded bg-black/40 hover:bg-rose-500/20 border border-cyan-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
                              title="Supprimer ce module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Code preview block */}
                        <div className="relative p-3 rounded-lg bg-black/80 border border-cyan-500/15 overflow-x-auto max-h-36 font-mono text-[11px] text-emerald-300/90 leading-relaxed">
                          <pre>{mod.code}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HUMAN COMPETENCIES MATRIX */}
          {activeTab === 'competencies' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Domains List */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <span className="font-['Orbitron'] text-xs text-cyan-300 font-bold uppercase tracking-wider">
                    8 Pôles de Compétence Humaine
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    TOUT MAÎTRISÉ (100%)
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                  {competencies.map((comp) => {
                    const isSelected = selectedCompetence?.id === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedCompetence(comp)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-black/30 border-cyan-500/20 text-slate-300 hover:bg-cyan-950/30 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black/40 border border-cyan-500/30 flex items-center justify-center">
                            {getDomainIcon(comp.icon)}
                          </div>
                          <div>
                            <h4 className="font-['Rajdhani'] font-bold text-sm tracking-wide">
                              {comp.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {comp.category} • {comp.level}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Domain Details & Live Consultations */}
              <div className="lg:col-span-7">
                {selectedCompetence ? (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-black/60 border border-cyan-500/30 space-y-5">
                    <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                            {selectedCompetence.category}
                          </span>
                          <h3 className="font-['Orbitron'] text-base font-bold text-cyan-100">
                            {selectedCompetence.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedCompetence.summary}
                        </p>
                      </div>
                    </div>

                    {/* Subfields badges */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-['Rajdhani'] uppercase tracking-wider text-slate-400 block font-semibold">
                        Spécialisations & Disciplines Intégrées :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompetence.subfields.map((sub, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded bg-black/40 border border-cyan-500/20 text-cyan-300 text-xs font-mono"
                          >
                            ✓ {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Consultation Prompts */}
                    <div className="space-y-2 pt-2 border-t border-cyan-500/15">
                      <span className="text-[11px] font-['Rajdhani'] uppercase tracking-wider text-slate-400 block font-semibold">
                        Consulter JARVIS sur ce domaine (1-Clic) :
                      </span>
                      <div className="space-y-2">
                        {selectedCompetence.samplePrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onExecutePrompt(prompt);
                              onClose();
                            }}
                            className="w-full text-left p-3 rounded-lg bg-black/50 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-200 text-xs transition-all flex items-center justify-between group"
                          >
                            <span className="font-['Rajdhani'] text-xs sm:text-sm font-medium">
                              « {prompt} »
                            </span>
                            <ArrowRight className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Sélectionnez un domaine pour explorer les compétences de JARVIS
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTONOMOUS LOOPS */}
          {activeTab === 'autonomous-loops' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-center justify-between">
                <div>
                  <h3 className="font-['Orbitron'] text-sm font-bold text-cyan-200">
                    BOUCLES D'AUTO-AUTOMATISATION PROACTIVES
                  </h3>
                  <p className="text-xs text-slate-400">
                    JARVIS exécute ces routines de manière autonome selon leur périodicité pour maintenir votre machine et votre agenda au sommet.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-300 font-bold">PILOTE ACTIF</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loops.map((loop) => (
                  <div
                    key={loop.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      loop.enabled
                        ? 'bg-[#09112a] border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'bg-black/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${loop.enabled ? 'text-amber-400' : 'text-slate-600'}`} />
                          <h4 className="font-['Rajdhani'] font-bold text-sm text-slate-100">
                            {loop.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400">{loop.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleLoop(loop.id)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                          loop.enabled
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {loop.enabled ? 'ACTIF' : 'INACTIF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Fréquence : {loop.frequency === 'daily' ? 'Quotidienne' : 'Toutes les heures'}
                      </span>

                      <button
                        onClick={() => handleRunLoopNow(loop)}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-['Rajdhani'] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>LANCER IMMÉDIATEMENT</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-black/40 flex items-center justify-between text-xs font-['Rajdhani'] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MOTEUR NEURAL J.A.R.V.I.S. • GEMINI 3.8 FLASH • CONTRÔLE SÉCURISÉ DU PC HÔTE</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 transition-colors font-bold tracking-wider"
          >
            FERMER
          </button>
        </div>
      </div>
    </div>
  );
};

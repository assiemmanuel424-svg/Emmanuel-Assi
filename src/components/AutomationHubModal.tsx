import React, { useState } from 'react';
import {
  X,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Terminal,
  Globe,
  Code,
  Plus,
  Trash2,
  Volume2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  AutomationRoutine,
  AutomationStep,
  ActiveRoutineExecution,
  CompanionStatus,
} from '../types/jarvis';

interface AutomationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: AutomationRoutine[];
  onUpdateRoutines: (routines: AutomationRoutine[]) => void;
  activeExecution: ActiveRoutineExecution | null;
  onRunRoutine: (routine: AutomationRoutine) => void;
  onStopRoutine: () => void;
  companionStatus: CompanionStatus;
}

export const AutomationHubModal: React.FC<AutomationHubModalProps> = ({
  isOpen,
  onClose,
  routines,
  onUpdateRoutines,
  activeExecution,
  onRunRoutine,
  onStopRoutine,
  companionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'routines' | 'create'>('routines');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTriggers, setNewTriggers] = useState('');
  const [newSteps, setNewSteps] = useState<AutomationStep[]>([]);
  const [stepType, setStepType] = useState<AutomationStep['type']>('protocol');
  const [stepTitle, setStepTitle] = useState('');
  const [stepTarget, setStepTarget] = useState('');

  if (!isOpen) return null;

  const handleAddStepToNew = () => {
    if (!stepTitle.trim()) return;
    const step: AutomationStep = {
      id: `step-${Date.now()}`,
      type: stepType,
      title: stepTitle.trim(),
      target: stepTarget.trim(),
      durationSeconds: stepType === 'timer' ? 1500 : undefined,
    };
    setNewSteps([...newSteps, step]);
    setStepTitle('');
    setStepTarget('');
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newSteps.length === 0) return;

    const routine: AutomationRoutine = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Automatisation personnalisée',
      category: 'custom',
      voiceTriggers: newTriggers
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      steps: newSteps,
      isCustom: true,
    };

    onUpdateRoutines([...routines, routine]);
    setNewTitle('');
    setNewDesc('');
    setNewTriggers('');
    setNewSteps([]);
    setActiveTab('routines');
  };

  const handleDeleteRoutine = (id: string) => {
    onUpdateRoutines(routines.filter((r) => r.id !== id));
  };

  const getStepIcon = (type: AutomationStep['type']) => {
    switch (type) {
      case 'protocol':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'web':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'powershell':
      case 'python':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'speech':
        return <Volume2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'timer':
        return <Clock className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#090e1f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#070c1a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-amber-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Orbitron'] font-bold text-sm text-cyan-100 tracking-wider flex items-center gap-2">
                <span>CENTRE D'AUTOMATISATIONS & ROUTINES</span>
                <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  1-CLIC & VOCAL
                </span>
              </h2>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Déclenchez des chaînes d'actions ou lancez-les directement à la voix
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

        {/* Active Execution Banner if a routine is running */}
        {activeExecution && (
          <div className="px-6 py-3 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-300 text-xs font-['Rajdhani']">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold uppercase tracking-wider">
                Exécution en cours :
              </span>
              <span className="text-slate-200">
                Étape {activeExecution.currentStepIndex + 1}
              </span>
            </div>
            <button
              onClick={onStopRoutine}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded transition-colors"
            >
              Arrêter l'automatisation
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-cyan-500/15 bg-[#070c1a]/50">
          <button
            onClick={() => setActiveTab('routines')}
            className={`px-4 py-2 font-['Rajdhani'] font-semibold text-xs uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'routines'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Routines Disponibles ({routines.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-['Rajdhani'] font-semibold text-xs uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'create'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Créer une Nouvelle Routine
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'routines' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routines.map((routine) => {
                const isRunning = Boolean(
                  activeExecution && activeExecution.routineId === routine.id
                );

                return (
                  <div
                    key={routine.id}
                    className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                      isRunning
                        ? 'bg-amber-950/20 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-[#0a1126] border-cyan-500/25 hover:border-cyan-400/50'
                    }`}
                  >
                    <div>
                      {/* Title and Category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-['Rajdhani'] font-bold text-sm text-cyan-200 uppercase tracking-wide">
                              {routine.title}
                            </h3>
                            {routine.isCustom && (
                              <span className="text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-1 rounded">
                                PERSO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {routine.description}
                          </p>
                        </div>

                        {routine.isCustom && (
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Supprimer cette routine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Steps List */}
                      <div className="my-3 space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                          Séquence d'actions ({routine.steps.length}) :
                        </span>
                        <div className="space-y-1">
                          {routine.steps.map((st, sIdx) => (
                            <div
                              key={st.id || sIdx}
                              className="flex items-center gap-2 px-2 py-1 rounded bg-black/40 border border-slate-800 text-[11px] text-slate-300"
                            >
                              <span className="text-slate-600 font-mono text-[9px]">
                                {sIdx + 1}.
                              </span>
                              {getStepIcon(st.type)}
                              <span className="truncate flex-1">{st.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Voice Triggers */}
                      {routine.voiceTriggers.length > 0 && (
                        <div className="mb-3 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-['Rajdhani'] font-semibold text-cyan-400/80 uppercase tracking-wider block mb-1">
                            Déclencheurs vocaux :
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {routine.voiceTriggers.map((trig, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 italic"
                              >
                                "{trig}"
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Launch Button */}
                    <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {routine.steps.some(
                          (s) => s.type === 'powershell' || s.type === 'python'
                        ) && !companionStatus.connected
                          ? 'Scripts prêts à être copiés/exécutés'
                          : 'Prêt à exécuter'}
                      </span>
                      <button
                        onClick={() => onRunRoutine(routine)}
                        disabled={isRunning}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isRunning
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-wait'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRunning ? 'En cours...' : 'Exécuter'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Create Routine Form */
            <form onSubmit={handleCreateRoutine} className="space-y-4 max-w-2xl mx-auto">
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Titre de l'automatisation
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Lancement Projet Web, Mode Nuit..."
                  className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="ex: Ouvre mes outils et mes cours en un clic"
                  className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Déclencheurs Vocaux (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newTriggers}
                  onChange={(e) => setNewTriggers(e.target.value)}
                  placeholder="ex: lance mon projet, active le mode nuit"
                  className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Dire l'une de ces phrases au microphone déclenchera automatiquement cette routine.
                </p>
              </div>

              {/* Steps builder */}
              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-3">
                <h4 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300">
                  Ajouter des étapes séquentielles
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={stepType}
                    onChange={(e) => setStepType(e.target.value as any)}
                    className="bg-slate-900 border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="protocol">Protocole Windows (ex: vscode://, calculator:)</option>
                    <option value="web">Lien Web (ex: https://...)</option>
                    <option value="speech">Annonce vocale JARVIS</option>
                    <option value="powershell">Script PowerShell</option>
                    <option value="timer">Minuteur Pomodoro (25 min)</option>
                  </select>

                  <input
                    type="text"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    placeholder="Nom de l'étape"
                    className="bg-black/60 border border-cyan-500/25 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  />

                  <input
                    type="text"
                    value={stepTarget}
                    onChange={(e) => setStepTarget(e.target.value)}
                    placeholder={
                      stepType === 'speech'
                        ? 'Texte à prononcer'
                        : stepType === 'protocol'
                        ? 'ex: vscode:// ou calculator:'
                        : 'Cible URL ou commande'
                    }
                    className="bg-black/60 border border-cyan-500/25 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddStepToNew}
                  disabled={!stepTitle.trim()}
                  className="px-3 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter cette étape</span>
                </button>

                {/* Steps preview */}
                {newSteps.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Étapes configurées ({newSteps.length}) :
                    </span>
                    {newSteps.map((st, idx) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2 rounded bg-black/60 border border-slate-800 text-xs text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">{idx + 1}.</span>
                          {getStepIcon(st.type)}
                          <span className="font-semibold">{st.title}</span>
                          <span className="text-slate-500 truncate max-w-xs">
                            ({st.target || st.type})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewSteps(newSteps.filter((s) => s.id !== st.id))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!newTitle.trim() || newSteps.length === 0}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enregistrer l'automatisation</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

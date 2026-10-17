import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Code,
  Monitor,
  CheckSquare,
  FileText,
  Calculator,
  Languages,
  Terminal,
  Play,
  Plus,
  Trash2,
  Check,
  Zap,
  Globe,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { JarvisTask, QuickNote, CompanionStatus } from '../types/jarvis';

interface ArsenalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt: (prompt: string) => void;
  tasks: JarvisTask[];
  onUpdateTasks: (tasks: JarvisTask[]) => void;
  notes: QuickNote[];
  onUpdateNotes: (notes: QuickNote[]) => void;
  companionStatus: CompanionStatus;
}

export const ArsenalModal: React.FC<ArsenalModalProps> = ({
  isOpen,
  onClose,
  onExecutePrompt,
  tasks,
  onUpdateTasks,
  notes,
  onUpdateNotes,
  companionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'code' | 'pc' | 'tasks' | 'notes'>('study');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const task: JarvisTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    onUpdateTasks([task, ...tasks]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (id: string) => {
    onUpdateTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const note: QuickNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateNotes([note, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const handleTriggerAction = (promptText: string) => {
    onClose();
    onExecutePrompt(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-[#090e1f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#070c1a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 glow-cyan-sm">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="font-['Orbitron'] font-bold text-sm text-cyan-100 tracking-wider flex items-center gap-2">
                <span>ARSENAL DES CAPACITÉS J.A.R.V.I.S.</span>
                <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                  TOUTES COMPÉTENCES
                </span>
              </h2>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Études, Mathématiques, Programmation, Tâches, Notes et Contrôle PC en un clic
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

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-cyan-500/15 bg-[#070c1a]/50 overflow-x-auto">
          {[
            { id: 'study', label: 'Études & Maths', icon: BookOpen },
            { id: 'code', label: 'Programmation', icon: Code },
            { id: 'pc', label: 'Contrôle PC', icon: Monitor },
            { id: 'tasks', label: `Tâches (${tasks.filter((t) => !t.completed).length})`, icon: CheckSquare },
            { id: 'notes', label: `Notes (${notes.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 font-['Rajdhani'] font-semibold text-xs uppercase tracking-wider rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: Études & Sciences */}
          {activeTab === 'study' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold font-['Rajdhani'] text-sm">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <span>Résolution Mathématique & Calculs</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Résout des équations, dérivées, intégrales, algèbre, géométrie et statistiques avec démonstrations détaillées.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleTriggerAction('Résous cette équation différentielle : dy/dx + 2y = 4 avec explications pas à pas.')}
                      className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200"
                    >
                      Équations différentielles
                    </button>
                    <button
                      onClick={() => handleTriggerAction('Explique le théorème de Pythagore et donne des exemples concrets.')}
                      className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200"
                    >
                      Théorèmes & Géométrie
                    </button>
                    <button
                      onClick={() => handleTriggerAction('Résous : 2x^2 - 5x + 3 = 0 avec la méthode du discriminant.')}
                      className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200"
                    >
                      Équations 2nd degré
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold font-['Rajdhani'] text-sm">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Fiches de Révision & Résumés</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Génère des fiches mémo condensées, des plans de dissertation et des synthèses de cours.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleTriggerAction('Génère une fiche de révision complète et structurée sur la Seconde Guerre Mondiale.')}
                      className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-[11px] text-purple-200"
                    >
                      Fiche Histoire
                    </button>
                    <button
                      onClick={() => handleTriggerAction('Fais-moi un plan détaillé de dissertation sur : La technique libère-t-elle l\'homme ?')}
                      className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-[11px] text-purple-200"
                    >
                      Plan Dissertation
                    </button>
                    <button
                      onClick={() => handleTriggerAction('Rédige une synthèse sur la photosynthèse et la respiration cellulaire.')}
                      className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-[11px] text-purple-200"
                    >
                      Fiche SVT & Biologie
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center gap-2 mb-2 text-emerald-300 font-bold font-['Rajdhani'] text-sm">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>Mode Quiz & Entraînement Oral</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    JARVIS vous interroge question par question et vous note avec des conseils bienveillants.
                  </p>
                  <button
                    onClick={() => handleTriggerAction('Lance un quiz de révision interactif de 5 questions sur l\'informatique et le Web. Pose-moi la première question.')}
                    className="w-full py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-xs text-emerald-200 font-semibold"
                  >
                    Démarrer un Quiz Interactif
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center gap-2 mb-2 text-sky-300 font-bold font-['Rajdhani'] text-sm">
                    <Languages className="w-4 h-4 text-sky-400" />
                    <span>Traduction & Perfectionnement Langues</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Traduit avec précision et explique le vocabulaire et la grammaire en anglais, espagnol, etc.
                  </p>
                  <button
                    onClick={() => handleTriggerAction('Aide-moi à pratiquer mon anglais professionnel. Pose-moi une question en anglais pour commencer.')}
                    className="w-full py-1.5 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-500/30 text-xs text-sky-200 font-semibold"
                  >
                    Pratiquer l'Anglais avec JARVIS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Programmation & Code */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20">
                <h3 className="font-['Rajdhani'] font-bold text-sm text-cyan-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Maîtrise Complète du Développement</span>
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  JARVIS maîtrise Python, JavaScript, TypeScript, C++, Java, Rust, SQL, HTML/CSS et PowerShell. Cliquez sur un modèle pour générer le code complet :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleTriggerAction('Écris un programme Python complet avec interface graphique Tkinter pour un gestionnaire de mots de passe sécurisé.')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">App Python Tkinter</p>
                    <p className="text-[10px] text-slate-500">Gestionnaire de mots de passe</p>
                  </button>

                  <button
                    onClick={() => handleTriggerAction('Écris une fonction React TypeScript avec hooks pour gérer un compte à rebours Pomodoro avec sons.')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">Composant React TS</p>
                    <p className="text-[10px] text-slate-500">Minuteur avec état & audio</p>
                  </button>

                  <button
                    onClick={() => handleTriggerAction('Génère un script PowerShell complet pour sauvegarder un dossier source vers un disque externe avec horodatage.')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">Script PowerShell Backup</p>
                    <p className="text-[10px] text-slate-500">Sauvegarde automatique</p>
                  </button>

                  <button
                    onClick={() => handleTriggerAction('Génère les requêtes SQL complètes pour créer une base de données d\'e-commerce avec utilisateurs, produits et commandes.')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">Schéma SQL Relationnel</p>
                    <p className="text-[10px] text-slate-500">Tables, clés étrangères et index</p>
                  </button>

                  <button
                    onClick={() => handleTriggerAction('Explique les structures de données en C++ : vecteurs, listes chaînées et arbres binaires avec exemples.')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">Structures de Données C++</p>
                    <p className="text-[10px] text-slate-500">Pointeurs et complexité</p>
                  </button>

                  <button
                    onClick={() => handleTriggerAction('Aide-moi à déboguer ce problème en JavaScript : quelle est la différence exacte entre Promise.all et Promise.allSettled ?')}
                    className="p-2.5 rounded bg-[#070d1d] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
                  >
                    <p className="font-semibold text-xs text-cyan-200">Débogage Asynchrone</p>
                    <p className="text-[10px] text-slate-500">Promesses & async/await</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Contrôle PC */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: 'Calculatrice', proto: 'calculator:' },
                  { name: 'VS Code', proto: 'vscode://' },
                  { name: 'Spotify', proto: 'spotify://' },
                  { name: 'Paramètres', proto: 'ms-settings:' },
                  { name: 'Terminal', proto: 'wt:' },
                  { name: 'Messagerie', proto: 'mailto:' },
                  { name: 'Bloc-notes', proto: 'notepad:' },
                  { name: 'Google Docs', proto: 'https://docs.google.com' },
                ].map((app, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (app.proto.startsWith('http')) {
                        window.open(app.proto, '_blank');
                      } else {
                        window.location.href = app.proto;
                      }
                    }}
                    className="p-3 rounded-lg bg-black/50 border border-cyan-500/20 hover:border-cyan-400 text-center transition-all group"
                  >
                    <p className="font-['Rajdhani'] font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                      {app.name}
                    </p>
                    <span className="text-[10px] text-cyan-400/70">Lancer →</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-['Rajdhani'] font-bold text-xs uppercase text-cyan-300">
                    Commandes & Automatisations PC Immédiates (Vocales ou 1-Clic) :
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Exécution Directe</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTriggerAction('Coupe le son de mon PC')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    🔇 Couper le son (Mute)
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Monte le son')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    🔊 Augmenter le son
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Prends une capture d\'écran')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    📸 Capture d'Écran
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Liste les processus qui tournent sur mon PC')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    ⚡ Processus Actifs (CPU/RAM)
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Ouvre mon bureau')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    📁 Ouvrir le Bureau
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Ouvre mes téléchargements')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    📥 Dossier Téléchargements
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Vide la corbeille')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    🗑️ Vider la Corbeille
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Purge le cache DNS')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    🌐 Purger Cache DNS
                  </button>
                  <button
                    onClick={() => handleTriggerAction('Verrouille mon PC')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    🔒 Verrouiller la Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tâches & To-Do List */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ajouter une tâche (ex: Réviser le chapitre 3, Coder l'API...)"
                  className="flex-1 bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </form>

              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-500">
                    Aucune tâche en cours. Ajoutez vos objectifs pour que JARVIS vous aide à les suivre !
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                        task.completed
                          ? 'bg-black/30 border-slate-800 text-slate-500 line-through'
                          : 'bg-[#0b1227] border-cyan-500/30 text-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-cyan-500 border-cyan-400 text-black'
                            : 'border-slate-600 hover:border-cyan-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <span className="flex-1 text-xs truncate">{task.title}</span>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Notes Rapides */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2.5">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Titre de la note..."
                  className="w-full bg-black/60 border border-cyan-500/25 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Contenu de la note..."
                  className="w-full bg-black/60 border border-cyan-500/25 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    Enregistrer la note
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notes.length === 0 ? (
                  <p className="col-span-2 text-center py-6 text-xs text-slate-500">
                    Aucune note enregistrée.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-[#0a1125] border border-cyan-500/25 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-['Rajdhani'] font-bold text-xs text-cyan-300 truncate">
                            {note.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4">
                          {note.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2 font-mono">
                        {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

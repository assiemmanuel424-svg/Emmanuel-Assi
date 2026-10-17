import React, { useState } from 'react';
import {
  X,
  Brain,
  Plus,
  Trash2,
  Edit2,
  Check,
  Download,
  Upload,
  AlertTriangle,
  User,
  Target,
  FileText,
} from 'lucide-react';
import { UserProfile, MemoryItem } from '../types/jarvis';

interface MemoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  memories: MemoryItem[];
  onUpdateMemories: (memories: MemoryItem[]) => void;
}

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  memories,
  onUpdateMemories,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'memories'>('memories');
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryItem['category']>('preference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content: newMemoryText.trim(),
      category: newMemoryCategory,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    onUpdateMemories([newItem, ...memories]);
    setNewMemoryText('');
  };

  const handleToggleMemoryActive = (id: string) => {
    onUpdateMemories(
      memories.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const handleDeleteMemory = (id: string) => {
    onUpdateMemories(memories.filter((m) => m.id !== id));
  };

  const handleStartEdit = (m: MemoryItem) => {
    setEditingId(m.id);
    setEditText(m.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateMemories(
      memories.map((m) => (m.id === id ? { ...m, content: editText.trim() } : m))
    );
    setEditingId(null);
  };

  const handleExportJson = () => {
    const data = {
      profile: userProfile,
      memories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_memory_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) onUpdateProfile(parsed.profile);
        if (Array.isArray(parsed.memories)) onUpdateMemories(parsed.memories);
      } catch (err) {
        alert('Format de fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllMemories = () => {
    onUpdateMemories([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-3xl bg-[#090e1f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#070c1a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Orbitron'] font-bold text-sm text-cyan-100 tracking-wider">
                BANQUE DE MÉMOIRE PERSONNELLE
              </h2>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Gérez ce que JARVIS retient de votre identité, vos préférences et vos projets
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-cyan-500/15 bg-[#070c1a]/50">
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 font-['Rajdhani'] font-semibold text-xs uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'memories'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Souvenirs Enregistrés ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-['Rajdhani'] font-semibold text-xs uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identité & Profil
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nom ou Surnom d'usage
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    placeholder="ex: Monsieur, Emmanuel, Tony..."
                    className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    JARVIS vous appellera avec ce nom dans ses réponses.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Statut / Domaine d'activité
                  </label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, role: e.target.value })
                    }
                    placeholder="ex: Étudiant en informatique, Chercheur..."
                    className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Objectifs et Projets majeurs
                </label>
                <textarea
                  rows={2}
                  value={profileForm.goals}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, goals: e.target.value })
                  }
                  placeholder="ex: Réussir mes examens d'algorithmique, coder mon application..."
                  className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Préférences de communication
                </label>
                <textarea
                  rows={2}
                  value={profileForm.preferences}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, preferences: e.target.value })
                  }
                  placeholder="ex: Réponses directes, pédagogiques, sans verbiage..."
                  className="w-full bg-black/50 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer l'identité</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Add New Memory Form */}
              <form
                onSubmit={handleAddMemory}
                className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un souvenir manuellement</span>
                  </span>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                    className="bg-slate-900 border border-cyan-500/30 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                  >
                    <option value="preference">Préférence</option>
                    <option value="project">Projet</option>
                    <option value="study">Études</option>
                    <option value="personal">Personnel</option>
                    <option value="custom">Autre</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder="ex: Je préfère que mes scripts soient écrits en Python..."
                    className="flex-1 bg-black/60 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMemoryText.trim()}
                    className="px-3 py-2 text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Mémoriser
                  </button>
                </div>
              </form>

              {/* Memories List */}
              <div className="space-y-2.5">
                {memories.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Aucun souvenir enregistré dans la mémoire centrale.
                  </div>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border transition-all ${
                        m.isActive
                          ? 'bg-[#0b1227] border-cyan-500/30 text-slate-200'
                          : 'bg-black/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-black border border-cyan-400 rounded px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveEdit(m.id)}
                            className="p-1 rounded bg-cyan-500 text-black"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                  m.category === 'preference'
                                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                                    : m.category === 'project'
                                    ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {m.category}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">{m.content}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Toggle active button */}
                            <button
                              onClick={() => handleToggleMemoryActive(m.id)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                                m.isActive
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-500'
                              }`}
                              title={
                                m.isActive
                                  ? 'Désactiver temporairement ce souvenir'
                                  : 'Réactiver ce souvenir'
                              }
                            >
                              {m.isActive ? 'ACTIF' : 'IGNORÉ'}
                            </button>

                            <button
                              onClick={() => handleStartEdit(m)}
                              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteMemory(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Import, Export, Clear) */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#070c1a] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exporter JSON</span>
            </button>

            <label className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Importer JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>

          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-400">Tout effacer ?</span>
                <button
                  onClick={handleClearAllMemories}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold text-[11px]"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Effacer toute la mémoire</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

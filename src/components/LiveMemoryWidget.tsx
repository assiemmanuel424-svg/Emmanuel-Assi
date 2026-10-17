import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ChevronRight,
  Bookmark,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Tag,
  Maximize2,
} from 'lucide-react';
import { MemoryItem } from '../types/jarvis';

interface LiveMemoryWidgetProps {
  memories: MemoryItem[];
  onAddMemory: (content: string, category?: MemoryItem['category']) => void;
  onDeleteMemory: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onOpenFullMemory: () => void;
  isFullPanel?: boolean;
}

export const LiveMemoryWidget: React.FC<LiveMemoryWidgetProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onToggleActive,
  onOpenFullMemory,
  isFullPanel = false,
}) => {
  const [newText, setNewText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryItem['category']>('preference');
  const [justAdded, setJustAdded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | MemoryItem['category']>('all');

  const activeMemories = memories.filter((m) => m.isActive);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newText.trim()) return;

    onAddMemory(newText.trim(), selectedCategory);
    setNewText('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const getCategoryColor = (cat: MemoryItem['category']) => {
    switch (cat) {
      case 'preference':
        return 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30';
      case 'directive':
        return 'text-amber-300 border-amber-500/40 bg-amber-950/30';
      case 'project':
        return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30';
      case 'personal':
        return 'text-sky-300 border-sky-500/40 bg-sky-950/30';
      case 'fact':
      default:
        return 'text-purple-300 border-purple-500/40 bg-purple-950/30';
    }
  };

  const getCategoryBadgeLabel = (cat: MemoryItem['category']) => {
    switch (cat) {
      case 'preference':
        return 'Préférence';
      case 'directive':
        return 'Directive';
      case 'project':
        return 'Projet';
      case 'personal':
        return 'Perso';
      case 'fact':
      default:
        return 'Fait';
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = searchQuery.trim() === '' || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      className={`w-full relative overflow-hidden flex flex-col rounded-xl bg-[#070b16]/90 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.12)] text-slate-100 ${
        isFullPanel ? 'h-full p-4 gap-3' : 'mt-3 p-3.5 gap-2.5'
      }`}
    >
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-40 h-24 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold tracking-wider text-purple-200">
              BANQUE DE MÉMOIRE
            </h4>
            <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
              {activeMemories.length} actif{activeMemories.length > 1 ? 's' : ''} sur {memories.length} souvenir{memories.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenFullMemory}
            className="text-[11px] font-['Rajdhani'] font-bold text-purple-300 hover:text-purple-100 flex items-center gap-1 px-2 py-1 rounded bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 transition-all cursor-pointer"
            title="Ouvrir le gestionnaire avancé"
          >
            <span>Gestionnaire</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* When in Full Panel: Category Filters & Search */}
      {isFullPanel && (
        <div className="space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher dans les souvenirs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-slate-700/60 focus:border-purple-400 text-xs text-slate-200 placeholder:text-slate-500 outline-none font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {(['all', 'preference', 'directive', 'project', 'fact'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-['Rajdhani'] font-bold uppercase transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-purple-900/80 border border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                    : 'bg-black/40 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Memory Box */}
      <form onSubmit={handleAdd} className="space-y-1.5 flex-shrink-0 bg-black/40 p-2.5 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Ex: Retiens que je code en TypeScript et que je vis à Paris..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/70 border border-slate-700 focus:border-purple-400 text-xs text-slate-200 placeholder:text-slate-500 outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className={`px-3 py-1.5 rounded-lg font-['Rajdhani'] font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              newText.trim()
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer'
                : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Enregistrer ce fait dans JARVIS"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Retenu !</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Retenir</span>
              </>
            )}
          </button>
        </div>

        {/* Category selector pills */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Tag className="w-3 h-3 text-purple-400" />
          <span className="mr-1">Catégorie :</span>
          {(['preference', 'directive', 'project', 'fact'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-950 border border-purple-400 text-purple-200 font-bold'
                  : 'bg-black/30 border border-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {getCategoryBadgeLabel(cat)}
            </button>
          ))}
        </div>
      </form>

      {/* Memory Items List */}
      <div
        className={`space-y-1.5 overflow-y-auto custom-scrollbar pr-1 ${
          isFullPanel ? 'flex-1 max-h-[420px]' : 'max-h-48'
        }`}
      >
        {filteredMemories.length === 0 ? (
          <div className="p-3 rounded-lg border border-dashed border-purple-500/20 text-center text-xs text-slate-400 leading-relaxed bg-black/20">
            <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1 opacity-70" />
            <p className="font-semibold text-slate-300">Aucun souvenir trouvé</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Écrivez un fait ci-dessus ou dites simplement : <br />
              <span className="italic text-purple-300">« Retiens que j'aime le café noir »</span>
            </p>
          </div>
        ) : (
          filteredMemories.map((m) => (
            <div
              key={m.id}
              className={`group flex items-start justify-between gap-2 p-2 rounded-lg border text-xs transition-colors ${getCategoryColor(
                m.category
              )} ${!m.isActive ? 'opacity-50 line-through' : ''}`}
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {onToggleActive && (
                  <button
                    type="button"
                    onClick={() => onToggleActive(m.id)}
                    className="mt-0.5 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer flex-shrink-0"
                    title={m.isActive ? 'Désactiver temporairement' : 'Activer'}
                  >
                    {m.isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                )}
                {!onToggleActive && <Bookmark className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-70" />}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-black/40 border border-slate-700/60 text-slate-300">
                      {getCategoryBadgeLabel(m.category)}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-slate-100 break-words leading-tight">
                    {m.content}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteMemory(m.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity p-1 rounded hover:bg-black/40 cursor-pointer flex-shrink-0"
                title="Supprimer ce fait de la mémoire"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick starter chips */}
      {!isFullPanel && memories.length < 3 && (
        <div className="pt-1 border-t border-purple-500/20">
          <span className="text-[10px] text-slate-500 font-mono block mb-1">Idées de mémorisation rapide :</span>
          <div className="flex flex-wrap gap-1">
            {[
              "Je préfère le code en TypeScript",
              "Mon fuseau horaire est Paris",
              "Réponds-moi toujours avec concision",
            ].map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAddMemory(suggestion, 'preference')}
                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-purple-100 transition-colors cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Search,
  Send,
  Sparkles,
  Mic,
  Brain,
  Eye,
  Music,
  FolderOpen,
  Paperclip,
  Globe,
  X,
  ChevronDown,
  Terminal,
  Palette,
  FileText,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { JarvisState } from '../types/jarvis';

export interface SendMessageOptions {
  mode?: 'omni' | 'deep_reasoning' | 'deep_research' | 'code_sandbox' | 'image_studio' | 'canvas_studio';
  attachment?: {
    name?: string;
    preview: string;
    mimeType: string;
    data: string;
  };
  enableSearch?: boolean;
}

interface JarvisSearchBarProps {
  onSendMessage: (text: string, options?: SendMessageOptions) => void;
  onOpenFolders: () => void;
  onOpenGpt6Modal?: () => void;
  onOpenForex?: () => void;
  onOpenClaudeCode?: () => void;
  jarvisState: JarvisState;
  onStartListening?: () => void;
  onStopSpeech?: () => void;
  isAudioPlaying?: boolean;
}

export const JarvisSearchBar: React.FC<JarvisSearchBarProps> = ({
  onSendMessage,
  onOpenFolders,
  onOpenGpt6Modal,
  onOpenForex,
  onOpenClaudeCode,
  jarvisState,
  onStartListening,
  onStopSpeech,
  isAudioPlaying,
}) => {
  const [query, setQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<
    'omni' | 'deep_reasoning' | 'deep_research' | 'code_sandbox' | 'image_studio' | 'canvas_studio'
  >('omni');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    preview: string;
    mimeType: string;
    data: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const modes = [
    { id: 'omni', label: '⚡ GPT-6 Omni', color: 'text-cyan-300', desc: 'Rapide, multimodal & vocal' },
    { id: 'deep_reasoning', label: '🧠 Pensée o1/o3', color: 'text-purple-300', desc: 'Raisonnement délibéré pas-à-pas' },
    { id: 'deep_research', label: '🌐 Deep Research', color: 'text-blue-300', desc: 'Recherche web & rapport fouillé' },
    { id: 'code_sandbox', label: '💻 Code Interpreter', color: 'text-emerald-300', desc: 'Exécution & bac à sable PC' },
    { id: 'image_studio', label: '🎨 DALL-E & Visuel', color: 'text-fuchsia-300', desc: 'Schémas vectoriels SVG & visuels' },
    { id: 'canvas_studio', label: '📄 Canvas Studio', color: 'text-indigo-300', desc: 'Éditeur de document & code' },
  ] as const;

  const currentModeObj = modes.find((m) => m.id === selectedMode) || modes[0];

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string) || '';
      const data = base64String.split(',')[1] || '';
      setSelectedAttachment({
        name: file.name,
        preview: base64String,
        mimeType: file.type || 'image/jpeg',
        data,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedAttachment) return;

    if (isAudioPlaying && onStopSpeech) {
      onStopSpeech();
    }

    onSendMessage(query.trim() || 'Analyse cette pièce jointe avec GPT-6.', {
      mode: selectedMode,
      attachment: selectedAttachment || undefined,
      enableSearch: enableWebSearch,
    });

    setQuery('');
    setSelectedAttachment(null);
  };

  const handleSuggestionClick = (prompt: string, mode?: typeof selectedMode) => {
    if (isAudioPlaying && onStopSpeech) {
      onStopSpeech();
    }
    onSendMessage(prompt, {
      mode: mode || selectedMode,
      enableSearch: enableWebSearch,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center gap-3 select-none relative">
      {/* Attachment Preview (if any) */}
      {selectedAttachment && (
        <div className="w-full flex items-center justify-between p-2 px-3 rounded-xl bg-black/80 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <img
              src={selectedAttachment.preview}
              alt="Aperçu pièce jointe"
              className="w-10 h-10 object-cover rounded-lg border border-cyan-400/50"
            />
            <div className="text-left">
              <span className="text-xs font-mono text-cyan-200 block truncate max-w-[280px] font-bold">
                {selectedAttachment.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Prêt pour l'analyse multimodale GPT-6
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedAttachment(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Supprimer la pièce jointe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Model & Feature Pill Bar */}
      <div className="w-full flex items-center justify-between px-1 text-xs">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-xs font-['Rajdhani'] font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.12)] cursor-pointer"
          >
            <span className={currentModeObj.color}>{currentModeObj.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isModeDropdownOpen && (
            <div className="absolute left-0 top-8 z-50 w-64 rounded-xl bg-[#070e1c] border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden p-1 space-y-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMode(m.id);
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                    selectedMode === m.id
                      ? 'bg-cyan-950/80 border border-cyan-500/40'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <span className={`font-['Orbitron'] font-bold text-[11px] ${m.color}`}>
                    {m.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web Grounding Toggle & GPT-6 Hub button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={`flex items-center gap-1 px-2.5 py-0.8 rounded-full border text-[11px] font-['Rajdhani'] font-semibold transition-all cursor-pointer ${
              enableWebSearch
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-black/40 border-slate-700 text-slate-500'
            }`}
            title={enableWebSearch ? 'Recherche Web Google active' : 'Recherche Web désactivée'}
          >
            <Globe className="w-3 h-3" />
            <span>Web Search</span>
          </button>

          {onOpenGpt6Modal && (
            <button
              type="button"
              onClick={onOpenGpt6Modal}
              className="text-[11px] font-['Rajdhani'] font-bold text-purple-300 hover:text-purple-100 flex items-center gap-1 cursor-pointer"
              title="Ouvrir la matrice complète GPT-6"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Matrice V6</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center rounded-2xl bg-[#070d1a]/90 backdrop-blur-xl border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.18)] hover:border-cyan-400/60 focus-within:border-cyan-400 focus-within:shadow-[0_0_45px_rgba(0,240,255,0.28)] transition-all p-1.5"
      >
        {/* Left Attachment Trigger */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="pl-3 pr-2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-center"
          title="Joindre une image ou capture d'écran pour analyse GPT-6"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            selectedMode === 'deep_reasoning'
              ? 'Posez une question complexe à résoudre avec chaîne de pensée...'
              : selectedMode === 'deep_research'
              ? 'Sujet pour recherche web approfondie & rapport...'
              : selectedMode === 'image_studio'
              ? 'Décrivez le schéma vectoriel ou le visuel à générer...'
              : selectedMode === 'canvas_studio'
              ? 'Rédigez ou codez dans l\'espace Canvas interactif...'
              : 'Communiquez avec J.A.R.V.I.S. (GPT-6)...'
          }
          className="flex-1 bg-transparent py-2.5 px-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none font-sans"
        />

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 pr-1">
          {/* Microphone Quick Listen */}
          {onStartListening && (
            <button
              type="button"
              onClick={onStartListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                jarvisState === 'listening'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.7)] animate-pulse'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40'
              }`}
              title="Activer la reconnaissance vocale"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!query.trim() && !selectedAttachment}
            className={`p-2 rounded-xl font-bold transition-all flex items-center justify-center ${
              query.trim() || selectedAttachment
                ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] cursor-pointer'
                : 'bg-slate-900/60 text-slate-600 cursor-not-allowed'
            }`}
            title="Envoyer à JARVIS (Entrée)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => handleSuggestionClick("Fournis une analyse formelle avec pensée profonde o1/o3", 'deep_reasoning')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 transition-all cursor-pointer text-[11px]"
        >
          <Brain className="w-3 h-3 text-purple-400" />
          <span>🧠 Pensée Profonde</span>
        </button>

        <button
          type="button"
          onClick={() => handleSuggestionClick("Génère un schéma vectoriel interactif SVG du réacteur Stark", 'image_studio')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-500/30 text-fuchsia-200 transition-all cursor-pointer text-[11px]"
        >
          <Palette className="w-3 h-3 text-fuchsia-400" />
          <span>🎨 DALL-E Schéma</span>
        </button>

        <button
          type="button"
          onClick={() => handleSuggestionClick("Rédige un plan architectural dans Canvas", 'canvas_studio')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 transition-all cursor-pointer text-[11px]"
        >
          <FileText className="w-3 h-3 text-indigo-400" />
          <span>📄 Canvas Studio</span>
        </button>

        <button
          type="button"
          onClick={() => handleSuggestionClick("Lance une recherche approfondie avec citations", 'deep_research')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 transition-all cursor-pointer text-[11px]"
        >
          <Globe className="w-3 h-3 text-blue-400" />
          <span>🌐 Deep Research</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onOpenForex) onOpenForex();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 transition-all cursor-pointer text-[11px] shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          title="Ouvrir le terminal de trading Forex et bot autonome"
        >
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>📈 Forex Trader</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onOpenClaudeCode) onOpenClaudeCode();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-300 transition-all cursor-pointer text-[11px] shadow-[0_0_10px_rgba(99,102,241,0.2)]"
          title="Ouvrir le studio Claude Code pour tous les langages de programmation"
        >
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span>💻 Claude Code Studio</span>
        </button>

        <button
          type="button"
          onClick={onOpenFolders}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 transition-all cursor-pointer text-[11px] shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          title="Ouvrir le menu rassemblant tous les dossiers et l'historique"
        >
          <FolderOpen className="w-3 h-3 text-cyan-400" />
          <span>📂 Dossiers & Menu</span>
        </button>
      </div>
    </div>
  );
};

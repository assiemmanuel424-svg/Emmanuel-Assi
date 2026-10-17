import React, { useState } from 'react';
import {
  Search,
  Send,
  Sparkles,
  Mic,
  Brain,
  Eye,
  Music,
  FolderOpen,
  CornerDownLeft,
} from 'lucide-react';
import { JarvisState } from '../types/jarvis';

interface JarvisSearchBarProps {
  onSendMessage: (text: string) => void;
  onOpenFolders: () => void;
  jarvisState: JarvisState;
  onStartListening?: () => void;
  onStopSpeech?: () => void;
  isAudioPlaying?: boolean;
}

export const JarvisSearchBar: React.FC<JarvisSearchBarProps> = ({
  onSendMessage,
  onOpenFolders,
  jarvisState,
  onStartListening,
  onStopSpeech,
  isAudioPlaying,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    if (isAudioPlaying && onStopSpeech) {
      onStopSpeech();
    }

    onSendMessage(query.trim());
    setQuery('');
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isAudioPlaying && onStopSpeech) {
      onStopSpeech();
    }
    onSendMessage(prompt);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center gap-3 select-none">
      {/* Search Input Bar (Barre de recherche pour communiquer) */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center rounded-2xl bg-[#070d1a]/85 backdrop-blur-xl border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.18)] hover:border-cyan-400/60 focus-within:border-cyan-400 focus-within:shadow-[0_0_45px_rgba(0,240,255,0.28)] transition-all p-1.5"
      >
        {/* Left Search Icon */}
        <div className="pl-3 pr-2 text-cyan-400 flex items-center justify-center">
          <Search className="w-4 h-4 text-cyan-300" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Communiquez avec J.A.R.V.I.S... (ex: « Retiens que... », « Regarde mon écran », « Mets de la musique »)"
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
            disabled={!query.trim()}
            className={`p-2 rounded-xl font-bold transition-all flex items-center justify-center ${
              query.trim()
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
          onClick={() => handleSuggestionClick("Retiens que je suis développeur et que je vis à Paris")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 transition-all cursor-pointer text-[11px]"
        >
          <Brain className="w-3 h-3 text-purple-400" />
          <span>🧠 Mémoriser</span>
        </button>

        <button
          type="button"
          onClick={() => handleSuggestionClick("Regarde mon écran et aide-moi")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/30 text-sky-200 transition-all cursor-pointer text-[11px]"
        >
          <Eye className="w-3 h-3 text-sky-400" />
          <span>👁️ Voir l'écran</span>
        </button>

        <button
          type="button"
          onClick={() => handleSuggestionClick("Lance la musique d'ambiance Deep Focus")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 transition-all cursor-pointer text-[11px]"
        >
          <Music className="w-3 h-3 text-cyan-400" />
          <span>🎵 Smart Musique</span>
        </button>

        <button
          type="button"
          onClick={onOpenFolders}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-200 transition-all cursor-pointer text-[11px]"
        >
          <FolderOpen className="w-3 h-3 text-amber-400" />
          <span>📁 Dossiers Système</span>
        </button>
      </div>
    </div>
  );
};

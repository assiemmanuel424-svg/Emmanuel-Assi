import React, { useState, useRef } from 'react';
import {
  X,
  Brain,
  Sparkles,
  Zap,
  Camera,
  Upload,
  Code,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Play,
  Copy,
  Check,
  Search,
  Layers,
  ArrowRight,
  Eye,
  Bot,
  RefreshCw,
  Terminal,
  Cpu,
} from 'lucide-react';
import {
  Gpt6ReasoningResult,
  CompanionStatus,
  WindowsAction,
} from '../types/jarvis';

interface Gpt6OmniModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionStatus: CompanionStatus;
  onExecutePrompt: (prompt: string) => void;
  onExecutePcAction?: (action: WindowsAction) => void;
}

type OmniMode = 'deep_reasoning' | 'vision_analysis' | 'code_sandbox' | 'agent_swarm';

export const Gpt6OmniModal: React.FC<Gpt6OmniModalProps> = ({
  isOpen,
  onClose,
  companionStatus,
  onExecutePrompt,
  onExecutePcAction,
}) => {
  const [activeMode, setActiveMode] = useState<OmniMode>('deep_reasoning');
  const [thinkingLevel, setThinkingLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{ mimeType: string; data: string; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Gpt6ReasoningResult | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string) || '';
      const data = base64String.split(',')[1] || '';
      setSelectedImage({
        mimeType: file.type,
        data,
        preview: base64String,
      });
      setActiveMode('vision_analysis');
    };
    reader.readAsDataURL(file);
  };

  const handleCapturePcScreen = async () => {
    if (!companionStatus.connected) {
      alert('Le pont Windows local (port 7890) doit être actif pour capturer automatiquement votre écran.');
      return;
    }
    if (onExecutePcAction) {
      onExecutePcAction({
        type: 'companion',
        title: 'Capture d\'écran pour inspection GPT-6',
        description: 'Prend un instantané de l\'écran pour le cortex visuel GPT-6',
        params: { action: 'screenshot' },
      });
      setPromptInput((prev) => prev || 'Analyse l\'état visuel et les informations de mon écran.');
      setActiveMode('vision_analysis');
    }
  };

  const handleRunReasoning = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || promptInput;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/jarvis/gpt6-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          thinkingLevel,
          mode: activeMode,
          image: selectedImage ? { mimeType: selectedImage.mimeType, data: selectedImage.data } : null,
          enableSearch,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur du moteur de délibération GPT-6');
      }

      setResult(data.result);
      setExpandedThoughts(true);
    } catch (err: any) {
      console.error('Erreur GPT-6 reason call:', err);
      setErrorMessage(err.message || 'Échec de connexion au moteur de délibération.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExecuteLocalCode = (snippet: { language: string; code: string; title: string }) => {
    if (!onExecutePcAction) return;

    if (snippet.language === 'powershell') {
      onExecutePcAction({
        type: 'powershell',
        title: snippet.title || 'Exécution script PowerShell GPT-6',
        description: 'Exécution du script PowerShell validé formellement par GPT-6',
        target: snippet.code,
      });
    } else if (snippet.language === 'python') {
      onExecutePcAction({
        type: 'python',
        title: snippet.title || 'Exécution script Python GPT-6',
        description: 'Exécution du script Python validé formellement par GPT-6',
        target: snippet.code,
      });
    } else {
      // Default companion action
      onExecutePcAction({
        type: 'companion',
        title: snippet.title || 'Script GPT-6',
        description: 'Exécution du script validé par GPT-6',
        params: { action: 'run_cmd', cmd: snippet.code },
      });
    }
  };

  const presets = [
    {
      mode: 'deep_reasoning' as OmniMode,
      title: '🔬 Démonstration Quantique & Réfutation',
      prompt: 'Fournis une analyse formelle de la décohérence quantique versus l\'interprétation des mondes multiples, avec calculs de matrice de densité et chaîne de déduction pas-à-pas sans simplification.',
    },
    {
      mode: 'agent_swarm' as OmniMode,
      title: '🤖 Essaim d\'Agents : Audit d\'Architecture',
      prompt: 'Déploie un essaim de 4 sous-agents (Architecte, Ingénieur, Auditeur Sécurité, Synthétiseur) pour concevoir un système de distribution de microservices résilient aux attaques DDoS et pannes réseau.',
    },
    {
      mode: 'code_sandbox' as OmniMode,
      title: '💻 Auto-Débogage & Optimisation Algorithmique',
      prompt: 'Génère un algorithme haute performance en Python/PowerShell pour surveiller l\'utilisation des ressources Windows, détecter les fuites de mémoire et tuer proprement les processus zombies avec gestion des exceptions.',
    },
    {
      mode: 'vision_analysis' as OmniMode,
      title: '👁️ Inspection Visuelle & Détection d\'Anomalies',
      prompt: 'Inspecte minutieusement l\'image fournie, identifie tous les composants structurels, repère les anomalies potentielles et propose une synthèse d\'amélioration.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100">
        {/* Holographic Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 to-purple-950 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)]">
              <Brain className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] font-bold text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300">
                  JARVIS // MATRICE COGNITIVE FRONTIER GPT-6
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 font-mono tracking-wider font-semibold">
                  OMNI-REASONING V6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Chaîne de pensée délibérée · Vision sensorielle · Essaim d'agents · Bac à sable exécutable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-200 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-cyan-500/20 bg-black/40 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveMode('deep_reasoning')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeMode === 'deep_reasoning'
                ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>PENSÉE PROFONDE (DEEP THOUGHT)</span>
          </button>

          <button
            onClick={() => setActiveMode('agent_swarm')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeMode === 'agent_swarm'
                ? 'bg-purple-950/70 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>ESSAIM D'AGENTS (SWARM)</span>
          </button>

          <button
            onClick={() => setActiveMode('vision_analysis')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeMode === 'vision_analysis'
                ? 'bg-sky-950/70 border border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>VISION OMNIMODALE & ÉCRAN</span>
          </button>

          <button
            onClick={() => setActiveMode('code_sandbox')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap ${
              activeMode === 'code_sandbox'
                ? 'bg-emerald-950/70 border border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>BAC À SABLE CODE & DÉBOGAGE</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          {/* Controls Bar: Thinking Level, Search Grounding, Screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-cyan-500/25">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">DÉLIBÉRATION :</span>
                <select
                  value={thinkingLevel}
                  onChange={(e) => setThinkingLevel(e.target.value as any)}
                  className="bg-black/60 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-xs text-cyan-300 outline-none font-mono"
                >
                  <option value="HIGH">MAXIMALE (Budget étendu · GPT-6)</option>
                  <option value="MEDIUM">STANDARD (Équilibrée)</option>
                  <option value="LOW">RAPIDE (Faible latence)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                <span className="flex items-center gap-1 font-['Rajdhani'] font-medium">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  RECHERCHE WEB GOOGLE ACTIVE
                </span>
              </label>
            </div>

            {/* Multimodal image inputs */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Importer une image ou document pour analyse"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>CHARGER IMAGE</span>
              </button>

              <button
                onClick={handleCapturePcScreen}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-300 text-xs text-cyan-200 flex items-center gap-1.5 transition-colors"
                title="Prendre une capture de votre écran PC Windows"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-300" />
                <span>CAPTURE PC</span>
              </button>

              {selectedImage && (
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-rose-400 hover:text-rose-200"
                  title="Retirer l'image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Image Preview if selected */}
          {selectedImage && (
            <div className="p-3 rounded-xl bg-black/60 border border-sky-500/30 flex items-center gap-4">
              <img
                src={selectedImage.preview}
                alt="Image sélectionnée pour analyse"
                className="w-24 h-24 object-cover rounded-lg border border-sky-400/50"
              />
              <div>
                <span className="text-xs font-mono text-sky-400 block font-bold">
                  IMAGE ENTRÉE ANALYSEUR VISION GPT-6 ACTIVE
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Le cortex visuel inspectera les pixels, l'ergonomie, les schémas et les textes OCR de cette capture.
                </p>
              </div>
            </div>
          )}

          {/* Prompt Input Form */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-['Orbitron'] text-xs text-cyan-300 tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                DÉFI COGNITIF / INSTRUCTION DE DÉLIBÉRATION :
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeMode === 'deep_reasoning' && 'Raisonnement formel & Chaîne de pensée'}
                {activeMode === 'agent_swarm' && 'Orchestration d\'essaim multi-agents'}
                {activeMode === 'vision_analysis' && 'Analyse visuelle haute résolution'}
                {activeMode === 'code_sandbox' && 'Synthèse de code & auto-débogage'}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Posez une question scientifique complexe, demandez un plan d'ingénierie, soumettez un schéma ou demandez l'exécution d'un essaim d'agents..."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 focus:border-cyan-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none resize-none font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleRunReasoning();
                  }
                }}
              />

              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  onClick={() => handleRunReasoning()}
                  disabled={isLoading || !promptInput.trim()}
                  className={`px-4 py-1.5 rounded-lg font-['Rajdhani'] font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${
                    isLoading || !promptInput.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>DÉLIBÉRATION EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-cyan-300" />
                      <span>DÉLIBÉRER AVEC GPT-6</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] text-slate-400 font-mono block mb-2">
              DÉFIS PRÉCONFIGURÉS FRONTIER :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMode(p.mode);
                    setPromptInput(p.prompt);
                    handleRunReasoning(p.prompt);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/40 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-['Rajdhani']">
                    {p.title}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {p.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-cyan-500/20">
              {/* Header result stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-cyan-500/25">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                    <Check className="w-4 h-4" />
                    <span>INDICE DE CONFIANCE : {Math.round(result.confidenceScore * 100)}%</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">AGENTS :</span>
                    {result.agentsInvolved.map((agent, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setExpandedThoughts(!expandedThoughts)}
                  className="text-xs text-cyan-400 hover:text-cyan-200 font-mono flex items-center gap-1"
                >
                  <span>CHAÎNE DE PENSÉE ({result.thoughtProcess.length} ÉTAPES)</span>
                  {expandedThoughts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Accordion: Detailed Thought Process */}
              {expandedThoughts && result.thoughtProcess && result.thoughtProcess.length > 0 && (
                <div className="p-4 rounded-xl bg-black/70 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-['Orbitron'] font-semibold text-purple-300">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>TRACÉ DE DÉLIBÉRATION NEURALE & VÉRIFICATION FORMELLE</span>
                  </div>

                  <div className="space-y-2">
                    {result.thoughtProcess.map((step) => (
                      <div
                        key={step.step}
                        className="p-2.5 rounded-lg bg-slate-900/60 border border-purple-500/20 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                          <span className="w-4 h-4 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-[10px]">
                            {step.step}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line pl-6">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Answer Card */}
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-['Orbitron'] font-semibold text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>SYNTHÈSE FINALE POUR MONSIEUR</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.finalAnswer);
                      setCopiedIndex(999);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>COPIER RÉPONSE</span>
                  </button>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {result.finalAnswer}
                </div>
              </div>

              {/* Code Snippets Section (if any) */}
              {result.codeSnippets && result.codeSnippets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-['Orbitron'] font-semibold text-emerald-300">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>SCRIPTS & BLOCS DE CODE FORMELLEMENT VALIDÉS</span>
                  </div>

                  {result.codeSnippets.map((snippet, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-black/80 border border-emerald-500/30 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-emerald-500/20 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-300 font-bold">{snippet.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-slate-400 uppercase">
                            {snippet.language}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(snippet.code, idx)}
                            className="p-1 text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copier</span>
                          </button>

                          <button
                            onClick={() => handleExecuteLocalCode(snippet)}
                            className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 text-[11px] font-bold"
                            title="Exécuter sur votre machine via le pont Windows"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Exécuter sur PC</span>
                          </button>
                        </div>
                      </div>

                      <pre className="p-3 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-60 custom-scrollbar">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Actions */}
              {result.suggestedActions && result.suggestedActions.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 font-mono block mb-2">
                    ACTIONS PROACTIVES RECOMMANDÉES :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPromptInput(act.prompt);
                          handleRunReasoning(act.prompt);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-['Rajdhani'] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/20 bg-slate-950/80 text-[11px] text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Moteur Frontier GPT-6 actif : Délibération multi-agents, vision et vérification rigoureuse.</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onExecutePrompt('Active le mode raisonnement profond GPT-6 pour auditer mon projet');
            }}
            className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            Lancer par la voix avec JARVIS
          </button>
        </div>
      </div>
    </div>
  );
};

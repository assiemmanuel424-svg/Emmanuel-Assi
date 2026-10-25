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
  Globe,
  Palette,
  FileText,
  Users,
  Download,
  Share2,
  ExternalLink,
  BookOpen,
  Volume2,
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

export type OmniMode =
  | 'deep_reasoning'
  | 'agent_swarm'
  | 'code_sandbox'
  | 'vision_analysis'
  | 'deep_research'
  | 'canvas_studio'
  | 'image_studio'
  | 'custom_gpt';

interface Persona {
  id: string;
  name: string;
  role: string;
  icon: string;
  tagline: string;
  defaultPrompt: string;
}

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
  const [selectedPersona, setSelectedPersona] = useState<string>('architect');

  // Canvas studio live editable state
  const [canvasDraft, setCanvasDraft] = useState<string>('');
  const [canvasTitle, setCanvasTitle] = useState<string>('Document Sans Titre');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const personas: Persona[] = [
    {
      id: 'architect',
      name: 'Architecte Logiciel Senior',
      role: 'Staff Engineer & System Architect',
      icon: 'Cpu',
      tagline: 'Conception de systèmes distribués ultra-résilients, microservices, patterns et cloud.',
      defaultPrompt: 'Conçois une architecture distribuée résiliente avec tolérance aux pannes, CQRS et event sourcing pour gérer 500k req/s.',
    },
    {
      id: 'physicist',
      name: 'Physicien & Polymathique',
      role: 'Docteur en Physique & Mathématiques',
      icon: 'Brain',
      tagline: 'Rigueur absolue en mécanique quantique, relativité, calcul tensoriel et simulations.',
      defaultPrompt: 'Démontre rigoureusement l\'équation de Schrödinger dépendante du temps à partir des postulats fondamentaux de la mécanique quantique.',
    },
    {
      id: 'strategist',
      name: 'Stratège Financier & CFO',
      role: 'Directeur Stratégie & Modélisation',
      icon: 'Globe',
      tagline: 'Modélisation DCF, analyse de marges SaaS, valorisation, fusions-acquisitions et levées.',
      defaultPrompt: 'Construis un modèle d\'analyse financière comparative (EBITDA, CAC, LTV, Cash Runway) pour une entreprise technologique en phase de scale.',
    },
    {
      id: 'legal',
      name: 'Conseiller Juridique & Conformité',
      role: 'Juriste International des Affaires & Tech',
      icon: 'BookOpen',
      tagline: 'Propriété intellectuelle, brevets technologiques, contrats bilatéraux et conformité IA.',
      defaultPrompt: 'Rédige une clause de cession exclusive de propriété intellectuelle avec garantie d\'éviction et conformité au règlement européen sur l\'IA.',
    },
    {
      id: 'orator',
      name: 'Plume Exécutive & Rhéteur',
      role: 'Speechwriter & Maître de l\'Éloquence',
      icon: 'FileText',
      tagline: 'Discours percutants, tribunes d\'opinion de haut vol et rhétorique persuasive.',
      defaultPrompt: 'Rédige un discours d\'ouverture mémorable de 3 minutes sur l\'alliance symbiotique entre l\'intelligence humaine et l\'AGI.',
    },
    {
      id: 'cyber',
      name: 'Auditeur Cybersécurité Red Team',
      role: 'Expert Sécurité Offensive & Reverse',
      icon: 'ShieldAlert',
      tagline: 'Audit de vulnérabilités Zero-Day, analyse de binaires, cryptographie et durcissement OS.',
      defaultPrompt: 'Audite les vecteurs d\'attaque potentiels sur une application web moderne et génère le script PowerShell de durcissement défensif correspondant.',
    },
  ];

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

  const handleRunReasoning = async (overridePrompt?: string, modeOverride?: OmniMode) => {
    const finalPrompt = overridePrompt || promptInput;
    const finalMode = modeOverride || activeMode;
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
          mode: finalMode,
          persona: selectedPersona,
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

      // Auto-populate canvas draft if returned
      if (data.result.canvasData) {
        setCanvasDraft(data.result.canvasData.content || data.result.finalAnswer);
        setCanvasTitle(data.result.canvasData.title || 'Document Canvas GPT-6');
      } else {
        setCanvasDraft(data.result.finalAnswer);
      }
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
      onExecutePcAction({
        type: 'companion',
        title: snippet.title || 'Script GPT-6',
        description: 'Exécution du script validé par GPT-6',
        params: { action: 'run_cmd', cmd: snippet.code },
      });
    }
  };

  const downloadCanvasFile = (format: 'md' | 'txt' | 'html') => {
    let content = canvasDraft;
    let mime = 'text/plain;charset=utf-8';
    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${canvasTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;line-height:1.6;color:#111;padding:0 20px;}</style></head><body><h1>${canvasTitle}</h1><div><pre>${canvasDraft.replace(/</g, '&lt;')}</pre></div></body></html>`;
      mime = 'text/html;charset=utf-8';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSvgFile = () => {
    if (!result?.visualAsset?.svgContent) return;
    const blob = new Blob([result.visualAsset.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.visualAsset.title || 'gpt6_visual').toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presets = [
    {
      mode: 'deep_reasoning' as OmniMode,
      title: '🔬 Démonstration Quantique & Réfutation',
      prompt: "Fournis une analyse formelle de la décohérence quantique versus l'interprétation des mondes multiples, avec calculs de matrice de densité et chaîne de déduction pas-à-pas sans simplification.",
    },
    {
      mode: 'deep_research' as OmniMode,
      title: '🌐 Deep Research : AGI & Marché Mondial',
      prompt: "Effectue une recherche approfondie et rédige un rapport complet avec citations sur l'état de l'art des modèles de raisonnement o1/o3/GPT-6, leur consommation énergétique et les projections pour 2026-2027.",
    },
    {
      mode: 'canvas_studio' as OmniMode,
      title: '📄 Canvas : Plan Architectural d\'un SaaS',
      prompt: "Rédige dans Canvas le cahier des charges complet d'une plateforme SaaS avec schéma d'API REST, modèle de base de données PostgreSQL et spécifications de sécurité.",
    },
    {
      mode: 'image_studio' as OmniMode,
      title: '🎨 DALL-E : Schéma Vectoriel Réacteur Arc',
      prompt: "Génère un schéma vectoriel SVG interactif haute précision représentant le Cœur du Réacteur Arc Stark, avec anneaux de confinement magnétique et bobines toroïdales.",
    },
    {
      mode: 'agent_swarm' as OmniMode,
      title: '🤖 Essaim d\'Agents : Audit Résilience DDoS',
      prompt: "Déploie un essaim de 4 sous-agents (Architecte, Ingénieur, Auditeur Sécurité, Synthétiseur) pour concevoir un système de distribution de microservices résilient aux attaques DDoS et pannes réseau.",
    },
    {
      mode: 'code_sandbox' as OmniMode,
      title: '💻 Bac à Sable : Moniteur Processus Windows',
      prompt: "Génère un algorithme haute performance en Python/PowerShell pour surveiller l'utilisation des ressources Windows, détecter les fuites de mémoire et tuer proprement les processus zombies avec gestion des exceptions.",
    },
    {
      mode: 'vision_analysis' as OmniMode,
      title: '👁️ Inspection Visuelle & Détection d\'Anomalies',
      prompt: "Inspecte minutieusement l'image fournie, identifie tous les composants structurels, repère les anomalies potentielles et propose une synthèse d'amélioration.",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100">
        {/* Holographic Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 via-purple-950 to-indigo-950 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)]">
              <Brain className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] font-bold text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300">
                  JARVIS // MATRICE FRONTIER GPT-6 TOUTES FONCTIONNALITÉS
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono tracking-wider font-semibold">
                  SUITE COMPLÈTE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Pensée délibérée o1/o3 · Essaim d'agents · Bac à sable code · Vision omnimodale · Deep Research · Canvas · DALL-E Studio · Personas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (All 8 Features) */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-cyan-500/20 bg-black/50 overflow-x-auto flex-shrink-0 custom-scrollbar">
          <button
            onClick={() => setActiveMode('deep_reasoning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'deep_reasoning'
                ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>PENSÉE PROFONDE (o1/o3)</span>
          </button>

          <button
            onClick={() => setActiveMode('deep_research')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'deep_research'
                ? 'bg-blue-950/80 border border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>DEEP RESEARCH</span>
          </button>

          <button
            onClick={() => setActiveMode('canvas_studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'canvas_studio'
                ? 'bg-indigo-950/80 border border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>CANVAS STUDIO</span>
          </button>

          <button
            onClick={() => setActiveMode('image_studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'image_studio'
                ? 'bg-fuchsia-950/80 border border-fuchsia-400 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>STUDIO DALL-E & SCHÉMAS</span>
          </button>

          <button
            onClick={() => setActiveMode('agent_swarm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'agent_swarm'
                ? 'bg-purple-950/80 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>ESSAIM D'AGENTS (SWARM)</span>
          </button>

          <button
            onClick={() => setActiveMode('code_sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'code_sandbox'
                ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>BAC À SABLE CODE (INTERPRETER)</span>
          </button>

          <button
            onClick={() => setActiveMode('vision_analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'vision_analysis'
                ? 'bg-sky-950/80 border border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>VISION OMNIMODALE & ÉCRAN</span>
          </button>

          <button
            onClick={() => setActiveMode('custom_gpt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeMode === 'custom_gpt'
                ? 'bg-amber-950/80 border border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>EXPERTS & PERSONAS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* Controls Bar: Thinking Level, Search Grounding, Screenshot, Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/25">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">PENSÉE ÉTENDUE :</span>
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

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="accent-cyan-400 rounded cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Importer une image ou capture pour analyse GPT-6"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>CHARGER IMAGE</span>
              </button>

              <button
                onClick={handleCapturePcScreen}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-300 text-xs text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Prendre une capture de votre écran PC Windows"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-300" />
                <span>CAPTURE PC</span>
              </button>

              {selectedImage && (
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                  title="Retirer l'image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Subview: Personas Selector (when in custom_gpt mode) */}
          {activeMode === 'custom_gpt' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2.5">
              <span className="text-[11px] font-['Orbitron'] text-amber-300 font-bold uppercase tracking-wider block">
                SÉLECTIONNEZ LE PERSONA EXPERT GPT-6 :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {personas.map((pers) => (
                  <button
                    key={pers.id}
                    onClick={() => {
                      setSelectedPersona(pers.id);
                      setPromptInput(pers.defaultPrompt);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPersona === pers.id
                        ? 'bg-amber-950/70 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-black/50 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="font-['Rajdhani'] font-bold text-xs text-amber-300">
                      {pers.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {pers.role}
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-snug">
                      {pers.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Preview if selected */}
          {selectedImage && (
            <div className="p-3 rounded-xl bg-black/60 border border-sky-500/30 flex items-center gap-4">
              <img
                src={selectedImage.preview}
                alt="Image sélectionnée pour analyse"
                className="w-20 h-20 object-cover rounded-lg border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
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
                {activeMode === 'deep_research' && 'Rapport d\'analyse approfondi & citations web'}
                {activeMode === 'canvas_studio' && 'Éditeur de documents et de code bidirectionnel'}
                {activeMode === 'image_studio' && 'Génération visuelle & schémas vectoriels SVG'}
                {activeMode === 'agent_swarm' && 'Orchestration d\'essaim multi-agents'}
                {activeMode === 'vision_analysis' && 'Analyse visuelle haute résolution'}
                {activeMode === 'code_sandbox' && 'Synthèse de code & auto-débogage'}
                {activeMode === 'custom_gpt' && `Expert actif : ${selectedPersona.toUpperCase()}`}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Posez une question scientifique complexe, demandez un rapport approfondi, générez un schéma DALL-E, ou rédigez un document Canvas..."
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
                  className={`px-4 py-1.5 rounded-lg font-['Rajdhani'] font-bold text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
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
                      <span>EXÉCUTER AVEC GPT-6</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMode(p.mode);
                    setPromptInput(p.prompt);
                    handleRunReasoning(p.prompt, p.mode);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/40 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
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

          {/* Canvas Studio Editor (when canvas mode is active or canvasData present) */}
          {(activeMode === 'canvas_studio' || result?.canvasData) && (
            <div className="p-4 rounded-xl bg-black/80 border border-indigo-500/40 space-y-3 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <input
                    type="text"
                    value={canvasTitle}
                    onChange={(e) => setCanvasTitle(e.target.value)}
                    className="bg-transparent text-sm font-['Orbitron'] font-bold text-indigo-200 border-b border-transparent focus:border-indigo-400 outline-none px-1"
                    title="Cliquer pour renommer le document Canvas"
                  />
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-mono">
                    CANVAS INTERACTIF
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {canvasDraft.length} car. · {canvasDraft.trim() ? canvasDraft.trim().split(/\s+/).length : 0} mots
                  </span>
                  <button
                    onClick={() => downloadCanvasFile('md')}
                    className="px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-1 cursor-pointer"
                    title="Télécharger en Markdown"
                  >
                    <Download className="w-3 h-3" />
                    <span>MD</span>
                  </button>
                  <button
                    onClick={() => downloadCanvasFile('html')}
                    className="px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-1 cursor-pointer"
                    title="Télécharger en HTML"
                  >
                    <Download className="w-3 h-3" />
                    <span>HTML</span>
                  </button>
                </div>
              </div>

              <textarea
                value={canvasDraft}
                onChange={(e) => setCanvasDraft(e.target.value)}
                placeholder="Le contenu du document ou code Canvas s'affichera ici et peut être édité librement..."
                rows={10}
                className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/20 focus:border-indigo-400 text-xs font-mono text-slate-200 outline-none resize-y leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Éditeur en direct bi-directionnel inspiré de ChatGPT Canvas.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(canvasDraft);
                      alert('Contenu Canvas copié !');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier le texte</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DALL-E & Visual Studio Graphic Result */}
          {result?.visualAsset && (
            <div className="p-4 rounded-xl bg-black/80 border border-fuchsia-500/40 space-y-3 shadow-[0_0_25px_rgba(217,70,239,0.2)]">
              <div className="flex items-center justify-between border-b border-fuchsia-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-fuchsia-400" />
                  <span className="font-['Orbitron'] text-xs font-bold text-fuchsia-200">
                    VISUEL VECTORIEL DALL-E // {result.visualAsset.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-fuchsia-950 border border-fuchsia-500/40 text-fuchsia-300 font-mono">
                    {result.visualAsset.style}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSvgFile}
                    className="px-2.5 py-1 rounded bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/40 text-fuchsia-200 text-xs flex items-center gap-1 cursor-pointer"
                    title="Télécharger le fichier SVG"
                  >
                    <Download className="w-3 h-3" />
                    <span>Télécharger SVG</span>
                  </button>
                </div>
              </div>

              {result.visualAsset.svgContent ? (
                <div
                  className="w-full flex items-center justify-center p-4 bg-slate-950/90 rounded-xl border border-fuchsia-500/20 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: result.visualAsset.svgContent }}
                />
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Prompt visuel : {result.visualAsset.prompt}
                </p>
              )}
            </div>
          )}

          {/* Deep Research Report Card */}
          {result?.researchReport && (
            <div className="p-4 rounded-xl bg-black/80 border border-blue-500/40 space-y-3 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
              <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="font-['Orbitron'] text-xs font-bold text-blue-200">
                    DEEP RESEARCH // {result.researchReport.topic}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300 font-mono">
                  RAPPORT APPROFONDI
                </span>
              </div>

              {result.researchReport.keyFindings && result.researchReport.keyFindings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-blue-300 font-bold block">
                    POINTS CLÉS DÉTERMINANTS :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.researchReport.keyFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-slate-200 flex items-start gap-2"
                      >
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.researchReport.sources && result.researchReport.sources.length > 0 && (
                <div className="pt-2 border-t border-blue-500/20">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">
                    SOURCES OFFICIELLES & CITATIONS WEB :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.researchReport.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
                  className="text-xs text-cyan-400 hover:text-cyan-200 font-mono flex items-center gap-1 cursor-pointer"
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
                    <span>TRACÉ DE DÉLIBÉRATION NEURALE & VÉRIFICATION FORMELLE (Chain-of-Thought)</span>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.finalAnswer);
                        setCopiedIndex(999);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>COPIER RÉPONSE</span>
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {result.finalAnswer}
                </div>
              </div>

              {/* Code Snippets Section (Code Interpreter) */}
              {result.codeSnippets && result.codeSnippets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-['Orbitron'] font-semibold text-emerald-300">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>SCRIPTS & CODE INTERPRETER VALIDÉS</span>
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
                            className="p-1 text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copier</span>
                          </button>

                          <button
                            onClick={() => handleExecuteLocalCode(snippet)}
                            className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
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
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-['Rajdhani'] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <span>Matrice GPT-6 active : Pensée o1/o3, Canvas, Deep Research, DALL-E, Code Sandbox, Vision et Essaim.</span>
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

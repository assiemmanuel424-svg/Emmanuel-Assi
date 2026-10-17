import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Play,
  FileCode,
  Globe,
  Download,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { marked } from 'marked';
import { Message, WindowsAction, CompanionStatus } from '../types/jarvis';

interface ChatWindowProps {
  messages: Message[];
  isThinking: boolean;
  onReplayAudio: (text: string) => void;
  onSendPresetMessage: (text: string) => void;
  companionStatus: CompanionStatus;
  onExecuteLocalAction: (action: WindowsAction) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isThinking,
  onReplayAudio,
  onSendPresetMessage,
  companionStatus,
  onExecuteLocalAction,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<WindowsAction | null>(null);

  // Auto-scroll to bottom on new messages or thinking state
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (action: WindowsAction) => {
    if (action.type === 'protocol' && action.target) {
      // Direct browser-supported protocol launch
      try {
        window.location.href = action.target;
      } catch (e) {
        console.warn('Erreur ouverture protocole:', e);
      }
    } else if (action.type === 'web' && action.target) {
      window.open(action.target, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'companion' || action.type === 'workspace') {
      onExecuteLocalAction(action);
    } else if (action.type === 'powershell' || action.type === 'python') {
      if (action.requiresConfirmation) {
        setConfirmAction(action);
      } else {
        onExecuteLocalAction(action);
      }
    }
  };

  const downloadScriptFile = (script: string, type: 'powershell' | 'python', title: string) => {
    const ext = type === 'powershell' ? '.ps1' : '.py';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}${ext}`;
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (content: string) => {
    try {
      const html = marked.parse(content, { breaks: true, gfm: true }) as string;
      return { __html: html };
    } catch {
      return { __html: content };
    }
  };

  const starterPrompts = [
    {
      title: '🧠 Graver dans la Mémoire',
      text: "Retiens que je développe en TypeScript et que je vis à Paris",
    },
    {
      title: '👁️ Cortex Oculaire',
      text: "Regarde mon écran et aide-moi à analyser la situation",
    },
    {
      title: '🎵 Smart Musique',
      text: 'Mets de la musique pour travailler (Mode Deep Focus)',
    },
    {
      title: '⚡ Routine Mode Dev',
      text: 'Active le mode dev (ouvre VS Code, le Terminal et GitHub)',
    },
  ];

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Scrollable messages container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
            <div className="w-14 h-14 rounded-full border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center mb-4 glow-cyan-sm">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <h2 className="font-['Orbitron'] font-semibold text-lg text-cyan-100 mb-1">
              J.A.R.V.I.S. À VOTRE SERVICE
            </h2>
            <p className="font-['Rajdhani'] text-sm text-slate-400 mb-6">
              Je suis prêt, Monsieur. Vous pouvez me parler au micro ou m'écrire pour vos cours, votre code, vos projets et l'optimisation de votre ordinateur.
            </p>

            {/* Quick Suggestions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPresetMessage(prompt.text)}
                  className="p-3 rounded-lg border border-cyan-500/20 bg-slate-900/40 hover:bg-cyan-950/30 hover:border-cyan-400/50 transition-all text-left group"
                >
                  <div className="font-['Rajdhani'] font-semibold text-xs text-cyan-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{prompt.title}</span>
                    <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {prompt.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender Identifier */}
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="font-['Orbitron'] text-[10px] tracking-wider text-slate-400">
                {msg.role === 'user' ? 'VOUS' : 'J.A.R.V.I.S.'}
              </span>
              <span className="font-mono text-[9px] text-slate-600">
                {msg.timestamp}
              </span>
            </div>

            {/* Message Bubble */}
            <div
              className={`relative max-w-3xl rounded-xl p-4 transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-950/70 to-slate-900/90 border border-cyan-500/30 text-cyan-50 ml-6'
                  : 'bg-[#090e1f]/90 border border-cyan-500/20 text-slate-100 mr-6 shadow-lg'
              }`}
            >
              {/* Message Content rendered with Markdown */}
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:font-['Rajdhani'] prose-headings:text-cyan-200 prose-pre:bg-black/60 prose-pre:border prose-pre:border-cyan-500/20 prose-pre:text-cyan-200 prose-code:text-cyan-300 prose-a:text-cyan-400 hover:prose-a:underline"
                dangerouslySetInnerHTML={renderMarkdown(msg.content)}
              />

              {/* Verified Web Grounding Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-500/15">
                  <div className="flex items-center gap-1.5 text-[11px] font-['Rajdhani'] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                    <Globe className="w-3 h-3" />
                    <span>Sources Web vérifiées ({msg.sources.length}) :</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-[11px] text-emerald-300 transition-colors"
                        title={src.title}
                      >
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Cards (Windows control, Protocols, Scripts) */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-500/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-['Rajdhani'] font-semibold text-cyan-400 uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Actions & Contrôles Système suggérés :</span>
                  </div>

                  {msg.actions.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      className="p-3 rounded-lg border border-cyan-500/30 bg-black/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-['Rajdhani'] font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                            {act.type === 'protocol' && <Play className="w-3 h-3 text-cyan-400" />}
                            {act.type === 'web' && <Globe className="w-3 h-3 text-emerald-400" />}
                            {(act.type === 'powershell' || act.type === 'python') && (
                              <FileCode className="w-3 h-3 text-amber-400" />
                            )}
                            <span>{act.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {act.description}
                          </p>
                        </div>

                        {/* Direct Button for Protocols / Web */}
                        {act.type === 'protocol' && (
                          <button
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Lancer</span>
                          </button>
                        )}
                        {act.type === 'web' && (
                          <button
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ouvrir</span>
                          </button>
                        )}
                        {act.type === 'companion' && (
                          <button
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Exécuter sur le PC</span>
                          </button>
                        )}
                        {act.type === 'workspace' && (
                          <button
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Ouvrir dans JARVIS</span>
                          </button>
                        )}
                      </div>

                      {/* Script View & Actions */}
                      {(act.type === 'powershell' || act.type === 'python') && act.target && (
                        <div>
                          <div className="relative mt-1">
                            <pre className="p-2.5 rounded bg-black/70 border border-slate-700/60 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-36">
                              <code>{act.target}</code>
                            </pre>
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <button
                                onClick={() => handleCopyText(`script-${actIdx}`, act.target!)}
                                className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                                title="Copier le script"
                              >
                                {copiedId === `script-${actIdx}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => downloadScriptFile(act.target!, act.type as any, act.title)}
                                className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                                title="Télécharger le fichier de script"
                              >
                                <Download className="w-3 h-3 text-cyan-400" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400">
                              {companionStatus.connected
                                ? 'Pont local connecté'
                                : 'Compagnon Windows requis pour exécution automatique'}
                            </span>
                            {companionStatus.connected && (
                              <button
                                onClick={() => handleActionClick(act)}
                                className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1"
                              >
                                <Terminal className="w-3 h-3" />
                                <span>Exécuter sur le PC</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bubble Footer Utilities (Replay Voice & Copy) */}
              <div className="mt-2.5 pt-2 flex items-center justify-end gap-2 text-slate-400 text-xs">
                {msg.role === 'jarvis' && (
                  <button
                    onClick={() => onReplayAudio(msg.content)}
                    className="p-1 rounded hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors"
                    title="Écouter la réponse"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleCopyText(msg.id, msg.content)}
                  className="p-1 rounded hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors"
                  title="Copier le texte"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Thinking State Animation */}
        {isThinking && (
          <div className="flex items-start gap-2">
            <div className="p-3 rounded-xl bg-[#090e1f]/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <span className="font-['Orbitron'] text-xs font-medium tracking-wide">
                  TRAITEMENT EN COURS...
                </span>
                <span className="font-['Rajdhani'] text-[11px] text-slate-400">
                  JARVIS consulte le réseau et synthétise votre demande
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Sensitive Windows Actions */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0a0f1e] border border-amber-500/40 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-['Orbitron'] font-bold text-sm tracking-wide">
                CONFIRMATION D'ACTION SYSTÈME
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vous êtes sur le point d'autoriser l'exécution de l'action suivante sur votre machine Windows :
            </p>
            <div className="p-3 bg-black/60 rounded border border-slate-700/60 font-mono text-xs text-amber-300">
              <p className="font-semibold text-slate-200">{confirmAction.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">{confirmAction.description}</p>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Conformément au protocole de sécurité JARVIS, aucune action sensible n'est exécutée sans votre accord explicite.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded bg-slate-800/60 hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onExecuteLocalAction(confirmAction);
                  setConfirmAction(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                Confirmer et exécuter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

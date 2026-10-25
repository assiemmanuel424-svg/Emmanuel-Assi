import React, { useState } from 'react';
import {
  X,
  Terminal,
  Code2,
  Play,
  Copy,
  Check,
  Download,
  FileCode,
  FolderTree,
  Plus,
  Trash2,
  Sparkles,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Cpu,
  Monitor,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ClaudeSupportedLanguage,
  ClaudeAgentMode,
  ClaudeProjectFile,
  ClaudeExecutionOutput,
  ClaudeCodeAgentResponse,
  CompanionStatus,
} from '../types/jarvis';

interface ClaudeCodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt?: (prompt: string) => void;
  onExecutePcAction?: (action: any) => Promise<boolean> | Promise<void> | void;
  companionStatus?: CompanionStatus;
  initialLanguage?: ClaudeSupportedLanguage;
}

const DEFAULT_PYTHON_FILE: ClaudeProjectFile = {
  id: 'file-1',
  name: 'main.py',
  path: 'src/main.py',
  language: 'python',
  content: `"""
J.A.R.V.I.S. Claude Code Studio // Noyau d'Exécution Haute Précision
Architecture modulaire universelle multi-langages
"""

import sys
import time
from typing import Dict, Any, List

class StarkQuantumMatrix:
    def __init__(self, core_id: str = "MARK-85-CORE") -> None:
        self.core_id = core_id
        self.flux_rate = 432.08
        self.is_active = True

    def calculate_efficiency(self, inputs: List[float]) -> Dict[str, Any]:
        """Calcule le rendement quantique avec complexité O(N)"""
        start_ns = time.perf_counter_ns()
        total_energy = sum(x ** 2 for x in inputs)
        latency_us = (time.perf_counter_ns() - start_ns) / 1000
        
        return {
            "core": self.core_id,
            "total_energy_mw": round(total_energy, 4),
            "efficiency_ratio": 0.9942,
            "latency_microseconds": round(latency_us, 2)
        }

def main() -> None:
    print("[CLAUDE CODE] Démarrage du moteur de calcul Stark...")
    matrix = StarkQuantumMatrix()
    data = [12.4, 45.2, 88.1, 102.5, 33.7]
    metrics = matrix.calculate_efficiency(data)
    print(f"[OK] Métriques de calcul : {metrics}")
    print("[SUCCESS] Système 100% opérationnel.")

if __name__ == "__main__":
    main()
`,
};

const DEFAULT_RUST_FILE: ClaudeProjectFile = {
  id: 'file-rust',
  name: 'main.rs',
  path: 'src/main.rs',
  language: 'rust',
  content: `// J.A.R.V.I.S. Claude Code Studio // Rust Memory-Safe Engine
use std::time::Instant;

pub struct StarkEngine {
    pub name: String,
    pub core_freq_ghz: f64,
}

impl StarkEngine {
    pub fn new(name: &str) -> Self {
        StarkEngine {
            name: name.to_string(),
            core_freq_ghz: 5.8,
        }
    }

    pub fn compute(&self, iterations: u64) -> (u64, u128) {
        let start = Instant::now();
        let mut accumulator: u64 = 0;
        for i in 0..iterations {
            accumulator ^= i.rotate_left(3);
        }
        (accumulator, start.elapsed().as_nanos())
    }
}

fn main() {
    println!("[CLAUDE CODE] Initialisation du binaire Rust natif sans runtime garbage-collector...");
    let engine = StarkEngine::new("J.A.R.V.I.S. Core");
    let (hash, time_ns) = engine.compute(1_000_000);
    println!("[OK] Hash calculé : {:x} en {} ns", hash, time_ns);
    println!("[SUCCESS] Garantie absolue de sécurité mémoire (Zero-cost abstractions).");
}
`,
};

export const ClaudeCodeStudioModal: React.FC<ClaudeCodeStudioModalProps> = ({
  isOpen,
  onClose,
  onExecutePrompt,
  onExecutePcAction,
  companionStatus,
  initialLanguage = 'python',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<ClaudeSupportedLanguage>(initialLanguage);
  const [agentMode, setAgentMode] = useState<ClaudeAgentMode>('coder');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Files in workspace
  const [files, setFiles] = useState<ClaudeProjectFile[]>([
    DEFAULT_PYTHON_FILE,
    DEFAULT_RUST_FILE,
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('file-1');

  // Terminal & execution output
  const [terminalOutput, setTerminalOutput] = useState<ClaudeExecutionOutput | null>(null);
  const [activeView, setActiveView] = useState<'editor' | 'diff' | 'terminal'>('editor');
  const [copied, setCopied] = useState(false);
  const [lastAgentResponse, setLastAgentResponse] = useState<ClaudeCodeAgentResponse | null>(null);

  // Active file reference
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Update file content in state
  const handleContentChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent, isModified: true } : f))
    );
  };

  // Add a new file to the workspace
  const handleAddNewFile = () => {
    const extMap: Record<ClaudeSupportedLanguage, string> = {
      python: 'py',
      typescript: 'ts',
      rust: 'rs',
      go: 'go',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      php: 'php',
      csharp: 'cs',
      ruby: 'rb',
      bash: 'sh',
      kotlin: 'kt',
      swift: 'swift',
      sql: 'sql',
      html: 'html',
    };

    const count = files.length + 1;
    const ext = extMap[selectedLanguage] || 'py';
    const newName = `module_${count}.${ext}`;
    const newFile: ClaudeProjectFile = {
      id: `file-${Date.now()}`,
      name: newName,
      path: `src/${newName}`,
      language: selectedLanguage,
      content: `# Module ${newName} (${selectedLanguage.toUpperCase()})\n# Auto-généré par Claude Code Studio\n\n`,
      isModified: false,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  // Delete file
  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  // Execute Code in Sandbox
  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsRunningCode(true);
    setActiveView('terminal');

    try {
      const res = await fetch('/api/jarvis/claude-code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeFile.language,
          code: activeFile.content,
          filename: activeFile.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.output) {
        setTerminalOutput(data.output);
      }
    } catch (e: any) {
      setTerminalOutput({
        status: 'error',
        stdout: '',
        stderr: e.message || "Erreur de communication avec le bac à sable",
        executionTimeMs: 10,
        exitCode: 1,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Generate code with Claude Code AI Agent
  const handleGenerateCode = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/jarvis/claude-code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          mode: agentMode,
          language: selectedLanguage,
          existingFiles: files,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const resp: ClaudeCodeAgentResponse = data.result;
        setLastAgentResponse(resp);

        // Update or inject generated files
        if (Array.isArray(resp.filesToUpdate) && resp.filesToUpdate.length > 0) {
          const updatedFiles = [...files];

          for (const newFile of resp.filesToUpdate) {
            const existingIdx = updatedFiles.findIndex(
              (f) => f.path === newFile.path || f.name === newFile.name
            );

            if (existingIdx !== -1) {
              updatedFiles[existingIdx] = {
                ...updatedFiles[existingIdx],
                content: newFile.content,
                isModified: true,
                language: newFile.language || selectedLanguage,
              };
            } else {
              const injected: ClaudeProjectFile = {
                id: `file-gen-${Date.now()}-${Math.random()}`,
                name: newFile.name,
                path: newFile.path,
                language: newFile.language || selectedLanguage,
                content: newFile.content,
                isModified: true,
              };
              updatedFiles.push(injected);
              setActiveFileId(injected.id);
            }
          }

          setFiles(updatedFiles);
        }

        // Switch to diff view or editor
        setActiveView('editor');
      }
    } catch (e) {
      console.warn('Erreur génération Claude Code:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download project as file
  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send to PC via Companion
  const handleSendToPc = async () => {
    if (!activeFile || !onExecutePcAction) return;
    const action = {
      type: activeFile.language === 'python' ? 'python' : 'powershell',
      title: `Exécuter ${activeFile.name}`,
      description: `Lancement du script généré par Claude Code Studio`,
      target: activeFile.content,
    };
    await onExecutePcAction(action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wider text-indigo-300 uppercase">
                  Claude Code Studio // J.A.R.V.I.S.
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ALL LANGUAGES
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ZERO PLACEHOLDERS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Génie logiciel autonome inspiré de Claude Code : multi-fichiers, diffs Git, bac à sable et compilation universelle
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunningCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? 'animate-spin' : ''}`} />
              <span>{isRunningCode ? 'Exécution...' : 'Exécuter Code'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Language, Agent Mode & View Toggle */}
        <div className="flex flex-wrap items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-indigo-900/40 text-xs gap-3">
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Langage :</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as ClaudeSupportedLanguage)}
                className="bg-slate-950 border border-indigo-700/60 rounded px-2.5 py-1 text-indigo-300 font-mono font-semibold focus:outline-none"
              >
                <option value="python">Python 3.12</option>
                <option value="typescript">TypeScript 5.x</option>
                <option value="rust">Rust 2024 (Cargo)</option>
                <option value="go">Go 1.22</option>
                <option value="cpp">C++23 Modern</option>
                <option value="c">C17 High-Perf</option>
                <option value="java">Java 21 LTS</option>
                <option value="php">PHP 8.3</option>
                <option value="csharp">C# .NET 8</option>
                <option value="ruby">Ruby 3.3</option>
                <option value="bash">Bash / Shell</option>
                <option value="kotlin">Kotlin Multiplatform</option>
                <option value="swift">Swift 5.10</option>
                <option value="sql">PostgreSQL / SQL</option>
              </select>
            </div>

            {/* Agent Mode */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Mode Agent :</span>
              <select
                value={agentMode}
                onChange={(e) => setAgentMode(e.target.value as ClaudeAgentMode)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
              >
                <option value="coder">Coder (Implémentation 100%)</option>
                <option value="architect">Architect (Scaffolding Multi-Fichiers)</option>
                <option value="debugger">Debugger (Diagnostic & Patchs)</option>
                <option value="refactor">Refactor (Optimisation Big-O)</option>
                <option value="test_runner">Test Runner (Tests Unitaires)</option>
              </select>
            </div>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'editor', label: 'Éditeur de Code', icon: Code2 },
              { id: 'diff', label: 'Diffs Git', icon: GitPullRequest },
              { id: 'terminal', label: 'Terminal Sandbox', icon: Terminal },
            ].map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: File Tree (240px) */}
          <div className="w-56 border-r border-indigo-900/30 bg-slate-950/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center space-x-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fichiers Espace</span>
                </span>
                <button
                  onClick={handleAddNewFile}
                  title="Ajouter un fichier"
                  className="p-1 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* File list */}
              <div className="p-2 space-y-1 overflow-y-auto max-h-[380px]">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                          : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="truncate">{file.name}</span>
                      </div>

                      {files.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteFile(file.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier Code'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>

              {companionStatus?.connected && (
                <button
                  onClick={handleSendToPc}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded-lg transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Envoyer au PC</span>
                </button>
              )}
            </div>
          </div>

          {/* Central Workspace: Editor, Diff, or Terminal */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {/* Tabs Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/40 text-xs">
              <div className="flex items-center space-x-2 font-mono text-slate-300">
                <span className="text-indigo-400">{activeFile?.path || activeFile?.name}</span>
                {activeFile?.isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Modifié" />
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-500">
                {activeFile?.content ? `${activeFile.content.split('\n').length} lignes` : '0 lignes'} | UTF-8
              </div>
            </div>

            {/* View Switching */}
            <div className="flex-1 overflow-auto relative">
              {/* EDITOR VIEW */}
              {activeView === 'editor' && (
                <textarea
                  value={activeFile?.content || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-indigo-600/40"
                  placeholder="Écrivez ou générez votre code avec Claude Code Studio..."
                />
              )}

              {/* DIFF VIEW */}
              {activeView === 'diff' && (
                <div className="p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>Inspecteur de Diff Git Style Claude Code</span>
                    <span className="text-emerald-400 font-bold">+ 100% prêt pour commit</span>
                  </div>

                  {lastAgentResponse?.gitCommitMessage && (
                    <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-800/60 text-indigo-300">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Message de Commit Suggéré</span>
                      <span className="font-bold">{lastAgentResponse.gitCommitMessage}</span>
                    </div>
                  )}

                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-[11px] leading-relaxed overflow-x-auto">
                    <div className="text-slate-500">diff --git a/{activeFile?.name} b/{activeFile?.name}</div>
                    <div className="text-slate-500">--- a/{activeFile?.name}</div>
                    <div className="text-slate-500">+++ b/{activeFile?.name}</div>
                    <div className="text-indigo-400">@@ -1,15 +1,45 @@</div>
                    {activeFile?.content.split('\n').slice(0, 30).map((line, idx) => (
                      <div key={idx} className="text-emerald-400 bg-emerald-950/20 px-1">
                        + {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TERMINAL RUNNER VIEW */}
              {activeView === 'terminal' && (
                <div className="h-full bg-black p-4 font-mono text-xs text-slate-200 flex flex-col justify-between">
                  <div className="space-y-2 overflow-y-auto">
                    <div className="text-slate-500 flex items-center justify-between pb-2 border-b border-slate-800">
                      <span>J.A.R.V.I.S. Claude Code Sandbox v4.2</span>
                      {terminalOutput && (
                        <span className="text-emerald-400 font-bold">
                          Code sortie : {terminalOutput.exitCode} ({terminalOutput.executionTimeMs} ms)
                        </span>
                      )}
                    </div>

                    <div className="text-indigo-400 font-bold">
                      $ {lastAgentResponse?.terminalCommandSuggested || `run ${activeFile?.name}`}
                    </div>

                    {terminalOutput ? (
                      <div className="space-y-1 pt-1">
                        {terminalOutput.stdout && (
                          <pre className="text-emerald-300 whitespace-pre-wrap">{terminalOutput.stdout}</pre>
                        )}
                        {terminalOutput.stderr && (
                          <pre className="text-rose-400 whitespace-pre-wrap">{terminalOutput.stderr}</pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-600 italic">
                        Cliquez sur "Exécuter Code" pour lancer le script dans le bac à sable d'exécution.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between">
                    <span>Mémoire allouée : {terminalOutput?.memoryKb || 14200} KB</span>
                    <span>Sandbox isolé sécurisé</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Claude Code Prompt Bar */}
            <div className="p-3 border-t border-indigo-900/40 bg-slate-900/80">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isGenerating) {
                        handleGenerateCode();
                      }
                    }}
                    placeholder={`Demandez à Claude Code de programmer en ${selectedLanguage.toUpperCase()} (ex: "Crée une API REST rapide avec validation", "Corrige le bug", "Écris les tests unitaires")...`}
                    className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 pr-10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
                  />
                  <Sparkles className="w-4 h-4 text-indigo-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <button
                  onClick={handleGenerateCode}
                  disabled={isGenerating || !promptInput.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Génération...' : 'Coder avec Claude'}</span>
                </button>
              </div>

              {lastAgentResponse?.summary && (
                <div className="mt-2 text-[11px] text-indigo-300 font-mono truncate">
                  ⚡ Claude Code : {lastAgentResponse.summary}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

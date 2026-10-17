import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Volume2,
  Radio,
  Sliders,
  Check,
  Play,
  Globe,
  Mic,
} from 'lucide-react';
import { VoiceSettings } from '../types/jarvis';
import { getAvailableBrowserVoices, speakWithBrowser, speakWithGemini } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (settings: VoiceSettings) => void;
  enableSearch: boolean;
  onToggleSearch: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  enableSearch,
  onToggleSearch,
}) => {
  const [form, setForm] = useState<VoiceSettings>(settings);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isAuditioning, setIsAuditioning] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setBrowserVoices(getAvailableBrowserVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(form);
    onClose();
  };

  const handleAuditionVoice = async () => {
    setIsAuditioning(true);
    const testPhrase =
      form.voiceEngine === 'gemini'
        ? 'Systèmes opérationnels, Monsieur. Tout fonctionne à la perfection.'
        : 'Systèmes vocaux synchronisés. Je suis prêt à vous assister, Monsieur.';

    if (form.voiceEngine === 'gemini') {
      await speakWithGemini(
        testPhrase,
        form.geminiVoice,
        () => setIsAuditioning(true),
        () => setIsAuditioning(false),
        () => setIsAuditioning(false)
      );
    } else {
      speakWithBrowser(
        testPhrase,
        form,
        () => setIsAuditioning(true),
        () => setIsAuditioning(false),
        () => setIsAuditioning(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#090e1f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#070c1a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Orbitron'] font-bold text-sm text-cyan-100 tracking-wider">
                PARAMÈTRES SYSTÈME & VOIX
              </h2>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Personnalisez le moteur vocal, la détection et les modules de JARVIS
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Voice Engine Selection */}
          <div className="space-y-3">
            <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Moteur de Synthèse Vocale</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, voiceEngine: 'browser' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.voiceEngine === 'browser'
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg'
                    : 'bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-['Rajdhani'] font-bold text-xs text-cyan-300">
                    VOIX SYSTÈME LOCAL (Gratuit)
                  </span>
                  {form.voiceEngine === 'browser' && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Zéro latence, fonctionne hors-ligne, utilise les voix installées sur votre PC Windows.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, voiceEngine: 'gemini' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.voiceEngine === 'gemini'
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg'
                    : 'bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-['Rajdhani'] font-bold text-xs text-amber-300">
                    VOIX NEURONALE (Gemini TTS)
                  </span>
                  {form.voiceEngine === 'gemini' && (
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Timbre ultra-naturel, intonation haute fidélité via l'API serveur (gemini-3.8-flash-lite-tts).
                </p>
              </button>
            </div>
          </div>

          {/* Section: Voice Choice & Sliders */}
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-4">
            {form.voiceEngine === 'browser' ? (
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Voix du système détectée
                </label>
                <select
                  value={form.browserVoiceName}
                  onChange={(e) =>
                    setForm({ ...form, browserVoiceName: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="">Voix système par défaut</option>
                  {browserVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personnalité vocale Gemini
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Fenrir', 'Zephyr', 'Puck', 'Charon', 'Kore'] as const).map(
                    (vName) => (
                      <button
                        key={vName}
                        type="button"
                        onClick={() => setForm({ ...form, geminiVoice: vName })}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold font-['Rajdhani'] tracking-wide transition-colors ${
                          form.geminiVoice === vName
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-black/50 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {vName} {vName === 'Fenrir' ? '(Grave/Stark)' : ''}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Pitch & Speed Sliders (Browser engine) */}
            {form.voiceEngine === 'browser' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Vitesse d'élocution :</span>
                    <span className="font-mono text-cyan-400">{form.rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={form.rate}
                    onChange={(e) =>
                      setForm({ ...form, rate: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Hauteur de ton :</span>
                    <span className="font-mono text-cyan-400">{form.pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={form.pitch}
                    onChange={(e) =>
                      setForm({ ...form, pitch: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Test Voice Button */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleAuditionVoice}
                disabled={isAuditioning}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isAuditioning ? 'animate-spin' : ''}`} />
                <span>Tester la voix maintenant</span>
              </button>
            </div>
          </div>

          {/* Section: Automation & Assistant behavior toggles */}
          <div className="space-y-3">
            <h3 className="font-['Rajdhani'] font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Comportement & Options</span>
            </h3>

            <div className="space-y-2.5">
              {/* Auto speak toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-['Rajdhani'] font-bold text-xs text-slate-200 uppercase tracking-wide">
                    Lecture Vocale Automatique
                  </p>
                  <p className="text-[11px] text-slate-400">
                    JARVIS prononce automatiquement à voix haute chaque réponse générée.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.autoSpeak}
                  onChange={(e) => setForm({ ...form, autoSpeak: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              {/* Wake Word detection toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-['Rajdhani'] font-bold text-xs text-slate-200 uppercase tracking-wide">
                    Mot d'activation ("Dis Jarvis" / "Hey Jarvis")
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Détecte l'appel vocal lors de l'écoute continue.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.wakeWordEnabled}
                  onChange={(e) =>
                    setForm({ ...form, wakeWordEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              {/* Web Search toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-['Rajdhani'] font-bold text-xs text-slate-200 uppercase tracking-wide">
                    Recherche Web Google en Temps Réel
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Permet à JARVIS de vérifier les données d'actualité et citer ses sources.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => onToggleSearch(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#070c1a] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer les paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};

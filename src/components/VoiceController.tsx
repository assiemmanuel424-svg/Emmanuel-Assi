import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Radio,
  CornerDownLeft,
  Zap,
} from 'lucide-react';
import { JarvisState, VoiceSettings } from '../types/jarvis';

interface VoiceControllerProps {
  jarvisState: JarvisState;
  voiceSettings: VoiceSettings;
  onSendMessage: (text: string) => void;
  onStateChange: (state: JarvisState) => void;
  onStopSpeech: () => void;
  isAudioPlaying: boolean;
  onSoundLevelUpdate: (level: number) => void;
  onUpdateVoiceSpeed?: (speed: number) => void;
  minimalFloating?: boolean;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  jarvisState,
  voiceSettings,
  onSendMessage,
  onStateChange,
  onStopSpeech,
  isAudioPlaying,
  onSoundLevelUpdate,
  onUpdateVoiceSpeed,
  minimalFloating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const latestSpokenRef = useRef('');
  const silenceTimerRef = useRef<any>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        latestSpokenRef.current = '';
        onStateChange('listening');
        startAudioMeter();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          latestSpokenRef.current = currentText;
          setInterimTranscript(currentText);

          // Fast auto-send on silence (450ms pause)
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (latestSpokenRef.current.trim().length > 2) {
              const textToSend = latestSpokenRef.current.trim();
              latestSpokenRef.current = '';
              setInterimTranscript('');
              stopListening();
              onSendMessage(textToSend);
            }
          }, 450);
        }

        if (final.trim()) {
          const cleanText = final.trim();
          clearTimeout(silenceTimerRef.current);
          latestSpokenRef.current = '';
          setInterimTranscript('');
          stopListening();
          onSendMessage(cleanText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          clearTimeout(silenceTimerRef.current);
          setIsListening(false);
          if (jarvisState === 'listening') {
            onStateChange('idle');
          }
          stopAudioMeter();
        }
      };

      recognition.onend = () => {
        clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        if (jarvisState === 'listening') {
          onStateChange('idle');
        }
        stopAudioMeter();
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Erreur initialisation SpeechRecognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      clearTimeout(silenceTimerRef.current);
      stopListening();
      stopAudioMeter();
    };
  }, []);

  // Audio level meter using Web Audio API when listening
  const startAudioMeter = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        onSoundLevelUpdate(normalized);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      // Non-blocking if microphone audio meter access fails
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    onSoundLevelUpdate(0);
  };

  const startListening = () => {
    if (isAudioPlaying) {
      onStopSpeech();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopAudioMeter();
    if (jarvisState === 'listening') {
      onStateChange('idle');
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      clearTimeout(silenceTimerRef.current);
      const pendingText = latestSpokenRef.current.trim();
      stopListening();
      if (pendingText) {
        latestSpokenRef.current = '';
        setInterimTranscript('');
        onSendMessage(pendingText);
      }
    } else {
      startListening();
    }
  };

  const handleInstantVoiceSend = () => {
    clearTimeout(silenceTimerRef.current);
    const textToSend = latestSpokenRef.current.trim() || interimTranscript.trim();
    if (textToSend) {
      latestSpokenRef.current = '';
      setInterimTranscript('');
      stopListening();
      onSendMessage(textToSend);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (isListening) {
      stopListening();
    }
    onSendMessage(inputText.trim());
    setInputText('');
    setInterimTranscript('');
  };

  if (minimalFloating) {
    return (
      <>
        {/* Floating Interim Transcript when user is speaking */}
        {interimTranscript && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#070e1c]/90 border border-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-md flex items-center gap-3 text-xs text-cyan-200 animate-in fade-in slide-in-from-top-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-ping flex-shrink-0" />
            <span className="font-['Orbitron'] text-[10px] text-cyan-400 font-bold">ÉCOUTE :</span>
            <span className="italic font-medium truncate max-w-xs sm:max-w-md">{interimTranscript}</span>
            <button
              type="button"
              onClick={handleInstantVoiceSend}
              className="ml-2 px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold cursor-pointer whitespace-nowrap shadow-[0_0_8px_rgba(0,240,255,0.6)]"
            >
              Envoyer
            </button>
          </div>
        )}

        {/* Bottom-right Talk to Jarvis button matching images.jpg */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 select-none pointer-events-auto">
          <div className="px-2.5 py-1 rounded-md bg-black/85 border border-slate-700/60 text-[11px] text-slate-300 font-sans shadow-lg pointer-events-none whitespace-nowrap">
            {isListening ? 'Écoute active...' : 'Talk to Jarvis'}
          </div>

          <button
            type="button"
            onClick={handleToggleMic}
            disabled={!speechSupported}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.9)] scale-110 animate-pulse ring-4 ring-cyan-400/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-105 active:scale-95'
            } ${!speechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Talk to Jarvis"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-black" />}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="relative w-full border-t border-cyan-500/20 bg-[#060b18]/90 backdrop-blur-md px-4 py-3 select-none">
      {/* Live Interim Speech Transcription banner with instant send */}
      {interimTranscript && (
        <div className="max-w-4xl mx-auto mb-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-between gap-2 text-xs text-cyan-200">
          <div className="flex items-center gap-2 truncate">
            <Radio className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-ping" />
            <span className="font-['Rajdhani'] font-bold text-cyan-300">VOUS :</span>
            <span className="italic truncate">{interimTranscript}</span>
          </div>
          <button
            type="button"
            onClick={handleInstantVoiceSend}
            className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded flex items-center gap-1 flex-shrink-0 transition-colors shadow-[0_0_10px_#00f0ff]"
          >
            <Send className="w-3 h-3" />
            <span>Envoyer</span>
          </button>
        </div>
      )}

      {/* Quick Action & Automation Shortcuts Bar */}
      <div className="max-w-4xl mx-auto mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-['Rajdhani'] font-semibold">
        <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1 flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Actions :</span>
        </span>
        <button
          type="button"
          onClick={() => onSendMessage("Lis mes e-mails")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
        >
          <span>📬 Mes E-mails</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Affiche mon agenda")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>📅 Mon Agenda</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Active le mode dev")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>⚡ Mode Dev</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Active le mode étude")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>📚 Mode Études</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Optimise mon PC")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>🧹 Nettoyer PC</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Mets de la musique")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>🎵 Musique</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Ouvre la calculatrice")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>🧮 Calculatrice</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("Recherche les actualités tech de la semaine")}
          className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <span>🌐 Actualités</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3"
      >
        {/* Microphone Toggle Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={!speechSupported}
            className={`relative p-3 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f0ff] ring-2 ring-cyan-300'
                : 'bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/60'
            } ${!speechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={
              !speechSupported
                ? 'Reconnaissance vocale non disponible sur ce navigateur'
                : isListening
                ? 'Désactiver le microphone'
                : 'Activer le microphone (parler à JARVIS)'
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Glowing pulse ring when listening */}
          {isListening && (
            <span className="absolute -inset-1 rounded-full border border-cyan-400 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Text Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Écoute vocale active... Parlez à JARVIS...'
                : 'Tapez une instruction ou parlez au micro (ex: "Aide-moi pour mes révisions", "Ouvre la calculatrice")...'
            }
            className="w-full bg-[#0a1124] border border-cyan-500/25 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/40 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all font-sans"
          />
        </div>

        {/* Immediate Mute / Stop Audio Button */}
        {isAudioPlaying && (
          <button
            type="button"
            onClick={onStopSpeech}
            className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center justify-center"
            title="Arrêter la voix de JARVIS"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        )}

        {/* Quick Voice Speed Toggle */}
        <button
          type="button"
          onClick={() => {
            const current = voiceSettings.rate || 1.25;
            const nextSpeed = current >= 1.6 ? 1.0 : current >= 1.4 ? 1.6 : current >= 1.2 ? 1.4 : 1.25;
            onUpdateVoiceSpeed?.(nextSpeed);
          }}
          className="px-2.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 font-mono text-xs transition-colors"
          title={`Vitesse de parole actuelle : ${voiceSettings.rate || 1.25}x (Cliquer pour accélérer)`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">{voiceSettings.rate || 1.25}x</span>
        </button>

        {/* Submit Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-3 rounded-xl font-medium flex items-center justify-center transition-all ${
            inputText.trim()
              ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
          title="Envoyer la commande"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

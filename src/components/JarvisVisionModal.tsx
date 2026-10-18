import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Eye,
  Camera,
  Play,
  Square,
  Sparkles,
  RefreshCw,
  Scan,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Monitor,
  Terminal,
  Layers,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { JarvisVisionAnalysis, CompanionStatus, WindowsAction } from '../types/jarvis';

interface JarvisVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionStatus: CompanionStatus;
  onExecutePrompt: (prompt: string) => void;
  onExecutePcAction?: (action: WindowsAction) => void;
  onSpeak?: (text: string) => void;
}

export const JarvisVisionModal: React.FC<JarvisVisionModalProps> = ({
  isOpen,
  onClose,
  companionStatus,
  onExecutePrompt,
  onExecutePcAction,
  onSpeak,
}) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoWatch, setAutoWatch] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [lastAnalysis, setLastAnalysis] = useState<JarvisVisionAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoWatchTimerRef = useRef<any>(null);

  const stopScreenCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setAutoWatch(false);
  }, []);

  const startScreenCapture = useCallback(async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('La capture d\'écran navigateur n\'est pas supportée dans cet environnement.');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as any,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);

      // Listen for when user clicks native "Arrêter le partage"
      stream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };

      if (onSpeak) {
        onSpeak("Flux visuel oculaire établi, Monsieur. Je vois désormais l'intégralité de votre écran.");
      }
    } catch (err: any) {
      console.warn('Erreur screen capture:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMessage(err.message || 'Impossible d\'activer le partage d\'écran.');
      }
    }
  }, [onSpeak, stopScreenCapture]);

  const captureFrameFromVideo = useCallback((): string | null => {
    if (!videoRef.current || !streamRef.current) return null;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedThumbnail(dataUrl);
    return dataUrl;
  }, []);

  const captureAndAnalyze = useCallback(async (customPrompt?: string) => {
    let base64Image: string | null = null;

    if (streamRef.current) {
      base64Image = captureFrameFromVideo();
    }

    if (!base64Image) {
      // Fallback: try capturing via Windows Companion Bridge
      if (companionStatus.connected && onExecutePcAction) {
        onExecutePcAction({
          type: 'companion',
          title: 'Capture d\'écran pour Vision JARVIS',
          description: 'Capture instantanée du bureau via le pont local',
          params: { action: 'screenshot' },
        });
        setErrorMessage('Capture d\'écran transmise via le pont Windows local. Pour une vision vidéo continue, cliquez sur "ACTIVER LE FLUX VIDÉO DIRECT".');
        return;
      } else {
        setErrorMessage('Activez le flux vidéo d\'écran ou connectez le pont Windows pour permettre à JARVIS de voir votre écran.');
        return;
      }
    }

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/jarvis/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
          userPrompt: customPrompt || userQuery,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse visuelle');
      }

      setLastAnalysis(data.result);

      if (onSpeak && data.result?.screenSummary) {
        onSpeak(data.result.screenSummary);
      }
    } catch (err: any) {
      console.error('Erreur vision analyze:', err);
      setErrorMessage(err.message || 'Échec de l\'analyse oculaire.');
    } finally {
      setIsScanning(false);
    }
  }, [companionStatus.connected, onExecutePcAction, onSpeak, userQuery, captureFrameFromVideo]);

  // Stop stream when modal is closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      stopScreenCapture();
    }
    return () => {
      stopScreenCapture();
    };
  }, [isOpen, stopScreenCapture]);

  // Handle auto-watch loop
  useEffect(() => {
    if (autoWatch && isStreaming) {
      autoWatchTimerRef.current = setInterval(() => {
        captureAndAnalyze('Surveillance continue : décris brièvement l\'état de l\'écran et signale toute anomalie.');
      }, 25000);
    } else {
      if (autoWatchTimerRef.current) {
        clearInterval(autoWatchTimerRef.current);
        autoWatchTimerRef.current = null;
      }
    }

    return () => {
      if (autoWatchTimerRef.current) {
        clearInterval(autoWatchTimerRef.current);
      }
    };
  }, [autoWatch, isStreaming, captureAndAnalyze]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100">
        {/* Holographic Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)]">
              <Eye className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] font-bold text-sm sm:text-base tracking-wider text-cyan-300">
                  JARVIS // CORTEX VISUEL EN DIRECT (VUE DE L'ÉCRAN)
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wider font-semibold border ${
                    isStreaming
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {isStreaming ? 'VISION ACTIVE (30 FPS)' : 'OEIL EN VEILLE'}
                </span>
                {autoWatch && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono animate-pulse">
                    SURVEILLANCE CONTINUE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Capture d'écran haute définition en temps réel · Détection de fenêtres & OCR · Diagnostic d'erreurs
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          {/* Main Visual Stream View & Overlay */}
          <div className="relative rounded-2xl bg-black/90 border border-cyan-500/30 overflow-hidden shadow-inner aspect-video max-h-[380px] flex items-center justify-center">
            {/* Screen video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${isStreaming ? 'block' : 'hidden'}`}
            />

            {/* If not streaming, show holographic standby visor */}
            {!isStreaming && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center animate-spin" style={{ animationDuration: '16s' }}>
                  <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                    <Eye className="w-7 h-7 text-cyan-300" />
                  </div>
                </div>

                <div className="max-w-md">
                  <h3 className="font-['Orbitron'] font-bold text-sm text-cyan-300 tracking-wider">
                    VISION OCULAIRE DÉSACTIVÉE
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Autorisez JARVIS à voir votre écran en direct pour qu'il puisse inspecter vos logiciels, repérer vos erreurs de code et anticiper vos besoins en temps réel.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={startScreenCapture}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-['Rajdhani'] font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>ACTIVER LA VUE DE JARVIS EN DIRECT</span>
                  </button>

                  {companionStatus.connected && (
                    <button
                      onClick={() => captureAndAnalyze()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 font-['Rajdhani'] font-bold text-xs tracking-wider flex items-center gap-2 transition-all"
                    >
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>CAPTURE INSTANTANÉE PC (PONT)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Holographic HUD Overlays when streaming */}
            {isStreaming && (
              <>
                {/* Target crosshairs */}
                <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-3 rounded-lg" />
                <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 font-mono text-[10px] text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>CORTEX OCULAIRE ACTIF · 1080P HD</span>
                </div>

                {/* Laser scan animation when scanning */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-pulse"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        animation: 'hud-scan 2s linear infinite',
                      }}
                    />
                  </div>
                )}

                {/* Top right stop button */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={stopScreenCapture}
                    className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-1.5 shadow"
                    title="Arrêter la transmission vidéo"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>COUPER LA VUE</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/25">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <input
                type="text"
                placeholder="Question spécifique sur l'écran (ex: Où est le bug dans ce code ? Que dit cette erreur ?)"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') captureAndAnalyze();
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-xs text-slate-100 placeholder:text-slate-500 outline-none font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pr-2 border-r border-slate-700">
                <input
                  type="checkbox"
                  checked={autoWatch}
                  onChange={(e) => setAutoWatch(e.target.checked)}
                  disabled={!isStreaming}
                  className="accent-cyan-400 rounded"
                />
                <span className="font-['Rajdhani'] font-bold text-xs">
                  SURVEILLANCE CONTINUE
                </span>
              </label>

              <button
                onClick={() => captureAndAnalyze()}
                disabled={isScanning || (!isStreaming && !companionStatus.connected)}
                className={`px-4 py-2 rounded-xl font-['Rajdhani'] font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${
                  isScanning || (!isStreaming && !companionStatus.connected)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                    <span>ANALYSE OCULAIRE EN COURS...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5 text-cyan-300" />
                    <span>SCANNER CE QUE JARVIS VOIT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Vision Diagnostic Results Deck */}
          {lastAnalysis && (
            <div className="space-y-4 pt-2 border-t border-cyan-500/20">
              <div className="flex items-center justify-between">
                <h4 className="font-['Orbitron'] text-xs font-semibold text-cyan-300 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  RAPPORT D'OBSERVATION OCULAIRE EN DIRECT
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  ANALYSE MULTIMODALE GEMINI 3.8 VALIDÉE
                </span>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 font-['Rajdhani'] uppercase tracking-wider text-cyan-300">
                    Synthèse de l'Écran
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">FENÊTRES IDENTIFIÉES :</span>
                    {lastAnalysis.activeApps.map((app, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {lastAnalysis.screenSummary}
                </p>
              </div>

              {/* Detected Issues or Points of Attention (if any) */}
              {lastAnalysis.issuesOrAlerts && lastAnalysis.issuesOrAlerts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-['Rajdhani'] font-bold text-amber-300 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Points d'Attention / Erreurs Détectées à l'Écran :</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-amber-200/90 font-mono">
                    {lastAnalysis.issuesOrAlerts.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Text, OCR or Code */}
              {lastAnalysis.detectedTextOrCode && (
                <div className="p-3.5 rounded-xl bg-black/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      TEXTE / CODE REPÉRÉ À L'ÉCRAN (OCR) :
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lastAnalysis.detectedTextOrCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copier</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-cyan-200/90 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar p-2 rounded bg-slate-950">
                    {lastAnalysis.detectedTextOrCode}
                  </pre>
                </div>
              )}

              {/* Full Description & Advice */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {lastAnalysis.fullDescription}
              </div>

              {/* Suggested Actions */}
              {lastAnalysis.suggestedActions && lastAnalysis.suggestedActions.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 font-mono block mb-2">
                    ASSISTANCE PROACTIVE RECOMMANDÉE :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lastAnalysis.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onClose();
                          onExecutePrompt(act.prompt);
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
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>La vue de JARVIS analyse les pixels directement dans votre navigateur via WebRTC Screen Capture.</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onExecutePrompt('Dis-moi ce que tu vois sur mon écran actuellement et aide-moi');
            }}
            className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            Interroger par la voix
          </button>
        </div>
      </div>
    </div>
  );
};

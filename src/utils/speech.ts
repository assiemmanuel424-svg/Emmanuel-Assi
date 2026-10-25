import { VoiceSettings } from '../types/jarvis';

// Global audio element reference for Gemini TTS audio playback
let currentAudioElement: HTMLAudioElement | null = null;

export function stopAllSpeech(): void {
  // Cancel Web Speech Synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('SpeechSynthesis cancel error:', e);
    }
  }

  // Stop currently playing HTMLAudioElement (Gemini TTS)
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement = null;
    } catch (e) {
      console.warn('AudioElement stop error:', e);
    }
  }
}

export function getAvailableBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Play speech using Web Speech Synthesis (zero latency, offline, free)
 */
export function speakWithBrowser(
  text: string,
  settings: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Synthèse vocale non supportée par votre navigateur'));
    return;
  }

  stopAllSpeech();

  // Strip code blocks and markdown syntax for clean spoken audio
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "bloc de code omis pour la lecture vocale")
    .replace(/`[^`]+`/g, '')
    .replace(/[*#_\[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, 'un lien internet')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = settings.rate ? Math.max(1.2, settings.rate) : 1.25;
  utterance.pitch = settings.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (settings.browserVoiceName) {
    const matched = voices.find(v => v.name === settings.browserVoiceName);
    if (matched) utterance.voice = matched;
  }

  if (!utterance.voice) {
    // Prefer French local voices for instantaneous playback
    const localFrVoice = voices.find(v => v.lang.startsWith('fr') && (v as any).localService);
    const anyFrVoice = voices.find(v => v.lang.startsWith('fr'));
    utterance.voice = localFrVoice || anyFrVoice || voices[0] || null;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (e.error !== 'canceled') {
      onError?.(e);
    }
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Play speech using server-side Gemini Flash Lite TTS with fast timeout fallback
 */
export async function speakWithGemini(
  text: string,
  voiceName: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  stopAllSpeech();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const response = await fetch('/api/jarvis/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceName || 'Fenrir' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data.fallbackToBrowser || !response.ok || !data.audioBase64) {
      onError?.(new Error('Bascule vocale navigateur'));
      return;
    }

    const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      currentAudioElement = null;
      onEnd?.();
    };

    audio.onerror = (e) => {
      currentAudioElement = null;
      onError?.(e);
      onEnd?.();
    };

    await audio.play();
  } catch (error) {
    // Immediate fallback to instant browser voice
    onError?.(error);
  }
}

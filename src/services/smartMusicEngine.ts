import { SmartTrack, MusicMood, SmartMusicState } from '../types/jarvis';

export const SMART_TRACKS: SmartTrack[] = [
  // Stark Lab & Energy
  {
    id: 'track-stark-core',
    title: 'Arc Reactor Overdrive',
    artist: 'JARVIS Audio Matrix',
    mood: 'stark_lab',
    description: 'Synthwave énergique & pulsations industrielles 124 BPM pour atelier et ingénierie.',
    type: 'procedural',
    bpm: 124,
    color: '#00f0ff',
  },
  {
    id: 'track-stark-stream',
    title: 'Nightride FM Synthwave Stream',
    artist: 'Radio Cyberpunk Live',
    mood: 'stark_lab',
    description: 'Flux live continu de synthwave rétro-futuriste et darksynth pour booster la cadence.',
    type: 'stream',
    streamUrl: 'https://stream.nightride.fm/nightride.m4a',
    bpm: 128,
    color: '#38bdf8',
  },
  // Deep Focus & Quantum
  {
    id: 'track-focus-quantum',
    title: 'Ondes Alpha 432Hz & Espace Quantique',
    artist: 'JARVIS Neuro-Focus',
    mood: 'deep_focus',
    description: 'Nappes éthérées, fréquences binaurales et battements lents pour code intensif et réflexion.',
    type: 'procedural',
    bpm: 60,
    color: '#a855f7',
  },
  {
    id: 'track-focus-stream',
    title: 'Lofi Focus Cyber Chill Stream',
    artist: 'Lofi Beats Network',
    mood: 'deep_focus',
    description: 'Flux direct Lo-Fi hip hop doux et rythmes d\'étude sans distraction vocale.',
    type: 'stream',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    bpm: 78,
    color: '#c084fc',
  },
  // Iron Flight & Adrenaline
  {
    id: 'track-flight-adrenaline',
    title: 'Mark VII Mach 3 Acceleration',
    artist: 'JARVIS Flight Deck',
    mood: 'iron_flight',
    description: 'Arpèges héroïques montants et basses cinématiques 136 BPM pour action et dépassement.',
    type: 'procedural',
    bpm: 136,
    color: '#f59e0b',
  },
  {
    id: 'track-flight-stream',
    title: 'Epic Cinematic Soundscapes',
    artist: 'Symphonic Cinema Stream',
    mood: 'iron_flight',
    description: 'Grandes orchestrations et montées épiques inspirées des musiques de films de super-héros.',
    type: 'stream',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    bpm: 130,
    color: '#fbbf24',
  },
  // Night Lounge & Relax
  {
    id: 'track-night-lounge',
    title: 'Stark Tower Penthouse Nocturne',
    artist: 'JARVIS Chill Synth',
    mood: 'night_lounge',
    description: 'Accords feutrés Rhodes, crépitement vinyle analogique et ambiance lounge tamisée 72 BPM.',
    type: 'procedural',
    bpm: 72,
    color: '#10b981',
  },
  {
    id: 'track-night-stream',
    title: 'Ambient Deep Chill Stream',
    artist: 'SomaFM Drone Zone',
    mood: 'night_lounge',
    description: 'Atmosphères spatiales lentes et méditatives pour fin de soirée et détente.',
    type: 'stream',
    streamUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
    bpm: 65,
    color: '#34d399',
  },
];

type StateListener = (state: SmartMusicState) => void;

class SmartMusicEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private streamAudio: HTMLAudioElement | null = null;
  private streamSourceNode: MediaElementAudioSourceNode | null = null;

  // Procedural scheduler timer
  private proceduralIntervalId: any = null;
  private noiseNode: AudioNode | null = null;
  private droneOscillators: OscillatorNode[] = [];

  private isPlaying = false;
  private currentTrack: SmartTrack = SMART_TRACKS[0];
  private volume = 0.55;
  private isMuted = false;
  private isDucked = false;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    // Try to load saved volume
    try {
      const savedVol = localStorage.getItem('jarvis_music_volume');
      if (savedVol) {
        this.volume = parseFloat(savedVol);
      }
    } catch (_) {}
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

      // Analyser Node for Visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public getState(): SmartMusicState {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrack.id,
      volume: this.volume,
      isMuted: this.isMuted,
      isDucked: this.isDucked,
      activeMood: this.currentTrack.mood,
    };
  }

  public getCurrentTrack(): SmartTrack {
    return this.currentTrack;
  }

  public getTracks(): SmartTrack[] {
    return SMART_TRACKS;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.isPlaying) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  // Audio Ducking (smooth fade down to 15% when JARVIS talks or listens)
  public duckAudio(shouldDuck: boolean) {
    this.isDucked = shouldDuck;
    if (!this.masterGain || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const targetGain = this.isMuted ? 0 : shouldDuck ? this.volume * 0.15 : this.volume;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.25);
    this.notify();
  }

  public setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    try {
      localStorage.setItem('jarvis_music_volume', this.volume.toString());
    } catch (_) {}

    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const target = this.isMuted ? 0 : this.isDucked ? this.volume * 0.15 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const target = this.isMuted ? 0 : this.isDucked ? this.volume * 0.15 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
    }
    this.notify();
  }

  public async playTrack(track: SmartTrack) {
    this.initAudioContext();
    this.stopPlayback();

    this.currentTrack = track;
    this.isPlaying = true;
    this.notify();

    if (track.type === 'stream' && track.streamUrl) {
      this.startStreamAudio(track.streamUrl);
    } else {
      this.startProceduralAudio(track.mood);
    }
  }

  public async togglePlay() {
    if (this.isPlaying) {
      this.stopPlayback();
      this.isPlaying = false;
      this.notify();
    } else {
      await this.playTrack(this.currentTrack);
    }
  }

  public nextTrack() {
    const idx = SMART_TRACKS.findIndex((t) => t.id === this.currentTrack.id);
    const nextIdx = (idx + 1) % SMART_TRACKS.length;
    this.playTrack(SMART_TRACKS[nextIdx]);
  }

  public prevTrack() {
    const idx = SMART_TRACKS.findIndex((t) => t.id === this.currentTrack.id);
    const prevIdx = (idx - 1 + SMART_TRACKS.length) % SMART_TRACKS.length;
    this.playTrack(SMART_TRACKS[prevIdx]);
  }

  public setMood(mood: MusicMood) {
    const trackForMood = SMART_TRACKS.find((t) => t.mood === mood) || SMART_TRACKS[0];
    this.playTrack(trackForMood);
  }

  // --- Internal Stream Player ---
  private startStreamAudio(url: string) {
    const ctx = this.initAudioContext();

    if (!this.streamAudio) {
      this.streamAudio = new Audio();
      this.streamAudio.crossOrigin = 'anonymous';
      this.streamSourceNode = ctx.createMediaElementSource(this.streamAudio);
      if (this.masterGain) {
        this.streamSourceNode.connect(this.masterGain);
      }
    }

    this.streamAudio.src = url;
    this.streamAudio.play().catch((err) => {
      console.warn('Stream failed or blocked, falling back to procedural synth:', err);
      // Fallback to procedural synth seamlessly
      this.startProceduralAudio(this.currentTrack.mood);
    });
  }

  // --- Internal Procedural Web Audio Engine ---
  private startProceduralAudio(mood: MusicMood) {
    const ctx = this.initAudioContext();
    if (!this.masterGain) return;

    this.stopProcedural();

    // 1. Ambient Background Pad / Binaural Drones
    if (mood === 'deep_focus') {
      // 432 Hz + Harmonious fifth & octave
      const baseFreq = 432;
      const freqs = [baseFreq / 4, (baseFreq * 1.5) / 4, baseFreq / 2];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f + (i === 1 ? 0.8 : 0), ctx.currentTime); // subtle beat frequency

        g.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain!);
        osc.start();
        this.droneOscillators.push(osc);
      });
    } else if (mood === 'stark_lab') {
      // Powerful Bass Drone + Tech Resonance
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      g.gain.setValueAtTime(0.05, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);
      osc.start();
      this.droneOscillators.push(osc);
    } else if (mood === 'night_lounge') {
      // Smooth Sub-bass + warm triangle
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65.4, ctx.currentTime); // C2
      g.gain.setValueAtTime(0.07, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);
      osc.start();
      this.droneOscillators.push(osc);
    } else if (mood === 'iron_flight') {
      // Cinematic Dual Detuned Saw
      [110, 110.6].forEach((f) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0.04, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain!);
        osc.start();
        this.droneOscillators.push(osc);
      });
    }

    // 2. Generative Rhythmic Notes / Arpeggiator (Clock Loop)
    let step = 0;
    const bpm = this.currentTrack.bpm || 110;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    // Scales
    const scales: Record<MusicMood, number[]> = {
      stark_lab: [130.81, 155.56, 174.61, 196.0, 233.08, 261.63], // C minor pentatonic
      deep_focus: [216, 242.7, 288, 324, 384], // 432Hz ambient tuning
      iron_flight: [146.83, 174.61, 196.0, 220.0, 261.63, 293.66], // D minor heroic
      night_lounge: [130.81, 164.81, 196.0, 246.94, 293.66], // C major 7th / 9th
    };

    const activeScale = scales[mood];

    this.proceduralIntervalId = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx || !this.masterGain) return;
      const now = this.audioCtx.currentTime;

      // Note triggers based on mood
      const noteIndex = (step * 3 + (step % 4 === 0 ? 2 : 0)) % activeScale.length;
      const freq = activeScale[noteIndex];

      if (mood === 'stark_lab' || mood === 'iron_flight') {
        // Kick on beats 0, 4, 8, 12
        if (step % 4 === 0) {
          this.triggerProceduralKick(now);
        }
        // Synth arpeggio tick
        if (step % 2 === 0 || (mood === 'stark_lab' && Math.random() > 0.4)) {
          this.triggerSynthPluck(freq, now, mood === 'stark_lab' ? 'sawtooth' : 'triangle');
        }
      } else if (mood === 'deep_focus') {
        // Slow soothing bells / sine drops every 8 steps
        if (step % 4 === 0 && Math.random() > 0.3) {
          this.triggerDeepBell(freq * 2, now);
        }
      } else if (mood === 'night_lounge') {
        // Soft electric piano-like sine on syncopated steps
        if (step % 3 === 0 || step % 7 === 0) {
          this.triggerRhodesPluck(freq * 1.5, now);
        }
        // Soft snare / brush tick every 4th step
        if (step % 4 === 2) {
          this.triggerBrushTick(now);
        }
      }

      step = (step + 1) % 16;
    }, intervalMs);
  }

  // --- Procedural Instrument Generators ---
  private triggerProceduralKick(time: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private triggerSynthPluck(freq: number, time: number, type: OscillatorType) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + 0.2);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.23);
  }

  private triggerDeepBell(freq: number, time: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 2.6);
  }

  private triggerRhodesPluck(freq: number, time: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.65);
  }

  private triggerBrushTick(time: number) {
    if (!this.audioCtx || !this.masterGain) return;
    // Micro noise burst
    const bufferSize = this.audioCtx.sampleRate * 0.04;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start(time);
  }

  private stopProcedural() {
    if (this.proceduralIntervalId) {
      clearInterval(this.proceduralIntervalId);
      this.proceduralIntervalId = null;
    }
    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    this.droneOscillators = [];
  }

  private stopPlayback() {
    this.stopProcedural();
    if (this.streamAudio) {
      this.streamAudio.pause();
      this.streamAudio.currentTime = 0;
    }
  }

  public stop() {
    this.stopPlayback();
    this.isPlaying = false;
    this.notify();
  }
}

// Global Singleton
export const smartMusicEngine = new SmartMusicEngine();

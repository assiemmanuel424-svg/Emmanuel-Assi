export type JarvisState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface WindowsAction {
  type: 'protocol' | 'web' | 'powershell' | 'python' | 'task' | 'routine' | 'note' | 'workspace' | 'companion';
  title: string;
  target?: string;
  description: string;
  params?: Record<string, any>;
  requiresConfirmation?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'jarvis';
  content: string;
  rawContent?: string;
  timestamp: string;
  sources?: GroundingSource[];
  actions?: WindowsAction[];
  isAudioPlaying?: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  language: string;
  preferences: string;
  goals: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: 'preference' | 'project' | 'study' | 'personal' | 'custom' | 'fact' | 'directive';
  createdAt: string;
  isActive: boolean;
}

export interface CompanionSystemInfo {
  system: string;
  release: string;
  machine: string;
  disk_total_gb?: number;
  disk_free_gb?: number;
  node?: string;
  python?: string;
}

export interface CompanionStatus {
  connected: boolean;
  info?: CompanionSystemInfo;
  error?: string;
}

export interface VoiceSettings {
  autoSpeak: boolean;
  voiceEngine: 'browser' | 'gemini';
  browserVoiceName: string;
  geminiVoice: 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon' | 'Kore';
  rate: number;
  pitch: number;
  wakeWordEnabled: boolean;
}

export interface AutomationStep {
  id: string;
  type: 'protocol' | 'web' | 'powershell' | 'python' | 'speech' | 'timer';
  title: string;
  target?: string;
  durationSeconds?: number;
}

export interface AutomationRoutine {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'study' | 'maintenance' | 'daily' | 'custom';
  voiceTriggers: string[];
  steps: AutomationStep[];
  isCustom?: boolean;
}

export interface ActiveRoutineExecution {
  routineId: string;
  currentStepIndex: number;
  status: 'running' | 'paused' | 'completed' | 'error';
  log: string[];
}

export interface JarvisTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface SelfProgrammedModule {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'web' | 'automation' | 'science' | 'ai' | 'tool' | 'custom';
  language: 'powershell' | 'python' | 'javascript' | 'routine';
  code: string;
  triggerPhrase: string;
  explanation: string;
  createdAt: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface AutonomousLoop {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'hourly' | 'on_idle';
  enabled: boolean;
  lastRun?: string;
  actionType: 'maintenance' | 'briefing' | 'security_audit' | 'knowledge_sync' | 'ram_optimization';
}

export interface HumanCompetenceDomain {
  id: string;
  name: string;
  category: string;
  icon: string;
  level: string;
  summary: string;
  subfields: string[];
  samplePrompts: string[];
}

export type MusicMood = 'stark_lab' | 'deep_focus' | 'iron_flight' | 'night_lounge';

export interface SmartTrack {
  id: string;
  title: string;
  artist: string;
  mood: MusicMood;
  description: string;
  type: 'procedural' | 'stream';
  streamUrl?: string;
  bpm?: number;
  color: string;
}

export interface SmartMusicState {
  isPlaying: boolean;
  currentTrackId: string;
  volume: number;
  isMuted: boolean;
  isDucked: boolean;
  activeMood: MusicMood;
}

export interface Gpt6ThoughtStep {
  step: number;
  title: string;
  content: string;
}

export interface Gpt6CodeSnippet {
  language: string;
  title: string;
  code: string;
}

export interface Gpt6ReasoningResult {
  thoughtProcess: Gpt6ThoughtStep[];
  finalAnswer: string;
  confidenceScore: number;
  agentsInvolved: string[];
  codeSnippets?: Gpt6CodeSnippet[];
  suggestedActions?: Array<{ label: string; prompt: string }>;
}

export interface JarvisVisionAnalysis {
  screenSummary: string;
  activeApps: string[];
  detectedTextOrCode: string;
  issuesOrAlerts: string[];
  fullDescription: string;
  suggestedActions: Array<{ label: string; prompt: string }>;
}


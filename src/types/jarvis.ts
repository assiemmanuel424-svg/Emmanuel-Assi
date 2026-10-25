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
  thoughtProcess?: Gpt6ThoughtStep[];
  agentsInvolved?: string[];
  codeSnippets?: Gpt6CodeSnippet[];
  canvasData?: Gpt6CanvasData;
  visualAsset?: Gpt6VisualAsset;
  mode?: string;
  attachment?: {
    name?: string;
    preview: string;
    mimeType: string;
    data: string;
  };
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

export interface Gpt6CanvasData {
  title: string;
  type: 'code' | 'document' | 'table';
  content: string;
  language?: string;
}

export interface Gpt6ResearchData {
  topic: string;
  keyFindings: string[];
  sources?: Array<{ title: string; url: string }>;
  fullReport: string;
}

export interface Gpt6VisualAsset {
  title: string;
  svgContent?: string;
  prompt: string;
  style: string;
}

export interface Gpt6ReasoningResult {
  thoughtProcess: Gpt6ThoughtStep[];
  finalAnswer: string;
  confidenceScore: number;
  agentsInvolved: string[];
  codeSnippets?: Gpt6CodeSnippet[];
  canvasData?: Gpt6CanvasData;
  researchReport?: Gpt6ResearchData;
  visualAsset?: Gpt6VisualAsset;
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

// ==========================================
// FOREX TRADING TYPES
// ==========================================
export type ForexPairSymbol = 'EUR/USD' | 'GBP/USD' | 'USD/JPY' | 'AUD/USD' | 'USD/CAD' | 'USD/CHF' | 'GBP/JPY' | 'EUR/GBP' | 'XAU/USD';

export interface CandleStick {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ForexPairData {
  symbol: ForexPairSymbol;
  name: string;
  bid: number;
  ask: number;
  spreadPips: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  digits: number;
  candles: CandleStick[];
}

export interface ForexPosition {
  id: string;
  pair: ForexPairSymbol;
  type: 'BUY' | 'SELL';
  lotSize: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  floatingPnl: number;
  floatingPips: number;
  openTime: string;
  comment?: string;
  isAutoTrade?: boolean;
}

export interface ForexTradeHistoryItem {
  id: string;
  pair: ForexPairSymbol;
  type: 'BUY' | 'SELL';
  lotSize: number;
  openPrice: number;
  closePrice: number;
  realizedPnl: number;
  realizedPips: number;
  openTime: string;
  closeTime: string;
  closeReason: 'TP_HIT' | 'SL_HIT' | 'MANUAL' | 'AUTOPILOT';
}

export type ForexStrategy = 'scalping' | 'trend_following' | 'breakout' | 'smc' | 'arbitrage';

export interface ForexAccountState {
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
  marginLevelPercent: number;
  leverage: number;
  currency: string;
  isAutoTradingActive: boolean;
  activeStrategy: ForexStrategy;
  riskPerTradePercent: number;
  maxDailyDrawdownPercent: number;
  brokerMode: 'simulation' | 'metatrader5' | 'oanda' | 'binance';
  brokerApiKey?: string;
  brokerWebhookUrl?: string;
}

export interface ForexAiSignal {
  symbol: ForexPairSymbol;
  action: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: string;
  reasoning: string;
  indicators: {
    rsi: number;
    macd: string;
    trend: string;
    volatility: string;
  };
}

// ==========================================
// CLAUDE CODE MULTI-LANGUAGE STUDIO TYPES
// ==========================================
export type ClaudeSupportedLanguage =
  | 'python'
  | 'typescript'
  | 'rust'
  | 'go'
  | 'cpp'
  | 'c'
  | 'java'
  | 'php'
  | 'csharp'
  | 'ruby'
  | 'bash'
  | 'kotlin'
  | 'swift'
  | 'sql'
  | 'html';

export type ClaudeAgentMode = 'architect' | 'coder' | 'debugger' | 'refactor' | 'test_runner';

export interface ClaudeProjectFile {
  id: string;
  name: string;
  path: string;
  language: ClaudeSupportedLanguage;
  content: string;
  isModified?: boolean;
  diffSummary?: {
    addedLines: number;
    removedLines: number;
  };
}

export interface ClaudeDiffChunk {
  file: string;
  diffText: string;
  action: 'modified' | 'created' | 'deleted';
}

export interface ClaudeExecutionOutput {
  status: 'success' | 'error';
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryKb?: number;
  exitCode: number;
}

export interface ClaudeCodeAgentResponse {
  summary: string;
  mode: ClaudeAgentMode;
  filesToUpdate: Array<{
    path: string;
    name: string;
    language: ClaudeSupportedLanguage;
    content: string;
  }>;
  explanation: string;
  terminalCommandSuggested?: string;
  gitCommitMessage?: string;
  testResultsPreview?: string;
}


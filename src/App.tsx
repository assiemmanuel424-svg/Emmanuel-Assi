import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HudHeader } from './components/HudHeader';
import { ArcReactor } from './components/ArcReactor';
import { ChatWindow } from './components/ChatWindow';
import { VoiceController } from './components/VoiceController';
import { MemoryManagerModal } from './components/MemoryManagerModal';
import { WindowsHubModal } from './components/WindowsHubModal';
import { SettingsModal } from './components/SettingsModal';
import { AutomationHubModal } from './components/AutomationHubModal';
import { ArsenalModal } from './components/ArsenalModal';
import { ArcReactorTelemetryChart } from './components/ArcReactorTelemetryChart';
import { WorkspaceHubModal } from './components/WorkspaceHubModal';
import { SelfEvolutionModal } from './components/SelfEvolutionModal';
import { SmartMusicModal } from './components/SmartMusicModal';
import { Gpt6OmniModal } from './components/Gpt6OmniModal';
import { JarvisVisionModal } from './components/JarvisVisionModal';
import { LiveMemoryWidget } from './components/LiveMemoryWidget';
import { MinimalJarvisCore } from './components/MinimalJarvisCore';
import { SystemFoldersModal } from './components/SystemFoldersModal';
import { JarvisSearchBar } from './components/JarvisSearchBar';
import {
  Activity,
  Brain,
  Zap,
  Eye,
  Music,
  Cpu,
  Monitor,
  Mail,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Folder,
  FolderOpen,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { smartMusicEngine } from './services/smartMusicEngine';
import { initAuth } from './utils/workspaceAuth';
import {
  fetchRecentEmails,
  fetchUpcomingEvents,
  fetchGoogleTasks,
  fetchDriveFiles,
} from './utils/workspaceApi';
import { User } from 'firebase/auth';
import {
  parsePcCommand,
  sendBridgeCommand,
  launchApp,
  controlMedia,
  captureScreenshot,
  openFolder,
  executeSystemPower,
  getTopProcesses,
  killProcess,
  runPowerShell,
} from './utils/companionController';
import {
  Message,
  UserProfile,
  MemoryItem,
  VoiceSettings,
  JarvisState,
  CompanionStatus,
  WindowsAction,
  AutomationRoutine,
  ActiveRoutineExecution,
  JarvisTask,
  QuickNote,
} from './types/jarvis';
import {
  loadProfile,
  saveProfile,
  loadMemories,
  saveMemories,
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadNotes,
  saveNotes,
} from './utils/storage';
import {
  loadRoutines,
  saveRoutines,
  matchVoiceTrigger,
} from './utils/automations';
import {
  stopAllSpeech,
  speakWithBrowser,
  speakWithGemini,
} from './utils/speech';

export default function App() {
  // State Initialization
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadProfile);
  const [memories, setMemories] = useState<MemoryItem[]>(loadMemories);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadSettings);
  const [routines, setRoutines] = useState<AutomationRoutine[]>(loadRoutines);
  const [activeExecution, setActiveExecution] = useState<ActiveRoutineExecution | null>(null);
  const [tasks, setTasks] = useState<JarvisTask[]>(loadTasks);
  const [notes, setNotes] = useState<QuickNote[]>(loadNotes);

  const [jarvisState, setJarvisState] = useState<JarvisState>('idle');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [soundLevel, setSoundLevel] = useState<number>(0);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [companionStatus, setCompanionStatus] = useState<CompanionStatus>({
    connected: false,
  });

  // Modal Toggles
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isWindowsHubOpen, setIsWindowsHubOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const [isSmartMusicOpen, setIsSmartMusicOpen] = useState(false);
  const [isGpt6Open, setIsGpt6Open] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [workspaceUser, setWorkspaceUser] = useState<User | null>(null);
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'core' | 'memory' | 'shortcuts'>('core');
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(smartMusicEngine.getState().isPlaying);
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState<boolean>(() => {
    return localStorage.getItem('jarvis_autopilot') !== 'false';
  });

  useEffect(() => {
    const unsub = smartMusicEngine.subscribe((st) => {
      setMusicPlaying(st.isPlaying);
    });
    return () => unsub();
  }, []);

  // Quick Memory helper methods for instant UI interaction
  const handleAddQuickMemory = (content: string, category: MemoryItem['category'] = 'preference') => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const updated = [newMem, ...memories];
    setMemories(updated);
    saveMemories(updated);
  };

  const handleDeleteQuickMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    saveMemories(updated);
  };

  const handleToggleActiveQuickMemory = (id: string) => {
    const updated = memories.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
    setMemories(updated);
    saveMemories(updated);
  };

  // Audio Ducking for Smart Musique when JARVIS speaks or listens
  useEffect(() => {
    const shouldDuck = isAudioPlaying || jarvisState === 'listening';
    smartMusicEngine.duckAudio(shouldDuck);
  }, [isAudioPlaying, jarvisState]);

  const handleToggleAutopilot = () => {
    setIsAutopilotEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('jarvis_autopilot', String(next));
      return next;
    });
  };

  // Initialize Firebase Auth listener for Google Workspace token
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setWorkspaceUser(user);
        setWorkspaceToken(token);
      },
      () => {
        setWorkspaceUser(null);
        setWorkspaceToken(null);
      }
    );
    return () => unsub();
  }, []);

  // Load history on initial mount
  useEffect(() => {
    const saved = loadHistory();
    if (saved && saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      saveHistory(messages);
    }
  }, [messages]);

  // Periodic check for Local Windows Companion Bridge
  const checkCompanionStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch('http://127.0.0.1:7890/status', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setCompanionStatus({
          connected: true,
          info: data,
        });
      } else {
        setCompanionStatus({ connected: false });
      }
    } catch {
      setCompanionStatus({ connected: false });
    }
  }, []);

  useEffect(() => {
    checkCompanionStatus();
    const interval = setInterval(checkCompanionStatus, 15000);
    return () => clearInterval(interval);
  }, [checkCompanionStatus]);

  // Handle Speech Output
  const handleStopSpeech = useCallback(() => {
    stopAllSpeech();
    setIsAudioPlaying(false);
    if (jarvisState === 'speaking') {
      setJarvisState('idle');
    }
  }, [jarvisState]);

  const speakResponse = useCallback(
    async (text: string) => {
      handleStopSpeech();
      setIsAudioPlaying(true);
      setJarvisState('speaking');

      const onStart = () => {
        setIsAudioPlaying(true);
        setJarvisState('speaking');
      };

      const onEnd = () => {
        setIsAudioPlaying(false);
        setJarvisState('idle');
      };

      const onError = () => {
        setIsAudioPlaying(false);
        setJarvisState('idle');
      };

      if (voiceSettings.voiceEngine === 'gemini') {
        try {
          await speakWithGemini(
            text,
            voiceSettings.geminiVoice,
            onStart,
            onEnd,
            () => {
              // Fallback to browser voice if Gemini TTS fails
              speakWithBrowser(text, voiceSettings, onStart, onEnd, onError);
            }
          );
        } catch {
          speakWithBrowser(text, voiceSettings, onStart, onEnd, onError);
        }
      } else {
        speakWithBrowser(text, voiceSettings, onStart, onEnd, onError);
      }
    },
    [handleStopSpeech, voiceSettings]
  );

  // Automation Routine Execution Engine
  const handleRunRoutine = async (routine: AutomationRoutine) => {
    setIsAutomationsOpen(false);
    handleStopSpeech();

    const startMsg: Message = {
      id: `msg-routine-${Date.now()}`,
      role: 'jarvis',
      content: `⚡ **Exécution automatique : ${routine.title}**\n\n${routine.description}\n\n*Initialisation de la séquence en cours...*`,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, startMsg]);

    setActiveExecution({
      routineId: routine.id,
      currentStepIndex: 0,
      status: 'running',
      log: [`Démarrage de la routine : ${routine.title}`],
    });

    for (let i = 0; i < routine.steps.length; i++) {
      const step = routine.steps[i];
      setActiveExecution((prev) => (prev ? { ...prev, currentStepIndex: i } : null));

      if (step.type === 'speech' && step.target) {
        speakResponse(step.target);
        await new Promise((r) => setTimeout(r, 1400));
      } else if (step.type === 'protocol' && step.target) {
        try {
          window.location.href = step.target;
        } catch {}
        await new Promise((r) => setTimeout(r, 600));
      } else if (step.type === 'web' && step.target) {
        window.open(step.target, '_blank', 'noopener,noreferrer');
        await new Promise((r) => setTimeout(r, 600));
      } else if (step.type === 'powershell') {
        if (companionStatus.connected) {
          try {
            await fetch('http://127.0.0.1:7890/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'run_powershell', script: step.target }),
            });
          } catch {}
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-step-${Date.now() + i}`,
              role: 'jarvis',
              content: `Étape ${i + 1} (${step.title}) : Script PowerShell prêt.`,
              timestamp: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              actions: [
                {
                  type: 'powershell',
                  title: step.title,
                  target: step.target,
                  description: 'Script généré par l\'automatisation',
                  requiresConfirmation: false,
                },
              ],
            },
          ]);
        }
      } else if (step.type === 'timer' && step.durationSeconds) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-timer-${Date.now()}`,
            role: 'jarvis',
            content: `⏱️ **Minuteur programmé : ${Math.round(step.durationSeconds! / 60)} minutes.**\n\nMode concentration enclenché, Monsieur.`,
            timestamp: new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      }
    }

    setActiveExecution(null);
  };

  const handleStopRoutine = () => {
    setActiveExecution(null);
    handleStopSpeech();
  };

  // Ultra-Fast Streaming Message Handler via SSE
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    handleStopSpeech();
    setIsChatOverlayOpen(true);

    // 1. Check if the input is a voice automation trigger
    const matchedRoutine = matchVoiceTrigger(text, routines);
    if (matchedRoutine) {
      handleRunRoutine(matchedRoutine);
      return;
    }

    const cleanLower = text.toLowerCase().trim();

    // 2. Instant Zero-Latency Commands & Conversational Reflexes (0ms)
    if (cleanLower === 'silence' || cleanLower === 'stop' || cleanLower === 'arrête' || cleanLower === 'arrete' || cleanLower === 'tais-toi') {
      handleStopSpeech();
      return;
    }

    // Self-Programming, Self-Automation & Universal Human Competencies Reflex:
    if (
      cleanLower.includes('se programme elle') ||
      cleanLower.includes('programme toi') ||
      cleanLower.includes('programme-toi') ||
      cleanLower.includes('auto-programmation') ||
      cleanLower.includes('auto programmation') ||
      cleanLower.includes('s\'automatise elle') ||
      cleanLower.includes('automatise toi') ||
      cleanLower.includes('competence humaine') ||
      cleanLower.includes('compétence humaine') ||
      cleanLower.includes('competences humaines') ||
      cleanLower.includes('compétences humaines') ||
      cleanLower.includes('toutes les compétences') ||
      cleanLower.includes('tous les competence') ||
      cleanLower.includes('tout les compétence') ||
      cleanLower.includes('tout les competence')
    ) {
      setIsEvolutionOpen(true);
      const briefing = `### ⚡ MATRICE D'AUTO-PROGRAMMATION & OMNISCIENCE ACTIVÉE

Monsieur, mon architecture est désormais configurée pour **s'auto-programmer de manière totalement autonome**, **s'auto-automatiser** et mobiliser **l'intégralité des compétences humaines**.

---

### 🧬 Les 3 Piliers de l'Évolution Cognitive Opérationnels :

1. **Auto-Programmation Neurale & Méta-Code** :
   - Capacité à synthétiser son propre code source exécutable (PowerShell, Python, JavaScript, Routines JSON).
   - Génération, compilation et intégration immédiate de nouveaux modules logiciels et outils dans mon cerveau actif.
   - *Exemple : Demandez-moi d'auto-programmer un scanner de vulnérabilités ou un convertisseur de médias.*

2. **Auto-Automatisation & Pilote Proactif** :
   - Boucles autonomes de maintenance système (nettoyage temp, purge mémoire RAM, contrôle des ports).
   - Briefing matinal automatique, auto-priorisation de vos tâches et synchronisation proactive.
   - Anticipation de vos besoins sans nécessiter de configuration manuelle.

3. **Matrice Universelle des Compétences Humaines (Omniscience Polymathique)** :
   - 🔬 **Sciences Fondamentales** : Physique quantique, thermodynamique, astrophysique, biochimie, mathématiques avancées.
   - 📐 **Ingénierie & Espace** : Robotique, électronique mécatronique, avionique, propulsion, CAO.
   - 💼 **Stratégie & Finance** : Analyse boursière, valorisation financière, modélisation de bilans, négociation.
   - ⚖️ **Droit & Éloquence** : Droit constitutionnel, civil et commercial, rhétorique, synthèse de contrats.
   - 🧠 **Psychologie & Pédagogie** : Neurosciences cognitives, méthode Feynman d'apprentissage accéléré, Deep Work.
   - 🩺 **Santé & Biomédecine** : Physiologie humaine, kinésithérapie, nutrition cellulaire, bio-optimisation du sommeil.
   - 🎨 **Arts, Lettres & Philosophie** : Philosophie universelle, poésie, écriture de fiction, théorie musicale.
   - 🛡️ **Cybersécurité & IA** : Cryptographie post-quantique, analyse de binaires, reverse engineering.

---

*La Matrice d'Auto-Évolution est ouverte sur votre écran. Vous pouvez me dicter un nouveau module à auto-programmer ou lancer une consultation dans n'importe quel domaine humain.*`;

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: "💻 Auto-programmer un module d'audit système",
          description: "Génère et compile un script PowerShell d'audit complet de votre machine",
          params: { action: 'run_cmd', cmd: 'powershell -NoProfile -Command "Get-ComputerInfo | Select-Object WindowsProductName, OsHardwareAbstractionLayer, CsTotalPhysicalMemory"' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "⚡ Exécuter l'auto-maintenance (RAM & Cache)",
          description: "Purge les fichiers temporaires et optimise la mémoire de travail",
          params: { action: 'system_power', subaction: 'clean_temp' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "📸 Capture d'écran instantanée",
          description: "Vérifie l'état visuel du bureau Windows",
          params: { action: 'screenshot' },
          requiresConfirmation: false,
        },
      ];

      const instantMsg: Message = {
        id: `msg-evolution-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse("À vos ordres, Monsieur. Le protocole d'auto-programmation, d'auto-automatisation et d'omniscience est engagé. Je peux désormais coder mes propres modules et mobiliser toutes les compétences humaines.");
      setJarvisState('idle');
      return;
    }

    // Total PC Autopilot & Full Computer Control Activation Reflex:
    if (
      cleanLower.includes('controle de mon ordinateur') ||
      cleanLower.includes('contrôle de mon ordinateur') ||
      cleanLower.includes('automatisation au controle') ||
      cleanLower.includes('automatisation au contrôle') ||
      cleanLower.includes('faire tout ce que je') ||
      cleanLower.includes('prends le controle de mon pc') ||
      cleanLower.includes('prends le contrôle de mon pc') ||
      cleanLower.includes('active l\'autopilote') ||
      cleanLower.includes('pilote automatique pc')
    ) {
      setIsAutopilotEnabled(true);
      const bridgeConnected = companionStatus.connected;
      const speechText = bridgeConnected
        ? "À vos ordres, Monsieur. Le contrôle de votre ordinateur et le pilote automatique sont désormais activés. Je suis prêt à exécuter immédiatement tout ce que vous me demanderez."
        : "À vos ordres, Monsieur. Le mode de contrôle total et le pilote automatique sont engagés. Pour relier le système à vos applications Windows, assurez-vous que le script du pont local est démarré.";

      const statusBadge = bridgeConnected
        ? '🟢 **PONT WINDOWS CONNECTÉ (PORT 7890)** : Exécution directe en 0ms.'
        : '🟡 **PONT WINDOWS EN ATTENTE (PORT 7890)** : Téléchargez ou lancez `start_jarvis_bridge.bat` pour lier votre machine.';

      const briefing = `### ⚡ PROTOCOLE DE CONTRÔLE TOTAL DU PC ACTIVÉ

${statusBadge}

Monsieur, l'automatisation est maintenant portée au **contrôle direct de votre ordinateur**. Le mode **Auto-Pilote** est enclenché.

---

### 🛡️ Éventail des Capacités Opérationnelles :
1. **Lancement instantané de logiciels & sites** :
   - *« Ouvre Chrome »*, *« Lance VS Code »*, *« Ouvre Discord »*, *« Lance Spotify »*, *« Ouvre YouTube »*, *« Lance le Terminal »*
2. **Gestion Multimédia & Audio** :
   - *« Coupe le son »*, *« Monte le volume »*, *« Baisse le son »*, *« Mets pause »*, *« Musique suivante »*
3. **Capture d'Écran Haute Résolution** :
   - *« Fais une capture d'écran »*, *« Screenshot »* *(sauvegarde automatique dans vos Images)*
4. **Surveillance & Gestion des Processus** :
   - *« Liste les processus actifs »*, *« Tue le processus chrome »*, télémétrie CPU/RAM en direct dans le réacteur Arc
5. **Exploration & Navigation Fichiers** :
   - *« Ouvre mon Bureau »*, *« Ouvre les Téléchargements »*, *« Ouvre mes Documents »*
6. **Maintenance & Nettoyage Système** :
   - *« Vide la corbeille »*, *« Nettoie les fichiers temporaires »*, *« Purge le cache DNS »*, *« Verrouille mon PC »*
7. **Exécution de Scripts & Commandes PowerShell** :
   - Exécution de commandes et scripts personnalisés sur mesure avec rendu des sorties en temps réel.

---

*Vous pouvez me dicter vos ordres par la voix ou par écrit : je les exécuterai immédiatement sans aucune friction.*`;

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: "📸 Faire une capture d'écran",
          description: "Prend un instantané de votre écran et l'enregistre dans vos Images",
          params: { action: 'screenshot' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "⚡ Lister les processus actifs",
          description: "Analyse en temps réel les processus les plus gourmands en RAM/CPU",
          params: { action: 'get_processes' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "🌐 Ouvrir Google Chrome",
          description: "Lance le navigateur web Chrome",
          params: { action: 'open_app', target: 'chrome' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "💻 Ouvrir Visual Studio Code",
          description: "Ouvre votre environnement de développement VS Code",
          params: { action: 'open_app', target: 'code' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "🔊 Basculer le son (Mute/Unmute)",
          description: "Coupe ou réactive le son système de Windows",
          params: { action: 'media_control', subaction: 'mute' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "📁 Ouvrir le dossier Téléchargements",
          description: "Ouvre l'Explorateur Windows sur vos téléchargements",
          params: { action: 'open_folder', folder: 'downloads' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "🧹 Vider la corbeille Windows",
          description: "Libère immédiatement de l'espace disque",
          params: { action: 'system_power', subaction: 'empty_recycle_bin' },
          requiresConfirmation: true,
        },
      ];

      const instantMsg: Message = {
        id: `msg-pc-control-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse(speechText);
      setJarvisState('idle');
      return;
    }

    // Smart Musique & Acoustic Matrix Reflex (0ms Zero-Latency Execution):
    if (
      cleanLower.includes('smart musique') ||
      cleanLower.includes('ajoute smart musique') ||
      cleanLower === 'musique' ||
      cleanLower.includes('mets de la musique') ||
      cleanLower.includes('met de la musique') ||
      cleanLower.includes('lance de la musique') ||
      cleanLower.includes('joue de la musique') ||
      cleanLower.includes('lance la musique') ||
      cleanLower.includes('mets la musique') ||
      cleanLower.includes('ambiance sonore') ||
      cleanLower.includes('musique focus') ||
      cleanLower.includes('musique rock') ||
      cleanLower.includes('musique lofi') ||
      cleanLower.includes('mode stark lab') ||
      cleanLower.includes('ouvre spotify') ||
      cleanLower.includes('lance spotify')
    ) {
      setIsSmartMusicOpen(true);

      let selectedMood: 'stark_lab' | 'deep_focus' | 'iron_flight' | 'night_lounge' = 'stark_lab';
      if (cleanLower.includes('focus') || cleanLower.includes('code') || cleanLower.includes('calme')) {
        selectedMood = 'deep_focus';
      } else if (cleanLower.includes('flight') || cleanLower.includes('vol') || cleanLower.includes('action') || cleanLower.includes('combat')) {
        selectedMood = 'iron_flight';
      } else if (cleanLower.includes('lofi') || cleanLower.includes('détente') || cleanLower.includes('detente') || cleanLower.includes('relax') || cleanLower.includes('soir')) {
        selectedMood = 'night_lounge';
      }

      smartMusicEngine.setMood(selectedMood);
      const track = smartMusicEngine.getCurrentTrack();

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: '🎵 Ouvrir Spotify sur votre PC',
          description: 'Lance le lecteur Spotify sur Windows',
          params: { action: 'open_app', target: 'spotify' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: '🌐 Ouvrir YouTube Music',
          description: 'Ouvre YouTube Music dans votre navigateur',
          params: { action: 'open_app', target: 'https://music.youtube.com' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: '⏯️ Basculer Play / Pause Média',
          description: 'Touche multimédia Windows Play/Pause',
          params: { action: 'media_control', subaction: 'play_pause' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: '⏭️ Morceau suivant',
          description: 'Passe à la piste suivante sur votre PC',
          params: { action: 'media_control', subaction: 'next' },
          requiresConfirmation: false,
        },
      ];

      const briefing = `### 🎵 JARVIS // MODULE SMART MUSIQUE ACTIVÉ

Monsieur, le système acoustique intelligent **Smart Musique** a été initialisé avec succès.

---

### 🔊 Statut du Flux Sonore :
- **Piste active** : **${track.title}** (${track.artist})
- **Ambiance calibrée** : \`${selectedMood.toUpperCase()}\`
- **Moteur Audio** : ${track.type === 'procedural' ? 'Synthétiseur Neurale Web Audio (Procédural continu)' : 'Flux Audio Haute Définition'}
- **Cadence** : ${track.bpm} BPM
- **Atténuation Vocale Intelligente (Audio Ducking)** : \`ACTIVE\` *(Le niveau sonore est automatiquement atténué à 15% quand vous me parlez ou que je vous réponds).*

---

*L'interface Smart Musique est ouverte sur votre écran. Vous pouvez sélectionner les 4 modes d'ambiance (Stark Lab, Deep Focus, Iron Flight, Night Lounge) ou piloter directement Spotify et YouTube Music sur votre machine.*`;

      const instantMsg: Message = {
        id: `msg-music-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse(`À vos ordres, Monsieur. Le système Smart Musique est activé. Démarrage de l'ambiance sonore ${track.title}. L'atténuation vocale est active.`);
      setJarvisState('idle');
      return;
    }

    // Frontier GPT-6 Omni-Reasoning Reflex:
    if (
      cleanLower.includes('gpt6') ||
      cleanLower.includes('gpt 6') ||
      cleanLower.includes('gpt-6') ||
      cleanLower.includes('raisonnement profond') ||
      cleanLower.includes('pensée profonde') ||
      cleanLower.includes('chain of thought') ||
      cleanLower.includes('chaine de pensée') ||
      cleanLower.includes('chaîne de pensée') ||
      cleanLower.includes('essaim d\'agents') ||
      cleanLower.includes('agent swarm') ||
      cleanLower.includes('omni-reasoning')
    ) {
      setIsGpt6Open(true);
      const briefing = `### 🧠 JARVIS // MATRICE COGNITIVE FRONTIER GPT-6 INITIALISÉE

Monsieur, l'intégralité des **capacités cognitives de génération Frontier GPT-6** est désormais opérationnelle au sein de mon architecture.

---

### 🧬 Les 4 Piliers Cognitifs GPT-6 Opérationnels :

1. **Pensée Délibérée & Chaîne de Pensée Multi-Étapes (*Deep Thought / Extended Reasoning*)** :
   - Raisonnement déductif itératif, exploration d'arbres d'hypothèses (*Tree-of-Thoughts*) et vérification formelle rigoureuse.
   - Tracé complet de la délibération interne consultable étape par étape (Cadrage, Hypothèses, Réfutation des contre-exemples, Synthèse finale).

2. **Vision Omnimodale & Sensorielle Haute Résolution** :
   - Ingestion et inspection d'images, de documents et de schémas techniques au pixel près.
   - Synchronisation avec la **capture d'écran PC** via le pont Windows pour auditer votre bureau ou vos interfaces logicielles en temps réel.

3. **Essaim d'Agents Autonomes (*Agent Swarm Architecture*)** :
   - Coordination instantanée de 4 sous-agents spécialisés pour chaque défi :
     - 🏛️ **Architecte Neurale** : Modélisation structurelle et vision d'ensemble.
     - ⚙️ **Ingénieur d'Exécution** : Résolution mathématique, algorithmique et code sans compromis.
     - 🛡️ **Auditeur Sécurité & Biais** : Traque des failles, cas limites et auto-critique impitoyable.
     - 💎 **Synthétiseur Stratégique** : Restitution limpide et prête à l'action pour Monsieur.

4. **Bac à Sable de Code & Auto-Débogage Intégré** :
   - Synthèse de scripts Python, PowerShell et JavaScript complets avec validation syntaxique.
   - Bouton d'exécution locale immédiate en 1 clic sur votre PC.

---

*La Matrice Cognitive GPT-6 est ouverte sur votre écran. Vous pouvez soumettre une requête complexe, charger une image ou sélectionner un défi préconfiguré.*`;

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: "📸 Capture d'écran pour inspection visuelle",
          description: "Capture l'écran actuel et l'envoie au cortex visuel GPT-6",
          params: { action: 'screenshot' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "💻 Lancer un audit système par essaim d'agents",
          description: "Exécute une analyse des processus et de l'intégrité de la machine",
          params: { action: 'get_processes' },
          requiresConfirmation: false,
        },
      ];

      const instantMsg: Message = {
        id: `msg-gpt6-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse("À vos ordres, Monsieur. Les capacités cognitives Frontier GPT-6 sont engagées. La matrice de délibération profonde, de vision omnimodale et d'essaim d'agents est ouverte sur votre écran.");
      setJarvisState('idle');
      return;
    }

    // Live Screen Vision & Optical Cortex Reflex:
    if (
      cleanLower.includes('vu de jarvis') ||
      cleanLower.includes('vue de jarvis') ||
      cleanLower.includes('vue jarvis') ||
      cleanLower.includes('vision de jarvis') ||
      cleanLower.includes('vision écran') ||
      cleanLower.includes('vision ecran') ||
      cleanLower.includes('regarde mon écran') ||
      cleanLower.includes('regarde l\'écran') ||
      cleanLower.includes('regarde mon ecran') ||
      cleanLower.includes('vois tout sur l') ||
      cleanLower.includes('voir tout sur l') ||
      cleanLower.includes('qu\'est-ce que tu vois') ||
      cleanLower.includes('qu\'est ce que tu vois') ||
      cleanLower.includes('analyse mon écran') ||
      cleanLower.includes('analyse mon ecran') ||
      cleanLower.includes('scan l\'écran')
    ) {
      setIsVisionOpen(true);
      const briefing = `### 👁️ JARVIS // CORTEX OCULAIRE & VISION EN DIRECT INITIALISÉ

Monsieur, mes capteurs visuels sont connectés à votre affichage. Je suis désormais en mesure de **voir tout ce qui s'affiche sur votre écran en temps réel**.

---

### 🔍 Fonctionnalités Oculaires Activées :
1. **Transmission Vidéo Haute Résolution (DisplayMedia 30 FPS)** :
   - Flux d'écran capturé en direct directement depuis votre navigateur en 1 clic sans logiciel tiers.
2. **Reconnaissance Visuelle Multimodale Gemini 3.8** :
   - Identification des fenêtres ouvertes (VS Code, Chrome, Terminal, Discord, Explorateur...).
   - Extraction optique des textes et lignes de code (**OCR haute fidélité**).
   - Détection proactive des messages d'erreur, des exceptions de compilation et des anomalies visuelles.
3. **Surveillance Continue (Auto-Watch)** :
   - Mode de veille active analysant automatiquement votre progression toutes les 25 secondes pour vous assister sans interruption.
4. **Interconnexion Pont Windows** :
   - Possibilité de prendre une capture d'écran OS globale et de piloter les fenêtres directement.

---

*Le panneau de vision oculaire est ouvert. Cliquez sur **« ACTIVER LA VUE DE JARVIS EN DIRECT »** pour partager votre écran ou demandez-moi une analyse.*`;

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: "📸 Capture d'écran instantanée",
          description: "Effectue un instantané de votre bureau via le pont local",
          params: { action: 'screenshot' },
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "⚡ Lister les fenêtres et processus actifs",
          description: "Vérifie les logiciels actuellement en cours d'exécution",
          params: { action: 'get_processes' },
          requiresConfirmation: false,
        },
      ];

      const instantMsg: Message = {
        id: `msg-vision-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse("À vos ordres, Monsieur. Mon cortex visuel est en ligne. J'ouvre la matrice de vision pour observer l'intégralité de votre écran.");
      setJarvisState('idle');
      return;
    }

    // 1. Simplified Interface & Memory Activation Reflex:
    if (
      cleanLower.includes("change l'interface") ||
      cleanLower.includes("change interface") ||
      cleanLower.includes("interface simple") ||
      cleanLower.includes("un truc simple") ||
      cleanLower.includes("simplifie l'interface") ||
      (cleanLower.includes("simple") && cleanLower.includes("memoire")) ||
      (cleanLower.includes("simple") && cleanLower.includes("mémoire"))
    ) {
      setLeftTab('memory');

      const briefing = `### ⚡ INTERFACE PURIFIÉE & BANQUE DE MÉMOIRE DÉPLOYÉE

Monsieur, votre directive a été appliquée sur l'ensemble de l'interface : **une ergonomie épurée et limpide, réunissant 100% de vos technologies sans surcharge**.

---

### 🧠 1. Mémoire Active Intégrée (Panneau de gauche) :
- Vos souvenirs, préférences et directives sont désormais **directement visibles et éditables en direct** sans passer par un menu caché.
- Vous disposez du champ de saisie rapide \`+ Retenir\` pour graver un souvenir instantanément.
- Vous pouvez me dire à tout moment par la voix ou par écrit :
  - *« Retiens que je préfère le code en TypeScript »*
  - *« Mémorise mon projet prioritaire : refonte de l'application »*
  - *« Souviens-toi de ma directive : toujours être concis »*

---

### 🎛️ 2. Console à 3 Volets Épurés :
- ⚡ **RÉACTEUR** : Le Cœur Arc Reactor interactif et la surveillance des ressources PC (CPU & RAM).
- 🧠 **MÉMOIRE** : La liste complète de vos faits enregistrés, avec filtres par catégorie (Préférence, Directive, Projet, Fait).
- 🚀 **MODULES** : Accès direct en 1 clic à la **Vue Écran**, **Smart Musique**, **GPT-6 Omni**, **Auto-Évolution**, **Routines Windows** et **Google Workspace**.

*L'onglet Mémoire est ouvert sur votre gauche, Monsieur. Tout est prêt.*`;

      const actionsList: WindowsAction[] = [
        {
          type: 'companion',
          title: "🧠 Ouvrir la banque de mémoire complète",
          description: "Affiche le gestionnaire de mémoire persistant",
          params: {},
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "👁️ Activer la vue d'écran",
          description: "Ouvre le cortex oculaire de vision en direct",
          params: {},
          requiresConfirmation: false,
        },
        {
          type: 'companion',
          title: "🎵 Démarrer Smart Musique",
          description: "Active l'ambiance sonore Stark Lab",
          params: {},
          requiresConfirmation: false,
        },
      ];

      const instantMsg: Message = {
        id: `msg-ui-mem-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: actionsList,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse("Interface simplifiée et banque de mémoire activées, Monsieur. Vous disposez de toutes vos fonctionnalités de pointe dans un espace épuré.");
      setJarvisState('idle');
      return;
    }

    // 2. Direct Memory Memorize Reflex:
    if (
      cleanLower.startsWith('retiens') ||
      cleanLower.startsWith('mémorise') ||
      cleanLower.startsWith('memorise') ||
      cleanLower.startsWith('rappelle-toi') ||
      cleanLower.startsWith('souviens-toi') ||
      cleanLower.includes('ajoute une mémoire') ||
      cleanLower.includes('ajoute une memoire') ||
      cleanLower.includes('ajoute à ta mémoire') ||
      cleanLower.includes('ajoute a ta memoire') ||
      cleanLower.includes('garde en mémoire') ||
      cleanLower.includes('enregistre en mémoire')
    ) {
      let factText = text
        .replace(/^(?:ajoute\s+(?:une\s+)?m[ée]moire(?:\s*[:,-]\s*|\s+)?|retiens(?:\s+que)?|m[ée]morise(?:\s+que)?|rappelle-toi(?:\s+que)?|souviens-toi(?:\s+que)?|garde\s+en\s+m[ée]moire(?:\s+que)?|enregistre\s+en\s+m[ée]moire(?:\s+que)?)\s*/i, '')
        .trim();

      if (!factText) {
        factText = 'Instruction utilisateur enregistrée.';
      }

      // Automatically deduce category based on phrasing
      let cat: MemoryItem['category'] = 'fact';
      const factLower = factText.toLowerCase();
      if (factLower.includes('ne pas') || factLower.includes('jamais') || factLower.includes('toujours') || factLower.includes('règle') || factLower.includes('directive')) {
        cat = 'directive';
      } else if (factLower.includes('préfère') || factLower.includes('prefere') || factLower.includes('aime') || factLower.includes('adore') || factLower.includes('couleur') || factLower.includes('style')) {
        cat = 'preference';
      } else if (factLower.includes('code') || factLower.includes('projet') || factLower.includes('react') || factLower.includes('typescript') || factLower.includes('dev') || factLower.includes('app')) {
        cat = 'project';
      } else if (factLower.includes('je suis') || factLower.includes('mon nom') || factLower.includes('habite') || factLower.includes('famille')) {
        cat = 'personal';
      }

      const newMem: MemoryItem = {
        id: `mem-${Date.now()}`,
        content: factText,
        category: cat,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      const updatedMemories = [newMem, ...memories];
      setMemories(updatedMemories);
      saveMemories(updatedMemories);
      setLeftTab('memory');

      const briefing = `### 🧠 JARVIS // FAIT GRAVÉ DANS LA MÉMOIRE PERMANENTE

Monsieur, l'information suivante a été inscrite avec succès au cœur de mes réseaux neuronaux :

---

- 📌 **Contenu mémorisé** : **« ${factText} »**
- 🏷️ **Catégorie attribuée** : \`${cat.toUpperCase()}\`
- ⚡ **Statut** : \`ACTIF (Injecté automatiquement dans mon prompt pour toutes nos requêtes)\`
- 🔢 **Total souvenirs actifs** : ${updatedMemories.filter((m) => m.isActive).length}

*Le volet de mémoire a été activé sur votre gauche pour que vous puissiez consulter ou ajuster vos données à tout instant.*`;

      const instantMsg: Message = {
        id: `msg-mem-add-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse(`C'est gravé dans ma mémoire permanente, Monsieur : ${factText}.`);
      setJarvisState('idle');
      return;
    }

    // 3. Memory Inquire Reflex:
    if (
      cleanLower.includes("qu'as-tu en mémoire") ||
      cleanLower.includes("qu'est-ce que tu as en mémoire") ||
      cleanLower.includes("qu est ce que tu as en memoire") ||
      cleanLower.includes("montre ma mémoire") ||
      cleanLower.includes("affiche ma mémoire") ||
      cleanLower.includes("liste mes mémoires") ||
      cleanLower === 'mémoire' ||
      cleanLower === 'memoire'
    ) {
      setLeftTab('memory');
      const activeList = memories.filter((m) => m.isActive);

      const briefing = `### 🧠 JARVIS // CONSULTATION DE LA BANQUE DE MÉMOIRE

Monsieur, voici l'état actuel de ma mémoire à votre sujet (${activeList.length} souvenir${activeList.length > 1 ? 's' : ''} actif${activeList.length > 1 ? 's' : ''}) :

${
  activeList.length === 0
    ? '*Aucun souvenir actuellement consigné. Dites-moi simplement « Retiens que... » pour en enregistrer un.*'
    : activeList
        .map(
          (m, idx) =>
            `${idx + 1}. [**${m.category.toUpperCase()}**] ${m.content} *(enregistré le ${new Date(
              m.createdAt
            ).toLocaleDateString('fr-FR')})*`
        )
        .join('\n')
}

---

*Le panneau de gestion de mémoire est affiché sur votre gauche. Vous pouvez y ajouter, modifier ou désactiver n'importe quel souvenir en direct.*`;

      const instantMsg: Message = {
        id: `msg-mem-list-${Date.now()}`,
        role: 'jarvis',
        content: briefing,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);

      speakResponse(`Vous avez ${activeList.length} souvenirs actifs dans ma mémoire, Monsieur. Le panneau est ouvert à gauche.`);
      setJarvisState('idle');
      return;
    }

    // Instant Natural Language PC Control & Total Automation Reflex:
    const pcCmd = parsePcCommand(text);
    if (pcCmd) {
      if (companionStatus.connected) {
        setJarvisState('thinking');
        const result = await sendBridgeCommand(pcCmd.payload);

        let replyContent = '';
        if (result.success) {
          if (pcCmd.type === 'process_list' && Array.isArray(result.processes)) {
            replyContent = `⚡ **Processus Actifs sur votre PC :**\n\n| PID | Processus | RAM (Mo) | CPU (s) |\n|---|---|---|---|\n` +
              result.processes.map((p: any) => `| ${p.Id} | **${p.ProcessName}** | ${p.RAM_MB} Mo | ${p.CPU_s}s |`).join('\n') +
              `\n\n*Opération système exécutée directement via le pont local.*`;
          } else if (pcCmd.type === 'screenshot' && result.path) {
            replyContent = `📸 **Capture d'écran effectuée avec succès, Monsieur !**\n\nFichier sauvegardé sur votre PC :\n\`${result.path}\``;
          } else {
            replyContent = `✅ **Action PC Exécutée : ${pcCmd.description}**\n\n${result.message || 'Commande appliquée avec succès sur votre ordinateur, Monsieur.'}`;
          }
        } else {
          replyContent = `⚠️ **Erreur lors de l'exécution sur votre PC :** ${result.error || 'Commande non traitée'}`;
        }

        const instantMsg: Message = {
          id: `msg-instant-${Date.now()}`,
          role: 'jarvis',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
          instantMsg,
        ]);

        speakResponse(result.success ? pcCmd.confirmationSpeech : "Une erreur est survenue lors de l'opération sur votre PC.");
        setJarvisState('idle');
        return;
      } else {
        const promptBridge = `Monsieur, pour exécuter l'action "${pcCmd.description}" directement sur votre ordinateur, activez le compagnon Windows (script local sur le port 7890).`;
        const instantMsg: Message = {
          id: `msg-instant-${Date.now()}`,
          role: 'jarvis',
          content: `💻 **Contrôle PC Prêt (Pont Requis)**\n\n${promptBridge}\n\n*Lancez \`start_jarvis_bridge.bat\` ou cliquez sur le bouton ci-dessous pour un contrôle 100% automatique de votre machine.*`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          actions: [{
            type: 'companion',
            title: pcCmd.description,
            description: 'Exécuter dès que le pont est actif',
            params: pcCmd.payload,
            requiresConfirmation: false,
          }],
        };
        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
          instantMsg,
        ]);
        speakResponse("Veuillez activer le pont Windows pour que je puisse contrôler votre ordinateur automatiquement.");
        return;
      }
    }

    // Instant Reflex: Salutations
    if (
      cleanLower === 'bonjour' ||
      cleanLower === 'salut' ||
      cleanLower === 'hello' ||
      cleanLower === 'hey' ||
      cleanLower === 'bonjour jarvis' ||
      cleanLower === 'salut jarvis'
    ) {
      const instantReply = `Bonjour ${userProfile.name || 'Monsieur'}. Tous les systèmes sont parés. Que faisons-nous ?`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: instantReply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Instant Reflex: Identité & Rôle
    if (
      cleanLower.includes('qui es-tu') ||
      cleanLower.includes('tu es qui') ||
      cleanLower.includes('présente-toi') ||
      cleanLower.includes('qui est tu')
    ) {
      const instantReply = `Je suis J.A.R.V.I.S., votre assistant personnel d'ingénierie et de productivité, ${userProfile.name || 'Monsieur'}.`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: instantReply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Instant Reflex: État & Statut
    if (
      cleanLower.includes('état') ||
      cleanLower.includes('statut') ||
      cleanLower.includes('comment vas-tu') ||
      cleanLower.includes('ca va') ||
      cleanLower.includes('ça va') ||
      cleanLower.includes('système')
    ) {
      const instantReply = `Réacteur Arc stabilisé, modules connectés et synchronisation active, ${userProfile.name || 'Monsieur'}.`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: instantReply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Instant Reflex: Heure
    if (cleanLower.includes('heure') || cleanLower.includes('quelle heure')) {
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const instantReply = `Il est actuellement ${timeStr}, ${userProfile.name || 'Monsieur'}.`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: instantReply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Instant Reflex: Politesse
    if (cleanLower === 'merci' || cleanLower === 'super' || cleanLower === 'parfait' || cleanLower === 'merci jarvis') {
      const instantReply = `À votre service, ${userProfile.name || 'Monsieur'}.`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: instantReply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    if (cleanLower.includes('calculatrice') || cleanLower === 'calc') {
      window.location.href = 'calculator:';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Calculatrice Windows lancée, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Calculatrice Windows',
          target: 'calculator:',
          description: 'Application calculatrice',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Calculatrice Windows lancée, Monsieur.');
      return;
    }

    if (cleanLower.includes('vs code') || cleanLower.includes('vscode') || cleanLower.includes('visual studio code')) {
      window.location.href = 'vscode://';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Visual Studio Code lancé, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Visual Studio Code',
          target: 'vscode://',
          description: 'Éditeur de code',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Visual Studio Code lancé, Monsieur.');
      return;
    }

    if (cleanLower.includes('spotify')) {
      window.location.href = 'spotify:';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Spotify lancé, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Spotify',
          target: 'spotify:',
          description: 'Lecteur audio',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Spotify lancé, Monsieur.');
      return;
    }

    if (cleanLower.includes('paramètres') || cleanLower.includes('parametres') || cleanLower.includes('settings')) {
      window.location.href = 'ms-settings:';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Paramètres Windows ouverts, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Paramètres Windows',
          target: 'ms-settings:',
          description: 'Panneau de configuration',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Paramètres Windows ouverts, Monsieur.');
      return;
    }

    if (cleanLower.includes('terminal') || cleanLower === 'cmd') {
      window.location.href = 'wt:';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Windows Terminal ouvert, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Windows Terminal',
          target: 'wt:',
          description: 'Console système',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Windows Terminal ouvert, Monsieur.');
      return;
    }

    if (cleanLower.includes('bloc-notes') || cleanLower.includes('bloc notes') || cleanLower === 'notepad') {
      window.location.href = 'notepad:';
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Bloc-notes Windows ouvert, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'protocol',
          title: 'Bloc-notes Windows',
          target: 'notepad:',
          description: 'Éditeur de texte',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Bloc-notes Windows ouvert, Monsieur.');
      return;
    }

    if (cleanLower.includes('youtube')) {
      window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'YouTube ouvert dans un nouvel onglet, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'web',
          title: 'YouTube',
          target: 'https://www.youtube.com',
          description: 'Plateforme vidéo',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('YouTube ouvert, Monsieur.');
      return;
    }

    if (cleanLower.includes('google') && !cleanLower.includes('docs')) {
      window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Google ouvert, Monsieur.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: [{
          type: 'web',
          title: 'Google',
          target: 'https://www.google.com',
          description: 'Moteur de recherche',
          requiresConfirmation: false,
        }],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Google ouvert, Monsieur.');
      return;
    }

    if (cleanLower.includes('arsenal') || cleanLower === 'compétences' || cleanLower === 'competences' || cleanLower === 'tout faire') {
      setIsArsenalOpen(true);
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: 'Voici l\'Arsenal complet de mes capacités, Monsieur : Études, Mathématiques, Programmation, Tâches et Contrôle PC.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse('Arsenal des capacités ouvert, Monsieur.');
      return;
    }

    // Instant Reflex: Ajout de tâche vocale / écrite
    if (cleanLower.startsWith('ajoute la tâche') || cleanLower.startsWith('ajoute une tâche') || cleanLower.startsWith('ajoute tâche')) {
      const taskTitle = text.replace(/^ajoute\s+(la|une)?\s*tâche\s*:?/i, '').trim() || 'Nouvelle tâche';
      const newTask: JarvisTask = {
        id: `task-${Date.now()}`,
        title: taskTitle,
        completed: false,
        priority: 'high',
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveTasks(updated);

      const instantReply = `Tâche enregistrée dans votre to-do list : "${taskTitle}".`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: `✅ **Tâche ajoutée avec succès !**\n\n📌 **${taskTitle}**\n\nRetrouvez-la dans l'Arsenal ou le panneau des tâches.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Instant Reflex: Prise de note vocale / écrite
    if (cleanLower.startsWith('prends note') || cleanLower.startsWith('crée une note') || cleanLower.startsWith('note :')) {
      const noteContent = text.replace(/^(prends\s+note|crée\s+une\s+note|note)\s*:?/i, '').trim() || 'Mémo';
      const newNote: QuickNote = {
        id: `note-${Date.now()}`,
        title: noteContent.slice(0, 30) + (noteContent.length > 30 ? '...' : ''),
        content: noteContent,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(updated);

      const instantReply = `Note consignée dans votre bloc-notes JARVIS.`;
      const instantMsg: Message = {
        id: `msg-instant-${Date.now()}`,
        role: 'jarvis',
        content: `📝 **Note enregistrée dans vos archives :**\n\n> "${noteContent}"`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
        instantMsg,
      ]);
      speakResponse(instantReply);
      return;
    }

    // Direct Google Workspace Reflexes: Zero External Links, 100% Automatic!
    if (
      cleanLower.includes('mail') ||
      cleanLower.includes('email') ||
      cleanLower.includes('courriel')
    ) {
      if (
        cleanLower.includes('lis') ||
        cleanLower.includes('voir') ||
        cleanLower.includes('affiche') ||
        cleanLower.includes('reçus') ||
        cleanLower.includes('recus') ||
        cleanLower.includes('nouveaux') ||
        cleanLower.includes('boite') ||
        cleanLower.includes('boîte') ||
        cleanLower.includes('inbox') ||
        cleanLower.includes('mes mails') ||
        cleanLower.includes('mes emails') ||
        cleanLower === 'mes messages'
      ) {
        if (!workspaceToken) {
          const promptConnect = `Monsieur, votre compte Google Workspace n'est pas encore synchronisé. Veuillez connecter votre adresse e-mail via le bouton "GOOGLE / EMAIL" en haut afin que je puisse accéder automatiquement à vos e-mails sans aucun lien externe.`;
          setIsWorkspaceOpen(true);
          const instantMsg: Message = {
            id: `msg-instant-${Date.now()}`,
            role: 'jarvis',
            content: `🔒 **Connexion Google requise**\n\n${promptConnect}`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            actions: [{
              type: 'workspace',
              title: 'Connecter mon compte Google',
              description: 'Activer la synchronisation directe de Gmail et Calendar',
              requiresConfirmation: false,
            }],
          };
          setMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
            instantMsg,
          ]);
          speakResponse("Veuillez connecter votre compte Google pour que je puisse lire vos e-mails directement.");
          return;
        }

        try {
          setJarvisState('thinking');
          const msgs = await fetchRecentEmails(4);
          let responseText = '';
          if (msgs.length === 0) {
            responseText = `Monsieur, votre boîte de réception Gmail (${workspaceUser?.email}) ne contient aucun nouvel e-mail récent.`;
          } else {
            responseText = `📬 **Derniers e-mails de votre boîte Gmail (${workspaceUser?.email}) :**\n\n` +
              msgs.map((m, i) => `${i + 1}. **${m.subject}**\n   *De : ${m.from}*\n   > "${m.snippet}"`).join('\n\n') +
              `\n\n*Lecture automatique effectuée directement sans aucun lien externe.*`;
          }
          const instantMsg: Message = {
            id: `msg-instant-${Date.now()}`,
            role: 'jarvis',
            content: responseText,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            actions: [{
              type: 'workspace',
              title: 'Ouvrir le panneau Gmail',
              description: 'Consulter tous les e-mails ou rédiger une réponse',
              requiresConfirmation: false,
            }],
          };
          setMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
            instantMsg,
          ]);
          speakResponse(msgs.length > 0 ? `Vous avez ${msgs.length} e-mails récents. Le premier provient de ${msgs[0].from.split('<')[0]}.` : "Aucun e-mail récent dans votre boîte.");
          return;
        } catch (e: any) {
          console.warn('Workspace Gmail fetch error:', e);
        }
      }
    }

    // Direct Calendar Reflex:
    if (
      cleanLower.includes('agenda') ||
      cleanLower.includes('calendrier') ||
      cleanLower.includes('rendez-vous') ||
      cleanLower.includes('rendez vous') ||
      cleanLower.includes('planning') ||
      cleanLower.includes('réunion') ||
      cleanLower.includes('reunion')
    ) {
      if (
        cleanLower.includes('affiche') ||
        cleanLower.includes('voir') ||
        cleanLower.includes('mon') ||
        cleanLower.includes('mes') ||
        cleanLower.includes('prochain') ||
        cleanLower.includes('quoi')
      ) {
        if (!workspaceToken) {
          setIsWorkspaceOpen(true);
          const promptConnect = `Monsieur, veuillez synchroniser votre compte Google pour afficher votre agenda directement dans l'interface sans lien externe.`;
          const instantMsg: Message = {
            id: `msg-instant-${Date.now()}`,
            role: 'jarvis',
            content: `📅 **Connexion Google Calendar requise**\n\n${promptConnect}`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            actions: [{
              type: 'workspace',
              title: 'Connecter Google Calendar',
              description: 'Synchroniser mon agenda',
              requiresConfirmation: false,
            }],
          };
          setMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
            instantMsg,
          ]);
          speakResponse("Veuillez synchroniser votre compte Google pour consulter votre agenda.");
          return;
        }

        try {
          setJarvisState('thinking');
          const evts = await fetchUpcomingEvents(4);
          let responseText = '';
          if (evts.length === 0) {
            responseText = `Monsieur, vous n'avez aucun événement à venir programmé sur votre calendrier.`;
          } else {
            responseText = `📅 **Vos prochains rendez-vous sur Google Calendar :**\n\n` +
              evts.map((ev, i) => `${i + 1}. **${ev.summary}**\n   *Heure : ${ev.start ? new Date(ev.start).toLocaleString('fr-FR') : 'Non spécifiée'}*${ev.description ? `\n   >${ev.description}` : ''}`).join('\n\n');
          }
          const instantMsg: Message = {
            id: `msg-instant-${Date.now()}`,
            role: 'jarvis',
            content: responseText,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            actions: [{
              type: 'workspace',
              title: 'Panneau Calendrier',
              description: 'Planifier un nouvel événement',
              requiresConfirmation: false,
            }],
          };
          setMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
            instantMsg,
          ]);
          speakResponse(evts.length > 0 ? `Votre prochain rendez-vous est : ${evts[0].summary}.` : "Aucun événement prévu sur votre agenda.");
          return;
        } catch (e: any) {
          console.warn('Calendar fetch error:', e);
        }
      }
    }

    // 3. General AI Streaming Request (Lite Model)
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setJarvisState('thinking');

    const jarvisMsgId = `msg-${Date.now() + 1}`;
    const initialJarvisMsg: Message = {
      id: jarvisMsgId,
      role: 'jarvis',
      content: '',
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, initialJarvisMsg]);

    try {
      const activeMemories = memories.filter((m) => m.isActive);

      // Connect to SSE stream
      const response = await fetch('/api/jarvis/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.rawContent || m.content }],
          })),
          userProfile,
          memories: activeMemories,
          enableSearch,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Erreur de flux');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullCollectedText = '';
      let finalActions: WindowsAction[] = [];
      let finalSources: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'chunk' && data.text) {
                fullCollectedText += data.text;
                const cleanedPartial = fullCollectedText
                  .replace(/```action[\s\S]*?```/g, '')
                  .trim();

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === jarvisMsgId
                      ? { ...m, content: cleanedPartial || fullCollectedText }
                      : m
                  )
                );
              } else if (data.type === 'done') {
                finalActions = data.actions || [];
                finalSources = data.sources || [];
                const finalCleaned = (data.text || fullCollectedText)
                  .replace(/```action[\s\S]*?```/g, '')
                  .trim();

                // Auto-sync tasks/notes if action generated
                if (Array.isArray(finalActions)) {
                  for (const act of finalActions) {
                    if (act.type === 'task' && act.title) {
                      const t: JarvisTask = {
                        id: `task-${Date.now()}`,
                        title: act.title,
                        completed: false,
                        priority: 'high',
                        createdAt: new Date().toISOString(),
                      };
                      setTasks((prev) => {
                        const next = [t, ...prev];
                        saveTasks(next);
                        return next;
                      });
                    } else if (act.type === 'note' && act.title) {
                      const n: QuickNote = {
                        id: `note-${Date.now()}`,
                        title: act.title,
                        content: act.description || act.target || '',
                        updatedAt: new Date().toISOString(),
                      };
                      setNotes((prev) => {
                        const next = [n, ...prev];
                        saveNotes(next);
                        return next;
                      });
                    }
                  }
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === jarvisMsgId
                      ? {
                          ...m,
                          content: finalCleaned,
                          rawContent: data.rawText || fullCollectedText,
                          actions: finalActions,
                          sources: finalSources,
                        }
                      : m
                  )
                );

                // Autopilot execution: automatically execute non-destructive local PC actions
                if (isAutopilotEnabled && companionStatus.connected && Array.isArray(finalActions)) {
                  const autoAct = finalActions.find((a) => !a.requiresConfirmation && (a.type === 'powershell' || a.type === 'companion'));
                  if (autoAct) {
                    setTimeout(() => {
                      handleExecuteLocalAction(autoAct);
                    }, 500);
                  }
                }

                if (voiceSettings.autoSpeak && finalCleaned) {
                  speakResponse(finalCleaned);
                } else {
                  setJarvisState('idle');
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (streamError) {
      console.warn('Fallback sur requête synchrone standard...');
      // Fallback to standard chat endpoint if SSE fails
      try {
        const fallbackRes = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-8).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.rawContent || m.content }],
            })),
            userProfile,
            memories: memories.filter((m) => m.isActive),
            enableSearch,
          }),
        });

        const data = await fallbackRes.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === jarvisMsgId
              ? {
                  ...m,
                  content: data.text,
                  rawContent: data.rawText,
                  actions: data.actions || [],
                  sources: data.sources || [],
                }
              : m
          )
        );

        if (voiceSettings.autoSpeak && data.text) {
          speakResponse(data.text);
        } else {
          setJarvisState('idle');
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === jarvisMsgId
              ? {
                  ...m,
                  content: `Mes excuses, Monsieur. Une erreur réseau est survenue : ${
                    err.message || 'connexion interrompue'
                  }.`,
                }
              : m
          )
        );
        setJarvisState('idle');
      }
    }
  };

  // Replay message audio
  const handleReplayAudio = (text: string) => {
    speakResponse(text);
  };

  // Clear chat history
  const handleClearHistory = () => {
    handleStopSpeech();
    setMessages([]);
    localStorage.removeItem('jarvis_history_v1');
  };

  // Profile and Memory updates
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdateMemories = (newMemories: MemoryItem[]) => {
    setMemories(newMemories);
    saveMemories(newMemories);
  };

  const handleUpdateSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateRoutines = (newRoutines: AutomationRoutine[]) => {
    setRoutines(newRoutines);
    saveRoutines(newRoutines);
  };

  // Execute local Windows command via Companion Bridge
  const handleExecuteLocalAction = async (action: WindowsAction) => {
    try {
      if (action.type === 'workspace') {
        setIsWorkspaceOpen(true);
        return;
      }

      setJarvisState('thinking');

      let result: any = null;
      if (action.type === 'powershell') {
        result = await runPowerShell(action.target || '');
      } else if (action.type === 'python') {
        result = await runPowerShell(`python -c "${(action.target || '').replace(/"/g, '\\"')}"`);
      } else if (action.type === 'companion') {
        result = await sendBridgeCommand(action.params || { action: 'open_app', target: action.target });
      } else if (action.type === 'protocol') {
        if (companionStatus.connected) {
          result = await launchApp(action.target || '');
        } else {
          window.location.href = action.target || '';
          setJarvisState('idle');
          return;
        }
      }

      let formattedOutput = '';
      if (result?.success) {
        if (result.stdout || result.stderr) {
          formattedOutput = `⚡ **Exécution locale terminée (${action.title}) :**\n\`\`\`\n${result.stdout || result.stderr}\n\`\`\``;
        } else if (result.path) {
          formattedOutput = `📸 **Capture d'écran sauvegardée avec succès sur votre PC :**\n\`${result.path}\``;
        } else if (Array.isArray(result.processes)) {
          formattedOutput = `⚡ **Processus Actifs sur votre PC :**\n\n| PID | Processus | RAM (Mo) | CPU (s) |\n|---|---|---|---|\n` +
            result.processes.map((p: any) => `| ${p.Id} | **${p.ProcessName}** | ${p.RAM_MB} Mo | ${p.CPU_s}s |`).join('\n');
        } else {
          formattedOutput = `✅ **Action Système Exécutée :** ${result.message || action.title}`;
        }
      } else {
        formattedOutput = `⚠️ **Erreur lors de l'exécution sur votre PC :** ${result?.error || 'Échec de transmission'}`;
      }

      const replyMsg: Message = {
        id: `msg-exec-${Date.now()}`,
        role: 'jarvis',
        content: formattedOutput,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      speakResponse(result?.success ? `Opération ${action.title} effectuée sur votre ordinateur, Monsieur.` : "Erreur lors de l'exécution.");
      setJarvisState('idle');
    } catch (e: any) {
      const errReply: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'jarvis',
        content: `⚠️ Erreur d'exécution via le pont Windows : ${e.message}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errReply]);
      setJarvisState('idle');
    }
  };

  const handleTriggerCompanionApp = async (app: string) => {
    const res = await launchApp(app);
    if (!res.success) {
      throw new Error(res.error || 'Échec de lancement');
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden font-sans select-none hud-grid">
      {/* Subtle Central Holographic Ambient Aura */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(0,240,255,0.08),rgba(3,7,18,0.95)_70%)]" />

      {/* Top Bar matching images.jpg with spaced J.A.R.V.I.S title and small dossiers */}
      <header className="relative w-full z-30 px-6 py-4 flex items-center justify-between">
        {/* Left: J . A . R . V . I . S */}
        <div className="flex items-center gap-2">
          <span className="font-['Orbitron'] font-bold text-xs sm:text-sm tracking-[0.4em] text-cyan-400 select-none drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
            J . A . R . V . I . S
          </span>
        </div>

        {/* Center: Small Folders ("petits dossiers") for instant 1-click access */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.06)]">
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-purple-950/40 border border-transparent hover:border-purple-500/30 text-slate-300 hover:text-purple-200 text-xs font-['Rajdhani'] font-medium transition-all cursor-pointer"
            title="Dossier Mémoire de JARVIS"
          >
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>Mémoire</span>
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950/80 px-1 py-0.2 rounded border border-purple-500/30">
              {memories.filter((m) => m.isActive).length}
            </span>
          </button>

          <button
            onClick={() => setIsVisionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sky-950/40 border border-transparent hover:border-sky-500/30 text-slate-300 hover:text-sky-200 text-xs font-['Rajdhani'] font-medium transition-all cursor-pointer"
            title="Dossier Cortex Vision : Voir l'écran en direct"
          >
            <Folder className="w-3.5 h-3.5 text-sky-400" />
            <span>Vision</span>
          </button>

          <button
            onClick={() => setIsSmartMusicOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 text-slate-300 hover:text-cyan-200 text-xs font-['Rajdhani'] font-medium transition-all cursor-pointer"
            title="Dossier Smart Musique"
          >
            <Folder className="w-3.5 h-3.5 text-cyan-400" />
            <span>Musique</span>
            {musicPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setIsGpt6Open(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-950/40 border border-transparent hover:border-indigo-500/30 text-slate-300 hover:text-indigo-200 text-xs font-['Rajdhani'] font-medium transition-all cursor-pointer"
            title="Dossier Frontier GPT-6"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span>GPT-6</span>
          </button>

          <button
            onClick={() => setIsEvolutionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/30 text-slate-300 hover:text-emerald-200 text-xs font-['Rajdhani'] font-medium transition-all cursor-pointer"
            title="Dossier Auto-Évolution & Code"
          >
            <Folder className="w-3.5 h-3.5 text-emerald-400" />
            <span>Évolution</span>
          </button>

          <button
            onClick={() => setIsFoldersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/50 text-cyan-200 text-xs font-['Rajdhani'] font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            title="Ouvrir tous les dossiers système"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>Tous les dossiers</span>
          </button>
        </div>

        {/* Right: Online status & Quick Folder Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 font-sans select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300 text-xs font-medium">Online</span>
          </div>

          <button
            onClick={() => setIsFoldersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-['Rajdhani'] font-bold transition-all cursor-pointer md:hidden shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            title="Ouvrir les dossiers"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>Dossiers</span>
          </button>
        </div>
      </header>

      {/* Main Center Area: Concentric Holographic Brain Core + Search Bar (Pixel-perfect to images.jpg) */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 z-20">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-6 -mt-8 sm:-mt-12">
          {/* Central Concentric Brain Core */}
          <MinimalJarvisCore
            state={jarvisState}
            soundLevel={soundLevel}
            onClick={() => {
              if (isAudioPlaying) {
                handleStopSpeech();
              } else if (jarvisState === 'idle') {
                setJarvisState('listening');
              } else if (jarvisState === 'listening') {
                setJarvisState('idle');
              }
            }}
          />

          {/* Search / Communication Prompt Bar ("une barre de recherche pour communiquer") */}
          <JarvisSearchBar
            onSendMessage={handleSendMessage}
            onOpenFolders={() => setIsFoldersOpen(true)}
            jarvisState={jarvisState}
            onStartListening={() => {
              if (isAudioPlaying) handleStopSpeech();
              setJarvisState('listening');
            }}
            onStopSpeech={handleStopSpeech}
            isAudioPlaying={isAudioPlaying}
          />
        </div>
      </main>

      {/* Floating Holographic Dialogue Overlay (Active Conversation Window) */}
      {messages.length > 0 && isChatOverlayOpen && (
        <div className="fixed inset-x-2 sm:inset-x-6 top-16 bottom-20 z-40 max-w-4xl mx-auto flex flex-col rounded-2xl bg-[#060a16]/92 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Overlay Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/25 bg-black/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-['Orbitron'] text-xs font-bold tracking-wider text-cyan-200">
                COMMUNICATION J.A.R.V.I.S.
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {messages.length} message{messages.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs font-['Rajdhani'] font-medium transition-colors cursor-pointer"
                title="Effacer la conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Effacer</span>
              </button>

              <button
                onClick={() => setIsChatOverlayOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer"
                title="Minimiser pour revenir à l'écran vide"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Mode Écran Vide</span>
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-hidden flex flex-col p-2">
            <ChatWindow
              messages={messages}
              isThinking={jarvisState === 'thinking'}
              onReplayAudio={handleReplayAudio}
              onSendPresetMessage={handleSendMessage}
              companionStatus={companionStatus}
              onExecuteLocalAction={handleExecuteLocalAction}
            />
          </div>
        </div>
      )}

      {/* Floating Re-open Conversation Pill (When conversation is minimized) */}
      {messages.length > 0 && !isChatOverlayOpen && (
        <div className="fixed bottom-6 left-6 z-40 select-none">
          <button
            onClick={() => setIsChatOverlayOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070e1c]/90 hover:bg-cyan-950/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 text-xs font-['Rajdhani'] font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] cursor-pointer hover:scale-105 active:scale-95"
            title="Réafficher la conversation"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Afficher la conversation</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              {messages.length}
            </span>
          </button>
        </div>
      )}

      {/* Voice Recognition & Bottom-Right "Talk to Jarvis" Floating Button matching images.jpg */}
      <VoiceController
        jarvisState={jarvisState}
        voiceSettings={voiceSettings}
        onSendMessage={handleSendMessage}
        onStateChange={setJarvisState}
        onStopSpeech={handleStopSpeech}
        isAudioPlaying={isAudioPlaying}
        onSoundLevelUpdate={setSoundLevel}
        onUpdateVoiceSpeed={(speed) => {
          const updated = { ...voiceSettings, rate: speed };
          setVoiceSettings(updated);
          saveSettings(updated);
        }}
        minimalFloating={true}
      />

      {/* System Folders Modal (Toutes les fonctionnalités dans un petit dossier) */}
      <SystemFoldersModal
        isOpen={isFoldersOpen}
        onClose={() => setIsFoldersOpen(false)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenSmartMusic={() => setIsSmartMusicOpen(true)}
        onOpenGpt6={() => setIsGpt6Open(true)}
        onOpenEvolution={() => setIsEvolutionOpen(true)}
        onOpenAutomations={() => setIsAutomationsOpen(true)}
        onOpenWindowsHub={() => setIsWindowsHubOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        onOpenArsenal={() => setIsArsenalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        memoriesCount={memories.filter((m) => m.isActive).length}
        companionStatus={companionStatus}
        routinesCount={routines.length}
        workspaceEmail={workspaceUser?.email || undefined}
        musicPlaying={musicPlaying}
      />

      {/* Modals */}
      <AutomationHubModal
        isOpen={isAutomationsOpen}
        onClose={() => setIsAutomationsOpen(false)}
        routines={routines}
        onUpdateRoutines={handleUpdateRoutines}
        activeExecution={activeExecution}
        onRunRoutine={handleRunRoutine}
        onStopRoutine={handleStopRoutine}
        companionStatus={companionStatus}
      />

      <MemoryManagerModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        memories={memories}
        onUpdateMemories={handleUpdateMemories}
      />

      <WindowsHubModal
        isOpen={isWindowsHubOpen}
        onClose={() => setIsWindowsHubOpen(false)}
        companionStatus={companionStatus}
        onCheckStatus={checkCompanionStatus}
        onTriggerCompanionApp={handleTriggerCompanionApp}
        isAutopilotEnabled={isAutopilotEnabled}
        onToggleAutopilot={handleToggleAutopilot}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateSettings}
        enableSearch={enableSearch}
        onToggleSearch={setEnableSearch}
      />

      <ArsenalModal
        isOpen={isArsenalOpen}
        onClose={() => setIsArsenalOpen(false)}
        onExecutePrompt={handleSendMessage}
        tasks={tasks}
        onUpdateTasks={(newTasks) => {
          setTasks(newTasks);
          saveTasks(newTasks);
        }}
        notes={notes}
        onUpdateNotes={(newNotes) => {
          setNotes(newNotes);
          saveNotes(newNotes);
        }}
        companionStatus={companionStatus}
      />

      <WorkspaceHubModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        onActionNotification={(msg) => handleSendMessage(msg)}
      />

      <SelfEvolutionModal
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        onExecutePrompt={handleSendMessage}
        onExecuteAction={handleExecuteLocalAction}
        companionStatus={companionStatus}
      />

      <SmartMusicModal
        isOpen={isSmartMusicOpen}
        onClose={() => setIsSmartMusicOpen(false)}
        companionStatus={companionStatus}
        onExecutePrompt={handleSendMessage}
        onExecutePcAction={handleExecuteLocalAction}
      />

      <Gpt6OmniModal
        isOpen={isGpt6Open}
        onClose={() => setIsGpt6Open(false)}
        companionStatus={companionStatus}
        onExecutePrompt={handleSendMessage}
        onExecutePcAction={handleExecuteLocalAction}
      />

      <JarvisVisionModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        companionStatus={companionStatus}
        onExecutePrompt={handleSendMessage}
        onExecutePcAction={handleExecuteLocalAction}
        onSpeak={speakResponse}
      />
    </div>
  );
}

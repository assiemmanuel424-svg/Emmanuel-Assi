import { UserProfile, MemoryItem, VoiceSettings, Message } from '../types/jarvis';

const STORAGE_KEYS = {
  PROFILE: 'jarvis_profile_v1',
  MEMORIES: 'jarvis_memories_v1',
  HISTORY: 'jarvis_history_v1',
  SETTINGS: 'jarvis_settings_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Monsieur',
  role: 'Étudiant & Développeur',
  language: 'Français',
  preferences: 'Préfère des explications concises, précises et pragmatiques. Code propre et commenté.',
  goals: 'Réussir mes études, développer des projets innovants et optimiser mon utilisation de Windows.',
};

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    content: "L'utilisateur apprécie la rigueur, les solutions pas-à-pas et les explications scientifiques claires.",
    category: 'preference',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'mem-2',
    content: "Environnement principal : PC Windows avec utilisation d'outils de travail et de développement.",
    category: 'personal',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'mem-3',
    content: "Projet en cours : Configuration et perfectionnement de l'assistant JARVIS personnel.",
    category: 'project',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export const DEFAULT_SETTINGS: VoiceSettings = {
  autoSpeak: true,
  voiceEngine: 'browser',
  browserVoiceName: '',
  geminiVoice: 'Fenrir',
  rate: 1.25,
  pitch: 1.0,
  wakeWordEnabled: true,
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Erreur sauvegarde profil:', e);
  }
}

export function loadMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return raw ? JSON.parse(raw) : DEFAULT_MEMORIES;
  } catch {
    return DEFAULT_MEMORIES;
  }
}

export function saveMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.error('Erreur sauvegarde mémoires:', e);
  }
}

export function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(history: Message[]): void {
  try {
    // Keep max 50 recent messages in localStorage
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(-50)));
  } catch (e) {
    console.error('Erreur sauvegarde historique:', e);
  }
}

export function loadSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: VoiceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Erreur sauvegarde paramètres:', e);
  }
}

export function loadTasks(): any[] {
  try {
    const raw = localStorage.getItem('jarvis_tasks_v1');
    return raw ? JSON.parse(raw) : [
      { id: 't1', title: 'Explorer les fonctionnalités de JARVIS', completed: true, priority: 'high', createdAt: new Date().toISOString() },
      { id: 't2', title: 'Tester les commandes vocales au microphone', completed: false, priority: 'high', createdAt: new Date().toISOString() },
      { id: 't3', title: 'Lancer une routine d\'études ou de dev', completed: false, priority: 'medium', createdAt: new Date().toISOString() }
    ];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: any[]): void {
  try {
    localStorage.setItem('jarvis_tasks_v1', JSON.stringify(tasks));
  } catch (e) {}
}

export function loadNotes(): any[] {
  try {
    const raw = localStorage.getItem('jarvis_notes_v1');
    return raw ? JSON.parse(raw) : [
      { id: 'n1', title: 'Note de bienvenue JARVIS', content: 'JARVIS est synchronisé. Tous les outils d\'études, de code, de calcul et de contrôle Windows sont opérationnels.', updatedAt: new Date().toISOString() }
    ];
  } catch {
    return [];
  }
}

export function saveNotes(notes: any[]): void {
  try {
    localStorage.setItem('jarvis_notes_v1', JSON.stringify(notes));
  } catch (e) {}
}

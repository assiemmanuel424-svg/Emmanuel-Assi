import { AutomationRoutine } from '../types/jarvis';

export const DEFAULT_ROUTINES: AutomationRoutine[] = [
  {
    id: 'routine-dev',
    title: 'Mode Développement & Coding',
    description: 'Démarre votre environnement de développement complet : VS Code, GitHub, Terminal et diagnostic système.',
    category: 'work',
    voiceTriggers: ['mode dev', 'mode coding', 'lance le dev', 'active le mode dev', 'environnement de code'],
    steps: [
      {
        id: 'step-dev-1',
        type: 'speech',
        title: 'Initialisation de l\'environnement de développement',
        target: 'Initialisation du poste de travail pour le développement, Monsieur. Lancement des outils.',
      },
      {
        id: 'step-dev-2',
        type: 'protocol',
        title: 'Lancer Visual Studio Code',
        target: 'vscode://',
      },
      {
        id: 'step-dev-3',
        type: 'protocol',
        title: 'Lancer Windows Terminal',
        target: 'wt:',
      },
      {
        id: 'step-dev-4',
        type: 'web',
        title: 'Ouvrir GitHub',
        target: 'https://github.com',
      },
      {
        id: 'step-dev-5',
        type: 'powershell',
        title: 'Diagnostic mémoire pour le développement',
        target: 'Get-CimInstance Win32_OperatingSystem | Select-Object @{Name="RAM Libre (Go)"; Expression={[math]::Round($_.FreePhysicalMemory/1MB,2)}}',
      },
    ],
  },
  {
    id: 'routine-study',
    title: 'Mode Études & Concentration (Pomodoro)',
    description: 'Configure votre session de révision : minuteur Pomodoro 25 min, bloc-notes de révision et ambiance musicale.',
    category: 'study',
    voiceTriggers: ['mode étude', 'mode etude', 'session de révision', 'pomodoro', 'concentration', 'je vais étudier'],
    steps: [
      {
        id: 'step-study-1',
        type: 'speech',
        title: 'Consigne de concentration',
        target: 'Session de concentration activée, Monsieur. Minuteur Pomodoro de 25 minutes programmé. Éliminez les distractions.',
      },
      {
        id: 'step-study-2',
        type: 'web',
        title: 'Ouvrir l\'espace de travail Google Docs',
        target: 'https://docs.google.com',
      },
      {
        id: 'step-study-3',
        type: 'protocol',
        title: 'Lancer Spotify pour la musique de révision',
        target: 'spotify:',
      },
      {
        id: 'step-study-4',
        type: 'timer',
        title: 'Minuteur Pomodoro (25 minutes)',
        durationSeconds: 1500, // 25 minutes
      },
    ],
  },
  {
    id: 'routine-maintenance',
    title: 'Maintenance & Optimisation PC',
    description: 'Purge les fichiers temporaires de Windows, analyse l\'espace disque et libère les caches système.',
    category: 'maintenance',
    voiceTriggers: ['optimise mon pc', 'nettoie le pc', 'maintenance windows', 'nettoyer les fichiers temporaires', 'boost pc'],
    steps: [
      {
        id: 'step-maint-1',
        type: 'speech',
        title: 'Avertissement de maintenance',
        target: 'Lancement du protocole de maintenance système et optimisation des ressources.',
      },
      {
        id: 'step-maint-2',
        type: 'powershell',
        title: 'Nettoyer le cache temporaire utilisateur (%TEMP%)',
        target: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; Write-Output "Fichiers temporaires purgés avec succès."',
      },
      {
        id: 'step-maint-3',
        type: 'powershell',
        title: 'Vérifier l\'espace disque après nettoyage',
        target: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name="Libre (Go)";Expression={[math]::Round($_.Free/1GB,2)}}, @{Name="Total (Go)";Expression={[math]::Round($_.Used/1GB + $_.Free/1GB,2)}} | Format-Table -AutoSize',
      },
      {
        id: 'step-maint-4',
        type: 'speech',
        title: 'Bilan de maintenance',
        target: 'Optimisation terminée, Monsieur. Les fichiers temporaires ont été libérés.',
      },
    ],
  },
  {
    id: 'routine-briefing',
    title: 'Morning Briefing & Rapport Quotidien',
    description: 'Récapitule l\'heure, la météo, vos objectifs et vos priorités pour bien démarrer votre journée.',
    category: 'daily',
    voiceTriggers: ['morning briefing', 'bonjour jarvis', 'rapport du matin', 'rapport quotidien', 'briefing'],
    steps: [
      {
        id: 'step-brief-1',
        type: 'speech',
        title: 'Vocalisation de bienvenue',
        target: 'Bonjour Monsieur. Tous les systèmes sont au vert. Voici le rapport d\'initialisation pour votre journée.',
      },
      {
        id: 'step-brief-2',
        type: 'protocol',
        title: 'Vérifier l\'agenda ou les tâches',
        target: 'mailto:',
      },
      {
        id: 'step-brief-3',
        type: 'web',
        title: 'Consulter les actualités tech',
        target: 'https://news.google.com',
      },
    ],
  },
  {
    id: 'routine-relax',
    title: 'Détente & Multimédia',
    description: 'Basculez en mode pause : lance Spotify, ouvre YouTube et invite à une pause bien méritée.',
    category: 'custom',
    voiceTriggers: ['pause', 'détente', 'detente', 'mets de la musique', 'mode repos', 'pause café'],
    steps: [
      {
        id: 'step-rel-1',
        type: 'speech',
        title: 'Invitation à la détente',
        target: 'Mode détente activé, Monsieur. Lancement de votre musique.',
      },
      {
        id: 'step-rel-2',
        type: 'protocol',
        title: 'Lancer Spotify',
        target: 'spotify:',
      },
      {
        id: 'step-rel-3',
        type: 'web',
        title: 'Ouvrir YouTube',
        target: 'https://www.youtube.com',
      },
    ],
  },
  {
    id: 'routine-research',
    title: 'Recherche Approfondie & Veille',
    description: 'Active les portails de recherche académique et d\'information : Google Actualités, Wikipedia et prise de notes.',
    category: 'study',
    voiceTriggers: ['mode recherche', 'veille tech', 'documentation', 'fais une recherche'],
    steps: [
      {
        id: 'step-res-1',
        type: 'speech',
        title: 'Initialisation de la recherche',
        target: 'Centres de veille et de documentation en ligne ouverts, Monsieur.',
      },
      {
        id: 'step-res-2',
        type: 'web',
        title: 'Ouvrir Google Actualités Tech',
        target: 'https://news.google.com/search?q=technologie%20intelligence%20artificielle',
      },
      {
        id: 'step-res-3',
        type: 'web',
        title: 'Ouvrir Wikipedia',
        target: 'https://fr.wikipedia.org',
      },
      {
        id: 'step-res-4',
        type: 'protocol',
        title: 'Ouvrir le Bloc-notes pour consigner les données',
        target: 'notepad:',
      },
    ],
  },
  {
    id: 'routine-quick-clean',
    title: 'Diagnostic Rapide CPU & Réseau',
    description: 'Vérifie en un clic la latence réseau DNS et les processus Windows les plus gourmands en mémoire.',
    category: 'maintenance',
    voiceTriggers: ['diagnostic rapide', 'test réseau', 'qui consomme de la ram', 'check pc'],
    steps: [
      {
        id: 'step-diag-1',
        type: 'speech',
        title: 'Analyse télémétrique',
        target: 'Diagnostic système en cours d\'exécution.',
      },
      {
        id: 'step-diag-2',
        type: 'powershell',
        title: 'Top 5 des processus les plus lourds en RAM',
        target: 'Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 5 Name, @{Name="RAM (Mo)";Expression={[math]::Round($_.WorkingSet64/1MB,1)}} | Format-Table -AutoSize',
      },
    ],
  },
];

const ROUTINES_STORAGE_KEY = 'jarvis_routines_v1';

export function loadRoutines(): AutomationRoutine[] {
  try {
    const raw = localStorage.getItem(ROUTINES_STORAGE_KEY);
    if (!raw) return DEFAULT_ROUTINES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROUTINES;
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function saveRoutines(routines: AutomationRoutine[]): void {
  try {
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
  } catch (e) {
    console.error('Erreur sauvegarde routines:', e);
  }
}

/**
 * Match a text input with available voice triggers in automation routines
 */
export function matchVoiceTrigger(text: string, routines: AutomationRoutine[]): AutomationRoutine | null {
  const clean = text.toLowerCase().trim();
  for (const routine of routines) {
    for (const trigger of routine.voiceTriggers) {
      if (clean.includes(trigger.toLowerCase())) {
        return routine;
      }
    }
  }
  return null;
}

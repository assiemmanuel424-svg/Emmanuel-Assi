/**
 * JARVIS Windows Companion Controller
 * Direct, automated interface with the local bridge on http://127.0.0.1:7890
 */

export interface BridgeResult {
  success: boolean;
  message?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
  path?: string;
  processes?: Array<{
    Id: number;
    ProcessName: string;
    RAM_MB: number;
    CPU_s: number;
  }>;
  text?: string;
  [key: string]: any;
}

export const BRIDGE_URL = 'http://127.0.0.1:7890';

export async function sendBridgeCommand(payload: Record<string, any>): Promise<BridgeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${BRIDGE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Erreur HTTP ${res.status}: ${errText}` };
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.name === 'AbortError'
        ? 'Délai d\'attente dépassé (timeout) sur le pont local.'
        : `Pont Windows inaccessible (veuillez lancer start_jarvis_bridge.bat sur le port 7890).`,
    };
  }
}

/**
 * Launch an application via bridge or protocol
 */
export async function launchApp(app: string): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'open_app', target: app });
}

/**
 * Control media audio (mute, volume up/down, pause, next)
 */
export async function controlMedia(
  subaction: 'mute' | 'vol_up' | 'vol_down' | 'play_pause' | 'next' | 'prev'
): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'media_control', subaction });
}

/**
 * Take full desktop screenshot saved to user's Pictures folder
 */
export async function captureScreenshot(): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'screenshot' });
}

/**
 * Open a special folder in Windows Explorer
 */
export async function openFolder(folder: string): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'open_folder', folder });
}

/**
 * Execute system maintenance or security commands
 */
export async function executeSystemPower(
  subaction: 'lock' | 'empty_recycle_bin' | 'flush_dns' | 'clean_temp' | 'sleep'
): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'system_power', subaction });
}

/**
 * Fetch top running processes by CPU & RAM
 */
export async function getTopProcesses(): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'get_processes' });
}

/**
 * Terminate a process by name
 */
export async function killProcess(processName: string): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'kill_process', process: processName });
}

/**
 * Run arbitrary PowerShell script
 */
export async function runPowerShell(script: string): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'run_powershell', script });
}

/**
 * Read or write clipboard
 */
export async function manageClipboard(subaction: 'get' | 'set', text?: string): Promise<BridgeResult> {
  return sendBridgeCommand({ action: 'clipboard', subaction, text });
}

/**
 * Natural Language Parser for Direct PC Control commands
 * Detects if the prompt is an immediate local PC control command.
 */
export interface PcParsedCommand {
  type: 'media' | 'screenshot' | 'lock' | 'sleep' | 'clean' | 'folder' | 'app' | 'process_list' | 'process_kill' | 'powershell';
  payload: Record<string, any>;
  confirmationSpeech: string;
  description: string;
}

export function parsePcCommand(input: string): PcParsedCommand | null {
  const clean = input.toLowerCase().trim();

  // 1. Audio / Media Control
  if (
    clean.includes('coupe le son') ||
    clean.includes('silencieux') ||
    clean.includes('mets en sourdine') ||
    clean.includes('en sourdine') ||
    clean === 'mute' ||
    clean === 'muet' ||
    clean === 'désactive le son'
  ) {
    return {
      type: 'media',
      payload: { action: 'media_control', subaction: 'mute' },
      confirmationSpeech: 'Son coupé en sourdine sur votre ordinateur, Monsieur.',
      description: 'Basculer le son en sourdine (Mute)',
    };
  }

  if (
    clean.includes('monte le son') ||
    clean.includes('augmente le son') ||
    clean.includes('augmente le volume') ||
    clean.includes('plus fort')
  ) {
    return {
      type: 'media',
      payload: { action: 'media_control', subaction: 'vol_up' },
      confirmationSpeech: 'Volume sonore augmenté, Monsieur.',
      description: 'Augmenter le volume',
    };
  }

  if (
    clean.includes('baisse le son') ||
    clean.includes('diminue le son') ||
    clean.includes('diminue le volume') ||
    clean.includes('moins fort')
  ) {
    return {
      type: 'media',
      payload: { action: 'media_control', subaction: 'vol_down' },
      confirmationSpeech: 'Volume sonore diminué, Monsieur.',
      description: 'Diminuer le volume',
    };
  }

  if (
    clean.includes('mets pause') ||
    clean.includes('pause musique') ||
    clean.includes('pause audio') ||
    clean.includes('reprends la musique') ||
    clean === 'pause' ||
    clean === 'lecture'
  ) {
    return {
      type: 'media',
      payload: { action: 'media_control', subaction: 'play_pause' },
      confirmationSpeech: 'Lecture multimédia basculée, Monsieur.',
      description: 'Lecture / Pause média',
    };
  }

  if (
    clean.includes('musique suivante') ||
    clean.includes('piste suivante') ||
    clean.includes('morceau suivant') ||
    clean === 'suivant'
  ) {
    return {
      type: 'media',
      payload: { action: 'media_control', subaction: 'next' },
      confirmationSpeech: 'Piste audio suivante, Monsieur.',
      description: 'Piste suivante',
    };
  }

  // 2. Screenshot
  if (
    clean.includes('capture d\'écran') ||
    clean.includes('capture d’écran') ||
    clean.includes('capture ecran') ||
    clean.includes('screenshot') ||
    clean.includes('prends une capture') ||
    clean.includes('fais une capture')
  ) {
    return {
      type: 'screenshot',
      payload: { action: 'screenshot' },
      confirmationSpeech: 'Capture d\'écran effectuée et sauvegardée dans vos Images, Monsieur.',
      description: 'Capture d\'écran de votre bureau',
    };
  }

  // 3. Lock & Sleep
  if (
    clean.includes('verrouille mon pc') ||
    clean.includes('verrouille l\'ordinateur') ||
    clean.includes('verrouille la session') ||
    clean.includes('bloque mon pc') ||
    clean === 'verrouille'
  ) {
    return {
      type: 'lock',
      payload: { action: 'system_power', subaction: 'lock' },
      confirmationSpeech: 'Session Windows verrouillée, Monsieur.',
      description: 'Verrouiller la session Windows',
    };
  }

  if (
    clean.includes('mets en veille mon pc') ||
    clean.includes('mets le pc en veille') ||
    clean.includes('mise en veille')
  ) {
    return {
      type: 'sleep',
      payload: { action: 'system_power', subaction: 'sleep' },
      confirmationSpeech: 'Mise en veille du système initialisée, Monsieur.',
      description: 'Mettre le PC en veille',
    };
  }

  // 4. Recycle bin & cleanup
  if (
    clean.includes('vide la corbeille') ||
    clean.includes('vider la corbeille')
  ) {
    return {
      type: 'clean',
      payload: { action: 'system_power', subaction: 'empty_recycle_bin' },
      confirmationSpeech: 'Corbeille Windows vidée avec succès, Monsieur.',
      description: 'Vider la corbeille Windows',
    };
  }

  if (
    clean.includes('purge le cache dns') ||
    clean.includes('vide le cache dns') ||
    clean.includes('flush dns')
  ) {
    return {
      type: 'clean',
      payload: { action: 'system_power', subaction: 'flush_dns' },
      confirmationSpeech: 'Cache résolveur DNS purgé, Monsieur.',
      description: 'Purger le cache DNS (ipconfig /flushdns)',
    };
  }

  if (
    clean.includes('nettoie les fichiers temporaires') ||
    clean.includes('purge les fichiers temporaires') ||
    clean.includes('nettoie les fichiers temp')
  ) {
    return {
      type: 'clean',
      payload: { action: 'system_power', subaction: 'clean_temp' },
      confirmationSpeech: 'Fichiers temporaires nettoyés, Monsieur.',
      description: 'Nettoyer le dossier temporaire (%TEMP%)',
    };
  }

  // 5. Explorer Folders
  if (clean.includes('ouvre mon bureau') || clean.includes('ouvre le bureau') || clean === 'bureau') {
    return {
      type: 'folder',
      payload: { action: 'open_folder', folder: 'desktop' },
      confirmationSpeech: 'Dossier Bureau ouvert, Monsieur.',
      description: 'Ouvrir le dossier Bureau',
    };
  }

  if (
    clean.includes('ouvre les téléchargements') ||
    clean.includes('ouvre telechargements') ||
    clean.includes('ouvre mes téléchargements') ||
    clean === 'téléchargements'
  ) {
    return {
      type: 'folder',
      payload: { action: 'open_folder', folder: 'downloads' },
      confirmationSpeech: 'Dossier Téléchargements ouvert, Monsieur.',
      description: 'Ouvrir le dossier Téléchargements',
    };
  }

  if (
    clean.includes('ouvre mes documents') ||
    clean.includes('ouvre les documents') ||
    clean === 'documents'
  ) {
    return {
      type: 'folder',
      payload: { action: 'open_folder', folder: 'documents' },
      confirmationSpeech: 'Dossier Documents ouvert, Monsieur.',
      description: 'Ouvrir le dossier Documents',
    };
  }

  if (
    clean.includes('ouvre l\'explorateur') ||
    clean.includes('ouvre explorateur') ||
    clean === 'explorateur'
  ) {
    return {
      type: 'folder',
      payload: { action: 'open_folder', folder: 'desktop' },
      confirmationSpeech: 'Explorateur de fichiers Windows ouvert, Monsieur.',
      description: 'Ouvrir l\'Explorateur Windows',
    };
  }

  // 6. Processes
  if (
    clean.includes('liste les processus') ||
    clean.includes('liste les taches') ||
    clean.includes('quels processus') ||
    clean.includes('processus qui tournent') ||
    clean.includes('processus actifs') ||
    clean === 'gestionnaire des tâches' ||
    clean === 'gestionnaire des taches'
  ) {
    return {
      type: 'process_list',
      payload: { action: 'get_processes' },
      confirmationSpeech: 'Voici la liste des processus actifs consommant le plus de ressources sur votre PC, Monsieur.',
      description: 'Afficher les processus actifs (CPU & RAM)',
    };
  }

  if (clean.startsWith('tue le processus') || clean.startsWith('ferme le processus') || clean.startsWith('arrête le processus') || clean.startsWith('kill ')) {
    const procName = clean.replace(/^(tue\s+le\s+processus|ferme\s+le\s+processus|arrête\s+le\s+processus|kill)\s+/i, '').trim();
    return {
      type: 'process_kill',
      payload: { action: 'kill_process', process: procName },
      confirmationSpeech: `Processus ${procName} arrêté sur votre système, Monsieur.`,
      description: `Arrêter le processus ${procName}`,
    };
  }

  // 7. Websites & Web navigation
  const siteMatches: Array<{ pattern: RegExp; url: string; label: string }> = [
    { pattern: /(?:ouvre|lance|mets)\s+(?:youtube\s+music|yt\s+music)/i, url: 'https://music.youtube.com', label: 'YouTube Music' },
    { pattern: /(?:ouvre|lance|mets)\s+deezer/i, url: 'https://www.deezer.com', label: 'Deezer' },
    { pattern: /(?:ouvre|lance|mets)\s+soundcloud/i, url: 'https://soundcloud.com', label: 'SoundCloud' },
    { pattern: /(?:ouvre|lance|mets)\s+youtube/i, url: 'https://www.youtube.com', label: 'YouTube' },
    { pattern: /(?:ouvre|lance|mets)\s+google/i, url: 'https://www.google.com', label: 'Google' },
    { pattern: /(?:ouvre|lance|mets)\s+github/i, url: 'https://github.com', label: 'GitHub' },
    { pattern: /(?:ouvre|lance|mets)\s+chatgpt/i, url: 'https://chatgpt.com', label: 'ChatGPT' },
    { pattern: /(?:ouvre|lance|mets)\s+twitch/i, url: 'https://www.twitch.tv', label: 'Twitch' },
    { pattern: /(?:ouvre|lance|mets)\s+netflix/i, url: 'https://www.netflix.com', label: 'Netflix' },
    { pattern: /(?:ouvre|lance|mets)\s+(?:twitter|x)/i, url: 'https://x.com', label: 'X (Twitter)' },
    { pattern: /(?:ouvre|lance|mets)\s+reddit/i, url: 'https://www.reddit.com', label: 'Reddit' },
  ];

  for (const s of siteMatches) {
    if (s.pattern.test(clean)) {
      return {
        type: 'app',
        payload: { action: 'open_app', target: s.url },
        confirmationSpeech: `${s.label} ouvert dans votre navigateur, Monsieur.`,
        description: `Ouvrir ${s.label} (${s.url})`,
      };
    }
  }

  // Direct URL opening: ouvre https://... ou ouvre www...
  const urlMatch = clean.match(/(?:ouvre|lance|navigue vers|va sur)\s+(https?:\/\/[^\s]+|www\.[^\s]+)/i);
  if (urlMatch) {
    const rawUrl = urlMatch[1];
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    return {
      type: 'app',
      payload: { action: 'open_app', target: fullUrl },
      confirmationSpeech: `Navigation vers ${fullUrl} effectuée, Monsieur.`,
      description: `Ouvrir ${fullUrl}`,
    };
  }

  // 8. Applications Launch
  const appMatches: Array<{ pattern: RegExp; app: string; label: string }> = [
    { pattern: /(?:ouvre|lance)\s+(?:google\s+)?chrome/i, app: 'chrome', label: 'Google Chrome' },
    { pattern: /(?:ouvre|lance)\s+firefox/i, app: 'firefox', label: 'Mozilla Firefox' },
    { pattern: /(?:ouvre|lance)\s+edge/i, app: 'edge', label: 'Microsoft Edge' },
    { pattern: /(?:ouvre|lance)\s+discord/i, app: 'discord', label: 'Discord' },
    { pattern: /(?:ouvre|lance)\s+steam/i, app: 'steam', label: 'Steam' },
    { pattern: /(?:ouvre|lance)\s+spotify/i, app: 'spotify', label: 'Spotify' },
    { pattern: /(?:ouvre|lance)\s+vlc/i, app: 'vlc', label: 'VLC Media Player' },
    { pattern: /(?:ouvre|lance)\s+(?:visual\s+studio\s+code|vs\s*code|code)/i, app: 'code', label: 'Visual Studio Code' },
    { pattern: /(?:ouvre|lance)\s+(?:la\s+)?calculatrice/i, app: 'calc', label: 'Calculatrice Windows' },
    { pattern: /(?:ouvre|lance)\s+(?:le\s+)?bloc[- ]notes/i, app: 'notepad', label: 'Bloc-notes' },
    { pattern: /(?:ouvre|lance)\s+(?:le\s+)?terminal/i, app: 'terminal', label: 'Windows Terminal' },
    { pattern: /(?:ouvre|lance)\s+(?:l'|l\s*)invite de commande/i, app: 'cmd', label: 'Invite de commandes (CMD)' },
    { pattern: /(?:ouvre|lance)\s+powershell/i, app: 'powershell', label: 'PowerShell' },
    { pattern: /(?:ouvre|lance)\s+(?:les\s+)?paramètres/i, app: 'settings', label: 'Paramètres Windows' },
    { pattern: /(?:ouvre|lance)\s+word/i, app: 'word', label: 'Microsoft Word' },
    { pattern: /(?:ouvre|lance)\s+excel/i, app: 'excel', label: 'Microsoft Excel' },
    { pattern: /(?:ouvre|lance)\s+powerpoint/i, app: 'powerpoint', label: 'Microsoft PowerPoint' },
    { pattern: /(?:ouvre|lance)\s+paint/i, app: 'paint', label: 'Paint' },
    { pattern: /(?:ouvre|lance)\s+obs/i, app: 'obs', label: 'OBS Studio' },
  ];

  for (const m of appMatches) {
    if (m.pattern.test(clean)) {
      return {
        type: 'app',
        payload: { action: 'open_app', target: m.app },
        confirmationSpeech: `${m.label} lancé sur votre ordinateur, Monsieur.`,
        description: `Lancer ${m.label}`,
      };
    }
  }

  // Dynamic application launch fallback: "ouvre <mot>"
  const genericLaunchMatch = clean.match(/^(?:ouvre|lance)\s+([a-zA-Z0-9_\-\.]+)(?:\.exe)?$/i);
  if (genericLaunchMatch) {
    const appTarget = genericLaunchMatch[1].trim();
    if (!['le', 'la', 'les', 'mon', 'ma', 'mes', 'un', 'une'].includes(appTarget)) {
      return {
        type: 'app',
        payload: { action: 'open_app', target: appTarget },
        confirmationSpeech: `Lancement de ${appTarget} sur votre système, Monsieur.`,
        description: `Lancer ${appTarget}`,
      };
    }
  }

  return null;
}

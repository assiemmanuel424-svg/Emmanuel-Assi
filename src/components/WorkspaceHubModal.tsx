import React, { useState, useEffect } from 'react';
import {
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Send,
  RefreshCw,
  LogOut,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  googleSignIn,
  logoutWorkspace,
  getAccessToken,
  initAuth,
} from '../utils/workspaceAuth';
import {
  fetchRecentEmails,
  sendEmailDirectly,
  fetchUpcomingEvents,
  createCalendarEvent,
  fetchGoogleTasks,
  createGoogleTask,
  fetchDriveFiles,
  GmailMessageItem,
  CalendarEventItem,
  GoogleTaskItem,
  DriveFileItem,
} from '../utils/workspaceApi';
import { User } from 'firebase/auth';

interface WorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionNotification?: (msg: string) => void;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  onActionNotification,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'gmail' | 'calendar' | 'tasks' | 'drive' | 'send'>('gmail');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [emails, setEmails] = useState<GmailMessageItem[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);

  // Send Email State
  const [recipient, setRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New Event State
  const [eventSummary, setEventSummary] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  // New Task State
  const [taskTitle, setTaskTitle] = useState('');

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(Boolean(token));
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        if (onActionNotification) {
          onActionNotification(`Compte Google connecté avec succès : ${res.user.email}`);
        }
        await loadActiveTabData('gmail');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de connexion Google Workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutWorkspace();
      setCurrentUser(null);
      setHasToken(false);
      setEmails([]);
      setEvents([]);
      setTasks([]);
      setDriveFiles([]);
    } catch (e: any) {
      console.error(e);
    }
  };

  const loadActiveTabData = async (tab = activeTab) => {
    setError(null);
    setLoading(true);
    try {
      if (tab === 'gmail') {
        const msgs = await fetchRecentEmails(6);
        setEmails(msgs);
      } else if (tab === 'calendar') {
        const evts = await fetchUpcomingEvents(6);
        setEvents(evts);
      } else if (tab === 'tasks') {
        const tsks = await fetchGoogleTasks();
        setTasks(tsks);
      } else if (tab === 'drive') {
        const files = await fetchDriveFiles(6);
        setDriveFiles(files);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la synchronisation des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasToken) {
      loadActiveTabData(activeTab);
    }
  }, [isOpen, activeTab, hasToken]);

  // Handle Send Email with confirmation dialog
  const handleConfirmSendEmail = async () => {
    if (!recipient.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setError('Veuillez remplir le destinataire, le sujet et le message.');
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      await sendEmailDirectly(recipient.trim(), emailSubject.trim(), emailBody.trim());
      setShowSendConfirmation(false);
      setRecipient('');
      setEmailSubject('');
      setEmailBody('');
      if (onActionNotification) {
        onActionNotification(`E-mail envoyé avec succès à ${recipient}`);
      }
      setActiveTab('gmail');
      await loadActiveTabData('gmail');
    } catch (e: any) {
      setError(e.message || "Échec de l'envoi de l'e-mail");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Create Calendar Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary || !eventStart || !eventEnd) return;
    setLoading(true);
    try {
      await createCalendarEvent(
        eventSummary,
        new Date(eventStart).toISOString(),
        new Date(eventEnd).toISOString()
      );
      setEventSummary('');
      setEventStart('');
      setEventEnd('');
      await loadActiveTabData('calendar');
    } catch (err: any) {
      setError(err.message || "Erreur de création d'événement");
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    try {
      await createGoogleTask(taskTitle.trim());
      setTaskTitle('');
      await loadActiveTabData('tasks');
    } catch (err: any) {
      setError(err.message || 'Erreur de création de tâche');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#050b18] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden font-sans text-slate-100">
        {/* Holographic Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-[#091428]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] text-base font-bold text-cyan-300 tracking-wider">
                  CONNEXION GOOGLE & AUTOMATISATION EMAIL
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-semibold uppercase">
                  ZERO LIENS EXTERNES
                </span>
              </div>
              <p className="font-['Rajdhani'] text-xs text-slate-400">
                Accès direct à Gmail, Google Calendar, Google Tasks et Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Bar */}
        <div className="px-4 py-3 bg-[#070f20] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          {currentUser && hasToken ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-cyan-400/50 overflow-hidden bg-cyan-900/40 flex items-center justify-center font-bold text-xs text-cyan-200">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.email?.[0].toUpperCase() || 'U'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Orbitron'] text-xs font-semibold text-emerald-400">
                    CONNECTÉ
                  </span>
                  <span className="text-xs text-slate-200 font-medium">{currentUser.email}</span>
                </div>
                <span className="text-[10px] text-cyan-400/70 font-['Rajdhani']">
                  J.A.R.V.I.S. accède directement à vos emails et plannings sans liens externes
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-['Rajdhani']">
                Connectez votre adresse email Google pour débloquer l'automatisation directe de vos emails et calendriers.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!hasToken ? (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{loading ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadActiveTabData()}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Synchroniser</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-cyan-500/20 bg-[#060c1a] px-4 gap-2 overflow-x-auto">
          {[
            { id: 'gmail', label: 'Gmail (E-mails)', icon: Mail, count: emails.length },
            { id: 'calendar', label: 'Google Calendar', icon: Calendar, count: events.length },
            { id: 'tasks', label: 'Google Tasks', icon: CheckSquare, count: tasks.length },
            { id: 'drive', label: 'Google Drive', icon: FileText, count: driveFiles.length },
            { id: 'send', label: 'Envoyer un E-mail', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-['Rajdhani'] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[55vh]">
          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!hasToken ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                <Mail className="w-8 h-8 text-cyan-300" />
              </div>
              <h3 className="font-['Orbitron'] text-base font-bold text-cyan-300 mb-2">
                AUTOMATISATION DIRECTE ACTIVÉE
              </h3>
              <p className="text-xs text-slate-300 font-['Rajdhani'] leading-relaxed mb-6">
                Fini les liens externes ! En connectant votre adresse e-mail Google, J.A.R.V.I.S. lira et résumera vos e-mails directement dans le chat, consultera votre agenda et exécutera vos instructions automatiquement.
              </p>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{loading ? 'Connexion en cours...' : 'Connecter mon compte Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: GMAIL */}
              {activeTab === 'gmail' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <span className="text-xs font-['Orbitron'] text-cyan-300 font-semibold uppercase">
                      DERNIERS E-MAILS REÇUS
                    </span>
                    <span className="text-[11px] text-slate-400 font-['Rajdhani']">
                      {emails.length} message(s) chargé(s)
                    </span>
                  </div>

                  {emails.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {loading ? 'Récupération des e-mails...' : 'Aucun e-mail trouvé dans la boîte de réception.'}
                    </div>
                  ) : (
                    emails.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl border transition-all ${
                          msg.isUnread
                            ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                            : 'bg-black/40 border-cyan-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-['Rajdhani'] font-bold text-xs text-cyan-200 truncate max-w-[60%]">
                            {msg.from}
                          </span>
                          <span className="text-[10px] text-slate-400 font-['Rajdhani']">
                            {msg.date ? new Date(msg.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 mb-1">{msg.subject}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {msg.snippet}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: CALENDAR */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <span className="text-xs font-['Orbitron'] text-cyan-300 font-semibold uppercase">
                      AGENDA & RENDEZ-VOUS À VENIR
                    </span>
                  </div>

                  {events.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      {loading ? 'Chargement du calendrier...' : 'Aucun événement à venir trouvé.'}
                    </div>
                  ) : (
                    events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-black/40 border border-cyan-500/25 flex items-start justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-cyan-200">{evt.summary}</h4>
                          <span className="text-[11px] text-amber-300 font-['Rajdhani'] block mt-0.5">
                            {evt.start ? new Date(evt.start).toLocaleString('fr-FR') : 'Date non définie'}
                          </span>
                          {evt.description && (
                            <p className="text-[10px] text-slate-400 mt-1">{evt.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add Event Form */}
                  <form onSubmit={handleCreateEvent} className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5">
                    <span className="text-xs font-bold text-cyan-300 block font-['Rajdhani'] uppercase">
                      + Planifier un événement directement
                    </span>
                    <input
                      type="text"
                      placeholder="Titre du rendez-vous..."
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="datetime-local"
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !eventSummary}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Ajouter au calendrier
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <span className="text-xs font-['Orbitron'] text-cyan-300 font-semibold uppercase">
                      TÂCHES GOOGLE TASKS
                    </span>
                  </div>

                  <form onSubmit={handleCreateTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter une tâche Google Tasks..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={!taskTitle.trim()}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </form>

                  {tasks.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      {loading ? 'Chargement des tâches...' : 'Aucune tâche trouvée.'}
                    </div>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${t.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {t.title}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: DRIVE */}
              {activeTab === 'drive' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <span className="text-xs font-['Orbitron'] text-cyan-300 font-semibold uppercase">
                      FICHIERS RÉCENTS GOOGLE DRIVE
                    </span>
                  </div>

                  {driveFiles.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      {loading ? 'Chargement des fichiers...' : 'Aucun fichier récent trouvé.'}
                    </div>
                  ) : (
                    driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200">{file.name}</h4>
                            <span className="text-[10px] text-slate-400 font-['Rajdhani']">
                              Modifié le {new Date(file.modifiedTime).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-400/30 text-cyan-300 text-[11px] flex items-center gap-1"
                          >
                            <span>Consulter</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: SEND EMAIL */}
              {activeTab === 'send' && (
                <div className="space-y-3 max-w-xl mx-auto">
                  <div className="pb-1 border-b border-cyan-500/20">
                    <span className="text-xs font-['Orbitron'] text-cyan-300 font-semibold uppercase">
                      ENVOI DIRECT D'E-MAIL SANS LIEN EXTERNE
                    </span>
                    <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                      L'e-mail est expédié via l'API Gmail de votre compte Google avec confirmation explicite obligatoire.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase block mb-1">
                        Destinataire :
                      </label>
                      <input
                        type="email"
                        placeholder="exemple@domaine.com"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase block mb-1">
                        Objet :
                      </label>
                      <input
                        type="text"
                        placeholder="Objet de votre e-mail..."
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase block mb-1">
                        Message :
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Rédigez votre message..."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSendConfirmation(true)}
                    disabled={!recipient || !emailSubject || !emailBody}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-['Rajdhani'] font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer l'e-mail</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog before sending emails */}
        {showSendConfirmation && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#070f22] border-2 border-cyan-400 rounded-xl p-5 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h4 className="font-['Orbitron'] text-sm font-bold text-cyan-300 uppercase">
                  CONFIRMATION D'ENVOI D'E-MAIL
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-['Rajdhani']">
                Êtes-vous certain de vouloir envoyer cet e-mail depuis votre compte{' '}
                <strong className="text-cyan-200">{currentUser?.email}</strong> ?
              </p>
              <div className="p-3 rounded-lg bg-black/60 border border-cyan-500/20 text-xs mb-4 space-y-1">
                <div><span className="text-slate-400">À :</span> <span className="text-white font-semibold">{recipient}</span></div>
                <div><span className="text-slate-400">Objet :</span> <span className="text-white font-semibold">{emailSubject}</span></div>
                <div className="text-[11px] text-slate-400 truncate mt-1">{emailBody}</div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowSendConfirmation(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSendEmail}
                  disabled={isSending}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-['Rajdhani'] tracking-wider uppercase cursor-pointer"
                >
                  {isSending ? 'Envoi en cours...' : "Confirmer l'envoi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

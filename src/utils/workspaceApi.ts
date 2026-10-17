import { getAccessToken } from './workspaceAuth';

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  isUnread: boolean;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
}

async function getAuthHeader() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Connexion Google requise. Veuillez vous connecter avec votre adresse e-mail.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// 1. GMAIL: Fetch recent emails
export async function fetchRecentEmails(maxResults = 5): Promise<GmailMessageItem[]> {
  const headers = await getAuthHeader();
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
    { headers }
  );

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur lors de la récupération des e-mails');
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const items: GmailMessageItem[] = [];
  for (const msg of listData.messages.slice(0, maxResults)) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers }
      );
      if (msgRes.ok) {
        const fullMsg = await msgRes.json();
        const headersList = fullMsg.payload?.headers || [];
        const getHeader = (name: string) =>
          headersList.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const subject = getHeader('subject') || '(Sans objet)';
        const from = getHeader('from') || 'Expéditeur inconnu';
        const date = getHeader('date') || '';
        const isUnread = Boolean(fullMsg.labelIds?.includes('UNREAD'));

        items.push({
          id: fullMsg.id,
          threadId: fullMsg.threadId,
          snippet: fullMsg.snippet || '',
          from,
          subject,
          date,
          isUnread,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch individual email details', e);
    }
  }

  return items;
}

// 2. GMAIL: Send an email directly
export async function sendEmailDirectly(to: string, subject: string, bodyText: string): Promise<any> {
  const headers = await getAuthHeader();
  
  // Construct RFC 2822 email message
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ];
  const rawEmail = emailLines.join('\r\n');
  
  // Base64url encode
  const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers,
    body: JSON.stringify({ raw: encodedEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Erreur lors de l'envoi de l'e-mail");
  }

  return await res.json();
}

// 3. CALENDAR: Fetch upcoming events
export async function fetchUpcomingEvents(maxResults = 5): Promise<CalendarEventItem[]> {
  const headers = await getAuthHeader();
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur lors de la récupération du calendrier');
  }

  const data = await res.json();
  const items = (data.items || []).map((e: any) => ({
    id: e.id,
    summary: e.summary || '(Sans titre)',
    description: e.description,
    start: e.start?.dateTime || e.start?.date || '',
    end: e.end?.dateTime || e.end?.date || '',
    location: e.location,
    htmlLink: e.htmlLink,
  }));

  return items;
}

// 4. CALENDAR: Create an event
export async function createCalendarEvent(
  summary: string,
  startTimeIso: string,
  endTimeIso: string,
  description?: string
): Promise<any> {
  const headers = await getAuthHeader();
  const body = {
    summary,
    description: description || 'Créé automatiquement par J.A.R.V.I.S.',
    start: { dateTime: startTimeIso },
    end: { dateTime: endTimeIso },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Erreur lors de la création de l'événement");
  }

  return await res.json();
}

// 5. TASKS: Fetch tasks from default list
export async function fetchGoogleTasks(): Promise<GoogleTaskItem[]> {
  const headers = await getAuthHeader();
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur lors de la récupération des tâches');
  }

  const data = await res.json();
  return (data.items || []).map((t: any) => ({
    id: t.id,
    title: t.title || '(Tâche)',
    notes: t.notes,
    status: t.status,
    due: t.due,
    updated: t.updated,
  }));
}

// 6. TASKS: Create a new task
export async function createGoogleTask(title: string, notes?: string): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title,
      notes: notes || 'Créée par J.A.R.V.I.S.',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur lors de la création de la tâche');
  }

  return await res.json();
}

// 7. DRIVE: Fetch recent files
export async function fetchDriveFiles(maxResults = 5): Promise<DriveFileItem[]> {
  const headers = await getAuthHeader();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&orderBy=modifiedTime%20desc&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur lors de la lecture des fichiers Drive');
  }

  const data = await res.json();
  return data.files || [];
}

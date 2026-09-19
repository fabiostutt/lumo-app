import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

type GoogleTokenRow = {
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expires_at: string | null;
};

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Falha ao renovar token do Google: ${body}`);
  }

  return JSON.parse(body) as { access_token: string; expires_in: number };
}

// Retorna um access token válido do Google para o usuário, renovando via
// refresh token quando necessário. Retorna null se o usuário nunca conectou
// o Google Calendar (login antigo, sem o escopo de calendário).
export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("google_access_token, google_refresh_token, google_token_expires_at")
    .eq("id", userId)
    .single<GoogleTokenRow>();

  if (!profile?.google_refresh_token) return null;

  const expiresAt = profile.google_token_expires_at ? new Date(profile.google_token_expires_at) : null;
  const stillValid = expiresAt !== null && expiresAt.getTime() - Date.now() > 60_000;

  if (profile.google_access_token && stillValid) {
    return profile.google_access_token;
  }

  const { access_token, expires_in } = await refreshAccessToken(profile.google_refresh_token);
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  await supabaseAdmin
    .from("profiles")
    .update({ google_access_token: access_token, google_token_expires_at: newExpiresAt })
    .eq("id", userId);

  return access_token;
}

type CreateEventParams = {
  accessToken: string;
  summary: string;
  description?: string;
  startDateTime: string; // RFC3339, com offset
  endDateTime: string; // RFC3339, com offset
  timeZone: string;
  attendeeEmail?: string | null;
};

type CalendarEvent = {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
};

export async function createCalendarEvent({
  accessToken,
  summary,
  description,
  startDateTime,
  endDateTime,
  timeZone,
  attendeeEmail,
}: CreateEventParams): Promise<CalendarEvent> {
  const res = await fetch(`${CALENDAR_EVENTS_URL}?sendUpdates=all&conferenceDataVersion=1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${body}`);
  }

  return JSON.parse(body) as CalendarEvent;
}

type UpdateEventParams = {
  summary?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmail?: string | null;
};

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: UpdateEventParams
): Promise<CalendarEvent> {
  const res = await fetch(`${CALENDAR_EVENTS_URL}/${eventId}?sendUpdates=all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: updates.summary,
      description: updates.description,
      start: { dateTime: updates.startDateTime, timeZone: updates.timeZone },
      end: { dateTime: updates.endDateTime, timeZone: updates.timeZone },
      attendees: updates.attendeeEmail ? [{ email: updates.attendeeEmail }] : undefined,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Google Calendar API error ao atualizar evento: ${body}`);
  }

  return JSON.parse(body) as CalendarEvent;
}

type CalendarEventWithAttendees = CalendarEvent & {
  attendees?: Array<{ email: string; responseStatus: string; self?: boolean }>;
};

export async function getCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<CalendarEventWithAttendees> {
  const res = await fetch(`${CALENDAR_EVENTS_URL}/${eventId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Google Calendar API error ao buscar evento: ${body}`);
  }

  return JSON.parse(body) as CalendarEventWithAttendees;
}

export async function deleteCalendarEvent(accessToken: string, eventId: string) {
  const res = await fetch(`${CALENDAR_EVENTS_URL}/${eventId}?sendUpdates=all`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 410 Gone = já foi excluído antes; tratamos como sucesso.
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Google Calendar API error ao excluir evento: ${body}`);
  }
}

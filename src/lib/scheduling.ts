// Utilitário isomórfico (sem "use server"/"use client") — usado tanto pelo
// formulário (preview client-side) quanto pela Server Action (checagem real
// de conflito), pra manter os dois cálculos sempre idênticos.

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAYS_BUSINESS = [1, 2, 3, 4, 5];

// Limite deliberado: gerar a série toda de uma vez (sem data-fim, já que o
// profissional raramente sabe até quando vai repetir) tem que ficar dentro do
// tempo de execução de uma Server Action e não pode virar centenas de
// eventos no Google Calendar de uma tacada só.
export const MAX_RECURRENCE_OCCURRENCES = 12;
const MAX_SCAN_DAYS = 400;

function toLocalDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`);
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Sempre inclui a data inicial (é o dia que o profissional escolheu
// explicitamente), depois avança dia a dia procurando os weekdays marcados
// até bater o limite de ocorrências.
export function generateRecurrenceDates(
  startDate: string,
  weekdays: number[],
  maxOccurrences: number = MAX_RECURRENCE_OCCURRENCES
): string[] {
  const dates = [startDate];
  if (weekdays.length === 0) return dates;

  const weekdaySet = new Set(weekdays);
  const cursor = toLocalDate(startDate);

  for (let i = 1; dates.length < maxOccurrences && i <= MAX_SCAN_DAYS; i++) {
    cursor.setDate(cursor.getDate() + 1);
    if (weekdaySet.has(cursor.getDay())) {
      dates.push(toISO(cursor));
    }
  }

  return dates;
}

function timeToMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export type SchedulingConflict = {
  date: string;
  time: string;
  clientName: string;
};

type ExistingSessionRow = {
  id: string;
  date: string;
  time: string;
  duration_minutes: number | null;
  clients: { name: string } | null;
};

// Recebe as linhas já buscadas do banco (owner_id + datas candidatas) e só
// calcula a sobreposição — mantém o SQL fora daqui pra ficar testável e
// reutilizável entre criar/editar sessão.
export function findConflicts(
  candidates: { date: string; time: string; durationMinutes: number }[],
  existingSessions: ExistingSessionRow[],
  excludeSessionId?: string
): SchedulingConflict[] {
  const conflicts: SchedulingConflict[] = [];

  for (const candidate of candidates) {
    const candidateStart = timeToMinutes(candidate.time);
    const candidateEnd = candidateStart + candidate.durationMinutes;

    for (const existing of existingSessions) {
      if (existing.id === excludeSessionId) continue;
      if (existing.date !== candidate.date) continue;

      const existingStart = timeToMinutes(existing.time);
      const existingEnd = existingStart + (existing.duration_minutes ?? 50);

      if (rangesOverlap(candidateStart, candidateEnd, existingStart, existingEnd)) {
        conflicts.push({
          date: existing.date,
          time: existing.time.slice(0, 5),
          clientName: existing.clients?.name ?? "outro cliente",
        });
      }
    }
  }

  return conflicts;
}

export function formatConflictsMessage(conflicts: SchedulingConflict[]): string {
  const lines = conflicts
    .map((c) => {
      const [, month, day] = c.date.split("-");
      return `${day}/${month} às ${c.time} (${c.clientName})`;
    })
    .join(", ");
  return `Conflito de horário com: ${lines}`;
}

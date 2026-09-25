// Utilitário isomórfico (sem "use server"/"use client") — usado tanto pelo
// formulário (preview client-side) quanto pela Server Action (checagem real
// de conflito), pra manter os dois cálculos sempre idênticos.

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

function sundayOf(d: Date) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Sempre inclui a data inicial (é o dia que o profissional escolheu
// explicitamente), depois avança dia a dia procurando os weekdays marcados
// até bater o limite de ocorrências. `interval` cobre o caso "toda quarta,
// mas só de 15 em 15 dias" (interval=2) — só conta semanas cujo início
// (domingo) esteja a um múltiplo de `interval` semanas da semana inicial.
export function generateRecurrenceDates(
  startDate: string,
  weekdays: number[],
  interval: number = 1,
  maxOccurrences: number = MAX_RECURRENCE_OCCURRENCES
): string[] {
  const dates = [startDate];
  if (weekdays.length === 0) return dates;

  const safeInterval = Math.max(1, interval);
  const weekdaySet = new Set(weekdays);
  const startWeekStart = sundayOf(toLocalDate(startDate));
  const cursor = toLocalDate(startDate);

  for (let i = 1; dates.length < maxOccurrences && i <= MAX_SCAN_DAYS; i++) {
    cursor.setDate(cursor.getDate() + 1);
    if (!weekdaySet.has(cursor.getDay())) continue;

    const weeksSinceStart = Math.round((sundayOf(cursor).getTime() - startWeekStart.getTime()) / MS_PER_WEEK);
    if (weeksSinceStart % safeInterval === 0) {
      dates.push(toISO(cursor));
    }
  }

  return dates;
}

// A UI agora oferece só esses 5 presets (bottom sheet "Selecione a
// recorrência"), sem seleção manual de weekdays/intervalo.
export type RecurrencePreset = "none" | "daily" | "weekly" | "biweekly" | "monthly";

export const RECURRENCE_PRESET_LABELS: Record<RecurrencePreset, string> = {
  none: "Não se repete",
  daily: "Todos os dias",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

// "Mensal" não é um múltiplo de semanas — não dá pra expressar via
// weekdays+interval, então avança mês a mês preservando o dia (clampando pro
// último dia do mês quando ele não existir, ex: 31/jan -> 28 ou 29/fev).
function generateMonthlyDates(startDate: string, maxOccurrences: number): string[] {
  const start = toLocalDate(startDate);
  const day = start.getDate();
  const dates = [startDate];

  for (let i = 1; dates.length < maxOccurrences; i++) {
    const targetMonth = start.getMonth() + i;
    const lastDayOfTargetMonth = new Date(start.getFullYear(), targetMonth + 1, 0).getDate();
    const next = new Date(start.getFullYear(), targetMonth, Math.min(day, lastDayOfTargetMonth));
    dates.push(toISO(next));
  }

  return dates;
}

export function generateRecurrenceDatesForPreset(
  startDate: string,
  preset: RecurrencePreset,
  maxOccurrences: number = MAX_RECURRENCE_OCCURRENCES
): string[] {
  if (preset === "none") return [startDate];
  if (preset === "monthly") return generateMonthlyDates(startDate, maxOccurrences);

  const weekday = toLocalDate(startDate).getDay();
  const weekdays = preset === "daily" ? [0, 1, 2, 3, 4, 5, 6] : [weekday];
  const interval = preset === "biweekly" ? 2 : 1;
  return generateRecurrenceDates(startDate, weekdays, interval, maxOccurrences);
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

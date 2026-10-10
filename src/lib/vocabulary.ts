// Vocabulário adaptável por área profissional. Módulo puro — sem imports de
// servidor, sem React — pra poder ser usado tanto no cliente quanto no
// servidor sem trazer nada junto.

export type AreaId =
  | "psicologia"
  | "terapia"
  | "medicina"
  | "nutricao"
  | "educacao"
  | "fisioterapia"
  | "recursos_humanos"
  | "consultoria"
  | "personal_trainer"
  | "outros";

export const AREAS: { id: AreaId; label: string }[] = [
  { id: "psicologia", label: "Psicologia" },
  { id: "terapia", label: "Terapia" },
  { id: "medicina", label: "Medicina" },
  { id: "nutricao", label: "Nutrição" },
  { id: "educacao", label: "Educação" },
  { id: "fisioterapia", label: "Fisioterapia" },
  { id: "recursos_humanos", label: "Recursos Humanos" },
  { id: "consultoria", label: "Consultoria" },
  { id: "personal_trainer", label: "Personal Trainer" },
  { id: "outros", label: "Outros" },
];

type VocabularyEntry = {
  event: { singular: string; plural: string };
  person: { singular: string; plural: string };
  attendee: string;
};

const DEFAULT_ENTRY: VocabularyEntry = {
  event: { singular: "sessão", plural: "sessões" },
  person: { singular: "cliente", plural: "clientes" },
  attendee: "participante",
};

const VOCABULARY: Record<AreaId, VocabularyEntry> = {
  psicologia: {
    event: { singular: "sessão", plural: "sessões" },
    person: { singular: "paciente", plural: "pacientes" },
    attendee: "paciente",
  },
  terapia: {
    event: { singular: "sessão", plural: "sessões" },
    person: { singular: "cliente", plural: "clientes" },
    attendee: "participante",
  },
  medicina: {
    event: { singular: "consulta", plural: "consultas" },
    person: { singular: "paciente", plural: "pacientes" },
    attendee: "paciente",
  },
  nutricao: {
    event: { singular: "consulta", plural: "consultas" },
    person: { singular: "paciente", plural: "pacientes" },
    attendee: "paciente",
  },
  fisioterapia: {
    event: { singular: "sessão", plural: "sessões" },
    person: { singular: "paciente", plural: "pacientes" },
    attendee: "paciente",
  },
  educacao: {
    event: { singular: "aula", plural: "aulas" },
    person: { singular: "estudante", plural: "estudantes" },
    attendee: "estudante",
  },
  personal_trainer: {
    event: { singular: "sessão", plural: "sessões" },
    person: { singular: "cliente", plural: "clientes" },
    attendee: "participante",
  },
  recursos_humanos: {
    event: { singular: "reunião", plural: "reuniões" },
    person: { singular: "cliente", plural: "clientes" },
    attendee: "participante",
  },
  consultoria: {
    event: { singular: "reunião", plural: "reuniões" },
    person: { singular: "cliente", plural: "clientes" },
    attendee: "participante",
  },
  outros: DEFAULT_ENTRY,
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function pick(form: { singular: string; plural: string }, n?: number): string {
  return n === 1 ? form.singular : form.plural;
}

export type Vocabulary = {
  event: (n?: number) => string;
  person: (n?: number) => string;
  attendee: () => string;
  Event: (n?: number) => string;
  Person: (n?: number) => string;
  Attendee: () => string;
};

export function getVocabulary(area?: string | null): Vocabulary {
  const entry =
    area && Object.prototype.hasOwnProperty.call(VOCABULARY, area)
      ? VOCABULARY[area as AreaId]
      : DEFAULT_ENTRY;

  const event = (n?: number) => pick(entry.event, n);
  const person = (n?: number) => pick(entry.person, n);
  const attendee = () => entry.attendee;

  return {
    event,
    person,
    attendee,
    Event: (n?: number) => capitalize(event(n)),
    Person: (n?: number) => capitalize(person(n)),
    Attendee: () => capitalize(attendee()),
  };
}

// Resumo do dashboard — "Você tem N sessões agendadas para hoje" com
// concordância de número correta (0, 1, N).
export function getDashboardSummary(count: number, vocab: Vocabulary): string {
  if (count === 0) {
    return `Você não tem ${vocab.event(0)} agendadas para hoje.`;
  }
  if (count === 1) {
    return `Você tem 1 ${vocab.event(1)} agendada para hoje.`;
  }
  return `Você tem ${count} ${vocab.event(count)} agendadas para hoje.`;
}

// Contador de lista — "N clientes cadastrados" vira "{Pessoas}: N".
export function getPersonCountLabel(count: number, vocab: Vocabulary): string {
  return `${vocab.Person(2)}: ${count}`;
}

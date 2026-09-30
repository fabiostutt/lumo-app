function buildWhatsAppTo(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

// Usada quando o link em si é útil pro destinatário (ex.: compartilhar um
// link externo do Google Meet) — inclui a URL na mensagem.
export function buildWhatsAppShareUrl(whatsapp: string, clientName: string, meetingUrl: string, time: string) {
  const text = `Olá, ${clientName}! Aqui está o link da nossa sessão de hoje às ${time}: ${meetingUrl}`;
  return `https://wa.me/${buildWhatsAppTo(whatsapp)}?text=${encodeURIComponent(text)}`;
}

// Usada quando a "sessão" já É a conversa no WhatsApp — sem link, porque
// mandar de volta o próprio wa.me do destinatário não faz sentido.
export function buildWhatsAppReminderUrl(whatsapp: string, clientName: string, time: string) {
  const text = `Olá, ${clientName}! Passando para lembrar da nossa sessão hoje às ${time}. Até já!`;
  return `https://wa.me/${buildWhatsAppTo(whatsapp)}?text=${encodeURIComponent(text)}`;
}

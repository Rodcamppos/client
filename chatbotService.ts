const sessions: Record<string, { lastMessage: string }> = {};

const responses = {
  greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
  help: ['ajuda', 'socorro', 'informação'],
  goodbye: ['tchau', 'até logo', 'até mais'],
};

export function processUserMessage(message: string, sessionId: string): string {
  if (!sessionId) {
    return 'Sessão inválida. Por favor, forneça um ID de sessão.';
  }

  const msg = message.toLowerCase();

  if (!sessions[sessionId]) {
    sessions[sessionId] = { lastMessage: '' };
  }

  sessions[sessionId].lastMessage = message;

  if (responses.greeting.some(word => msg.includes(word))) {
    return 'Olá! 👋 Como posso ajudar você?';
  }
  if (responses.help.some(word => msg.includes(word))) {
    return 'Claro! Estou aqui para ajudar. Me diga sua dúvida!';
  }
  if (responses.goodbye.some(word => msg.includes(word))) {
    return 'Tchau! 👋 Até a próxima!';
  }
  if (msg.includes('histórico')) {
    return `Você me disse antes: "${sessions[sessionId].lastMessage}"`;
  }

  return 'Desculpe, ainda estou aprendendo a responder isso. 😊';
}

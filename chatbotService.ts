import axios, { AxiosRequestConfig } from 'axios';

const sessions: Record<string, { lastMessage: string }> = {};
const ruleBasedResponses = {
  greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
  help: ['ajuda', 'socorro', 'informação'],
  goodbye: ['tchau', 'até logo', 'até mais'],
};

interface StructuredResponse {
  type: 'success' | 'fallback';
  message: string;
  options?: Array<{ text: string; action: string }>;
}

async function callExternalAIService(message: string, sessionId: string): Promise<{ text?: string; confidence?: number; error?: string }> {
  const AI_SERVICE_URL = 'URL_DO_SEU_SERVICO_DE_IA_AQUI'; // Substitua pela URL real
  const AI_API_KEY = process.env.AI_API_KEY; // Exemplo: pegar de variáveis de ambiente
  const AI_REQUEST_TIMEOUT_MS = 8000; // 8 segundos de timeout

  if (!AI_API_KEY) {
    console.error("Chave da API de IA não configurada!");
    return { error: "Configuração de IA ausente no servidor." };
  }

  try {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: AI_SERVICE_URL,
      data: {
        userInput: message,
        sessionId: sessionId, // Envia o sessionId para a IA, se ela suportar
      },
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: AI_REQUEST_TIMEOUT_MS,
    };

    const response = await axios(config);

    if (message.toLowerCase().includes("problema sério")) {
        return { error: "Simulação de erro da IA" };
    }
    if (message.toLowerCase().includes("baixa confiança")) {
        return { text: "Eu *acho* que você quis dizer X, mas não tenho certeza.", confidence: 0.4 };
    }
    return { text: `IA processou: ${message}`, confidence: 0.9 };

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error(`Timeout ao chamar a IA externa após ${AI_REQUEST_TIMEOUT_MS}ms`, error.message);
      return { error: 'AI service timeout' };
    }
    console.error('Erro ao chamar o serviço de IA externo:', error.message);
    return { error: 'AI service communication error' };
  }
}


export async function processUserMessage(message: string, sessionId: string): Promise<StructuredResponse> {
  if (!sessionId) {
    return {
      type: 'fallback',
      message: 'Sessão inválida. Por favor, forneça um ID de sessão.',
    };
  }

  const msgLowerCase = message.toLowerCase();

  if (ruleBasedResponses.greeting.some(word => msgLowerCase.includes(word))) {
    return { type: 'success', message: 'Olá! 👋 Como posso ajudar você?' };
  }
  if (ruleBasedResponses.goodbye.some(word => msgLowerCase.includes(word))) {
    return { type: 'success', message: 'Tchau! 👋 Até a próxima!' };
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = { lastMessage: '' };
  }
  sessions[sessionId].lastMessage = message; // Talvez útil para enviar como contexto para a IA

  const aiResult = await callExternalAIService(message, sessionId);
  const MINIMUM_CONFIDENCE_THRESHOLD = parseFloat(process.env.API_MINIMUM_CONFIDENCE || "0.7");

  if (aiResult.error) {
    // Erro na chamada da IA (timeout, erro de comunicação, erro interno da IA)    console.error(`Erro da IA para sessionId ${sessionId}: ${aiResult.error}`);
    let userMessage = 'Desculpe, tive um problema para processar sua solicitação no momento.';
    if (aiResult.error === 'AI service timeout') {
        userMessage = 'Desculpe, estou demorando muito para responder. Poderia tentar novamente em instantes?';
    }
    return {
      type: 'fallback',
      message: userMessage,
      options: [{ text: 'Tentar reformular', action: 'RETRY_INPUT' }, { text: 'Preciso de ajuda', action: 'SHOW_HELP_OPTIONS' }]
    };
  }

  if (aiResult.text && (aiResult.confidence === undefined || aiResult.confidence >= MINIMUM_CONFIDENCE_THRESHOLD)) {
    return { type: 'success', message: aiResult.text };
  } else {
    // Baixa confiança da IA ou texto vazio, mesmo sem erro explícito
    const fallbackMessage = aiResult.text ?
      `Hum, não tenho certeza se entendi bem. Você quis dizer algo sobre "${aiResult.text.substring(0,50)}..."? Tente reformular.` :
      'Desculpe, não consegui processar sua pergunta como esperado. Poderia tentar de outra forma?';
    return {
      type: 'fallback',
      message: fallbackMessage,
      options: [{ text: 'Sim, reformular', action: 'RETRY_INPUT' }, { text: 'Não, ver ajuda', action: 'SHOW_HELP_OPTIONS' }]
    };
  }
}

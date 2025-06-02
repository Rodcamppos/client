import { Request, Response } from 'express';
import { processUserMessage } from '../services/chatbotService';

interface StructuredResponse {
  type: 'success' | 'fallback';
  message: string;
  options?: Array<{ text: string; action: string }>;
}

export const handleUserMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        type: 'fallback',
        message: 'Mensagem e sessionId são obrigatórios para continuar.'
      } as StructuredResponse);
    }

    const structuredApiResponse: StructuredResponse = await processUserMessage(message, sessionId);

    return res.json(structuredApiResponse);

  } catch (error: any) {
    console.error('Erro no handleUserMessage:', error);

    return res.status(500).json({
      type: 'fallback',
      message: 'Desculpe, ocorreu um problema interno e não consegui processar sua solicitação. Por favor, tente novamente mais tarde.'
    } as StructuredResponse);
  }
};

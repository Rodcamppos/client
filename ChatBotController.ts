import { Request, Response } from 'express';
import { processUserMessage } from '../services/chatbotService';

export const handleUserMessage = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ 
        type: 'fallback',
        message: 'Mensagem prévia e sessionId são obrigatórios para continuar.' 
      });
    }

    const structuredApiResponse = await processUserMessage(message, sessionId);
    
    return res.json(structuredApiResponse);

  } catch (error: any) {
    console.error('Erro no handleUserMessage:', error);
    return res.status(500).json({ 
      type: 'fallback',
      message: 'Desculpe, não consegui entender sua pergunta agora. Por favor, tente novamente ou reformule sua dúvida.' 
    });
  }
};

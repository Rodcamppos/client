import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Chat.css"; // Seu arquivo CSS
import { FaPaperPlane } from "react-icons/fa";
import { IoMdSearch, IoMdChatboxes } from "react-icons/io";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'success' | 'fallback'; // Para diferenciar respostas normais de fallbacks
  options?: Array<{ text: string; action: string }>; // Para as opções de fallback
}

interface Conversation {
  id: string;
  title: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    const userInput = currentMessage.trim();
    if (userInput === "") {
      return;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
    };
    setActiveMessages(prevMessages => [...prevMessages, newUserMessage]);
    setCurrentMessage(""); 
    setIsLoading(true);

    try {
      // Chamada da nossa API BACKEND aqui.
      const response = await axios.post('http://localhost:3000/api/chat', { // <<< PRECISAMOS AJUSTAR AQUI!
        message: userInput,
      });

      const botApiResponse = response.data;

      const newBotMessage: ChatMessage = {
        id: Date.now().toString() + "_bot",
        text: botApiResponse.message,
        sender: 'bot',
        type: botApiResponse.type,
        options: botApiResponse.options || [], // Garante que options seja um array
      };
      setActiveMessages(prevMessages => [...prevMessages, newBotMessage]);

    } catch (error) {
      console.error("Erro ao enviar mensagem para API:", error);
      const errorBotMessage: ChatMessage = {
        id: Date.now().toString() + "_bot_error",
        text: "Desculpe, ocorreu um erro ao tentar obter uma resposta. Tente novamente.",
        sender: 'bot',
        type: 'fallback'
      };
      setActiveMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const handleOptionClick = (action: string, optionText: string) => {
    console.log("Opção de fallback clicada:", action, optionText);

    const userChoiceMessage: ChatMessage = {
      id: Date.now().toString() + "_user_choice",
      text: optionText, 
      sender: 'user',
    };
    setActiveMessages(prevMessages => [...prevMessages, userChoiceMessage]);
    setCurrentMessage(optionText);
    
    const sendOptionAsMessage = async (messageText: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/chat', { // <<< PRECISAMOS AJUSTAR A URL PARA A REAL!
                message: messageText,
            });
            const botApiResponse = response.data;
            const newBotMessage: ChatMessage = {
                id: Date.now().toString() + "_bot_option_response",
                text: botApiResponse.message,
                sender: 'bot',
                type: botApiResponse.type,
                options: botApiResponse.options || [],
            };
            setActiveMessages(prevMessages => [...prevMessages, newBotMessage]);
        } catch (error) {
            console.error("Erro ao enviar opção para API:", error);
            const errorBotMessage: ChatMessage = {
                id: Date.now().toString() + "_bot_error_option",
                text: "Desculpe, ocorreu um erro ao processar sua escolha.",
                sender: 'bot',
                type: 'fallback',
            };
            setActiveMessages(prevMessages => [...prevMessages, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    sendOptionAsMessage(optionText);
  };

  return (
    <div className="chat-container">
      <div className="top-bar">
        <img src="/AutBot_Logo.png" alt="Logo AutBot" className="top-bar-logo" />
        <button className="botao-inicio">AutBot</button>
        <div className="top-bar-links">
          <button className="botao-sobre">Sobre</button>
          <button className="botao-perfil">Perfil</button>
        </div>
      </div>
      <aside className="sidebar">
        <div className="icon-section">
          <button title="buscar chat" className="send-button" ><IoMdSearch /></button>
          <button title="criar um novo chat" className="send-button"><IoMdChatboxes /></button>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 && (
            <p className="no-conversations-message">Nenhuma conversa ainda.</p>
          )}
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className="conversation-item"
              title={convo.title}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {convo.title}
            </div>
          ))}
        </div>
      </aside>

      <div className="main-chat">
        <header className="chat-header">
          <div></div>
          <div className="menu-links">
            {/* <a href="#">Sobre</a>
            <a href="#">Perfil</a> */}
          </div>
        </header>

        <main className="chat-body">
          {activeMessages.length === 0 && !isLoading && (
            <div className="chat-card-placeholder">
              <h2>Em que posso ajudar?</h2>
            </div>
          )}

          <div className="messages-list"> {/* Contêiner para as mensagens */}
            {activeMessages.map((msg) => (
              <div key={msg.id} className={`message-item message-item-${msg.sender}`}>
                <p className="message-text">{msg.text}</p>
                {msg.sender === 'bot' && msg.type === 'fallback' && msg.options && msg.options.length > 0 && (
                  <div className="fallback-options-container">
                    {msg.options.map((option, index) => (
                      <button
                        key={index}
                        className="fallback-option-button"
                        onClick={() => handleOptionClick(option.action, option.text)}
                        disabled={isLoading} // Desabilita botões enquanto carrega
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Indicador de "digitando..." */}
            {isLoading && (
              <div className="message-item message-item-bot">
                <p className="message-text typing-indicator">AutBot está digitando...</p>
              </div>
            )}
          </div>
        </main>

        <footer className="chat-footer"> {/* Movido input para um footer */}
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Escreva sua mensagem aqui..."
              value={currentMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              type="button"
              className="send-button"
              onClick={handleSendMessage}
              title="Enviar mensagem"
              aria-label="Enviar mensagem"
              disabled={isLoading || currentMessage.trim() === ""} // Desabilita se estiver carregando ou input vazio
            >
              <FaPaperPlane />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chat;

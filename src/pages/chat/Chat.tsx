import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import "./Chat.css";
import { FaPaperPlane } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { IoMdChatboxes } from "react-icons/io";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'success' | 'fallback'; // Para diferenciar respostas normais de fallbacks
  options?: Array<{ text: string; action: string }>; // Para as opções de fallback
}

const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);

const Chat = () => {

    const navigate = useNavigate();
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(event.target.value);
  };

    const handleSendMessage = () => {
    if (currentMessage.trim() === "") {
      return; 
    }

    const newConversation: Conversation = {
      id: Date.now().toString(), 
      title: currentMessage.trim(),
    };


    setConversations(prevConversations => [newConversation, ...prevConversations]);
    setCurrentMessage(""); 
  };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
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
            <a href="#">Sobre</a>
            <a href="#">Perfil</a>
          </div>
        </header>

        <main className="chat-body">
          <div className="chat-card">
            <h2>Em que posso ajudar?</h2>
            <div className="chat-input-container">
                            <input
                type="text"
                placeholder="Escreva sua mensagem aqui..."
                value={currentMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} 
              />
                <button
                type="button"
                className="send-button"
                onClick={handleSendMessage}
                title="Enviar mensagem"
                aria-label="Enviar mensagem"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;

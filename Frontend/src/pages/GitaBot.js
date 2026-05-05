import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/GitaBot.css";

const API_URL = process.env.REACT_APP_API_URL;

const SENTIMENT_CONFIG = {
  happy: { emoji: "😊", label: "Happy" },
  sad: { emoji: "😔", label: "Sad" },
  anxious: { emoji: "😰", label: "Anxious" },
  confused: { emoji: "🤔", label: "Confused" },
  angry: { emoji: "😤", label: "Angry" },
  hopeful: { emoji: "🌟", label: "Hopeful" },
  grateful: { emoji: "✨", label: "Grateful" },
  neutral: { emoji: "😌", label: "Neutral" },
};

const SUGGESTIONS = [
  {
    icon: "🕉️",
    text: "What does the Gita say about overcoming fear and anxiety?",
  },
  {
    icon: "🧘",
    text: "How can I find inner peace according to Lord Krishna?",
  },
  {
    icon: "⚡",
    text: "I feel lost in life. What is my dharma?",
  },
  {
    icon: "🪷",
    text: "Explain karma yoga and how to practice detachment.",
  },
];

function GitaBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      return;
    }
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const buildConversationHistory = () => {
    return messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.text,
      }));
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setError(null);
    const userMessage = {
      id: Date.now(),
      role: "user",
      text: messageText,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = buildConversationHistory();
      const response = await axios.post(`${API_URL}/api/geeta-bot/chat`, {
        message: messageText,
        conversationHistory,
      });

      const { reply, sentiment, verse } = response.data;
      
      let cleanReply = reply || "";
      
      // Remove any markdown code blocks that leaked through
      cleanReply = cleanReply.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      
      // If the string starts with '{', it might be unparsed or broken JSON
      if (cleanReply.startsWith('{')) {
         try {
            const parsedObj = JSON.parse(cleanReply);
            if (parsedObj.reply) {
               cleanReply = parsedObj.reply;
            }
         } catch(e) {
            // Aggressive fallback to rip out just the reply text
            const match = cleanReply.match(/"reply"\s*:\s*"([\s\S]*?)"(?=\s*(?:,\s*"sentiment"|}))/i);
            if (match && match[1]) {
               cleanReply = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
            } else {
               // Strip literal formatting as a last resort
               cleanReply = cleanReply.replace(/^\{\s*"reply"\s*:\s*"/i, '')
                                      .replace(/"\s*,\s*"sentiment"[\s\S]*$/i, '')
                                      .replace(/"\s*\}\s*$/i, '')
                                      .trim();
            }
         }
      }

      setCurrentSentiment(sentiment);

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: cleanReply,
        time: formatTime(),
        sentiment,
        verse:
          verse && (verse.chapter || verse.sanskrit)
            ? verse
            : null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        err.response?.data?.error ||
          "Could not connect to Sarthi. Please check if the server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSentiment(null);
    setError(null);
  };

  const sentimentInfo = currentSentiment
    ? SENTIMENT_CONFIG[currentSentiment] || SENTIMENT_CONFIG.neutral
    : null;

  return (
    <div className="sarthi-page">
      {/* ── Sidebar ── */}
      <aside className="sarthi-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon ">✨</div>
            <div className="sidebar-brand-text">
              <h1>Sarthi</h1>
              <p>Gita Wisdom Guide</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-new-chat" onClick={handleNewChat}>
            <i className="bi bi-plus-lg"></i>
            New Conversation
          </button>

          <p className="sidebar-section-label">Menu</p>
          <button className="sidebar-link active">
            <i className="bi bi-chat-dots"></i>
            Chat with Sarthi
          </button>
         
          <button className="sidebar-link" onClick={() => navigate("/user")}>
            <i className="bi bi-grid"></i>
            Dashboard
          </button>

          <p className="sidebar-section-label">Topics</p>
          <button
            className="sidebar-link"
            onClick={() =>
              sendMessage("Tell me about Karma Yoga from the Bhagavad Gita")
            }
          >
            <i className="bi bi-lightning"></i>
            Karma Yoga
          </button>
          <button
            className="sidebar-link"
            onClick={() =>
              sendMessage("Explain Bhakti Yoga as described in the Gita")
            }
          >
            <i className="bi bi-heart"></i>
            Bhakti Yoga
          </button>
          <button
            className="sidebar-link"
            onClick={() =>
              sendMessage("What is Jnana Yoga according to Lord Krishna?")
            }
          >
            <i className="bi bi-book"></i>
            Jnana Yoga
          </button>
          <button
            className="sidebar-link"
            onClick={() =>
              sendMessage("How does the Gita describe Dhyana and meditation?")
            }
          >
            <i className="bi bi-peace"></i>
            Dhyana Yoga
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <div className="sidebar-avatar">RS</div>
            <div>
              <p className="sidebar-user-name">Rishabh S.</p>
              <p className="sidebar-user-role">Student</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <main className="sarthi-main">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">✨</div>
            <div className="chat-header-info">
              <h2>Sarthi — सारथी</h2>
              <p>
                <span className="online-dot"></span>
                Guided by the wisdom of Bhagavad Gita
              </p>
            </div>
          </div>
          <div className="chat-header-right">
            {sentimentInfo && (
              <div
                className={`sentiment-badge sentiment-${currentSentiment}`}
                key={currentSentiment}
              >
                <span className="sentiment-emoji">{sentimentInfo.emoji}</span>
                {sentimentInfo.label}
              </div>
            )}
            
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && !isLoading ? (
            <div className="welcome-screen">
              <div className="welcome-icon">✨</div>
              <h2>
                Namaste, welcome to <span>Sarthi</span>
              </h2>
              <p>
                I am your spiritual guide, drawing wisdom from the Bhagavad
                Gita. Ask me anything about life, purpose, peace, or dharma —
                and I shall illuminate your path with Lord Krishna's teachings.
              </p>
              <div className="welcome-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-card"
                    onClick={() => sendMessage(s.text)}
                  >
                    <span className="suggestion-icon">{s.icon}</span>
                    <p className="suggestion-text">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-row ${msg.role === "assistant" ? "assistant" : msg.role}`}
                >
                  <div className="message-avatar">
                    {msg.role === "assistant" ? "✨" : "👤"}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.text}
                    </div>

                    {/* Verse Card */}
                    {msg.verse && (
                      <div className="verse-card">
                        <p className="verse-label">
                          📖 Bhagavad Gita
                          {msg.verse.chapter
                            ? ` — Chapter ${msg.verse.chapter}${
                                msg.verse.verse
                                  ? `, Verse ${msg.verse.verse}`
                                  : ""
                              }`
                            : ""}
                        </p>
                        {msg.verse.sanskrit && (
                          <p className="verse-sanskrit">
                            {msg.verse.sanskrit}
                          </p>
                        )}
                        {msg.verse.translation && (
                          <p className="verse-translation">
                            {msg.verse.translation}
                          </p>
                        )}
                      </div>
                    )}

                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="message-avatar">✨</div>
                  <div className="typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="error-banner">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <div className="chat-input-box">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sarthi for guidance from the Bhagavad Gita..."
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                title="Send message"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
          <p className="chat-input-hint mb-0  ">
            Sarthi draws wisdom from the Bhagavad Gita • Press Enter to send,
            Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}

export default GitaBot;

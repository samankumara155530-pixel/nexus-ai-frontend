
import { useState } from "react";
import {
  Menu,
  Plus,
  MessageSquare,
  Send,
  Sparkles,
  Settings,
  User,
  Bot,
  PanelLeftClose,
  Paperclip,
  Mic,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: message.trim()
      },
      {
        role: "assistant",
        text: "ඔබගේ පණිවිඩය ලැබුණා. NEXUS AI Backend සම්බන්ධ කිරීම ඊළඟ පියවරේදී සිදු කරමු."
      }
    ]);

    setMessage("");
  }

  function newChat() {
    setMessages([]);
    setMessage("");
  }

  return (
    <div className={`nexus-app ${darkMode ? "dark" : "light"}`}>

      {sidebarOpen && (
        <aside className="sidebar">

          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={23} />
            </div>
            <span>NEXUS AI</span>
            <button onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose size={19} />
            </button>
          </div>

          <button className="new-chat" onClick={newChat}>
            <Plus size={19} />
            New Chat
          </button>

          <div className="sidebar-heading">
            WORKSPACE
          </div>

          <button className="sidebar-item active">
            <MessageSquare size={18} />
            Chat
          </button>

          <button className="sidebar-item">
            <User size={18} />
            Memory
          </button>

          <button className="sidebar-item">
            <Settings size={18} />
            Settings
          </button>

          <div className="sidebar-bottom">
            <div className="user-avatar">N</div>
            <div className="user-info">
              <strong>NEXUS USER</strong>
              <span>Personal Assistant</span>
            </div>
          </div>

        </aside>
      )}

      <main className="main-content">

        <header className="topbar">

          <div className="topbar-left">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}>
                <Menu size={21} />
              </button>
            )}

            <span>NEXUS AI</span>
            <span className="online-status">
              <span></span>
              AI Assistant
            </span>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

        </header>

        <section className="chat-area">

          {messages.length === 0 ? (

            <div className="welcome-screen">

              <div className="welcome-icon">
                <Sparkles size={36} />
              </div>

              <h1>
                Hello, <span>Welcome to NEXUS AI.</span>
              </h1>

              <p>
                Your intelligent personal AI assistant.
                <br />
                Ask anything. Create anything. Explore everything.
              </p>

              <div className="suggestions">

                <button onClick={() => setMessage("Tell me about yourself")}>
                  <Sparkles size={18} />
                  <span>
                    <strong>Get started</strong>
                    <small>Meet your AI assistant</small>
                  </span>
                </button>

                <button onClick={() => setMessage("Help me with programming")}>
                  <Settings size={18} />
                  <span>
                    <strong>Programming</strong>
                    <small>Write and understand code</small>
                  </span>
                </button>

                <button onClick={() => setMessage("Help me learn something new")}>
                  <MessageSquare size={18} />
                  <span>
                    <strong>Learning</strong>
                    <small>Explore new knowledge</small>
                  </span>
                </button>

              </div>

            </div>

          ) : (

            <div className="messages-container">

              {messages.map((item, index) => (

                <div
                  key={index}
                  className={`message-row ${item.role}`}
                >

                  <div className="message-avatar">
                    {item.role === "user"
                      ? <User size={19} />
                      : <Bot size={19} />
                    }
                  </div>

                  <div className="message-content">
                    <strong>
                      {item.role === "user" ? "You" : "NEXUS AI"}
                    </strong>

                    <p>{item.text}</p>
                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <footer className="composer-section">

          <form className="message-form" onSubmit={sendMessage}>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message NEXUS AI..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form.requestSubmit();
                }
              }}
            />

            <div className="composer-actions">

              <div className="composer-tools">
                <button type="button" title="Attach file">
                  <Paperclip size={19} />
                </button>

                <button type="button" title="Voice">
                  <Mic size={19} />
                </button>
              </div>

              <button
                className="send-button"
                type="submit"
                disabled={!message.trim()}
              >
                <Send size={19} />
              </button>

            </div>

          </form>

          <p className="footer-note">
            NEXUS AI can make mistakes. Verify important information.
          </p>

        </footer>

      </main>

    </div>
  );
}

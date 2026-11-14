
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./src/auth";
import {
  Sparkles,
  Send,
  LogOut,
  User
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error) {
        setSession(data.session);
      }
      setLoading(false);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim() || sending) return;

    const text = message.trim();

    setMessages(prev => [
      ...prev,
      { role: "user", text }
    ]);

    setMessage("");
    setSending(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("Backend URL එක සොයාගත නොහැක.");
      }

      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ message: text })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "AI පිළිතුරක් ලැබුණේ නැහැ."
        }
      ]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `දෝෂයක් ඇතිවුණා: ${error.message}`
        }
      ]);
    } finally {
      setSending(false);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    setMessages([]);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        NEXUS AI Loading...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="nexus-app">
      <header className="topbar">
        <div className="brand">
          <Sparkles />
          <strong>NEXUS AI</strong>
        </div>

        <button onClick={logout} className="logout-button">
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <main className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <Sparkles size={40} />
            <h1>Welcome to NEXUS AI</h1>
            <p>Your Intelligent Personal AI Assistant</p>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`message-row ${item.role}`}
              >
                {item.role === "user" ? <User /> : <Sparkles />}
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="composer-section">
        <form onSubmit={sendMessage} className="message-form">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message NEXUS AI..."
            rows={2}
          />

          <button
            type="submit"
            disabled={sending || !message.trim()}
          >
            <Send size={20} />
          </button>
        </form>

        {sending && (
          <p>NEXUS AI පිළිතුර සකස් කරමින්...</p>
        )}
      </footer>
    </div>
  );
}

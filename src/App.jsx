
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./src/Auth.jsx";
import {
  Sparkles,
  Send,
  LogOut,
  User
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error("NEXUS initialization error:", error);

        if (mounted) {
          setInitError(error.message || "Supabase connection failed");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSession(session);
        }
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
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
      const apiUrl = import.meta.env.VITE_BACKEND_URL;

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
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setMessages([]);
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        NEXUS AI Loading...
      </div>
    );
  }

  if (initError) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: "center", padding: "25px" }}>
          <Sparkles size={40} />
          <h2>NEXUS AI Error</h2>
          <p>{initError}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
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

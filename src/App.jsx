import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./src/Auth.jsx";
import {
  Sparkles,
  Send,
  LogOut,
  User,
  Plus,
  MessageSquare,
  Brain,
  RefreshCw,
  Save,
  Trash2
} from "lucide-react";

const API_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

function renderMessageText(value) {
  const normalized = String(value || "").replace(/\\([*_])/g, "$1");
  return normalized.split(/(\\*\\*.*?\\*\\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [memoryText, setMemoryText] = useState("");
  const [memories, setMemories] = useState([]);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const apiRequest = useCallback(async (path, options = {}) => {
    if (!API_URL) throw new Error("Backend URL එක සොයාගත නොහැක.");
    if (!session?.access_token) throw new Error("කරුණාකර නැවත Sign In වන්න.");

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "NEXUS AI සේවාවෙන් දත්ත ලබාගත නොහැක.");
    }
    return data;
  }, [session]);

  const loadConversations = useCallback(async (restoreLatest = false) => {
    const data = await apiRequest("/conversations");
    const items = data.conversations || [];
    setConversations(items);

    if (restoreLatest && items.length) {
      await openConversation(items[0].id);
    }
  }, [apiRequest]);

  const loadMemories = useCallback(async () => {
    const data = await apiRequest("/memories");
    setMemories(data.memories || []);
  }, [apiRequest]);

  const openConversation = useCallback(async (id) => {
    setLoadingHistory(true);
    setNotice("");
    try {
      const data = await apiRequest(`/conversations/${encodeURIComponent(id)}/messages`);
      setConversationId(id);
      setMessages((data.messages || []).map(item => ({
        role: item.role === "user" ? "user" : "assistant",
        text: item.content || "",
        id: item.id
      })));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(data.session);
      } catch (error) {
        if (mounted) setInitError(error.message || "Supabase connection failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setMessages([]);
      setConversations([]);
      setMemories([]);
      setConversationId(null);
      return;
    }

    let active = true;
    (async () => {
      try {
        const [conversationData, memoryData] = await Promise.all([
          apiRequest("/conversations"),
          apiRequest("/memories")
        ]);
        if (!active) return;
        const items = conversationData.conversations || [];
        setConversations(items);
        setMemories(memoryData.memories || []);
        if (items.length) await openConversation(items[0].id);
      } catch (error) {
        if (active) setNotice(error.message);
      }
    })();

    return () => { active = false; };
  }, [session, apiRequest, openConversation]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!message.trim() || sending) return;

    const text = message.trim();
    setMessages(previous => [...previous, { role: "user", text }]);
    setMessage("");
    setSending(true);
    setNotice("");

    try {
      const data = await apiRequest("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          ...(conversationId ? { conversationId } : {})
        })
      });

      if (data.conversationId) setConversationId(data.conversationId);
      setMessages(previous => [...previous, {
        role: "assistant",
        text: data.reply || "AI පිළිතුරක් ලැබුණේ නැහැ.",
        id: data.messageId
      }]);

      const list = await apiRequest("/conversations");
      setConversations(list.conversations || []);
    } catch (error) {
      setMessages(previous => [...previous, {
        role: "assistant",
        text: `දෝෂයක් ඇතිවුණා: ${error.message}`
      }]);
    } finally {
      setSending(false);
    }
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setNotice("අලුත් සංවාදයක් ආරම්භ කළා.");
  }

  async function saveMemory(event) {
    event.preventDefault();
    if (!memoryText.trim() || memoryBusy) return;
    setMemoryBusy(true);
    setNotice("");
    try {
      await apiRequest("/memories", {
        method: "POST",
        body: JSON.stringify({
          memory: memoryText.trim(),
          category: "user_saved",
          importance: 4
        })
      });
      setMemoryText("");
      await loadMemories();
      setNotice("මතකය සාර්ථකව සුරැකුණා.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setMemoryBusy(false);
    }
  }

  async function deleteMemory(id) {
    if (!window.confirm("මෙම මතකය මකා දමන්නද?")) return;
    try {
      await apiRequest(`/memories/${encodeURIComponent(id)}`, { method: "DELETE" });
      await loadMemories();
      setNotice("මතකය මකා දැමුවා.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setNotice(error.message);
      return;
    }
    setMessages([]);
    setConversationId(null);
  }

  if (loading) return <div className="loading-screen">NEXUS AI සූදානම් වෙමින්...</div>;

  if (initError) {
    return <div className="loading-screen"><div className="startup-error">
      <Sparkles size={40} /><h2>NEXUS AI Error</h2><p>{initError}</p>
      <button onClick={() => window.location.reload()}>නැවත උත්සාහ කරන්න</button>
    </div></div>;
  }

  if (!session) return <Auth />;

  return (
    <div className="nexus-app">
      <header className="topbar">
        <div className="brand"><Sparkles /><strong>NEXUS AI</strong></div>
        <div className="topbar-actions">
          <button className="new-chat-button" onClick={startNewConversation}><Plus size={17} /> අලුත් කතාබහක්</button>
          <button onClick={logout} className="logout-button"><LogOut size={18} /> ඉවත් වන්න</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <section className="sidebar-section">
            <h3><MessageSquare size={17} /> කතාබහ ඉතිහාසය</h3>
            <button className="sidebar-new-chat" onClick={startNewConversation}><Plus size={16} /> අලුත් කතාබහ</button>
            {conversations.length === 0 && <p className="muted-text">තවම කතාබහක් නැහැ.</p>}
            <div className="conversation-list">
              {conversations.map(item => (
                <button
                  key={item.id}
                  className={`conversation-item ${conversationId === item.id ? "active" : ""}`}
                  onClick={() => openConversation(item.id)}
                  title={item.title}
                >
                  <MessageSquare size={15} />
                  <span>{item.title || "අලුත් කතාබහ"}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section memory-section">
            <h3><Brain size={17} /> සුරැකි මතක</h3>
            <form onSubmit={saveMemory} className="memory-form">
              <textarea
                value={memoryText}
                onChange={event => setMemoryText(event.target.value)}
                placeholder="NEXUS AI මතක තබාගත යුතු දෙයක් මෙහි ලියන්න..."
                rows={3}
                maxLength={500}
              />
              <button type="submit" disabled={!memoryText.trim() || memoryBusy}>
                <Save size={15} /> {memoryBusy ? "සුරකිමින්..." : "මතකය සුරකින්න"}
              </button>
            </form>
            <div className="memory-list">
              {memories.map(item => (
                <div className="memory-item" key={item.id}>
                  <span>{item.memory}</span>
                  <button onClick={() => deleteMemory(item.id)} title="මතකය මකන්න" aria-label="මතකය මකන්න"><Trash2 size={14} /></button>
                </div>
              ))}
              {memories.length === 0 && <p className="muted-text">තවම මතක සුරැකී නැහැ.</p>}
            </div>
          </section>
        </aside>

        <main className="chat-panel">
          {notice && <div className="notice" role="status">{notice}</div>}
          {loadingHistory && <div className="history-loading"><RefreshCw size={16} /> කතාබහ ඉතිහාසය ලබාගනිමින්...</div>}
          <div className="chat-area">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <Sparkles size={40} />
                <h1>NEXUS AI වෙත සාදරයෙන් පිළිගනිමු</h1>
                <p>ඔබේ බුද්ධිමත් පුද්ගලික AI සහායකයා</p>
                <p className="welcome-hint">ඔබේ සංවාද ස්වයංක්‍රීයව සුරැකේ. වැදගත් දේවල් සුරැකි මතක තුළ සුරකින්න.</p>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((item, index) => (
                  <div key={item.id || index} className={`message-row ${item.role}`}>
                    {item.role === "user" ? <User /> : <Sparkles />}
                    <p>{renderMessageText(item.text)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <footer className="composer-section">
            <form onSubmit={sendMessage} className="message-form">
              <textarea
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="NEXUS AI වෙත පණිවිඩයක් ලියන්න..."
                rows={2}
              />
              <button type="submit" disabled={sending || !message.trim()}><Send size={20} /></button>
            </form>
            {sending && <p className="sending-status">NEXUS AI පිළිතුර සකස් කරමින්...</p>}
          </footer>
        </main>
      </div>
    </div>
  );
}

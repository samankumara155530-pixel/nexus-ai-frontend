
import React, { useState } from "react";
import { supabase } from "../supabase";
import { Sparkles, Mail, Lock } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        setMessage("සාර්ථකව ඇතුළු වුණා!");

      } else {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin
            }
          });

        if (error) throw error;

        setMessage(
          data.session
            ? "ගිණුම සාර්ථකව නිර්මාණය වුණා!"
            : "ඔබේ විද්‍යුත් තැපෑල පරීක්ෂා කර ගිණුම තහවුරු කරන්න."
        );
      }

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="welcome-icon">
          <Sparkles size={35} />
        </div>

        <h1>NEXUS AI</h1>
        <p>ඔබේ බුද්ධිමත් පුද්ගලික සහායකයා</p>

        <h2>
          {isLogin ? "නැවත සාදරයෙන් පිළිගනිමු" : "ගිණුමක් සාදන්න"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>විද්‍යුත් තැපැල් ලිපිනය</label>

          <div className="auth-input">
            <Mail size={18} />

            <input
              type="email"
              placeholder="ඔබේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label>මුරපදය</label>

          <div className="auth-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="මුරපදය ඇතුළත් කරන්න"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading
              ? "මඳක් රැඳී සිටින්න..."
              : isLogin ? "ඇතුළු වන්න" : "ගිණුම සාදන්න"}
          </button>
        </form>

        {message && (
          <p className="auth-message">{message}</p>
        )}

        <p>
          {isLogin
            ? "ගිණුමක් නැද්ද?"
            : "දැනටමත් ගිණුමක් තිබේද?"}

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? " ගිණුම සාදන්න" : " ඇතුළු වන්න"}
          </button>
        </p>

      </div>
    </div>
  );
}

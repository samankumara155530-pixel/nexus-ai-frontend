
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

        setMessage("Login සාර්ථකයි!");

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
            : "Email එක පරීක්ෂා කර තහවුරු කරන්න."
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
        <p>Your Intelligent Personal Assistant</p>

        <h2>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <div className="auth-input">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label>Password</label>

          <div className="auth-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Enter your password"
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
              ? "Please wait..."
              : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {message && (
          <p className="auth-message">{message}</p>
        )}

        <p>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? " Sign Up" : " Sign In"}
          </button>
        </p>

      </div>
    </div>
  );
}

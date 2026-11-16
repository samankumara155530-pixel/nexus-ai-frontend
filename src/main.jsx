import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

class StartupErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("NEXUS REACT RENDER ERROR:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const error = this.state.error;
    return (
      <main style={{ minHeight: "100vh", boxSizing: "border-box", padding: 28, background: "#080d19", color: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ color: "#a78bfa" }}>NEXUS AI Startup Diagnostic</h2>
        <p>Application එක තිරය සකස් කරන විට දෝෂයක් ඇතිවුණා.</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "#fca5a5" }}>
          {error?.stack || error?.message || String(error)}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 18px", border: 0, borderRadius: 8, background: "#7c3aed", color: "white" }}>
          Try Again
        </button>
      </main>
    );
  }
}

function showStartupError(error, source) {
  console.error(`NEXUS ${source} ERROR:`, error);
  if (!rootElement) return;

  const panel = document.createElement("main");
  panel.style.cssText = "min-height:100vh;box-sizing:border-box;padding:28px;background:#080d19;color:#f1f5f9;font-family:Arial,sans-serif";
  const heading = document.createElement("h2");
  heading.textContent = "NEXUS AI Startup Diagnostic";
  heading.style.color = "#a78bfa";
  const message = document.createElement("p");
  message.textContent = "යෙදුම ආරම්භ කිරීමේදී දෝෂයක් ඇතිවුණා.";
  const details = document.createElement("pre");
  details.textContent = error?.stack || error?.message || String(error);
  details.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;color:#fca5a5";
  const retry = document.createElement("button");
  retry.textContent = "Try Again";
  retry.style.cssText = "padding:12px 18px;border:0;border-radius:8px;background:#7c3aed;color:white";
  retry.addEventListener("click", () => window.location.reload());
  panel.append(heading, message, details, retry);
  rootElement.replaceChildren(panel);
}

if (!rootElement) {
  console.error('NEXUS STARTUP ERROR: Missing element with id="root".');
} else {
  try {
    const root = createRoot(rootElement);
    startApp(root);
  } catch (error) {
    showStartupError(error, "React Root");
  }
}

async function startApp(root) {
  try {
    const { default: App } = await import("./App.jsx");
    root.render(
      <StrictMode>
        <StartupErrorBoundary>
          <App />
        </StartupErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    showStartupError(error, "Module");
  }
}

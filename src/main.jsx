
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root"));

async function startApp() {
  try {
    const { default: App } = await import("./App.jsx");

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("NEXUS STARTUP ERROR:", error);

    root.render(
      <div style={{
        minHeight: "100vh",
        background: "#080d19",
        color: "white",
        padding: "30px",
        fontFamily: "Arial"
      }}>
        <h2 style={{color: "#a78bfa"}}>
          NEXUS AI Startup Error
        </h2>
        <p>Application එක ආරම්භ කිරීමට නොහැකි වුණා.</p>
        <pre style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          color: "#fca5a5",
          marginTop: "20px"
        }}>
          {error?.stack || error?.message || String(error)}
        </pre>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
}

startApp();

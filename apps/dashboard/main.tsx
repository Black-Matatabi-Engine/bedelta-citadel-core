import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { TerminalErrorBoundary } from "../../src/v2/components/TerminalErrorBoundary";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root mount point not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <TerminalErrorBoundary title="BeDelta Living Water — HUD">
      <App />
    </TerminalErrorBoundary>
  </StrictMode>,
);

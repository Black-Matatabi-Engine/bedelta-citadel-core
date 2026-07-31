import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { TerminalErrorBoundary } from "./components/TerminalErrorBoundary";
import { isBrowser } from "./lib/client-runtime";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root mount point not found");
}

if (!isBrowser()) {
  throw new Error("Santenboku SPA requires a browser runtime");
}

createRoot(rootEl).render(
  <StrictMode>
    <TerminalErrorBoundary title="Santenboku v0.8 — Root Fault Isolation">
      <App />
    </TerminalErrorBoundary>
  </StrictMode>,
);

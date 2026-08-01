import { ClientOnly } from "../../src/v2/components/ClientOnly";
import { TerminalBootScreen } from "../../src/v2/components/TerminalBootScreen";
import { TerminalErrorBoundary } from "../../src/v2/components/TerminalErrorBoundary";
import { StealthHud } from "./components/StealthHud";

export function App(): React.ReactNode {
  return (
    <ClientOnly fallback={<TerminalBootScreen message="Initializing execution HUD…" />}>
      <TerminalErrorBoundary
        title="BeΔ HUD — Fault Isolation"
        onReset={() => window.location.reload()}
      >
        <StealthHud />
      </TerminalErrorBoundary>
    </ClientOnly>
  );
}

export default App;

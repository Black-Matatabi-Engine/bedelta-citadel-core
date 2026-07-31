export function TerminalBootScreen({
  message = "Bootstrapping Santenboku defense scan…",
}: {
  message?: string;
}): React.ReactNode {
  return (
    <div className="terminal-boot-screen santen-shell">
      <img
        src="/brand/dondon_defense.png"
        alt=""
        aria-hidden
        className="terminal-boot-logo"
      />
      <p className="panel-title-text">{message}</p>
      <p className="text-sm text-[rgba(160,255,224,0.65)]">
        Santenboku v0.8 · Cyberpunk Zen Terminal
      </p>
    </div>
  );
}

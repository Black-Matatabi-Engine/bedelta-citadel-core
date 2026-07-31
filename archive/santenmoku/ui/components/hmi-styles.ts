/** DonDon Co-Pilot HMI — tactile controls + YIN guard transitions */
export const HMI_INLINE_STYLES = `
    .tactile-emergency-btn {
      position: relative;
      transform: translateZ(0);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.18s ease, filter 0.18s ease;
      will-change: transform, box-shadow;
    }
    .tactile-emergency-btn:hover {
      filter: brightness(1.08);
      box-shadow: 0 0 18px rgba(248, 113, 113, 0.55), 0 0 32px rgba(239, 68, 68, 0.25);
    }
    .tactile-emergency-btn:active {
      transform: scale(0.96);
      box-shadow: 0 0 8px rgba(248, 113, 113, 0.45);
    }
    .tactile-defcon-btn.tactile-emergency-btn:hover {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.65), 0 0 36px rgba(220, 38, 38, 0.35);
    }
    .copilot-care-badge {
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(251, 191, 36, 0.45);
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(15, 23, 42, 0.92));
      color: #fde68a;
      font-size: 0.72rem;
      line-height: 1.45;
      min-height: 2.75rem;
      contain: layout style;
    }
    .copilot-care-badge.is-visible {
      animation: copilotCareFadeIn 0.35s ease forwards;
    }
    @keyframes copilotCareFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dondon-ip-badge.is-yin-guard {
      animation: yinGuardPulse 1.6s ease-in-out infinite;
      background: linear-gradient(90deg, #6366f1, #a78bfa);
      color: #fff;
      letter-spacing: 0.06em;
    }
    @keyframes yinGuardPulse {
      0%, 100% { box-shadow: 0 0 8px rgba(167, 139, 250, 0.35); transform: scale(1); }
      50% { box-shadow: 0 0 16px rgba(167, 139, 250, 0.65); transform: scale(1.03); }
    }
    .dondon-ip-frame.is-yin-guard-mode {
      transition: filter 0.35s ease;
    }
    .auto-pilot-basis-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      border: 1px solid rgba(245, 158, 11, 0.45);
      background: rgba(245, 158, 11, 0.1);
      color: #fcd34d;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .milestone-remark-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.55rem;
      border-radius: 0.375rem;
      border: 1px dashed rgba(80, 210, 193, 0.45);
      background: rgba(80, 210, 193, 0.08);
      color: rgba(160, 255, 224, 0.85);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      contain: layout style;
    }
    .r20-deadlock-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(6px);
      animation: r20OverlayIn 0.22s ease forwards;
    }
    .r20-deadlock-overlay.hidden {
      display: none;
    }
    .r20-deadlock-panel {
      max-width: 28rem;
      width: 100%;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 2px solid #ef4444;
      background: #0a0a0a;
      box-shadow: 0 0 40px rgba(239, 68, 68, 0.35);
      text-align: center;
    }
    .r20-deadlock-panel h2 {
      color: #fca5a5;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 0.75rem;
    }
    .r20-deadlock-panel p {
      color: #e5e7eb;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    @keyframes r20OverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .execution-shield-tactile-btn {
      transform: translateZ(0);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.18s ease, filter 0.18s ease;
    }
    .execution-shield-tactile-btn:hover {
      filter: brightness(1.08);
      box-shadow: 0 0 18px rgba(248, 113, 113, 0.55);
    }
    .execution-shield-tactile-btn:active {
      transform: scale(0.96);
    }
    .hmi-status-strip {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem 0.75rem;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.28);
      background: rgba(6, 32, 27, 0.72);
      font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
      font-size: 0.68rem;
      letter-spacing: 0.04em;
    }
    .hmi-status-strip.is-elevated {
      border-color: rgba(251, 191, 36, 0.45);
      background: rgba(41, 32, 8, 0.75);
    }
    .hmi-status-strip.is-critical {
      border-color: rgba(248, 113, 113, 0.5);
      background: rgba(42, 8, 8, 0.82);
    }
    .hmi-metric {
      white-space: nowrap;
      font-weight: 600;
    }
    .taiji-mode-yang {
      color: #fcd34d;
      border: 1px solid rgba(251, 191, 36, 0.55);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(69, 26, 3, 0.65));
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-weight: 800;
      letter-spacing: 0.06em;
    }
    .taiji-mode-yin {
      color: #c4b5fd;
      border: 1px solid rgba(99, 102, 241, 0.5);
      background: linear-gradient(135deg, rgba(30, 27, 75, 0.85), rgba(15, 23, 42, 0.92));
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-weight: 800;
      letter-spacing: 0.06em;
    }
`;

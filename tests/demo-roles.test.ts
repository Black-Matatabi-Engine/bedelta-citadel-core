import { describe, expect, it } from "vitest";
import {
  canAccessFaultInjection,
  DEMO_ROLE_CONFIG,
  isDemoReadOnly,
  resolveDemoRole,
} from "../src/v2/services/demo-roles";

describe("Demo persona roles", () => {
  it("resolves Javier alias to Risk Manager", () => {
    expect(resolveDemoRole("JAVIER")).toBe("RISK_MANAGER");
    expect(resolveDemoRole("risk_manager")).toBe("RISK_MANAGER");
  });

  it("locks Auditor into read-only mode", () => {
    expect(isDemoReadOnly("AUDITOR")).toBe(true);
    expect(DEMO_ROLE_CONFIG.AUDITOR.banner).toContain("READ-ONLY");
  });

  it("unlocks fault injection for Risk Manager only", () => {
    expect(canAccessFaultInjection("TRADER")).toBe(false);
    expect(canAccessFaultInjection("AUDITOR")).toBe(false);
    expect(canAccessFaultInjection("RISK_MANAGER")).toBe(true);
  });

  it("exposes Toxic Overload / High Slippage / Reset presets", async () => {
    const { FAULT_INJECTION_ACTIONS } = await import(
      "../src/v2/services/demo-roles"
    );
    const ids = FAULT_INJECTION_ACTIONS.map((a) => a.id);
    expect(ids).toContain("HIGH_SLIPPAGE");
    expect(ids).toContain("TOXIC_OVERLOAD");
    expect(ids).toContain("RESET_TOXIC");
    expect(
      FAULT_INJECTION_ACTIONS.find((a) => a.id === "TOXIC_OVERLOAD")?.label,
    ).toMatch(/CRI 85/);
  });
});

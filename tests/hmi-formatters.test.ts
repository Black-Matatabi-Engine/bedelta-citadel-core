import { describe, expect, it } from "vitest";
import {
  formatFrictionLabel,
  formatGatewayLabel,
  formatPgateStatusLabel,
  formatTensileLabel,
  resolveFrictionLevel,
} from "../src/services/hmi-formatters";

describe("hmi-formatters", () => {
  it("formats idle P-GATE with % SECURE separator", () => {
    expect(formatPgateStatusLabel({})).toBe("P-GATE : [ 20 ROOTS % SECURE ]");
  });

  it("formats active P-GATE with % root separators", () => {
    expect(
      formatPgateStatusLabel({ 1: "TRIPPED", 3: "TRIPPED", 17: "TRIPPED", 20: "TRIPPED" }),
    ).toBe("P-GATE : [ R1 % R3 % R17 % R20 ]");
  });

  it("formats tensile contrast readout", () => {
    expect(formatTensileLabel(85)).toBe("TENSILE : [ 85% / 20% MIN ]");
  });

  it("formats friction with severity band", () => {
    expect(formatFrictionLabel(0.0012)).toBe("FRICTION : [ 0.12% % LOW ]");
    expect(resolveFrictionLevel(0.002)).toBe("MED");
  });

  it("formats gateway signing states", () => {
    expect(formatGatewayLabel({ signingChannelOpen: true, hardlock: false })).toBe(
      "GATEWAY : [ 🟢 SIGNING OPEN ]",
    );
    expect(formatGatewayLabel({ signingChannelOpen: false, hardlock: false })).toBe(
      "GATEWAY : [ 🔴 R20 HARDLOCK ]",
    );
  });
});

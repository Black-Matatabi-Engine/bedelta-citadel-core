import { describe, expect, it } from "vitest";
import { evaluateDonDonMood } from "../src/services/dondonEngine";
import {
  buildSystemState,
  type SystemState,
} from "../src/services/systemState";
import { DonDonMood, type DonDonSystemInput } from "../src/types/dondon";

const BALANCE_USD = 10_000;
const EXPECTED_MAX_SL = 200;

interface CycleStep {
  label: string;
  signals: Partial<DonDonSystemInput>;
  expectedMood: DonDonMood;
}

function buildCycleInput(
  signals: Partial<DonDonSystemInput>,
): DonDonSystemInput {
  const base = buildSystemState({
    accountBalanceUsd: BALANCE_USD,
    currentCri: signals.currentCri ?? 100,
    skipHardlockAssert: true,
  });
  return {
    ...base,
    walletLinked: true,
    volatility: 40,
    soilScore: 65,
    controlMode: "SEMI_AUTO",
    ...signals,
  };
}

function assertHudAndSystemState(
  dondon: ReturnType<typeof evaluateDonDonMood>,
  system: SystemState,
  expectedMood: DonDonMood,
) {
  expect(dondon.mood).toBe(expectedMood);
  expect(dondon.dynamicMaxSL).toBe(EXPECTED_MAX_SL);
  expect(system.dynamicMaxSL).toBe(EXPECTED_MAX_SL);
  expect(dondon.overheadHUDText).toContain("-$200.00 SL");
  expect(dondon.overheadHUDText).toContain("+$400.00 TP");
  expect(dondon.overheadHUDText.length).toBeGreaterThan(0);
  expect(system.accountBalanceUsd).toBe(BALANCE_USD);
}

describe("integrationEngine — DonDon E2E mood cycle", () => {
  const cycle: CycleStep[] = [
    {
      label: "Unlinked",
      signals: { walletLinked: false },
      expectedMood: DonDonMood.WALLET_NOT_LINKED,
    },
    {
      label: "Searching",
      signals: { walletLinked: true },
      expectedMood: DonDonMood.SEARCHING,
    },
    {
      label: "Soil Found",
      signals: { walletLinked: true, inSoilZone: true, soilScore: 78 },
      expectedMood: DonDonMood.DEFENSIVE,
    },
    {
      label: "RootShield Activated",
      signals: {
        walletLinked: true,
        inSoilZone: true,
        rootShieldActive: true,
        soilScore: 78,
      },
      expectedMood: DonDonMood.ROOTSHIELD_ACTIVE,
    },
    {
      label: "Volatility Spike",
      signals: {
        walletLinked: true,
        volatility: 82,
        soilScore: 65,
      },
      expectedMood: DonDonMood.ALERT,
    },
    {
      label: "Deadlock",
      signals: {
        walletLinked: true,
        circuitBreakerTriggered: true,
        currentCri: 0,
        volatility: 95,
        deadlockCooldownSec: 60,
      },
      expectedMood: DonDonMood.RAGE_FOMO,
    },
  ];

  it("runs full E2E cycle with continuous HUD + SystemState sync", () => {
    const moods: DonDonMood[] = [];

    for (const step of cycle) {
      const input = buildCycleInput(step.signals);
      const system = buildSystemState({
        accountBalanceUsd: input.accountBalanceUsd,
        currentCri: input.currentCri,
        skipHardlockAssert: true,
      });
      const dondon = evaluateDonDonMood(input);

      assertHudAndSystemState(dondon, system, step.expectedMood);
      moods.push(dondon.mood);
    }

    expect(moods).toEqual([
      DonDonMood.WALLET_NOT_LINKED,
      DonDonMood.SEARCHING,
      DonDonMood.DEFENSIVE,
      DonDonMood.ROOTSHIELD_ACTIVE,
      DonDonMood.ALERT,
      DonDonMood.RAGE_FOMO,
    ]);
  });

  it("deadlock step sets hardlock on SystemState", () => {
    const input = buildCycleInput({
      walletLinked: true,
      circuitBreakerTriggered: true,
      currentCri: 0,
      deadlockCooldownSec: 60,
    });
    const system = buildSystemState({
      accountBalanceUsd: input.accountBalanceUsd,
      currentCri: 0,
      skipHardlockAssert: true,
    });
    const dondon = evaluateDonDonMood(input);

    expect(dondon.mood).toBe(DonDonMood.RAGE_FOMO);
    expect(system.hardlock).toBe(true);
    expect(system.signingChannelOpen).toBe(false);
    expect(dondon.shieldHealth).toBe(0);
    expect(dondon.overheadHUDText).toContain("0% SHIELD");
    expect(dondon.overheadHUDText).toContain("[ 60s COOLDOWN | Deadlock Active ]");
  });
});

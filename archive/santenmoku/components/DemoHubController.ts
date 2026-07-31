import { buildSystemState } from "../services/systemState";
import { evaluateDonDonMood } from "../services/dondonEngine";
import {
  assertExhaustiveDonDonMood,
  DEMO_HUB_MOODS,
  DonDonMood,
  type DonDonState,
  type DonDonSystemInput,
} from "../types/dondon";

export interface DemoHubControllerOptions {
  accountBalanceUsd?: number;
  currentCri?: number;
}

/** Build mock SystemState input for a forced DemoHub mood */
export function buildDemoHubInput(
  mood: DonDonMood,
  options: DemoHubControllerOptions = {},
): DonDonSystemInput {
  const accountBalanceUsd = options.accountBalanceUsd ?? 10_000;
  const base = buildSystemState({
    accountBalanceUsd,
    currentCri: options.currentCri ?? 100,
    skipHardlockAssert: true,
  });

  const shared: DonDonSystemInput = {
    ...base,
    walletLinked: true,
    moodOverride: mood,
    volatility: 40,
    soilScore: 65,
  };

  switch (mood) {
    case DonDonMood.WALLET_NOT_LINKED:
      return { ...shared, walletLinked: false, moodOverride: mood };
    case DonDonMood.DEFENSIVE:
      return { ...shared, inSoilZone: true, soilScore: 78, moodOverride: mood };
    case DonDonMood.ROOTSHIELD_ACTIVE:
      return { ...shared, rootShieldActive: true, moodOverride: mood };
    case DonDonMood.ALERT:
      return { ...shared, volatility: 82, moodOverride: mood };
    case DonDonMood.RAGE_FOMO:
      return {
        ...shared,
        circuitBreakerTriggered: true,
        volatility: 95,
        moodOverride: mood,
      };
    case DonDonMood.VICTORY:
      return { ...shared, takeProfitTriggered: true, moodOverride: mood };
    case DonDonMood.TIER_UPGRADE:
      return { ...shared, tierUpgrade: true, moodOverride: mood };
    case DonDonMood.ADMIN_MODE:
      return { ...shared, adminMode: true, moodOverride: mood };
    case DonDonMood.SYSTEM_PAUSED:
      return { ...shared, systemPaused: true, moodOverride: mood };
    case DonDonMood.SEARCHING:
      return shared;
    default:
      return assertExhaustiveDonDonMood(mood);
  }
}

/** DemoHub state switcher — force-test all DonDon moods with balance override */
export class DemoHubController {
  private accountBalanceUsd: number;
  private currentCri: number;

  constructor(options: DemoHubControllerOptions = {}) {
    this.accountBalanceUsd = options.accountBalanceUsd ?? 10_000;
    this.currentCri = options.currentCri ?? 100;
  }

  setAccountBalanceUsd(balance: number): void {
    this.accountBalanceUsd = balance;
  }

  setCurrentCri(cri: number): void {
    this.currentCri = cri;
  }

  evaluateMood(mood: DonDonMood): DonDonState {
    return evaluateDonDonMood(
      buildDemoHubInput(mood, {
        accountBalanceUsd: this.accountBalanceUsd,
        currentCri: this.currentCri,
      }),
    );
  }

  evaluateAllMoods(): Record<DonDonMood, DonDonState> {
    const out = {} as Record<DonDonMood, DonDonState>;
    for (const mood of DEMO_HUB_MOODS) {
      out[mood] = this.evaluateMood(mood);
    }
    return out;
  }
}

export { DEMO_HUB_MOODS, DonDonMood };

import { describe, expect, it } from "vitest";
import {
  getDonDonAssetMapping,
  resolveDonDonAssetSrc,
} from "../src/assets/dondon/mapping";
import { DonDonMood } from "../src/types/dondon";

describe("dondon asset mapping", () => {
  it.each([
    [DonDonMood.WALLET_NOT_LINKED, "logo-santenboku.png"],
    [DonDonMood.SEARCHING, "dondon_normal.png"],
    [DonDonMood.DEFENSIVE, "dondon_defense.png"],
    [DonDonMood.ROOTSHIELD_ACTIVE, "dondon_godmode.png"],
    [DonDonMood.ALERT, "dondon_warning.png"],
    [DonDonMood.RAGE_FOMO, "dondon_deadlock.png"],
    [DonDonMood.VICTORY, "dondon_levelup.png"],
    [DonDonMood.TIER_UPGRADE, "dondon_levelup.png"],
    [DonDonMood.ADMIN_MODE, "dondon_godmode.png"],
    [DonDonMood.SYSTEM_PAUSED, "dondon_deadlock.png"],
  ] as const)("maps %s to %s", (mood, file) => {
    expect(resolveDonDonAssetSrc(mood)).toBe(`/brand/${file}`);
  });

  it("ADMIN_MODE adds monocle overlay class", () => {
    expect(getDonDonAssetMapping(DonDonMood.ADMIN_MODE).overlayClassName).toBe(
      "dondon-overlay-monocle",
    );
  });

  it("SYSTEM_PAUSED adds grayscale overlay class", () => {
    expect(getDonDonAssetMapping(DonDonMood.SYSTEM_PAUSED).overlayClassName).toBe(
      "dondon-overlay-grayscale",
    );
  });

  it("uses colorHue override for fallback block", () => {
    expect(getDonDonAssetMapping(DonDonMood.ALERT, "#EAB308").fallbackColor).toBe(
      "#EAB308",
    );
  });
});

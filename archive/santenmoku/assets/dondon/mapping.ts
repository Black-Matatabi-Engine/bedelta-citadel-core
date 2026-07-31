import { DonDonMood } from "../../types/dondon";

const BRAND_BASE = "/brand";

export interface DonDonAssetMapping {
  src: string;
  alt: string;
  fallbackColor: string;
  imageClassName: string;
  overlayClassName?: string;
}

const MOOD_ASSET_FILE: Record<DonDonMood, string> = {
  [DonDonMood.WALLET_NOT_LINKED]: "logo-santenboku.png",
  [DonDonMood.SEARCHING]: "dondon_normal.png",
  [DonDonMood.DEFENSIVE]: "dondon_defense.png",
  [DonDonMood.ROOTSHIELD_ACTIVE]: "dondon_godmode.png",
  [DonDonMood.ALERT]: "dondon_warning.png",
  [DonDonMood.RAGE_FOMO]: "dondon_deadlock.png",
  [DonDonMood.VICTORY]: "dondon_levelup.png",
  [DonDonMood.TIER_UPGRADE]: "dondon_levelup.png",
  [DonDonMood.ADMIN_MODE]: "dondon_godmode.png",
  [DonDonMood.SYSTEM_PAUSED]: "dondon_deadlock.png",
};

const MOOD_FALLBACK_COLOR: Record<DonDonMood, string> = {
  [DonDonMood.WALLET_NOT_LINKED]: "#64748B",
  [DonDonMood.SEARCHING]: "#10B981",
  [DonDonMood.DEFENSIVE]: "#F59E0B",
  [DonDonMood.ROOTSHIELD_ACTIVE]: "#06B6D4",
  [DonDonMood.ALERT]: "#EAB308",
  [DonDonMood.RAGE_FOMO]: "#EF4444",
  [DonDonMood.VICTORY]: "#8B5CF6",
  [DonDonMood.TIER_UPGRADE]: "#FBBF24",
  [DonDonMood.ADMIN_MODE]: "#3B82F6",
  [DonDonMood.SYSTEM_PAUSED]: "#94A3B8",
};

const MOOD_ALT: Record<DonDonMood, string> = {
  [DonDonMood.WALLET_NOT_LINKED]: "Santenboku — wallet not linked",
  [DonDonMood.SEARCHING]: "DonDon scanning liquidity slivers",
  [DonDonMood.DEFENSIVE]: "DonDon defensive soil posture",
  [DonDonMood.ROOTSHIELD_ACTIVE]: "DonDon Santenmoku eye opened",
  [DonDonMood.ALERT]: "DonDon alert — ears up",
  [DonDonMood.RAGE_FOMO]: "DonDon deadlock — circuit breaker",
  [DonDonMood.VICTORY]: "DonDon victory — fish in mouth",
  [DonDonMood.TIER_UPGRADE]: "DonDon tier upgrade",
  [DonDonMood.ADMIN_MODE]: "DonDon admin mode — monocle operator",
  [DonDonMood.SYSTEM_PAUSED]: "DonDon system paused",
};

const MOOD_IMAGE_CLASS: Record<DonDonMood, string> = {
  [DonDonMood.WALLET_NOT_LINKED]: "dondon-asset-wallet",
  [DonDonMood.SEARCHING]: "dondon-asset-normal",
  [DonDonMood.DEFENSIVE]: "dondon-asset-defense",
  [DonDonMood.ROOTSHIELD_ACTIVE]: "dondon-asset-godmode",
  [DonDonMood.ALERT]: "dondon-asset-warning",
  [DonDonMood.RAGE_FOMO]: "dondon-asset-deadlock",
  [DonDonMood.VICTORY]: "dondon-asset-levelup",
  [DonDonMood.TIER_UPGRADE]: "dondon-asset-levelup",
  [DonDonMood.ADMIN_MODE]: "dondon-asset-admin",
  [DonDonMood.SYSTEM_PAUSED]: "dondon-asset-paused",
};

/** Resolve DonDon mood → brand asset path + visual modifiers */
export function getDonDonAssetMapping(
  mood: DonDonMood,
  colorHue?: string,
): DonDonAssetMapping {
  const mapping: DonDonAssetMapping = {
    src: `${BRAND_BASE}/${MOOD_ASSET_FILE[mood]}`,
    alt: MOOD_ALT[mood],
    fallbackColor: colorHue ?? MOOD_FALLBACK_COLOR[mood],
    imageClassName: MOOD_IMAGE_CLASS[mood],
  };

  if (mood === DonDonMood.ADMIN_MODE) {
    mapping.overlayClassName = "dondon-overlay-monocle";
  }

  if (mood === DonDonMood.SYSTEM_PAUSED) {
    mapping.overlayClassName = "dondon-overlay-grayscale";
  }

  return mapping;
}

export function resolveDonDonAssetSrc(mood: DonDonMood): string {
  return getDonDonAssetMapping(mood).src;
}

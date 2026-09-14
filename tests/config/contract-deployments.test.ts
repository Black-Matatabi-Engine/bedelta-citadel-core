import { describe, expect, it } from "vitest";
import {
  MAINNET_DEPLOYMENTS,
  resolveGateAddressForChain,
  SEPOLIA_ONLY_DEPLOYMENTS,
  SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS,
} from "../../src/config/contract-deployments";
import {
  ARBITRUM_ONE_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  SLIVERVINE_GATE_MAINNET_ADDRESS,
  SLIVERVINE_GATE_SEPOLIA_ADDRESS,
} from "../../src/sdk/constants";

describe("contract-deployments SSOT", () => {
  it("dual-deploys SliverVineGate on mainnet and sepolia", () => {
    expect(SLIVERVINE_GATE_MAINNET_ADDRESS).toBe(SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS);
    expect(SLIVERVINE_GATE_SEPOLIA_ADDRESS).toBe(SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS);
    expect(resolveGateAddressForChain(ARBITRUM_ONE_CHAIN_ID)).toBe(SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS);
    expect(resolveGateAddressForChain(ARBITRUM_SEPOLIA_CHAIN_ID)).toBe(SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS);
  });

  it("lists mainnet-only PolicyGuardV2", () => {
    const policy = MAINNET_DEPLOYMENTS.find((d) => d.name === "SliverVineAgentPolicyGuardV2");
    expect(policy?.network).toBe("mainnet");
    expect(policy?.chainIds).toEqual([42161]);
  });

  it("lists sepolia-only Sanctuary ingress", () => {
    const ingress = SEPOLIA_ONLY_DEPLOYMENTS.find((d) => d.name === "IngressSafetySwitch");
    expect(ingress?.network).toBe("sepolia");
    expect(ingress?.chainIds).toEqual([421614]);
  });
});

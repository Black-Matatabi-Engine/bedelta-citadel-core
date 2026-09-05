> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md)

# 標準合規與 ERC/EIP Wiki

> **文檔：** SliverVine Citadel Shield — 標準合規與 ERC/EIP 參考 Wiki · **Vitest SSOT：** **192 個測試檔案 | 836 PASS Clean（100% PASS）** · **7 原生協議** · **4 AI 框架** · Worker **69.32 KiB gzip**
> **導覽：** [`docs/README.md`](../README.md) · [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md) · **本文件** — 標準合規與 ERC/EIP Wiki
> **父規格：** [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md) — R01–R20 不變量 · 雙引擎拓撲 · 結算與費用邊界

官方基礎設施標準映射表 — 每一行將公開 ERC/EIP（或場所規格）連結至 Citadel 實作錨點與驗證。下方 **ERC/EIP 標準參考 Wiki** 為 AA、attestation 與資產 escort 標準的正式深度說明。

---

## 標準摘要表

| 標準 | Citadel 角色 | 實作錨點 | 驗證 |
|----------|-----------------|----------------------|--------------|
| **[ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)** | 帳戶抽象 — 範圍化 agent UserOp，無 hot-wallet 托管 | ZeroDev Kernel **v0.3.1** · EntryPoint **v0.7** · `src/adapters/arbitrum/zerodev-aa/` · `zerodev-aa-userop.ts` | ZeroDev AA gate · `eth_supportedEntryPoints` probe · aa-adapter tests |
| **[EIP-7562](https://eips.ethereum.org/EIPS/eip-7562)** | AA 儲存存取規則 — **Zero-Bundler-Rejection Invariant** | Session-key `callData` whitelist · static breaker · `BUNDLER_TIMEOUT_FAIL_CLOSED` | Bundler smoke probe · `zerodev-aa-bundler.ts` |
| **[EIP-712](https://eips.ethereum.org/EIPS/eip-712)** | 類型化結構化資料 hashing · 域綁定 `SliverVineCitadel` | `SliverVineGate.sol` · `src/sdk/constants.ts` · `evaluateAttestation()` | Forge I1–I12 · SDK citadel tests |
| **[ERC-1271](https://eips.ethereum.org/EIPS/eip-1271)** | 合約簽章驗證（Kernel 智能帳戶） | ZeroDev Kernel `isValidSignature` · Gate ECDSA m-of-n on `RiskAttestation` | Gate Forge suite · agent-intent SDK |
| **[ERC-20](https://eips.ethereum.org/EIPS/eip-20) / [ERC-777](https://eips.ethereum.org/EIPS/eip-777)** | 非託管資產轉移與在途 escort 語義 | `GMX_USDC_ARBITRUM` · `src/adapters/across-ingress-bridge.ts` · `GatedExecutor` payload binding | Across bridge tests · GMX payload tests |
| **[OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/)** | 鏈上 gate 存取控制與重入防護 | `SliverVineGate.sol` · OZ `ECDSA.tryRecover` 對齊 · `IngressSafetySwitch.sol` 為無狀態合規 filter（無 OZ import） | Foundry Gate **60 passed** · Forge property fuzz |
| **[ERC-7579](https://eips.ethereum.org/EIPS/eip-7579)** | 模組化智能帳戶 — session-key 權限範圍 | ZeroDev Kernel v3 modular session keys · scoped `ORDER_EXECUTE` clip · 每日 gas sponsorship 上限 | Gatehouse（支柱一）· agent-intent SDK |
| **[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)** | EOA AA via `SetCode` — Agent Smart Account 升級路徑（`SliverVineGate.sol` 相容） | Kernel v4 intent composer · [Technical Specification §2.4.5](./01_TECHNICAL_SPECIFICATION.md#245-zerodev-v4-seven-stages-one-stack-alignment-roadmap-post-grant-spec) · [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | ✅ v1.0 Delivered（Gate-compatible）· Kernel v4 adapter ⏳ V1.5 |
| **[ERC-7715](https://eips.ethereum.org/EIPS/eip-7715)** | Advanced Wallet Permissions — session-key 演進目標 | [Technical Specification §0.1](./01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec) · [Compliance Posture](#compliance-posture) · `session-key-gates.ts` · ZeroDev Kernel v3 session adapter | ✅ v1.0 Delivered（Kernel v3）· ERC-7715 universal permissions ⏳ Post-Grant |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Draft)** | AI Agent Wallet Policy — 僅對齊；**非 finalized 標準** | [`SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol) `validateAgentPolicy` / `checkAgentPolicy` · `src/core/agent-citadel-guard.ts` | Foundry `SliverVineAgentPolicyGuard.t.sol` · [Technical Specification §0.1](./01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec) |
| **[EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)** | Arbitrum One 動態 base-fee 壅塞感測 | Tri-Sensor **BaseFee Velocity** channel · `arbitrum-gas-guard.ts` | Gas-guard tests · Tri-Sensor Matrix |
| **[Arbitrum Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs)** (`0.10.7`) | WASM Soil Coprocessor 對齊 — 鏈上 soil 與 Edge 對等 | [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) · `SliverVineSoilCoprocessor` · [Stylus docs](https://docs.arbitrum.io/stylus/reference/overview) | ✅ v1.0 Delivered · `cargo test` **9/9 PASS** · Sepolia deploy pending |
| **ArbOS 61** | Arbitrum L2 執行 / Stylus 共驻對齊（⏳ V1.0 Design Spec） | `IngressSafetySwitch.sol` · Elara ingress design · Stylus WASM parity path | Robinhood safety contracts · audit notes |
| **Robinhood Chain Ingress** | 許可制機構出站 · AML 入站隔離 | Chains **46630**（testnet）/ **4663**（mainnet filter）· Across bridge · `IngressSafetySwitch.sol` | Robinhood Across bridge tests · audit snapshot |
| **WASM Core (`soil_core`)** | 亞毫秒預執行 soil fuse · Cloudflare Edge 熱路徑 | `pkg/soil_core.wasm` · `#![no_std]` Rust · 預算 **&lt;28 KiB** · 暖啟動 **&lt;60 µs** | Wasm feasibility suite |

---

## ERC/EIP 標準參考 Wiki

### ERC-4337 — 帳戶抽象與 UserOperation 結構

> **深度規格：** [Technical Specification §2.4](./01_TECHNICAL_SPECIFICATION.md#24-pillar-1--opt-in-zerodev-account-abstraction-integration-summary) 支柱一 — ZeroDev 帳戶抽象（Kernel v3/v4 · Paymaster · EIP-7562 · v4 七階段路線圖）。

| 欄位 | Citadel 綁定 |
|-------|-----------------|
| **EntryPoint** | `entryPoint07Address` — SSOT `ZERODEV_ENTRY_POINT_ADDRESS` |
| **Kernel** | ZeroDev Kernel **v0.3.1**（`ZERODEV_KERNEL_VERSION`）— v4 adapter swap ⏳ Post-Grant（V1.5）（[§2.4.2](./01_TECHNICAL_SPECIFICATION.md#242-zerodev-kernel-v3--v4-session-keys-erc-7579-modular-permissions)） |
| **UserOp draft** | `sender` · `nonce` · `callData` · optional `factory`/`factoryData` · gas limits · `paymaster`/`paymasterData` · `signature` |
| **Paymaster** | ZeroDev `zerodev.sponsorUserOperation` — 每 op ≤ $0.50 · 每日 $10 · `zerodev-aa-gas-ledger.ts` |
| **Pre-broadcast gate** | `verifyAgentIntent()` — `AllowedToSign = Injection ∧ Digest ∧ Soil ∧ Session ∧ Gas ∧ Attestation ∧ Armor ∧ Wasm` |
| **106 µs 解耦** | Shield（`checkSoilResistance` · `pkg/soil_core.wasm`）於 paymaster 簽名 + bundler 派發**之前**執行 — Wasm 驅動亞毫秒延遲；ZeroDev 僅為可選交付 |

UserOp 於本地起草，經 ZeroDev paymaster middleware 代付，僅於 Edge soil + static-breaker 評估後提交。Bundler RPC **必須**宣告 EntryPoint v0.7（`supportsEntryPoint07`）。ZeroDev 為**可選非託管交付基板**（支柱一）；Citadel Edge Wasm 為**預廣播決策 SSOT**（[§2.4.1](./01_TECHNICAL_SPECIFICATION.md#241-role-of-zerodev-scoped-session-keys--gas-sponsorship-pillar-1-opt-in-aa-layer)）。

### EIP-7562 — 帳戶抽象儲存存取規則

**Zero-Bundler-Rejection Invariant：** Citadel UserOp **不得**於 validation 階段違反 EIP-7562 opcode/storage 規則；bundler 拒絕視為**協議故障**，非重試信號。見 [Technical Specification §2.4.4](./01_TECHNICAL_SPECIFICATION.md#244-eip-7562-zero-bundler-rejection-invariant)。

| 規則 | 強制 |
|------|-------------|
| Validation-phase storage reads | Session-key 模組將 `callData` 限制於 whitelist target/selector — 無禁止跨合約讀取 |
| Edge pre-screen | `evaluateStaticBreakerMatrix()` — 先 soil，再 gas ledger，於 `sendUserOperation()` 前 |
| Fail-closed | Bundler 不可達、缺少 EP v0.7 或逾時 → `BUNDLER_TIMEOUT_FAIL_CLOSED`（`ZERODEV_BUNDLER_FAIL_CLOSED_TIMEOUT_MS` = 3_000） |
| 驗證 | `zerodev-aa-bundler.ts` · `supportsEntryPoint07` probe · aa-adapter Vitest suite |

### EIP-712 — 類型化結構化資料 Hashing 與域綁定

| 元件 | 值 |
|-----------|-------|
| **Domain `name`** | `SliverVineCitadel`（`EIP712_DOMAIN_NAME`） |
| **Domain `version`** | `1`（`EIP712_DOMAIN_VERSION`） |
| **Domain `chainId`** | Live `block.chainid` — Gate constructor 中快取為 immutable |
| **Domain `verifyingContract`** | `SliverVineGate` 地址（`SLIVERVINE_GATE_ADDRESS`） |
| **Primary type** | `RiskAttestation(bytes32 payloadHash, address subject, uint8 verdict, uint16 riskBps, uint64 issuedAt, uint64 expiresAt, uint256 nonce)` |
| **Digest** | `keccak256("\x19\x01" ‖ domainSeparator ‖ structHash)` — `verifyAndConsume` 時經 `consumed[digest]` 單次使用 |

SDK envelope 鏡像 Gate 域綁定：`evaluateAttestation()` 拒絕不匹配之 `verifyingContract` 或 `domainName`。跨鏈重放於 L1 消耗時拒絕。

### ERC-1271 — 合約簽章驗證標準方法

| 路徑 | 機制 |
|------|-----------|
| **Kernel（ERC-4337）** | ZeroDev Kernel 經 `isValidSignature(bytes32 hash, bytes signature)` 驗證 session-key proof — magic value `0x1626ba7e` |
| **Gate（L1 attestation）** | `RiskAttestation` EIP-712 digest 上 m-of-n ECDSA — OZ 對齊 `ECDSA.tryRecover`，non-malleable `s` |
| **UserOp `signature`** | 模組綁定 session proof 由 Kernel validation hook 消耗，非 raw EOA sig |

Edge `verifyAgentIntent()` 驗證 attestation envelope 形狀；鏈上 ERC-1271 / ECDSA 驗證分別於 Kernel validateUserOp 與 Gate `verifyAndConsume` 執行。

### ERC-20 / ERC-777 — 非託管資產轉移 Escort 語義

| 語義 | 規則 |
|-----------|------|
| **Collateral SSOT** | Arbitrum 上 USDC（`GMX_USDC_ARBITRUM`）— GMX v2 increase/decrease payloads |
| **無 indefinite custody** | 協議永不將用戶本金記為協議自有；資本保留於用戶 Kernel 帳戶或 venue GM 部位 |
| **In-flight bridge escrow** | 出站 Robinhood → Arbitrum Across 腿標記 `IN_FLIGHT_BRIDGE_CAPITAL`；`lostUsd ≡ 0` 直至逾時（`BRIDGE_TIMEOUT_FAIL_CLOSED`） |
| **Venue settlement** | GMX async keeper 窗口 **3–5 min**；HL withdrawal **15 min** — 庫存於在途持有，非 Gate escrow |
| **ERC-777** | 不在 Citadel 熱路徑；ERC-20 `transfer`/`approve` 僅經 Kernel-scoped UserOp `callData` 至 whitelist 合約呼叫 |

`GatedExecutor.payloadHash()` 將 UserOp `callData` 綁定至 Gate `RiskAttestation.payloadHash` — 無匹配 attestation 的資產移動於鏈上 revert。

---

## 合規姿態（Compliance Posture）

- **ERC-4337：** UserOp 於 bundler 派發前通過 Edge `verifyAgentIntent()`；EntryPoint v0.7 + Kernel v0.3.1 為 canonical；gas ledger 限制每 UserOp 與每日 sponsorship。
- **EIP-7562：** Zero-Bundler-Rejection Invariant — session 模組 + Edge pre-screen 防止 validation-phase storage 違規；bundler 失敗為 fail-closed，非盲目重試。
- **EIP-712：** 所有 Gate attestation 與 SDK envelope 綁定 `chainId` + `verifyingContract` + 域 `SliverVineCitadel` — 跨鏈重放於 `verifyAndConsume` 拒絕。
- **ERC-1271：** Kernel session-key 簽章經標準 magic value 驗證；Gate 路徑使用 ECDSA m-of-n — 雙驗證平面，互不 bypass。
- **ERC-20 / ERC-777：** 非託管 escort — 在途資本標記，永不記為損失；ERC-777 hooks 排除於熱路徑。
- **OpenZeppelin Contracts v5：** Gate 合約強制 fail-closed 存取控制與重入安全執行模式；`SliverVineGate` ECDSA 驗證刻意匹配 OZ `ECDSA.tryRecover`（嚴格 65-byte，non-malleable `s`）。
- **ERC-4337 / ERC-7579：** Session 模組於 UserOp 結構限制外另強制 clip + TTL cap。
- **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)：** 對齊 emerging **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) AI Agent Wallet Policy Specification**（Draft，Virtuals Protocol 共同撰寫）。**非 finalized 標準。**
- **EIP-1559：** Gas-yield ratio fuse 於 L1 surcharge 超過目標收益帶時阻擋 dispatch。
- **Robinhood Chain：** 僅出站 escort（`46630`/`4663` → `42161`）；入站 AML 阻擋 · `lostUsd ≡ 0`。
- **WASM：** 熱路徑 soil 評估鏡像 Edge `checkSoilResistance()` 語義以實現亞毫秒 fail-closed。
- **ERC-7715 解耦：** ⏳ **Planned / V1.0 Design Spec** — ZeroDev Kernel v3 為 v1.0 ephemeral session-key adapter（Gatehouse）。Universal **ERC-7715 Advanced Wallet Permissions** 為演進目標，adapter swap 無需 Shield 或 Wasm 重寫。

---

## ArbOS / Stylus 對齊 — ✅ 程式驗證鏈上 Coprocessor

> **Edge（Cloudflare）仍為預廣播 SSOT。** **`SliverVineSoilCoprocessor`**（`contracts/stylus-probe/src/lib.rs`）為活躍 **u128 定點** soil 數學 coprocessor，經 **Stylus SDK 0.10.7** 編譯 — 鏈上強化與 Edge `checkSoilResistance()` 語義對齊。Elara protocol ingress 仍為 ⏳ V1.0 Design Spec。

| 層級 | 對齊 | 狀態 |
|-------|-----------|--------|
| **Stylus Soil Coprocessor** | **`SliverVineSoilCoprocessor`** — u128 定點 score · `check_soil_resistance_stylus(flags, risk_vector)` · 二次 spread/slippage 懲罰 · fail-closed `depth_usd ≥ 10_000` · `evaluate_soil_coprocessor(spread_bps, depth_usd, slippage_bps)` · 與 Edge soil fuse 對等 | ✅ **程式驗證 Coprocessor**（`contracts/stylus-probe/src/lib.rs` · Stylus SDK **0.10.7** · `cargo test` **9/9 PASS** · `pnpm build:stylus` · Wasm Sandbox Vitest Passed · Sepolia 鏈上部署 **pending tooling lock** · **EIP-1967 proxy path 已記錄**） |
| **Elara protocol ingress** | 協議級入場過濾於 GM payload 構建前丟棄不合規 Robinhood Chain / 黑名單 sender — 補充 `IngressSafetySwitch` | ⏳ V1.0 Design Spec |
| **ArbOS gas / base-fee sensor** | Tri-Sensor **BaseFee Velocity** channel 仍為 dispatch SLO 壅塞 throttle | ✅ v1.0 Delivered（Sepolia verified）（`arbitrum-gas-guard.ts`） |

**設計規則：** Edge（Cloudflare）仍為預廣播 SSOT；Stylus coprocessor + Elara 為鏈上強化平面 — **永不**作為較弱的 Edge fail-closed gate 替代。

### EIP-1967 Upgradeable Proxy — 零鎖定 Stylus 路徑

V2.0 鏈上 Stylus  rollout 目標標準 **[EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) Transparent Upgradeable Proxy** 模式：

| Slot | 用途 |
|------|---------|
| `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` | Implementation — `SliverVineSoilCoprocessor` / `check_soil_resistance_stylus` 邏輯 |
| `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103` | Admin — 多簽治理升級；**無 bytecode lock-in** |

Arbitrum One 上 immutable **`SliverVineGate`**（`0xb174…`）仍為 live attestation 平面；Stylus 為可於 EIP-1967 後部署的 additive coprocessor 強化層，不限制未來數學升級。

**雙執行 SSOT：** [`stylus_core.rs`](../../contracts/stylus-probe/src/stylus_core.rs) 匯出 `check_soil_resistance_stylus(flags: u64, risk_vector: [f64; 6]) -> bool` — bitmask + 六通道向量與 Edge `evaluate*Flags()` / `checkSoilResistance()` 對等。Build：`pnpm build:stylus`。

---

## 基礎設施 RPC / WSS（Alchemy HA）

多鏈 HTTPS/WSS 占位符於 `.env.example` — 本地替換 `YOUR_ALCHEMY_API_KEY`；切勿提交 live keys。

| 場所 | Chain ID | HTTPS (RPC) | WSS |
|-------|----------|-------------|-----|
| **Arbitrum One**（主要） | 42161 | `ARB_MAINNET_RPC_URL` | `ARBITRUM_WSS_URL` |
| **Arbitrum Sepolia**（sandbox） | 421614 | `ARB_SEPOLIA_RPC_URL` | `ARBITRUM_SEPOLIA_WSS_URL` |
| **Robinhood Testnet** | 46630 | `ROBINHOOD_TESTNET_RPC_URL` | `ROBINHOOD_TESTNET_WSS_URL` |
| **Robinhood Mainnet** | 4663 | `ROBINHOOD_MAINNET_RPC_URL` | `ROBINHOOD_MAINNET_WSS_URL` |
| **Hyperliquid**（venue-native + optional HA） | — | `HYPERLIQUID_*_RPC_URL` · SSOT `HL_INFO_URL` / `HL_EXCHANGE_URL` | `HYPERLIQUID_WSS_URL` |

---

## 關聯文檔

| 文檔 | 用途 |
|----------|---------|
| [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md) | 黃皮書 — R01–R20 · 三柱 · 拓撲 |
| [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | 支柱一 — ZeroDev Kernel v3 AA · EIP-7702 對照 |
| [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | 支柱三 — Wasm soil core · p50 ~106µs |
| [`CITADEL_SDK_BLUEPRINT.md`](../sdk/CITADEL_SDK_BLUEPRINT.md) | Apache-2.0 SDK API |

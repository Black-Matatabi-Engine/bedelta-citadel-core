# Pop-Culture Tactical Mapping (影視遊戲戰術哲學)

Santenboku v0.8 uses pop-culture metaphors as **operator-facing annotations** on top of the real risk engine. These names never replace internal guards — they map to existing states (`R20_LOCKED`, `SANTENBOKU_STRIKE`, `SYSTEM_ROLLBACK`, etc.) via primary and optional aliases in [`src/services/tactical-log-tags.ts`](../src/services/tactical-log-tags.ts).

See also: [`ARCHITECTURE.md`](ARCHITECTURE.md) for the Three-Eye system, Coach Engine, and tier boundaries.

---

## Universal Metaphor Comparative Matrix

Master index of **annotation-only optional aliases** (`TACTICAL_LOG_METAPHORS=true`). Each row maps a pop-culture / comparative sector to an existing internal guard — gate verdicts never change.

| Sector | Section | Log Alias | Internal State |
|--------|---------|-----------|----------------|
| **魯班 Lu Ban** *(highlight)* | [S](#section-s-highlight-魯班土木工藝-lu-ban-construction--joinery) | `LUBAN_MORTISE_TENON_LOCK` | `SYSTEM_STATE_STABLE` |
| 魯班 Lu Ban | S | `LUBAN_RULER_BOUNDS_CHECK` | `DYNAMIC_SL_ENFORCED` |
| **Overcooked / Web3** *(highlight)* | [P](#section-p-highlight-web3-宏大概念與-overcooked-混亂協同-grand-web3--overcooked-pipeline) | `OVERCOOKED_FIRE_EXTINGUISHER` | `R20_LOCKED` |
| Byzantine BFT | P | `BYZANTINE_FLEET_CONSENSUS` | `FLEET_HEALTH_CHECK` |
| Tragedy of the Commons | P | `COMMONS_PROTECTION_ACTIVE` | `ANTI_MEV_SHIELD` |
| Invisible Hand | P | `INVISIBLE_HAND_EQUILIBRIUM` | `IMBALANCE_RADAR_ACTIVE` |
| Cypherpunk Manifesto | P | `CYPHERPUNK_MANIFESTO_SHIELD` | `TRUTH_GATE_AUDIT` |
| Rich Dad / ESBI | [Q](#section-q-富爸爸窮爸爸-rich-dad-poor-dad--esbi) | `RICH_DAD_ASSET_CASHFLOW` | `SYSTEM_STATE_STABLE` |
| Money & You | [R](#section-r-money--you-課程-money--you-financial-systems) | `MONEY_AND_YOU_INTEGRITY` | `TRUTH_GATE_AUDIT` |
| 女媧 Nuwa | [V](#section-v-上古神話與遠古文明-mythology-cosmology--lost-civilizations) | `NUWA_FIVE_COLOR_REPAIR` | `R20_LOCKED` |
| 亞特蘭提斯 Atlantis | V | `ATLANTIS_ORICHALCUM_SHIELD` | `DYNAMIC_SL_ENFORCED` |
| 印加 Inca Quipu | V | `INCA_QUIPU_IMMUTABLE_LOG` | `TRUTH_GATE_AUDIT` |
| 恐龍 K-T Extinction | V | `DINOSAUR_KT_EXTINCTION_SHIELD` | `SOIL_RESISTANCE_TRIP` |
| MBTI Architect | [W](#section-w-心理學與東方形上學-psychology--eastern-metaphysics) | `MBTI_INTJ_ARCHITECT_LOGIC` | `TRUTH_GATE_AUDIT` |
| 五行 Five Elements | W | `FIVE_ELEMENTS_EQUILIBRIUM` | `SYSTEM_STATE_STABLE` |
| 紫微 Zi Wei Shield | W | `ZIWEI_MUTATION_RISK_SHIELD` | `R20_LOCKED` |
| I Ching Phase Control | [Y](#section-y-巨觀治理與動態物理-macro-governance--physics-dynamics) | `ICHING_DYNAMIC_PHASE_CONTROL` | `SYSTEM_STATE_STABLE` |
| Bottom-Line Safety Lock | Y | `BOTTOMLINE_RISK_PREVENTION` | `R20_LOCKED` |
| Capital Efficiency Strike | Y | `CAPITAL_EFFICIENCY_STRIKE` | `IMBALANCE_RADAR_ACTIVE` |
| Hohmann Transfer Window | Y | `HOHMANN_TRANSFER_WINDOW_EXEC` | `IMBALANCE_RADAR_ACTIVE` |
| Fencing Microsecond Reaction | Y | `FENCING_MICROSECOND_REACTION_STRIKE` | `IMBALANCE_RADAR_ACTIVE` |
| Hawking Singularity Shield | Y | `HAWKING_SINGULARITY_LOCK` | `R20_LOCKED` |
| Nash Equilibrium MEV | [Z](#section-z-賽局理論與量子交易學數學矩陣-game-theory--quantum-finance) | `NASH_EQUILIBRIUM_MEV_COUNTER` | `ANTI_MEV_SHIELD` |
| Fractional Kelly Sizing | Z | `FRACTIONAL_KELLY_CAPITAL_SIZING` | `DYNAMIC_SL_ENFORCED` |
| Schrödinger Wave Collapse | Z | `SCHRODINGER_WAVE_STATE_COLLAPSE` | `SYSTEM_STATE_STABLE` |
| Quantum Tunneling Trip | Z | `QUANTUM_TUNNELING_VOLATILITY_TRIP` | `SOIL_RESISTANCE_TRIP` |

Extended optional aliases (DISC, Human Design, Tie Ban, etc.) live in Sections [T](#section-t-職場心理學-workplace-psychology-mbti-disc-human-design) and [U](#section-u-東方命理與形上學-eastern-metaphysics).

---

## Mapping Overview

| Pop-Culture Reference | Tactical Concept | Internal State | Log Alias |
|---------------------|------------------|----------------|-----------|
| 周星馳《功夫》 | 無招勝有招 / 唯快不破 | `KUNG_FU_MICRO_EXEC` | `KUNG_FU_NO_FORM_STRIKE` |
| 《回到未來》 | Flux Capacitor (1.21 GW Snapshot) | `SYSTEM_ROLLBACK` | `FLUX_SNAPSHOT_RESTORED` |
| 《星球大戰》 | Order 66 (66 號密令) | `ORDER_66_CANCEL_ALL` | `ORDER_66_TRIGGERED` |
| Marvel MCU | Infinity Gauntlet (6 Risk Gems) | `INFINITY_GAUNTLET_ARMED` | `INFINITY_GAUNTLET_ARMED` |
| 《薩爾達》Flurry Rush | 林克時間反擊 | `SANTENBOKU_STRIKE` | `FLURRY_RUSH_STRIKE` |
| 《流浪地球》 | MOSS Tinder Lock | `MOSS_TINDER_LOCK` | `MOSS_TINDER_LOCK` |
| — (defense) | Root 20 physical deadlock | `R20_LOCKED` | `R20_LOCKED` |
| — (defense) | Root 17 daily cap | `R17_LOCKED` | `R17_LOCKED` |
| — (defense) | Soil resistance trip (Power Gem) | `SOIL_RESISTANCE_TRIP` | `POWER_GEM_TRIPPED` |
| 小學館《哆啦 A 夢》 | DonDon 4D Pocket Defense | `DONDON_4D_POCKET` | `DONDON_4D_POCKET_ACTIVE` |
| 《獵人》念能力 | 凝 Gyo — fake-wall sensing | `NEN_GYO_SENSING` | `NEN_GYO_SENSING` |
| 《咒術迴戰》 | 領域展開 — soil execution zone | `DOMAIN_EXPANSION_ZONE` | `DOMAIN_EXPANSION_SOIL` |
| Solo Leveling | Shadow Monarch fleet arise | `SHADOW_FLEET_ARISE` | `SHADOW_ARRAISE_FLEET` |
| 《獵人》念能力 | 絕 Zetsu — silent API cloak | `NEN_ZETSU_CLOAK` | `NEN_ZETSU_CLOAK` |
| 《獵人》念能力 | 制約與誓約 — Dynamic SL vow | `NEN_VOW_LIMITATION` | `NEN_VOW_LIMITATION` |
| 《龍珠》 | 殘像拳 — decoy fleet routing | `AFTERIMAGE_FLEET` | `AFTERIMAGE_FLEET_DECOY` |
| 基督教 | Noah's Ark — capital preservation | `SOIL_RESISTANCE_TRIP` | `ARK_SAFETY_PROTOCOL` *(optional)* |
| 基督教 | Ten Commandments Dynamic SL | `DYNAMIC_SL_ENFORCED` | `TEN_COMMANDMENTS_SL` |
| 佛教 | Diamond Body physical deadlock | `R20_LOCKED` | `DIAMOND_BODY_LOCK` *(optional)* |
| 金庸《九陽真經》 | 他強任他強 — impact absorb | `SOIL_RESISTANCE_TRIP` | `JIUYANG_IMPACT_ABSORB` *(optional)* |
| 金庸《獨孤九劍》 | 破氣式 vacuum strike | `SANTENBOKU_STRIKE` | `DUGU_NINE_SWORDS_STRIKE` *(optional)* |
| 三國諸葛亮 | 八陣圖 matrix scan | `IMBALANCE_RADAR_ACTIVE` | `EIGHT_FORMATIONS_SCAN` |
| 日本戰國 | 風林火山 — 不動如山 | `R20_LOCKED` | `FURINKAZAN_MOUNTAIN` *(optional)* |
| 韓國李舜臣 | 龜甲船 Anti-MEV shield | `ANTI_MEV_SHIELD` | `TURTLE_SHIP_PROTECT` |
| 鋼之鍊金術師 | 真理之門等價交換風控 | `TRUTH_GATE_AUDIT` | `GATE_OF_TRUTH_EQUAL_EXCHANGE` |
| DonDum 街市 | DonDum 冷眼 HUD | `DONDUM_HUD_ACTIVE` | `DONDUM_MARKET_OVERVIEW` |
| FOMO 街市 | 街市噪音過濾 | `SOIL_RESISTANCE_TRIP` | `FOMO_MARKET_NOISE_MUTED` *(optional)* |
| Buckminster Fuller Institute | Tensegrity fleet balance | `SYSTEM_STATE_STABLE` | `BFI_TENSEGRITY_BALANCE` *(optional)* |
| 中本聰 | Genesis Risk Covenant (1%+$100) | `DYNAMIC_SL_ENFORCED` | `SATOSHI_GENESIS_COVENANT` *(optional)* |
| 通訊範式轉移 | Edge event-driven sync | `IMBALANCE_RADAR_ACTIVE` | `PARADIGM_SHIFT_EDGE_SYNC` *(optional)* |
| Steve Jobs / Apple | Say NO to FOMO noise | `SOIL_RESISTANCE_TRIP` | `JOBS_SAY_NO_TO_FOMO` *(optional)* |
| Michael Jackson | Moonwalk anti-slippage routing | `ANTI_MEV_SHIELD` | `MJ_MOONWALK_ANTI_SLIPPAGE` *(optional)* |
| Harry Potter | Unbreakable Vow (1%+$100) | `DYNAMIC_SL_ENFORCED` | `POTTER_UNBREAKABLE_VOW` *(optional)* |
| Harry Potter | Invisibility Cloak on R20 | `R20_LOCKED` | `POTTER_INVISIBILITY_CLOAK` *(optional)* |
| Shakespeare | To Be or Not To Be binary gate | `SOIL_RESISTANCE_TRIP` | `SHAKESPEARE_TO_BE_GATE` *(optional)* |
| **Overcooked** | **Fire extinguisher R20 fuse** | `R20_LOCKED` | `OVERCOOKED_FIRE_EXTINGUISHER` *(optional)* |
| Byzantine Generals | Fleet BFT consensus | `FLEET_HEALTH_CHECK` | `BYZANTINE_FLEET_CONSENSUS` *(optional)* |
| Tragedy of the Commons | Blockspace MEV defense | `ANTI_MEV_SHIELD` | `COMMONS_PROTECTION_ACTIVE` *(optional)* |
| Adam Smith | Invisible Hand equilibrium | `IMBALANCE_RADAR_ACTIVE` | `INVISIBLE_HAND_EQUILIBRIUM` *(optional)* |
| Cypherpunk Manifesto | Privacy / key isolation shield | `TRUTH_GATE_AUDIT` | `CYPHERPUNK_MANIFESTO_SHIELD` *(optional)* |
| Rich Dad Poor Dad | B/I quadrant asset cashflow | `SYSTEM_STATE_STABLE` | `RICH_DAD_ASSET_CASHFLOW` *(optional)* |
| Money & You | System integrity guardian | `TRUTH_GATE_AUDIT` | `MONEY_AND_YOU_INTEGRITY` *(optional)* |
| **魯班** | **Mortise & tenon joinery lock** | `SYSTEM_STATE_STABLE` | `LUBAN_MORTISE_TENON_LOCK` *(optional)* |
| 魯班 | Lu Ban ruler bounds (1%+$100) | `DYNAMIC_SL_ENFORCED` | `LUBAN_RULER_BOUNDS_CHECK` *(optional)* |
| MBTI | INTJ/ISTJ architect logic | `TRUTH_GATE_AUDIT` | `MBTI_INTJ_ARCHITECT_LOGIC` *(optional)* |
| DISC | Root defense compliance | `SOIL_RESISTANCE_TRIP` | `DISC_COMPLIANCE_EXECUTION` *(optional)* |
| Human Design | Authority gate / radar balance | `IMBALANCE_RADAR_ACTIVE` | `HUMAN_DESIGN_AUTHORITY_GATE` *(optional)* |
| 五行 | Five Elements equilibrium | `SYSTEM_STATE_STABLE` | `FIVE_ELEMENTS_EQUILIBRIUM` *(optional)* |
| 紫微斗數 | Mutation risk shield (R17/R20) | `R20_LOCKED` | `ZIWEI_MUTATION_RISK_SHIELD` *(optional)* |
| 鐵板神算 | Numerical precision fleet check | `FLEET_HEALTH_CHECK` | `TIEBAN_NUMERICAL_PRECISION` *(optional)* |
| 女媧 | Five-color sky repair (R20 shield) | `R20_LOCKED` | `NUWA_FIVE_COLOR_REPAIR` *(optional)* |
| 亞特蘭提斯 | Orichalcum 1%+$100 shield | `DYNAMIC_SL_ENFORCED` | `ATLANTIS_ORICHALCUM_SHIELD` *(optional)* |
| 印加帝國 | Quipu immutable audit log | `TRUTH_GATE_AUDIT` | `INCA_QUIPU_IMMUTABLE_LOG` *(optional)* |
| 恐龍時代 | K-T extinction black swan shield | `SOIL_RESISTANCE_TRIP` | `DINOSAUR_KT_EXTINCTION_SHIELD` *(optional)* |
| 易經 | Dynamic phase control | `SYSTEM_STATE_STABLE` | `ICHING_DYNAMIC_PHASE_CONTROL` *(optional)* |
| 底線思維 | Bottom-line R17/R20 safety lock | `R20_LOCKED` | `BOTTOMLINE_RISK_PREVENTION` *(optional)* |
| 富國論 | Capital efficiency strike | `IMBALANCE_RADAR_ACTIVE` | `CAPITAL_EFFICIENCY_STRIKE` *(optional)* |
| 霍曼轉移 | Hohmann transfer execution window | `IMBALANCE_RADAR_ACTIVE` | `HOHMANN_TRANSFER_WINDOW_EXEC` *(optional)* |
| 劍擊反應 | Human reaction limit vs microsecond MEV strike | `IMBALANCE_RADAR_ACTIVE` | `FENCING_MICROSECOND_REACTION_STRIKE` *(optional)* |
| 霍金奇點 | Hawking singularity circuit breaker | `R20_LOCKED` | `HAWKING_SINGULARITY_LOCK` *(optional)* |
| 納許均衡 | Nash equilibrium MEV counter | `ANTI_MEV_SHIELD` | `NASH_EQUILIBRIUM_MEV_COUNTER` *(optional)* |
| 分數凱利 | Fractional Kelly capital sizing | `DYNAMIC_SL_ENFORCED` | `FRACTIONAL_KELLY_CAPITAL_SIZING` *(optional)* |
| 薛丁格塌縮 | Schrödinger wave state collapse | `SYSTEM_STATE_STABLE` | `SCHRODINGER_WAVE_STATE_COLLAPSE` *(optional)* |
| 量子穿隧 | Quantum tunneling volatility trip | `SOIL_RESISTANCE_TRIP` | `QUANTUM_TUNNELING_VOLATILITY_TRIP` *(optional)* |

*(optional)* = alternate alias via `TACTICAL_OPTIONAL_ALIASES`; primary alias unchanged.

---

## 周星馳《功夫》 — Kung Fu: No Form Beats Form

**Philosophy:** *無招勝有招* (no form beats form) · *唯快不破* (speed is undefeated).

**Architecture mapping:** Pure orderbook micro-liquidity execution — no indicator clutter, no lagging signals. The Right Eye reads live Ask/Bid imbalance and micro-spread collapse; the Third Eye fires only on raw book state after Left Eye defense passes.

| Component | Module |
|-----------|--------|
| Micro-spread sensing | `SantenbokuStrikeEngine.evaluateRightEye()` |
| Zero-indicator strike path | `resolveAttackLock()` → soil + margin only |
| Sensing probes | `StrikeAlphaConfig.sensingProbeNotionalUsd` |

**Log alias:** `KUNG_FU_NO_FORM_STRIKE` when internal state is `KUNG_FU_MICRO_EXEC`.

---

## 史匹堡《回到未來》 — Back to the Future: Flux Capacitor

**Philosophy:** *1.21 GW* — the exact energy threshold to jump timelines safely.

**Architecture mapping:** Cloudflare KV state snapshots capture a known-good fleet + risk posture. During black-swan events, the Coach or Worker alarm restores the last safe snapshot — instant rollback without replaying bad fills.

| Component | Module |
|-----------|--------|
| Snapshot write | `SILVERVINE_KV` binding (`src/env.ts`) |
| Rollback trigger | Coach `evaluateMacroRegime()` → CRITICAL |
| Safe-state restore | Internal `SYSTEM_ROLLBACK` |

**Log aliases:**
- `FLUX_SNAPSHOT_SAVED` — snapshot persisted pre-strike
- `FLUX_SNAPSHOT_RESTORED` — rollback to last safe KV state

---

## 《星球大戰》 — Star Wars: Order 66

**Philosophy:** Emergency protocol — terminate all active agents, isolate command.

**Architecture mapping:** When critical risk boundaries breach fleet-wide, the system issues **Order 66**: global `Cancel-All` on open orders and **Session Key isolation** (signing channel severed). Maps to Coach Red Card + CRI hardlock cascade.

| Component | Module |
|-----------|--------|
| Cancel-All authority | `ORDER_66_CANCEL_ALL` internal state |
| Session isolation | `rootProtection({ criHardlock: true })` → HTTP 403 |
| Coach trigger | `evaluateRedCard()` → R17 / R20 |

**Log alias:** `ORDER_66_TRIGGERED`

---

## Marvel MCU — Infinity Gauntlet (6 Risk Gems)

**Philosophy:** Six gems must align before reality can be rewritten — here, before capital is deployed.

| Gem | Risk Function | Module |
|-----|---------------|--------|
| **Power** — Soil Check | Cross-venue slippage + depth fuse | `checkSoilResistance()` |
| **Space** — Dynamic SL | Balance × 1% + $100 Max SL | `computeEffectiveMaxSlUsd()` |
| **Time** — R17 Daily Loss | UTC-day drawdown + 3 SL/day cap | `checkRoot17DailyLimit()` |
| **Mind** — R20 Deadlock | Physical signing block at CRI 0 / Max SL | `rootProtection()` |
| **Reality** — Imbalance Radar | Ask/Bid skew + micro-spread collapse | `evaluateRightEye()` |
| **Soul** — HL Lend Collateral | Fleet liquidity vault for pit-stops | `FleetRole: hl_lend_vault` |

When all six pass, internal state becomes `INFINITY_GAUNTLET_ARMED` — the strike gate may arm (`SANTENBOKU_STRIKE`).

**Log alias:** `INFINITY_GAUNTLET_ARMED`

---

## 任天堂《薩爾達傳說》 — Zelda: Flurry Rush (林克時間)

**Philosophy:** After a perfect defensive dodge, time slows — a burst of ultra-fast counter-attacks.

**Architecture mapping:** Once Left Eye defense **PASS**es and Right Eye detects a micro-spread liquidity vacuum, the Third Eye triggers **Flurry Rush**: ultra-fast Taker execution in the vacuum window before the book refills.

| Component | Module |
|-----------|--------|
| Defensive dodge | `evaluateLeftEye()` → PASS |
| Vacuum detection | `microSpreadCollapse` in `evaluateRightEye()` |
| Counter burst | `evaluateStrikeGate()` → `armed: true` |

**Log alias:** `FLURRY_RUSH_STRIKE` → internal `SANTENBOKU_STRIKE`

---

## 《流浪地球》 — The Wandering Earth: MOSS Tinder Lock

**Philosophy:** When the network fails, MOSS locks humanity to survival mode — reduce-only, no new risk.

**Architecture mapping:** During venue API or network collapse (fetch failures, RPC denylist, venue delay CRITICAL), the system engages **MOSS Tinder Lock**: reduce-only safeguards — no new opens, only position reduction and collateral preservation.

| Component | Module |
|-----------|--------|
| Venue collapse detect | `evaluateMacroRegime()` venue delay + adapter errors |
| Reduce-only mode | `MOSS_TINDER_LOCK` internal state |
| Network fuse | `humanizeSystemLog()` venue/RPC error paths |

**Log alias:** `MOSS_TINDER_LOCK`

---

## ACG, Manga & DonDon Completion Metaphors (漫畫 / 輕小說 / DonDon 完形)

The following extensions layer **anime, manga, webtoon, and DonDon HUD** metaphors onto the same internal state machine. All tags remain annotation-only.

---

### A. 小學館《哆啦 A 夢》 — DonDon Completion Protocol (DonDon 完形)

**Philosophy:** *四次元口袋* — infinite defensive gadgets pulled exactly when needed.

#### 4D Pocket Defense (四次元風控口袋)

Dynamic risk tools stored in the Santenboku "4D pocket" — deployed without cluttering the hot execution path:

| Gadget | Architecture | Internal State |
|--------|--------------|----------------|
| **Air Cannon** — Iceberg Orders | Hidden size slices via `StrikeAlphaConfig.sensingProbeNotionalUsd` | `DONDON_4D_POCKET` |
| **Take-Copter** — Liquidity Floating | Cross-venue depth routing via exchange adapters | `DONDON_4D_POCKET` |
| **Time Machine** — State Rollbacks | KV snapshot restore on black swan | `SYSTEM_ROLLBACK` → `FLUX_SNAPSHOT_RESTORED` |

**Log alias:** `DONDON_4D_POCKET_ACTIVE`

#### DonDon HUD Visual Alignment

The **Cat Visual HUD** (`CatHud`, `TerminalStatusDock`) merges with the multi-gadget protection interface — each Root telemetry row maps to a "gadget slot" in the DonDon completion UI. HUD alignment is Tier 0 only; it never bypasses Tier 1 hardlocks.

| Component | Module |
|-----------|--------|
| Cat HUD overlay | `src/v2/components/CatHud.tsx` |
| Root gadget slots | `ROOT_DEFENSE_TELEMETRY` in `trade-pipeline.ts` |
| 4D pocket active signal | Coach + strike config resolved at boot |

---

### B. 《獵人》 Hunter × Hunter — Nen (念能力)

**Philosophy:** Focused aura techniques with strict conditions — power proportional to constraint.

#### 凝 (Gyo) — Focused Orderbook Vision

**Gyo** concentrates aura on a single point — here, the live orderbook. Detects Ask/Bid imbalance skew and **fake liquidity walls** before a sized strike.

| Component | Module |
|-----------|--------|
| Imbalance ratio | `evaluateRightEye()` |
| Sensing probes | `StrikeAlphaConfig.sensingProbeNotionalUsd` |
| Fake-wall abort | Coach `calibrateStrikeThresholds()` feedback loop |

**Log alias:** `NEN_GYO_SENSING` → internal `NEN_GYO_SENSING`

#### 絕 (Zetsu) — Silent API Cloak

Upon **R20 physical deadlock**, the system enters **Zetsu**: all outbound API signing and session keys go silent — no heartbeat leaks, no retry storms.

| Component | Module |
|-----------|--------|
| Signing channel sever | `rootProtection({ criHardlock: true })` |
| HTTP 403 hardlock | `HardlockError` in `risk-control.ts` |

**Log alias:** `NEN_ZETSU_CLOAK` → internal `NEN_ZETSU_CLOAK` (same guard as `R20_LOCKED`)

#### 制約與誓約 (Vow & Limitation) — Dynamic SL Covenant

Strict adherence to **`Balance × 1% + $100`** Dynamic Max SL is the **Vow**. Honoring it unlocks maximum counter-strike power (Third Eye arming); breaching it triggers instant deadlock.

| Component | Module |
|-----------|--------|
| Vow math | `computeEffectiveMaxSlUsd()` |
| Breach trip | `rootProtection()` → `RiskLimitExceeded` |

**Log alias:** `NEN_VOW_LIMITATION` → internal `NEN_VOW_LIMITATION`

---

### C. Shonen Jump Classics (少年 Jump 經典)

#### 《咒術迴戰》— 領域展開 (Domain Expansion)

When `checkSoilResistance()` **PASS**es, Santenboku creates an **active execution zone** — a bounded domain where strike logic may operate. Inside the domain, slippage and depth rules are enforced; outside, all attacks are nullified.

| Component | Module |
|-----------|--------|
| Domain boundary | `checkSoilResistance()` → `ok: true` |
| Domain lock on trip | `SOIL_RESISTANCE_TRIP` → attack blocked |

**Log alias:** `DOMAIN_EXPANSION_SOIL` → internal `DOMAIN_EXPANSION_ZONE`

#### 《龍珠》— 殘像拳 (Afterimage Fleet)

Multi-wallet **decoy order routing** obfuscates core Attacker intent from MEV bots. Bench wallets emit micro sensing orders; the active Attacker executes the real fill.

| Component | Module |
|-----------|--------|
| Decoy routing | `evaluateSubstitution()` + fleet co-op |
| MEV threat response | Coach `evaluateMacroRegime()` |

**Log alias:** `AFTERIMAGE_FLEET_DECOY` → internal `AFTERIMAGE_FLEET`

---

### D. Korean Webtoons & Light Novels (韓漫 / 輕小說)

#### Solo Leveling — Shadow Monarch (影之軍團 Fleet)

Connected **Session Key wallets** execute in unison when SystemState emits the **"Arise"** signal — fleet co-op mode promotes all eligible Attacker/Hedger/Vault slots.

| Component | Module |
|-----------|--------|
| Arise signal | `SystemState` CRI / DEFCON clear + `STRIKE_FLEET_MODE=true` |
| Shadow fleet | `FleetWalletSlot[]` with `role: attacker | hedger | hl_lend_vault` |
| Coach orchestration | `evaluateSubstitution()` + `evaluateRedCard()` |

**Log alias:** `SHADOW_ARRAISE_FLEET` → internal `SHADOW_FLEET_ARISE`

#### Status Window (狀態視窗)

Real-time stats panel — the light-novel **Status Window** for operators:

| Stat | Display source |
|------|----------------|
| Risk tier | CRI engine + Root telemetry badges |
| Dynamic SL | `computeEffectiveMaxSlUsd()` label |
| System status | `TerminalStatusDock` + `statusDictionary` |

Status Window is Tier 0 UI; it mirrors Tier 1 truth but never overrides it.

---

## Section E: 宗教與精神哲學 (Religion & Philosophy)

Canonical finalized mappings — annotation only; Tier 1 guards unchanged.

| Reference | Concept | Internal State | Log Alias |
|-----------|---------|----------------|-----------|
| 基督教 (Noah's Ark) | 諾亞方舟種子避險 | `SOIL_RESISTANCE_TRIP` | `ARK_SAFETY_PROTOCOL` |
| 基督教 (Covenant) | 摩西十戒 (1%+$100) | `DYNAMIC_SL_ENFORCED` | `TEN_COMMANDMENTS_SL` |
| 佛教 (Diamond Sutra) | 金剛不壞物理死鎖 | `R20_LOCKED` | `DIAMOND_BODY_LOCK` |

**Zen Impermanence** (`ZEN_IMPERMANENCE_GUARD`) remains an optional alias on `KUNG_FU_MICRO_EXEC` — non-attachment to lagging indicators.

---

## Section F: 金庸武俠宇宙 (Jin Yong Wuxia)

| Reference | Concept | Internal State | Log Alias |
|-----------|---------|----------------|-----------|
| 九陽真經 | 他強任他強 (吸收市場衝擊) | `SOIL_RESISTANCE_TRIP` | `JIUYANG_IMPACT_ABSORB` |
| 獨孤九劍 | 破氣式 (洞穿流動性真空) | `SANTENBOKU_STRIKE` | `DUGU_NINE_SWORDS_STRIKE` |

**天罡北斗陣** (`SEVEN_STARS_FLEET` → `SHADOW_FLEET_ARISE`) — multi-wallet fleet co-op; see Coach Engine.

---

## Section G: 東亞歷史兵法 (East Asian History)

| Reference | Concept | Internal State | Log Alias |
|-----------|---------|----------------|-----------|
| 中國三國 | 諸葛亮八陣圖 / 空城計 | `IMBALANCE_RADAR_ACTIVE` | `EIGHT_FORMATIONS_SCAN` |
| 日本戰國 | 風林火山 (不動如山) | `R20_LOCKED` | `FURINKAZAN_MOUNTAIN` |
| 韓國三國 | 李舜臣龜甲船 (防夾心鋼鐵艦) | `ANTI_MEV_SHIELD` | `TURTLE_SHIP_PROTECT` |

**風林火山 full doctrine:** 疾如風 (`FURINKAZAN_WIND` → strike) · 徐如林 (`FURINKAZAN_FOREST` → soil pass) · 侵掠如火 (`FURINKAZAN_FIRE` → micro exec) · 不動如山 (`FURINKAZAN_MOUNTAIN` → R20).

**空城計** (`EMPTY_FORT_DECOY` → `AFTERIMAGE_FLEET`) — Anti-MEV decoy routing via bench wallets.

---

## Section H: 真理之門與 DonDum 街市宇宙 (Gate of Truth & DonDum Market)

| Reference | Concept | Internal State | Log Alias |
|-----------|---------|----------------|-----------|
| 鋼之鍊金術師 | 真理之門 (等價交換等代價風控) | `TRUTH_GATE_AUDIT` | `GATE_OF_TRUTH_EQUAL_EXCHANGE` |
| DonDum 大哥 | DonDum 街市冷眼 HUD | `DONDUM_HUD_ACTIVE` | `DONDUM_MARKET_OVERVIEW` |
| FOMO 街市 | 街市噪音過濾 (防過度交易) | `SOIL_RESISTANCE_TRIP` | `FOMO_MARKET_NOISE_MUTED` |

**Truth Gate** — every deployment must satisfy equal exchange: estimated loss ≤ Dynamic Max SL before Third Eye arming (`rootProtection` + `computeEffectiveMaxSlUsd`).

**DonDum HUD** — `CatHud` / terminal dock cold-eye overview; Tier 0 display only.

**FOMO Mute** — soil resistance trip blocks impulsive over-trading when street noise exceeds risk bounds.

---

## Section I: Buckminster Fuller Institute (BFI) — 張拉整體風控

**Philosophy:** *Tensegrity* — tension and compression in dynamic equilibrium; no single point bears all load.

**Architecture mapping:** Fleet wallet tension/compression balance distributes risk across Attacker, Hedger, and HL Lend Vault slots. Dynamic SL bounds act as compression members; live margin and soil checks act as tension members. When the structure holds, internal state is `SYSTEM_STATE_STABLE`.

| Component | Module |
|-----------|--------|
| Fleet load distribution | `FleetWalletSlot[]` + `evaluateSubstitution()` |
| Dynamic SL bounds | `computeEffectiveMaxSlUsd()` |
| Stability signal | Coach `evaluateMacroRegime()` → CLEAR |

#### Geodesic Structure

Minimal structural overhead for maximum defensive load capacity — the fleet co-op topology uses the fewest active wallets required to absorb venue shock without redundant signing surface.

**Log alias:** `BFI_TENSEGRITY_BALANCE` → internal `SYSTEM_STATE_STABLE` *(optional)*

---

## Section J: 中本聰去中心化信仰 (Satoshi Nakamoto)

**Philosophy:** *Don't trust, verify* — every risk covenant must be cryptographically auditable, not assumed.

**Architecture mapping:** The **Genesis Risk Covenant** enforces the unbreakable **`Balance × 1% + $100`** Dynamic Max SL before any Third Eye arming. Breach triggers instant deadlock — no discretionary override.

| Component | Module |
|-----------|--------|
| Covenant math | `computeEffectiveMaxSlUsd()` |
| Verify-before-arm | `rootProtection()` + `evaluateLeftEye()` |
| Breach trip | `RiskLimitExceeded` / `HardlockError` |

**Log alias:** `SATOSHI_GENESIS_COVENANT` → internal `DYNAMIC_SL_ENFORCED` *(optional)*

---

## Section K: 通訊範式轉移 (Pre-Internet to Internet Era)

**Philosophy:** Transition from legacy polling to low-latency **edge event routing** — react to book changes, don't chase stale snapshots.

**Architecture mapping:** **Edge Event Driven** sync replaces periodic REST polling with live orderbook imbalance events. The Right Eye radar arms only on fresh Ask/Bid skew and micro-spread collapse signals routed at the edge.

| Component | Module |
|-----------|--------|
| Live imbalance events | `evaluateRightEye()` |
| Micro-spread collapse | `OrderbookImbalanceSnapshot` |
| Radar active signal | `IMBALANCE_RADAR_ACTIVE` |

**Log alias:** `PARADIGM_SHIFT_EDGE_SYNC` → internal `IMBALANCE_RADAR_ACTIVE` *(optional)*

---

## Section L: Steve Jobs 設計哲學 (Steve Jobs / Apple)

**Philosophy:** *Say NO to 1,000 things* — focus means rejecting 99% of non-structural noise.

**Architecture mapping:** When FOMO street noise exceeds risk bounds, soil resistance **trips** — the system deliberately rejects impulsive over-trading. Only structural imbalance signals pass; hype-driven micro-moves are filtered out.

| Component | Module |
|-----------|--------|
| Noise filter | `checkSoilResistance()` → trip |
| FOMO mute path | `SOIL_RESISTANCE_TRIP` |
| Coach calibration | `calibrateStrikeThresholds()` |

**Log alias:** `JOBS_SAY_NO_TO_FOMO` → internal `SOIL_RESISTANCE_TRIP` *(optional)*

---

## Section M: Michael Jackson 節奏與動態 (Michael Jackson)

**Philosophy:** *Moonwalk* — smooth backward glide without friction; *Smooth Criminal* — precision under pressure.

**Architecture mapping:** **Moonwalk & Smooth Criminal** anti-slippage routing executes fills with minimal footprint — decoy fleet routing and cross-venue depth selection shield the Attacker from MEV sandwich and front-run extraction.

| Component | Module |
|-----------|--------|
| Anti-MEV hull | `ANTI_MEV_SHIELD` |
| Decoy routing | `evaluateSubstitution()` + `AFTERIMAGE_FLEET` |
| Turtle Ship fallback | `TURTLE_SHIP_PROTECT` primary alias |

**Log alias:** `MJ_MOONWALK_ANTI_SLIPPAGE` → internal `ANTI_MEV_SHIELD` *(optional)*

---

## Section N: Harry Potter (哈利波特魔法防禦)

**Philosophy:** Magical defense through binding vows and concealment — break the vow, face irreversible consequence.

#### Unbreakable Vow (不可破誓)

The unbreakable **`Balance × 1% + $100`** covenant — same Dynamic SL vow as Nen Vow / Ten Commandments, framed as a wizarding oath that cannot be waived once sworn.

| Component | Module |
|-----------|--------|
| Vow enforcement | `computeEffectiveMaxSlUsd()` |
| Breach consequence | `rootProtection()` → R20 |

**Log alias:** `POTTER_UNBREAKABLE_VOW` → internal `DYNAMIC_SL_ENFORCED` *(optional)*

#### Invisibility Cloak (隱形斗篷)

Upon **R20 physical deadlock**, fleet session keys enter **Invisibility Cloak** mode — silent, no outbound signing leaks, no retry storms exposing fleet posture.

| Component | Module |
|-----------|--------|
| Cloak trigger | `rootProtection({ criHardlock: true })` |
| Signing sever | `HardlockError` HTTP 403 |

**Log alias:** `POTTER_INVISIBILITY_CLOAK` → internal `R20_LOCKED` *(optional)*

---

## Section O: Shakespeare (沙士比亞戲劇與風控)

**Philosophy:** *To Be or Not To Be* — the ultimate binary gate; hubris and tragic flaw removed from execution.

**Architecture mapping:** Soil resistance presents a **binary gate**: PASS (be — enter the execution domain) or TRIP (not to be — block all attack paths). No human discretion, no "maybe" — the tragic flaw of override is structurally impossible at Tier 1.

| Component | Module |
|-----------|--------|
| Binary soil gate | `checkSoilResistance()` |
| Trip = not to be | `SOIL_RESISTANCE_TRIP` |
| Pass = domain entry | `DOMAIN_EXPANSION_ZONE` |

**Log alias:** `SHAKESPEARE_TO_BE_GATE` → internal `SOIL_RESISTANCE_TRIP` *(optional)*

---

## Section P (HIGHLIGHT): Web3 宏大概念與 Overcooked 混亂協同 (Grand Web3 & Overcooked Pipeline)

> **Priority metaphor:** The **Overcooked Kitchen** models Santenboku's concurrent execution pipeline — prep, serve, cleanup, and emergency fuse — as a chaotic co-op kitchen where every station must stay in sync or the whole service line trips.

### Overcooked Kitchen Concurrency (煮過頭極速併發廚房)

| Station | Role | Architecture | Internal State |
|---------|------|--------------|----------------|
| **Prep Station** (切菜/驗證) | Validate before any cook | `checkSoilResistance()` — no strike before prep passes | `SOIL_RESISTANCE_PASS` / `DOMAIN_EXPANSION_ZONE` |
| **Serve Station** (出菜/閃擊) | Fast Taker on vacuum | `evaluateRightEye()` → `evaluateStrikeGate()` armed | `SANTENBOKU_STRIKE` |
| **Dishwashing** (洗碗/資金回流) | Margin cleanup + collateral recycle | HL Lend vault pit-stop + `evaluateSubstitution()` | `SHADOW_FLEET_ARISE` / `SYSTEM_STATE_STABLE` |
| **Fire Extinguisher** (滅火器熔斷) | Kitchen on fire — kill all burners | `rootProtection({ criHardlock: true })` → R20 physical deadlock | `R20_LOCKED` |

**Log alias:** `OVERCOOKED_FIRE_EXTINGUISHER` → internal `R20_LOCKED` *(optional)*

### Byzantine Fault Tolerance (拜占庭將軍問題)

**Fleet BFT Consensus** — multi-wallet fleet maintains state safety even when one venue or RPC node drops. Coach evaluates aggregate fleet health before arming; a single Byzantine venue cannot corrupt the consensus.

| Component | Module |
|-----------|--------|
| Fleet health aggregate | `FleetAggregateMetrics` + `evaluateRedCard()` |
| Substitution on failure | `evaluateSubstitution()` |
| Consensus clear signal | `FLEET_HEALTH_CHECK` |

**Log alias:** `BYZANTINE_FLEET_CONSENSUS` → internal `FLEET_HEALTH_CHECK` *(optional)*

### Tragedy of the Commons (公地悲劇 & MEV Protection)

**Blockspace Commons Defense** — anti-extraction routing shields shared liquidity from predatory MEV bots harvesting the public mempool commons.

| Component | Module |
|-----------|--------|
| Anti-MEV hull | `ANTI_MEV_SHIELD` |
| Decoy routing | `AFTERIMAGE_FLEET` + bench wallets |
| MEV threat level | Coach `evaluateMacroRegime()` → `mevThreatLevel` |

**Log alias:** `COMMONS_PROTECTION_ACTIVE` → internal `ANTI_MEV_SHIELD` *(optional)*

### Adam Smith — Invisible Hand (亞當斯密「看不見的手」)

**Market Equilibrium Sensing** — strike at the exact micro-supply/demand imbalance point where the invisible hand of the orderbook reveals a transient vacuum.

| Component | Module |
|-----------|--------|
| Imbalance ratio | `evaluateRightEye()` |
| Micro-spread collapse | `OrderbookImbalanceSnapshot` |
| Radar active | `IMBALANCE_RADAR_ACTIVE` |

**Log alias:** `INVISIBLE_HAND_EQUILIBRIUM` → internal `IMBALANCE_RADAR_ACTIVE` *(optional)*

### Cypherpunk Manifesto (密碼龐克宣言)

**Cypherpunk Privacy Shield** — zero-knowledge private key isolation and local-first signing; fleet keys never leave the signing boundary. Truth Gate audit verifies equal exchange before any capital deployment.

| Component | Module |
|-----------|--------|
| Equal-exchange audit | `TRUTH_GATE_AUDIT` |
| Key isolation | Session keys severed on R20 (`NEN_ZETSU_CLOAK`) |
| Verify-before-arm | `rootProtection()` + `computeEffectiveMaxSlUsd()` |

**Log alias:** `CYPHERPUNK_MANIFESTO_SHIELD` → internal `TRUTH_GATE_AUDIT` *(optional)*

---

## Section Q: 富爸爸窮爸爸 (Rich Dad Poor Dad & ESBI)

**Philosophy:** Transition from **E/S** (Employee/Self-employed manual labor) to **B/I** (Business/Investor automated cash-flow systems).

### B/I Quadrant Automation

When fleet co-op mode is stable and HL Lend collateral recycles automatically, the system operates as a **B/I cash-flow asset** — capital works without manual per-trade intervention.

| Component | Module |
|-----------|--------|
| Automated fleet topology | `StrikeAlphaConfig.fleetMode` + `FleetWalletSlot[]` |
| Stability signal | `SYSTEM_STATE_STABLE` |
| Pit-stop rebalance | Coach `evaluateSubstitution()` |

**Log alias:** `RICH_DAD_ASSET_CASHFLOW` → internal `SYSTEM_STATE_STABLE` *(optional)*

### Liability Pruning

Eliminating negative cash-flow positions when funding rates decay edge below `CoachAlphaConfig.minEdgeBps` — Coach benches wallets whose holds no longer generate favorable edge.

| Component | Module |
|-----------|--------|
| Edge decay detect | `FleetWalletMetrics.edgeBps` |
| Substitution bench | `evaluateSubstitution()` → `bench` |
| Funding pit-stop | `StrikeAlphaConfig.pitStopFundingBps` |

---

## Section R: Money & You 課程 (Money & You Financial Systems)

**Philosophy:** Structural integrity over hype — a financial system survives only when every component enforces its covenant.

### System Integrity Guardian

Structural integrity enforced via **`Balance × 1% + $100`** Dynamic Max SL and **`checkSoilResistance()`** depth/slippage gates — the Money & You principle that a system without integrity collapses under stress.

| Component | Module |
|-----------|--------|
| Integrity audit | `TRUTH_GATE_AUDIT` |
| Dynamic SL covenant | `computeEffectiveMaxSlUsd()` |
| Soil structural gate | `checkSoilResistance()` |

**Log alias:** `MONEY_AND_YOU_INTEGRITY` → internal `TRUTH_GATE_AUDIT` *(optional)*

### Synergy Fleet

Multi-wallet collateral synergy and leverage control — Attacker, Hedger, and HL Lend Vault slots combine margin capacity without exceeding fleet aggregate daily loss bounds.

| Component | Module |
|-----------|--------|
| Fleet aggregate | `FleetAggregateMetrics` |
| Leverage control | `evaluateRedCard()` → R17 |
| Collateral synergy | `FleetRole: hl_lend_vault` |

---

## Section S (HIGHLIGHT): 魯班土木工藝 (Lu Ban Construction & Joinery)

> **Priority metaphor:** **Lu Ban craftsmanship** — mortise-and-tenon joinery and the Lu Ban ruler — models Santenboku's structural risk architecture: interlocking components without exposed fasteners, and exact dimensional bounds on every deployment.

### Lu Ban Mortise & Tenon (榫卯無釘架構)

**Pure logical joinery** between `SystemState` and Hyperliquid Session Keys — components lock together through typed interfaces without exposing key vulnerabilities. No nails (hardcoded secrets), no glue (ad-hoc overrides) — only precision-fit structural connections.

| Component | Module |
|-----------|--------|
| SystemState joinery | `SystemState` CRI / DEFCON telemetry |
| Session key slot | Fleet `walletId` opaque binding (never private keys) |
| Structural fit | `rootProtection()` + Coach fleet orchestration |

**Log alias:** `LUBAN_MORTISE_TENON_LOCK` → internal `SYSTEM_STATE_STABLE` *(optional)*

### Lu Ban Ruler (魯班尺風控量測)

**Exact Risk Sizing boundaries** — the Lu Ban ruler measures every deployment against **`Dynamic SL = Account Balance × 1% + $100`**. No guesswork; out-of-bounds capital is structurally rejected before arming.

| Component | Module |
|-----------|--------|
| Ruler math | `computeEffectiveMaxSlUsd()` |
| Bounds check | `rootProtection()` pre-strike audit |
| Breach rejection | `RiskLimitExceeded` |

**Log alias:** `LUBAN_RULER_BOUNDS_CHECK` → internal `DYNAMIC_SL_ENFORCED` *(optional)*

---

## Section T: 職場心理學 (Workplace Psychology: MBTI, DISC, Human Design)

**Philosophy:** Operator psychology mapped to execution temperament — cold logic, compliance discipline, and authority-gated timing.

### MBTI Architect Execution

**INTJ/ISTJ cold-architectural execution** — Truth Gate audit removes emotion from deployment decisions. Every strike must pass equal-exchange arithmetic before Third Eye arming; no FOMO, no revenge trading.

| Component | Module |
|-----------|--------|
| Cold logic audit | `TRUTH_GATE_AUDIT` |
| Equal exchange | `computeEffectiveMaxSlUsd()` + `rootProtection()` |
| No-emotion gate | `evaluateLeftEye()` hard pass/fail |

**Log alias:** `MBTI_INTJ_ARCHITECT_LOGIC` → internal `TRUTH_GATE_AUDIT` *(optional)*

### DISC Compliance

**Strict adherence to the 20 Root defense rules** — when any structural rule breaches, soil resistance trips and execution halts. High-D compliance: follow the system, not impulse.

| Component | Module |
|-----------|--------|
| Root rule enforcement | `checkSoilResistance()` + `checkRoot17DailyLimit()` |
| Trip on breach | `SOIL_RESISTANCE_TRIP` |
| Red Card cascade | `evaluateRedCard()` → R17 / R20 |

**Log alias:** `DISC_COMPLIANCE_EXECUTION` → internal `SOIL_RESISTANCE_TRIP` *(optional)*

### Human Design Authority Gate

**Authority gate** balancing market reflection (Right Eye sensing) and instantaneous striking — the Human Design principle that correct action comes from inner authority aligned with external conditions, not reactive noise.

| Component | Module |
|-----------|--------|
| Market reflection | `evaluateRightEye()` imbalance scan |
| Authority timing | `evaluateStrikeGate()` armed window |
| Radar active | `IMBALANCE_RADAR_ACTIVE` |

**Log alias:** `HUMAN_DESIGN_AUTHORITY_GATE` → internal `IMBALANCE_RADAR_ACTIVE` *(optional)*

---

## Section U: 東方命理與形上學 (Eastern Metaphysics)

**Philosophy:** Five Elements cycles, Zi Wei mutation shields, and Tie Ban numerical precision — ancient structural metaphors for modern fleet risk geometry.

### Five Elements Balance (五行生剋)

**Dynamic equilibrium** between Root Growth (Wood — fleet expansion), Strike (Fire — Third Eye arming), and SL (Metal — Dynamic Max SL bounds). When Wood, Fire, and Metal are in balance, internal state is `SYSTEM_STATE_STABLE`.

| Element | Risk Function | Module |
|---------|---------------|--------|
| Wood (木) | Fleet growth | `FleetWalletSlot[]` co-op |
| Fire (火) | Strike arming | `evaluateStrikeGate()` |
| Metal (金) | SL bounds | `computeEffectiveMaxSlUsd()` |
| Water (水) | Collateral flow | `FleetRole: hl_lend_vault` |
| Earth (土) | Soil foundation | `checkSoilResistance()` |

**Log alias:** `FIVE_ELEMENTS_EQUILIBRIUM` → internal `SYSTEM_STATE_STABLE` *(optional)*

### Zi Wei Mutation Shield (紫微化忌解災)

**Defensive mutation shielding** upon R17/R20 trigger — when daily loss cap or physical deadlock fires, the Zi Wei "化忌" (mutation calamity) shield locks fleet state to prevent cascading damage.

| Component | Module |
|-----------|--------|
| R17 mutation shield | `checkRoot17DailyLimit()` → `R17_LOCKED` |
| R20 mutation shield | `rootProtection({ criHardlock: true })` |
| Shield signal | `R20_LOCKED` |

**Log alias:** `ZIWEI_MUTATION_RISK_SHIELD` → internal `R20_LOCKED` *(optional)*

### Tie Ban Numerical Precision (鐵板神算精準度)

**High-precision orderbook arithmetic** — Tie Ban Shen Suan (iron-plate divine calculation) removes guess logic from fleet health checks. Every ratio, depth, and slippage figure is computed to exact precision before consensus.

| Component | Module |
|-----------|--------|
| Fleet health aggregate | `FleetAggregateMetrics` |
| Precise book math | `OrderbookImbalanceSnapshot` |
| Consensus check | `FLEET_HEALTH_CHECK` |

**Log alias:** `TIEBAN_NUMERICAL_PRECISION` → internal `FLEET_HEALTH_CHECK` *(optional)*

---

## Section V: 上古神話與遠古文明 (Mythology, Cosmology & Lost Civilizations)

**Philosophy:** Lost civilizations and creation myths as structural risk metaphors — sky repair after collapse, energy balance before submersion, immutable record-keeping, and extinction-event survival.

### 女媧補天 (Nuwa Sky Repair)

**Liquidity crash deadlock repair and safety shield** — when the market sky fractures (venue collapse, CRI hardlock), Nuwa's five-color stones seal the breach via R20 physical deadlock. No new risk enters until the structural gap is repaired.

| Component | Module |
|-----------|--------|
| Sky fracture detect | Coach `evaluateMacroRegime()` → CRITICAL |
| Five-color repair | `rootProtection({ criHardlock: true })` |
| Deadlock shield | `R20_LOCKED` |

**Log alias:** `NUWA_FIVE_COLOR_REPAIR` → internal `R20_LOCKED` *(optional)*

### 亞特蘭提斯 (Atlantis Energy Balance)

**Strict `1% + $100` risk boundary** preventing over-leverage collapse — Atlantis fell when its orichalcum energy grid exceeded safe limits. Dynamic Max SL is the orichalcum shield that keeps fleet leverage within survivable bounds.

| Component | Module |
|-----------|--------|
| Orichalcum bounds | `computeEffectiveMaxSlUsd()` |
| Over-leverage trip | `rootProtection()` → `RiskLimitExceeded` |
| Covenant enforced | `DYNAMIC_SL_ENFORCED` |

**Log alias:** `ATLANTIS_ORICHALCUM_SHIELD` → internal `DYNAMIC_SL_ENFORCED` *(optional)*

### 印加帝國 (Inca Quipu & Stone Fit)

**Seamless state machine lock and immutable quipu logging** — Inca stonework fits without mortar; quipu knots record every transaction irreversibly. Truth Gate audit enforces equal exchange with structured, append-only log integrity.

| Component | Module |
|-----------|--------|
| Stone-fit state lock | `evaluateLeftEye()` pass/fail |
| Quipu audit trail | `TRUTH_GATE_AUDIT` structured logs |
| Equal exchange | `rootProtection()` + `computeEffectiveMaxSlUsd()` |

**Log alias:** `INCA_QUIPU_IMMUTABLE_LOG` → internal `TRUTH_GATE_AUDIT` *(optional)*

### 恐龍時代 (Dinosaur Extinction Event)

**Agile small position sizing surviving K-T impact black swans** — when macro regime turns CRITICAL (the asteroid), soil resistance trips block oversized exposure. Small, nimble fleet positions survive what kills lumbering single-wallet giants.

| Component | Module |
|-----------|--------|
| K-T black swan detect | `evaluateMacroRegime()` → CRITICAL |
| Extinction shield | `checkSoilResistance()` → trip |
| Small-size survival | `StrikeAlphaConfig.sensingProbeNotionalUsd` |

**Log alias:** `DINOSAUR_KT_EXTINCTION_SHIELD` → internal `SOIL_RESISTANCE_TRIP` *(optional)*

---

## Section W: 心理學與東方形上學 (Psychology & Eastern Metaphysics)

**Philosophy:** Comparative psychology and Eastern metaphysics as operator-facing annotations on the same Tier 1 guards — cold architectural logic, elemental equilibrium, and mutation shields.

> **Matrix index:** This section is the master comparative index for psychology + metaphysics aliases. Extended coverage: [Section T](#section-t-職場心理學-workplace-psychology-mbti-disc-human-design) (DISC, Human Design) · [Section U](#section-u-東方命理與形上學-eastern-metaphysics) (Tie Ban precision).

### MBTI Architect Logic

**INTJ cold execution** — Truth Gate audit removes emotion from deployment. Every strike passes equal-exchange arithmetic before Third Eye arming.

| Component | Module |
|-----------|--------|
| Cold logic audit | `TRUTH_GATE_AUDIT` |
| Equal exchange | `computeEffectiveMaxSlUsd()` + `rootProtection()` |
| No-emotion gate | `evaluateLeftEye()` hard pass/fail |

**Log alias:** `MBTI_INTJ_ARCHITECT_LOGIC` → internal `TRUTH_GATE_AUDIT` *(optional)*

### Five Elements Balance (五行生剋)

**Dynamic equilibrium** between Root Growth (Wood), Strike (Fire), and SL (Metal) — when elemental forces balance, fleet state is stable.

| Element | Risk Function | Module |
|---------|---------------|--------|
| Wood (木) | Fleet growth | `FleetWalletSlot[]` co-op |
| Fire (火) | Strike arming | `evaluateStrikeGate()` |
| Metal (金) | SL bounds | `computeEffectiveMaxSlUsd()` |

**Log alias:** `FIVE_ELEMENTS_EQUILIBRIUM` → internal `SYSTEM_STATE_STABLE` *(optional)*

### Zi Wei Mutation Shield (紫微化忌解災)

**R20 mutation shielding** — upon R17/R20 trigger, fleet state locks to prevent cascading calamity (化忌).

| Component | Module |
|-----------|--------|
| R17 mutation shield | `checkRoot17DailyLimit()` → `R17_LOCKED` |
| R20 mutation shield | `rootProtection({ criHardlock: true })` |
| Shield signal | `R20_LOCKED` |

**Log alias:** `ZIWEI_MUTATION_RISK_SHIELD` → internal `R20_LOCKED` *(optional)*

---

## Section Y: 巨觀治理與動態物理 (Macro Governance & Physics Dynamics)

**Philosophy:** A strictly minimal sector — six master aliases spanning imperial phase control, absolute bottom-line safety, capital-efficient strikes, orbital execution timing, human-reaction decoupling, and black-swan circuit breaking. Annotation only; Tier 1 guards unchanged.

| Concept | Architecture | Internal State | Log Alias |
|---------|--------------|----------------|-----------|
| **I Ching Phase Control** | Dynamic state control preventing impulsive trades when CRI/DEFCON exceeds safe phase | `SYSTEM_STATE_STABLE` | `ICHING_DYNAMIC_PHASE_CONTROL` |
| **Bottom-Line Safety Lock** | Absolute systemic risk prevention — signing severed on R17/R20 (`rootProtection`, `HardlockError`) | `R20_LOCKED` | `BOTTOMLINE_RISK_PREVENTION` |
| **Capital Efficiency Strike** | Liquidity and orderbook imbalance exploitation via Right Eye radar | `IMBALANCE_RADAR_ACTIVE` | `CAPITAL_EFFICIENCY_STRIKE` |
| **Hohmann Transfer Window** | Fuel-efficient optimal execution timing in liquidity windows (`evaluateRightEye` → `evaluateStrikeGate`) | `IMBALANCE_RADAR_ACTIVE` | `HOHMANN_TRANSFER_WINDOW_EXEC` |
| **Fencing Human Reaction & Microsecond Execution** | 0.2s (200ms) human visual-motor reflex limit vs microsecond MEV/orderbook decay; Session Key automation eliminates human latency; `checkSoilResistance()` guards depth decay | `IMBALANCE_RADAR_ACTIVE` | `FENCING_MICROSECOND_REACTION_STRIKE` |
| **Hawking Singularity Shield** | Circuit breaker halting signatures during black-swan collapse (CRI 0 / venue CRITICAL) | `R20_LOCKED` | `HAWKING_SINGULARITY_LOCK` |

### Fencing Human Reaction & Microsecond Execution (劍擊反應與微秒閃擊)

Recognizing the **0.2s (200ms) human visual-motor reflex limit** versus **microsecond MEV / orderbook decay**. Decoupling manual decision-making into automated Session Key execution to eliminate human latency while protecting against orderbook depth decay via `checkSoilResistance()`.

| Component | Module |
|-----------|--------|
| Human latency bypass | Session Key automated execution |
| Orderbook decay guard | `checkSoilResistance()` |
| Radar strike window | `evaluateRightEye()` → `IMBALANCE_RADAR_ACTIVE` |

**Log alias:** `FENCING_MICROSECOND_REACTION_STRIKE` → internal `IMBALANCE_RADAR_ACTIVE` *(optional)*

---

## Section Z: 賽局理論與量子交易學數學矩陣 (Game Theory & Quantum Finance)

**Philosophy:** Game-theoretic payoff disruption and quantum-finance metaphors for capital sizing, state collapse, and volatility tunneling — annotation only; Tier 1 guards unchanged.

### Nash Equilibrium Countermeasure (納許均衡與 MEV 博弈)

**Disrupting MEV extraction payoff matrices** via chaotic decoy order routing — when bots cannot predict Attacker intent, the Nash equilibrium shifts away from sandwich extraction.

| Component | Module |
|-----------|--------|
| Payoff disruption | `ANTI_MEV_SHIELD` |
| Decoy routing | `AFTERIMAGE_FLEET` + bench wallets |
| MEV threat level | Coach `evaluateMacroRegime()` → `mevThreatLevel` |

**Log alias:** `NASH_EQUILIBRIUM_MEV_COUNTER` → internal `ANTI_MEV_SHIELD` *(optional)*

### Fractional Kelly Capital Sizing (分數凱利公式)

**Mathematically enforcing `Dynamic SL = Balance × 1% + $100`** — fractional Kelly criterion applied to fleet capital: maximize long-term geometric growth while bounding ruin probability.

| Component | Module |
|-----------|--------|
| Kelly bounds | `computeEffectiveMaxSlUsd()` |
| Ruin prevention | `rootProtection()` → `RiskLimitExceeded` |
| Covenant enforced | `DYNAMIC_SL_ENFORCED` |

**Log alias:** `FRACTIONAL_KELLY_CAPITAL_SIZING` → internal `DYNAMIC_SL_ENFORCED` *(optional)*

### Schrödinger Wave State Collapse (薛丁格波函數塌縮)

**Collapse of market probability superposition** into precise `SystemState` execution — before Left Eye validation, the book exists in superposition; upon structural PASS, the wave function collapses to a single stable execution state.

| Component | Module |
|-----------|--------|
| Superposition (pre-check) | Right Eye standby / multiple venue feeds |
| Collapse trigger | `evaluateLeftEye()` → PASS |
| Stable state | `SYSTEM_STATE_STABLE` |

**Log alias:** `SCHRODINGER_WAVE_STATE_COLLAPSE` → internal `SYSTEM_STATE_STABLE` *(optional)*

### Quantum Tunneling Protection (量子穿隧與波動率躍遷)

**Circuit breaking when price/volatility tunnels through structural resistance** — sudden vol spikes bypass normal slippage bounds; soil resistance trips when tunneling violates depth/slippage gates.

| Component | Module |
|-----------|--------|
| Tunnel detect | `checkSoilResistance()` cross-venue slippage |
| Vol regime | Coach `evaluateMacroRegime()` VIX/DVOL |
| Trip shield | `SOIL_RESISTANCE_TRIP` |

**Log alias:** `QUANTUM_TUNNELING_VOLATILITY_TRIP` → internal `SOIL_RESISTANCE_TRIP` *(optional)*

---

## Code Integration

Tactical aliases are resolved by pure functions — **no execution logic changes**:

```typescript
import {
  resolveTacticalAlias,
  formatTacticalLogAnnotation,
  withTacticalLogMetaphors,
  TACTICAL_STATE_ALIASES,
  TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST,
  resolveInternalStateFromAlias,
} from "../services/tactical-log-tags";

const alias = resolveTacticalAlias("SANTENBOKU_STRIKE");
// → "FLURRY_RUSH_STRIKE"

const line = formatTacticalLogAnnotation("R20_LOCKED", "CRI hardlock engaged");
// → "[R20_LOCKED · R20_LOCKED] CRI hardlock engaged"

const mountain = resolveTacticalAlias("R20_LOCKED", "FURINKAZAN_MOUNTAIN");
// → "FURINKAZAN_MOUNTAIN"

const ark = resolveInternalStateFromAlias("ARK_SAFETY_PROTOCOL");
// → "SOIL_RESISTANCE_TRIP"

withTacticalLogMetaphors(
  "DONDUM_HUD_ACTIVE",
  { cri: 72 },
  { TACTICAL_LOG_METAPHORS: "true" },
);
// → details.tacticalAlias === "DONDUM_MARKET_OVERVIEW"

// Universal matrix — all 26 sector optional aliases resolve via reverse lookup
TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST.every(
  (alias) => resolveInternalStateFromAlias(alias) !== undefined,
);
// → true
```

Set `TACTICAL_LOG_METAPHORS=true` in Wrangler vars to attach pop-culture aliases in structured log `details.tacticalAlias` fields. Pass an optional `variant` to select alternates (e.g. `LUBAN_MORTISE_TENON_LOCK` on `SYSTEM_STATE_STABLE`, or `OVERCOOKED_FIRE_EXTINGUISHER` on `R20_LOCKED`). See **Universal Metaphor Comparative Matrix** above for the full sector index.

---

## License

Metaphor documentation is part of the Santenboku v0.8 repository, licensed under **BSL 1.1** (see [`LICENSE`](../LICENSE)).

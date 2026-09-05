# 🔒 [INTERNAL ONLY] OpSec 与架构分支对比报告

| 字段 | 值 |
|------|-----|
| **分类** | 严格保密 / 内部 OpSec Only |
| **文档 ID** | `0905_OPSEC_BRANCH_COMPARISON_REPORT` |
| **审计角色** | Principal Security Auditor & Low-Latency Systems Engineer |
| **日期** | 2026-09-05 |
| **对比分支** | `main` @ `e445865` · `feat/wasm-opsec-kernel-experiment` @ `d306a6d` |

> **禁止对外发布。** 本文档仅供 SilverVine 核心团队内部决策，不得链接至 Grant 提交包或公开 Roadmap。

---

## 1. 执行摘要

| 维度 | `main` | `feat/wasm-opsec-kernel-experiment` |
|------|--------|-------------------------------------|
| **定位** | Grant / 公开提交基线 | 闭源 WASM 内核 R&D 原型 |
| **生产热路径** | 100% TypeScript `risk-engine-core.ts` | **相同** — WASM 为增量，未接入热路径 |
| **Worker Bundle** | 69.32 KiB gzip（`pass: true`） | **不变**（`worker-entry.ts` 未 import） |
| **Vitest** | 192 files / 836 PASS | 193 files / 842 PASS（+1 文件，+6 测试） |
| **抗 Fork 韧性** | **4.5 / 10** | **6.0 / 10** |
| **Grant 可审计性** | **9.5 / 10** | **7.0 / 10**（TS sim 与内核逻辑重复） |
| **分支差异** | — | **+9 文件，+689 LOC**，wasm +533 bytes |

**结论：** 实验分支**尚未**替换 `main` 的执行路径。它新增了一个隔离的、单次 FFI 的 WASM 批量求值器，仅覆盖 **GMX + Pendle + Variational**。`main` 仍是 Grant 评审的 SSOT；实验分支证明了在不破坏提交可复现性的前提下，向闭源商业内核迁移的可行性。

---

## 2. 分支差异 — 文件级审计

### 2.1 Git Diff 摘要（`main..feat/wasm-opsec-kernel-experiment`）

```
 docs/internal/WASM_EXPERIMENT_RESULTS.md           | +122
 pkg/soil_core.wasm                                 | 819 → 1352 bytes (+65%)
 scripts/benchmark-protocol-flags-kernel.ts         | +98
 src/sdk/protocol-flags-wasm.ts                     | +93
 src/services/wasm-feasibility-lib/protocol-flags-kernel.ts | +142
 src/wasm/Cargo.toml                                | license Apache-2.0 → BUSL-1.1
 src/wasm/protocol_flags.rs                         | +111 (new)
 src/wasm/soil_core.rs                              | +mod protocol_flags
 tests/wasm/protocol-flags-kernel.test.ts           | +118
```

**两分支完全相同的关键路径文件：**

| 路径 | 职责 | 说明 |
|------|------|------|
| `src/core/risk-engine-core.ts` | Bitmask SSOT（201 LOC） | 所有 `evaluate*Flags` 在两分支均为**明文 TS** |
| `src/core/risk-flags.ts` | 14-bit 协议掩码 + `FLAGS_AUTO_SEVER_MASK` | 一致 |
| `src/core/risk-engine-limits.ts` | 数值阈值 | 一致 |
| `src/core/risk-severance.ts` | R20 `applyAutoSeveranceOnFlags` | 一致 |
| `src/core/pending-exposure-window.ts` | 30s GMX skew 累加器 | 一致 |
| `src/adapters/variational-rfq-adapter.ts` | 委托 `evaluateVariationalFlags` | 一致 |
| `src/services/risk-control-lib/soil-resistance.ts` | 完整 soil 熔断（含 I/O 门控） | 一致 |
| `src/worker-entry.ts` | Cloudflare Worker 入口 | **两分支均未 import 协议 WASM** |
| `contracts/stylus-probe/` | V2.0 Stylus  parity 探针 | 一致（非生产路径） |

### 2.2 仅实验分支新增的文件

| 文件 | LOC | 功能 |
|------|-----|------|
| `src/wasm/protocol_flags.rs` | 111 | 闭源 Rust：`protocol_batch_eval`、`FLAGS_AUTO_SEVER_MASK` |
| `src/services/wasm-feasibility-lib/protocol-flags-kernel.ts` | 142 | 扁平 f64 布局、TS sim parity、`runProtocolBatchSim` |
| `src/sdk/protocol-flags-wasm.ts` | 93 | **单次 FFI** 封装 `evaluateProtocolBatch` |
| `tests/wasm/protocol-flags-kernel.test.ts` | 118 | Wasm ↔ TS ↔ `risk-engine-core` 一致性 |
| `scripts/benchmark-protocol-flags-kernel.ts` | 98 | 延迟对比 harness |
| `docs/internal/WASM_EXPERIMENT_RESULTS.md` | 122 | 实验遥测日志 |

### 2.3 WASM / Rust 表面对比

| 组件 | `main` | `feat/wasm-opsec-kernel-experiment` |
|------|--------|-------------------------------------|
| `src/wasm/soil_core.rs` | 仅 soil + session clip | 增加 `mod protocol_flags` |
| `pkg/soil_core.wasm` | **819 B** | **1,352 B**（+533 B） |
| C-ABI 导出 | `soil_core_eval`、`session_core_ok`、`soil_core_abi_version` | **+** `protocol_batch_eval`、`protocol_kernel_abi_version` |
| `src/wasm/Cargo.toml` `license` | `Apache-2.0` ⚠️ | `BUSL-1.1` ✅ |
| `contracts/stylus-probe/src/stylus_core.rs` | Parity 探针（明文 Rust） | 相同 |

---

## 3. 协议不变量边界矩阵

### 3.1 逻辑落点（具体）

| 协议 | 不变量（阈值） | `main` | 实验分支 |
|------|----------------|--------|----------|
| **GMX v2** | OI 失衡 > **0.35**，抵押率 < **1.05** | `risk-engine-core.ts` → `evaluateGmxFlags` | **WASM** `eval_gmx_raw` + **TS** `evaluateGmxFlags` |
| **GMX v2** | 30s pending skew 拆单防御 | `pending-exposure-window.ts`（仅 TS） | **仅 TS** — 未进 WASM batch |
| **Pendle** | 收益率冲击 > **150 bps** | `evaluatePendleFlags`（TS） | **WASM** + **TS** |
| **Variational RFQ** | 报价过期 > **500ms** / 偏离 > **30 bps** | `evaluateVariationalFlags`（TS） | **WASM** + **TS** |
| **Variational RFQ** | OLP 深度 > **15%**（long-tail） | `evaluateVariationalFlags`（TS） | **WASM** + **TS** |
| **Camelot V3** | 滑点 > **50 bps** | `evaluateCamelotFlags`（TS） | 仅 TS |
| **Radiant** | HF < **1.15** | `evaluateRadiantFlags`（TS） | 仅 TS |
| **Jones DAO** | NAV 偏离 > **30 bps** | `evaluateJonesFlags`（TS） | 仅 TS |
| **Hyperliquid** | Session / size / spread / RPM | `evaluateHlSessionFlags`（TS） | 仅 TS |
| **Stabilizer** | 脱锚 > **50 bps** | `evaluateDepegFlags`（TS） | 仅 TS |
| **Soil 熔断** | 跨 venue 滑点、深度、sequencer | `soil-resistance.ts`（TS）+ `soil_core_eval`（WASM 窄子集） | 相同 |
| **R17 / R20** | Max SL、日损、sever | `root-protection.ts`、`risk-severance.ts`（TS） | 两分支均仅 TS |
| **Honeypot RPC** | `HONEYPOT_RPC_HOSTS` | `rpc-allowlist-hosts.ts`（TS） | 两分支均仅 TS |

### 3.2 明文 vs 闭源字节码

```
main（Grant 基线）
├── 100% 协议数学在 risk-engine-core.ts 可读
├── soil_core.wasm：仅 soil 滑点/深度（819 B）
└── src/sdk/soil-wasm.ts 头：Apache-2.0（LICENSE 中 SDK 例外）

feat/wasm-opsec-kernel-experiment
├── 相同明文 risk-engine-core.ts（热路径未改）
├── soil_core.wasm：soil + protocol_batch_eval（1352 B）
│   └── GMX / Pendle / Variational 阈值编译进 .wasm
├── protocol-flags-kernel.ts：可读 TS sim（parity / fallback）
└── 生产 Worker：仍未调用 evaluateProtocolBatch
```

**实验分支关键 OpSec 缺口：** `protocol-flags-kernel.ts` 用可读 TypeScript 重复了内核逻辑。竞品可 fork **`risk-engine-core.ts`** 或 **TS sim** — 在从生产构建剥离 TS sim、并将 parity 测试移至 CI-only 产物之前，单靠 WASM 无法形成护城河。

---

## 4. 基准测试与延迟遥测审计

### 4.1 实测指标（实验分支，500 次迭代，p50）

来源：`scripts/benchmark-protocol-flags-kernel.ts` · 详见 [`WASM_EXPERIMENT_RESULTS.md`](./WASM_EXPERIMENT_RESULTS.md)

| 执行路径 | 分支 | p50 延迟 | FFI 次数 | 说明 |
|----------|------|----------|----------|------|
| TS 传统拆分（`evaluateGmxFlags` + `evaluatePendleFlags` + `evaluateVariationalFlags`） | **main**（实验 fallback 同） | **1.05 µs** | 0 | 三次进程内调用，各带 `applyAutoSeveranceOnFlags` |
| TS batch sim（`runProtocolBatchSim`） | 仅实验分支 | **0.44 µs** | 0 | 单次 TS 函数，bench 无 sever 副作用 |
| WASM 单次 FFI（`protocol_batch_eval`） | 仅实验分支 | **1.84 µs** | **1** | `evaluateProtocolBatch` → 一次 `protocol_batch_eval` |

### 4.2 FFI 预算合规

| 预算 | 值 | WASM p50 | 余量 |
|------|-----|----------|------|
| Santenmoku Edge 目标 | **< 0.014 ms（14 µs）** | **1.84 µs** | **7.6×** |
| `PROTOCOL_FFI_BUDGET_US` 常量 | 14 µs | `protocol-flags-kernel.test.ts` 热路径测试强制 | ✅ PASS |

### 4.3 内存序列化剖面（单次 FFI）

`evaluateProtocolBatch`（`protocol-flags-wasm.ts`）：

| 步骤 | 操作 | 逐字段开销 |
|------|------|------------|
| 1 | `encodeProtocolBatchInput` → `Float64Array(13)` | 连续 104 字节缓冲区 |
| 2 | 拷贝 13×f64 至 Wasm 线性内存 @ offset 128 | **单次 memcpy 循环**（非逐协议 FFI） |
| 3 | `protocol_batch_eval(in_ptr, out_ptr)` | **1 次 FFI** |
| 4 | `decodeProtocolBatchOutput` @ offset 232 | 读取 4×f64 |

**判定：** 零逐字段 FFI 往返。序列化为**扁平 buffer 进 / 扁平 buffer 出** — 符合 <0.014 ms FFI 设计约束。

### 4.4 `main` 分支延迟剖面（生产）

| 层级 | 典型 p50 | 位置 |
|------|----------|------|
| `checkSoilResistance()` 快路径 | ~106 µs（文档 SSOT） | `risk-engine-soil.ts` |
| `evaluateGmxFlags`（微基准） | 亚微秒级/次 | 进程内 TS |
| Worker bundle 热路径 | **两分支均无** `protocol_batch_eval` | `worker-entry.ts` |

**说明：** WASM 协议 batch **尚未**进入任一分支的 Worker 关键路径。延迟对比为 R&D 遥测，非生产 A/B。

---

## 5. 许可与抗 Fork 防御矩阵

### 5.1 许可审计（Rust / WASM / SDK）

| 文件 | `main` | `feat/wasm-opsec-kernel-experiment` | 风险 |
|------|--------|-------------------------------------|------|
| `LICENSE`（仓库根） | BUSL-1.1 | 相同 | 法律主干 |
| `src/wasm/soil_core.rs` | BUSL-1.1 头 | 相同 | ✅ |
| `src/wasm/Cargo.toml` | **Apache-2.0** ⚠️ | **BUSL-1.1** ✅ | `main` 元数据不一致 |
| `src/wasm/protocol_flags.rs` | — | BUSL（crate 隐式） | ✅ |
| `src/sdk/soil-wasm.ts` | **Apache-2.0** 头 | 相同 | LICENSE 设计的 SDK 例外 |
| `src/sdk/protocol-flags-wasm.ts` | — | **BUSL-1.1** 头 | ✅ |
| `contracts/stylus-probe/` | BUSL-1.1 | 相同 | Roadmap 探针 |

### 5.2 抗 Fork 韧性评分

| 分支 | 分数 | 技术依据 |
|------|------|----------|
| **`main`** | **4.5 / 10** | 完整 `risk-engine-core.ts`（201 LOC）+ `risk-engine-limits.ts` + adapters 均为明文。BUSL 阻法律 fork，不阻技术复制。836 项 Vitest 即可执行规格。`soil_core.wasm`（819 B）仅隐藏 soil 数学子集。 |
| **`feat/wasm-opsec-kernel-experiment`** | **6.0 / 10** | GMX/Pendle/Variational 阈值编译进 `protocol_batch_eval`（+533 B wasm）。**但：** `protocol-flags-kernel.ts` 以 TS 暴露相同逻辑；`risk-engine-core.ts` 未变。竞品忽略 WASM、只抄 TS sim，工期可从 ~2 周降至 ~3–5 天。 |
| **目标生产 SaaS**（实验 + 剥离 TS sim） | **7.5 / 10**（预估） | 仅分发 `.wasm`；CI parity 离线；从 Worker bundle 移除 `runProtocolBatchSim`；内核扩展至 7 协议。 |

### 5.3 竞品剥离 / 去品牌工时估算

| 攻击向量 | `main` | 实验（当前） | 实验（加固后） |
|----------|--------|--------------|--------------|
| 删除 BUSL 头、换品牌 | 1–2 天 | 1–2 天 | 1–2 天 |
| 复制 `risk-engine-core.ts` | **极容易**（git clone） | **极容易**（未改） | 生产移除后 N/A |
| 复制 `protocol-flags-kernel.ts` | N/A | **极容易** | 从生产构建移除 |
| 逆向 `soil_core.wasm` | 难（819 B） | 更难（1352 B，更多符号） | 主要屏障 |
| 复现 836+ 测试 | 1–2 周 | 1–2 周 | 1–2 周 |
| 绕过 honeypot（`rpc.silvervine-clone.trap`） | grep + 删除 | 相同 | 相同 |

---

## 6. 战略路线图与维护指数

### 6.1 维护开销对比

| 活动 | `main` | `feat/wasm-opsec-kernel-experiment` |
|------|--------|-------------------------------------|
| **调试协议 trip** | TS 堆栈跟踪 | TS 路径不变；WASM 需 `runProtocolBatchSim` 或 wasm 日志 |
| **阈值调参（如 30→25 bps）** | 改 `risk-engine-limits.ts` | 改 **3 处**：limits.ts、`protocol_flags.rs`、`protocol-flags-kernel.ts`（直至 PolicyManifest） |
| **CI 流水线** | `pnpm test` + `build:wasm`（soil） | **+** `protocol-flags-kernel.test.ts` + parity |
| **Grant 评审可复现性** | 优秀（全 TS） | 保留 TS sim 则良好；双路径漂移则混乱 |
| **Bundle 监控** | 69.32 KiB gzip | 相同（WASM 未进 Worker） |
| **Stylus parity 漂移** | `stylus_core.rs` vs TS limits | 额外漂移源：`protocol_flags.rs` |

### 6.2 CI Parity 门禁（实验 → 生产）

| 门禁 | 命令 | 通过标准 |
|------|------|----------|
| 全量回归 | `npx vitest run` | 100% PASS |
| 类型检查 | `pnpm exec tsc --noEmit` | 0 errors |
| Bundle | `pnpm bundle:measure` | gzip < 70 KiB，`pass: true` |
| Wasm 构建 | `pnpm build:wasm` | 导出 `protocol_batch_eval` |
| 协议 parity | `tests/wasm/protocol-flags-kernel.test.ts` | Wasm == TS sim == `risk-engine-core` |
| FFI 预算 | 热路径测试 | p50 < 14 µs |

### 6.3 一键迁移策略（Grant `main` → 生产 SaaS）

**阶段 0 — 合并前（当前）**

```bash
git checkout main                              # Grant 提交冻结
git checkout feat/wasm-opsec-kernel-experiment  # R&D 继续
```

**阶段 1 — 合并实验（单次 PR，特性开关）**

```bash
git checkout main
git merge --no-ff feat/wasm-opsec-kernel-experiment
# 新增 env：USE_WASM_PROTOCOL_KERNEL=1（Grant demo 默认 off）
```

**阶段 2 — 接入热路径（约 1 个文件）**

- 在 `evaluateGatewayRules` 或 adapter batch 入口：若 `USE_WASM_PROTOCOL_KERNEL`，对 GMX/Pendle/Variational 调用 `evaluateProtocolBatch`，替代拆分 `evaluate*Flags`。
- 开关 off 时保留 TS 路径 → Grant demo 不变。

**阶段 3 — 生产加固**

1. CI 执行 `pnpm build:wasm` → Worker 内嵌 `pkg/soil_core.wasm`
2. 通过 tree-shaking / 独立 entry 从生产 bundle 剥离 `runProtocolBatchSim`
3. 扩展 `protocol_flags.rs`：Camelot、Radiant、Jones、HL
4. GMX pending skew 累加器作为 f64 输入 [13..15]
5. 引入 `RiskPolicyManifest` KV（见 OpSec 审计），消除三处阈值重复编辑

**阶段 4 — SaaS 上线清单**

```bash
pnpm build:wasm && pnpm bundle:measure   # 确认 < 70 KiB
USE_WASM_PROTOCOL_KERNEL=1 pnpm test
pnpm demo:matrix -- --loop=perp --hedge=variational
git tag v1.0-saas-wasm-kernel
```

**回滚：** 设 `USE_WASM_PROTOCOL_KERNEL=0` — 即时回到 Grant 基线 TS 路径，零 schema 迁移。

---

## 7. 建议优先级

| 优先级 | 行动 | 分支 |
|--------|------|------|
| P0 | **`main` 保持冻结**，作 Buildathon / Grant SSOT | `main` |
| P0 | 在 `main` 修复 `src/wasm/Cargo.toml` 许可（Apache → BUSL） | 从实验分支 cherry-pick |
| P1 | 在存在 `USE_WASM_PROTOCOL_KERNEL` 开关前**勿合并**实验分支 | experiment |
| P1 | 推广 WASM 时从生产 bundle **移除 TS sim** | post-merge |
| P2 | SaaS 营销「闭源内核」前，WASM 须覆盖 **全部 7 协议** | experiment |
| P2 | 引入 `RiskPolicyManifest`，阈值与重编译解耦 | both |

---

## 8. 结论对照

| 问题 | 答案 |
|------|------|
| `main` 是否适合 Grant 提交？ | **是** — 全 TS 可审计，836 测试，69.32 KiB bundle |
| 实验分支是否已替换 `main`？ | **否** — 增量 R&D，热路径相同 |
| WASM 是否比 TS 更快？ | **否**（Node p50：1.84 vs 0.44 µs batch sim）— 价值在 **OpSec + 单次 FFI 边界** |
| 是否满足 FFI 预算？ | **是** — 1.84 µs ≪ 14 µs |
| 生产 SaaS 用哪条分支？ | 完成阶段 1–3 并剥离 TS sim 后的 **`feat/wasm-opsec-kernel-experiment`** |

---

*SilverVine Labs · 内部 OpSec · 禁止对外分发*

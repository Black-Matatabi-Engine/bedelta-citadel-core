//! Closed protocol bitmask batch kernel — GMX · Pendle · Variational (BUSL-1.1).
//! Single C-ABI entry: `protocol_batch_eval` — one FFI per intent.

const FLAGS_SEVERED: u32 = 1;
const FLAGS_IMBALANCE_TRIP: u32 = 1 << 1;
const FLAGS_COLLATERAL_TRIP: u32 = 1 << 2;
const FLAGS_YIELD_SHOCK: u32 = 1 << 3;
const FLAG_VARIATIONAL_STALE_QUOTE: u32 = 1 << 12;
const FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED: u32 = 1 << 13;

const GMX_IMBALANCE_MAX: f64 = 0.35;
const GMX_COLLATERAL_MIN: f64 = 1.05;
const PENDLE_YIELD_SHOCK_MAX_BPS: f64 = 150.0;
const VARIATIONAL_QUOTE_MAX_AGE_MS: f64 = 500.0;
const VARIATIONAL_PRICE_DEVIATION_MAX_BPS: f64 = 30.0;
const VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION: f64 = 0.15;

const FLAGS_AUTO_SEVER_MASK: u32 =
    FLAGS_IMBALANCE_TRIP
    | FLAGS_COLLATERAL_TRIP
    | FLAGS_YIELD_SHOCK
    | FLAG_VARIATIONAL_STALE_QUOTE
    | FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED;

#[inline]
fn abs_f64(x: f64) -> f64 {
    if x < 0.0 { -x } else { x }
}

fn eval_gmx_raw(oi_l: f64, oi_s: f64, tvl: f64, coll: f64) -> u32 {
    let mut f: u32 = 0;
    if tvl > 0.0 && abs_f64(oi_l - oi_s) / tvl > GMX_IMBALANCE_MAX {
        f |= FLAGS_IMBALANCE_TRIP;
    }
    if coll != 0.0 && (!coll.is_finite() || coll < GMX_COLLATERAL_MIN) {
        f |= FLAGS_COLLATERAL_TRIP;
    }
    f
}

fn eval_pendle_raw(yield_current: f64, yield_oracle: f64) -> u32 {
    if abs_f64(yield_current - yield_oracle) * 10_000.0 > PENDLE_YIELD_SHOCK_MAX_BPS {
        FLAGS_YIELD_SHOCK
    } else {
        0
    }
}

fn eval_variational_raw(
    quote_price: f64,
    oracle_mark: f64,
    quote_ts_ms: f64,
    now_ms: f64,
    trade_size: f64,
    olp_depth: f64,
    long_tail: f64,
) -> u32 {
    let mut f: u32 = 0;
    let age_ms = now_ms - quote_ts_ms;
    if age_ms > VARIATIONAL_QUOTE_MAX_AGE_MS {
        f |= FLAG_VARIATIONAL_STALE_QUOTE;
    } else if oracle_mark > 0.0 {
        let dev_bps = abs_f64(quote_price - oracle_mark) / oracle_mark * 10_000.0;
        if dev_bps > VARIATIONAL_PRICE_DEVIATION_MAX_BPS {
            f |= FLAG_VARIATIONAL_STALE_QUOTE;
        }
    }
    if long_tail > 0.5 && olp_depth > 0.0 && trade_size / olp_depth > VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION {
        f |= FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED;
    }
    f
}

#[inline]
fn apply_auto_sever_mask(f: u32) -> u32 {
    if f != 0 && (f & FLAGS_AUTO_SEVER_MASK) != 0 {
        f | FLAGS_SEVERED
    } else {
        f
    }
}

/// Batch protocol flag eval — 13×f64 in, 4×f64 out, returns combined u32 flags.
/// in:  [gmx_oiL, gmx_oiS, gmx_tvl, gmx_coll, pendle_yield, pendle_oracle,
///       var_quote, var_mark, var_quote_ts, var_now, var_size, var_depth, var_long_tail]
/// out: [combined_flags, gmx_flags, pendle_flags, variational_flags]
#[no_mangle]
pub unsafe extern "C" fn protocol_batch_eval(in_ptr: *const f64, out_ptr: *mut f64) -> u32 {
    let gmx_f = eval_gmx_raw(*in_ptr.add(0), *in_ptr.add(1), *in_ptr.add(2), *in_ptr.add(3));
    let pendle_f = eval_pendle_raw(*in_ptr.add(4), *in_ptr.add(5));
    let var_f = eval_variational_raw(
        *in_ptr.add(6),
        *in_ptr.add(7),
        *in_ptr.add(8),
        *in_ptr.add(9),
        *in_ptr.add(10),
        *in_ptr.add(11),
        *in_ptr.add(12),
    );
    let combined = apply_auto_sever_mask(gmx_f | pendle_f | var_f);
    *out_ptr.add(0) = combined as f64;
    *out_ptr.add(1) = gmx_f as f64;
    *out_ptr.add(2) = pendle_f as f64;
    *out_ptr.add(3) = var_f as f64;
    combined
}

#[no_mangle]
pub extern "C" fn protocol_kernel_abi_version() -> u32 {
    1
}

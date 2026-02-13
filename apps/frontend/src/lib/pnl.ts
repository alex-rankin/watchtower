export type Direction = "long" | "short";
export type SizeMode = "units" | "notional";

export interface PnlInput {
  direction: Direction;
  sizeMode: SizeMode;
  units?: number;
  notional?: number;
  entry: number;
  stop: number;
  takeProfit: number;
  feeFlat?: number;
  feePercent?: number;
}

export interface PnlSummary {
  effectiveUnits: number;
  notionalUsd: number;
  riskPerUnit: number;
  rewardPerUnit: number;
  grossStopPnl: number;
  grossTakeProfitPnl: number;
  feesTotal: number;
  netStopPnl: number;
  netTakeProfitPnl: number;
  riskUsd: number;
  rewardUsd: number;
  rrMultiple: number | null;
  breakEvenPrice: number;
}

export function getEffectiveUnits({
  sizeMode,
  units,
  notional,
  entry,
}: Pick<PnlInput, "sizeMode" | "units" | "notional" | "entry">) {
  if (sizeMode === "notional") {
    return notional && entry ? notional / entry : 0;
  }
  return units ?? 0;
}

export function getNotionalUsd({
  sizeMode,
  units,
  notional,
  entry,
}: Pick<PnlInput, "sizeMode" | "units" | "notional" | "entry">) {
  if (sizeMode === "notional") {
    return notional ?? 0;
  }
  return (units ?? 0) * entry;
}

export function getFeeTotal(notionalUsd: number, feeFlat = 0, feePercent = 0) {
  const percentDecimal = feePercent / 100;
  return feeFlat + notionalUsd * percentDecimal;
}

export function getGrossPnl({
  direction,
  entry,
  price,
  units,
}: {
  direction: Direction;
  entry: number;
  price: number;
  units: number;
}) {
  const diff = direction === "long" ? price - entry : entry - price;
  return diff * units;
}

export function getBreakEvenPrice({
  direction,
  entry,
  feesTotal,
  units,
}: {
  direction: Direction;
  entry: number;
  feesTotal: number;
  units: number;
}) {
  if (!feesTotal || units === 0) {
    return entry;
  }
  const feePerUnit = feesTotal / units;
  return direction === "long" ? entry + feePerUnit : entry - feePerUnit;
}

export function calculatePnl(input: PnlInput): PnlSummary {
  const effectiveUnits = getEffectiveUnits(input);
  const notionalUsd = getNotionalUsd(input);
  const riskPerUnit = Math.abs(input.entry - input.stop);
  const rewardPerUnit = Math.abs(input.takeProfit - input.entry);
  const grossStopPnl = getGrossPnl({
    direction: input.direction,
    entry: input.entry,
    price: input.stop,
    units: effectiveUnits,
  });
  const grossTakeProfitPnl = getGrossPnl({
    direction: input.direction,
    entry: input.entry,
    price: input.takeProfit,
    units: effectiveUnits,
  });
  const feesTotal = getFeeTotal(
    notionalUsd,
    input.feeFlat ?? 0,
    input.feePercent ?? 0,
  );
  const netStopPnl = grossStopPnl - feesTotal;
  const netTakeProfitPnl = grossTakeProfitPnl - feesTotal;
  const riskUsd = Math.abs(netStopPnl);
  const rewardUsd = Math.abs(netTakeProfitPnl);
  const rrMultiple = riskUsd > 0 ? rewardUsd / riskUsd : null;
  const breakEvenPrice = getBreakEvenPrice({
    direction: input.direction,
    entry: input.entry,
    feesTotal,
    units: effectiveUnits,
  });

  return {
    effectiveUnits,
    notionalUsd,
    riskPerUnit,
    rewardPerUnit,
    grossStopPnl,
    grossTakeProfitPnl,
    feesTotal,
    netStopPnl,
    netTakeProfitPnl,
    riskUsd,
    rewardUsd,
    rrMultiple,
    breakEvenPrice,
  };
}

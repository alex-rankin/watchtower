import { describe, expect, it } from "vitest";

import { calculatePnl } from "./pnl";

describe("calculatePnl", () => {
  it("handles long positions in units mode", () => {
    const summary = calculatePnl({
      direction: "long",
      sizeMode: "units",
      units: 10,
      entry: 100,
      stop: 95,
      takeProfit: 120,
    });

    expect(summary.effectiveUnits).toBe(10);
    expect(summary.grossStopPnl).toBeCloseTo(-50);
    expect(summary.grossTakeProfitPnl).toBeCloseTo(200);
    expect(summary.riskUsd).toBeCloseTo(50);
    expect(summary.rewardUsd).toBeCloseTo(200);
    expect(summary.rrMultiple).toBeCloseTo(4);
    expect(summary.breakEvenPrice).toBeCloseTo(100);
  });

  it("handles short positions in units mode", () => {
    const summary = calculatePnl({
      direction: "short",
      sizeMode: "units",
      units: 5,
      entry: 200,
      stop: 220,
      takeProfit: 170,
    });

    expect(summary.grossStopPnl).toBeCloseTo(-100);
    expect(summary.grossTakeProfitPnl).toBeCloseTo(150);
    expect(summary.riskUsd).toBeCloseTo(100);
    expect(summary.rewardUsd).toBeCloseTo(150);
  });

  it("converts notional to effective units", () => {
    const summary = calculatePnl({
      direction: "long",
      sizeMode: "notional",
      notional: 10000,
      entry: 100,
      stop: 90,
      takeProfit: 120,
    });

    expect(summary.effectiveUnits).toBeCloseTo(100);
    expect(summary.grossStopPnl).toBeCloseTo(-1000);
    expect(summary.grossTakeProfitPnl).toBeCloseTo(2000);
  });

  it("applies fees to break-even and net P&L", () => {
    const summary = calculatePnl({
      direction: "long",
      sizeMode: "units",
      units: 100,
      entry: 100,
      stop: 95,
      takeProfit: 110,
      feeFlat: 10,
      feePercent: 0.1,
    });

    expect(summary.feesTotal).toBeCloseTo(20);
    expect(summary.netTakeProfitPnl).toBeCloseTo(980);
    expect(summary.breakEvenPrice).toBeCloseTo(100.2);
  });
});

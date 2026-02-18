import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, Info, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  formatMoney,
  formatNumber,
  formatPrice,
  formatRatio,
} from "../lib/format";
import { type FxRate, fetchUsdToNzdRate } from "../lib/fx";
import { calculatePnl, type Direction, type SizeMode } from "../lib/pnl";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const STORAGE_KEY = "pnl.preferences.v1";
const FX_STORAGE_KEY = "pnl.fx.usd-nzd.v1";

type Currency = "USD" | "NZD";
const AUTO_SIZE_EPSILON = 1e-8;

const formSchema = z
  .object({
    direction: z.enum(["long", "short"]),
    sizeMode: z.enum(["units", "notional"]),
    units: z.number().positive().optional(),
    notional: z.number().positive().optional(),
    entry: z.number().positive({ message: "Entry must be greater than 0." }),
    stop: z.number().positive({ message: "Stop must be greater than 0." }),
    takeProfit: z
      .number()
      .positive({ message: "Take profit must be greater than 0." }),
    feeFlat: z.number().min(0).optional(),
    feePercent: z.number().min(0).optional(),
    accountBalance: z.number().positive().optional(),
    riskPercent: z.number().min(0).max(100).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.sizeMode === "units" && !values.units) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Units are required in units mode.",
        path: ["units"],
      });
    }
    if (values.sizeMode === "notional" && !values.notional) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Notional is required in notional mode.",
        path: ["notional"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const parseNumber = (value: string) => {
  if (value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const readStoredPreferences = (): Partial<FormValues> & {
  currency?: Currency;
} => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as Partial<FormValues> & { currency?: Currency })
      : {};
  } catch {
    return {};
  }
};

const readStoredFx = (): FxRate | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(FX_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FxRate) : null;
  } catch {
    return null;
  }
};

const Field = ({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <Label className="text-sm">{label}</Label>
    {children}
    {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const ResultItem = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span
      className={accent ? "text-base font-semibold text-foreground" : "text-sm"}
    >
      {value}
    </span>
  </div>
);

export function PnlCalculator() {
  const stored = readStoredPreferences();
  const [currency, setCurrency] = useState<Currency>(stored.currency ?? "USD");
  const [cachedFx, setCachedFx] = useState<FxRate | null>(() => readStoredFx());
  const [feesPanelOpen, setFeesPanelOpen] = useState(false);
  const initialSizeMode: SizeMode =
    stored.sizeMode === "units" ? "notional" : (stored.sizeMode ?? "notional");

  const form = useForm<FormValues>({
    // Zod v4: @hookform/resolvers typings target Zod 3; runtime works with Zod 4
    resolver: zodResolver(
      formSchema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: {
      direction: stored.direction ?? "long",
      sizeMode: initialSizeMode,
      units: stored.units ?? 100,
      notional: stored.notional ?? 10000,
      entry: stored.entry ?? 100,
      stop: stored.stop ?? 95,
      takeProfit: stored.takeProfit ?? 112,
      feeFlat: stored.feeFlat ?? 0,
      feePercent: stored.feePercent ?? 0,
      accountBalance: stored.accountBalance ?? 10000,
      riskPercent: stored.riskPercent ?? 1,
    },
  });

  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...watched,
        currency,
      }),
    );
  }, [watched, currency]);

  const fxQuery = useQuery({
    queryKey: ["fx", "usd-nzd"],
    queryFn: fetchUsdToNzdRate,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!fxQuery.data || typeof window === "undefined") {
      return;
    }
    setCachedFx(fxQuery.data);
    window.localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(fxQuery.data));
  }, [fxQuery.data]);

  const fxData = fxQuery.data ?? cachedFx;
  const isUsingCachedRate = fxQuery.isError && !!cachedFx;
  const hasLiveRate = currency === "USD" || !!fxData;

  const warnings = useMemo(() => {
    const list: string[] = [];
    if (!watched.entry || !watched.stop || !watched.takeProfit) {
      return list;
    }
    if (watched.direction === "long") {
      if (watched.stop >= watched.entry) {
        list.push("Stop should be below entry for a long trade.");
      }
      if (watched.takeProfit <= watched.entry) {
        list.push("Take profit should be above entry for a long trade.");
      }
    }
    if (watched.direction === "short") {
      if (watched.stop <= watched.entry) {
        list.push("Stop should be above entry for a short trade.");
      }
      if (watched.takeProfit >= watched.entry) {
        list.push("Take profit should be below entry for a short trade.");
      }
    }
    return list;
  }, [watched.direction, watched.entry, watched.stop, watched.takeProfit]);

  const summary = useMemo(() => {
    const entry = watched.entry;
    const stop = watched.stop;
    const takeProfit = watched.takeProfit;
    if (
      entry == null ||
      stop == null ||
      takeProfit == null ||
      (watched.sizeMode === "units" ? !watched.units : !watched.notional)
    ) {
      return null;
    }
    return calculatePnl({
      direction: watched.direction as Direction,
      sizeMode: watched.sizeMode as SizeMode,
      units: watched.units,
      notional: watched.notional,
      entry,
      stop,
      takeProfit,
      feeFlat: watched.feeFlat ?? 0,
      feePercent: watched.feePercent ?? 0,
    });
  }, [watched]);

  const riskPresetValue = [0.5, 1, 2, 3].includes(
    watched.riskPercent ?? Number.NaN,
  )
    ? String(watched.riskPercent)
    : undefined;

  const fxRate = currency === "USD" ? 1 : fxData?.rate;
  const asOfLabel = fxData?.asOf
    ? new Date(fxData.asOf).toLocaleString()
    : "Unavailable";

  const displayMoney = (value: number) => {
    if (!fxRate) {
      return "—";
    }
    return formatMoney(value * fxRate, currency);
  };

  const displayPrice = (value: number) => {
    if (!fxRate) {
      return "—";
    }
    return formatPrice(value * fxRate, currency);
  };

  const riskSizingGuide = useMemo(() => {
    if (!summary?.riskPerUnit) {
      return null;
    }
    if (
      watched.accountBalance === undefined ||
      watched.riskPercent === undefined ||
      watched.entry == null
    ) {
      return null;
    }
    if (watched.accountBalance <= 0 || watched.riskPercent <= 0) {
      return null;
    }

    const targetRiskUsd = (watched.accountBalance * watched.riskPercent) / 100;
    const feeFlat = Math.max(watched.feeFlat ?? 0, 0);
    const feePercent = Math.max(watched.feePercent ?? 0, 0);
    const feePercentDecimal = feePercent / 100;
    const stopDistanceUsd = summary.riskPerUnit;
    const riskPerUnitWithFees =
      stopDistanceUsd + watched.entry * feePercentDecimal;

    if (riskPerUnitWithFees <= 0) {
      return null;
    }

    const budgetAfterFlatFees = targetRiskUsd - feeFlat;
    if (budgetAfterFlatFees <= 0) {
      return {
        targetRiskUsd,
        stopDistanceUsd,
        feeFlat,
        feePercent,
        suggestedUnits: null,
        suggestedNotional: null,
        projectedRiskUsd: null,
      };
    }

    const suggestedUnits = budgetAfterFlatFees / riskPerUnitWithFees;
    if (!Number.isFinite(suggestedUnits) || suggestedUnits <= 0) {
      return null;
    }

    const suggestedNotional = suggestedUnits * watched.entry;
    const projectedRiskUsd =
      suggestedUnits * stopDistanceUsd +
      feeFlat +
      suggestedNotional * feePercentDecimal;

    return {
      targetRiskUsd,
      stopDistanceUsd,
      feeFlat,
      feePercent,
      suggestedUnits,
      suggestedNotional,
      projectedRiskUsd,
    };
  }, [
    summary?.riskPerUnit,
    watched.accountBalance,
    watched.riskPercent,
    watched.entry,
    watched.feeFlat,
    watched.feePercent,
  ]);

  useEffect(() => {
    if (
      !riskSizingGuide?.suggestedUnits ||
      !riskSizingGuide.suggestedNotional
    ) {
      return;
    }

    if (watched.sizeMode === "units") {
      const currentUnits = watched.units;
      const nextUnits = riskSizingGuide.suggestedUnits;
      if (
        currentUnits === undefined ||
        Math.abs(currentUnits - nextUnits) > AUTO_SIZE_EPSILON
      ) {
        form.setValue("units", nextUnits, { shouldValidate: true });
      }
      return;
    }

    const currentNotional = watched.notional;
    const nextNotional = riskSizingGuide.suggestedNotional;
    if (
      currentNotional === undefined ||
      Math.abs(currentNotional - nextNotional) > AUTO_SIZE_EPSILON
    ) {
      form.setValue("notional", nextNotional, { shouldValidate: true });
    }
  }, [
    form,
    riskSizingGuide?.suggestedNotional,
    riskSizingGuide?.suggestedUnits,
    watched.notional,
    watched.sizeMode,
    watched.units,
  ]);

  return (
    <TooltipProvider>
      <Card className="rounded-lg border border-border/70 bg-card shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Trading P&amp;L Calculator</CardTitle>
              <CardDescription>
                Estimate risk, reward, and break-even with live FX conversion.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                USD
              </span>
              <Switch
                checked={currency === "NZD"}
                onCheckedChange={(checked) =>
                  setCurrency(checked ? "NZD" : "USD")
                }
                aria-label="Toggle currency"
              />
              <span className="text-xs font-medium text-muted-foreground">
                NZD
              </span>
            </div>
          </div>
          <div className="grid gap-3 rounded-md border border-border/70 bg-background p-4 text-sm text-muted-foreground md:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Live FX (USD → NZD)
              </p>
              <p>
                Rate: {fxData ? formatNumber(fxData.rate, 4) : "Unavailable"}
              </p>
              <p>Last updated: {asOfLabel}</p>
              {isUsingCachedRate ? (
                <p className="text-xs text-amber-600">
                  Using last updated rate.
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fxQuery.refetch()}
                disabled={fxQuery.isFetching}
              >
                <RefreshCcw
                  className={
                    fxQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"
                  }
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid rounded-md border border-border/70 bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Trade direction</p>
                  <p className="text-xs text-muted-foreground">
                    Set whether you are going long or short.
                  </p>
                </div>
                <Tabs
                  value={watched.direction}
                  onValueChange={(value) =>
                    form.setValue("direction", value as Direction, {
                      shouldValidate: true,
                    })
                  }
                >
                  <TabsList>
                    <TabsTrigger
                      value="long"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Long
                    </TabsTrigger>
                    <TabsTrigger
                      value="short"
                      className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                    >
                      Short
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid gap-4 rounded-md border border-border/70 bg-background p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Entry price"
                  helper="Price per unit (USD base)."
                  error={form.formState.errors.entry?.message}
                >
                  <Input
                    type="number"
                    step="any"
                    {...form.register("entry", { setValueAs: parseNumber })}
                  />
                </Field>
                <Field
                  label="Stop loss price"
                  helper="Risk definition for the trade."
                  error={form.formState.errors.stop?.message}
                >
                  <Input
                    type="number"
                    step="any"
                    {...form.register("stop", { setValueAs: parseNumber })}
                  />
                </Field>
                <Field
                  label="Take profit price"
                  helper="Target price for exit."
                  error={form.formState.errors.takeProfit?.message}
                >
                  <Input
                    type="number"
                    step="any"
                    {...form.register("takeProfit", {
                      setValueAs: parseNumber,
                    })}
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-4 rounded-md border border-border/70 bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Position size mode</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between units and notional size inputs.
                  </p>
                </div>
                <Tabs
                  value={watched.sizeMode}
                  onValueChange={(value) =>
                    form.setValue("sizeMode", value as SizeMode, {
                      shouldValidate: true,
                    })
                  }
                >
                  <TabsList>
                    <TabsTrigger value="notional">Notional</TabsTrigger>
                    <TabsTrigger value="units">Units</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {watched.sizeMode === "units" ? (
                  <Field
                    label="Position size (units)"
                    helper="Shares, contracts, or coins."
                    error={form.formState.errors.units?.message}
                  >
                    <Input
                      type="number"
                      step="any"
                      {...form.register("units", { setValueAs: parseNumber })}
                    />
                  </Field>
                ) : (
                  <Field
                    label="Size (USD)"
                    helper="Total capital allocated to the trade."
                    error={form.formState.errors.notional?.message}
                  >
                    <Input
                      type="number"
                      step="any"
                      {...form.register("notional", {
                        setValueAs: parseNumber,
                      })}
                    />
                  </Field>
                )}
                <Field label="Risk preset" helper="Optional % of account risk.">
                  <Select
                    value={riskPresetValue}
                    onValueChange={(value) =>
                      form.setValue(
                        "riskPercent",
                        value ? Number(value) : undefined,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5% risk</SelectItem>
                      <SelectItem value="1">1% risk</SelectItem>
                      <SelectItem value="2">2% risk</SelectItem>
                      <SelectItem value="3">3% risk</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            <div className="grid gap-4 rounded-md border border-border/70 bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Fees &amp; account risk</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        Net P&amp;L includes fees
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Fees are applied to both stop and take-profit outcomes.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setFeesPanelOpen((open) => !open)}
                  aria-expanded={feesPanelOpen}
                  aria-controls="fees-account-panel"
                >
                  {feesPanelOpen ? "Hide" : "Show"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${feesPanelOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>
              {feesPanelOpen ? (
                <div id="fees-account-panel" className="mt-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Fees (flat)" helper="Add a flat USD amount.">
                      <Input
                        type="number"
                        step="any"
                        {...form.register("feeFlat", {
                          setValueAs: parseNumber,
                        })}
                      />
                    </Field>
                    <Field label="Fees (%)" helper="Percent of notional size.">
                      <Input
                        type="number"
                        step="any"
                        {...form.register("feePercent", {
                          setValueAs: parseNumber,
                        })}
                      />
                    </Field>
                    <Field
                      label="Account balance"
                      helper="Optional sizing reference."
                    >
                      <Input
                        type="number"
                        step="any"
                        {...form.register("accountBalance", {
                          setValueAs: parseNumber,
                        })}
                      />
                    </Field>
                    <Field
                      label="Risk % of account"
                      helper="Used for sizing suggestion."
                    >
                      <Input
                        type="number"
                        step="any"
                        {...form.register("riskPercent", {
                          setValueAs: parseNumber,
                        })}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {riskSizingGuide ? (
              <div className="grid gap-3 rounded-md border border-border/70 bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Risk budget</p>
                  <span className="text-xs text-muted-foreground">
                    Auto-sized from account risk
                  </span>
                </div>
                <div className="space-y-2">
                  <ResultItem
                    label="Target max loss"
                    value={displayMoney(riskSizingGuide.targetRiskUsd)}
                  />
                  <ResultItem
                    label="Estimated stop loss"
                    value={
                      riskSizingGuide.projectedRiskUsd
                        ? displayMoney(riskSizingGuide.projectedRiskUsd)
                        : "—"
                    }
                  />
                  <ResultItem
                    label="Delta vs target"
                    value={
                      riskSizingGuide.projectedRiskUsd
                        ? displayMoney(
                            riskSizingGuide.projectedRiskUsd -
                              riskSizingGuide.targetRiskUsd,
                          )
                        : "—"
                    }
                  />
                  <ResultItem
                    label="Auto size"
                    value={
                      riskSizingGuide.suggestedNotional
                        ? `${displayMoney(riskSizingGuide.suggestedNotional)} (${formatNumber(riskSizingGuide.suggestedUnits ?? 0, 4)} units)`
                        : "—"
                    }
                  />
                </div>
                {riskSizingGuide.suggestedUnits &&
                riskSizingGuide.suggestedNotional ? null : (
                  <p className="text-xs text-amber-600">
                    Flat fees exceed your risk budget. Increase risk % or lower
                    flat fees.
                  </p>
                )}
              </div>
            ) : null}
            <div className="grid gap-4 rounded-md border border-border/70 bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Results</p>
                {!hasLiveRate && currency === "NZD" ? (
                  <span className="text-xs text-amber-600">
                    FX unavailable — showing placeholders.
                  </span>
                ) : null}
              </div>
              {summary ? (
                <div className="space-y-3">
                  <ResultItem
                    label="Net P&L at Stop"
                    value={displayMoney(summary.netStopPnl)}
                  />
                  <ResultItem
                    label="Net P&L at Take Profit"
                    value={displayMoney(summary.netTakeProfitPnl)}
                    accent
                  />
                  <Separator />
                  <ResultItem
                    label="Risk"
                    value={displayMoney(summary.riskUsd)}
                  />
                  <ResultItem
                    label="Reward"
                    value={displayMoney(summary.rewardUsd)}
                  />
                  <ResultItem
                    label="R multiple"
                    value={
                      summary.rrMultiple ? formatRatio(summary.rrMultiple) : "—"
                    }
                  />
                  {watched.sizeMode === "notional" ? (
                    <ResultItem
                      label="Effective units"
                      value={formatNumber(summary.effectiveUnits, 4)}
                    />
                  ) : null}
                  <ResultItem
                    label="Break-even price"
                    value={displayPrice(summary.breakEvenPrice)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter all required inputs to see results.
                </p>
              )}
            </div>

            {warnings.length ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="space-y-1">
                    {warnings.map((warning) => (
                      <li key={warning} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

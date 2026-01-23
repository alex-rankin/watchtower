export interface FxRate {
  rate: number;
  asOf: string;
}

interface FxApiResponse {
  result: "success" | "error";
  time_last_update_utc?: string;
  rates?: Record<string, number>;
  "error-type"?: string;
}

export async function fetchUsdToNzdRate(): Promise<FxRate> {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) {
    throw new Error(`FX fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as FxApiResponse;
  if (
    data.result !== "success" ||
    !data.rates?.NZD ||
    !data.time_last_update_utc
  ) {
    throw new Error(`FX response invalid: ${data["error-type"] ?? "unknown"}`);
  }

  return {
    rate: data.rates.NZD,
    asOf: data.time_last_update_utc,
  };
}

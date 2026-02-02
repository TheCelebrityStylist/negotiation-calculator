export type Context = "selling" | "salary" | "rent" | "freelance";
export type Urgency = "low" | "medium" | "high";

export type CalcInput = {
  offer: number;
  minimum: number;
  context: Context;
  urgency: Urgency;
};

export type Risk = "low" | "medium" | "high";

export type CalcOutput = {
  counter: number;
  walkAway: number;
  risk: Risk;
  // for preview
  counterApprox: string;
  riskPreview: "low" | "medium" | "high";
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundToClean(n: number) {
  const abs = Math.abs(n);
  const step = abs < 1000 ? 25 : abs <= 10000 ? 50 : 100;
  return Math.round(n / step) * step;
}

function formatApproxEUR(n: number) {
  // approx like "~€3,XXX" (no exact)
  const k = Math.floor(Math.abs(n) / 1000);
  if (k <= 0) return "~€XXX";
  return `~€${k},XXX`;
}

export function calculate(input: CalcInput): CalcOutput {
  const O = input.offer;
  const M = input.minimum;

  // Guard: avoid NaN or negatives
  const offer = Number.isFinite(O) ? Math.max(0, O) : 0;
  const minimum = Number.isFinite(M) ? Math.max(0, M) : 0;

  const gap = offer - minimum;

  // If minimum > offer: recommend no counter; treat as high risk
  if (gap < 0) {
    const walkAway = roundToClean(minimum);
    const counter = roundToClean(minimum);
    return {
      counter,
      walkAway,
      risk: "high",
      counterApprox: formatApproxEUR(counter),
      riskPreview: "high"
    };
  }

  const anchorFactorByUrgency: Record<Urgency, number> = {
    low: 0.75,
    medium: 0.60,
    high: 0.45
  };

  const base = minimum + gap * anchorFactorByUrgency[input.urgency];

  const contextMultiplierByContext: Record<Context, number> = {
    selling: 1.0,
    salary: 1.05,
    rent: 0.95,
    freelance: 1.05
  };

  const counterRaw = base * contextMultiplierByContext[input.context];
  const counter = roundToClean(counterRaw);

  const walkAwayRaw = minimum - gap * 0.15;
  const walkAway = roundToClean(walkAwayRaw);

  // Aggressiveness relative to remaining gap
  // If gap==0, aggressiveness is 0
  const denom = gap === 0 ? 1 : gap;
  const aggressiveness = clamp((counter - offer) / denom, 0, 1);

  let risk: Risk = "low";

  if (input.urgency === "high" && aggressiveness > 0.4) risk = "high";
  else if (input.urgency === "low" && aggressiveness > 0.6) risk = "medium";
  else if (input.urgency === "medium" && aggressiveness > 0.55) risk = "medium";

  return {
    counter,
    walkAway,
    risk,
    counterApprox: formatApproxEUR(counter),
    riskPreview: risk
  };
}

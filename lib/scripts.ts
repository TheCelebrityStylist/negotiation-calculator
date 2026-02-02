import type { Context, Urgency } from "./calc";

export type ScriptVariant = "polite" | "firm" | "final";

export type ScriptParams = {
  offer: number;
  minimum: number;
  counter: number;
  walkAway: number;
  context: Context;
  urgency: Urgency;
};

function money(n: number) {
  // Simple EUR formatting without locale complexity
  const rounded = Math.round(n);
  return `€${rounded.toLocaleString("en-US")}`;
}

function urgencyTag(u: Urgency) {
  if (u === "high") return "today";
  if (u === "medium") return "this week";
  return "when you can";
}

type Template = (p: ScriptParams) => string;

const templates: Record<Context, Record<ScriptVariant, Template>> = {
  selling: {
    polite: (p) =>
      `Thanks for the offer.\nI was hoping for ${money(p.counter)}.\nLet me know if that works for you.`,
    firm: (p) =>
      `I can’t do ${money(p.offer)}.\nI’m good at ${money(p.counter)}.\nIf that works, we can close ${urgencyTag(p.urgency)}.`,
    final: (p) =>
      `Final price is ${money(p.walkAway)}.\nIf that doesn’t work, no worries — I’ll pass.`
  },
  salary: {
    polite: (p) =>
      `Thanks for the offer.\nBased on the role and scope, I was expecting closer to ${money(p.counter)}.\nIs there flexibility there?`,
    firm: (p) =>
      `I’m excited about the role, but ${money(p.offer)} is below what I can accept.\nI’d be ready to sign at ${money(p.counter)}.`,
    final: (p) =>
      `I won’t be able to accept below ${money(p.walkAway)}.\nLet me know if that’s possible on your side.`
  },
  rent: {
    polite: (p) =>
      `Thanks for sharing the price.\nWould you consider ${money(p.counter)} instead?`,
    firm: (p) =>
      `${money(p.offer)} is above my limit.\nI can commit at ${money(p.counter)} if that works.`,
    final: (p) =>
      `My maximum is ${money(p.walkAway)}.\nIf that doesn’t work, I understand.`
  },
  freelance: {
    polite: (p) =>
      `Thanks for the details.\nFor this scope, my fee would be ${money(p.counter)}.`,
    firm: (p) =>
      `I can’t take this on for ${money(p.offer)}.\nI’m available at ${money(p.counter)}.`,
    final: (p) =>
      `Below ${money(p.walkAway)} I won’t be able to deliver properly.\nIf that budget can’t move, I’ll need to decline.`
  }
};

export function buildScripts(p: ScriptParams) {
  const ctx = templates[p.context];
  return {
    polite: ctx.polite(p),
    firm: ctx.firm(p),
    final: ctx.final(p)
  };
}

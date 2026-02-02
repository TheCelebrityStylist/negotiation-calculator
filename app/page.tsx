"use client";

import React from "react";
import { calculate, type Context, type Urgency } from "@/lib/calc";
import { buildScripts } from "@/lib/scripts";

type FormState = {
  offer: string;
  minimum: string;
  context: Context;
  urgency: Urgency;
};

const UNLOCK_KEY = "negocalc_unlocked_v1";

export default function Page() {
  const [form, setForm] = React.useState<FormState>({
    offer: "",
    minimum: "",
    context: "selling",
    urgency: "medium"
  });

  const [unlocked, setUnlocked] = React.useState(false);
  const [loadingPay, setLoadingPay] = React.useState(false);

  React.useEffect(() => {
    try {
      setUnlocked(localStorage.getItem(UNLOCK_KEY) === "true");
    } catch {
      setUnlocked(false);
    }
  }, []);

  const offer = Number(form.offer || 0);
  const minimum = Number(form.minimum || 0);

  const inputOk =
    Number.isFinite(offer) &&
    Number.isFinite(minimum) &&
    offer > 0 &&
    minimum >= 0;

  const calc = inputOk
    ? calculate({
        offer,
        minimum,
        context: form.context,
        urgency: form.urgency
      })
    : null;

  const scripts =
    inputOk && calc
      ? buildScripts({
          offer,
          minimum,
          counter: calc.counter,
          walkAway: calc.walkAway,
          context: form.context,
          urgency: form.urgency
        })
      : null;

  const minimumAboveOffer = inputOk && minimum > offer;

  async function startCheckout() {
    if (!inputOk) return;
    setLoadingPay(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: "/" })
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch {
      setLoadingPay(false);
      alert("Payment setup failed. Please try again.");
    }
  }

  function resetUnlock() {
    try {
      localStorage.removeItem(UNLOCK_KEY);
    } catch {}
    setUnlocked(false);
  }

  return (
    <main className="container">
      <div className="header">
        <div className="brand">COUNTER-OFFER</div>
        <span className="badge">One-time unlock €9.99</span>
      </div>

      <h1 className="h1">Know exactly what to counter before you reply.</h1>
      <p className="sub">
        Enter the offer, your minimum, context, and urgency. Preview is free.
        Exact number + ready-to-send messages unlock instantly.
      </p>

      <div className="grid">
        <section className="card">
          <div className="row">
            <div>
              <label className="label">Offer received (€)</label>
              <input
                className="input"
                inputMode="decimal"
                placeholder="e.g. 2500"
                value={form.offer}
                onChange={(e) => setForm((s) => ({ ...s, offer: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Minimum acceptable (€)</label>
              <input
                className="input"
                inputMode="decimal"
                placeholder="e.g. 2000"
                value={form.minimum}
                onChange={(e) =>
                  setForm((s) => ({ ...s, minimum: e.target.value }))
                }
              />
            </div>
          </div>

          {minimumAboveOffer && (
            <div className="warn">
              Your minimum is higher than the offer. This usually means: accept
              is not possible — you either counter close to your minimum or walk.
            </div>
          )}

          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <label className="label">Context</label>
              <select
                value={form.context}
                onChange={(e) =>
                  setForm((s) => ({ ...s, context: e.target.value as Context }))
                }
              >
                <option value="selling">selling an item</option>
                <option value="salary">salary negotiation</option>
                <option value="rent">rent negotiation</option>
                <option value="freelance">freelance / project fee</option>
              </select>
            </div>

            <div>
              <label className="label">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) =>
                  setForm((s) => ({ ...s, urgency: e.target.value as Urgency }))
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button
              className="btn"
              onClick={startCheckout}
              disabled={!inputOk || loadingPay}
              aria-disabled={!inputOk || loadingPay}
            >
              {loadingPay ? "Opening checkout…" : "Unlock exact results (€9.99)"}
            </button>

            <button
              className="btn secondary"
              onClick={resetUnlock}
              style={{ marginTop: 10 }}
              type="button"
            >
              Lock again (testing)
            </button>

            <div className="small">
              No account. One-time payment. Unlock happens instantly after
              checkout.
            </div>
          </div>
        </section>

        <section className="card">
          <div className="kpi">
            <div className="kpiBox">
              <p className="kpiTitle">Counter-offer</p>
              <p className={"kpiValue " + (!unlocked ? "blur" : "")}>
                {calc ? `€${calc.counter.toLocaleString("en-US")}` : "—"}
              </p>
              {!unlocked && (
                <div className="small">
                  Preview: {calc ? calc.counterApprox : "—"}
                </div>
              )}
            </div>

            <div className="kpiBox">
              <p className="kpiTitle">Walk-away</p>
              <p className={"kpiValue " + (!unlocked ? "blur" : "")}>
                {calc ? `€${calc.walkAway.toLocaleString("en-US")}` : "—"}
              </p>
              {!unlocked && (
                <div className="small">
                  Locked until unlock.
                </div>
              )}
            </div>

            <div className="kpiBox">
              <p className="kpiTitle">Risk</p>
              <p className={"kpiValue " + (!unlocked ? "blur" : "")}>
                {calc ? calc.risk.toUpperCase() : "—"}
              </p>
              {!unlocked && (
                <div className="small">
                  Preview: {calc ? calc.riskPreview : "—"}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <p className="label">Ready-to-send messages</p>

            <div className={!unlocked ? "blur" : ""} style={{ display: "grid", gap: 10 }}>
              <div className="kpiBox">
                <p className="kpiTitle">Polite</p>
                <pre>{scripts ? scripts.polite : "—"}</pre>
              </div>
              <div className="kpiBox">
                <p className="kpiTitle">Firm</p>
                <pre>{scripts ? scripts.firm : "—"}</pre>
              </div>
              <div className="kpiBox">
                <p className="kpiTitle">Final</p>
                <pre>{scripts ? scripts.final : "—"}</pre>
              </div>
            </div>

            {!unlocked && (
              <div className="small" style={{ marginTop: 10 }}>
                Scripts + exact number are locked. Unlock to reveal messages you can send as-is.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

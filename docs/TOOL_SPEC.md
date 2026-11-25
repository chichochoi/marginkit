# MarginKit Calculator Module Specification (`tools/staged/<slug>.mjs`)

Every calculator is a standalone ESM file whose filename `<slug>.mjs` matches `meta.slug` (`^[a-z0-9-]+$`).

## Required Exports

1. `export const meta = { ... }`
   - `slug`: string (same as filename without `.mjs`)
   - `category`: one of `"ecommerce" | "payments" | "tax" | "creator" | "freelance"`
   - `shortTitle`: string (e.g. `"Etsy Fee Calculator"`)
   - `title`: string (35–70 chars, SEO title without `| MarginKit`)
   - `metaDescription`: string (110–165 chars, compelling US English summary)
   - `heroSubtitle`: string (1 clear sentence shown under H1)
   - `badge`: string (e.g. `"2026 US Rates"`)
   - `updatedAt`: `"YYYY-MM-DD"`
   - `queuedOrder`: integer (for FIFO ordering in `tools/staged/`, e.g. `101`)
   - `inputs`: array (>= 2 items):
     - `{ id, label, type: "number" | "select" | "checkbox", defaultValue, min?, max?, step?, prefix?, suffix?, help?, options?: [{ value, label }] }`
     - Note: for `checkbox`, `defaultValue` is boolean (`true`/`false`). For `select`, `defaultValue` matches one option's `value`.
   - `howItWorks`:
     - `summary`: string
     - `formulaSteps`: array of strings (>= 3)
     - `feeTable`: `{ headers: string[], rows: string[][] }`
   - `tips`: array (>= 3, target 4) of `{ title, detail }`
   - `faqs`: array (>= 4) of `{ q, a }`
   - `testCases`: array (>= 2) of `{ name, inputs: { ... }, expected: { kpiId, approx, tolerance } }`

2. `export function compute(values) { ... }`
   - MUST be a standard `export function compute(values)` declaration (NEVER arrow or shorthand).
   - MUST be 100% self-contained (NEVER reference outer module constants, helpers, or imports — it is serialized with `.toString()` into client-side JS).
   - Reads numeric/boolean/select fields from `values` safely with defaults and finite guards.
   - Returns:
     ```js
     {
       kpis: [
         { id: "netProfit", label: "Net Profit", value: 18.42, format: "currency", highlight: true },
         { id: "netMargin", label: "Net Margin", value: 36.84, format: "percent" }
       ],
       breakdown: [
         { label: "Net Profit", amount: 18.42, share: 36.84, colorKey: "net" },
         { label: "Platform Fees", amount: 6.50, share: 13.0, colorKey: "fee" },
         { label: "Processing", amount: 1.75, share: 3.5, colorKey: "processing" },
         { label: "COGS & Shipping", amount: 23.33, share: 46.66, colorKey: "cost" }
       ],
       verdict: {
         tone: "good", // "good" | "warn" | "bad"
         title: "Healthy unit margin",
         detail: "Your net margin exceeds 25% after all marketplace and payment fees."
       }
     }
     ```
   - `format`: `"currency"` | `"percent"` | `"number"`.
   - `colorKey`: `"net"` | `"fee"` | `"processing"` | `"cost"` | `"tax"`.
   - All `value`, `amount`, and `share` values MUST be finite numbers (`Number.isFinite`).

## Minimal Skeleton

```js
export const meta = {
  slug: "example-fee-calculator",
  category: "ecommerce",
  shortTitle: "Example Fee Calculator",
  title: "Example Marketplace Fee & Profit Calculator (2026)",
  metaDescription: "Calculate exact marketplace fees, payment processing costs, and net profit margin per order with our free 2026 US seller calculator.",
  heroSubtitle: "Estimate true take-home profit after commission, processing, and fulfillment.",
  badge: "2026 US Rates",
  updatedAt: "2026-11-25",
  queuedOrder: 10,
  inputs: [
    { id: "price", label: "Sale Price", type: "number", defaultValue: 50, min: 0, step: 0.01, prefix: "$" },
    { id: "cost", label: "Product Cost", type: "number", defaultValue: 15, min: 0, step: 0.01, prefix: "$" }
  ],
  howItWorks: {
    summary: "Subtracts percentage commission and fixed processing fees from gross sale price.",
    formulaSteps: [
      "Gross Revenue = Sale Price",
      "Total Fees = (Gross Revenue × 0.10) + $0.30",
      "Net Profit = Gross Revenue - Total Fees - Product Cost"
    ],
    feeTable: {
      headers: ["Fee Type", "Rate", "Notes"],
      rows: [["Commission", "10.0%", "Applied to gross order"], ["Processing", "$0.30", "Per transaction"]]
    }
  },
  tips: [
    { title: "Bundle low-ticket items", detail: "Fixed per-order fees erode sub-$15 orders quickly." },
    { title: "Include return buffer", detail: "Reserve 3-5% of revenue for refunds and damaged inventory." },
    { title: "Check state tax nexus", detail: "Marketplace facilitators collect sales tax in most US states." },
    { title: "Track net margin weekly", detail: "Optimize ad spend around contribution margin after fees." }
  ],
  faqs: [
    { q: "How are fees calculated?", a: "Fees apply to the total order amount collected from the buyer." },
    { q: "Is shipping included in fees?", a: "Most US marketplaces charge commission on item price plus shipping." },
    { q: "What is a healthy margin?", a: "Most sellers target 20% to 35% net margin before overhead." },
    { q: "Are these 2026 rates?", a: "Yes, formulas reflect published 2026 standard US merchant schedules." }
  ],
  testCases: [
    { name: "Standard $50 order", inputs: { price: 50, cost: 15 }, expected: { kpiId: "netProfit", approx: 29.7, tolerance: 0.05 } },
    { name: "Low $10 order", inputs: { price: 10, cost: 4 }, expected: { kpiId: "netProfit", approx: 4.7, tolerance: 0.05 } }
  ]
};

export function compute(values) {
  const price = Math.max(0, Number(values.price) || 0);
  const cost = Math.max(0, Number(values.cost) || 0);
  const fee = price * 0.10;
  const proc = price > 0 ? 0.30 : 0;
  const net = price - fee - proc - cost;
  const margin = price > 0 ? (net / price) * 100 : 0;
  const denom = price > 0 ? price : 1;
  return {
    kpis: [
      { id: "netProfit", label: "Net Profit", value: net, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: margin, format: "percent" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, net), share: Math.max(0, (net / denom) * 100), colorKey: "net" },
      { label: "Marketplace Fee", amount: fee, share: (fee / denom) * 100, colorKey: "fee" },
      { label: "Processing Fee", amount: proc, share: (proc / denom) * 100, colorKey: "processing" },
      { label: "Product Cost", amount: cost, share: (cost / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: margin >= 20 ? "good" : margin > 0 ? "warn" : "bad",
      title: margin >= 20 ? "Healthy margin" : margin > 0 ? "Thin margin" : "Negative margin",
      detail: "Estimated net margin is " + margin.toFixed(1) + "%."
    }
  };
}
```

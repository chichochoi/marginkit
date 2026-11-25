export const meta = {
  slug: "saas-mrr-churn-ltv-calculator",
  category: "payments",
  shortTitle: "SaaS MRR, Churn & LTV Calculator",
  title: "SaaS MRR, Churn, LTV & CAC Payback Calculator (2026)",
  metaDescription: "Calculate SaaS customer lifetime value (LTV), LTV:CAC ratio, CAC payback months, and net contribution after gross margin and Stripe Billing fees.",
  heroSubtitle: "Validate micro-SaaS subscription pricing, churn thresholds, and acquisition payback windows.",
  badge: "SaaS Unit Economics",
  updatedAt: "2026-11-25",
  queuedOrder: 6,
  inputs: [
    { id: "arpa", label: "Average Revenue Per Account (Monthly)", type: "number", defaultValue: 49, min: 1, step: 1, prefix: "$" },
    { id: "activeCustomers", label: "Active Paying Subscribers", type: "number", defaultValue: 120, min: 0, step: 5 },
    { id: "monthlyChurnPct", label: "Monthly Logo Churn Rate", type: "number", defaultValue: 4.5, min: 0.2, max: 50, step: 0.25, suffix: "%" },
    { id: "grossMarginPct", label: "Software Gross Margin %", type: "number", defaultValue: 85, min: 10, max: 100, step: 1, suffix: "%" },
    { id: "stripeFeePct", label: "Blended Billing & Card Fee %", type: "number", defaultValue: 3.4, min: 0, max: 15, step: 0.1, suffix: "%" },
    { id: "cac", label: "Customer Acquisition Cost (CAC)", type: "number", defaultValue: 180, min: 0, step: 10, prefix: "$" }
  ],
  howItWorks: {
    summary: "Computes contribution-adjusted LTV by deducting COGS/hosting and Stripe Billing fees before dividing by monthly churn rate.",
    formulaSteps: [
      "Current MRR = ARPA × Active Subscribers; Annualized Run Rate (ARR) = MRR × 12",
      "Net Contribution Margin % = Gross Margin % - Billing & Card Fee %",
      "Contribution-Adjusted LTV = (ARPA × Net Contribution Margin %) / Monthly Churn Rate",
      "CAC Payback Months = CAC / (ARPA × Net Contribution Margin %)"
    ],
    feeTable: {
      headers: ["SaaS Benchmark Metric", "Healthy B2B / Micro-SaaS Target", "Warning Sign"],
      rows: [
        ["LTV : CAC Ratio", "3.0x – 5.0x+", "Below 2.0x"],
        ["CAC Payback Period", "Under 6 – 12 months", "Over 15 months"],
        ["Monthly Logo Churn", "1.5% – 4.0% (SMB)", "Above 7% / month"]
      ]
    }
  },
  tips: [
    {
      title: "Reduce Monthly Churn Before Buying More Traffic",
      detail: "Cutting monthly churn from 6% to 3% doubles customer lifetime value instantly without spending an extra dollar on ads."
    },
    {
      title: "Subtract AI Inference & Processing From Gross Margin",
      detail: "AI-powered SaaS products with heavy token or GPU API costs should model 65–75% gross margin rather than legacy 90% software assumptions."
    },
    {
      title: "Offer Annual Plans With 2 Months Free",
      detail: "Collecting 10 months upfront collapses CAC payback to day zero and eliminates recurring card failure churn."
    },
    {
      title: "Enable Smart Dunning for Failed Cards",
      detail: "Automated retry emails recover 25–40% of involuntary subscription churn caused by expired cards."
    }
  ],
  faqs: [
    {
      q: "Why include Stripe processing fees in SaaS LTV?",
      a: "Stripe Billing (2.9% + $0.30 + 0.5%–0.7% recurring billing) reduces every subscription dollar before it contributes toward CAC payback."
    },
    {
      q: "What is a healthy LTV:CAC ratio for bootstrapped SaaS?",
      a: "Bootstrapped SaaS founders generally aim for 3x or higher LTV:CAC with CAC payback under 6 months to self-fund growth."
    },
    {
      q: "What if my monthly churn is 5%?",
      a: "A 5% monthly churn rate implies an average customer lifespan of 20 months (1 / 0.05) and forces you to replace 46% of your base yearly."
    },
    {
      q: "How is CAC Payback calculated?",
      a: "It divides Customer Acquisition Cost by monthly net gross profit per customer (ARPA after hosting and payment fees)."
    }
  ],
  testCases: [
    {
      name: "$49 ARPA at 4.5% churn and $180 CAC",
      inputs: { arpa: 49, activeCustomers: 120, monthlyChurnPct: 4.5, grossMarginPct: 85, stripeFeePct: 3.4, cac: 180 },
      expected: { kpiId: "ltv", approx: 888.53, tolerance: 1 }
    },
    {
      name: "Current MRR check",
      inputs: { arpa: 49, activeCustomers: 120, monthlyChurnPct: 4.5, grossMarginPct: 85, stripeFeePct: 3.4, cac: 180 },
      expected: { kpiId: "currentMrr", approx: 5880, tolerance: 0.1 }
    }
  ]
};

export function compute(values) {
  const arpa = Math.max(0, Number(values.arpa) || 0);
  const customers = Math.max(0, Number(values.activeCustomers) || 0);
  const churn = Math.max(0.002, (Number(values.monthlyChurnPct) || 0.2) / 100);
  const grossMargin = Math.max(0, Number(values.grossMarginPct) || 0);
  const stripeFee = Math.max(0, Number(values.stripeFeePct) || 0);
  const cac = Math.max(0, Number(values.cac) || 0);

  const currentMrr = arpa * customers;
  const netFactor = Math.max(0, (grossMargin - stripeFee) / 100);
  const monthlyContrib = arpa * netFactor;
  const ltv = monthlyContrib / churn;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const paybackMonths = monthlyContrib > 0 ? cac / monthlyContrib : 0;

  const totalLtvGross = churn > 0 ? arpa / churn : 0;
  const cogsPart = totalLtvGross * (Math.max(0, 100 - grossMargin) / 100);
  const feePart = totalLtvGross * (stripeFee / 100);
  const denom = totalLtvGross > 0 ? totalLtvGross : 1;

  return {
    kpis: [
      { id: "ltv", label: "Net Customer LTV", value: ltv, format: "currency", highlight: true },
      { id: "currentMrr", label: "Current MRR", value: currentMrr, format: "currency" },
      { id: "ltvCacRatio", label: "LTV : CAC Ratio", value: ltvCacRatio, format: "number" },
      { id: "paybackMonths", label: "CAC Payback (Months)", value: paybackMonths, format: "number" }
    ],
    breakdown: [
      { label: "Net Lifetime Gross Profit", amount: ltv, share: (ltv / denom) * 100, colorKey: "net" },
      { label: "Hosting & API COGS (Lifetime)", amount: cogsPart, share: (cogsPart / denom) * 100, colorKey: "cost" },
      { label: "Billing & Card Fees (Lifetime)", amount: feePart, share: (feePart / denom) * 100, colorKey: "processing" }
    ],
    verdict: {
      tone: ltvCacRatio >= 3 ? "good" : ltvCacRatio >= 1.8 ? "warn" : "bad",
      title: ltvCacRatio >= 3 ? "Strong SaaS unit economics (" + ltvCacRatio.toFixed(1) + "x LTV:CAC)" : "Thin acquisition margin (" + ltvCacRatio.toFixed(1) + "x LTV:CAC)",
      detail: "Annual Run Rate is $" + (currentMrr * 12).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " with " + paybackMonths.toFixed(1) + "-month CAC payback."
    }
  };
}

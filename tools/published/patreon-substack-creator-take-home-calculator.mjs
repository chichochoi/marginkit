export const meta = {
  slug: "patreon-substack-creator-take-home-calculator",
  category: "creator",
  shortTitle: "Substack & Patreon Payout Calculator",
  title: "Substack vs. Patreon Creator Take-Home Calculator (2026)",
  metaDescription: "Calculate monthly and annual net creator income on Substack and Patreon after platform fees, Stripe processing, billing charges, and annual plan discounts.",
  heroSubtitle: "See your real monthly creator payout after Substack's 10% + Stripe billing fees or Patreon's 8%–12% tiers.",
  badge: "2026 Creator Economy",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "subscribers", label: "Paid Subscribers / Patrons", type: "number", defaultValue: 250, min: 0, step: 5 },
    { id: "monthlyPrice", label: "Monthly Tier Price", type: "number", defaultValue: 8, min: 1, step: 0.5, prefix: "$" },
    {
      id: "platform",
      label: "Creator Platform & Tier",
      type: "select",
      defaultValue: "substack",
      options: [
        { value: "substack", label: "Substack (10% + Stripe 2.9% + $0.30 + 0.7% Billing)" },
        { value: "patreon_pro", label: "Patreon Pro / Standard (8% + 2.9% + $0.30)" },
        { value: "patreon_prem", label: "Patreon Premium (12% + 2.9% + $0.30)" }
      ]
    },
    { id: "annualSharePct", label: "Share on Annual Plan (15% Discount)", type: "number", defaultValue: 25, min: 0, max: 100, step: 5, suffix: "%" }
  ],
  howItWorks: {
    summary: "Models both recurring monthly charges (where $0.30 fixed Stripe fees hit every month) and annual subscriptions (paid once per year with 15% discount).",
    formulaSteps: [
      "Monthly Equivalent Gross = (Monthly Subs × Price) + (Annual Subs × Price × 12 × 0.85 / 12)",
      "Platform Take = Monthly Equivalent Gross × Platform Rate (10% Substack, 8% Patreon Pro, 12% Premium)",
      "Processing & Billing = (Monthly Equivalent Gross × Card/Billing %) + ($0.30 per monthly charge + amortized annual $0.30/12)"
    ],
    feeTable: {
      headers: ["Platform", "Platform Cut", "Card & Billing Fee"],
      rows: [
        ["Substack", "10.0%", "2.9% + $0.30 + 0.7% recurring billing"],
        ["Patreon Standard / Pro", "8.0%", "2.9% + $0.30 (standard card US)"],
        ["Patreon Premium", "12.0%", "2.9% + $0.30 (standard card US)"]
      ]
    }
  },
  tips: [
    {
      title: "Encourage Annual Upgrades to Cut Fixed Stripe Drag",
      detail: "On a $5/month tier, $0.30 monthly consumes 6% extra in fixed fees. Annual billing slashes fixed cents by 92%."
    },
    {
      title: "Avoid Apple In-App Purchase Surcharges",
      detail: "Prompt followers to subscribe via web checkout links rather than iOS in-app buttons where Apple's 30% cut applies."
    },
    {
      title: "Compare Owned ESPs Above $5k/mo MRR",
      detail: "Once recurring gross passes $5,000/month, flat-fee newsletter stacks often save $400+/month vs. 10% revenue shares."
    },
    {
      title: "Watch Substack 0.7% Billing Fee",
      detail: "Stripe Billing's 0.7% recurring charge is added on top of standard 2.9% + $0.30 card processing."
    }
  ],
  faqs: [
    {
      q: "How much does Substack take from paid newsletters in total?",
      a: "Substack charges 10% platform fee plus Stripe processing (2.9% + $0.30) and Stripe's 0.7% recurring billing fee—roughly 15%–17% on $8/mo tiers."
    },
    {
      q: "Why do annual subscriptions increase creator margins?",
      a: "Even with a 15% discount, paying $0.30 once per year instead of 12 times saves $3.30 per subscriber in pure processing overhead."
    },
    {
      q: "Does this include Patreon's iOS App Store fee?",
      a: "No, this calculator models web checkout rates. Subscribers joining through the iOS Patreon app can incur Apple's 30% fee unless passed on."
    },
    {
      q: "Are creator payouts taxed as 1099 self-employment income?",
      a: "Yes. US creators exceeding thresholds receive Form 1099-K or 1099-NEC and owe self-employment and income taxes on net profit."
    }
  ],
  testCases: [
    {
      name: "250 subscribers on Substack at $8/mo with 25% annual",
      inputs: { subscribers: 250, monthlyPrice: 8, platform: "substack", annualSharePct: 25 },
      expected: { kpiId: "monthlyNet", approx: 1605.39, tolerance: 1 }
    },
    {
      name: "100 monthly Patreon Pro patrons at $10/mo",
      inputs: { subscribers: 100, monthlyPrice: 10, platform: "patreon_pro", annualSharePct: 0 },
      expected: { kpiId: "monthlyNet", approx: 861, tolerance: 0.5 }
    }
  ]
};

export function compute(values) {
  const subs = Math.max(0, Number(values.subscribers) || 0);
  const price = Math.max(0, Number(values.monthlyPrice) || 0);
  const platform = String(values.platform || "substack");
  const annualShare = Math.min(100, Math.max(0, Number(values.annualSharePct) || 0)) / 100;

  const monthlySubs = subs * (1 - annualShare);
  const annualSubs = subs * annualShare;
  const grossMonthlyEquiv = monthlySubs * price + (annualSubs * price * 12 * 0.85) / 12;

  const tiers = {
    substack: { platformRate: 0.1, procRate: 0.036 },
    patreon_pro: { platformRate: 0.08, procRate: 0.029 },
    patreon_prem: { platformRate: 0.12, procRate: 0.029 }
  };
  const tier = tiers[platform] || tiers.substack;

  const platformFee = grossMonthlyEquiv * tier.platformRate;
  const fixedFees = grossMonthlyEquiv > 0 ? monthlySubs * 0.3 + (annualSubs * 0.3) / 12 : 0;
  const processingFee = grossMonthlyEquiv * tier.procRate + fixedFees;
  const monthlyNet = grossMonthlyEquiv - platformFee - processingFee;
  const annualNet = monthlyNet * 12;
  const effectiveFeePct = grossMonthlyEquiv > 0 ? ((platformFee + processingFee) / grossMonthlyEquiv) * 100 : 0;
  const denom = grossMonthlyEquiv > 0 ? grossMonthlyEquiv : 1;

  return {
    kpis: [
      { id: "monthlyNet", label: "Monthly Net Take-Home", value: monthlyNet, format: "currency", highlight: true },
      { id: "annualNet", label: "Annualized Net Income", value: annualNet, format: "currency" },
      { id: "grossMonthly", label: "Gross Monthly Equivalent", value: grossMonthlyEquiv, format: "currency" },
      { id: "effectiveFeePct", label: "Effective Total Fee %", value: effectiveFeePct, format: "percent" }
    ],
    breakdown: [
      { label: "Creator Net Payout", amount: Math.max(0, monthlyNet), share: Math.max(0, (monthlyNet / denom) * 100), colorKey: "net" },
      { label: "Platform Fee", amount: platformFee, share: (platformFee / denom) * 100, colorKey: "fee" },
      { label: "Card & Billing Processing", amount: processingFee, share: (processingFee / denom) * 100, colorKey: "processing" }
    ],
    verdict: {
      tone: effectiveFeePct <= 14 ? "good" : effectiveFeePct <= 18 ? "warn" : "bad",
      title: "You keep " + (100 - effectiveFeePct).toFixed(1) + "% of gross creator revenue",
      detail: "Total platform and payment drag is $" + (platformFee + processingFee).toFixed(2) + "/month."
    }
  };
}

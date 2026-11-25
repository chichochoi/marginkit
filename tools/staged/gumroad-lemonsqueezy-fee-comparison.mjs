export const meta = {
  slug: "gumroad-lemonsqueezy-fee-comparison",
  category: "creator",
  shortTitle: "Gumroad vs Lemon Squeezy Fees",
  title: "Gumroad vs. Lemon Squeezy Fee Comparison Calculator (2026)",
  metaDescription: "Compare Gumroad (10% + card processing or 30% Discover) against Lemon Squeezy (5% + $0.50) to see exact monthly net payout and annual fee savings.",
  heroSubtitle: "Side-by-side Merchant of Record fee comparison for digital downloads, SaaS licenses, and Notion templates.",
  badge: "Digital Product Pricing",
  updatedAt: "2026-11-25",
  queuedOrder: 3,
  inputs: [
    { id: "productPrice", label: "Digital Product Price", type: "number", defaultValue: 49, min: 0, step: 1, prefix: "$" },
    { id: "monthlySales", label: "Monthly Unit Sales", type: "number", defaultValue: 40, min: 0, step: 1 },
    { id: "gumroadDiscover", label: "Gumroad Sales via Discover Marketplace (30%)", type: "checkbox", defaultValue: false },
    { id: "lsIntlSharePct", label: "Lemon Squeezy Non-US Card Share (+1.5%)", type: "number", defaultValue: 0, min: 0, max: 100, step: 5, suffix: "%" }
  ],
  howItWorks: {
    summary: "Compares Gumroad's 10% flat fee + Stripe/PayPal processing (or 30% Discover cut) against Lemon Squeezy's 5% + $0.50 Merchant of Record rate.",
    formulaSteps: [
      "Gross Monthly Revenue = Product Price × Monthly Sales",
      "Gumroad Direct Fee = 10% + (2.9% + $0.30 card processing); Discover Mode = 30% all-in",
      "Lemon Squeezy Fee = 5% + $0.50 per order (+1.5% on international card share)",
      "Annual Savings = (Lemon Squeezy Net - Gumroad Net) × 12"
    ],
    feeTable: {
      headers: ["Merchant of Record", "Base Rate", "Extra Charges"],
      rows: [
        ["Gumroad (Direct Link)", "10% flat", "+2.9% + $0.30 processing"],
        ["Gumroad Discover", "30% flat", "Includes marketplace traffic & processing"],
        ["Lemon Squeezy", "5% + $0.50", "+1.5% international / +0.5% subscriptions"]
      ]
    }
  },
  tips: [
    {
      title: "Migrate Direct Traffic Off High-Take Platforms",
      detail: "When you drive your own traffic from X, YouTube, or newsletters, paying 10%+ fees quickly outpaces a 5% + $0.50 Merchant of Record."
    },
    {
      title: "Keep Discover Links Separate From Direct Funnels",
      detail: "Marketplace discovery can justify a 30% fee for incremental buyers you would never reach alone."
    },
    {
      title: "Use Merchant of Record for Global VAT Compliance",
      detail: "Both platforms collect and remit EU VAT, UK VAT, and US state sales tax automatically so solo creators avoid multi-country filings."
    },
    {
      title: "Avoid Sub-$5 Standalone Products",
      detail: "Fixed $0.50 per-transaction fees take 10%+ on $5 templates; bundle smaller digital assets into $29–$79 toolkits."
    }
  ],
  faqs: [
    {
      q: "Does Gumroad charge card processing on top of 10%?",
      a: "Yes. Gumroad's direct sales charge a 10% flat platform cut plus standard credit card or PayPal processing fees (typically 2.9% + $0.30)."
    },
    {
      q: "Does Lemon Squeezy handle EU VAT and US sales tax?",
      a: "Yes. Lemon Squeezy acts as the Merchant of Record, calculating, collecting, and remitting global sales tax and VAT."
    },
    {
      q: "When is Gumroad cheaper than Lemon Squeezy?",
      a: "For free products ($0) or if you rely heavily on Gumroad Discover marketplace search traffic rather than your own audience."
    },
    {
      q: "Are payout transfer fees included here?",
      a: "US ACH payouts are typically free, whereas international bank payouts or PayPal transfers can add 1%–2%."
    }
  ],
  testCases: [
    {
      name: "$49 product × 40 sales direct link",
      inputs: { productPrice: 49, monthlySales: 40, gumroadDiscover: false, lsIntlSharePct: 0 },
      expected: { kpiId: "annualSavings", approx: 1762.08, tolerance: 1 }
    },
    {
      name: "Gumroad Discover 30% comparison",
      inputs: { productPrice: 50, monthlySales: 20, gumroadDiscover: true, lsIntlSharePct: 0 },
      expected: { kpiId: "lsNet", approx: 940, tolerance: 0.5 }
    }
  ]
};

export function compute(values) {
  const price = Math.max(0, Number(values.productPrice) || 0);
  const sales = Math.max(0, Number(values.monthlySales) || 0);
  const discover = Boolean(values.gumroadDiscover);
  const intlShare = Math.min(100, Math.max(0, Number(values.lsIntlSharePct) || 0)) / 100;

  const gross = price * sales;
  const gumroadFeePerUnit = price > 0 ? (discover ? price * 0.3 : price * 0.1 + price * 0.029 + 0.3) : 0;
  const lsFeePerUnit = price > 0 ? price * (0.05 + 0.015 * intlShare) + 0.5 : 0;

  const gumroadTotalFee = gumroadFeePerUnit * sales;
  const lsTotalFee = lsFeePerUnit * sales;
  const gumroadNet = gross - gumroadTotalFee;
  const lsNet = gross - lsTotalFee;
  const annualSavings = (lsNet - gumroadNet) * 12;
  const denom = gross > 0 ? gross : 1;

  return {
    kpis: [
      { id: "annualSavings", label: "Annual Savings w/ Lemon Squeezy", value: annualSavings, format: "currency", highlight: true },
      { id: "lsNet", label: "Lemon Squeezy Monthly Net", value: lsNet, format: "currency" },
      { id: "gumroadNet", label: "Gumroad Monthly Net", value: gumroadNet, format: "currency" },
      { id: "grossMonthly", label: "Gross Monthly Revenue", value: gross, format: "currency" }
    ],
    breakdown: [
      { label: "Lemon Squeezy Net Payout", amount: Math.max(0, lsNet), share: Math.max(0, (lsNet / denom) * 100), colorKey: "net" },
      { label: "Lemon Squeezy Total Fees", amount: lsTotalFee, share: (lsTotalFee / denom) * 100, colorKey: "fee" },
      { label: "Extra Fee Paid on Gumroad", amount: Math.max(0, gumroadTotalFee - lsTotalFee), share: Math.max(0, ((gumroadTotalFee - lsTotalFee) / denom) * 100), colorKey: "processing" }
    ],
    verdict: {
      tone: annualSavings > 0 ? "good" : "warn",
      title: annualSavings > 0 ? "Switching saves $" + annualSavings.toFixed(0) + "/year" : "Comparable payout at current mix",
      detail: "Lemon Squeezy keeps " + ((lsNet / denom) * 100).toFixed(1) + "% vs Gumroad's " + ((gumroadNet / denom) * 100).toFixed(1) + "%."
    }
  };
}
